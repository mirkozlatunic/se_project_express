const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../utils/config");
const { UNAUTHORIZED } = require("../utils/errors");

const authorize = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res
      .status(UNAUTHORIZED)
      .send({ message: "Authorization required at startswithBearer" });
  }

  const token = authorization.replace("Bearer ", "");
  let payload;

  try {
    payload = jwt.verify(token, SECRET_KEY);
  } catch {
    return res.status(UNAUTHORIZED).send({ message: "Invalid Token" });
  }

  req.user = payload;
  return next();
};

module.exports = {
  authorize,
};
