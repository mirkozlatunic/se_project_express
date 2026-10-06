const request = require("supertest");
const app = require("../../app");
const db = require("../helpers/db");
const { createUser } = require("../helpers/factories");
const User = require("../../models/user");

beforeAll(db.connect);
afterEach(db.clear);
afterAll(db.disconnect);

const validBody = {
  name: "Mirko",
  avatar: "https://example.com/a.png",
  email: "mirko@example.com",
  password: "secret123",
};

describe("POST /signup", () => {
  it("creates a user and never returns the password", async () => {
    const res = await request(app).post("/signup").send(validBody);
    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      name: validBody.name,
      email: validBody.email,
      avatar: validBody.avatar,
    });
    const stored = await User.findOne({ email: validBody.email }).select(
      "+password",
    );
    expect(stored.password).not.toBe(validBody.password);
  });

  it("returns 409 for a duplicate email", async () => {
    await request(app).post("/signup").send(validBody);
    const res = await request(app).post("/signup").send(validBody);
    expect(res.status).toBe(409);
  });

  it.each([
    ["missing email", { ...validBody, email: undefined }],
    ["bad email", { ...validBody, email: "nope" }],
    ["bad avatar", { ...validBody, avatar: "not a url" }],
    ["short name", { ...validBody, name: "a" }],
    ["missing password", { ...validBody, password: undefined }],
  ])("returns 400 for %s", async (_, body) => {
    const res = await request(app).post("/signup").send(body);
    expect(res.status).toBe(400);
  });
});

describe("POST /signin", () => {
  it("returns a token for valid credentials", async () => {
    const { user, password } = await createUser();
    const res = await request(app)
      .post("/signin")
      .send({ email: user.email, password });
    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe("string");
  });

  it("returns 401 for a wrong password", async () => {
    const { user } = await createUser();
    const res = await request(app)
      .post("/signin")
      .send({ email: user.email, password: "wrong" });
    expect(res.status).toBe(401);
  });

  it("returns 401 for an unknown email", async () => {
    const res = await request(app)
      .post("/signin")
      .send({ email: "ghost@example.com", password: "x" });
    expect(res.status).toBe(401);
  });

  it("returns 400 when the body is invalid", async () => {
    const res = await request(app).post("/signin").send({ email: "bad" });
    expect(res.status).toBe(400);
  });
});

describe("unknown routes", () => {
  it("returns a JSON 404", async () => {
    const res = await request(app).get("/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body.message).toBeDefined();
  });
});
