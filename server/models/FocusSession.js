const mongoose = require('mongoose');

const focusSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // What the user typed in "Focus Intent"
    focusIntent: {
      type: String,
      trim: true,
      default: '',
    },

    // Linked task from task manager (optional)
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
    },

    // 'focus' | 'break'
    phase: {
      type: String,
      enum: ['focus', 'break'],
      default: 'focus',
    },

    // Duration in seconds (default 25 min = 1500s)
    duration: {
      type: Number,
      default: 1500,
    },

    // Actual seconds the user stayed focused (may differ if they exit early)
    actualDuration: {
      type: Number,
      default: 0,
    },

    // 'completed' | 'skipped' | 'abandoned'
    status: {
      type: String,
      enum: ['completed', 'skipped', 'abandoned'],
      default: 'completed',
    },

    // Which ambience was active
    ambienceUsed: {
      type: String,
      enum: ['rain', 'lofi', 'noise', 'none'],
      default: 'none',
    },

    startedAt: {
      type: Date,
      default: Date.now,
    },

    endedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// ── Virtual: efficiency % (actualDuration / duration * 100) ──
focusSessionSchema.virtual('efficiency').get(function () {
  if (!this.duration) return 0;
  return Math.round((this.actualDuration / this.duration) * 100);
});

// ── Static: get today's total focus seconds for a user ──
focusSessionSchema.statics.getTodayTotal = async function (userId) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const result = await this.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        phase: 'focus',
        actualDuration: { $gt: 0 },
        startedAt: { $gte: start, $lte: end },
      },
    },
    { $group: { _id: null, total: { $sum: '$actualDuration' } } },
  ]);

  return result[0]?.total || 0;
};

// ── Static: get weekly focus data (last 7 days) ──
focusSessionSchema.statics.getWeeklyData = async function (userId) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d);
  }

  const start = new Date(days[0]);
  start.setHours(0, 0, 0, 0);
  const end = new Date(days[6]);
  end.setHours(23, 59, 59, 999);

  const sessions = await this.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        phase: 'focus',
        actualDuration: { $gt: 0 },
        startedAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$startedAt' } },
        totalSeconds: { $sum: '$actualDuration' },
        sessions: { $sum: 1 },
      },
    },
  ]);

  // Map to day labels
  const dayLabels = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  return days.map((d) => {
    const key = d.toISOString().split('T')[0];
    const found = sessions.find((s) => s._id === key);
    return {
      day: dayLabels[d.getDay()],
      date: key,
      totalSeconds: found?.totalSeconds || 0,
      hours: parseFloat(((found?.totalSeconds || 0) / 3600).toFixed(2)),
      sessions: found?.sessions || 0,
    };
  });
};

// ── Static: get current streak (consecutive days with ≥1 completed session) ──
focusSessionSchema.statics.getCurrentStreak = async function (userId) {
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const sessions = await this.find({
    user: userId,
    phase: 'focus',
    actualDuration: { $gt: 0 },
  })
    .sort({ startedAt: -1 })
    .select('startedAt');

  if (!sessions.length) return 0;

  const activeDays = new Set(
    sessions.map((s) => s.startedAt.toISOString().split('T')[0])
  );

  let streak = 0;
  const cursor = new Date();

  while (true) {
    const key = cursor.toISOString().split('T')[0];
    if (activeDays.has(key)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};

module.exports = mongoose.model('FocusSession', focusSessionSchema);