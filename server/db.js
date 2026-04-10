const mongoose = require("mongoose");
const { mongoUri } = require("./config");

async function connectDb() {
  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
    family: 4,
  });
}

module.exports = { connectDb };
