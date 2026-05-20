import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

// Interfaces for Audio Tracks
export interface Track {
  id: string;
  title: string;
  artist: string;
  genre: string;
  bpm: number;
  duration: number; // in seconds
  url: string;      // Audio file URL or generated object URL
  isProcedural?: boolean;
}

interface DeckState {
  isPlaying: boolean;
  volume: number;      // 0 - 100
  pitch: number;       // -10 to +10 (playback rate 0.9 to 1.1)
  eqLow: number;       // -12 to 12 dB
  eqMid: number;       // -12 to 12 dB
  eqHigh: number;      // -12 to 12 dB
  filterFreq: number;  // 20 to 20000 Hz
  filterType: 'lowpass' | 'highpass' | 'bypass';
  fxEcho: boolean;
  fxReverb: boolean;
  fxFlanger: boolean;
  track: Track | null;
  currentTime: number;
  duration: number;
  cuePoint: number | null;
  bpm: number;
}

interface DJMixerContextType {
  deckA: DeckState;
  deckB: DeckState;
  crossfader: number; // -1 to 1
  masterVolume: number; // 0 - 100
  isRecording: boolean;
  recordedUrl: string | null;
  voiceLogs: string[];
  aiSyncActive: boolean;
  autoRemixActive: boolean;
  voiceAssistantActive: boolean;
  
  // Mixer operations
  initAudio: () => void;
  loadTrack: (deck: 'A' | 'B', track: Track) => void;
  play: (deck: 'A' | 'B') => void;
  pause: (deck: 'A' | 'B') => void;
  stop: (deck: 'A' | 'B') => void;
  setVolume: (deck: 'A' | 'B', volume: number) => void;
  setPitch: (deck: 'A' | 'B', pitch: number) => void;
  setEQ: (deck: 'A' | 'B', band: 'low' | 'mid' | 'high', value: number) => void;
  setFilter: (deck: 'A' | 'B', type: 'lowpass' | 'highpass' | 'bypass', freq: number) => void;
  toggleFX: (deck: 'A' | 'B', fx: 'echo' | 'reverb' | 'flanger') => void;
  setCrossfader: (value: number) => void;
  setMasterVolume: (volume: number) => void;
  setCue: (deck: 'A' | 'B') => void;
  goToCue: (deck: 'A' | 'B') => void;
  seekTrack: (deck: 'A' | 'B', time: number) => void;
  
  // AI functions
  triggerAISync: () => void;
  toggleAutoRemix: () => void;
  toggleVoiceAssistant: () => void;
  
  // Recording
  startRecording: () => void;
  stopRecording: () => void;
  
  // Audio analysers for canvas rendering
  analyserMaster: AnalyserNode | null;
  analyserA: AnalyserNode | null;
  analyserB: AnalyserNode | null;
}

const defaultDeckState = (initialTrack: Track | null = null): DeckState => ({
  isPlaying: false,
  volume: 80,
  pitch: 0,
  eqLow: 0,
  eqMid: 0,
  eqHigh: 0,
  filterFreq: 10000,
  filterType: 'bypass',
  fxEcho: false,
  fxReverb: false,
  fxFlanger: false,
  track: initialTrack,
  currentTime: 0,
  duration: 0,
  cuePoint: null,
  bpm: initialTrack ? initialTrack.bpm : 120,
});

const DJMixerContext = createContext<DJMixerContextType | undefined>(undefined);

export const DJMixerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Master states
  const [crossfader, setCrossfaderState] = useState(0);
  const [masterVolume, setMasterVolumeState] = useState(80);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  
  // AI states
  const [aiSyncActive, setAiSyncActive] = useState(false);
  const [autoRemixActive, setAutoRemixActive] = useState(false);
  const [voiceAssistantActive, setVoiceAssistantActive] = useState(false);
  const [voiceLogs, setVoiceLogs] = useState<string[]>(['AI Voice Assistant offline. Press mic to activate.']);

  // Web Audio Context refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  
  // Audio elements (using HTMLAudioElement for streaming & pitch shifting support)
  const audioRefA = useRef<HTMLAudioElement | null>(null);
  const audioRefB = useRef<HTMLAudioElement | null>(null);
  
  // Audio Nodes Web API refs
  const nodesRef = useRef<{
    sourceA: MediaElementAudioSourceNode | null;
    sourceB: MediaElementAudioSourceNode | null;
    
    // Decks nodes
    eqLowA: BiquadFilterNode | null; eqLowB: BiquadFilterNode | null;
    eqMidA: BiquadFilterNode | null; eqMidB: BiquadFilterNode | null;
    eqHighA: BiquadFilterNode | null; eqHighB: BiquadFilterNode | null;
    filterA: BiquadFilterNode | null; filterB: BiquadFilterNode | null;
    gainA: GainNode | null; gainB: GainNode | null;
    
    // FX nodes Deck A
    echoDelayA: DelayNode | null; echoFeedbackA: GainNode | null; echoWetA: GainNode | null;
    reverbConvolverA: ConvolverNode | null; reverbWetA: GainNode | null;
    flangerDelayA: DelayNode | null; flangerLfoA: OscillatorNode | null; flangerWetA: GainNode | null;
    
    // FX nodes Deck B
    echoDelayB: DelayNode | null; echoFeedbackB: GainNode | null; echoWetB: GainNode | null;
    reverbConvolverB: ConvolverNode | null; reverbWetB: GainNode | null;
    flangerDelayB: DelayNode | null; flangerLfoB: OscillatorNode | null; flangerWetB: GainNode | null;
    
    // Analysers
    analyserA: AnalyserNode | null;
    analyserB: AnalyserNode | null;
    analyserMaster: AnalyserNode | null;
    
    // Master mixer stage
    masterGain: GainNode | null;
    recDest: MediaStreamAudioDestinationNode | null;
  }>({
    sourceA: null, sourceB: null,
    eqLowA: null, eqLowB: null, eqMidA: null, eqMidB: null, eqHighA: null, eqHighB: null,
    filterA: null, filterB: null, gainA: null, gainB: null,
    echoDelayA: null, echoFeedbackA: null, echoWetA: null, reverbConvolverA: null, reverbWetA: null, flangerDelayA: null, flangerLfoA: null, flangerWetA: null,
    echoDelayB: null, echoFeedbackB: null, echoWetB: null, reverbConvolverB: null, reverbWetB: null, flangerDelayB: null, flangerLfoB: null, flangerWetB: null,
    analyserA: null, analyserB: null, analyserMaster: null, masterGain: null, recDest: null
  });

  // Track state representation
  const [deckA, setDeckA] = useState<DeckState>(defaultDeckState());
  const [deckB, setDeckB] = useState<DeckState>(defaultDeckState());

  // Recorder ref
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Speech Recognition ref for Voice Assistant
  const recognitionRef = useRef<any>(null);

  // Auto remix beat trigger interval
  const remixIntervalRef = useRef<number | null>(null);

  // Setup HTML Audio elements on mount
  useEffect(() => {
    const audioA = new Audio();
    audioA.crossOrigin = "anonymous";
    audioA.loop = true;
    
    const audioB = new Audio();
    audioB.crossOrigin = "anonymous";
    audioB.loop = true;
    
    audioRefA.current = audioA;
    audioRefB.current = audioB;

    // Time update handlers
    const onTimeUpdateA = () => {
      setDeckA(prev => ({ ...prev, currentTime: audioA.currentTime }));
    };
    const onDurationChangeA = () => {
      setDeckA(prev => ({ ...prev, duration: audioA.duration || 0 }));
    };
    
    const onTimeUpdateB = () => {
      setDeckB(prev => ({ ...prev, currentTime: audioB.currentTime }));
    };
    const onDurationChangeB = () => {
      setDeckB(prev => ({ ...prev, duration: audioB.duration || 0 }));
    };

    audioA.addEventListener('timeupdate', onTimeUpdateA);
    audioA.addEventListener('durationchange', onDurationChangeA);
    audioB.addEventListener('timeupdate', onTimeUpdateB);
    audioB.addEventListener('durationchange', onDurationChangeB);

    return () => {
      audioA.pause();
      audioB.pause();
      audioA.removeEventListener('timeupdate', onTimeUpdateA);
      audioA.removeEventListener('durationchange', onDurationChangeA);
      audioB.removeEventListener('timeupdate', onTimeUpdateB);
      audioB.removeEventListener('durationchange', onDurationChangeB);
      if (remixIntervalRef.current) clearInterval(remixIntervalRef.current);
    };
  }, []);

  // Web Audio Context Initialization
  const initAudio = () => {
    if (audioCtxRef.current) return; // already initialized

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;

    // Create Analysers
    const analA = ctx.createAnalyser();
    analA.fftSize = 256;
    const analB = ctx.createAnalyser();
    analB.fftSize = 256;
    const analM = ctx.createAnalyser();
    analM.fftSize = 512;

    nodesRef.current.analyserA = analA;
    nodesRef.current.analyserB = analB;
    nodesRef.current.analyserMaster = analM;

    // Build processing chains for Deck A & B
    const createDeckChain = (
      audioElement: HTMLAudioElement,
      deckKey: 'A' | 'B',
      analyser: AnalyserNode
    ) => {
      const source = ctx.createMediaElementSource(audioElement);
      
      // EQ Nodes
      const eqLow = ctx.createBiquadFilter();
      eqLow.type = 'lowshelf';
      eqLow.frequency.value = 250;
      eqLow.Q.value = 1.0;
      eqLow.gain.value = 0;

      const eqMid = ctx.createBiquadFilter();
      eqMid.type = 'peaking';
      eqMid.frequency.value = 1000;
      eqMid.Q.value = 1.0;
      eqMid.gain.value = 0;

      const eqHigh = ctx.createBiquadFilter();
      eqHigh.type = 'highshelf';
      eqHigh.frequency.value = 4000;
      eqHigh.Q.value = 1.0;
      eqHigh.gain.value = 0;

      // Filter Sweep Node (Lowpass/Highpass)
      const filterNode = ctx.createBiquadFilter();
      filterNode.type = 'lowpass';
      filterNode.frequency.value = 20000; // start open

      // Deck Gain Node
      const gainNode = ctx.createGain();
      gainNode.gain.value = 0.8; // default volume

      // Create Delay Node (Echo)
      const delayNode = ctx.createDelay(2.0);
      delayNode.delayTime.value = 0.375; // synced-feeling delay (dotted 8th style)
      const delayFeedback = ctx.createGain();
      delayFeedback.gain.value = 0.4;
      const delayWet = ctx.createGain();
      delayWet.gain.value = 0; // wet level starts at 0

      // Connect delay feedback loop
      delayNode.connect(delayFeedback);
      delayFeedback.connect(delayNode);

      // Create Reverb Nodes
      const reverbWet = ctx.createGain();
      reverbWet.gain.value = 0;
      // Synthesize impulse response for reverb to avoid loading external files
      const convolverNode = ctx.createConvolver();
      convolverNode.buffer = createReverbImpulseResponse(ctx, 1.8, 1.5);

      // Create Flanger Nodes
      const flangerDelay = ctx.createDelay();
      flangerDelay.delayTime.value = 0.005; // 5ms baseline
      const flangerWet = ctx.createGain();
      flangerWet.gain.value = 0;
      
      const flangerLfo = ctx.createOscillator();
      flangerLfo.type = 'sine';
      flangerLfo.frequency.value = 0.25; // slow sweep (0.25 Hz)
      
      const flangerLfoDepth = ctx.createGain();
      flangerLfoDepth.gain.value = 0.002; // modulate between 3ms and 7ms
      
      flangerLfo.connect(flangerLfoDepth);
      flangerLfoDepth.connect(flangerDelay.delayTime);
      flangerLfo.start();

      // Connect source to EQs in series
      source.connect(eqLow);
      eqLow.connect(eqMid);
      eqMid.connect(eqHigh);
      eqHigh.connect(filterNode);
      filterNode.connect(gainNode);

      // Connect dry path from gainNode to analyser
      gainNode.connect(analyser);

      // Connect parallel FX paths
      // Echo FX path
      gainNode.connect(delayNode);
      delayNode.connect(delayWet);
      delayWet.connect(analyser);

      // Reverb FX path
      gainNode.connect(convolverNode);
      convolverNode.connect(reverbWet);
      reverbWet.connect(analyser);

      // Flanger FX path
      gainNode.connect(flangerDelay);
      flangerDelay.connect(flangerWet);
      flangerWet.connect(analyser);

      // Store in refs
      if (deckKey === 'A') {
        nodesRef.current.sourceA = source;
        nodesRef.current.eqLowA = eqLow;
        nodesRef.current.eqMidA = eqMid;
        nodesRef.current.eqHighA = eqHigh;
        nodesRef.current.filterA = filterNode;
        nodesRef.current.gainA = gainNode;
        
        nodesRef.current.echoDelayA = delayNode;
        nodesRef.current.echoFeedbackA = delayFeedback;
        nodesRef.current.echoWetA = delayWet;
        nodesRef.current.reverbConvolverA = convolverNode;
        nodesRef.current.reverbWetA = reverbWet;
        nodesRef.current.flangerDelayA = flangerDelay;
        nodesRef.current.flangerLfoA = flangerLfo;
        nodesRef.current.flangerWetA = flangerWet;
      } else {
        nodesRef.current.sourceB = source;
        nodesRef.current.eqLowB = eqLow;
        nodesRef.current.eqMidB = eqMid;
        nodesRef.current.eqHighB = eqHigh;
        nodesRef.current.filterB = filterNode;
        nodesRef.current.gainB = gainNode;

        nodesRef.current.echoDelayB = delayNode;
        nodesRef.current.echoFeedbackB = delayFeedback;
        nodesRef.current.echoWetB = delayWet;
        nodesRef.current.reverbConvolverB = convolverNode;
        nodesRef.current.reverbWetB = reverbWet;
        nodesRef.current.flangerDelayB = flangerDelay;
        nodesRef.current.flangerLfoB = flangerLfo;
        nodesRef.current.flangerWetB = flangerWet;
      }

      return analyser;
    };

    const outA = createDeckChain(audioRefA.current!, 'A', analA);
    const outB = createDeckChain(audioRefB.current!, 'B', analB);

    // Crossfader node gain stages (to split signals)
    const crossfaderGainA = ctx.createGain();
    const crossfaderGainB = ctx.createGain();
    
    outA.connect(crossfaderGainA);
    outB.connect(crossfaderGainB);

    // Store crossfader gains in ref properties to change on value changes
    (nodesRef.current as any).crossfaderGainA = crossfaderGainA;
    (nodesRef.current as any).crossfaderGainB = crossfaderGainB;

    // Master Gain
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.8;
    nodesRef.current.masterGain = masterGain;

    crossfaderGainA.connect(masterGain);
    crossfaderGainB.connect(masterGain);

    // Master Analyser
    masterGain.connect(analM);
    
    // Connect to physical hardware
    analM.connect(ctx.destination);

    // Create recording destination node
    const recDest = ctx.createMediaStreamDestination();
    nodesRef.current.recDest = recDest;
    masterGain.connect(recDest);

    // Call update crossfader gains
    updateCrossfaderGains(crossfader, crossfaderGainA, crossfaderGainB);

    setVoiceLogs(prev => [...prev, 'Audio Engine initialized successfully.']);
  };

  // Helper: Create a synthesized impulse response buffer for Reverb
  const createReverbImpulseResponse = (context: AudioContext, duration: number, decay: number): AudioBuffer => {
    const sampleRate = context.sampleRate;
    const length = sampleRate * duration;
    const impulse = context.createBuffer(2, length, sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        // Exponential decay envelope white noise
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      }
    }
    return impulse;
  };

  // Math to set crossfader gains: Equal-power crossfade curve
  const updateCrossfaderGains = (val: number, gainA: GainNode, gainB: GainNode) => {
    // val ranges from -1 (fully Deck A) to +1 (fully Deck B)
    const x = (val + 1) / 2; // normalize to 0 to 1
    
    // Equal power curves
    const volA = Math.cos(x * Math.PI / 2);
    const volB = Math.sin(x * Math.PI / 2);
    
    if (gainA && gainB) {
      gainA.gain.value = volA;
      gainB.gain.value = volB;
    }
  };

  // Keep crossfader gains synced on state change
  useEffect(() => {
    const gA = (nodesRef.current as any).crossfaderGainA;
    const gB = (nodesRef.current as any).crossfaderGainB;
    if (gA && gB) {
      updateCrossfaderGains(crossfader, gA, gB);
    }
  }, [crossfader]);

  // Sync master volume
  useEffect(() => {
    if (nodesRef.current.masterGain) {
      nodesRef.current.masterGain.gain.value = masterVolume / 100;
    }
  }, [masterVolume]);

  // Load Track into Deck
  const loadTrack = (deck: 'A' | 'B', track: Track) => {
    initAudio(); // ensure audio context is active
    
    const audio = deck === 'A' ? audioRefA.current : audioRefB.current;
    if (!audio) return;

    // Set audio source
    audio.src = track.url;
    audio.load();

    const deckStateUpdater = deck === 'A' ? setDeckA : setDeckB;
    deckStateUpdater(prev => ({
      ...prev,
      track,
      duration: 0,
      currentTime: 0,
      isPlaying: false,
      bpm: track.bpm,
    }));

    setVoiceLogs(prev => [...prev, `Loaded "${track.title}" on Deck ${deck}.`]);
  };

  // Deck Control Actions
  const play = async (deck: 'A' | 'B') => {
    initAudio();
    if (audioCtxRef.current?.state === 'suspended') {
      await audioCtxRef.current.resume();
    }

    const audio = deck === 'A' ? audioRefA.current : audioRefB.current;
    if (!audio || !audio.src) return;

    try {
      await audio.play();
      const deckStateUpdater = deck === 'A' ? setDeckA : setDeckB;
      deckStateUpdater(prev => ({ ...prev, isPlaying: true }));
      setVoiceLogs(prev => [...prev, `Deck ${deck} is now PLAYING.`]);
    } catch (e) {
      console.error("Play failed", e);
    }
  };

  const pause = (deck: 'A' | 'B') => {
    const audio = deck === 'A' ? audioRefA.current : audioRefB.current;
    if (!audio) return;

    audio.pause();
    const deckStateUpdater = deck === 'A' ? setDeckA : setDeckB;
    deckStateUpdater(prev => ({ ...prev, isPlaying: false }));
    setVoiceLogs(prev => [...prev, `Deck ${deck} is now PAUSED.`]);
  };

  const stop = (deck: 'A' | 'B') => {
    const audio = deck === 'A' ? audioRefA.current : audioRefB.current;
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
    const deckStateUpdater = deck === 'A' ? setDeckA : setDeckB;
    deckStateUpdater(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
    setVoiceLogs(prev => [...prev, `Deck ${deck} STOPPED.`]);
  };

  const setVolume = (deck: 'A' | 'B', volume: number) => {
    const gainNode = deck === 'A' ? nodesRef.current.gainA : nodesRef.current.gainB;
    if (gainNode) {
      // Scale from 0-100 to 0.0-1.2 max volume
      gainNode.gain.value = (volume / 100) * 1.2;
    }
    const deckStateUpdater = deck === 'A' ? setDeckA : setDeckB;
    deckStateUpdater(prev => ({ ...prev, volume }));
  };

  const setPitch = (deck: 'A' | 'B', pitch: number) => {
    // pitch is a value from -10 to +10
    // Maps to playbackRate from 0.9 to 1.1 (linear scale)
    const rate = 1.0 + (pitch / 100); 
    const audio = deck === 'A' ? audioRefA.current : audioRefB.current;
    if (audio) {
      audio.playbackRate = rate;
    }
    const deckStateUpdater = deck === 'A' ? setDeckA : setDeckB;
    deckStateUpdater(prev => ({
      ...prev,
      pitch,
      bpm: prev.track ? Math.round(prev.track.bpm * rate) : prev.bpm
    }));
  };

  const setEQ = (deck: 'A' | 'B', band: 'low' | 'mid' | 'high', value: number) => {
    // value ranges from -12dB to +12dB
    const eqNode = deck === 'A'
      ? (band === 'low' ? nodesRef.current.eqLowA : band === 'mid' ? nodesRef.current.eqMidA : nodesRef.current.eqHighA)
      : (band === 'low' ? nodesRef.current.eqLowB : band === 'mid' ? nodesRef.current.eqMidB : nodesRef.current.eqHighB);

    if (eqNode) {
      eqNode.gain.value = value;
    }

    const deckStateUpdater = deck === 'A' ? setDeckA : setDeckB;
    deckStateUpdater(prev => {
      const updated = { ...prev };
      if (band === 'low') updated.eqLow = value;
      else if (band === 'mid') updated.eqMid = value;
      else if (band === 'high') updated.eqHigh = value;
      return updated;
    });
  };

  const setFilter = (deck: 'A' | 'B', type: 'lowpass' | 'highpass' | 'bypass', freq: number) => {
    const filterNode = deck === 'A' ? nodesRef.current.filterA : nodesRef.current.filterB;
    if (filterNode) {
      if (type === 'bypass') {
        // bypass by opening completely for lowpass
        filterNode.type = 'lowpass';
        filterNode.frequency.value = 20000;
      } else {
        filterNode.type = type;
        filterNode.frequency.value = freq;
      }
    }

    const deckStateUpdater = deck === 'A' ? setDeckA : setDeckB;
    deckStateUpdater(prev => ({
      ...prev,
      filterType: type,
      filterFreq: freq,
    }));
  };

  const toggleFX = (deck: 'A' | 'B', fx: 'echo' | 'reverb' | 'flanger') => {
    const nodes = nodesRef.current;
    const isA = deck === 'A';
    
    const deckStateUpdater = isA ? setDeckA : setDeckB;
    
    deckStateUpdater(prev => {
      const updated = { ...prev };
      
      if (fx === 'echo') {
        const nextVal = !prev.fxEcho;
        updated.fxEcho = nextVal;
        const wetNode = isA ? nodes.echoWetA : nodes.echoWetB;
        if (wetNode) wetNode.gain.value = nextVal ? 0.6 : 0;
      } else if (fx === 'reverb') {
        const nextVal = !prev.fxReverb;
        updated.fxReverb = nextVal;
        const wetNode = isA ? nodes.reverbWetA : nodes.reverbWetB;
        if (wetNode) wetNode.gain.value = nextVal ? 0.5 : 0;
      } else if (fx === 'flanger') {
        const nextVal = !prev.fxFlanger;
        updated.fxFlanger = nextVal;
        const wetNode = isA ? nodes.flangerWetA : nodes.flangerWetB;
        if (wetNode) wetNode.gain.value = nextVal ? 0.5 : 0;
      }
      
      return updated;
    });

    setVoiceLogs(prev => [...prev, `Toggled ${fx.toUpperCase()} on Deck ${deck}.`]);
  };

  const setCue = (deck: 'A' | 'B') => {
    const audio = deck === 'A' ? audioRefA.current : audioRefB.current;
    if (!audio) return;
    
    const current = audio.currentTime;
    const deckStateUpdater = deck === 'A' ? setDeckA : setDeckB;
    deckStateUpdater(prev => ({ ...prev, cuePoint: current }));
    setVoiceLogs(prev => [...prev, `Cue set at ${current.toFixed(2)}s on Deck ${deck}.`]);
  };

  const goToCue = (deck: 'A' | 'B') => {
    const audio = deck === 'A' ? audioRefA.current : audioRefB.current;
    const state = deck === 'A' ? deckA : deckB;
    if (!audio || state.cuePoint === null) return;
    
    audio.currentTime = state.cuePoint;
    setVoiceLogs(prev => [...prev, `Jumped to Cue point on Deck ${deck}.`]);
  };

  const seekTrack = (deck: 'A' | 'B', time: number) => {
    const audio = deck === 'A' ? audioRefA.current : audioRefB.current;
    if (audio) {
      audio.currentTime = time;
    }
  };

  // AI Feature: Automatic Sync of BPM and Beat Matching
  const triggerAISync = () => {
    if (!deckA.track || !deckB.track) {
      setVoiceLogs(prev => [...prev, 'AI Sync Error: Both decks must have loaded tracks.']);
      return;
    }

    setAiSyncActive(true);
    setVoiceLogs(prev => [...prev, 'AI Beat Sync scanning waveforms...']);

    setTimeout(() => {
      // Sync Deck B's effective BPM to Deck A
      const targetBPM = deckA.bpm;
      const originalBPM_B = deckB.track!.bpm;
      
      // Calculate pitch percentage required
      // e.g. targetBPM = 128, originalBPM = 120 -> need multiplier 128/120 = 1.0667 (+6.67% pitch)
      const ratio = targetBPM / originalBPM_B;
      const pitchValue = (ratio - 1.0) * 100;

      // Adjust Deck B's pitch slider
      setPitch('B', pitchValue);
      
      // Sync play positions (nudge time to line up mathematically, simulate beat alignment)
      if (audioRefA.current && audioRefB.current && deckA.isPlaying && deckB.isPlaying) {
        // Nudge Deck B currentTime to start of the nearest bar
        const timeA = audioRefA.current.currentTime;
        const beatDurationA = 60 / deckA.bpm;
        const currentBeatA = timeA / beatDurationA;
        const phaseA = currentBeatA % 4; // phase within 4-beat bar

        const timeB = audioRefB.current.currentTime;
        const beatDurationB = 60 / targetBPM;
        const currentBeatB = timeB / beatDurationB;
        const targetPhaseB = phaseA; // align phases

        const expectedTimeB = (Math.floor(currentBeatB / 4) * 4 + targetPhaseB) * beatDurationB;
        if (expectedTimeB > 0 && expectedTimeB < audioRefB.current.duration) {
          audioRefB.current.currentTime = expectedTimeB;
        }
      }

      setAiSyncActive(false);
      setVoiceLogs(prev => [...prev, `AI Sync Complete: Synced Deck B to Deck A at ${targetBPM} BPM.`]);
    }, 1500);
  };

  // AI Feature: Auto Remix Mode (automatically modulates filters/effects/cuts on the beat)
  const toggleAutoRemix = () => {
    if (autoRemixActive) {
      if (remixIntervalRef.current) {
        clearInterval(remixIntervalRef.current);
        remixIntervalRef.current = null;
      }
      setAutoRemixActive(false);
      // Reset filter sweeps
      setFilter('A', 'bypass', 20000);
      setFilter('B', 'bypass', 20000);
      setVoiceLogs(prev => [...prev, 'AI Auto Remix offline.']);
    } else {
      setAutoRemixActive(true);
      setVoiceLogs(prev => [...prev, 'AI Auto Remix online: Modulating beats...']);

      // Schedule random effects toggling every 4 seconds to simulate automatic mixing drops/rises
      let beatCounter = 0;
      remixIntervalRef.current = window.setInterval(() => {
        beatCounter++;
        const targetDeck = Math.random() > 0.5 ? 'A' : 'B';
        const deckState = targetDeck === 'A' ? deckA : deckB;

        if (!deckState.isPlaying) return;

        const action = Math.floor(Math.random() * 4);
        switch(action) {
          case 0: // Filter Sweep
            setVoiceLogs(prev => [...prev, `[AI Auto Remix] Sweeping Lowpass on Deck ${targetDeck}`]);
            setFilter(targetDeck, 'lowpass', 400);
            setTimeout(() => setFilter(targetDeck, 'bypass', 20000), 2000);
            break;
          case 1: // Apply Echo delay
            setVoiceLogs(prev => [...prev, `[AI Auto Remix] Triggering Echo rise on Deck ${targetDeck}`]);
            toggleFX(targetDeck, 'echo');
            setTimeout(() => toggleFX(targetDeck, 'echo'), 3000);
            break;
          case 2: // Flanger swirl
            setVoiceLogs(prev => [...prev, `[AI Auto Remix] Triggering Flanger space sweep on Deck ${targetDeck}`]);
            toggleFX(targetDeck, 'flanger');
            setTimeout(() => toggleFX(targetDeck, 'flanger'), 4000);
            break;
          case 3: // Quick crossfade pan
            const currentX = crossfader;
            const targetX = targetDeck === 'A' ? -0.8 : 0.8;
            setVoiceLogs(prev => [...prev, `[AI Auto Remix] Automating crossfade nudge`]);
            setCrossfaderState(targetX);
            setTimeout(() => setCrossfaderState(currentX), 2000);
            break;
        }
      }, 4000);
    }
  };

  // AI Feature: Voice Assistant using speech recognition
  const toggleVoiceAssistant = () => {
    if (voiceAssistantActive) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setVoiceAssistantActive(false);
      setVoiceLogs(prev => [...prev, 'AI Voice Assistant deactivated.']);
    } else {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setVoiceLogs(prev => [...prev, 'Error: Speech Recognition API not supported in this browser.']);
        return;
      }

      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setVoiceLogs(prev => [...prev, 'Voice Assistant online. Speak commands: "play deck A", "sync", "stop"...']);
      };

      rec.onerror = (event: any) => {
        console.error("Speech error", event);
        setVoiceLogs(prev => [...prev, `Voice Assistant error: ${event.error}`]);
      };

      rec.onend = () => {
        if (voiceAssistantActive) {
          rec.start(); // restart if active
        }
      };

      rec.onresult = (event: any) => {
        const text = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
        setVoiceLogs(prev => [...prev, `Voice command heard: "${text}"`]);
        handleVoiceCommand(text);
      };

      recognitionRef.current = rec;
      rec.start();
      setVoiceAssistantActive(true);
    }
  };

  const handleVoiceCommand = (command: string) => {
    if (command.includes('play deck a') || command.includes('play a') || command.includes('deck a play')) {
      play('A');
    } else if (command.includes('play deck b') || command.includes('play b') || command.includes('deck b play')) {
      play('B');
    } else if (command.includes('pause deck a') || command.includes('pause a') || command.includes('deck a pause')) {
      pause('A');
    } else if (command.includes('pause deck b') || command.includes('pause b') || command.includes('deck b pause')) {
      pause('B');
    } else if (command.includes('stop deck a') || command.includes('stop a')) {
      stop('A');
    } else if (command.includes('stop deck b') || command.includes('stop b')) {
      stop('B');
    } else if (command.includes('sync') || command.includes('beat match')) {
      triggerAISync();
    } else if (command.includes('crossfade center') || command.includes('fade center') || command.includes('fade middle')) {
      setCrossfaderState(0);
    } else if (command.includes('crossfade a') || command.includes('fade left')) {
      setCrossfaderState(-1);
    } else if (command.includes('crossfade b') || command.includes('fade right')) {
      setCrossfaderState(1);
    } else if (command.includes('echo a') || command.includes('delay a')) {
      toggleFX('A', 'echo');
    } else if (command.includes('echo b') || command.includes('delay b')) {
      toggleFX('B', 'echo');
    } else if (command.includes('reverb a')) {
      toggleFX('A', 'reverb');
    } else if (command.includes('reverb b')) {
      toggleFX('B', 'reverb');
    } else if (command.includes('filter low pass a') || command.includes('filter a')) {
      setFilter('A', 'lowpass', 600);
    } else if (command.includes('filter bypass a') || command.includes('open a')) {
      setFilter('A', 'bypass', 20000);
    } else {
      setVoiceLogs(prev => [...prev, `Command "${command}" unrecognized. Try: "play A", "sync", "fade center"`]);
    }
  };

  // Recording functionality
  const startRecording = () => {
    initAudio();
    const dest = nodesRef.current.recDest;
    if (!dest) {
      setVoiceLogs(prev => [...prev, 'Recording error: Audio engine not ready.']);
      return;
    }

    recordedChunksRef.current = [];
    
    // Choose appropriate mime type
    let mimeType = 'audio/webm';
    if (MediaRecorder.isTypeSupported('audio/ogg')) {
      mimeType = 'audio/ogg';
    } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
      mimeType = 'audio/mp4';
    }

    try {
      const recorder = new MediaRecorder(dest.stream, { mimeType });
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const superBuffer = new Blob(recordedChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(superBuffer);
        setRecordedUrl(url);
        setIsRecording(false);
        setVoiceLogs(prev => [...prev, 'Mix recorded successfully! Check Export panel to download.']);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setRecordedUrl(null);
      setVoiceLogs(prev => [...prev, 'Recording started. Start mixing now!']);
    } catch (e) {
      console.error("Failed to start MediaRecorder", e);
      setVoiceLogs(prev => [...prev, 'Failed to start recording.']);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  return (
    <DJMixerContext.Provider value={{
      deckA,
      deckB,
      crossfader,
      masterVolume,
      isRecording,
      recordedUrl,
      voiceLogs,
      aiSyncActive,
      autoRemixActive,
      voiceAssistantActive,
      
      initAudio,
      loadTrack,
      play,
      pause,
      stop,
      setVolume,
      setPitch,
      setEQ,
      setFilter,
      toggleFX,
      setCrossfader: setCrossfaderState,
      setMasterVolume: setMasterVolumeState,
      setCue,
      goToCue,
      seekTrack,
      
      triggerAISync,
      toggleAutoRemix,
      toggleVoiceAssistant,
      
      startRecording,
      stopRecording,
      
      analyserMaster: nodesRef.current.analyserMaster,
      analyserA: nodesRef.current.analyserA,
      analyserB: nodesRef.current.analyserB,
    }}>
      {children}
    </DJMixerContext.Provider>
  );
};

export const useDJMixer = () => {
  const context = useContext(DJMixerContext);
  if (context === undefined) {
    throw new Error('useDJMixer must be used within a DJMixerProvider');
  }
  return context;
};
