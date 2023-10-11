const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const {
  UNAUTHORIZED,
  CREATED,
  BAD_REQUEST,
  FORBIDDEN,
  OK,
  handleHttpError,
} = require("../utils/errors");
const { SECRET_KEY } = require("../utils/config");

const login = (req, res) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
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
    res.status(BAD_REQUEST).send({ message: "Please include an email" });
  }

  User.findOne({ email })
    .then((user) => {
      if (user) {
        return res
          .status(FORBIDDEN)
          .send({ message: "a user with that email already exists." });
      }

      return bcrypt.hash(password, 10).then((hash) => {
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
