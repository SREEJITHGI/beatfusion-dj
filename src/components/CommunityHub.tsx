import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Award, Users, ShieldAlert } from 'lucide-react';
import confetti from 'canvas-confetti';

interface FloatingEmoji {
  id: number;
  char: string;
  left: number; // percentage width
}

interface ChatMessage {
  id: number;
  user: string;
  text: string;
  role: 'DJ' | 'VIP' | 'Mod' | 'Viewer';
  color: string;
}

export const CommunityHub: React.FC = () => {
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: 1, user: 'SYSTEM_BOT', text: 'Secured Matrix Arena Live Chat online. Welcome, Operative.', role: 'Mod', color: 'text-cyber-cyan' }
  ]);

  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
  const emojiIdRef = useRef(0);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Automatically scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Simulate audience chat message arrivals
  useEffect(() => {
    const bots = [
      { name: 'EDM_FANATIC', text: 'This synth bassline is insane! 🚀', role: 'Viewer', color: 'text-gray-400' },
      { name: 'NEXUS_DJ', text: 'Did he map a MIDI controller to the Echo sweep? 🎛️', role: 'VIP', color: 'text-cyber-pink' },
      { name: 'MATRIX_GIRL', text: 'BeatFusion is literally Virtual DJ but in cyberpunk mode.', role: 'Viewer', color: 'text-gray-300' },
      { name: 'GRID_RUNNER', text: 'Auto Remix mode toggling EQ cuts is sick.', role: 'Mod', color: 'text-cyber-purple' }
    ];

    const interval = setInterval(() => {
      // 30% chance to push a random chat message
      if (Math.random() < 0.45) {
        const bot = bots[Math.floor(Math.random() * bots.length)];
        const newMsg: ChatMessage = {
          id: Date.now(),
          user: bot.name,
          text: bot.text,
          role: bot.role as any,
          color: bot.color
        };
        setChatMessages(prev => [...prev, newMsg]);

        // Auto trigger a floating emoji reaction
        const emojis = ['🔥', '❤️', '👏', '🎵', '⚡'];
        triggerFloatingEmoji(emojis[Math.floor(Math.random() * emojis.length)]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const triggerFloatingEmoji = (char: string) => {
    const id = emojiIdRef.current++;
    const left = Math.floor(Math.random() * 80) + 10; // 10% to 90%
    setFloatingEmojis(prev => [...prev, { id, char, left }]);

    // Remove after animation finishes (3 seconds)
    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(e => e.id !== id));
    }, 3000);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now(),
      user: 'ME_OPERATOR',
      text: chatInput,
      role: 'DJ',
      color: 'text-cyber-pink font-bold'
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');

    // Trigger explosive confetti on chat send if it contains certain words
    if (chatInput.toLowerCase().includes('drop') || chatInput.toLowerCase().includes('fire') || chatInput.toLowerCase().includes('confetti')) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#ff007f', '#00f3ff', '#9d4edd']
      });
    }

    // Trigger emoji reaction
    triggerFloatingEmoji('⚡');

    // Simulate audience response 1.5 seconds later
    setTimeout(() => {
      const responses = [
        "ME_OPERATOR is in the zone! 🎚️",
        "Absolute fire drop!",
        "Grid synced. Smooth!",
        "Yes! Let's go!"
      ];
      const botResponse: ChatMessage = {
        id: Date.now() + 1,
        user: 'GRID_BOT',
        text: responses[Math.floor(Math.random() * responses.length)],
        role: 'Viewer',
        color: 'text-cyber-cyan'
      };
      setChatMessages(prev => [...prev, botResponse]);
      triggerFloatingEmoji('🔥');
    }, 1500);
  };

  // Mock Leaderboard
  const leaderBoard = [
    { rank: 1, name: 'DJ_GLITCH_NET', points: '14,820 XP', status: 'IN BATTLE', color: 'text-cyber-pink' },
    { rank: 2, name: 'VECTOR_RUNNER', points: '12,450 XP', status: 'ONLINE', color: 'text-cyber-cyan' },
    { rank: 3, name: 'NEXUS_OPERATOR', points: '11,100 XP', status: 'ONLINE', color: 'text-cyber-purple' },
    { rank: 4, name: 'DJ_AXIOM', points: '9,980 XP', status: 'OFFLINE', color: 'text-gray-500' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative select-none">
      
      {/* Floating Emoji Reactions Layer */}
      <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
        {floatingEmojis.map((emoji) => (
          <div
            key={emoji.id}
            className="absolute bottom-20 text-3xl float-animation"
            style={{
              left: `${emoji.left}%`,
              animation: 'driftUp 3.2s ease-out forwards'
            }}
          >
            {emoji.char}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes driftUp {
          0% {
            transform: translateY(0) scale(0.5) rotate(0deg);
            opacity: 0;
          }
          15% {
            opacity: 0.9;
            transform: translateY(-20px) scale(1.2) rotate(10deg);
          }
          100% {
            transform: translateY(-250px) scale(0.8) rotate(-20deg);
            opacity: 0;
          }
        }
      `}</style>

      {/* Chat Room Console - Occupies 2 cols */}
      <div className="md:col-span-2 glass-panel border-cyber-cyan/30 rounded-3xl p-6 flex flex-col h-[400px] relative">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyber-cyan to-transparent animate-pulse-glow" />

        <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
          <div className="text-left">
            <h3 className="font-display text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2 text-glow-cyan">
              <MessageSquare className="w-5 h-5 text-cyber-cyan animate-pulse" /> Grid Arena Live Chat
            </h3>
            <span className="font-tech text-[10px] text-gray-500 uppercase tracking-widest">
              Secured Matrix Channel
            </span>
          </div>
          <div className="flex items-center gap-2 bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30 px-2.5 py-1 rounded text-xs font-tech">
            <Users className="w-3.5 h-3.5" /> 3,850 STREAMING
          </div>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-cyber-cyan/50 text-left">
          {chatMessages.map((msg) => (
            <div key={msg.id} className="text-xs leading-normal flex items-start gap-1.5 hover:bg-white/5 p-1.5 rounded-lg transition-colors">
              <span className="px-1.5 py-0.2 bg-white/5 border border-white/10 text-[8px] font-tech text-gray-500 rounded uppercase">
                {msg.role}
              </span>
              <span className={`font-tech font-bold uppercase ${msg.color}`}>
                {msg.user}:
              </span>
              <span className="text-gray-300 font-sans">{msg.text}</span>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Live Reaction Buttons */}
        <div className="flex items-center gap-2 py-3 border-t border-white/5 mt-3 justify-center">
          <span className="text-[9px] font-tech text-gray-500 uppercase tracking-widest mr-2">AUDIENCE EMOTE:</span>
          <button
            onClick={() => triggerFloatingEmoji('🔥')}
            className="w-8 h-8 rounded-lg bg-cyber-pink/10 hover:bg-cyber-pink/30 text-white flex items-center justify-center cursor-pointer hover:scale-110 transition-transform border border-cyber-pink/20"
          >
            🔥
          </button>
          <button
            onClick={() => triggerFloatingEmoji('❤️')}
            className="w-8 h-8 rounded-lg bg-red-600/10 hover:bg-red-600/30 text-white flex items-center justify-center cursor-pointer hover:scale-110 transition-transform border border-red-600/20"
          >
            ❤️
          </button>
          <button
            onClick={() => triggerFloatingEmoji('👏')}
            className="w-8 h-8 rounded-lg bg-cyber-yellow/10 hover:bg-cyber-yellow/30 text-white flex items-center justify-center cursor-pointer hover:scale-110 transition-transform border border-cyber-yellow/20"
          >
            👏
          </button>
          <button
            onClick={() => triggerFloatingEmoji('⚡')}
            className="w-8 h-8 rounded-lg bg-cyber-cyan/10 hover:bg-cyber-cyan/30 text-white flex items-center justify-center cursor-pointer hover:scale-110 transition-transform border border-cyber-cyan/20"
          >
            ⚡
          </button>
          <button
            onClick={() => {
              triggerFloatingEmoji('🌀');
              confetti({
                particleCount: 50,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#ff007f', '#00f3ff']
              });
            }}
            className="w-8 h-8 rounded-lg bg-cyber-purple/10 hover:bg-cyber-purple/30 text-white flex items-center justify-center cursor-pointer hover:scale-110 transition-transform border border-cyber-purple/20"
          >
            🌀
          </button>
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendChat} className="flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            className="flex-1 bg-cyber-dark/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan"
            placeholder="Send glowing message to chat (try 'fire' or 'drop' for effects)..."
          />
          <button
            type="submit"
            className="px-4 bg-cyber-cyan hover:bg-cyber-cyan/95 text-cyber-dark rounded-xl flex items-center justify-center font-bold transition-all shadow-neon-cyan cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Leaderboards and Battles */}
      <div className="glass-panel border-white/10 rounded-3xl p-6 flex flex-col h-[400px]">
        <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
          <div className="text-left">
            <h3 className="font-display text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Award className="w-5 h-5 text-cyber-purple" /> Leaderboard
            </h3>
            <span className="font-tech text-[10px] text-gray-500 uppercase tracking-widest">
              Top Cyber DJs
            </span>
          </div>
        </div>

        {/* Leaderboard Entries */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-left">
          {leaderBoard.map((dj) => (
            <div key={dj.rank} className="p-3 bg-cyber-dark/50 border border-white/5 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-display text-sm font-black text-gray-500 w-4 text-center">
                  #{dj.rank}
                </span>
                <div>
                  <h4 className={`text-xs font-bold uppercase tracking-wide ${dj.color}`}>
                    {dj.name}
                  </h4>
                  <span className="text-[9px] font-tech text-gray-500 uppercase tracking-wider block">
                    {dj.points}
                  </span>
                </div>
              </div>

              <span className={`px-2 py-0.5 rounded text-[8px] font-tech font-bold uppercase ${
                dj.status === 'IN BATTLE'
                  ? 'bg-cyber-pink/25 border border-cyber-pink/40 text-cyber-pink animate-pulse'
                  : dj.status === 'ONLINE'
                  ? 'bg-cyber-green/20 border border-cyber-green/40 text-cyber-green'
                  : 'bg-white/5 border border-white/10 text-gray-500'
              }`}>
                {dj.status}
              </span>
            </div>
          ))}
        </div>

        {/* Battle button */}
        <button
          onClick={() => {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 }
            });
          }}
          className="w-full mt-4 py-2.5 bg-gradient-to-r from-cyber-purple to-cyber-pink hover:brightness-110 text-white font-display font-extrabold tracking-widest text-xs rounded-xl transition-all shadow-neon-pink cursor-pointer flex items-center justify-center gap-1.5"
        >
          <ShieldAlert className="w-4 h-4" />
          ENTER BATTLE ARENA
        </button>
      </div>
    </div>
  );
};
