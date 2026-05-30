const express = require("express");
const router = express.Router();

const upload = require("../utils/upload");

router.post("/imagen", upload.single("imagen"), (req, res) => {
  try {
    const baseUrl =
      process.env.BASE_URL ||
      `${req.protocol}://${req.get("host")}`;

    res.json({
      url: `${baseUrl}/uploads/vehiculos/${req.file.filename}`,
      filename: req.file.filename
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;