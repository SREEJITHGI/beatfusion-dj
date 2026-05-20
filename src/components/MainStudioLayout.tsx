import React, { useState, useEffect } from 'react';
import { useDJMixer } from '../context/DJMixerContext';
import { getPresetTracks } from '../data/musicLibraryData';
import { LandingPage } from './LandingPage';
import { AuthSystem } from './AuthSystem';
import { DJDashboard } from './DJDashboard';
import { Deck } from './Deck';
import { AIPanel } from './AIPanel';
import { CommunityHub } from './CommunityHub';
import { AdminPanel } from './AdminPanel';
import { WaveformVisualizer } from './WaveformVisualizer';
import { 
  Disc, Volume2, ShieldAlert, Keyboard, Download, HelpCircle, 
  Layers, LogIn, LogOut, Square, Activity, MessageSquare, Home,
  Settings, Database
} from 'lucide-react';
import type { Track } from '../context/DJMixerContext';
import { supabase, testSupabaseConnection, isUsingCustomConnection, supabaseUrl } from '../utils/supabaseClient';

export const MainStudioLayout: React.FC = () => {
  const {
    deckA,
    deckB,
    crossfader,
    masterVolume,
    isRecording,
    recordedUrl,
    analyserMaster,
    analyserA,
    analyserB,
    play,
    pause,
    stop,
    setVolume,
    setPitch,
    setEQ,
    setFilter,
    toggleFX,
    setCrossfader,
    setMasterVolume,
    setCue,
    goToCue,
    seekTrack,
    triggerAISync,
    startRecording,
    stopRecording,
    loadTrack
  } = useDJMixer();

  // Navigation Tab State
  const [activeTab, setActiveTab] = useState<'landing' | 'studio' | 'dashboard' | 'community' | 'admin'>('landing');
  
  // Auth state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<{ name: string; role: 'DJ' | 'Listener' | 'Admin'; email: string } | null>(null);

  // Track database states
  const [tracks, setTracks] = useState<Track[]>([]);

  // Database Connection settings state
  const [isDbOffline, setIsDbOffline] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [dbUrlInput, setDbUrlInput] = useState('');
  const [dbKeyInput, setDbKeyInput] = useState('');
  const [testResult, setTestResult] = useState<{ success?: boolean; error?: string } | null>(null);
  const [testingConnection, setTestingConnection] = useState(false);


  // Auto transition animation state
  const [transitioning, setTransitioning] = useState(false);

  // Recording counter state
  const [recSeconds, setRecSeconds] = useState(0);

  // Initialize session and tracks on mount
  useEffect(() => {
    // 1. Load preset tracks
    const loadedPresets = getPresetTracks();
    setTracks(loadedPresets);

    // Verify connectivity on mount
    const checkDbConnection = async () => {
      const conn = await testSupabaseConnection();
      if (!conn.success) {
        setIsDbOffline(true);
        console.warn("Supabase connection is offline. Initializing local sandbox mode.");
      }
    };
    checkDbConnection();

    // 2. Fetch custom tracks from Supabase database
    const fetchCustomTracks = async () => {
      try {
        const { data, error } = await supabase
          .from('tracks')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data) {
          const customTracks: Track[] = data.map((item: any) => ({
            id: item.id.toString(),
            title: item.title,
            artist: item.artist,
            genre: item.genre,
            bpm: item.bpm,
            duration: Number(item.duration),
            url: item.url,
            isProcedural: item.is_procedural || false
          }));
          setTracks(() => {
            const all = [...customTracks, ...loadedPresets];
            const unique = all.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
            return unique;
          });
          return;
        }
      } catch (err) {
        console.error('Error fetching custom tracks:', err);
      }

      // Load custom tracks from localStorage as fallback
      const storedTracks = localStorage.getItem('BEATFUSION_LOCAL_TRACKS');
      if (storedTracks) {
        try {
          const parsed = JSON.parse(storedTracks);
          setTracks(() => {
            const all = [...parsed, ...loadedPresets];
            const unique = all.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
            return unique;
          });
        } catch (e) {
          console.error('Failed to parse local tracks:', e);
        }
      }
    };

    fetchCustomTracks();

    // 3. Check current session
    const loadSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          setUser({
            name: profile?.name || session.user.user_metadata?.name || session.user.email?.split('@')[0].toUpperCase() || 'USER',
            role: (profile?.role || session.user.user_metadata?.role || 'Listener') as 'DJ' | 'Listener' | 'Admin',
            email: session.user.email || '',
          });
          return;
        }
      } catch (err) {
        console.warn('Failed to load session from Supabase:', err);
      }

      // Local session check
      const localUser = localStorage.getItem('BEATFUSION_ACTIVE_USER');
      if (localUser) {
        try {
          setUser(JSON.parse(localUser));
        } catch (e) {
          console.error('Failed to load local user session:', e);
        }
      }
    };
    loadSession();

    // 4. Listen to auth state changes
    let subscription: any = null;
    try {
      const res = supabase.auth.onAuthStateChange(async (_event: any, session: any) => {
        if (session?.user) {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            setUser({
              name: profile?.name || session.user.user_metadata?.name || session.user.email?.split('@')[0].toUpperCase() || 'USER',
              role: (profile?.role || session.user.user_metadata?.role || 'Listener') as 'DJ' | 'Listener' | 'Admin',
              email: session.user.email || '',
            });
          } catch (profileErr) {
            setUser({
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0].toUpperCase() || 'USER',
              role: (session.user.user_metadata?.role || 'Listener') as 'DJ' | 'Listener' | 'Admin',
              email: session.user.email || '',
            });
          }
        } else {
          // If no supabase session, make sure we aren't clearing an active local user session
          const localUser = localStorage.getItem('BEATFUSION_ACTIVE_USER');
          if (!localUser) {
            setUser(null);
          }
        }
      });
      subscription = res?.data?.subscription;
    } catch (e) {
      console.warn('Failed to set up auth state change subscriber:', e);
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Sync Recording clock
  useEffect(() => {
    let timer: number | null = null;
    if (isRecording) {
      setRecSeconds(0);
      timer = window.setInterval(() => {
        setRecSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timer) clearInterval(timer);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRecording]);

  // Keyboard shortcuts event listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is inputting text in form or chat elements
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      switch (e.code) {
        // Spacebar: Play/Pause Deck A
        case 'Space':
          e.preventDefault();
          if (deckA.isPlaying) pause('A'); else play('A');
          break;
        
        // Enter: Play/Pause Deck B
        case 'Enter':
          e.preventDefault();
          if (deckB.isPlaying) pause('B'); else play('B');
          break;
        
        // Arrows: Crossfader adjust
        case 'ArrowLeft':
          e.preventDefault();
          setCrossfader(Math.max(-1, crossfader - 0.1));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setCrossfader(Math.min(1, crossfader + 0.1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setCrossfader(0.0); // Reset to center
          break;

        // Deck A FX Hotkeys: Q (Echo), W (Reverb), E (Flanger)
        case 'KeyQ':
          toggleFX('A', 'echo');
          break;
        case 'KeyW':
          toggleFX('A', 'reverb');
          break;
        case 'KeyE':
          toggleFX('A', 'flanger');
          break;

        // Deck B FX Hotkeys: I (Echo), O (Reverb), P (Flanger)
        case 'KeyI':
          toggleFX('B', 'echo');
          break;
        case 'KeyO':
          toggleFX('B', 'reverb');
          break;
        case 'KeyP':
          toggleFX('B', 'flanger');
          break;

        // Sync BPM shortcut
        case 'KeyS':
          triggerAISync();
          break;

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deckA.isPlaying, deckB.isPlaying, crossfader]);

  // Automatically load first tracks into decks once generated
  useEffect(() => {
    if (tracks.length >= 2 && !deckA.track && !deckB.track) {
      loadTrack('A', tracks[0]);
      loadTrack('B', tracks[1]);
    }
  }, [tracks]);

  const handleLoginSuccess = (userData: { name: string; role: 'DJ' | 'Listener' | 'Admin'; email: string }) => {
    setUser(userData);
    setShowAuthModal(false);
    setActiveTab('dashboard');
  };

  const handleUploadTrack = (newTrack: Track) => {
    setTracks(prev => [newTrack, ...prev]);
  };

  const handleSelectTrack = (deck: 'A' | 'B', track: Track) => {
    loadTrack(deck, track);
    setActiveTab('studio');
  };

  // Auto fader transition animation
  // Automatically moves crossfader to target deck ('A' = -1, 'B' = 1) over 4 seconds
  const autoTransition = (target: 'A' | 'B') => {
    if (transitioning) return;
    setTransitioning(true);

    const targetVal = target === 'A' ? -1 : 1;
    const duration = 4000; // 4s
    const steps = 40;
    const intervalMs = duration / steps;
    const stepDiff = (targetVal - crossfader) / steps;
    
    let currentX = crossfader;
    let currentStep = 0;
    const timer = window.setInterval(() => {
      currentStep++;
      currentX += stepDiff;
      // Clamp
      if (target === 'A' && currentX <= -1) {
        currentX = -1;
      } else if (target === 'B' && currentX >= 1) {
        currentX = 1;
      }
      setCrossfader(currentX);

      if (currentStep >= steps) {
        clearInterval(timer);
        setTransitioning(false);
      }
    }, intervalMs);
  };

  const formatClock = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="min-h-screen bg-cyber-dark text-white flex flex-col justify-between select-none scanlines">
      {isDbOffline && (
        <div className="bg-gradient-to-r from-red-950 via-cyber-pink/20 to-red-950 border-b border-cyber-pink/40 py-2 px-4 text-center text-xs font-tech text-cyber-pink tracking-widest flex items-center justify-center gap-2 animate-pulse z-50">
          <ShieldAlert className="w-4 h-4 text-cyber-pink shrink-0" />
          <span>DATABASE CONNECTION WARNING: DEFAULT GRID PROJECT REACHED LIMITS. RUNNING IN LOCAL OFFLINE SANDBOX.</span>
          <button 
            onClick={() => {
              const savedUrl = localStorage.getItem('BEATFUSION_SUPABASE_URL') || '';
              const savedKey = localStorage.getItem('BEATFUSION_SUPABASE_ANON_KEY') || '';
              setDbUrlInput(savedUrl);
              setDbKeyInput(savedKey);
              setTestResult(null);
              setShowSettingsModal(true);
            }} 
            className="underline text-cyber-cyan hover:text-white ml-2 font-bold cursor-pointer uppercase transition-colors"
          >
            Configure Database
          </button>
        </div>
      )}
      
      {/* Navigation Bar */}
      <nav className="glass-panel border-b border-white/5 py-4 px-6 flex items-center justify-between sticky top-0 z-40 select-none">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('landing')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyber-pink to-cyber-purple flex items-center justify-center shadow-neon-pink">
            <Disc className="w-5 h-5 text-white animate-spin-slow" />
          </div>
          <div>
            <h1 className="font-display font-black text-lg tracking-widest text-white leading-none">
              BEATFUSION <span className="text-cyber-cyan text-glow-cyan">DJ</span>
            </h1>
            <span className="font-tech text-[8px] text-gray-500 uppercase tracking-widest leading-none block">
              Neural Audio Grid • Sreejith
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="hidden md:flex items-center gap-1.5 p-1 bg-black/60 rounded-xl border border-white/5 font-tech text-xs">
          <button
            onClick={() => setActiveTab('landing')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 uppercase font-bold tracking-wider transition-all cursor-pointer ${
              activeTab === 'landing' ? 'bg-white/10 text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Home className="w-3.5 h-3.5" /> Landing
          </button>
          
          {/* Studio Console: Restricted to DJs/Admins. If not logged in, prompts modal. */}
          {(!user || user.role === 'DJ' || user.role === 'Admin') && (
            <button
              onClick={() => {
                if (!user) {
                  setShowAuthModal(true);
                } else {
                  setActiveTab('studio');
                }
              }}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 uppercase font-bold tracking-wider transition-all cursor-pointer ${
                activeTab === 'studio' ? 'bg-cyber-purple text-white shadow-neon-purple' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Studio Console
            </button>
          )}

          <button
            onClick={() => {
              if (!user) {
                setShowAuthModal(true);
              } else {
                setActiveTab('dashboard');
              }
            }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 uppercase font-bold tracking-wider transition-all cursor-pointer ${
              activeTab === 'dashboard' ? 'bg-cyber-pink text-white shadow-neon-pink' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" /> Dashboard
          </button>

          <button
            onClick={() => {
              if (!user) {
                setShowAuthModal(true);
              } else {
                setActiveTab('community');
              }
            }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 uppercase font-bold tracking-wider transition-all cursor-pointer ${
              activeTab === 'community' ? 'bg-cyber-cyan text-cyber-dark shadow-neon-cyan' : 'text-gray-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" /> Collab Arena
          </button>

          {/* Operator Core: Strictly Admins only */}
          {user && user.role === 'Admin' && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 uppercase font-bold tracking-wider transition-all cursor-pointer ${
                activeTab === 'admin' ? 'bg-cyber-yellow/20 border border-cyber-yellow/40 text-cyber-yellow' : 'text-gray-400 hover:text-white'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" /> Operator Core
            </button>
          )}
        </div>

        {/* User Session Handler */}
        <div className="flex items-center gap-3">
          {/* Settings Gear Button */}
          <button
            onClick={() => {
              const savedUrl = localStorage.getItem('BEATFUSION_SUPABASE_URL') || '';
              const savedKey = localStorage.getItem('BEATFUSION_SUPABASE_ANON_KEY') || '';
              setDbUrlInput(savedUrl);
              setDbKeyInput(savedKey);
              setTestResult(null);
              setShowSettingsModal(true);
            }}
            className="p-2 bg-white/5 border border-white/10 hover:border-cyber-cyan hover:bg-cyber-cyan/15 rounded-xl text-gray-400 hover:text-cyber-cyan transition-all cursor-pointer mr-1"
            title="Database Connection Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {user ? (
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-xl">
              <div className="text-right">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">{user.name}</h4>
                <span className="text-[8px] font-tech text-cyber-cyan uppercase tracking-widest">{user.role}</span>
              </div>
              <button
                onClick={async () => {
                  try {
                    await supabase.auth.signOut();
                  } catch (e) {
                    console.warn('Sign out connection failed:', e);
                  }
                  localStorage.removeItem('BEATFUSION_ACTIVE_USER');
                  setUser(null);
                  setActiveTab('landing');
                }}
                className="text-gray-500 hover:text-cyber-pink transition-colors cursor-pointer"
                title="Disconnect Node"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-4 py-2 bg-cyber-deep border border-cyber-cyan/50 hover:bg-cyber-cyan/15 hover:border-cyber-cyan text-cyber-cyan font-tech text-xs uppercase tracking-widest rounded-xl transition-all hover:scale-[1.03] cursor-pointer flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" /> SYNC IDENTITY
            </button>
          )}
        </div>
      </nav>

      {/* Main App Page Render Routing */}
      <main className="flex-1 w-full relative">
        {activeTab === 'landing' && (
          <LandingPage
            onEnterStudio={() => {
              if (!user) {
                setShowAuthModal(true);
              } else if (user.role === 'Listener') {
                setActiveTab('dashboard');
              } else {
                setActiveTab('studio');
              }
            }}
            onShowAuth={() => setShowAuthModal(true)}
            user={user}
          />
        )}

        {activeTab === 'dashboard' && user && (
          <DJDashboard
            user={user}
            tracks={tracks}
            onUploadTrack={handleUploadTrack}
            onSelectTrack={handleSelectTrack}
            onEnterStudio={() => setActiveTab('studio')}
          />
        )}

        {activeTab === 'community' && (
          <div className="max-w-6xl mx-auto py-8 px-4">
            <CommunityHub />
          </div>
        )}

        {activeTab === 'admin' && (
          <AdminPanel />
        )}

        {/* STUDIO CONSOLE TAB */}
        {activeTab === 'studio' && (
          <div className="max-w-7xl mx-auto py-6 px-4 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Deck A (Left) - cols 1-5 */}
              <div className="lg:col-span-5 h-full">
                <Deck
                  deckId="A"
                  deckState={deckA}
                  analyser={analyserA}
                  onPlay={() => play('A')}
                  onPause={() => pause('A')}
                  onStop={() => stop('A')}
                  onVolumeChange={(val) => setVolume('A', val)}
                  onPitchChange={(val) => setPitch('A', val)}
                  onEQChange={(band, val) => setEQ('A', band, val)}
                  onFilterChange={(type, freq) => setFilter('A', type, freq)}
                  onToggleFX={(fx) => toggleFX('A', fx)}
                  onSetCue={() => setCue('A')}
                  onGoToCue={() => goToCue('A')}
                  onSeek={(time) => seekTrack('A', time)}
                  onTriggerSync={triggerAISync}
                />
              </div>

              {/* Central Mixing Console Column - cols 6-7 */}
              <div className="lg:col-span-2 flex flex-col gap-6 h-full items-stretch justify-between glass-panel border-cyber-purple/30 rounded-3xl p-6 relative">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyber-purple to-transparent animate-pulse-glow" />

                {/* Master Volume Fader section */}
                <div className="flex flex-col items-center justify-between flex-1 bg-cyber-dark/30 p-3 border border-white/5 rounded-2xl">
                  <span className="text-[9px] font-tech text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-cyber-purple" /> Master Out
                  </span>
                  
                  <div className="h-40 flex items-center py-2">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={masterVolume}
                      onChange={(e) => setMasterVolume(parseInt(e.target.value))}
                      className="h-full accent-cyber-purple vertical-slider cursor-pointer appearance-none bg-white/5 w-1 rounded"
                      style={{ WebkitAppearance: 'slider-vertical' }}
                    />
                  </div>
                  <span className="text-xs font-tech text-white font-bold">{masterVolume}%</span>
                </div>

                {/* Master Visualizer stage */}
                <div className="space-y-1.5">
                  <span className="text-[8px] font-tech text-gray-500 uppercase tracking-widest text-center block">
                    Master Stereo Output
                  </span>
                  <WaveformVisualizer analyser={analyserMaster} color="purple" mode="waveform" />
                </div>

                {/* Crossfader controls */}
                <div className="space-y-3 bg-cyber-dark/30 p-3 rounded-2xl border border-white/5">
                  <div className="flex justify-between text-[8.5px] font-tech text-gray-500 uppercase tracking-wider leading-none">
                    <span className={crossfader < 0 ? 'text-cyber-cyan font-bold' : ''}>Deck A</span>
                    <span className={crossfader === 0 ? 'text-cyber-purple font-bold' : ''}>Center</span>
                    <span className={crossfader > 0 ? 'text-cyber-pink font-bold' : ''}>Deck B</span>
                  </div>
                  
                  <input
                    type="range"
                    min={-1}
                    max={1}
                    step={0.01}
                    value={crossfader}
                    onChange={(e) => setCrossfader(parseFloat(e.target.value))}
                    className="w-full accent-cyber-purple cursor-pointer appearance-none bg-white/5 h-1.5 rounded-lg"
                  />

                  {/* Auto-fade buttons */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    <button
                      onClick={() => autoTransition('A')}
                      disabled={transitioning}
                      className="py-1 text-[8.5px] font-tech font-bold uppercase rounded bg-cyber-cyan/10 hover:bg-cyber-cyan hover:text-black border border-cyber-cyan/20 disabled:opacity-30 cursor-pointer"
                    >
                      Fade Deck A
                    </button>
                    <button
                      onClick={() => autoTransition('B')}
                      disabled={transitioning}
                      className="py-1 text-[8.5px] font-tech font-bold uppercase rounded bg-cyber-pink/10 hover:bg-cyber-pink hover:text-white border border-cyber-pink/20 disabled:opacity-30 cursor-pointer"
                    >
                      Fade Deck B
                    </button>
                  </div>
                </div>

                {/* Master Record panel */}
                <div className="space-y-2 bg-cyber-dark/30 p-3 border border-white/5 rounded-2xl">
                  <span className="text-[8px] font-tech text-gray-500 uppercase tracking-widest block text-center">
                    Session Recorder
                  </span>
                  
                  {isRecording ? (
                    <button
                      onClick={stopRecording}
                      className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-display font-extrabold tracking-widest text-[9px] rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer animate-pulse"
                    >
                      <Square className="w-3 h-3 fill-white" />
                      STOP REC ({formatClock(recSeconds)})
                    </button>
                  ) : (
                    <button
                      onClick={startRecording}
                      className="w-full py-2 bg-cyber-deep hover:bg-red-600 hover:text-white text-red-500 border border-red-500/40 hover:border-red-600 font-display font-extrabold tracking-widest text-[9px] rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(239,68,68,0.05)]"
                    >
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                      REC LIVE MIX
                    </button>
                  )}

                  {recordedUrl && (
                    <a
                      href={recordedUrl}
                      download={`BeatFusion_LiveMix_${Date.now()}.webm`}
                      className="w-full py-2 bg-cyber-green text-cyber-dark font-display font-black tracking-widest text-[9px] rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-[0_0_10px_rgba(57,255,20,0.3)] hover:scale-[1.02]"
                    >
                      <Download className="w-3 h-3" />
                      DOWNLOAD MIX
                    </a>
                  )}
                </div>
              </div>

              {/* Deck B (Right) - cols 8-12 */}
              <div className="lg:col-span-5 h-full">
                <Deck
                  deckId="B"
                  deckState={deckB}
                  analyser={analyserB}
                  onPlay={() => play('B')}
                  onPause={() => pause('B')}
                  onStop={() => stop('B')}
                  onVolumeChange={(val) => setVolume('B', val)}
                  onPitchChange={(val) => setPitch('B', val)}
                  onEQChange={(band, val) => setEQ('B', band, val)}
                  onFilterChange={(type, freq) => setFilter('B', type, freq)}
                  onToggleFX={(fx) => toggleFX('B', fx)}
                  onSetCue={() => setCue('B')}
                  onGoToCue={() => goToCue('B')}
                  onSeek={(time) => seekTrack('B', time)}
                  onTriggerSync={triggerAISync}
                />
              </div>

            </div>

            {/* Bottom Row Controls: AI Panel (cols 1-8) & Keyboard Shortcut Help (cols 9-12) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-9 h-full">
                <AIPanel tracks={tracks} />
              </div>
              
              {/* Keyboard Help Box */}
              <div className="lg:col-span-3 h-full flex flex-col justify-between glass-panel border-white/10 rounded-3xl p-6 text-left relative">
                <div className="space-y-4">
                  <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Keyboard className="w-4 h-4 text-cyber-cyan animate-pulse" /> Terminal Hotkeys
                  </h3>
                  
                  <div className="space-y-2 text-[10px] font-tech text-gray-400">
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span>[Spacebar]</span> <span className="text-white">Play/Pause Deck A</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span>[Enter]</span> <span className="text-white">Play/Pause Deck B</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span>[L / R Arrow]</span> <span className="text-white">Pan Crossfader</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span>[Up Arrow]</span> <span className="text-white">Center Crossfader</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span>[S] Key</span> <span className="text-white">Sync Deck B to A</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span>[Q / W / E]</span> <span className="text-white">Deck A FX Matrix</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span>[I / O / P]</span> <span className="text-white">Deck B FX Matrix</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-auto border-t border-white/5">
                  <div className="p-3 bg-cyber-cyan/5 border border-cyber-cyan/20 rounded-xl flex items-start gap-2">
                    <HelpCircle className="w-4 h-4 text-cyber-cyan shrink-0 mt-0.5" />
                    <p className="text-[9px] text-gray-400 leading-normal">
                      Connect MIDI devices via USB, or connect speech mics to prompt mixing using voice inputs.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Auth overlay Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="relative">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-cyber-pink hover:bg-cyber-pink/80 text-white flex items-center justify-center font-bold shadow-neon-pink cursor-pointer z-50"
            >
              ×
            </button>
            <AuthSystem onLoginSuccess={handleLoginSuccess} />
          </div>
        </div>
      )}

      {/* Database Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-lg p-8 glass-panel border-cyber-cyan/30 rounded-2xl overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyber-cyan to-transparent animate-pulse-glow" />
            
            <button
              onClick={() => setShowSettingsModal(false)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-cyber-pink hover:bg-cyber-pink/80 text-white flex items-center justify-center font-bold shadow-neon-pink cursor-pointer z-50"
            >
              ×
            </button>

            <div className="text-center mb-6">
              <h2 className="font-display text-2xl font-extrabold tracking-widest text-glow-cyan text-white flex items-center justify-center gap-2">
                <Database className="w-6 h-6 text-cyber-cyan animate-pulse" /> GRID DATABASE CONFIG
              </h2>
              <p className="text-gray-400 text-xs uppercase tracking-wider font-tech mt-1">
                Customize your backend connection endpoints
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-tech text-gray-400 uppercase tracking-widest mb-1.5 text-left">
                  Supabase Project URL
                </label>
                <input
                  type="text"
                  value={dbUrlInput}
                  onChange={(e) => setDbUrlInput(e.target.value)}
                  className="w-full px-4 py-2.5 bg-cyber-dark border border-white/10 rounded-lg text-white font-tech placeholder-gray-700 focus:outline-none focus:border-cyber-cyan text-sm"
                  placeholder="https://your-project.supabase.co"
                />
              </div>

              <div>
                <label className="block text-xs font-tech text-gray-400 uppercase tracking-widest mb-1.5 text-left">
                  Supabase Anon Key
                </label>
                <input
                  type="password"
                  value={dbKeyInput}
                  onChange={(e) => setDbKeyInput(e.target.value)}
                  className="w-full px-4 py-2.5 bg-cyber-dark border border-white/10 rounded-lg text-white font-tech placeholder-gray-700 focus:outline-none focus:border-cyber-cyan text-sm"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                />
              </div>

              {/* Status information */}
              <div className="p-3.5 bg-black/60 border border-white/5 rounded-xl text-xs space-y-1 text-left">
                <div className="flex justify-between font-tech text-[10px]">
                  <span className="text-gray-500 uppercase">Active URL:</span>
                  <span className="text-white truncate max-w-[250px]" title={supabaseUrl}>
                    {supabaseUrl || 'None configured'}
                  </span>
                </div>
                <div className="flex justify-between font-tech text-[10px]">
                  <span className="text-gray-500 uppercase">Configuration Source:</span>
                  <span className={isUsingCustomConnection() ? 'text-cyber-pink font-bold' : 'text-cyber-green'}>
                    {isUsingCustomConnection() ? 'User LocalStorage Override' : 'System Environment Default'}
                  </span>
                </div>
              </div>

              {testResult && (
                <div className={`p-3 border rounded-lg text-xs font-tech text-center ${
                  testResult.success 
                    ? 'bg-cyber-green/10 border-cyber-green/30 text-cyber-green' 
                    : 'bg-cyber-pink/10 border-cyber-pink/30 text-cyber-pink'
                }`}>
                  {testResult.success 
                    ? '✓ CONNECTION VERIFIED: Ready for grid synchronization.' 
                    : `✗ CONNECTION FAILED: ${testResult.error || 'Check endpoints and keys.'}`}
                </div>
              )}

              <div className="grid grid-cols-3 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={async () => {
                    setTestingConnection(true);
                    setTestResult(null);
                    const res = await testSupabaseConnection(dbUrlInput.trim(), dbKeyInput.trim());
                    setTestResult(res);
                    setTestingConnection(false);
                  }}
                  disabled={testingConnection || !dbUrlInput.trim() || !dbKeyInput.trim()}
                  className="py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-tech text-xs uppercase tracking-widest rounded-lg transition-all disabled:opacity-30 cursor-pointer"
                >
                  {testingConnection ? 'Testing...' : 'Test Connection'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (dbUrlInput.trim() && dbKeyInput.trim()) {
                      localStorage.setItem('BEATFUSION_SUPABASE_URL', dbUrlInput.trim());
                      localStorage.setItem('BEATFUSION_SUPABASE_ANON_KEY', dbKeyInput.trim());
                      window.location.reload();
                    }
                  }}
                  disabled={!dbUrlInput.trim() || !dbKeyInput.trim()}
                  className="py-2.5 bg-cyber-cyan text-cyber-dark font-display font-extrabold tracking-widest text-xs rounded-lg transition-all shadow-neon-cyan hover:scale-[1.02] disabled:opacity-30 cursor-pointer text-center"
                >
                  Save & Sync
                </button>

                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('BEATFUSION_SUPABASE_URL');
                    localStorage.removeItem('BEATFUSION_SUPABASE_ANON_KEY');
                    window.location.reload();
                  }}
                  className="py-2.5 bg-cyber-pink/10 hover:bg-cyber-pink/20 border border-cyber-pink/30 text-cyber-pink font-tech text-xs uppercase tracking-widest rounded-lg transition-all cursor-pointer"
                >
                  Reset Defaults
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainStudioLayout;
