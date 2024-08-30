const fs = require("fs");
const path = require("path");
const Image = require("../../models/image");
const { default: axios } = require("axios");
const { processImage } = require("./imageProcessing");

// Function to send webhook notifications
const notifyWebhook = async (records, requestId) => {
  const webhookUrl = "http://localhost:3000/api/webhook/"; // Set your actual webhook URL here

  const isFailed = records.some((record) => record.status === "failed");
  const status = isFailed ? "failed" : "completed";

  try {
    await axios.post(webhookUrl, {
      requestId,
      status,
      message: `Processing ${status} for request ID: ${requestId}`,
    });
    console.log(`Webhook notification sent for request ID: ${requestId}`);
  } catch (error) {
    console.error(`Failed to send webhook notification: ${error.message}`);
  }
};

const writeToCsv = (records, requestId) => {
  // Write processed records to a CSV
  const outputFilePath = path.join("outputs", `processed_${requestId}.csv`);
  const headers = [
    '"S. No."',
    '"Product Name"',
    '"Input Image Urls"',
    '"Output Image Urls"',
  ];
  const csvRows = [headers.join(",")];

  records.forEach((record) => {
    const row = [
      record.serialNumber,
      record.productName,
      `"${record.inputImageUrls}"`,
      `"${record.outputImageUrls.join(",")}"`,
    ];
    csvRows.push(row.join(","));
  });

  fs.writeFileSync(outputFilePath, csvRows.join("\n"));
};

const processImages = async (records, requestId) => {
  const processing = records?.map(async (row) => {
    const {
      "S. No.": serialNumber,
      "Product Name": productName,
      "Image Input Urls": inputImageUrls,
    } = row;

    const outputImageUrls = [];

    for (const [index, url] of inputImageUrls.split(",").entries()) {
      const outputDir = "compressed_images/";
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
      }
      const fileName = `${requestId}_${serialNumber}_${index}`;
      try {
        const outputUrl = await processImage(url, fileName, outputDir);
        outputImageUrls.push(outputUrl);
      } catch (error) {
        console.error(`Failed to process image: ${url}`, error.message);
        // Update status to failed if image processing fails
        await Image.findOneAndUpdate(
          { requestId, serialNumber },
          { status: "failed" }
        );

        // Stop processing this row if one of the images fails
        return {
          serialNumber,
          productName,
          inputImageUrls,
          outputImageUrls: [],
          status: "failed",
        };
      }
    }

    await Image.findOneAndUpdate(
      { requestId, serialNumber },
      {
        outputImageUrls,
        status: "completed",
      }
    );

    // Return the processed record
    return {
      serialNumber,
      productName,
      inputImageUrls,
      outputImageUrls,
      status: "completed",
    };
  });

  const processedRecords = await Promise.all(processing);
  writeToCsv(processedRecords, requestId);
  notifyWebhook(processedRecords, requestId);
};

module.exports = {
  processImages,
};
