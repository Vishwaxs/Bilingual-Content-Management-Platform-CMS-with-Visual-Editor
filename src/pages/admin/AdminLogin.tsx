import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '@/hooks/useAuth';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useLogin();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await login(email, password);
    if (ok) navigate('/admin');
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0B1F3A 0%, #122B52 50%, #0B1F3A 100%)' }}>
      {/* Decorative */}
      <div className="absolute inset-0 opacity-[0.03] flex items-center justify-center font-devanagari text-[400px] text-white select-none pointer-events-none">ॐ</div>

      <div className="w-full max-w-md relative z-10">
        {/* Tricolor strip */}
        <div className="h-[3px] rounded-t-xl" style={{ background: 'linear-gradient(90deg, #FF9933 33.33%, #FFFFFF 33.33% 66.66%, #138808 66.66%)' }} />

        <div className="bg-white rounded-b-xl p-8 shadow-[0_24px_64px_rgba(0,0,0,0.4)]">
          {/* Logo area */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[#0B1F3A] to-[#1A3A6B] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-[#FF9933] font-display text-xl font-black">अ</span>
            </div>
            <h1 className="font-display text-xl font-black text-[#0B1F3A]">ABHM UP Admin</h1>
            <p className="text-xs text-gray-500 mt-1">Content Management System</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent outline-none"
                placeholder="admin@abhm-up.org" autoComplete="email" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent outline-none"
                placeholder="••••••••" autoComplete="current-password" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-[#FF6B00] hover:bg-[#E55A00] text-white font-bold py-3 rounded-md transition-all disabled:opacity-50">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            Authorized personnel only
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
