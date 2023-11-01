const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const { PORT = 3001 } = process.env;

const app = express();

const helmet = require("helmet");

mongoose.connect(
  "mongodb://127.0.0.1:27017/wtwr_db",
  (r) => {
    console.log("connected to DB", r);
  },
  (e) => console.log("DB error", e),
);
app.use(cors());

const routes = require("./routes");

app.use(helmet());
app.use(express.json());
app.use((req, res, next) => {
  req.user = {
    _id: "6514eed45b23e9679f955231", // paste the _id of the test user created in the previous step
  };
  next();
});

app.use(routes);

app.listen(PORT, () => {
  console.log(`App listening at port ${PORT}`);
  console.log("This is working");
});
