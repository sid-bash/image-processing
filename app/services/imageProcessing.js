const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

// Function to download image from URL and save locally
const downloadImage = async (url, outputPath) => {
  const writer = fs.createWriteStream(outputPath);
  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
    timeout: 10000,
  });
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
};

// Function to compress image using sharp
const compressImage = async (inputPath, outputPath) => {
  await sharp(inputPath).jpeg({ quality: 50 }).toFile(outputPath);
};

// Main function to process image
const processImage = async (url, fileName, outputDir) => {
  const inputPath = path.join(outputDir, `input_${fileName}`);
  const outputPath = path.join(outputDir, `processed_${fileName}`);

  // Download image
  await downloadImage(url, inputPath);

  // Compress image
  await compressImage(inputPath, outputPath);

  // Clean up
  fs.unlinkSync(inputPath);

  return `http://localhost:3000/${outputPath}`;
};

module.exports = {
  processImage,
};
