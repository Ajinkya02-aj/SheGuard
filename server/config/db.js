const mongoose = require('mongoose');

let mongodInstance = null;

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (uri && uri.trim() !== '') {
    try {
      console.log('Connecting to specified MongoDB URI...');
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log('MongoDB connected successfully to provided URI');
      return;
    } catch (err) {
      console.warn('Failed to connect to provided MONGODB_URI:', err.message);
      console.log('Attempting embedded MongoDB fallback...');
    }
  }

  // Fallback: Start MongoMemoryServer for development/testing without external MongoDB service
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    console.log('Starting embedded MongoDB Memory Server...');
    mongodInstance = await MongoMemoryServer.create();
    const memoryUri = mongodInstance.getUri();
    await mongoose.connect(memoryUri);
    console.log(`Connected to embedded MongoDB Memory Server at: ${memoryUri}`);
  } catch (memErr) {
    console.error('CRITICAL: Unable to start embedded MongoMemoryServer:', memErr.message);
    throw memErr;
  }
}

async function closeDB() {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
}

module.exports = { connectDB, closeDB };
