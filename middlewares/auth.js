const jwt = require("jsonwebtoken");
const SECRET_KEY = require("../utils/config");
const UnauthorizedError = require("../utils/unauthorized-error");
// const { UNAUTHORIZED } = require("../utils/errors");

const authorize = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return next(new UnauthorizedError("Authorization Required"));
  }

  const token = authorization.replace("Bearer ", "");
  let payload;

  try {
    payload = jwt.verify(token, SECRET_KEY);
  } catch (err) {
    return next(new UnauthorizedError("Authorization Required"));
  }

  req.user = payload;
  return next();
};

module.exports = {
  authorize,
};
