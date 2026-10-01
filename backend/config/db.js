const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart_hospital';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[Database] MongoDB connection error (${uri}): ${error.message}`);
    console.log('[Database] If you do not have a local MongoDB daemon running, set MONGODB_URI to a free MongoDB Atlas connection string in backend/.env');
  }

  mongoose.connection.on('disconnected', () => {
    console.warn('[Database] MongoDB connection lost.');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('[Database] MongoDB reconnected.');
  });
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('[Database] MongoDB connection closed.');
  } catch (err) {
    console.error('[Database] Error closing MongoDB:', err.message);
  }
};

module.exports = { connectDB, disconnectDB };
