const express = require("express");
const path = require('path');
require('./app/database/dbConnection');

const app = express();
const port = 3000;

app.use(express.json());

// Static hosting
app.use('/outputs', express.static(path.join(__dirname, 'outputs')));
app.use('/compressed_images', express.static(path.join(__dirname, 'compressed_images')));

// Load routes
const routes = require("./app/routes/routes");
app.use("/api", routes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
