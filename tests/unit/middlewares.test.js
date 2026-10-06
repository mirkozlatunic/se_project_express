const jwt = require("jsonwebtoken");
const { authorize } = require("../../middlewares/auth");
const errorHandler = require("../../middlewares/error-handler");
const { SECRET_KEY } = require("../../utils/config");
const BadRequestError = require("../../utils/bad-request-error");
const ConflictError = require("../../utils/conflict-error");
const ForbiddenError = require("../../utils/forbidden-error");
const NotFoundError = require("../../utils/not-found-error");
const UnauthorizedError = require("../../utils/unauthorized-error");

describe("authorize", () => {
  const run = (headers) => {
    const req = { headers };
    const next = jest.fn();
    authorize(req, {}, next);
    return { req, next };
  };

  it.each([
    ["no header", {}],
    ["no Bearer prefix", { authorization: "abc" }],
    ["invalid token", { authorization: "Bearer nope" }],
  ])("rejects with 401 when %s", (_, headers) => {
    const { next } = run(headers);
    expect(next.mock.calls[0][0]).toBeInstanceOf(UnauthorizedError);
  });

  it("rejects an expired token", () => {
    const token = jwt.sign({ _id: "1" }, SECRET_KEY, { expiresIn: -10 });
    const { next } = run({ authorization: `Bearer ${token}` });
    expect(next.mock.calls[0][0].statusCode).toBe(401);
  });

  it("sets req.user for a valid token", () => {
    const token = jwt.sign({ _id: "abc" }, SECRET_KEY);
    const { req, next } = run({ authorization: `Bearer ${token}` });
    expect(req.user._id).toBe("abc");
    expect(next).toHaveBeenCalledWith();
  });
});

describe("errorHandler", () => {
  const res = () => {
    const r = {};
    r.status = jest.fn().mockReturnValue(r);
    r.send = jest.fn().mockReturnValue(r);
    return r;
  };

  it("uses err.statusCode and message", () => {
    const r = res();
    errorHandler(new NotFoundError("missing"), {}, r, jest.fn());
    expect(r.status).toHaveBeenCalledWith(404);
    expect(r.send).toHaveBeenCalledWith({ message: "missing" });
  });

  it("masks the message for 500s", () => {
    const r = res();
    errorHandler(new Error("secret db detail"), {}, r, jest.fn());
    expect(r.status).toHaveBeenCalledWith(500);
    expect(r.send).toHaveBeenCalledWith({
      message: "An error has occurred on the server",
    });
  });
});

describe("custom errors", () => {
  it.each([
    [BadRequestError, 400],
    [UnauthorizedError, 401],
    [ForbiddenError, 403],
    [NotFoundError, 404],
    [ConflictError, 409],
  ])("%p has status %i", (ErrorClass, status) => {
    const err = new ErrorClass("x");
    expect(err.statusCode).toBe(status);
    expect(err.message).toBe("x");
    expect(err).toBeInstanceOf(Error);
  });
});
