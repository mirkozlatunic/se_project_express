const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../../models/user");
const ClothingItem = require("../../models/clothingItem");
const { SECRET_KEY } = require("../../utils/config");

let counter = 0;

const createUser = async (overrides = {}) => {
  counter += 1;
  const password = overrides.password || "password123";
  const user = await User.create({
    name: "Test User",
    avatar: "https://example.com/avatar.png",
    email: `user${counter}@example.com`,
    ...overrides,
    password: await bcrypt.hash(password, 4),
  });
  const token = jwt.sign({ _id: user._id }, SECRET_KEY, { expiresIn: "1h" });
  return { user, token, password };
};

const createItem = (owner, overrides = {}) =>
  ClothingItem.create({
    name: "Jacket",
    weather: "cold",
    imageUrl: "https://example.com/jacket.png",
    owner,
    ...overrides,
  });

module.exports = { createUser, createItem };
