// routes/eventRoutes.js
const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getTodayEvents,
  getUpcomingEvents,
} = require("../controllers/eventController");

/* All routes are protected — user must be logged in */
router.use(protect);

/* ─── Specific routes first (before :id param routes) ─── */
router.get("/today",    getTodayEvents);
router.get("/upcoming", getUpcomingEvents);

/* ─── Base CRUD ─── */
router.get("/",        getEvents);
router.post("/",       createEvent);
router.get("/:id",     getEventById);
router.put("/:id",     updateEvent);
router.delete("/:id",  deleteEvent);

module.exports = router;