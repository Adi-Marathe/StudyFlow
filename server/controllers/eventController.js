const Event = require('../models/Event');

// Get all events for logged-in user
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find({ user: req.user.id }).sort({ start: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create event
exports.createEvent = async (req, res) => {
  try {
    const newEvent = new Event({
      title: req.body.title,
      start: req.body.start,
      end: req.body.end,
      color: req.body.color,
      type: req.body.type,
      description: req.body.description,
      user: req.user.id
    });
    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update event
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete event
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
