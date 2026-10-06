const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../app");
const db = require("../helpers/db");
const { createUser, createItem } = require("../helpers/factories");
const ClothingItem = require("../../models/clothingItem");

beforeAll(db.connect);
afterEach(db.clear);
afterAll(db.disconnect);

const auth = (token) => ({ Authorization: `Bearer ${token}` });
const validItem = {
  name: "Coat",
  weather: "cold",
  imageUrl: "https://example.com/coat.png",
};

describe("GET /items", () => {
  it("is public and lists items", async () => {
    const { user } = await createUser();
    await createItem(user._id);
    const res = await request(app).get("/items");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
});

describe("POST /items", () => {
  it("requires auth", async () => {
    const res = await request(app).post("/items").send(validItem);
    expect(res.status).toBe(401);
  });

  it("creates an item owned by the caller", async () => {
    const { user, token } = await createUser();
    const res = await request(app)
      .post("/items")
      .set(auth(token))
      .send(validItem);
    expect(res.status).toBe(201);
    expect(res.body.data.owner).toBe(user._id.toString());
  });

  it.each([
    ["bad weather", { ...validItem, weather: "rainy" }],
    ["bad url", { ...validItem, imageUrl: "nope" }],
    ["short name", { ...validItem, name: "a" }],
    ["missing name", { ...validItem, name: undefined }],
  ])("returns 400 for %s", async (_, body) => {
    const { token } = await createUser();
    const res = await request(app).post("/items").set(auth(token)).send(body);
    expect(res.status).toBe(400);
  });
});

describe("DELETE /items/:itemId", () => {
  it("lets the owner delete", async () => {
    const { user, token } = await createUser();
    const item = await createItem(user._id);
    const res = await request(app)
      .delete(`/items/${item._id}`)
      .set(auth(token));
    expect(res.status).toBe(200);
    expect(await ClothingItem.findById(item._id)).toBeNull();
  });

  it("returns 403 for another user's item", async () => {
    const { user } = await createUser();
    const { token: otherToken } = await createUser();
    const item = await createItem(user._id);
    const res = await request(app)
      .delete(`/items/${item._id}`)
      .set(auth(otherToken));
    expect(res.status).toBe(403);
    expect(await ClothingItem.findById(item._id)).not.toBeNull();
  });

  it("returns 404 for an unknown id", async () => {
    const { token } = await createUser();
    const res = await request(app)
      .delete(`/items/${new mongoose.Types.ObjectId()}`)
      .set(auth(token));
    expect(res.status).toBe(404);
  });

  it("returns 400 for a malformed id", async () => {
    const { token } = await createUser();
    const res = await request(app).delete("/items/123").set(auth(token));
    expect(res.status).toBe(400);
  });
});

describe("likes", () => {
  it("likes an item, idempotently", async () => {
    const { user, token } = await createUser();
    const item = await createItem(user._id);
    await request(app).put(`/items/${item._id}/likes`).set(auth(token));
    const res = await request(app)
      .put(`/items/${item._id}/likes`)
      .set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body.likes).toEqual([user._id.toString()]);
  });

  it("removes a like", async () => {
    const { user, token } = await createUser();
    const item = await createItem(user._id, { likes: [user._id] });
    const res = await request(app)
      .delete(`/items/${item._id}/likes`)
      .set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body.likes).toEqual([]);
  });

  it("returns 404 for an unknown item", async () => {
    const { token } = await createUser();
    const res = await request(app)
      .put(`/items/${new mongoose.Types.ObjectId()}/likes`)
      .set(auth(token));
    expect(res.status).toBe(404);
  });

  it("returns 400 for a malformed id", async () => {
    const { token } = await createUser();
    const res = await request(app).put("/items/xyz/likes").set(auth(token));
    expect(res.status).toBe(400);
  });

  it("requires auth", async () => {
    const res = await request(app).put(
      `/items/${new mongoose.Types.ObjectId()}/likes`,
    );
    expect(res.status).toBe(401);
  });
});
