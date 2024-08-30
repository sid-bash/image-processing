const express = require("express");
const uploadMiddleware = require("../middlewares/uploadMiddleware");
const { webhookFunction } = require("../controllers/webhookController");
const { handleUpload } = require("../controllers/uploadController");
const { checkStatus } = require("../controllers/statusController");

const router = express.Router();

// To upload Csv file
router.post("/upload", uploadMiddleware, handleUpload);

// To check processing status
router.get("/status/:requestId", checkStatus);

// Webhook route
router.post("/webhook", webhookFunction);

module.exports = router;
