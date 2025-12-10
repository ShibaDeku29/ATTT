import bcryptjs from 'bcryptjs';
import { mockDB } from '../config/mockDB.js';

export default {
  findOne: (query) => mockDB.users.findOne(query),
  find: (query = {}) => mockDB.users.find(query),
  create: async (userData) => {
    if (mockDB.users.findOne({ $or: [{ username: userData.username }, { email: userData.email }] })) {
      throw new Error('User already exists');
    }
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(userData.password, salt);
    return mockDB.users.create({ ...userData, password: hashedPassword });
  },
  findByIdAndUpdate: (id, updates) => mockDB.users.findByIdAndUpdate(id, updates),
  findById: (id) => mockDB.users.findOne({ _id: id }),
};
