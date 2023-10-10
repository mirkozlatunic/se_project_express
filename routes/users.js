const express = require("express");

const router = express.Router();
const { getCurrentUser, updateProfile } = require("../controllers/users");
const { authorize } = require("../middlewares/auth");

router.get("/me", authorize, getCurrentUser);

router.patch("/me", authorize, updateProfile);

module.exports = router;
