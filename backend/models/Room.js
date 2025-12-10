import { mockDB } from '../config/mockDB.js';

export default {
  findOne: (query) => mockDB.rooms.findOne(query),
  find: (query = {}) => mockDB.rooms.find(query),
  create: (roomData) => mockDB.rooms.create(roomData),
  findById: (id) => mockDB.rooms.findById(id),
  findByIdAndUpdate: (id, updates) => mockDB.rooms.findByIdAndUpdate(id, updates),
};
