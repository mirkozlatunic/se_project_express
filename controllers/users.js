const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { handleHttpError } = require("../utils/errorHandlers");
const { OK, UNAUTHORIZED, CREATED } = require("../utils/errors");

const login = (req, res) => {
  const { email, password } = req.body;
  User.findUserByCredentials(email, password)
    .then((user) => {
      if (!user) {
        return Promise.reject(new Error("incorrect username or password"));
      }
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
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
    res.status(400).send({ message: "Please inlcude an email" });
  }

  User.findOne({ email })
    .then((user) => {
      if (user) {
        const error = new Error("a user with that email already exists.");
        error.statusCode = 409;
        return Promise.reject(error);
      }
    })
    .then(() => {
      return bcrypt.hash(password, 10).then((hash) => {
        User.create({ name, avatar, email, password: hash })
          .then((user) => {
            res.status(CREATED).send({
              name: user.name,
              email: user.email,
              avatar: user.avatar,
            });
          })
          .catch((e) => {
            handleHttpError(req, res, e);
          });
      });
    })
    .catch((e) => {
      handleHttpError(req, res, e);
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
      handleUserHttpError(req, res, e);
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
