const router = require("express").Router();
const clothingItem = require("./clothingItem");
const users = require("./users");
const { NOT_FOUND } = require("../utils/errors");
const { login, createUser } = require("../controllers/users");
const { authorize } = require("../middlewares/auth");

router.use("/items", clothingItem);
router.use("/users", authorize, users);

router.post("/signin", login);
router.post("/signup", createUser);

router.use((req, res) => {
  res.status(NOT_FOUND).send({ message: "Router not found" });
});

module.exports = router;
