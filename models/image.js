const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  requestId: { type: String, required: true },
  serialNumber: { type: String, required: true },
  productName: { type: String, required: true },
  inputImageUrls: [String],
  outputImageUrls: [String],
  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

const Image = mongoose.model("Image", imageSchema);

module.exports = Image;
