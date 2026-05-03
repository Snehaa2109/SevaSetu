/**
 * Seed script — run once to populate sample data
 * Usage: node seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('./models/User');
const Provider = require('./models/Provider');
const Booking  = require('./models/Booking');

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

    // ── Sample providers ──────────────────────────────────────────────────────
    // Each provider needs: a User record (for auth/login) AND a Provider record
    // (for listing on the /services page with filters).
    const sampleProviders = [
      {
        user: {
          name: 'Sunita Devi',
          phone: '9876543210',
          email: 'sunita@example.com',
          password: 'password123',
          role: 'PROVIDER',
          isVerified: true,
          status: 'active',
        },
        profile: {
          name: 'Sunita Devi',
          phone: '9876543210',
          serviceCategory: 'Maid',
          serviceDescription: 'Experienced house maid specializing in full home cleaning, utensil washing, and daily upkeep.',
          areas: ['Indirapuram', 'Vaishali'],
          experience: 8,
          priceRange: { min: 3000, max: 6000, unit: 'per visit' },
          isVerified: true,
          status: 'active',
          isAvailable: true,
          rating: 4.7,
          totalReviews: 34,
        },
      },
      {
        user: {
          name: 'Kavita Sharma',
          phone: '9876543211',
          email: 'kavita@example.com',
          password: 'password123',
          role: 'PROVIDER',
          isVerified: true,
          status: 'active',
        },
        profile: {
          name: 'Kavita Sharma',
          phone: '9876543211',
          serviceCategory: 'Babysitter',
          serviceDescription: 'Caring babysitter with experience in infant care, toddler activities, and school pickups.',
          areas: ['Vasundhara', 'Kaushambi', 'Indirapuram'],
          experience: 5,
          priceRange: { min: 4000, max: 8000, unit: 'per visit' },
          isVerified: true,
          status: 'active',
          isAvailable: true,
          rating: 4.9,
          totalReviews: 21,
        },
      },
      {
        user: {
          name: 'Meera Gupta',
          phone: '9876543213',
          email: 'meera@example.com',
          password: 'password123',
          role: 'PROVIDER',
          isVerified: true,
          status: 'active',
        },
        profile: {
          name: 'Meera Gupta',
          phone: '9876543213',
          serviceCategory: 'Elderly Care',
          serviceDescription: 'Compassionate caretaker providing round-the-clock elderly care, medication reminders, and physiotherapy assistance.',
          areas: ['Raj Nagar Extension', 'Crossings Republik', 'Vaishali'],
          experience: 10,
          priceRange: { min: 6000, max: 12000, unit: 'per visit' },
          isVerified: true,
          status: 'active',
          isAvailable: true,
          rating: 4.8,
          totalReviews: 47,
        },
      },
      {
        user: {
          name: 'Priya Yadav',
          phone: '9876543214',
          email: 'priya@example.com',
          password: 'password123',
          role: 'PROVIDER',
          isVerified: true,
          status: 'active',
        },
        profile: {
          name: 'Priya Yadav',
          phone: '9876543214',
          serviceCategory: 'Maid',
          serviceDescription: 'Reliable and punctual maid for part-time or full-time cleaning services.',
          areas: ['Vijay Nagar', 'Shastri Nagar', 'Govindpuram'],
          experience: 4,
          priceRange: { min: 2500, max: 5000, unit: 'per visit' },
          isVerified: true,
          status: 'active',
          isAvailable: true,
          rating: 4.5,
          totalReviews: 18,
        },
      },
    ];

    for (const { user: userData, profile: profileData } of sampleProviders) {
      // Create User record if not exists (needed for login/auth)
      const existingUser = await User.findOne({ phone: userData.phone });
      if (!existingUser) {
        await User.create(userData);
      }

      // Upsert Provider profile (the record used for listing & filtering)
      await Provider.findOneAndUpdate(
        { phone: profileData.phone },
        profileData,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    console.log('✅ Sample providers created in both users + providers collections');


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
