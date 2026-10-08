import mongoose from 'mongoose';

export const connectDatabase = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) return false;

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  return true;
};

export const isDatabaseConnected = () => mongoose.connection.readyState === 1;
