const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/automart';
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000
  });
  console.log('MongoDB connected:', mongoose.connection.name);
  return mongoose.connection;
}

async function disconnectDB() {
  await mongoose.disconnect();
  console.log('MongoDB disconnected');
}

module.exports = { connectDB, disconnectDB };