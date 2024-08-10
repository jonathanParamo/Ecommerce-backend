import mongoose from 'mongoose';

export async function connect() {
  const MongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/usuariosdb';

  try {
    await mongoose.connect(MongoURI);

    console.log('Connection established successfully');
  } catch (error) {
    console.error('Connection error:', error.message);
    process.exit(1);
  }
}
