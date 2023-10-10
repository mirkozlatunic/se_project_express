const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../utils/config");
const { UNAUTHORIZED } = require("../utils/errors");

const authorize = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    res
      .status(UNAUTHORIZED)
      .send({ message: "Authorization required at startswithBearer" });
    return;
  }

  const token = authorization.replace("Bearer ", "");
  let payload;

  try {
    payload = jwt.verify(token, SECRET_KEY);
  } catch (e) {
    console.error(e);
    return res.status(UNAUTHORIZED).send({ message: "Authorization required" });
  }

  req.user = payload;
  next();
};

module.exports = {
  authorize,
};
