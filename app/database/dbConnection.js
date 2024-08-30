const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/image-processing", {});

const db = mongoose.connection;

db.on("error", (error) => {
  console.error("Database connection error:", error);
});

db.once("open", () => {
  console.log("Connected to MongoDB");
});

module.exports = db;
