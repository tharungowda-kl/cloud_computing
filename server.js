require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const { initDatabase, isMongoConnected } = require('./models/dbAdapter');

// Import route modules
const authRoutes = require('./routes/auth');
const schemeRoutes = require('./routes/schemes');
const scholarshipRoutes = require('./routes/scholarships');
const agricultureRoutes = require('./routes/agriculture');
const weatherRoutes = require('./routes/weather');
const documentRoutes = require('./routes/documents');
const notificationRoutes = require('./routes/notifications');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend assets
app.use(express.static(path.join(__dirname, 'public')));

// Serve uploaded documents statically
app.use('/uploads', express.static(uploadsDir));

const storageService = require('./services/storageService');

// System Info Endpoint
app.get('/api/info', (req, res) => {
  const storageStatus = storageService.getStorageStatus();
  res.json({
    projectName: 'Cloud-Based Rural Digital Service Platform',
    version: '1.0.0',
    type: '5th Semester Engineering Mini Project',
    database: isMongoConnected() ? 'MongoDB (Active)' : 'Local JSON Store (Demonstration Mode)',
    storage: storageStatus,
    status: 'Online',
    timestamp: new Date().toISOString()
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/scholarships', scholarshipRoutes);
app.use('/api/agriculture', agricultureRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Catch-all route to serve index.html for unknown frontend routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Central error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred.'
  });
});

// Start server after database initialization
async function startServer() {
  try {
    await initDatabase(process.env.MONGODB_URI);

    app.listen(PORT, () => {
      console.log('===============================================================');
      console.log('  RURAL DIGITAL SERVICE PLATFORM (MINI PROJECT)               ');
      console.log('===============================================================');
      console.log(`  🚀 Server Running:   http://localhost:${PORT}`);
      console.log(`  📊 Database Status:  ${isMongoConnected() ? 'MongoDB Connected' : 'Portable JSON Store (Fallback Mode)'}`);
      console.log(`  ☁️  Storage Engine:  ${storageService.getStorageStatus().storageLabel}`);
      console.log('---------------------------------------------------------------');
      console.log('  Demo Login Credentials for Evaluation:');
      console.log('  👉 Citizen Account:  citizen@rural.gov  | Password: citizen123');
      console.log('  👉 Admin Account:    admin@rural.gov    | Password: admin123');
      console.log('===============================================================');
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
}

startServer();
