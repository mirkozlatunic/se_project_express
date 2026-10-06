jest.mock("../../models/user");
jest.mock("../../models/clothingItem");

const User = require("../../models/user");
const ClothingItem = require("../../models/clothingItem");
const users = require("../../controllers/users");
const items = require("../../controllers/clothingItem");

const named = (name, extra = {}) =>
  Object.assign(new Error(name), { name }, extra);

// Mimics a mongoose query: a rejected promise with a chainable .orFail().
const failingQuery = (error) => {
  const q = Promise.reject(error);
  q.catch(() => {});
  q.orFail = () => q;
  return q;
};

// Invokes a controller and returns whatever it passed to next().
const errorPassedToNext = async (controller, req = {}) => {
  const next = jest.fn();
  const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
  await controller(
    { params: { itemId: "1" }, user: { _id: "u" }, body: {}, ...req },
    res,
    next,
  );
  await new Promise(setImmediate);
  return next.mock.calls[0][0];
};

describe("clothing item controllers", () => {
  it("createItem maps ValidationError to 400 and passes others on", async () => {
    ClothingItem.create.mockReturnValueOnce(
      Promise.reject(named("ValidationError")),
    );
    expect((await errorPassedToNext(items.createItem)).statusCode).toBe(400);

    const boom = new Error("boom");
    ClothingItem.create.mockReturnValueOnce(Promise.reject(boom));
    expect(await errorPassedToNext(items.createItem)).toBe(boom);
  });

  it("getItems passes errors on", async () => {
    const boom = new Error("boom");
    ClothingItem.find.mockReturnValueOnce(Promise.reject(boom));
    expect(await errorPassedToNext(items.getItems)).toBe(boom);
  });

  it.each([
    ["deleteItem", items.deleteItem, "findById"],
    ["likeItem", items.likeItem, "findByIdAndUpdate"],
    ["dislikeItem", items.dislikeItem, "findByIdAndUpdate"],
  ])(
    "%s maps not-found and cast errors, passes others on",
    async (_, fn, method) => {
      const boom = new Error("boom");

      ClothingItem[method].mockReturnValueOnce(
        failingQuery(named("DocumentNotFoundError")),
      );
      expect((await errorPassedToNext(fn)).statusCode).toBe(404);

      ClothingItem[method].mockReturnValueOnce(
        failingQuery(named("CastError")),
      );
      expect((await errorPassedToNext(fn)).statusCode).toBe(400);

      ClothingItem[method].mockReturnValueOnce(failingQuery(boom));
      expect(await errorPassedToNext(fn)).toBe(boom);
    },
  );
});

describe("user controllers", () => {
  it.each([
    ["getCurrentUser", users.getCurrentUser, "findById"],
    ["updateProfile", users.updateProfile, "findByIdAndUpdate"],
  ])(
    "%s maps not-found and cast errors, passes others on",
    async (_, fn, method) => {
      const boom = new Error("boom");

      User[method].mockReturnValueOnce(
        failingQuery(named("DocumentNotFoundError")),
      );
      expect((await errorPassedToNext(fn)).statusCode).toBe(404);

      User[method].mockReturnValueOnce(failingQuery(named("CastError")));
      expect((await errorPassedToNext(fn)).statusCode).toBe(400);

      User[method].mockReturnValueOnce(failingQuery(boom));
      expect(await errorPassedToNext(fn)).toBe(boom);
    },
  );

  it("updateProfile maps ValidationError to 400", async () => {
    User.findByIdAndUpdate.mockReturnValueOnce(
      failingQuery(named("ValidationError")),
    );
    expect((await errorPassedToNext(users.updateProfile)).statusCode).toBe(400);
  });

  it("login passes non-credential errors on instead of returning 401", async () => {
    const boom = new Error("db down");
    User.findUserByCredentials.mockReturnValueOnce(Promise.reject(boom));
    const err = await errorPassedToNext(users.login, {
      body: { email: "a", password: "b" },
    });
    expect(err).toBe(boom);
  });

  it("createUser maps duplicate key to 409 and ValidationError to 400", async () => {
    const body = { name: "n", avatar: "a", email: "e", password: "p" };
    User.findOne.mockResolvedValue(null);

    User.create.mockReturnValueOnce(
      Promise.reject(named("MongoServerError", { code: 11000 })),
    );
    expect(
      (await errorPassedToNext(users.createUser, { body })).statusCode,
    ).toBe(409);

    User.create.mockReturnValueOnce(Promise.reject(named("ValidationError")));
    expect(
      (await errorPassedToNext(users.createUser, { body })).statusCode,
    ).toBe(400);

    const boom = new Error("boom");
    User.create.mockReturnValueOnce(Promise.reject(boom));
    expect(await errorPassedToNext(users.createUser, { body })).toBe(boom);
  });
});
