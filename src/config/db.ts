import mongoose from 'mongoose';

// We export this function so server.ts can call it when the app boots up
export async function connectDB(): Promise<void> {
  const mongoURI = process.env.MONGODB_URI;

  // Fail fast: If the URI is missing, crash the app immediately rather than failing silently later
  if (!mongoURI) {
    throw new Error('CRITICAL: MONGODB_URI is missing in your .env file.');
  }

  try {
    // mongoose.connect() establishes the connection pool
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected successfully.');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1); // Kill the server process if the database is unreachable
  }
}