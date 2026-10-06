const mongoose = require("mongoose");
const app = require("./app");
const { PORT, MONGODB_URI } = require("./utils/config");

mongoose.set("strictQuery", true);

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`App listening at port ${PORT}`);
    });
  })
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error("DB error", e);
    process.exit(1);
  });
