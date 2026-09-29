const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const connectDB = require('./config/database');
const { sanitizeBody } = require('./middleware/validationMiddleware');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const locationRoutes = require('./routes/locationRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const aiRoutes = require('./routes/aiRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Input sanitization middleware
app.use(sanitizeBody);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  return res.status(200).json({
    success: true,
    status: 'healthy',
    service: 'AI WeatherWise',
    database: dbStatusMap[dbState] || 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const seedDefaultAccounts = async () => {
  try {
    const User = require('./models/User');
    const memoryStore = require('./utils/memoryStore');
    
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@weatherwise.com').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword123!';
    const userEmail = 'priyan@example.com';
    const userPassword = 'password123';

    if (mongoose.connection.readyState === 1) {
      const adminExists = await User.findOne({ email: adminEmail });
      if (!adminExists) {
        await User.create({ name: 'System Admin', email: adminEmail, password: adminPassword, role: 'admin' });
        console.log(`[AutoSeed] Created admin account: ${adminEmail}`);
      }
      const userExists = await User.findOne({ email: userEmail });
      if (!userExists) {
        await User.create({ name: 'Priyan User', email: userEmail, password: userPassword, role: 'reader' });
        console.log(`[AutoSeed] Created test user account: ${userEmail}`);
      }
    } else {
      const adminExists = await memoryStore.findUserByEmail(adminEmail);
      if (!adminExists) {
        await memoryStore.createUser({ name: 'System Admin', email: adminEmail, password: adminPassword, role: 'admin' });
        console.log(`[AutoSeed] Created memory admin account: ${adminEmail}`);
      }
      const userExists = await memoryStore.findUserByEmail(userEmail);
      if (!userExists) {
        await memoryStore.createUser({ name: 'Priyan User', email: userEmail, password: userPassword, role: 'reader' });
        console.log(`[AutoSeed] Created memory user account: ${userEmail}`);
      }
    }
  } catch (err) {
    console.warn(`[AutoSeed Warning] ${err.message}`);
  }
};

// Run initial seeding
seedDefaultAccounts();

// Start server after initializing DB connection
if (require.main === module) {
  connectDB().then(async () => {
    await seedDefaultAccounts();
    app.listen(PORT, () => {
      console.log(`==================================================`);
      console.log(` AI WeatherWise API running on port ${PORT}`);
      console.log(` Health Check: http://localhost:${PORT}/api/health`);
      console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`==================================================`);
    });
  });
}

app.seedDefaultAccounts = seedDefaultAccounts;
module.exports = app;
