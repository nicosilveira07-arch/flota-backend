const express = require("express");
const router = express.Router();
const upload = require("../utils/upload");

router.post("/imagen", upload.single("imagen"), (req, res) => {
  try {
    res.json({
      url: req.file.path,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;