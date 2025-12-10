# Backend Setup & API Documentation

## Install Dependencies
```bash
npm install
```

## Environment Variables
Create a `.env` file (or use `.env.example`):
```
PORT=4000
MONGODB_URI=mongodb://localhost:27017/realtime-chat
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRE=7d
NODE_ENV=development
```

## Run Server
```bash
npm start          # Production
npm run dev        # Development with auto-reload
```

## API Endpoints

### Auth
- **POST** `/api/auth/register` - Register new user
- **POST** `/api/auth/login` - Login user
- **GET** `/api/auth/profile` - Get user profile (auth required)
- **PUT** `/api/auth/profile` - Update user profile (auth required)
- **GET** `/api/auth/users` - Get all users (auth required)

### Rooms
- **POST** `/api/rooms` - Create a new room (auth required)
- **GET** `/api/rooms` - Get all public rooms (auth required)
- **GET** `/api/rooms/:id` - Get room details (auth required)
- **POST** `/api/rooms/:id/join` - Join a room (auth required)
- **POST** `/api/rooms/:id/leave` - Leave a room (auth required)

### Messages
- **GET** `/api/rooms/:roomId/messages` - Get messages (auth required)
- **POST** `/api/rooms/:roomId/messages` - Send message (auth required)
- **DELETE** `/api/rooms/:roomId/messages/:messageId` - Delete message (auth required)

## Socket.io Events

### Client → Server
- `user:join` - User joins (send userId)
- `room:join` - Join specific room (send roomId)
- `room:leave` - Leave specific room (send roomId)
- `message:send` - Send message (send {roomId, text})
- `user:typing` - Typing indicator (send roomId)
- `user:stopTyping` - Stop typing (send roomId)

### Server → Client
- `user:online` - User status changed (receive {userId, isOnline})
- `message:receive` - New message (receive message object)
- `system` - System message
- `user:typing` - User typing (receive {userId})
- `user:stopTyping` - User stopped typing (receive {userId})

## Database Models

### User
- `username` (String, unique)
- `email` (String, unique)
- `password` (String, hashed)
- `avatar` (String, optional)
- `isOnline` (Boolean)
- `lastSeen` (Date)
- `timestamps`

### Room
- `name` (String, unique)
- `description` (String)
- `createdBy` (ObjectId, ref: User)
- `members` (Array of ObjectId, ref: User)
- `isPrivate` (Boolean)
- `timestamps`

### Message
- `sender` (ObjectId, ref: User)
- `room` (ObjectId, ref: Room)
- `text` (String)
- `attachments` (Array of String)
- `timestamps`

## Notes
- JWT token must be sent as `Bearer <token>` in `Authorization` header
- MongoDB must be running locally or connection string updated
- Change `JWT_SECRET` in production
