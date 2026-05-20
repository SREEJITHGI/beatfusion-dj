import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Award, Users, ShieldAlert } from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabase } from '../utils/supabaseClient';

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

  // Load chat messages and subscribe to Supabase Realtime Channel
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .order('created_at', { ascending: true })
          .limit(50);
        
        if (error) throw error;
        if (data && data.length > 0) {
          setChatMessages(data.map((m: any) => ({
            id: Number(m.id),
            user: m.user_name,
            text: m.text,
            role: m.role as any,
            color: m.color
          })));
        }
      } catch (err) {
        console.error('Error fetching chat logs from grid:', err);
      }
    };

    fetchMessages();

    // Subscribe to Postgres Insert events for chat_messages
    let channel: any = null;
    try {
      channel = supabase
        .channel('chat_room')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, (payload: any) => {
          const newMessage = payload.new;
          setChatMessages(prev => {
            // Avoid duplicate insertions
            if (prev.some(m => m.id === newMessage.id)) return prev;

            // Trigger a random floating reaction
            if (Math.random() < 0.5) {
              const emojis = ['🔥', '❤️', '👏', '🎵', '⚡'];
              triggerFloatingEmoji(emojis[Math.floor(Math.random() * emojis.length)]);
            }

            return [...prev, {
              id: Number(newMessage.id),
              user: newMessage.user_name,
              text: newMessage.text,
              role: newMessage.role as any,
              color: newMessage.color
            }];
          });
        })
        .subscribe();
    } catch (e) {
      console.warn('Realtime channel subscription failed:', e);
    }

    return () => {
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch (e) {
          console.warn('Failed to unsubscribe from channel:', e);
        }
      }
    };
  }, []);

  // Simulate audience bot chat message arrivals in local single-player session
  useEffect(() => {
    const bots = [
      { name: 'EDM_FANATIC', text: 'This synth bassline is insane! 🚀', role: 'Viewer', color: 'text-gray-400' },
      { name: 'NEXUS_DJ', text: 'Did he map a MIDI controller to the Echo sweep? 🎛️', role: 'VIP', color: 'text-cyber-pink' },
      { name: 'MATRIX_GIRL', text: 'BeatFusion is literally Virtual DJ but in cyberpunk mode.', role: 'Viewer', color: 'text-gray-300' },
      { name: 'GRID_RUNNER', text: 'Auto Remix mode toggling EQ cuts is sick.', role: 'Mod', color: 'text-cyber-purple' }
    ];

    const interval = setInterval(() => {
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

        const emojis = ['🔥', '❤️', '👏', '🎵', '⚡'];
        triggerFloatingEmoji(emojis[Math.floor(Math.random() * emojis.length)]);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const triggerFloatingEmoji = (char: string) => {
    const id = emojiIdRef.current++;
    const left = Math.floor(Math.random() * 80) + 10;
    setFloatingEmojis(prev => [...prev, { id, char, left }]);

    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(e => e.id !== id));
    }, 3000);
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    let username = 'ME_OPERATOR';
    let rawRole = 'DJ';
    let session = null;

    try {
      const sessionRes = await supabase.auth.getSession();
      session = sessionRes?.data?.session;
    } catch (e) {
      console.warn('Failed to retrieve session for chat:', e);
    }

    if (session?.user) {
      username = session.user.user_metadata?.name || session.user.email?.split('@')[0].toUpperCase() || 'ME_OPERATOR';
      rawRole = session.user.user_metadata?.role || 'DJ';
    } else {
      const localUser = localStorage.getItem('BEATFUSION_ACTIVE_USER');
      if (localUser) {
        try {
          const parsed = JSON.parse(localUser);
          username = parsed.name || username;
          rawRole = parsed.role || rawRole;
        } catch (e) {
          console.error('Failed to parse local active user for chat:', e);
        }
      }
    }

    const role: 'DJ' | 'VIP' | 'Mod' | 'Viewer' = rawRole === 'Admin' ? 'Mod' : (rawRole as any);
    const color = role === 'DJ' ? 'text-cyber-pink font-bold' : rawRole === 'Admin' ? 'text-cyber-yellow font-bold' : 'text-cyber-cyan';

    const localId = Date.now();
    const userMsg: ChatMessage = {
      id: localId,
      user: username,
      text: chatInput,
      role,
      color
    };

    setChatMessages(prev => [...prev, userMsg]);
    const inputToSend = chatInput;
    setChatInput('');

    if (inputToSend.toLowerCase().includes('drop') || inputToSend.toLowerCase().includes('fire') || inputToSend.toLowerCase().includes('confetti')) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#ff007f', '#00f3ff', '#9d4edd']
      });
    }

    triggerFloatingEmoji('⚡');

    // Save message to database if user is logged in and db is connected
    if (session?.user) {
      try {
        await supabase.from('chat_messages').insert({
          profile_id: session.user.id,
          user_name: username,
          text: inputToSend,
          role: role,
          color: color
        });
      } catch (err) {
        console.error('Error inserting message to grid DB:', err);
      }
    }

    // Auto-respond locally
    if (inputToSend.toLowerCase().includes('help') || Math.random() < 0.25) {
      setTimeout(() => {
        const responses = [
          `${username} is in the zone! 🎚️`,
          "Absolute fire drop!",
          "Grid synced. Smooth!",
          "Yes! Let's go!"
        ];
        const botResponse: ChatMessage = {
          id: Date.now() + 1,
          user: 'AUDIENCE_NODE',
          text: responses[Math.floor(Math.random() * responses.length)],
          role: 'Viewer',
          color: 'text-cyber-cyan'
        };
        setChatMessages(prev => [...prev, botResponse]);
        triggerFloatingEmoji('🔥');
      }, 1500);
    }
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
