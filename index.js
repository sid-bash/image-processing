const express = require("express");
require('./services/database');

const app = express();
const port = 3000;

app.use(express.json());

// Load routes
const uploadRoutes = require("./routes/upload");
const statusRoutes = require("./routes/status");
const webhookRoutes = require("./routes/webhook");

app.use("/api/upload", uploadRoutes);
app.use("/api/status", statusRoutes);
app.use("/api/webhook", webhookRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
