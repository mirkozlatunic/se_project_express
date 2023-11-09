module.exports = (err, req, res, next) => {
  console.error(err);
  const { statusCode = 500, message } = err;
  console.log(err.statusCode);
  // check the status and display a message based on it
  res
    .statusCode(statusCode)
    .send({
      message:
        statusCode === 500 ? "An error has occurred on the server" : message,
    });
};
