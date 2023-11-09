const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/user");
// const {
//   UNAUTHORIZED,
//   CREATED,
//   BAD_REQUEST,
//   FORBIDDEN,
//   OK,
//   handleHttpError,
// } = require("../utils/errors");
const { SECRET_KEY } = require("../utils/config");
const BadRequestError = require("../utils/bad-request-error");
const ConflictError = require("../utils/conflict-error");
// const ForbiddenError = require("../utils/forbidden-error");
const NotFoundError = require("../utils/not-found-error");
const UnauthorizedError = require("../utils/unauthorized-error");

const login = (req, res) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, SECRET_KEY, {
        expiresIn: "7d",
      });

      res.send({ token });
    })
    .catch(() => {
      next(new UnauthorizedError("Error from signinUser"));
    });
};

const createUser = (req, res) => {
  const { name, avatar, email, password } = req.body;

  if (!email) {
    next(new BadRequestError("Error from createUser"));
  }

  User.findOne({ email })
    .then((user) => {
      if (user) {
        return next(new ConflictError("Email already exists"));
      }

      return bcrypt.hash(password, 10).then((hash) => {
        User.create({ name, avatar, email, password: hash })
          .then((newUser) => {
            res.status(200).send({
              name: newUser.name,
              email: newUser.email,
              avatar: newUser.avatar,
            });
          })
          .catch((err) => {
            console.error(err);
            if (err.name === "ValidationError") {
              next(new BadRequestError("Error from createUser"));
            } else {
              next(e);
            }
          });
      });
    })
    .catch((e) => {
      next(e);
    });
};

const getCurrentUser = (req, res) => {
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

const updateProfile = (req, res) => {
  const { name, avatar } = req.body;
  const userId = req.user._id;

  User.findByIdAndUpdate(
    userId,
    { name, avatar },
    { new: true, runValidators: true },
  )
    .then((user) => {
      res.send({ data: user });
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

module.exports = {
  createUser,
  login,
  getCurrentUser,
  updateProfile,
};
