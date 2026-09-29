/**
 * Admin User Seed Script for AI WeatherWise
 * Usage: npm run create-admin
 */

const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('../config/database');
const User = require('../models/User');

const createAdminAccount = async () => {
  try {
    await connectDB();

    const adminName = process.env.ADMIN_NAME || 'System Admin';
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@weatherwise.com').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword123!';

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log(`[SeedAdmin] Upgraded existing user '${adminEmail}' to admin role.`);
      } else {
        console.log(`[SeedAdmin] Admin user '${adminEmail}' already exists.`);
      }
      process.exit(0);
    }

    const newAdmin = await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      isActive: true,
    });

    console.log(`[SeedAdmin] Admin account created successfully:`);
    console.log(`- ID: ${newAdmin._id}`);
    console.log(`- Email: ${newAdmin.email}`);
    console.log(`- Role: ${newAdmin.role}`);

    process.exit(0);
  } catch (error) {
    console.error(`[SeedAdmin] Error creating admin account: ${error.message}`);
    process.exit(1);
  }
};

createAdminAccount();
