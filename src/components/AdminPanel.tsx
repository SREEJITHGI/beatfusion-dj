import React, { useState } from 'react';
import { ShieldAlert, Users, Music, Activity, Terminal, ToggleLeft, ToggleRight } from 'lucide-react';

export const AdminPanel: React.FC = () => {
  // Mock users
  const [users, setUsers] = useState([
    { id: 1, name: 'SYSTEM_ROOT', email: 'root@beatfusion.dj', role: 'Admin', status: 'ACTIVE' }
  ]);

  // Mock songs
  const [songs, setSongs] = useState<Array<{ id: number; title: string; artist: string; size: string; status: string }>>([]);

  // Feature Flags
  const [flags, setFlags] = useState({
    midiController: true,
    speechSync: true,
    pwaOffline: false,
    collaborativeJamming: true
  });

  const handleToggleUser = (id: number) => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        const nextStatus = u.status === 'ACTIVE' ? 'WARNING' : u.status === 'WARNING' ? 'MUTED' : 'ACTIVE';
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const handleModerateSong = (id: number, approve: boolean) => {
    setSongs(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, status: approve ? 'APPROVED' : 'REJECTED' };
      }
      return s;
    }));
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-8 text-left z-20 relative select-none">
      {/* Top Header */}
      <div className="glass-panel border-cyber-pink/30 rounded-2xl p-6 relative overflow-hidden flex items-center justify-between">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyber-pink to-transparent animate-pulse-glow" />
        
        <div>
          <h2 className="font-display text-2xl font-black text-white tracking-widest uppercase flex items-center gap-2 text-glow-pink">
            <ShieldAlert className="w-6 h-6 text-cyber-pink" /> MATRIX ADMIN TERMINAL
          </h2>
          <span className="font-tech text-xs text-gray-400 uppercase tracking-wider block mt-1">
            Global Moderation & System Telemetry
          </span>
        </div>

        <div className="flex items-center gap-2 bg-cyber-pink/15 text-cyber-pink border border-cyber-pink/30 px-3 py-1 rounded-lg text-xs font-tech font-bold uppercase tracking-wider animate-pulse">
          Security Level 5 Active
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: System Telemetry */}
        <div className="space-y-6">
          
          {/* Telemetry charts */}
          <div className="glass-panel border-white/5 p-6 rounded-2xl space-y-4">
            <h3 className="font-display text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyber-cyan" /> Core Telemetry
            </h3>

            <div className="space-y-4 font-tech text-xs">
              <div className="bg-cyber-dark/60 p-3 rounded-lg border border-white/5 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500 uppercase">SERVER CPU LOAD</span>
                  <span className="text-cyber-green font-bold">18.4%</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div className="bg-cyber-green h-full w-[18.4%] rounded-full shadow-[0_0_8px_#39ff14]" />
                </div>
              </div>

              <div className="bg-cyber-dark/60 p-3 rounded-lg border border-white/5 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500 uppercase">MEMORY ALLOCATION</span>
                  <span className="text-cyber-cyan font-bold">2.4 GB / 8 GB</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div className="bg-cyber-cyan h-full w-[30%] rounded-full shadow-neon-cyan" />
                </div>
              </div>

              <div className="bg-cyber-dark/60 p-3 rounded-lg border border-white/5 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500 uppercase">ACTIVE WEBSOCKETS</span>
                  <span className="text-cyber-purple font-bold">1,824 NODES</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div className="bg-cyber-purple h-full w-[65%] rounded-full shadow-neon-purple" />
                </div>
              </div>
            </div>
          </div>

          {/* Feature flags controls */}
          <div className="glass-panel border-white/5 p-6 rounded-2xl space-y-4">
            <h3 className="font-display text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-5 h-5 text-cyber-purple" /> Feature Flags
            </h3>

            <div className="divide-y divide-white/5 text-xs font-tech space-y-3">
              <div className="flex justify-between items-center pt-2">
                <div>
                  <h4 className="text-white font-bold uppercase tracking-wider">Web MIDI Controller Support</h4>
                  <p className="text-[10px] text-gray-500 leading-normal">Allows hardware MIDI interface mappings</p>
                </div>
                <button
                  onClick={() => setFlags(prev => ({ ...prev, midiController: !prev.midiController }))}
                  className="text-cyber-cyan hover:scale-105 transition-transform cursor-pointer"
                >
                  {flags.midiController ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 text-gray-600" />}
                </button>
              </div>

              <div className="flex justify-between items-center pt-3">
                <div>
                  <h4 className="text-white font-bold uppercase tracking-wider">Voice mixing API Sync</h4>
                  <p className="text-[10px] text-gray-500 leading-normal">Enables chrome browser speech recognition</p>
                </div>
                <button
                  onClick={() => setFlags(prev => ({ ...prev, speechSync: !prev.speechSync }))}
                  className="text-cyber-cyan hover:scale-105 transition-transform cursor-pointer"
                >
                  {flags.speechSync ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 text-gray-600" />}
                </button>
              </div>

              <div className="flex justify-between items-center pt-3">
                <div>
                  <h4 className="text-white font-bold uppercase tracking-wider">PWA Offline Mode Cache</h4>
                  <p className="text-[10px] text-gray-500 leading-normal">Cache assets for offline mixing</p>
                </div>
                <button
                  onClick={() => setFlags(prev => ({ ...prev, pwaOffline: !prev.pwaOffline }))}
                  className="text-cyber-cyan hover:scale-105 transition-transform cursor-pointer"
                >
                  {flags.pwaOffline ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 text-gray-600" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Columns: Moderation and lists - Occupies 2 cols */}
        <div className="md:col-span-2 space-y-6">
          
          {/* User Moderation table */}
          <div className="glass-panel border-white/5 p-6 rounded-2xl space-y-4">
            <h3 className="font-display text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Users className="w-5 h-5 text-cyber-pink" /> User Management
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs font-tech text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-gray-500 uppercase tracking-widest">
                    <th className="py-2">User Alias</th>
                    <th className="py-2">Node Access</th>
                    <th className="py-2">Role</th>
                    <th className="py-2">Network Status</th>
                    <th className="py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 font-bold text-white uppercase">{u.name}</td>
                      <td className="py-3 font-mono text-gray-500">{u.email}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 bg-cyber-purple/20 border border-cyber-purple/30 text-cyber-purple text-[9px] font-bold rounded">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          u.status === 'ACTIVE'
                            ? 'bg-cyber-green/20 text-cyber-green border border-cyber-green/30'
                            : u.status === 'SHIELDED'
                            ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleToggleUser(u.id)}
                          className="px-2.5 py-1 bg-cyber-pink/20 hover:bg-cyber-pink text-white hover:text-black text-[9px] font-bold uppercase rounded border border-cyber-pink/30 hover:shadow-neon-pink transition-all cursor-pointer"
                        >
                          TOGGLE ACCESS
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Song Moderation Queue */}
          <div className="glass-panel border-white/5 p-6 rounded-2xl space-y-4">
            <h3 className="font-display text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Music className="w-5 h-5 text-cyber-yellow" /> Cloud Song Queue
            </h3>

            <div className="divide-y divide-white/5">
              {songs.map(song => (
                <div key={song.id} className="py-3 flex items-center justify-between hover:bg-white/5 px-2 rounded-lg transition-colors">
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wide">{song.title}</h4>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-tech">
                      Artist: {song.artist} • Size: {song.size}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-tech font-bold uppercase ${
                      song.status === 'APPROVED'
                        ? 'bg-cyber-green/20 border border-cyber-green/30 text-cyber-green'
                        : song.status === 'PENDING'
                        ? 'bg-cyber-yellow/20 border border-cyber-yellow/30 text-cyber-yellow animate-pulse'
                        : 'bg-red-500/25 border border-red-500/30 text-red-400'
                    }`}>
                      {song.status}
                    </span>

                    {song.status === 'PENDING' && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleModerateSong(song.id, true)}
                          className="px-2 py-1 bg-cyber-green text-cyber-dark text-[8px] font-bold uppercase rounded hover:scale-105 transition-transform cursor-pointer"
                        >
                          APPROVE
                        </button>
                        <button
                          onClick={() => handleModerateSong(song.id, false)}
                          className="px-2 py-1 bg-cyber-pink text-white text-[8px] font-bold uppercase rounded hover:scale-105 transition-transform cursor-pointer"
                        >
                          REJECT
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
