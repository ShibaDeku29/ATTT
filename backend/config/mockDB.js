// Mock Database - In-memory storage
let users = [];
let rooms = [];
let messages = [];

let userIdCounter = 1;
let roomIdCounter = 1;
let messageIdCounter = 1;

export const mockDB = {
  // User operations
  users: {
    findOne: (query) => {
      if (query.$or) {
        return users.find(u => query.$or.some(q => {
          if (q.username) return u.username === q.username;
          if (q.email) return u.email === q.email;
          return false;
        }));
      }
      if (query.email) return users.find(u => u.email === query.email);
      if (query._id) return users.find(u => u._id === query._id);
      return null;
    },
    find: () => users,
    create: (userData) => {
      const user = {
        _id: String(userIdCounter++),
        ...userData,
        timestamps: new Date(),
      };
      users.push(user);
      return user;
    },
    findByIdAndUpdate: (_id, updates) => {
      const user = users.find(u => u._id === _id);
      if (user) {
        Object.assign(user, updates);
      }
      return user;
    },
  },

  // Room operations
  rooms: {
    findOne: (query) => {
      if (query.name) return rooms.find(r => r.name === query.name);
      if (query._id) return rooms.find(r => r._id === query._id);
      return null;
    },
    find: (query = {}) => {
      if (query.isPrivate === false) {
        return rooms.filter(r => !r.isPrivate);
      }
      return rooms;
    },
    create: (roomData) => {
      const room = {
        _id: String(roomIdCounter++),
        ...roomData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      rooms.push(room);
      return room;
    },
    findByIdAndUpdate: (_id, updates) => {
      const room = rooms.find(r => r._id === _id);
      if (room) {
        Object.assign(room, updates, { updatedAt: new Date().toISOString() });
      }
      return room;
    },
    findById: (_id) => rooms.find(r => r._id === _id),
  },

  // Message operations
  messages: {
    find: (query = {}) => {
      let result = messages;
      if (query.room) {
        result = result.filter(m => m.room === query.room);
      }
      return result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    },
    countDocuments: (query = {}) => {
      let result = messages;
      if (query.room) {
        result = result.filter(m => m.room === query.room);
      }
      return result.length;
    },
    create: (msgData) => {
      const msg = {
        _id: String(messageIdCounter++),
        ...msgData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      messages.push(msg);
      return msg;
    },
    findById: (_id) => messages.find(m => m._id === _id),
    findByIdAndDelete: (_id) => {
      const idx = messages.findIndex(m => m._id === _id);
      if (idx !== -1) {
        messages.splice(idx, 1);
        return true;
      }
      return false;
    },
  },

  // Seed data
  seed: () => {
    users = [
      {
        _id: '1',
        username: 'alice',
        email: 'alice@test.com',
        password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/KFm', // hashed 'password'
        isOnline: true,
        lastSeen: new Date().toISOString(),
      },
      {
        _id: '2',
        username: 'bob',
        email: 'bob@test.com',
        password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/KFm',
        isOnline: false,
        lastSeen: new Date().toISOString(),
      },
    ];
    userIdCounter = 3;

    rooms = [
      {
        _id: '1',
        name: 'General',
        description: 'General discussion room',
        createdBy: { _id: '1', username: 'alice' },
        members: ['1', '2'],
        isPrivate: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: '2',
        name: 'Random',
        description: 'Random chat',
        createdBy: { _id: '2', username: 'bob' },
        members: ['1', '2'],
        isPrivate: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    roomIdCounter = 3;

    messages = [
      {
        _id: '1',
        sender: { _id: '1', username: 'alice' },
        room: '1',
        text: 'Hello everyone!',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    messageIdCounter = 2;
  },

  // Clear data
  clear: () => {
    users = [];
    rooms = [];
    messages = [];
    userIdCounter = 1;
    roomIdCounter = 1;
    messageIdCounter = 1;
  },
};
