import { Room } from '../types';
import { useNavigate } from 'react-router-dom';

interface RoomListProps {
  rooms: Room[];
}

export default function RoomList({ rooms }: RoomListProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-2">
      {rooms.map((room) => (
        <button
          key={room._id}
          onClick={() => navigate(`/chat/${room._id}`)}
          className="w-full text-left p-3 hover:bg-dark-bg/50 rounded-xl transition group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition"></div>
          <div className="relative flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary/50 to-secondary/50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:shadow-lg group-hover:shadow-primary/30 transition">
              <span className="text-lg font-bold text-white">#</span>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-text-primary group-hover:text-primary transition truncate text-sm">
                {room.name}
              </h3>
              <p className="text-xs text-text-secondary truncate">
                {room.members.length} {room.members.length === 1 ? 'thành viên' : 'thành viên'} {room.isPrivate && '🔒'}
              </p>
            </div>
            <div className="text-lg opacity-0 group-hover:opacity-100 transition">→</div>
          </div>
        </button>
      ))}
    </div>
  );
}
