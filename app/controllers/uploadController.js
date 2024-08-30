const csv = require("csv-parser");
const fs = require("fs");
const Image = require("../../models/image");
const { processImages } = require("../services/uploadService.js");

// Function to validate CSV row format
const validateRow = (row) => {
  return (
    row["S. No."] &&
    row["Product Name"] &&
    row["Image Input Urls"] &&
    row["Image Input Urls"].split(",").every((url) => url.startsWith("http"))
  );
};

const handleUpload = async (req, res) => {
  try {
    const filePath = req.file.path;
    const requestId = new Date().getTime().toString();

    const records = [];

    // Validate CSV format
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        if (validateRow(row)) {
          records.push(row);
        }
      })
      .on("end", async () => {
        fs.unlinkSync(filePath); // Remove original CSV file after reading

        if (records.length === 0) {
          return res.status(400).json({ error: "Invalid CSV format." });
        }

        // Create initial entries with pending status
        await Promise.all(
          records.map(async (row) => {
            const {
              "S. No.": serialNumber,
              "Product Name": productName,
              "Image Input Urls": inputImageUrls,
            } = row;

            await Image.create({
              requestId,
              serialNumber,
              productName,
              inputImageUrls: inputImageUrls.split(","),
              outputImageUrls: [],
              status: "pending",
            });
          })
        );

        // Asynchronous image processing
        processImages(records, requestId)
          .then(() => {
            console.log(`Processing completed for request ID: ${requestId}`);
          })
          .catch((error) => {
            console.error(`Error processing images: ${error}`);
          });

        res.status(202).json({ requestId, status: "Processing started" });
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  handleUpload,
};
