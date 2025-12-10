import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (username.length < 3) {
      setError('Tên người dùng phải có ít nhất 3 ký tự');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setIsLoading(true);

    try {
      await register(username, email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Đăng ký thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg to-dark-bg-darker flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-dark-card border border-border rounded-2xl p-8 backdrop-blur-lg shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
              💬 Chat Room
            </h1>
            <p className="text-text-secondary">Tạo tài khoản của bạn</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-danger/10 border border-danger rounded-lg text-danger text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Tên người dùng
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Chọn tên người dùng"
                className="w-full px-4 py-3 bg-dark-bg/50 border border-border rounded-lg text-text-primary placeholder-text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email của bạn"
                className="w-full px-4 py-3 bg-dark-bg/50 border border-border rounded-lg text-text-primary placeholder-text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Mật khẩu
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ít nhất 6 ký tự"
                className="w-full px-4 py-3 bg-dark-bg/50 border border-border rounded-lg text-text-primary placeholder-text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-primary to-primary-dark hover:shadow-xl hover:shadow-primary/40 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition transform hover:scale-105 duration-200"
            >
              {isLoading ? 'Đang tạo tài khoản...' : 'Tạo Tài Khoản'}
            </button>
          </form>

          <p className="mt-6 text-center text-text-secondary text-sm">
            Đã có tài khoản?{' '}
            <a
              href="/login"
              className="text-primary hover:text-primary-dark font-semibold transition"
            >
              Đăng Nhập
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
