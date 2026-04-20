/**
 * Seed script — run once to populate sample data
 * Usage: node seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Booking = require('./models/Booking');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/seva-setu';

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Create admin user
    const adminExists = await User.findOne({ role: 'ADMIN' });
    if (!adminExists) {
      await User.create({
        name: 'Admin User',
        phone: '9999999999',
        email: 'admin@sevasetu.com',
        password: 'admin123', // Will be hashed by pre-save hook
        role: 'ADMIN',
        isVerified: true,
        status: 'active',
      });
      console.log('✅ Admin user created');
    }

    // Create sample providers
    const sampleProviders = [
      {
        name: 'Ramesh Kumar',
        phone: '9876543210',
        email: 'ramesh@example.com',
        password: 'password123',
        role: 'PROVIDER',
        isVerified: true,
        status: 'active',
        serviceType: 'Plumbing',
        experience: '10+ years',
        address: 'Indirapuram, Ghaziabad',
      },
      {
        name: 'Priya Sharma',
        phone: '9876543211',
        email: 'priya@example.com',
        password: 'password123',
        role: 'PROVIDER',
        isVerified: true,
        status: 'active',
        serviceType: 'House Cleaning',
        experience: '5+ years',
        address: 'Vaishali, Ghaziabad',
      },
    ];

    for (const provider of sampleProviders) {
      const exists = await User.findOne({ phone: provider.phone });
      if (!exists) {
        await User.create(provider);
      }
    }
    console.log('✅ Sample providers created');

    // Create sample user
    const userExists = await User.findOne({ phone: '9876543212' });
    if (!userExists) {
      await User.create({
        name: 'John Doe',
        phone: '9876543212',
        email: 'john@example.com',
        password: 'password123',
        role: 'USER',
        status: 'active',
      });
      console.log('✅ Sample user created');
    }

    console.log('✅ Database seeded successfully');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
}

seed();
