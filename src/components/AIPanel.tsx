import React, { useState } from 'react';
import { Mic, MicOff, RefreshCw, Terminal, Compass, Zap, Sparkles } from 'lucide-react';
import { useDJMixer } from '../context/DJMixerContext';
import type { Track } from '../context/DJMixerContext';
import { MOODS } from '../data/musicLibraryData';
import type { Mood } from '../data/musicLibraryData';

interface AIPanelProps {
  tracks: Track[];
}

export const AIPanel: React.FC<AIPanelProps> = ({ tracks }) => {
  const {
    aiSyncActive,
    autoRemixActive,
    voiceAssistantActive,
    voiceLogs,
    triggerAISync,
    toggleAutoRemix,
    toggleVoiceAssistant,
    loadTrack
  } = useDJMixer();

  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);

  // Filter tracks by mood genres
  const recommendedTracks = selectedMood
    ? tracks.filter(t => selectedMood.associatedGenres.includes(t.genre))
    : tracks;

  return (
    <div className="glass-panel border-cyber-purple/30 rounded-3xl p-6 flex flex-col gap-6 relative select-none">
      {/* Accent strip */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyber-purple to-transparent" />
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-3">
        <div>
          <h3 className="font-display text-xl font-extrabold text-white tracking-widest uppercase flex items-center gap-2 text-glow-purple">
            <Sparkles className="w-5 h-5 text-cyber-purple animate-pulse" /> AI CO-PILOT
          </h3>
          <span className="font-tech text-[10px] text-gray-500 uppercase tracking-widest">
            Neural Mixing Interface
          </span>
        </div>
      </div>

      {/* Main Grid: Controls vs Terminal logs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Core AI Automation Buttons */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-tech text-gray-500 uppercase tracking-widest">AI Core Functions</label>
            
            {/* Auto Beat Match Sync */}
            <button
              onClick={triggerAISync}
              disabled={aiSyncActive}
              className={`w-full py-3 px-4 rounded-xl border font-display font-extrabold tracking-widest text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                aiSyncActive
                  ? 'border-cyber-cyan/50 text-cyber-cyan bg-cyber-cyan/5'
                  : 'border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan hover:text-cyber-dark shadow-neon-cyan'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${aiSyncActive ? 'animate-spin' : ''}`} />
              {aiSyncActive ? 'AI SYNCING BEATS...' : 'TRIGGER AUTO BEAT MATCH'}
            </button>

            {/* Auto Remix Modulator */}
            <button
              onClick={toggleAutoRemix}
              className={`w-full py-3 px-4 rounded-xl border font-display font-extrabold tracking-widest text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                autoRemixActive
                  ? 'bg-cyber-pink border-cyber-pink text-white shadow-neon-pink'
                  : 'border-cyber-pink text-cyber-pink hover:bg-cyber-pink hover:text-white shadow-[0_0_10px_rgba(255,0,127,0.1)]'
              }`}
            >
              <Zap className={`w-4 h-4 ${autoRemixActive ? 'animate-bounce' : ''}`} />
              {autoRemixActive ? 'AI AUTO REMIX ACTIVE' : 'ENGAGE AUTO REMIX'}
            </button>
          </div>

          {/* Voice Assistant Mic Control */}
          <div className="bg-cyber-dark/30 p-4 rounded-2xl border border-white/5 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-tech text-gray-500 uppercase tracking-widest">
                Speech Command Deck
              </span>
              <span className={`w-2 h-2 rounded-full ${voiceAssistantActive ? 'bg-cyber-green animate-pulse shadow-[0_0_5px_#39ff14]' : 'bg-red-500'}`} />
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={toggleVoiceAssistant}
                className={`w-14 h-14 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                  voiceAssistantActive
                    ? 'bg-cyber-green border-cyber-green text-cyber-dark shadow-[0_0_15px_#39ff14]'
                    : 'border-white/10 hover:border-white/30 text-white hover:bg-white/5'
                }`}
              >
                {voiceAssistantActive ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6 text-gray-500" />}
              </button>
              
              <div className="flex-1 text-left">
                <h4 className="text-xs font-bold text-white uppercase tracking-wide">
                  {voiceAssistantActive ? 'VOICE DECK ACTIVE' : 'VOICE DECK IDLE'}
                </h4>
                <p className="text-[9px] text-gray-400 font-tech leading-normal">
                  Say "play A", "sync", "fade left", "echo B" to mix tracks hands-free.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Cyber Terminal Console logs */}
        <div className="flex flex-col h-full min-h-[200px] bg-black/80 rounded-2xl border border-cyber-purple/20 p-4 relative overflow-hidden font-mono text-[10px] text-left text-cyber-green">
          {/* Scanline background lines */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none" />
          
          <div className="flex items-center gap-2 border-b border-cyber-green/20 pb-2 mb-2 text-cyber-green/60">
            <Terminal className="w-3.5 h-3.5" />
            <span>NEURAL INTERRUPT INTERFACE LOGS</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 pr-1 font-mono">
            {voiceLogs.map((log, idx) => (
              <div key={idx} className="flex gap-2 leading-relaxed">
                <span className="text-cyber-green/40">[{1000 + idx}]</span>
                <span>{log}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mood Recommendations section */}
      <div className="bg-cyber-dark/30 p-4 rounded-2xl border border-white/5 space-y-4 text-left">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-tech text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-cyber-purple" /> MOOD-BASED MUSIC RECOMMENDATIONS
          </span>
          {selectedMood && (
            <button
              onClick={() => setSelectedMood(null)}
              className="text-[9px] font-tech text-cyber-pink hover:underline uppercase tracking-wider"
            >
              CLEAR FILTER
            </button>
          )}
        </div>

        {/* Mood Selection Filters */}
        <div className="flex flex-wrap gap-2">
          {MOODS.map((mood) => (
            <button
              key={mood.name}
              onClick={() => setSelectedMood(mood)}
              className={`px-3 py-1.5 text-[10px] font-tech font-bold uppercase rounded-lg border transition-all cursor-pointer ${
                selectedMood?.name === mood.name
                  ? 'bg-cyber-purple border-cyber-purple text-white shadow-neon-purple'
                  : 'border-white/10 hover:border-white/30 text-gray-400'
              }`}
            >
              {mood.name} ({mood.energy})
            </button>
          ))}
        </div>

        {/* Recommended list */}
        <div className="divide-y divide-white/5 space-y-1.5 max-h-40 overflow-y-auto pr-2">
          {recommendedTracks.length === 0 ? (
            <p className="text-xs text-gray-500 font-tech uppercase tracking-widest text-center py-4">
              NO MATCHING CORES IN CURRENT MATRIX
            </p>
          ) : (
            recommendedTracks.map((track) => (
              <div key={track.id} className="py-2 flex items-center justify-between group">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyber-purple/50 group-hover:bg-cyber-cyan transition-colors" />
                  <div>
                    <h5 className="text-xs font-bold text-white uppercase tracking-wider">{track.title}</h5>
                    <p className="text-[9px] text-gray-500 uppercase tracking-widest font-tech">
                      {track.artist} • {track.genre} • {track.bpm} BPM
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => loadTrack('A', track)}
                    className="px-2 py-0.5 border border-cyber-cyan/30 text-cyber-cyan hover:bg-cyber-cyan hover:text-black font-tech text-[8px] font-bold uppercase rounded transition-all cursor-pointer"
                  >
                    LOAD DECK A
                  </button>
                  <button
                    onClick={() => loadTrack('B', track)}
                    className="px-2 py-0.5 border border-cyber-pink/30 text-cyber-pink hover:bg-cyber-pink hover:text-white font-tech text-[8px] font-bold uppercase rounded transition-all cursor-pointer"
                  >
                    LOAD DECK B
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
