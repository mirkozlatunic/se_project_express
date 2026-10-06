const {
  PORT = 3001,
  MONGODB_URI = "mongodb://127.0.0.1:27017/wtwr_db",
  NODE_ENV,
  JWT_SECRET,
} = process.env;

if (NODE_ENV === "production" && !JWT_SECRET) {
  throw new Error("JWT_SECRET must be set in production");
}

module.exports = {
  PORT,
  MONGODB_URI,
  SECRET_KEY: JWT_SECRET || "dev-secret",
};
