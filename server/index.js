// index.js
const express = require('express');
const dotenv  = require('dotenv');
const cors    = require('cors');

const connectDB              = require('./config/db');
const { startReminderJob }   = require('./jobs/reminderJob');
const { startTaskDigestJob } = require('./jobs/taskDigestJob');  // ← add
const { verifyEmailService } = require('./utils/emailService');

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 5000;

connectDB();

/* Verify email AFTER dotenv has loaded */
verifyEmailService();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth',       require('./routes/authRoutes'));
app.use('/api/chat',       require('./routes/chatbot'));
app.use('/api/tasks',      require('./routes/taskRoutes'));
app.use('/api/mindmaps',   require('./routes/mindMapRoutes'));
app.use('/api/events',     require('./routes/eventRoutes'));
app.use('/api/notes',      require('./routes/noteRoutes'));
app.use('/api/timers',     require('./routes/timerRoutes'));
app.use('/api/flashcards', require('./routes/flashcardRoutes'));
app.use('/api/focus', require('./routes/focusRoutes'));

app.get('/', (req, res) => res.send('API is running...'));

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  startReminderJob();    // event reminders  — fires every minute
  startTaskDigestJob();  // task summary     — fires every 3 hours
});