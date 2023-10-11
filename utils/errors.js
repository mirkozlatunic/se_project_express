const BAD_REQUEST = 400;
const UNAUTHORIZED = 401;
const FORBIDDEN = 403;
const NOT_FOUND = 404;
const CONFLICT = 409;
const INTERNAL_SERVER_ERROR = 500;
const OK = 200;
const CREATED = 201;

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
  NOT_FOUND,
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
  OK,
  CREATED,
  UNAUTHORIZED,
  CONFLICT,
  FORBIDDEN,
  handleHttpError,
};
