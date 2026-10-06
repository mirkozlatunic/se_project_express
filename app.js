require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { errors } = require("celebrate");
const routes = require("./routes");
const errorHandler = require("./middlewares/error-handler");
const { requestLogger, errorLogger } = require("./middlewares/logger");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use(requestLogger);
app.use(routes);
app.use(errorLogger);
app.use(errors());
app.use(errorHandler);

module.exports = app;
