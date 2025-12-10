import { useState } from 'react';
import { roomService } from '../services/api';

interface CreateRoomModalProps {
  onClose: () => void;
  onRoomCreated: () => void;
}

export default function CreateRoomModal({ onClose, onRoomCreated }: CreateRoomModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Tên phòng là bắt buộc');
      return;
    }

    setLoading(true);
    try {
      await roomService.createRoom(name, description, isPrivate);
      onRoomCreated();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Không thể tạo phòng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-dark-card border border-border/30 rounded-3xl p-8 w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <span className="text-xl">✨</span>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Tạo Phòng Mới
          </h2>
          <p className="text-text-secondary text-sm mt-1">Bắt đầu một cuộc trò chuyện mới</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-danger/10 border border-danger/30 rounded-xl text-danger text-sm font-medium animate-slideInLeft">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Room Name */}
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-3">
              Tên Phòng
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="vd: Bàn Luận Chung"
              className="w-full px-4 py-3 bg-dark-bg/50 border border-border/30 rounded-xl text-text-primary placeholder-text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-3">
              Mô Tả
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả phòng (tùy chọn)"
              rows={4}
              className="w-full px-4 py-3 bg-dark-bg/50 border border-border/30 rounded-xl text-text-primary placeholder-text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition resize-none"
            />
          </div>

          {/* Private Checkbox */}
          <div className="flex items-center gap-3 p-3 bg-dark-bg/30 rounded-xl">
            <input
              type="checkbox"
              id="isPrivate"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="w-5 h-5 rounded accent-primary cursor-pointer"
            />
            <label htmlFor="isPrivate" className="text-sm font-medium text-text-primary cursor-pointer flex-1">
              Làm cho phòng này riêng tư
            </label>
            <span className="text-lg">{isPrivate ? '🔒' : '🌐'}</span>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-dark-bg/50 hover:bg-dark-bg border border-border/30 text-text-primary rounded-xl transition font-semibold"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/40 disabled:opacity-50 text-white rounded-xl transition font-semibold transform hover:scale-105 active:scale-95"
            >
              {loading ? '🔄 Đang tạo...' : '✨ Tạo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

