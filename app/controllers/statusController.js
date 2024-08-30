const Image = require("../../models/image");

const   checkStatus = async (req, res) => {
  const { requestId } = req.params;
  try {
    const imageData = await Image.find({ requestId });
    if (imageData.length > 0) {
      const isPending = imageData.some((record) => record.status === "pending");
      const status = isPending ? "processing" : "completed";
      const outputFilePath = `http://localhost:3000/outputs/processed_${requestId}.csv`;

      res.status(200).json({
        status,
        data: imageData,
        downloadLink: isPending ? null : outputFilePath,
      });
    } else {
      res.status(404).json({ status: "not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { checkStatus };
