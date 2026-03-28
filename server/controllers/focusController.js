const FocusSession = require('../models/FocusSession');
const Task         = require('../models/Task');

// ─────────────────────────────────────────
// POST /api/focus/start
// Start a new focus session
// ─────────────────────────────────────────
exports.startSession = async (req, res) => {
  try {
    const { focusIntent, taskId, duration = 1500, ambienceUsed = 'none' } = req.body;

    const sessionData = {
      user: req.user.id,
      focusIntent: focusIntent?.trim() || '',
      duration,
      ambienceUsed,
      startedAt: new Date(),
      phase: 'focus',
    };

    if (taskId) {
      const task = await Task.findOne({ _id: taskId, user: req.user.id });
      if (task) sessionData.task = taskId;
    }

    const session = await FocusSession.create(sessionData);

    res.status(201).json({
      success: true,
      message: 'Focus session started',
      session,
    });
  } catch (error) {
    console.error('startSession error:', error);
    res.status(500).json({ success: false, message: 'Failed to start session' });
  }
};

// ─────────────────────────────────────────
// PATCH /api/focus/:id/complete
// Mark a focus session as completed
// ─────────────────────────────────────────
exports.completeSession = async (req, res) => {
  try {
    const { actualDuration, status = 'completed' } = req.body;

    const session = await FocusSession.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    session.actualDuration = actualDuration ?? session.duration;
    session.status  = status;
    session.endedAt = new Date();
    await session.save();

    // Get updated stats to return immediately
    const [todayTotal, streak] = await Promise.all([
      FocusSession.getTodayTotal(req.user.id),
      FocusSession.getCurrentStreak(req.user.id),
    ]);

    res.json({
      success: true,
      message: 'Session completed',
      session,
      stats: { todayTotal, streak },
    });
  } catch (error) {
    console.error('completeSession error:', error);
    res.status(500).json({ success: false, message: 'Failed to complete session' });
  }
};

// ─────────────────────────────────────────
// PATCH /api/focus/:id/abandon
// Abandon / exit early from a session
// ─────────────────────────────────────────
exports.abandonSession = async (req, res) => {
  try {
    const { actualDuration = 0 } = req.body;

    const session = await FocusSession.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    session.actualDuration = actualDuration;
    session.status  = 'abandoned';
    session.endedAt = new Date();
    await session.save();

    res.json({ success: true, message: 'Session abandoned', session });
  } catch (error) {
    console.error('abandonSession error:', error);
    res.status(500).json({ success: false, message: 'Failed to abandon session' });
  }
};

// ─────────────────────────────────────────
// GET /api/focus/stats
// Dashboard stats: today's time, streak, sessions, most focused task
// ─────────────────────────────────────────
exports.getStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Today date range
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Yesterday date range
    const yesterdayStart = new Date();
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    yesterdayStart.setHours(0, 0, 0, 0);
    const yesterdayEnd = new Date();
    yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
    yesterdayEnd.setHours(23, 59, 59, 999);

    const [todayTotal, yesterdayTotal, streak, weeklyData, sessionStats, mostFocusedTask] =
      await Promise.all([
        // Today's total seconds
        FocusSession.getTodayTotal(userId),

        // Yesterday's total (for % change)
        FocusSession.aggregate([
          {
            $match: {
              user: userId,
              phase: 'focus',
              actualDuration: { $gt: 0 },
              startedAt: { $gte: yesterdayStart, $lte: yesterdayEnd },
            },
          },
          { $group: { _id: null, total: { $sum: '$actualDuration' } } },
        ]).then((r) => r[0]?.total || 0),

        // Streak
        FocusSession.getCurrentStreak(userId),

        // Weekly data
        FocusSession.getWeeklyData(userId),

        // Today's session count (any session where user actually focused)
        FocusSession.aggregate([
          {
            $match: {
              user: userId,
              phase: 'focus',
              actualDuration: { $gt: 0 },
              startedAt: { $gte: todayStart, $lte: todayEnd },
            },
          },
          { $group: { _id: null, count: { $sum: 1 } } },
        ]),

        // Most focused topic — group by task if linked, else by focusIntent
        FocusSession.aggregate([
          {
            $match: {
              user: userId,
              phase: 'focus',
              actualDuration: { $gt: 0 },
            },
          },
          {
            $group: {
              _id: {
                task: '$task',
                intent: { $ifNull: ['$focusIntent', 'General Focus'] },
              },
              totalTime: { $sum: '$actualDuration' },
              sessions: { $sum: 1 },
            },
          },
          { $sort: { totalTime: -1 } },
          { $limit: 1 },
          {
            $lookup: {
              from: 'tasks',
              localField: '_id.task',
              foreignField: '_id',
              as: 'taskInfo',
            },
          },
          { $unwind: { path: '$taskInfo', preserveNullAndEmptyArrays: true } },
        ]),
      ]);

    // Sessions completed today
    const completedToday = sessionStats[0]?.count || 0;

    // % change vs yesterday
    let changePercent = 0;
    if (yesterdayTotal > 0) {
      changePercent = Math.round(((todayTotal - yesterdayTotal) / yesterdayTotal) * 100);
    }

    // Format today's time as "Xh Ym"
    const formatTime = (seconds) => {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      if (h > 0) return `${h}h ${m}m`;
      return `${m}m`;
    };

    res.json({
      success: true,
      stats: {
        todayFocusTime: {
          raw: todayTotal,
          formatted: formatTime(todayTotal),
          changePercent,
        },
        currentStreak: streak,
        sessionsCompleted: {
          today: completedToday,
        },
        mostFocusedTask: mostFocusedTask[0]
          ? {
              name: mostFocusedTask[0].taskInfo?.title
                || mostFocusedTask[0]._id?.intent
                || 'General Focus',
              totalTime: mostFocusedTask[0].totalTime,
              formattedTime: formatTime(mostFocusedTask[0].totalTime),
              sessions: mostFocusedTask[0].sessions,
            }
          : null,
        weeklyData,
      },
    });
  } catch (error) {
    console.error('getStats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
};

// ─────────────────────────────────────────
// GET /api/focus/weekly
// Weekly focus time breakdown (7 days)
// ─────────────────────────────────────────
exports.getWeeklyData = async (req, res) => {
  try {
    const data = await FocusSession.getWeeklyData(req.user.id);
    res.json({ success: true, weeklyData: data });
  } catch (error) {
    console.error('getWeeklyData error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch weekly data' });
  }
};

// ─────────────────────────────────────────
// GET /api/focus/productivity-trend
// Last 12 data points for the trend line (daily avg efficiency %)
// ─────────────────────────────────────────
exports.getProductivityTrend = async (req, res) => {
  try {
    const userId = req.user.id;
    const days = 12;

    const start = new Date();
    start.setDate(start.getDate() - days + 1);
    start.setHours(0, 0, 0, 0);

    const data = await FocusSession.aggregate([
      {
        $match: {
          user: userId,
          phase: 'focus',
          actualDuration: { $gt: 0 },
          startedAt: { $gte: start },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$startedAt' } },
          avgEfficiency: {
            $avg: { $multiply: [{ $divide: ['$actualDuration', '$duration'] }, 100] },
          },
          totalSeconds: { $sum: '$actualDuration' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ success: true, trend: data });
  } catch (error) {
    console.error('getProductivityTrend error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch trend' });
  }
};

// ─────────────────────────────────────────
// GET /api/focus/history
// Paginated session history
// ─────────────────────────────────────────
exports.getHistory = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip  = (page - 1) * limit;

    const [sessions, total] = await Promise.all([
      FocusSession.find({ user: req.user.id, phase: 'focus' })
        .sort({ startedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('task', 'title'),
      FocusSession.countDocuments({ user: req.user.id, phase: 'focus' }),
    ]);

    res.json({
      success: true,
      sessions,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('getHistory error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch history' });
  }
};