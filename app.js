require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const { PORT = 3001 } = process.env;
const app = express();
const helmet = require("helmet");
const { errors } = require("celebrate");
const errorHandler = require("./middlewares/error-handler");
const { requestLogger, errorLogger } = require("./middlewares/logger");

mongoose
  .connect("mongodb://127.0.0.1:27017/wtwr_db")
  .then(() => console.log("connected to DB"))
  .catch((e) => console.log("DB error", e));
app.use(cors());
app.use(express.json());
const routes = require("./routes");

app.use(helmet());

app.use(requestLogger);
app.use(routes);
app.use(errorLogger);
app.use(errors());
app.use(errorHandler);
app.listen(PORT, () => {
  console.log(`App listening at port ${PORT}`);
  console.log("This is working");
});
