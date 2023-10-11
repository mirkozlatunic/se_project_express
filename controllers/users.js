const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const { handleHttpError } = require("../utils/errorHandlers");
const { OK, UNAUTHORIZED, CREATED } = require("../utils/errors");
const { SECRET_KEY } = require("../utils/errors");

const login = (req, res) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      if (!user) {
        return Promise.reject(new Error("incorrect username or password"));
      }
      const token = jwt.sign({ _id: user._id }, SECRET_KEY, {
        expiresIn: "7d",
      });

      res.send({ token });
    })
    .catch((e) => {
      res.status(UNAUTHORIZED).send({ message: e.message });
    });
};

const createUser = (req, res) => {
  const { name, avatar, email, password } = req.body;

  if (!email) {
    res.status(400).send({ message: "Please include an email" });
    return;
  }

  User.findOne({ email })
    .then((user) => {
      if (user) {
        const error = new Error("a user with that email already exists.");
        error.statusCode = 409;
        return Promise.reject(error);
      }

      bcrypt.hash(password, 10).then((hash) => {
        User.create({ name, avatar, email, password: hash })
          .then((newUser) => {
            res.status(CREATED).send({
              name: newUser.name,
              email: newUser.email,
              avatar: newUser.avatar,
            });
          })
          .catch((err) => {
            handleHttpError(req, res, err);
          });
      });
    })
    .catch((err) => {
      console.error(err);
      res
        .status(err.statusCode || 500)
        .send({ message: err.message || "Internal server error" });
    });
};

const getUsers = (req, res) => {
  User.find({})
    .then((users) => {
      res.status(OK).send(users);
    })
    .catch((e) => {
      handleHttpError(req, res, e);
    });
};

const getUser = (req, res) => {
  User.findById(req.params.id)
    .orFail()
    .then((user) => {
      res.status(OK).send(user);
    })
    .catch((e) => {
      handleHttpError(req, res, e);
    });
};

const getCurrentUser = (req, res) => {
  User.findById(req.user._id)
    .orFail()
    .then((user) => {
      res.status(OK).send(user);
    })
    .catch((e) => {
      handleHttpError(req, res, e);
    });
};

const updateProfile = (req, res) => {
  User.findOneAndUpdate(req.user._id, req.body, {
    new: true,
    runValidators: true,
  })
    .orFail()
    .then((user) => {
      res.status(OK).send({ user });
    })
    .catch((e) => {
      handleHttpError(req, res, e);
    });
};

module.exports = {
  createUser,
  getUsers,
  getUser,
  login,
  getCurrentUser,
  updateProfile,
};
