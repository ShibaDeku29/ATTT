import mongoose from 'mongoose';
import User from '../models/User.js';
import Room from '../models/Room.js';
import Message from '../models/Message.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
    
    // Create collections and indexes
    await createCollections();
    
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

const createCollections = async () => {
  try {
    const db = mongoose.connection.db;
    
    // Create collections if they don't exist
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    if (!collectionNames.includes('users')) {
      await db.createCollection('users');
      console.log('✓ Created users collection');
    }
    
    if (!collectionNames.includes('rooms')) {
      await db.createCollection('rooms');
      console.log('✓ Created rooms collection');
    }
    
    if (!collectionNames.includes('messages')) {
      await db.createCollection('messages');
      console.log('✓ Created messages collection');
    }
    
    // Create indexes with error handling
    try {
      await db.collection('users').createIndex({ email: 1 }, { unique: true });
      await db.collection('rooms').createIndex({ createdAt: -1 });
      await db.collection('messages').createIndex({ room: 1, createdAt: -1 });
      console.log('✓ Indexes created successfully');
    } catch (indexError) {
      console.log('ℹ Indexes already exist or could not be created:', indexError.message);
    }
  } catch (error) {
    console.error('Error creating collections:', error.message);
  }
};

export default connectDB;
