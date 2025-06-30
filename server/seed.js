import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/child-protection-system';

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});

    // Create admin user
    const adminUser = new User({
      name: 'System Admin',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
      position: 'System Administrator',
      department: 'IT'
    });

    await adminUser.save();
    console.log('Admin user created successfully');

    // Disconnect from database
    await mongoose.disconnect();
    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();