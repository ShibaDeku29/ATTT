import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { messageService, roomService } from '../services/api';
import { Message, Room } from '../types';

interface ChatViewProps {
  roomId: string;
  onClose: () => void;
}

export const ChatView = ({ roomId, onClose }: ChatViewProps) => {
  const { user } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketInitialized = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user || !roomId) {
      return;
    }

    if (socketInitialized.current) return;
    socketInitialized.current = true;

    fetchRoomAndMessages();
    initializeSocket();

    return () => {
      socketInitialized.current = false;
    };
  }, [roomId, user?.id]);

  // Cleanup socket on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.emit('room:leave', roomId);
        socket.disconnect();
      }
    };
  }, [socket, roomId]);

  const fetchRoomAndMessages = async () => {
    try {
      const [roomRes, messagesRes] = await Promise.all([
        roomService.getRoomById(roomId),
        messageService.getMessages(roomId, 50),
      ]);
      setRoom(roomRes.data);
      setMessages(messagesRes.data.messages || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setLoading(false);
    }
  };

  const initializeSocket = () => {
    const newSocket = io('http://localhost:4000', {
      reconnection: true,
    });

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      newSocket.emit('user:join', user?.id);
      newSocket.emit('room:join', roomId);
    });

    newSocket.on('message:receive', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    setSocket(newSocket);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !socket) return;

    socket.emit('message:send', { roomId, text: messageText });
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
    <div className="flex-1 flex flex-col bg-gradient-to-br from-dark-bg via-dark-bg-darker to-dark-bg">
      {/* Header */}
      <header className="bg-gradient-to-r from-dark-card/60 to-dark-card/40 border-b border-border/20 backdrop-blur-xl px-6 py-5 sticky top-0 z-20 shadow-lg shadow-dark-bg/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-primary transition p-2 hover:bg-dark-bg/50 rounded-lg transform hover:scale-110"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                #{room?.name}
              </h1>
              <p className="text-xs text-text-secondary mt-1">
                🟢 {room?.members.length} thành viên hoạt động
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="max-w-4xl mx-auto w-full">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full py-12">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/10">
                  <span className="text-6xl animate-bounce">💬</span>
                </div>
                <p className="text-text-secondary text-lg">Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwnMessage = msg.sender._id === user?.id || msg.sender.id === user?.id;
              return (
                <div
                  key={msg._id}
                  className={`flex gap-3 animate-fadeIn ${
                    isOwnMessage ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {!isOwnMessage && (
                    <div className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold shadow-lg">
                      {msg.sender.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <div
                    className={`max-w-md ${
                      isOwnMessage ? 'items-end' : 'items-start'
                    } flex flex-col`}
                  >
                    {!isOwnMessage && (
                      <p className="text-xs font-bold text-primary mb-2 px-1">
                        {msg.sender.username}
                      </p>
                    )}
                    {isOwnMessage && (
                      <p className="text-xs font-bold text-success mb-2 px-1 text-right">
                        Bạn
                      </p>
                    )}
                    <div
                      className={`px-4 py-3 rounded-3xl backdrop-blur-sm transition transform hover:scale-105 ${
                        isOwnMessage
                          ? 'bg-gradient-to-r from-success to-success-dark text-white shadow-lg shadow-success/30 rounded-br-none'
                          : 'bg-dark-card border border-border/30 text-text-primary shadow-lg rounded-bl-none hover:border-border/50'
                      }`}
                    >
                      <p className="break-words text-sm font-medium">{msg.text}</p>
                    </div>
                    <p className={`text-xs text-text-secondary mt-2 px-1 ${
                      isOwnMessage ? 'text-right' : 'text-left'
                    }`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                  {isOwnMessage && (
                    <div className="w-9 h-9 bg-gradient-to-br from-success to-success-dark rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold shadow-lg">
                      {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-gradient-to-t from-dark-card/60 to-dark-card/30 border-t border-border/20 backdrop-blur-xl p-6">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSendMessage} className="flex gap-3 items-end">
            <div className="flex-1 relative group">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Nói điều gì đó tốt đẹp..."
                className="w-full px-5 py-3 bg-dark-bg/60 border border-border/30 rounded-full text-text-primary placeholder-text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition shadow-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-secondary/5 rounded-full opacity-0 group-focus-within:opacity-100 transition pointer-events-none"></div>
            </div>
            <button
              type="submit"
              disabled={!messageText.trim()}
              className="p-3 bg-gradient-to-r from-primary to-secondary hover:shadow-xl hover:shadow-primary/40 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full transition flex items-center justify-center w-11 h-11 transform hover:scale-110 active:scale-95"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5.951-1.429 5.951 1.429a1 1 0 001.169-1.409l-7-14z" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
