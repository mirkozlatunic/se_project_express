const User = require("../models/user");
const { OK } = require("../utils/errors");
const { handleHttpError } = require("../utils/errorHandlers");

const createUser =(req, res) => {
    const { name, avatar } = req.body;
  
    User.create({ name, avatar })
      .then((user) => {
        res.send({ data: user });
      })
      .catch((e) => {
        handleHttpError(req, res, e);
      });
  }
  
  const getUsers = (req, res) => {
    User.find({})
      .then((users) => {
        res.status(OK).send(users);
      })
      .catch((e) => {
        handleHttpError(req, res, e);
      });
  }
  
  const getUser =(req, res) => {
    User.findById(req.params.id)
      .orFail()
      .then((user) => {
        res.status(OK).send(user);
      })
      .catch((e) => {
        handleHttpError(req, res, e);
      });
  }
  
  module.exports = {
    createUser,
    getUsers,
    getUser,
  };