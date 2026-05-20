import React from 'react';
import { Play, Flame, Disc, Radio, Users, Cpu, ArrowRight, Star, Layers, Activity } from 'lucide-react';

interface LandingPageProps {
  onEnterStudio: () => void;
  onShowAuth: () => void;
  user: any;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterStudio, onShowAuth, user }) => {
  return (
    <div className="min-h-screen cyber-grid bg-cyber-dark relative overflow-hidden flex flex-col justify-between">
      {/* Decorative Neon Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-cyber-purple/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cyber-cyan/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-cyber-pink/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-4 max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 z-20">
        <div className="flex-1 text-left space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyber-pink/10 border border-cyber-pink/30 rounded-full text-cyber-pink text-xs uppercase font-tech tracking-widest animate-pulse">
            <Flame className="w-3.5 h-3.5 text-cyber-pink" />
            AI Mixing Core V2.4 Active
          </div>
          
          <h1 className="font-display font-black text-5xl md:text-7xl leading-none text-white tracking-wider">
            FUSE THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-cyan via-cyber-purple to-cyber-pink text-glow-pink">BEAT</span><br />
            RULE THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-pink to-cyber-cyan text-glow-cyan">GRID</span>
          </h1>

          <p className="text-gray-400 text-sm md:text-base font-sans max-w-lg leading-relaxed">
            Unleash the future of audio mixing. BeatFusion DJ marries studio-grade Web Audio API processing with AI synchronization, voice-command mixing, and real-time social engagement in a breathtaking neon terminal.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={onEnterStudio}
              className="px-8 py-3.5 bg-gradient-to-r from-cyber-pink via-cyber-purple to-cyber-cyan text-white font-display font-extrabold tracking-widest text-sm rounded-lg transition-all shadow-neon-pink hover:shadow-neon-cyan hover:scale-[1.03] cursor-pointer flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              ENTER THE STUDIO
            </button>
            
            {!user && (
              <button
                onClick={onShowAuth}
                className="px-6 py-3.5 bg-cyber-deep border border-cyber-cyan/50 hover:bg-cyber-cyan/10 hover:border-cyber-cyan text-cyber-cyan font-display font-extrabold tracking-widest text-sm rounded-lg transition-all hover:scale-[1.03] flex items-center gap-2"
              >
                SYNC INTERFACE
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Hero Turntable Graphic */}
        <div className="flex-1 flex justify-center items-center relative select-none">
          <div className="absolute w-80 h-80 rounded-full border border-cyber-pink/30 animate-spin-slow pointer-events-none" />
          <div className="absolute w-[360px] h-[360px] rounded-full border border-cyber-cyan/10 pointer-events-none" />
          
          {/* Neon turntable visualizer */}
          <div className="w-72 h-72 glass-panel border-cyber-cyan/30 rounded-full flex items-center justify-center relative p-3 animate-spin-slow">
            <div className="w-full h-full rounded-full bg-cyber-dark/90 border-2 border-cyber-pink/40 flex items-center justify-center relative">
              {/* Vinyl grooves */}
              <div className="absolute inset-4 rounded-full border border-white/5" />
              <div className="absolute inset-8 rounded-full border border-white/5" />
              <div className="absolute inset-16 rounded-full border border-white/5" />
              <div className="absolute inset-24 rounded-full border border-white/5" />
              
              {/* Turntable needle */}
              <div className="absolute -top-6 right-0 w-24 h-24 pointer-events-none origin-top-right rotate-[12deg] z-30">
                <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none">
                  <path d="M90 10 L60 30 L45 70" stroke="#ff007f" strokeWidth="3" strokeLinecap="round"/>
                  <rect x="40" y="65" width="10" height="12" fill="#00f3ff" rx="1"/>
                </svg>
              </div>

              {/* Center Logo */}
              <div className="w-16 h-16 rounded-full bg-cyber-deep border border-cyber-cyan flex flex-col items-center justify-center z-20">
                <Disc className="w-7 h-7 text-cyber-cyan animate-pulse-glow" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="bg-cyber-deep/80 border-y border-white/5 py-16 px-4 z-20">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h2 className="font-display text-3xl font-extrabold tracking-widest text-white uppercase">
              STUDIO TECH SPECS
            </h2>
            <div className="w-20 h-1 bg-cyber-cyan mx-auto rounded-full" />
            <p className="text-gray-500 font-tech uppercase text-xs tracking-wider pt-1">
              Hardware emulation powered by high performance client architecture
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="p-6 glass-panel border-white/5 rounded-xl hover:border-cyber-pink/30 hover:shadow-neon-pink transition-all group">
              <div className="w-10 h-10 rounded-lg bg-cyber-pink/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Layers className="w-5 h-5 text-cyber-pink" />
              </div>
              <h3 className="font-display font-bold text-lg text-white mb-2 tracking-wide uppercase">
                Dual Audio Engine
              </h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                Seamlessly routes Audio nodes across Deck A & Deck B. Adjust three-band EQs, frequency filters, reverb, and delays in real-time.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 glass-panel border-white/5 rounded-xl hover:border-cyber-cyan/30 hover:shadow-neon-cyan transition-all group">
              <div className="w-10 h-10 rounded-lg bg-cyber-cyan/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Cpu className="w-5 h-5 text-cyber-cyan" />
              </div>
              <h3 className="font-display font-bold text-lg text-white mb-2 tracking-wide uppercase">
                AI Beat Synchronization
              </h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                Match BPMs across tracks and snap beat grids using local analysis triggers to prevent messy drops.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 glass-panel border-white/5 rounded-xl hover:border-cyber-purple/30 hover:shadow-neon-purple transition-all group">
              <div className="w-10 h-10 rounded-lg bg-cyber-purple/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Activity className="w-5 h-5 text-cyber-purple" />
              </div>
              <h3 className="font-display font-bold text-lg text-white mb-2 tracking-wide uppercase">
                Interactive Voice Deck
              </h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                Connect the neural terminal to your voice. Use spoken triggers like "play deck A", "sync", and "crossfade" to spin tracks.
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-6 glass-panel border-white/5 rounded-xl hover:border-cyber-yellow/30 hover:shadow-[0_0_15px_rgba(255,234,0,0.15)] transition-all group">
              <div className="w-10 h-10 rounded-lg bg-cyber-yellow/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5 text-cyber-yellow" />
              </div>
              <h3 className="font-display font-bold text-lg text-white mb-2 tracking-wide uppercase">
                Live Spectator Hub
              </h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                Host public mixing slots, trigger live floating emojis, read dynamic chatrooms, and compete in the DJ arena.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Live DJ Leaderboard & Trending */}
      <section className="max-w-6xl mx-auto py-16 px-4 w-full z-20 space-y-10">
        <div className="flex justify-between items-end border-b border-white/5 pb-4">
          <div className="text-left">
            <h2 className="font-display text-2xl font-bold tracking-widest text-white uppercase">
              ACTIVE BEATFUSIONS
            </h2>
            <p className="text-gray-400 text-xs font-tech">Cyber artists spinning live right now</p>
          </div>
          <div className="flex items-center gap-1 bg-cyber-pink/20 text-cyber-pink px-2.5 py-1 rounded text-xs font-tech uppercase tracking-widest animate-pulse border border-cyber-pink/30">
            <Radio className="w-3.5 h-3.5" />
            Live Streams: 12
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stream 1 */}
          <div className="glass-panel border-white/10 rounded-xl overflow-hidden relative group">
            <div className="h-40 bg-cyber-dark/80 flex items-center justify-center relative overflow-hidden">
              <div className="absolute top-2 left-2 bg-red-600 text-white font-tech font-bold uppercase text-[9px] px-2 py-0.5 rounded tracking-widest animate-pulse">
                LIVE
              </div>
              <div className="absolute top-2 right-2 bg-black/60 text-cyber-cyan font-tech text-[9px] px-2 py-0.5 rounded tracking-widest">
                4.8K SPECTATING
              </div>
              {/* Virtual waveform lines */}
              <div className="flex items-end gap-1 h-12 w-32">
                {[30, 80, 50, 90, 40, 60, 20, 70, 45, 95, 35, 75, 55, 85].map((val, idx) => (
                  <div 
                    key={idx} 
                    className="w-1 bg-cyber-cyan rounded-t animate-pulse" 
                    style={{ height: `${val}%`, animationDelay: `${idx * 0.1}s`, animationDuration: '0.8s' }} 
                  />
                ))}
              </div>
              <button 
                onClick={onEnterStudio}
                className="absolute inset-0 bg-cyber-dark/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer"
              >
                <div className="px-4 py-2 bg-cyber-pink rounded-lg font-display text-xs font-bold text-white tracking-widest hover:scale-105 transition-transform flex items-center gap-1.5 shadow-neon-pink">
                  <Play className="w-3 h-3 fill-white" /> TUNE IN
                </div>
              </button>
            </div>
            <div className="p-4 text-left border-t border-white/5">
              <h4 className="font-display text-white text-sm font-bold tracking-wide uppercase">NEON WASTELAND MIX</h4>
              <p className="text-gray-500 font-tech text-xs uppercase tracking-wider">DJ CYBER_SPIN • SYNTHWAVE / DNB</p>
            </div>
          </div>

          {/* Stream 2 */}
          <div className="glass-panel border-white/10 rounded-xl overflow-hidden relative group">
            <div className="h-40 bg-cyber-dark/80 flex items-center justify-center relative overflow-hidden">
              <div className="absolute top-2 left-2 bg-red-600 text-white font-tech font-bold uppercase text-[9px] px-2 py-0.5 rounded tracking-widest animate-pulse">
                LIVE
              </div>
              <div className="absolute top-2 right-2 bg-black/60 text-cyber-pink font-tech text-[9px] px-2 py-0.5 rounded tracking-widest">
                3.1K SPECTATING
              </div>
              {/* Virtual waveform lines */}
              <div className="flex items-end gap-1 h-12 w-32">
                {[60, 40, 80, 20, 95, 45, 75, 30, 85, 50, 70, 35, 90, 25].map((val, idx) => (
                  <div 
                    key={idx} 
                    className="w-1 bg-cyber-pink rounded-t animate-pulse" 
                    style={{ height: `${val}%`, animationDelay: `${idx * 0.15}s`, animationDuration: '1.2s' }} 
                  />
                ))}
              </div>
              <button 
                onClick={onEnterStudio}
                className="absolute inset-0 bg-cyber-dark/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer"
              >
                <div className="px-4 py-2 bg-cyber-cyan text-cyber-dark rounded-lg font-display text-xs font-bold tracking-widest hover:scale-105 transition-transform flex items-center gap-1.5 shadow-neon-cyan">
                  <Play className="w-3 h-3 fill-cyber-dark" /> TUNE IN
                </div>
              </button>
            </div>
            <div className="p-4 text-left border-t border-white/5">
              <h4 className="font-display text-white text-sm font-bold tracking-wide uppercase">ACID PROTOCOL</h4>
              <p className="text-gray-500 font-tech text-xs uppercase tracking-wider">DJ VECTOR_BOY • TECHNO / ACID</p>
            </div>
          </div>

          {/* Stream 3 */}
          <div className="glass-panel border-white/10 rounded-xl overflow-hidden relative group">
            <div className="h-40 bg-cyber-dark/80 flex items-center justify-center relative overflow-hidden">
              <div className="absolute top-2 left-2 bg-red-600 text-white font-tech font-bold uppercase text-[9px] px-2 py-0.5 rounded tracking-widest animate-pulse">
                LIVE
              </div>
              <div className="absolute top-2 right-2 bg-black/60 text-cyber-yellow font-tech text-[9px] px-2 py-0.5 rounded tracking-widest">
                2.4K SPECTATING
              </div>
              {/* Virtual waveform lines */}
              <div className="flex items-end gap-1 h-12 w-32">
                {[20, 50, 30, 70, 90, 40, 80, 60, 95, 30, 45, 85, 55, 75].map((val, idx) => (
                  <div 
                    key={idx} 
                    className="w-1 bg-cyber-yellow rounded-t animate-pulse" 
                    style={{ height: `${val}%`, animationDelay: `${idx * 0.08}s`, animationDuration: '0.9s' }} 
                  />
                ))}
              </div>
              <button 
                onClick={onEnterStudio}
                className="absolute inset-0 bg-cyber-dark/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer"
              >
                <div className="px-4 py-2 bg-cyber-purple rounded-lg font-display text-xs font-bold text-white tracking-widest hover:scale-105 transition-transform flex items-center gap-1.5 shadow-neon-purple">
                  <Play className="w-3 h-3 fill-white" /> TUNE IN
                </div>
              </button>
            </div>
            <div className="p-4 text-left border-t border-white/5">
              <h4 className="font-display text-white text-sm font-bold tracking-wide uppercase">GRID GLITCH</h4>
              <p className="text-gray-500 font-tech text-xs uppercase tracking-wider">DJ GLITCH_NET • CHILLWAVE / GLITCH</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-cyber-deep/30 py-16 px-4 z-20 w-full border-t border-white/5">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center">
            <h2 className="font-display text-2xl font-bold tracking-widest text-white uppercase">REACTION FEED</h2>
            <p className="text-gray-500 font-tech text-xs uppercase tracking-widest">Feedback from node operators</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 glass-panel border-white/5 rounded-xl text-left relative">
              <div className="flex items-center gap-1 text-cyber-yellow mb-3">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-cyber-yellow" />)}
              </div>
              <p className="text-gray-300 text-xs italic leading-relaxed">
                "The Web Audio latency is incredibly low. I connected my MIDI controller in seconds, and using the voice commands to trigger filters is a total game changer for live streaming."
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-cyber-pink/20 flex items-center justify-center font-tech text-xs text-cyber-pink font-bold border border-cyber-pink/30">
                  AX
                </div>
                <div>
                  <h5 className="font-display text-xs text-white font-bold uppercase tracking-wider">DJ AXIOM</h5>
                  <p className="text-[10px] text-gray-500 font-tech uppercase tracking-wider">Verified Artist</p>
                </div>
              </div>
            </div>

            <div className="p-6 glass-panel border-white/5 rounded-xl text-left relative">
              <div className="flex items-center gap-1 text-cyber-yellow mb-3">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-cyber-yellow" />)}
              </div>
              <p className="text-gray-300 text-xs italic leading-relaxed">
                "BeatSync actually works! The procedural loops sound amazing offline, and recording my mixes straight to Wav format is super seamless. BeatFusion rules the grid."
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-cyber-cyan/20 flex items-center justify-center font-tech text-xs text-cyber-cyan font-bold border border-cyber-cyan/30">
                  SL
                </div>
                <div>
                  <h5 className="font-display text-xs text-white font-bold uppercase tracking-wider">DJ SHIFT_LOCK</h5>
                  <p className="text-[10px] text-gray-500 font-tech uppercase tracking-wider">Arena Champion</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-cyber-dark border-t border-white/5 px-4 text-center z-20">
        <p className="text-gray-600 text-[10px] font-tech uppercase tracking-widest">
          © 2026 BEATFUSION DJ MIXER • MATRIX TERMINAL OPERATOR PROTOCOLS SECURED.
        </p>
      </footer>
    </div>
  );
};
