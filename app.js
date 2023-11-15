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

mongoose.connect(
  "mongodb://127.0.0.1:27017/wtwr_db",
  (r) => {
    console.log("connected to DB", r);
  },
  (e) => console.log("DB error", e),
);
app.use(cors());
app.use(express.json());
const routes = require("./routes");

app.use(helmet());

app.use((req, res, next) => {
  req.user = {
    _id: "6514eed45b23e9679f955231", // paste the _id of the test user created in the previous step
  };
  next();
});

app.use(requestLogger);
app.use(routes);
app.use(errorLogger);
app.use(errors());
app.use(errorHandler);
app.listen(PORT, () => {
  console.log(`App listening at port ${PORT}`);
  console.log("This is working");
});
