import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Square, Music, Disc, Zap, Sliders, Volume2 } from 'lucide-react';
import { WaveformVisualizer } from './WaveformVisualizer';
import type { Track } from '../context/DJMixerContext';

interface DeckProps {
  deckId: 'A' | 'B';
  deckState: {
    isPlaying: boolean;
    volume: number;
    pitch: number;
    eqLow: number;
    eqMid: number;
    eqHigh: number;
    filterFreq: number;
    filterType: 'lowpass' | 'highpass' | 'bypass';
    fxEcho: boolean;
    fxReverb: boolean;
    fxFlanger: boolean;
    track: Track | null;
    currentTime: number;
    duration: number;
    cuePoint: number | null;
    bpm: number;
  };
  analyser: AnalyserNode | null;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onVolumeChange: (vol: number) => void;
  onPitchChange: (pitch: number) => void;
  onEQChange: (band: 'low' | 'mid' | 'high', value: number) => void;
  onFilterChange: (type: 'lowpass' | 'highpass' | 'bypass', freq: number) => void;
  onToggleFX: (fx: 'echo' | 'reverb' | 'flanger') => void;
  onSetCue: () => void;
  onGoToCue: () => void;
  onSeek: (time: number) => void;
  onTriggerSync: () => void;
}

// Helper formatting seconds to MM:SS
const formatTime = (secs: number) => {
  if (isNaN(secs) || secs === 0) return '00:00';
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = Math.floor(secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

export const Deck: React.FC<DeckProps> = ({
  deckId,
  deckState,
  analyser,
  onPlay,
  onPause,
  onStop,
  onVolumeChange,
  onPitchChange,
  onEQChange,
  onFilterChange,
  onToggleFX,
  onSetCue,
  onGoToCue,
  onSeek,
  onTriggerSync
}) => {
  const isA = deckId === 'A';
  const themeColor = isA ? 'cyan' : 'pink';
  const accentBorder = isA ? 'border-cyber-cyan/30' : 'border-cyber-pink/30';
  const accentGlowText = isA ? 'text-glow-cyan text-cyber-cyan' : 'text-glow-pink text-cyber-pink';
  const accentBgGlow = isA ? 'shadow-neon-cyan border-cyber-cyan/40' : 'shadow-neon-pink border-cyber-pink/40';
  
  // Visual state for visualizer mode
  const [visMode, setVisMode] = useState<'frequency' | 'waveform'>('frequency');

  // Knob states mapped from -12dB/+12dB (or filter freq)
  const [eqLowVal, setEqLowVal] = useState(deckState.eqLow);
  const [eqMidVal, setEqMidVal] = useState(deckState.eqMid);
  const [eqHighVal, setEqHighVal] = useState(deckState.eqHigh);
  const [filterVal, setFilterVal] = useState(50); // 0 (lowpass) - 50 (bypass) - 100 (highpass)

  // Sync state values with props
  useEffect(() => {
    setEqLowVal(deckState.eqLow);
    setEqMidVal(deckState.eqMid);
    setEqHighVal(deckState.eqHigh);
  }, [deckState.eqLow, deckState.eqMid, deckState.eqHigh]);

  // Jog Wheel rotation degree
  const [rotation, setRotation] = useState(0);
  const rotationIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (deckState.isPlaying) {
      // Rotation depends on current playback speed (pitch)
      const speedFactor = 1.0 + (deckState.pitch / 100);
      const intervalMs = 30;
      const degPerFrame = (360 / (3000 / intervalMs)) * speedFactor; // full spin every 3 seconds at normal pitch
      
      rotationIntervalRef.current = window.setInterval(() => {
        setRotation(prev => (prev + degPerFrame) % 360);
      }, intervalMs);
    } else {
      if (rotationIntervalRef.current) {
        clearInterval(rotationIntervalRef.current);
        rotationIntervalRef.current = null;
      }
    }

    return () => {
      if (rotationIntervalRef.current) clearInterval(rotationIntervalRef.current);
    };
  }, [deckState.isPlaying, deckState.pitch]);

  // Scratch interaction variables
  const isScratchingRef = useRef(false);
  const startXRef = useRef(0);
  const lastTimeRef = useRef(0);

  const handleJogMouseDown = (e: React.MouseEvent) => {
    if (!deckState.track) return;
    isScratchingRef.current = true;
    startXRef.current = e.clientX;
    lastTimeRef.current = deckState.currentTime;
    onPause(); // pause audio during scratch
  };

  const handleJogMouseMove = (e: React.MouseEvent) => {
    if (!isScratchingRef.current || !deckState.track) return;
    const deltaX = e.clientX - startXRef.current;
    
    // Scratch logic: map drag distance to audio seek time
    const scratchSensitivity = 0.05; // seconds per pixel
    let newTime = lastTimeRef.current + (deltaX * scratchSensitivity);
    
    // Clamp to track bounds
    newTime = Math.max(0, Math.min(deckState.duration, newTime));
    
    onSeek(newTime);
    // Rotate vinyl with drag
    setRotation(prev => (prev + deltaX * 0.5) % 360);
    startXRef.current = e.clientX;
    lastTimeRef.current = newTime;
  };

  const handleJogMouseUp = () => {
    if (isScratchingRef.current) {
      isScratchingRef.current = false;
      // Resume playing if it was playing before
      if (deckState.isPlaying) {
        onPlay();
      }
    }
  };

  // Process filter slider conversion
  // value: 0 - 100
  // 0 - 49: Lowpass filter (frequency: 200Hz to 2000Hz)
  // 50: Bypass (frequency: 20000Hz)
  // 51 - 100: Highpass filter (frequency: 200Hz to 8000Hz)
  const handleFilterSliderChange = (val: number) => {
    setFilterVal(val);
    if (val === 50) {
      onFilterChange('bypass', 20000);
    } else if (val < 50) {
      // Map 0-49 to log scale lowpass frequency (200Hz to 4000Hz)
      const ratio = val / 49;
      const freq = 200 + Math.pow(ratio, 2) * 3800;
      onFilterChange('lowpass', freq);
    } else {
      // Map 51-100 to log scale highpass frequency (150Hz to 6000Hz)
      const ratio = (val - 51) / 49;
      const freq = 150 + Math.pow(ratio, 2) * 5850;
      onFilterChange('highpass', freq);
    }
  };

  return (
    <div 
      className={`glass-panel border-2 rounded-3xl p-6 flex flex-col gap-6 relative select-none ${
        deckState.isPlaying ? accentBgGlow : accentBorder
      }`}
      onMouseMove={handleJogMouseMove}
      onMouseUp={handleJogMouseUp}
      onMouseLeave={handleJogMouseUp}
    >
      {/* Laser line inside header */}
      <div className={`absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent ${isA ? 'via-cyber-cyan' : 'via-cyber-pink'} to-transparent`} />

      {/* Header Deck Info */}
      <div className="flex justify-between items-center border-b border-white/5 pb-3">
        <div>
          <h3 className={`font-display text-2xl font-black uppercase tracking-widest ${accentGlowText}`}>
            DECK {deckId}
          </h3>
          <span className="font-tech text-[10px] text-gray-500 uppercase tracking-widest">
            {deckState.isPlaying ? 'GRID ON AIR' : 'DECK IDLE'}
          </span>
        </div>

        {/* BPM Counter */}
        <div className="text-right">
          <div className="font-display text-2xl font-black text-white leading-none">
            {deckState.bpm ? deckState.bpm : '---'}
          </div>
          <span className="text-[9px] font-tech text-gray-500 tracking-wider">BPM RATE</span>
        </div>
      </div>

      {/* Screen: Track Visual and Time Slider */}
      <div className="space-y-3 bg-cyber-dark/40 p-4 rounded-2xl border border-white/5">
        {/* Track Title */}
        <div className="flex items-center gap-2 text-white">
          <Music className={`w-4 h-4 ${isA ? 'text-cyber-cyan' : 'text-cyber-pink'}`} />
          <div className="overflow-hidden flex-1">
            <h4 className="text-sm font-bold uppercase tracking-wide truncate">
              {deckState.track ? deckState.track.title : '--- EMPTY DECK ---'}
            </h4>
            <p className="text-[9px] font-tech text-gray-500 uppercase tracking-wider truncate">
              {deckState.track ? deckState.track.artist : 'Load audio track from library'}
            </p>
          </div>
        </div>

        {/* Canvas Visualizer */}
        <div className="relative group">
          <WaveformVisualizer analyser={analyser} color={themeColor} mode={visMode} />
          {/* Mode Switcher Overlay */}
          <button
            onClick={() => setVisMode(prev => prev === 'frequency' ? 'waveform' : 'frequency')}
            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-black/60 hover:bg-black/90 text-white font-tech text-[8px] px-2 py-0.5 rounded tracking-widest transition-opacity cursor-pointer border border-white/10"
          >
            {visMode === 'frequency' ? 'BARS' : 'WAVE'}
          </button>
        </div>

        {/* Time slider track progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-tech text-gray-500">
            <span>{formatTime(deckState.currentTime)}</span>
            <span>{formatTime(deckState.duration)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={deckState.duration || 100}
            value={deckState.currentTime}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
            className={`w-full accent-cyber-${themeColor} bg-white/5 h-1 rounded-lg appearance-none cursor-pointer`}
            disabled={!deckState.track}
          />
        </div>
      </div>

      {/* DJ Hardware Area: Vinyl & Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        
        {/* Vinyl Jog Wheel */}
        <div className="flex flex-col items-center justify-center">
          <div
            onMouseDown={handleJogMouseDown}
            className={`w-48 h-48 rounded-full bg-cyber-dark border-4 flex items-center justify-center relative cursor-grab active:cursor-grabbing select-none ${
              deckState.isPlaying ? (isA ? 'border-cyber-cyan shadow-neon-cyan' : 'border-cyber-pink shadow-neon-pink') : 'border-white/10'
            }`}
          >
            {/* Rotating vinyl platter */}
            <div 
              className="w-[96%] h-[96%] rounded-full bg-black flex items-center justify-center relative shadow-inner"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              {/* Vinyl grooves */}
              {[...Array(6)].map((_, i) => (
                <div 
                  key={i} 
                  className="absolute rounded-full border border-white/5" 
                  style={{
                    top: `${(i + 1) * 12}px`,
                    bottom: `${(i + 1) * 12}px`,
                    left: `${(i + 1) * 12}px`,
                    right: `${(i + 1) * 12}px`
                  }}
                />
              ))}

              {/* Holographic glowing vinyl label */}
              <div className={`w-14 h-14 rounded-full bg-cyber-deep border flex items-center justify-center relative ${
                isA ? 'border-cyber-cyan bg-cyber-cyan/5' : 'border-cyber-pink bg-cyber-pink/5'
              }`}>
                <Disc className={`w-6 h-6 animate-pulse ${isA ? 'text-cyber-cyan' : 'text-cyber-pink'}`} />
                {/* White marker to visualize rotation */}
                <div className="absolute top-0 left-1/2 -ml-0.5 w-1 h-3 bg-white rounded-full" />
              </div>
            </div>
          </div>
          <span className="text-[8px] font-tech text-gray-600 uppercase tracking-widest mt-2">
            SCRATCH / JOG JAP CONTROL
          </span>
        </div>

        {/* Sliders & Parameters */}
        <div className="grid grid-cols-2 gap-4 h-full">
          {/* Deck Volume Fader */}
          <div className="flex flex-col items-center bg-cyber-dark/30 p-3 rounded-2xl border border-white/5 justify-between">
            <span className="text-[9px] font-tech text-gray-500 uppercase tracking-widest flex items-center gap-1">
              <Volume2 className="w-3 h-3" /> VOL
            </span>
            <div className="h-28 flex items-center py-2">
              <input
                type="range"
                min={0}
                max={100}
                value={deckState.volume}
                onChange={(e) => onVolumeChange(parseInt(e.target.value))}
                className="h-full accent-cyber-cyan vertical-slider cursor-pointer appearance-none bg-white/5 w-1 rounded"
                style={{ WebkitAppearance: 'slider-vertical' }}
              />
            </div>
            <span className="text-xs font-tech text-white font-bold">{deckState.volume}%</span>
          </div>

          {/* Pitch / Tempo Control */}
          <div className="flex flex-col items-center bg-cyber-dark/30 p-3 rounded-2xl border border-white/5 justify-between">
            <span className="text-[9px] font-tech text-gray-500 uppercase tracking-widest flex items-center gap-1">
              <Sliders className="w-3 h-3" /> PITCH
            </span>
            <div className="h-28 flex items-center py-2">
              <input
                type="range"
                min={-10}
                max={10}
                step={0.1}
                value={deckState.pitch}
                onChange={(e) => onPitchChange(parseFloat(e.target.value))}
                className="h-full accent-cyber-pink vertical-slider cursor-pointer appearance-none bg-white/5 w-1 rounded"
                style={{ WebkitAppearance: 'slider-vertical' }}
              />
            </div>
            <span className="text-xs font-tech text-white font-bold">
              {deckState.pitch > 0 ? `+${deckState.pitch.toFixed(1)}` : deckState.pitch.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Rotary Knobs: EQ Bands & Filters */}
      <div className="bg-cyber-dark/40 p-4 rounded-2xl border border-white/5">
        <span className="text-[9px] font-tech text-gray-500 uppercase tracking-widest block mb-4 text-center">
          Parametric Equalizer & Sweeps
        </span>
        <div className="grid grid-cols-4 gap-2 text-center">
          {/* HIGH EQ */}
          <div className="space-y-1.5 flex flex-col items-center">
            <label className="text-[8px] font-tech text-gray-400 uppercase tracking-wider">Treble</label>
            <div className="relative w-11 h-11 flex items-center justify-center knob-radial-bg rounded-full border border-white/10 shadow shadow-black">
              {/* Rotating dial wrapper */}
              <div 
                className="w-full h-full rounded-full relative flex items-center justify-center"
                style={{ transform: `rotate(${(eqHighVal / 12) * 135}deg)` }}
              >
                <div className="absolute top-1 left-1/2 -ml-0.5 w-1 h-2 bg-cyber-purple rounded-full" />
              </div>
              <input 
                type="range" 
                min={-12} 
                max={12} 
                value={eqHighVal}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setEqHighVal(val);
                  onEQChange('high', val);
                }}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
            <span className="text-[10px] font-tech text-white font-bold">{eqHighVal > 0 ? `+${Math.round(eqHighVal)}` : Math.round(eqHighVal)}</span>
          </div>

          {/* MID EQ */}
          <div className="space-y-1.5 flex flex-col items-center">
            <label className="text-[8px] font-tech text-gray-400 uppercase tracking-wider">Midrange</label>
            <div className="relative w-11 h-11 flex items-center justify-center knob-radial-bg rounded-full border border-white/10 shadow shadow-black">
              <div 
                className="w-full h-full rounded-full relative flex items-center justify-center"
                style={{ transform: `rotate(${(eqMidVal / 12) * 135}deg)` }}
              >
                <div className="absolute top-1 left-1/2 -ml-0.5 w-1 h-2 bg-cyber-purple rounded-full" />
              </div>
              <input 
                type="range" 
                min={-12} 
                max={12} 
                value={eqMidVal}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setEqMidVal(val);
                  onEQChange('mid', val);
                }}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
            <span className="text-[10px] font-tech text-white font-bold">{eqMidVal > 0 ? `+${Math.round(eqMidVal)}` : Math.round(eqMidVal)}</span>
          </div>

          {/* LOW EQ */}
          <div className="space-y-1.5 flex flex-col items-center">
            <label className="text-[8px] font-tech text-gray-400 uppercase tracking-wider">Bass</label>
            <div className="relative w-11 h-11 flex items-center justify-center knob-radial-bg rounded-full border border-white/10 shadow shadow-black">
              <div 
                className="w-full h-full rounded-full relative flex items-center justify-center"
                style={{ transform: `rotate(${(eqLowVal / 12) * 135}deg)` }}
              >
                <div className="absolute top-1 left-1/2 -ml-0.5 w-1 h-2 bg-cyber-purple rounded-full" />
              </div>
              <input 
                type="range" 
                min={-12} 
                max={12} 
                value={eqLowVal}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setEqLowVal(val);
                  onEQChange('low', val);
                }}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
            <span className="text-[10px] font-tech text-white font-bold">{eqLowVal > 0 ? `+${Math.round(eqLowVal)}` : Math.round(eqLowVal)}</span>
          </div>

          {/* FILTER SWEEP (Lowpass / Highpass) */}
          <div className="space-y-1.5 flex flex-col items-center">
            <label className="text-[8px] font-tech text-gray-400 uppercase tracking-wider">Filter HP/LP</label>
            <div className="relative w-11 h-11 flex items-center justify-center knob-radial-bg rounded-full border border-white/10 shadow shadow-black">
              {/* Center detent marker */}
              <div className="absolute inset-1 rounded-full border border-dashed border-white/5 pointer-events-none" />
              <div 
                className="w-full h-full rounded-full relative flex items-center justify-center"
                style={{ transform: `rotate(${((filterVal - 50) / 50) * 135}deg)` }}
              >
                <div className={`absolute top-1 left-1/2 -ml-0.5 w-1 h-2 rounded-full ${
                  filterVal === 50 ? 'bg-gray-600' : (filterVal < 50 ? 'bg-cyber-cyan' : 'bg-cyber-pink')
                }`} />
              </div>
              <input 
                type="range" 
                min={0} 
                max={100} 
                value={filterVal}
                onChange={(e) => handleFilterSliderChange(parseFloat(e.target.value))}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
            <span className="text-[10px] font-tech text-white font-bold font-mono">
              {filterVal === 50 ? 'BYPASS' : (filterVal < 50 ? 'LPF' : 'HPF')}
            </span>
          </div>
        </div>
      </div>

      {/* Audio FX Section */}
      <div className="bg-cyber-dark/40 p-4 rounded-2xl border border-white/5 space-y-3">
        <span className="text-[9px] font-tech text-gray-500 uppercase tracking-widest block text-center">
          Space & Time Effects Matrix
        </span>
        <div className="grid grid-cols-3 gap-2">
          {/* ECHO BUTTON */}
          <button
            onClick={() => onToggleFX('echo')}
            className={`py-2 text-[10px] font-display font-extrabold uppercase rounded-lg border transition-all cursor-pointer ${
              deckState.fxEcho
                ? (isA ? 'bg-cyber-cyan border-cyber-cyan text-cyber-dark shadow-neon-cyan' : 'bg-cyber-pink border-cyber-pink text-white shadow-neon-pink')
                : 'border-white/10 hover:border-white/30 text-gray-400'
            }`}
          >
            ECHO
          </button>

          {/* REVERB BUTTON */}
          <button
            onClick={() => onToggleFX('reverb')}
            className={`py-2 text-[10px] font-display font-extrabold uppercase rounded-lg border transition-all cursor-pointer ${
              deckState.fxReverb
                ? (isA ? 'bg-cyber-cyan border-cyber-cyan text-cyber-dark shadow-neon-cyan' : 'bg-cyber-pink border-cyber-pink text-white shadow-neon-pink')
                : 'border-white/10 hover:border-white/30 text-gray-400'
            }`}
          >
            REVERB
          </button>

          {/* FLANGER BUTTON */}
          <button
            onClick={() => onToggleFX('flanger')}
            className={`py-2 text-[10px] font-display font-extrabold uppercase rounded-lg border transition-all cursor-pointer ${
              deckState.fxFlanger
                ? (isA ? 'bg-cyber-cyan border-cyber-cyan text-cyber-dark shadow-neon-cyan' : 'bg-cyber-pink border-cyber-pink text-white shadow-neon-pink')
                : 'border-white/10 hover:border-white/30 text-gray-400'
            }`}
          >
            FLANGER
          </button>
        </div>
      </div>

      {/* Deck Controls */}
      <div className="grid grid-cols-2 gap-3 items-center mt-auto">
        <div className="grid grid-cols-3 gap-1">
          {/* Play Button */}
          <button
            onClick={onPlay}
            disabled={!deckState.track}
            className={`py-2 flex items-center justify-center rounded-lg border transition-all cursor-pointer ${
              deckState.isPlaying
                ? (isA ? 'bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan' : 'bg-cyber-pink/20 border-cyber-pink text-cyber-pink')
                : 'bg-white/5 border-white/10 hover:border-white/30 text-white disabled:opacity-30'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
          </button>

          {/* Pause Button */}
          <button
            onClick={onPause}
            disabled={!deckState.track}
            className={`py-2 flex items-center justify-center rounded-lg border bg-white/5 border-white/10 hover:border-white/30 text-white disabled:opacity-30 cursor-pointer`}
          >
            <Pause className="w-3.5 h-3.5 fill-current" />
          </button>

          {/* Stop Button */}
          <button
            onClick={onStop}
            disabled={!deckState.track}
            className="py-2 flex items-center justify-center rounded-lg border bg-white/5 border-white/10 hover:border-white/30 text-white disabled:opacity-30 cursor-pointer"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
          </button>
        </div>

        {/* Cue & Sync Operations */}
        <div className="grid grid-cols-3 gap-1">
          {/* Set Cue Button */}
          <button
            onClick={onSetCue}
            disabled={!deckState.track}
            className="py-2 text-[9px] font-display font-extrabold uppercase rounded-lg border border-white/15 bg-white/5 text-gray-300 hover:border-white/30 disabled:opacity-30 cursor-pointer"
          >
            CUE
          </button>

          {/* Go to Cue Button */}
          <button
            onClick={onGoToCue}
            disabled={!deckState.track || deckState.cuePoint === null}
            className={`py-2 text-[9px] font-display font-extrabold uppercase rounded-lg border disabled:opacity-30 cursor-pointer ${
              deckState.cuePoint !== null 
                ? (isA ? 'border-cyber-cyan text-cyber-cyan bg-cyber-cyan/5 hover:bg-cyber-cyan/20' : 'border-cyber-pink text-cyber-pink bg-cyber-pink/5 hover:bg-cyber-pink/20')
                : 'border-white/10 bg-white/5 text-gray-500'
            }`}
          >
            JUMP
          </button>

          {/* Sync Button */}
          <button
            onClick={onTriggerSync}
            disabled={!deckState.track}
            className="py-2 flex items-center justify-center gap-1 text-[9px] font-display font-extrabold uppercase rounded-lg border border-cyber-purple bg-cyber-purple/10 text-cyber-purple hover:bg-cyber-purple hover:text-white transition-colors disabled:opacity-30 cursor-pointer shadow-[0_0_10px_rgba(157,78,221,0.2)]"
          >
            <Zap className="w-3 h-3" /> SYNC
          </button>
        </div>
      </div>
    </div>
  );
};
