import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { theme } from '../../lib/theme';
import { GlitchText } from '../../components/ui/Shared';
import { Lock } from 'lucide-react';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (localStorage.getItem('admin_auth') === 'true') {
      // Fix: navigate to /dashboard instead of /admin/dashboard to match AdminApp routes
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Use client-side validation with environment variables
      const envUser = import.meta.env.VITE_ADMIN_USER;
      const envPass = import.meta.env.VITE_ADMIN_PASS;

      // Simulate network delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));

      if (username === envUser && password === envPass) {
        localStorage.setItem('admin_auth', 'true');
        // Fix: navigate to /dashboard
        navigate('/dashboard');
      } else {
        setError('ACCESS DENIED: INVALID CREDENTIALS');
        setPassword('');
      }
    } catch (err) {
      setError('ACCESS DENIED: UNKNOWN ERROR');
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${theme.bg}`}>
      <div className="w-full max-w-md p-8 border border-cyan-900/50 bg-[#131b2e] rounded-xl shadow-[0_0_50px_rgba(6,182,212,0.1)]">
        <div className="text-center mb-8">
          <GlitchText text="ADMIN ACCESS" size="text-3xl" />
          <p className="text-slate-500 text-sm font-oxanium mt-2 tracking-widest">RESTRICTED AREA</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs text-cyan-500 font-oxanium mb-2 tracking-widest">IDENTIFICATION</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700 text-white p-3 rounded focus:border-cyan-500 outline-none transition-colors"
              placeholder="Username"
            />
          </div>

          <div>
            <label className="block text-xs text-cyan-500 font-oxanium mb-2 tracking-widest">SECURITY KEY</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700 text-white p-3 rounded focus:border-cyan-500 outline-none transition-colors"
              placeholder="Password"
            />
          </div>

          {error && (
            <div className="text-red-500 text-xs font-oxanium text-center animate-pulse border border-red-900/50 p-2 bg-red-900/10 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-cyan-900/20 border border-cyan-500 text-cyan-400 font-orbitron font-bold rounded hover:bg-cyan-500 hover:text-black transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Lock size={16} /> {isLoading ? 'AUTHENTICATING...' : 'AUTHENTICATE'}
          </button>
        </form>
      </div>
    </div>
  );
}
