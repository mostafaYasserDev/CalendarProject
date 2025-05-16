import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';

dotenv.config();

const createOwner = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete all existing users
    await User.deleteMany({});
    console.log('All users deleted');

    // Create owner user directly
    const owner = await User.create({
      name: 'General Manager',
      email: 'owner@example.com',
      password: 'owner123', // Will be automatically encrypted by middleware
      role: 'owner'
    });

    // Verify password encryption
    const isMatch = await owner.matchPassword('owner123');
    console.log('Password verification test:', isMatch);

    console.log('Owner created successfully:', {
      name: owner.name,
      email: owner.email,
      role: owner.role
    });

    console.log('\nLogin credentials:');
    console.log('Email:', owner.email);
    console.log('Password: owner123');

    process.exit(0);
  } catch (error) {
    console.error('Error creating owner:', error);
    process.exit(1);
  }
};

createOwner(); 