console.log('ALL ENVIRONMENT VARIABLES:', process.env);
console.log('PORT env:', process.env.PORT);

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const cron = require('node-cron');
const { fork } = require('child_process');

const app = express();

// CORS configuration to allow local dev and Netlify
app.use(cors({
  origin: [
    'http://localhost:3000', // local dev
    'https://node-js-tracker.vercel.app' // Vercel frontend
  ],
  credentials: true
}));

app.use(express.json());

// Log all requests and bodies for debugging
app.use((req, res, next) => {
  console.log('Request:', req.method, req.url, req.headers['content-type'], req.body);
  next();
});

// --- MongoDB Connection ---
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://Admin:Admin@cluster0.ge3ezsi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Set buffer timeout to 5s to prevent operations from hanging indefinitely if DB is down
mongoose.set('bufferTimeoutMS', 5000);

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000 // Timeout after 5s instead of hanging
}).then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));


// --- Routes ---
const authRouter = require('./auth');
const employeeRouter = require('./routes/employees');
const holidayRouter = require('./routes/holidays');
const configRouter = require('./routes/config');
const leaveRouter = require('./routes/leaves');
const analysisRouter = require('./routes/analysis');

app.use('/api', authRouter);
app.use('/api/employees', employeeRouter);
app.use('/api/holidays', holidayRouter);
app.use('/api/config', configRouter);
app.use('/api', leaveRouter); // Mounted at /api because leaves.js handles /leaves and /download-leave-excel
app.use('/api/analysis', analysisRouter);

// --- Serve React frontend for all non-API routes (Catch-All) ---
// Must be last!
app.get('*', (req, res) => {
  if (!req.url.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  }
});

const port = process.env.PORT || 4000;

// Schedule Daily Backup at Midnight (00:00)
cron.schedule('0 0 * * *', () => {
  console.log('⏰ Starting Daily Database Backup...');
  const backupProcess = fork(path.join(__dirname, 'backup_script.js'));

  backupProcess.on('exit', (code) => {
    if (code === 0) {
      console.log('✅ Daily Backup Completed Successfully.');
    } else {
      console.error(`❌ Daily Backup Failed with exit code ${code}`);
    }
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
