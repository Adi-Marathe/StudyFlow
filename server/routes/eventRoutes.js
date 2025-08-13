const express = require("express");
const router = express.Router();
const Event = require("../models/Event");

// GET all events
router.get("/", async (req, res) => {
  const events = await Event.find();
  res.json(events);
});

// POST add event
router.post("/", async (req, res) => {
  const newEvent = new Event(req.body);
  await newEvent.save();
  res.json(newEvent);
});

// PUT update event
router.put("/:id", async (req, res) => {
  const updatedEvent = awaim
});

module.exports = router;
