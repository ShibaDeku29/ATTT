export interface User {
  id: string;
  _id?: string;
  username: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: string;
}

export interface Room {
  _id: string;
  name: string;
  description: string;
  createdBy: User;
  members: User[];
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  sender: {
    _id: string;
    id?: string;
    username: string;
  };
  room: string;
  text: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}
