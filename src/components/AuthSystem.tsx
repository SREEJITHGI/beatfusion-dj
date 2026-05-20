import React, { useState } from 'react';
import { Mail, Lock, User, Globe, LogIn, UserPlus } from 'lucide-react';

interface AuthSystemProps {
  onLoginSuccess: (user: { name: string; role: 'DJ' | 'Listener' | 'Admin'; email: string }) => void;
}

export const AuthSystem: React.FC<AuthSystemProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'DJ' | 'Listener' | 'Admin'>('DJ');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [forgotPassword, setForgotPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    setTimeout(() => {
      setLoading(false);
      if (forgotPassword) {
        setMessage('A reset link has been transmitted to your neural network email.');
        return;
      }

      if (isLogin) {
        if (!email || !password) {
          setMessage('Error: Missing grid credentials.');
          return;
        }
        onLoginSuccess({
          name: email.split('@')[0].toUpperCase(),
          role,
          email
        });
      } else {
        if (!email || !password || !name) {
          setMessage('Error: Form is incomplete.');
          return;
        }
        onLoginSuccess({
          name: name.toUpperCase(),
          role,
          email
        });
      }
    }, 1200);
  };

  const handleGoogleAuth = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess({
        name: 'CYBER_USER',
        role,
        email: 'cyber_user@fusion.net'
      });
    }, 1000);
  };

  if (forgotPassword) {
    return (
      <div className="w-full max-w-md p-8 glass-panel border-cyber-purple/30 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyber-purple to-transparent animate-pulse-glow" />
        <h2 className="font-display text-2xl text-center font-bold text-white tracking-widest mb-2 text-glow-purple">
          RESET CREDENTIALS
        </h2>
        <p className="text-gray-400 text-xs text-center mb-6">Enter your node address to recover access</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-tech text-gray-400 uppercase tracking-widest mb-1.5">Node Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-cyber-cyan" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-cyber-dark/80 border border-white/10 rounded-lg text-white font-tech placeholder-gray-600 focus:outline-none focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan text-sm"
                placeholder="user@grid.com"
                required
              />
            </div>
          </div>

          {message && (
            <div className="p-3 bg-cyber-purple/10 border border-cyber-purple/30 rounded-lg text-cyber-cyan text-xs text-center">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-cyber-purple to-cyber-pink hover:from-cyber-pink hover:to-cyber-purple text-white font-display font-bold tracking-widest text-sm rounded-lg transition-all shadow-neon-pink hover:scale-[1.02] disabled:opacity-50"
          >
            {loading ? 'TRANSMITTING...' : 'SEND INSTRUCTIONS'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => { setForgotPassword(false); setMessage(''); }}
            className="text-xs font-tech text-cyber-cyan hover:underline hover:text-white uppercase tracking-widest"
          >
            Back to Grid Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md p-8 glass-panel border-white/10 rounded-2xl relative overflow-hidden shadow-2xl">
      {/* Laser line effect */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyber-cyan to-transparent animate-pulse-glow" />
      
      <div className="text-center mb-6">
        <h2 className="font-display text-3xl font-extrabold tracking-widest text-white text-glow-cyan mb-1">
          {isLogin ? 'GRID LOGIN' : 'CREATE CORE ID'}
        </h2>
        <p className="text-gray-400 text-xs uppercase tracking-wider font-tech">
          {isLogin ? 'Establish terminal connection' : 'Register identity on the blockchain'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Role Selector */}
        <div>
          <label className="block text-xs font-tech text-gray-400 uppercase tracking-widest mb-2 text-center">
            Select Node Access Level
          </label>
          <div className="grid grid-cols-3 gap-2 p-1 bg-cyber-dark/80 border border-white/5 rounded-lg">
            {(['DJ', 'Listener', 'Admin'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`py-1.5 text-xs font-tech font-bold uppercase rounded transition-all ${
                  role === r
                    ? 'bg-cyber-purple text-white shadow-neon-purple'
                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Input Fields */}
        {!isLogin && (
          <div>
            <label className="block text-xs font-tech text-gray-400 uppercase tracking-widest mb-1">Alias Name</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 w-4 h-4 text-cyber-purple" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-cyber-dark/80 border border-white/10 rounded-lg text-white font-tech placeholder-gray-600 focus:outline-none focus:border-cyber-purple focus:ring-1 focus:ring-cyber-purple text-sm"
                placeholder="CYBER_DJ_99"
                required
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-tech text-gray-400 uppercase tracking-widest mb-1">Grid Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 w-4 h-4 text-cyber-cyan" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-cyber-dark/80 border border-white/10 rounded-lg text-white font-tech placeholder-gray-600 focus:outline-none focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan text-sm"
              placeholder="operator@nexus.net"
              required
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-tech text-gray-400 uppercase tracking-widest">Access Key</label>
            {isLogin && (
              <button
                type="button"
                onClick={() => setForgotPassword(true)}
                className="text-[10px] font-tech text-cyber-pink hover:underline uppercase tracking-wider"
              >
                Key Lost?
              </button>
            )}
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 w-4 h-4 text-cyber-pink" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-cyber-dark/80 border border-white/10 rounded-lg text-white font-tech placeholder-gray-600 focus:outline-none focus:border-cyber-pink focus:ring-1 focus:ring-cyber-pink text-sm"
              placeholder="••••••••••••"
              required
            />
          </div>
        </div>

        {message && (
          <div className="p-3 bg-cyber-pink/10 border border-cyber-pink/30 rounded-lg text-cyber-pink text-xs text-center">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-gradient-to-r from-cyber-cyan via-cyber-purple to-cyber-pink hover:brightness-110 text-white font-display font-bold tracking-widest text-sm rounded-lg transition-all shadow-neon-cyan hover:scale-[1.02] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
        >
          {isLogin ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          {loading ? 'ESTABLISHING HANDSHAKE...' : isLogin ? 'INITIATE CONNECTION' : 'GENERATE BLOCK ID'}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-6 flex items-center justify-center">
        <div className="w-full border-t border-white/5" />
        <span className="absolute px-3 bg-cyber-deep text-[10px] font-tech text-gray-500 uppercase tracking-widest">
          or connect via matrix
        </span>
      </div>

      {/* Google Auth Button */}
      <button
        onClick={handleGoogleAuth}
        disabled={loading}
        className="w-full py-2 bg-cyber-dark border border-white/10 hover:bg-white/5 hover:border-cyber-cyan/50 text-white font-tech text-xs uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2"
      >
        <Globe className="w-4 h-4 text-cyber-cyan" />
        Sync Google Core ID
      </button>

      {/* Form Toggle */}
      <div className="mt-6 text-center">
        <button
          onClick={() => { setIsLogin(!isLogin); setMessage(''); }}
          className="text-xs font-tech text-cyber-pink hover:underline uppercase tracking-widest"
        >
          {isLogin ? 'Need Core registration?' : 'Already registered in the network?'}
        </button>
      </div>
    </div>
  );
};
