const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('../models/User');

dotenv.config();

const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'adminpassword',
    role: 'admin',
  },
  {
    name: 'Demo Customer',
    email: 'customer@example.com',
    password: 'customerpassword',
    role: 'customer',
  },
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mini-ecom');
    console.log('[Seeder] Connected to MongoDB...');

    // Clear existing users
    await User.deleteMany();
    console.log('[Seeder] Cleared existing users.');

    // Create users (using User.create so pre('save') bcrypt hashing fires)
    for (const u of users) {
      await User.create(u);
    }

    console.log('[Seeder] Default Admin & Customer users created successfully!');
    console.log('----------------------------------------------------');
    console.log('Admin Account:    admin@example.com    / adminpassword');
    console.log('Customer Account: customer@example.com / customerpassword');
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error(`[Seeder] Error: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mini-ecom');
    console.log('[Seeder] Connected to MongoDB...');

    await User.deleteMany();
    console.log('[Seeder] All users destroyed successfully!');

    process.exit(0);
  } catch (error) {
    console.error(`[Seeder] Error: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  seedData();
}
