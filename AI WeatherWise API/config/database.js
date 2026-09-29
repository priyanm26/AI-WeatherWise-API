const mongoose = require('mongoose');
const net = require('net');

let memoryServer = null;

// Utility to check if local MongoDB port 27017 is listening
const checkPortOpen = (host, port, timeout = 500) => {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(timeout);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
};

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (uri && uri.trim() !== '') {
    try {
      console.log('[DB] Attempting connection to configured MONGO_URI...');
      const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 1200 });
      console.log(`[DB] Connected to MongoDB: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      console.warn(`[DB Notice] Configured MONGO_URI unreachable. Switching to local/in-memory server...`);
    }
  }

  const isLocalMongoRunning = await checkPortOpen('127.0.0.1', 27017, 500);
  if (isLocalMongoRunning) {
    try {
      const conn = await mongoose.connect('mongodb://127.0.0.1:27017/ai_weatherwise');
      console.log(`[DB] Connected to Local MongoDB: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      console.warn(`[DB Warning] Local MongoDB connection failed: ${error.message}`);
    }
  }

  console.warn(`[DB Notice] Remote & Local MongoDB not reachable. Initializing In-Memory Database Server...`);

  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    const memUri = memoryServer.getUri();

    const conn = await mongoose.connect(memUri);
    console.log(`==================================================`);
    console.log(` In-Memory MongoDB Server Connected Successfully!`);
    console.log(` All database endpoints are live and operational.`);
    console.log(`==================================================`);
    
    // Seed default accounts in Mongo DB
    try {
      const User = require('../models/User');
      const adminEmail = (process.env.ADMIN_EMAIL || 'admin@weatherwise.com').toLowerCase().trim();
      const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword123!';
      const adminExists = await User.findOne({ email: adminEmail });
      if (!adminExists) {
        await User.create({ name: 'System Admin', email: adminEmail, password: adminPassword, role: 'admin' });
      }
    } catch (e) {}

    return conn;
  } catch (memErr) {
    console.warn(`[DB Warning] MongoMemoryServer startup notice: ${memErr.message}`);
    return null;
  }
};

module.exports = connectDB;
