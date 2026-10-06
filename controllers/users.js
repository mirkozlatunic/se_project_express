const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const { SECRET_KEY } = require("../utils/config");
const BadRequestError = require("../utils/bad-request-error");
const ConflictError = require("../utils/conflict-error");
const NotFoundError = require("../utils/not-found-error");
const UnauthorizedError = require("../utils/unauthorized-error");

const login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, SECRET_KEY, {
        expiresIn: "7d",
      });

      res.send({ token });
    })
    .catch((e) => {
      if (e.message === "Username or password are incorrect") {
        next(new UnauthorizedError("Incorrect email or password"));
      } else {
        next(e);
      }
    });
};

const createUser = (req, res, next) => {
  const { name, avatar, email, password } = req.body;

  return User.findOne({ email })
    .then((user) => {
      if (user) {
        throw new ConflictError("Email already exists");
      }

      return bcrypt.hash(password, 10);
    })
    .then((hash) => User.create({ name, avatar, email, password: hash }))
    .then((newUser) => {
      res.status(201).send({
        name: newUser.name,
        email: newUser.email,
        avatar: newUser.avatar,
      });
    })
    .catch((e) => {
      if (e.code === 11000) {
        next(new ConflictError("Email already exists"));
      } else if (e.name === "ValidationError") {
        next(new BadRequestError("Error from createUser"));
      } else {
        next(e);
      }
    });
};

const getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .orFail()
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((e) => {
      if (e.name === "DocumentNotFoundError") {
        next(new NotFoundError("Error from getUser"));
      } else if (e.name === "CastError") {
        next(new BadRequestError("Error from getUser"));
      } else {
        next(e);
      }
    });
};

const updateProfile = (req, res, next) => {
  const { name, avatar } = req.body;
  const userId = req.user._id;

  User.findByIdAndUpdate(
    userId,
    { name, avatar },
    { new: true, runValidators: true },
  )
    .orFail()
    .then((user) => {
      res.send({ data: user });
    })
    .catch((e) => {
      if (e.name === "DocumentNotFoundError") {
        next(new NotFoundError("Error from getUser"));
      } else if (e.name === "CastError") {
        next(new BadRequestError("Error from getUser"));
      } else if (e.name === "ValidationError") {
        next(new BadRequestError("invalid data"));
      } else {
        next(e);
      }
    });
};

module.exports = {
  createUser,
  login,
  getCurrentUser,
  updateProfile,
};
