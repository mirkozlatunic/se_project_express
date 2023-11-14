const express = require("express");

const router = express.Router();
const { getCurrentUser, updateProfile } = require("../controllers/users");
const { authorize } = require("../middlewares/auth");
const { validateUpdateUser } = require("../middlewares/validation");

router.get("/me", authorize, getCurrentUser);

router.patch("/me", authorize, validateUpdateUser, updateProfile);

module.exports = router;
