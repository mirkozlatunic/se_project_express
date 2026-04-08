const express = require("express");

const router = express.Router();
const { getCurrentUser, updateProfile } = require("../controllers/users");
const { validateUpdateUser } = require("../middlewares/validation");

router.get("/me", getCurrentUser);

router.patch("/me", validateUpdateUser, updateProfile);

module.exports = router;
