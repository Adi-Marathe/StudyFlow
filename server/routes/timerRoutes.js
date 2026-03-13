const express = require("express");
const {
  createPreset,
  getPresets,
  deletePreset,
} = require("../controllers/timerController");

const router = express.Router();

router.post("/", createPreset);   // save
router.get("/", getPresets);      // fetch
router.delete("/:id", deletePreset); // delete

module.exports = router;