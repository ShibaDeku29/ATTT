import http from 'http';
import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { mockDB } from './config/mockDB.js';
import authRoutes from './routes/auth.js';
import roomRoutes from './routes/rooms.js';
import messageRoutes from './routes/messages.js';
import errorHandler from './middleware/errorHandler.js';
import Message from './models/Message.js';
import User from './models/User.js';

dotenv.config();

// Initialize mock database
mockDB.clear();
mockDB.seed();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 4000;

// Connect to Database (or use mock)
// connectDB(); // Comment out for mock testing
console.log('Using Mock Database for testing');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/rooms/:roomId/messages', messageRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Realtime chat server is running' });
});

// Socket.io connection
const userSockets = new Map(); // Map userId -> socketId

io.on('connection', (socket) => {
  console.log(`New connection: ${socket.id}`);

  // User join
  socket.on('user:join', async (userId) => {
    userSockets.set(userId, socket.id);
    socket.data.userId = userId;
    
    // Update user online status
    await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: new Date() });
    
    socket.broadcast.emit('user:online', { userId, isOnline: true });
    console.log(`User ${userId} joined`);
  });

  // Join room
  socket.on('room:join', (roomId) => {
    socket.join(roomId);
    socket.broadcast.to(roomId).emit('system', { type: 'join', message: `User joined` });
  });

  // Leave room
  socket.on('room:leave', (roomId) => {
    socket.leave(roomId);
    socket.broadcast.to(roomId).emit('system', { type: 'leave', message: `User left` });
  });

  // Send message
  socket.on('message:send', async (data) => {
    try {
      const { roomId, text, imageUrl, audioUrl, fileUrl, fileType } = data;
      
      const message = await Message.create({
        sender: { _id: socket.data.userId, username: 'user' },
        room: roomId,
        text: text.trim(),
        imageUrl: imageUrl || undefined,
        audioUrl: audioUrl || undefined,
        fileUrl: fileUrl || undefined,
        fileType: fileType || undefined,
      });

      console.log(`Message from ${socket.data.userId}: ${text} in room ${roomId}`);
      io.to(roomId).emit('message:receive', message);
    } catch (error) {
      console.error('Message error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // React to message
  socket.on('message:react', async (data) => {
    try {
      const { messageId, emoji, roomId } = data;
      console.log(`Reaction: ${emoji} on message ${messageId} in room ${roomId}`);
      io.to(roomId).emit('message:react', { messageId, emoji, count: 1 });
    } catch (error) {
      console.error('Reaction error:', error);
    }
  });

  // User typing
  socket.on('user:typing', (roomId) => {
    socket.broadcast.to(roomId).emit('user:typing', { userId: socket.data.userId });
  });

  // User stop typing
  socket.on('user:stopTyping', (roomId) => {
    socket.broadcast.to(roomId).emit('user:stopTyping', { userId: socket.data.userId });
  });

  // Disconnect
  socket.on('disconnect', async () => {
    if (socket.data.userId) {
      await User.findByIdAndUpdate(socket.data.userId, { isOnline: false, lastSeen: new Date().toISOString() });
      userSockets.delete(socket.data.userId);
      io.emit('user:online', { userId: socket.data.userId, isOnline: false });
      console.log(`User ${socket.data.userId} disconnected`);
    }
  });
});

// Error handling middleware
app.use(errorHandler);

server.listen(PORT, () => {
  console.log(`Realtime chat server listening on port ${PORT}`);
});
