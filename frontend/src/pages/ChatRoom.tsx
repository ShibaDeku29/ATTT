import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { messageService, roomService } from '../services/api';
import { Message, Room } from '../types';

type ChatRoomProps = { roomId?: string; onClose?: () => void };

export const ChatRoom: React.FC<ChatRoomProps> = ({ roomId: propRoomId, onClose }) => {
  const params = useParams<{ roomId: string }>();
  const activeRoomId = propRoomId ?? params.roomId;
  const navigate = useNavigate();
  const { user } = useAuth();

  const [room, setRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const socketInitialized = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user || !activeRoomId) {
      console.log('Missing user or roomId, user:', user?.id, 'roomId:', activeRoomId);
      if (onClose) onClose();
      else navigate('/dashboard');
      return;
    }
    // Reset initialization flag when room changes
    socketInitialized.current = false;
    console.log('Fetching room and messages for:', activeRoomId);
    fetchRoomAndMessages();
    initializeSocket();
  }, [activeRoomId, user?.id, navigate, onClose]);

  useEffect(() => {
    return () => {
      if (socket) {
        console.log('Disconnecting from room:', activeRoomId);
        socket.emit('room:leave', activeRoomId);
      }
    };
  }, [socket, activeRoomId]);

  const fetchRoomAndMessages = async () => {
    try {
      console.log('Fetching room with ID:', activeRoomId);
      const roomRes = await roomService.getRoomById(activeRoomId!);
      console.log('Room response:', roomRes);
      setRoom(roomRes.data);
      
      const messagesRes = await messageService.getMessages(activeRoomId!, 50);
      console.log('Messages response:', messagesRes);
      const msgs = Array.isArray(messagesRes.data) ? messagesRes.data : (messagesRes.data.messages || []);
      setMessages(msgs);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setLoading(false);
    }
  };

  const initializeSocket = () => {
    const newSocket = io('http://localhost:4000', { reconnection: true });
    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      newSocket.emit('user:join', user?.id);
      newSocket.emit('room:join', activeRoomId);
    });
    newSocket.on('message:receive', (message: Message) => {
      console.log('Received message:', message);
      setMessages((prev) => {
        // Prevent duplicates by checking if message already exists
        if (prev.some(m => m._id === message._id)) {
          return prev;
        }
        return [...prev, message];
      });
    });
    newSocket.on('system', (msg: any) => console.log('System:', msg));
    setSocket(newSocket);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !socket) return;
    socket.emit('message:send', { roomId: activeRoomId, text: messageText });
    setMessageText('');
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-text-secondary">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-dark-bg">
      <header className="bg-gradient-to-r from-dark-card/60 to-dark-card/40 border-b border-border/20 px-6 py-4 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => (onClose ? onClose() : navigate('/dashboard'))}
              className="p-2 hover:bg-dark-card/40 rounded-lg text-text-secondary hover:text-primary transition"
            >
              ←
            </button>
            <div>
              <h1 className="text-xl font-bold text-text-primary">{room?.name}</h1>
              <p className="text-xs text-text-secondary">{room?.members?.length || 0} thành viên</p>
            </div>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary">{messages.length} tin nhắn</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-text-secondary">Chưa có tin nhắn. Bắt đầu cuộc trò chuyện!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.sender._id === user?.id || msg.sender.id === user?.id;
              return (
                <div key={msg._id} className={`flex gap-3 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  {!isOwn && (
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">
                      {msg.sender.username?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div className={`max-w-xs ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                    {!isOwn && <p className="text-xs text-primary font-semibold mb-1">{msg.sender.username}</p>}
                    <div
                      className={`px-4 py-2 rounded-lg ${
                        isOwn ? 'bg-primary text-white rounded-br-none' : 'bg-dark-card border border-border/30 text-text-primary rounded-bl-none'
                      }`}
                    >
                      <p className="text-sm break-words">{msg.text}</p>
                    </div>
                    <p className="text-xs text-text-secondary mt-1">{new Date(msg.createdAt).toLocaleTimeString()}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-border/20 bg-dark-card/40 px-6 py-4 sticky bottom-0">
        <form onSubmit={handleSendMessage} className="flex gap-3 max-w-4xl mx-auto">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="flex-1 px-4 py-2 bg-dark-bg border border-border/30 rounded-lg text-text-primary placeholder-text-secondary focus:border-primary focus:outline-none"
          />
          <button
            type="submit"
            disabled={!messageText.trim()}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Gửi
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatRoom;
