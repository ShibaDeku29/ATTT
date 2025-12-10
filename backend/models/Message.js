import { mockDB } from '../config/mockDB.js';

export default {
  find: (query = {}) => mockDB.messages.find(query),
  countDocuments: (query = {}) => mockDB.messages.countDocuments(query),
  create: (msgData) => mockDB.messages.create(msgData),
  findById: (id) => mockDB.messages.findById(id),
  findByIdAndDelete: (id) => mockDB.messages.findByIdAndDelete(id),
};
