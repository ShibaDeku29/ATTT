import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { roomService } from '../services/api';
import { Room } from '../types';
import RoomList from '../components/RoomList';
import { ChatRoom } from './ChatRoom';
import CreateRoomModal from '../components/CreateRoomModal';
import { ThemeSelector } from '../components/ThemeSelector';

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchRooms();
  }, [user, navigate]);

  const fetchRooms = async () => {
    try {
      const response = await roomService.getRooms();
      setRooms(response.data);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoomCreated = () => {
    fetchRooms();
    setShowCreateModal(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-gradient-to-b from-dark-card/80 to-dark-bg/50 border-r border-border/20 backdrop-blur-xl p-4 flex flex-col space-y-4 sticky top-0 md:h-screen">
        {/* Header */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-12 h-12 bg-gradient-to-br from-primary via-secondary to-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-2xl font-bold text-white">💬</span>
          </div>
          <div className="hidden md:block">
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Phòng Chat
            </h1>
            <p className="text-xs text-text-secondary">Realtime</p>
          </div>
        </div>

        {/* New Chat Button */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full px-4 py-3 bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/30 text-white rounded-xl font-semibold transition transform hover:scale-105 flex items-center justify-center gap-2 mt-2"
        >
          <span>✨</span>
          <span className="hidden sm:inline">Chat Mới</span>
          <span className="sm:hidden">Mới</span>
        </button>

        {/* Sections */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Recent Chats */}
          <div>
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider px-2 mb-3">Gần Đây</h3>
            {loading ? (
              <div className="text-center py-4 text-text-secondary text-sm">
                <div className="inline-block animate-spin">⏳</div>
              </div>
            ) : rooms.length === 0 ? (
              <div className="text-center py-6 text-text-secondary text-xs">
                <p>Chưa có phòng chat</p>
              </div>
            ) : (
              <RoomList rooms={rooms} onRoomSelect={setSelectedRoomId} selectedRoomId={selectedRoomId} />
            )}
          </div>
        </div>

        {/* User Profile */}
        <div className="border-t border-border/20 pt-4 space-y-3">
          <div className="flex items-center gap-3 px-2 py-3 rounded-lg hover:bg-dark-bg/50 transition">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white font-bold text-sm">
              {user?.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 hidden sm:block">
              <p className="text-sm font-medium text-text-primary">{user?.username}</p>
              <p className="text-xs text-text-secondary">Hoạt động</p>
            </div>
          </div>

          {/* Theme Selector */}
          <div className="px-2">
            <p className="text-xs font-semibold text-text-secondary uppercase mb-2">Chủ Đề</p>
            <ThemeSelector />
          </div>

          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 text-sm bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition font-medium"
          >
            Đăng Xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-gradient-to-br from-dark-bg/50 via-dark-bg to-dark-bg-darker">
        {selectedRoomId ? (
          <ChatRoom roomId={selectedRoomId} onClose={() => setSelectedRoomId(null)} />
        ) : (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center max-w-md">
              {/* Animated Illustration */}
              <div className="mb-8 relative">
                <div className="w-32 h-32 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-primary/10">
                  <div className="text-7xl animate-bounce">💬</div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-secondary/0 rounded-3xl animate-pulse"></div>
              </div>

              <h3 className="text-3xl font-bold text-text-primary mb-3">
                Bắt Đầu Cuộc Trò Chuyện
              </h3>
              <p className="text-text-secondary text-lg mb-8">
                Kết nối với bạn bè của bạn trong thời gian thực. Chọn một phòng từ thanh bên hoặc tạo một phòng mới.
              </p>

              {/* Quick Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="w-full px-6 py-4 bg-gradient-to-r from-primary to-secondary hover:shadow-xl hover:shadow-primary/40 text-white font-bold rounded-2xl transition transform hover:scale-105"
                >
                  Tạo Phòng Mới
                </button>
                <button
                  onClick={() => {}}
                  className="w-full px-6 py-4 bg-dark-card hover:bg-dark-card/80 text-text-primary font-bold rounded-2xl transition border border-border/30"
                >
                  Duyệt Phòng
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {showCreateModal && (
        <CreateRoomModal
          onClose={() => setShowCreateModal(false)}
          onRoomCreated={handleRoomCreated}
        />
      )}
    </div>
  );
};
