const { NOT_FOUND, BAD_REQUEST, INTERNAL_SERVER_ERROR } = require("./errors");

function handleHttpError(req, res, err) {
  console.error(err);
  switch (err.name) {
    case "DocumentNotFoundError":
      res.status(NOT_FOUND).send({ message: "id couldn't be found" });
      break;
    case "CastError":
      res.status(BAD_REQUEST).send({ message: "id is incorrect format" });
      break;
    case "ValidationError":
      res.status(BAD_REQUEST).send({ message: "data is invalid" });
      break;
    default:
      res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: `An ${err.name} error has occurred on the server` });
      break;
  }
}

module.exports = {
  handleHttpError,
};