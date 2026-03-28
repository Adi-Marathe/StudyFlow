// controllers/eventController.js
const Event = require("../models/Event");

/* ─────────────────────────────────────────
   GET /api/events
   Returns all events for the logged-in user
   sorted by start date ascending
───────────────────────────────────────── */
const getEvents = async (req, res) => {
  try {
    const events = await Event.find({ user: req.user.id }).sort({ start: 1 });
    res.status(200).json(events);
  } catch (err) {
    console.error("getEvents error:", err);
    res.status(500).json({ error: "Failed to fetch events" });
  }
};

/* ─────────────────────────────────────────
   GET /api/events/:id
   Returns a single event by ID
───────────────────────────────────────── */
const getEventById = async (req, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.status(200).json(event);
  } catch (err) {
    console.error("getEventById error:", err);
    res.status(500).json({ error: "Failed to fetch event" });
  }
};

/* ─────────────────────────────────────────
   POST /api/events
   Creates a new event for the logged-in user
───────────────────────────────────────── */
const createEvent = async (req, res) => {
  try {
    const { title, description, location, start, end, color, reminder } =
      req.body;

    /* Basic validation */
    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Event title is required" });
    }
    if (!start || !end) {
      return res
        .status(400)
        .json({ error: "Start and end date are required" });
    }
    if (new Date(end) < new Date(start)) {
      return res
        .status(400)
        .json({ error: "End date cannot be before start date" });
    }

    const event = await Event.create({
      user: req.user.id,
      title: title.trim(),
      description: description?.trim() || "",
      location: location?.trim() || "",
      start: new Date(start),
      end: new Date(end),
      color: color || "#ff7426",
      reminder: reminder !== undefined ? reminder : 15,
    });

    res.status(201).json(event);
  } catch (err) {
    console.error("createEvent error:", err);
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ error: messages.join(", ") });
    }
    res.status(500).json({ error: "Failed to create event" });
  }
};

/* ─────────────────────────────────────────
   PUT /api/events/:id
   Updates an existing event
───────────────────────────────────────── */
const updateEvent = async (req, res) => {
  try {
    const { title, description, location, start, end, color, reminder } =
      req.body;

    /* Validate dates if provided */
    if (start && end && new Date(end) < new Date(start)) {
      return res
        .status(400)
        .json({ error: "End date cannot be before start date" });
    }

    const updatedFields = {};
    if (title !== undefined)       updatedFields.title       = title.trim();
    if (description !== undefined) updatedFields.description = description.trim();
    if (location !== undefined)    updatedFields.location    = location.trim();
    if (start !== undefined)       updatedFields.start       = new Date(start);
    if (end !== undefined)         updatedFields.end         = new Date(end);
    if (color !== undefined)       updatedFields.color       = color;
    if (reminder !== undefined)    updatedFields.reminder    = reminder;

    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: updatedFields },
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.status(200).json(event);
  } catch (err) {
    console.error("updateEvent error:", err);
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ error: messages.join(", ") });
    }
    res.status(500).json({ error: "Failed to update event" });
  }
};

/* ─────────────────────────────────────────
   DELETE /api/events/:id
   Deletes an event
───────────────────────────────────────── */
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error("deleteEvent error:", err);
    res.status(500).json({ error: "Failed to delete event" });
  }
};

/* ─────────────────────────────────────────
   GET /api/events/today
   Returns only today's events for the user
───────────────────────────────────────── */
const getTodayEvents = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const events = await Event.find({
      user: req.user.id,
      start: { $gte: startOfDay, $lte: endOfDay },
    }).sort({ start: 1 });

    res.status(200).json(events);
  } catch (err) {
    console.error("getTodayEvents error:", err);
    res.status(500).json({ error: "Failed to fetch today's events" });
  }
};

/* ─────────────────────────────────────────
   GET /api/events/upcoming
   Returns events starting from now onwards
───────────────────────────────────────── */
const getUpcomingEvents = async (req, res) => {
  try {
    const events = await Event.find({
      user: req.user.id,
      start: { $gt: new Date() },
    })
      .sort({ start: 1 })
      .limit(10);

    res.status(200).json(events);
  } catch (err) {
    console.error("getUpcomingEvents error:", err);
    res.status(500).json({ error: "Failed to fetch upcoming events" });
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getTodayEvents,
  getUpcomingEvents,
};