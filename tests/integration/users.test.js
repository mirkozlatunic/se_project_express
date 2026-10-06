const request = require("supertest");
const app = require("../../app");
const db = require("../helpers/db");
const { createUser } = require("../helpers/factories");

beforeAll(db.connect);
afterEach(db.clear);
afterAll(db.disconnect);

describe("GET /users/me", () => {
  it("returns 401 without a token", async () => {
    const res = await request(app).get("/users/me");
    expect(res.status).toBe(401);
  });

  it("returns the current user without the password", async () => {
    const { user, token } = await createUser();
    const res = await request(app)
      .get("/users/me")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe(user.email);
    expect(res.body.password).toBeUndefined();
  });

  it("returns 404 when the token's user no longer exists", async () => {
    const { user, token } = await createUser();
    await user.deleteOne();
    const res = await request(app)
      .get("/users/me")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});

describe("PATCH /users/me", () => {
  const update = { name: "New Name", avatar: "https://example.com/new.png" };

  it("updates name and avatar", async () => {
    const { token } = await createUser();
    const res = await request(app)
      .patch("/users/me")
      .set("Authorization", `Bearer ${token}`)
      .send(update);
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject(update);
  });

  it("returns 400 for invalid data", async () => {
    const { token } = await createUser();
    const res = await request(app)
      .patch("/users/me")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "x", avatar: "nope" });
    expect(res.status).toBe(400);
  });

  it("returns 404 when the user no longer exists", async () => {
    const { user, token } = await createUser();
    await user.deleteOne();
    const res = await request(app)
      .patch("/users/me")
      .set("Authorization", `Bearer ${token}`)
      .send(update);
    expect(res.status).toBe(404);
  });
});
