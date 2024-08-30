const multer = require("multer");

const upload = multer({
  dest: "uploads/",
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(csv)$/)) {
      return cb(new Error("Please upload a CSV file"), false);
    }
    cb(null, true);
  },
});

module.exports = upload.single("file");
