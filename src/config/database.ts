import mongoose from 'mongoose';

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
    });

    console.log('MongoDB connected');
  } catch (error: any) {
    if (error.code === 'ECONNREFUSED' || error.syscall === 'querySrv') {
      console.error('MongoDB connection failed: Network/DNS issue');
      console.error('Action required: Check MongoDB Atlas IP whitelist or network connection');
    } else {
      console.error('MongoDB connection failed:', error.message);
    }
  }
};
