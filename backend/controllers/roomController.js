import Room from '../models/Room.js';
import { validationResult } from 'express-validator';

export const createRoom = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, isPrivate } = req.body;
    
    let room = await Room.findOne({ name });
    if (room) {
      return res.status(400).json({ error: 'Room already exists' });
    }

    room = await Room.create({
      name,
      description,
      isPrivate: isPrivate || false,
      createdBy: { _id: req.userId, username: 'user' },
      members: [req.userId]
    });

    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getRooms = async (req, res) => {
  try {
    // Get all public rooms + private rooms user is member of
    const allRooms = await Room.find({});
    const userRooms = allRooms.filter(room => {
      if (!room.isPrivate) return true;
      return room.members.includes(req.userId);
    });
    res.json(userRooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const joinRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (!room.members.includes(req.userId)) {
      room.members.push(req.userId);
      await Room.findByIdAndUpdate(room._id, { members: room.members }, { new: true });
    }

    res.json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const leaveRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    room.members = room.members.filter(m => m !== req.userId);
    await Room.findByIdAndUpdate(room._id, { members: room.members }, { new: true });

    res.json({ message: 'Left room successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
