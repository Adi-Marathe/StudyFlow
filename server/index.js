const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());

app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/chat', require('./routes/chatbot')); 
app.use('/api/tasks', require('./routes/taskRoutes')); 
app.use('/api/mindmaps', require('./routes/mindMapRoutes')); 
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/notes', require('./routes/noteRoutes'));
app.use('/api/timers', require('./routes/timerRoutes'));

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
