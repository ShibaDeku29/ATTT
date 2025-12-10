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
  const [isRecording, setIsRecording] = useState(false);
  const [reactions, setReactions] = useState<{ [key: string]: { [key: string]: number } }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketInitialized = useRef(false);
  const socketRef = useRef<Socket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

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
  }, [roomId, user?.id]);

  // Cleanup socket on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.emit('room:leave', roomId);
        socketRef.current.disconnect();
      }
    };
  }, [roomId]);

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

    newSocket.on('message:reaction', (data: any) => {
      setReactions((prev) => ({
        ...prev,
        [data.messageId]: {
          ...(prev[data.messageId] || {}),
          [data.emoji]: (prev[data.messageId]?.[data.emoji] || 0) + data.count,
        },
      }));
    });

    socketRef.current = newSocket;
    setSocket(newSocket);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    if (!socketRef.current || !socketRef.current.connected) {
      alert('Kết nối mất. Vui lòng làm mới trang');
      return;
    }

    socketRef.current.emit('message:send', { roomId, text: messageText });
    setMessageText('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !socketRef.current || !socketRef.current.connected) {
      alert('Kết nối mất. Vui lòng làm mới trang');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      socketRef.current?.emit('message:send', {
        roomId,
        text: `📄 ${file.name}`,
        fileUrl: event.target?.result,
        fileType: file.type,
      });
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !socketRef.current || !socketRef.current.connected) {
      alert('Kết nối mất. Vui lòng làm mới trang');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      socketRef.current?.emit('message:send', {
        roomId,
        text: `🖼️ Ảnh`,
        imageUrl: event.target?.result,
      });
    };
    reader.readAsDataURL(file);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onload = (event) => {
          if (socketRef.current && socketRef.current.connected) {
            socketRef.current.emit('message:send', {
              roomId,
              text: '🎤 Ghi âm',
              audioUrl: event.target?.result,
            });
          } else {
            alert('Kết nối mất. Vui lòng làm mới trang');
          }
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Lỗi ghi âm:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleReaction = (messageId: string, emoji: string) => {
    if (socket) {
      socket.emit('message:react', { messageId, emoji, roomId });
    }
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
              const messageReactions = reactions[msg._id] || {};
              
              return (
                <div
                  key={msg._id}
                  className={`flex gap-3 animate-fadeIn group ${
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
                    } flex flex-col relative`}
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
                    
                    {/* Message Content */}
                    <div
                      className={`px-4 py-3 rounded-3xl backdrop-blur-sm transition transform hover:scale-105 ${
                        isOwnMessage
                          ? 'bg-gradient-to-r from-success to-success-dark text-white shadow-lg shadow-success/30 rounded-br-none'
                          : 'bg-dark-card border border-border/30 text-text-primary shadow-lg rounded-bl-none hover:border-border/50'
                      }`}
                    >
                      {/* Image */}
                      {(msg as any).imageUrl && (
                        <img src={(msg as any).imageUrl} alt="shared" className="max-w-xs rounded-lg mb-2" />
                      )}
                      
                      {/* Audio */}
                      {(msg as any).audioUrl && (
                        <audio controls className="max-w-xs mb-2">
                          <source src={(msg as any).audioUrl} type="audio/webm" />
                        </audio>
                      )}
                      
                      {/* File */}
                      {(msg as any).fileUrl && (
                        <a
                          href={(msg as any).fileUrl}
                          download
                          className="text-blue-400 hover:underline flex items-center gap-2"
                        >
                          📥 {msg.text}
                        </a>
                      )}
                      
                      <p className="break-words text-sm font-medium">{msg.text}</p>
                    </div>

                    {/* Reactions */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {Object.entries(messageReactions).map(([emoji, count]) => (
                        <button
                          key={emoji}
                          onClick={() => handleReaction(msg._id, emoji)}
                          className="px-2 py-1 bg-dark-card hover:bg-primary/20 rounded-full text-xs transition"
                        >
                          {emoji} {count > 1 ? count : ''}
                        </button>
                      ))}
                      <button
                        onClick={() => setReactions({ ...reactions, [msg._id]: { ...messageReactions } })}
                        className="opacity-0 group-hover:opacity-100 px-2 py-1 bg-dark-card hover:bg-primary/20 rounded-full text-xs transition"
                        title="Thêm reaction"
                      >
                        😊
                      </button>
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
          <form onSubmit={handleSendMessage} className="flex gap-3 items-end flex-wrap">
            <div className="flex-1 min-w-[200px] relative group">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Nói điều gì đó tốt đẹp..."
                className="w-full px-5 py-3 bg-dark-bg/60 border border-border/30 rounded-full text-text-primary placeholder-text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition shadow-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-secondary/5 rounded-full opacity-0 group-focus-within:opacity-100 transition pointer-events-none"></div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {/* Image Upload */}
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="p-3 bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 rounded-full transition flex items-center justify-center w-11 h-11 transform hover:scale-110"
                title="Gửi ảnh"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                </svg>
              </button>

              {/* File Upload */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3 bg-purple-500/20 hover:bg-purple-500/40 text-purple-400 rounded-full transition flex items-center justify-center w-11 h-11 transform hover:scale-110"
                title="Gửi file"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                </svg>
              </button>

              {/* Voice Record */}
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`p-3 rounded-full transition flex items-center justify-center w-11 h-11 transform hover:scale-110 ${
                  isRecording
                    ? 'bg-red-500/40 text-red-400 animate-pulse'
                    : 'bg-orange-500/20 hover:bg-orange-500/40 text-orange-400'
                }`}
                title={isRecording ? 'Dừng ghi' : 'Bắt đầu ghi âm'}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 16a6 6 0 100-12 6 6 0 000 12zM9 11H7v2H5v-2H3v-2h2V7h2v2h2v2z" />
                </svg>
              </button>

              {/* Send Message */}
              <button
                type="submit"
                disabled={!messageText.trim()}
                className="p-3 bg-gradient-to-r from-primary to-secondary hover:shadow-xl hover:shadow-primary/40 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full transition flex items-center justify-center w-11 h-11 transform hover:scale-110 active:scale-95"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5.951-1.429 5.951 1.429a1 1 0 001.169-1.409l-7-14z" />
                </svg>
              </button>
            </div>
          </form>

          {/* Hidden File Inputs */}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            accept="*/*"
          />
          <input
            ref={imageInputRef}
            type="file"
            onChange={handleImageUpload}
            className="hidden"
            accept="image/*"
          />
        </div>
      </div>
    </div>
  );
};
