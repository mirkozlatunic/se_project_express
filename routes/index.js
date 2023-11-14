const router = require("express").Router();
const clothingItem = require("./clothingItem");
const users = require("./users");
// const { NOT_FOUND } = require("../utils/errors");
const { login, createUser } = require("../controllers/users");
const { authorize } = require("../middlewares/auth");
const {
  validatedUserLogin,
  validateUserBody,
} = require("../middlewares/validation");
const NotFoundError = require("../utils/not-found-error");

router.use("/items", clothingItem);
router.use("/users", authorize, users);

router.post("/signin", validatedUserLogin, login);
router.post("/signup", validateUserBody, createUser);

router.use((req, res, next) => {
  next(new NotFoundError("Requested resource not found"));
});

module.exports = router;
