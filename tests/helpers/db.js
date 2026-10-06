const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongod;

mongoose.set("strictQuery", true);

const connect = async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
};

const clear = async () => {
  const { collections } = mongoose.connection;
  await Promise.all(Object.values(collections).map((c) => c.deleteMany({})));
};

const disconnect = async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
};

module.exports = { connect, clear, disconnect };
