import React, { useState, useRef, useEffect } from 'react';
import { Upload, Music, Users, Award, Play, Activity, Bell, Disc, FileAudio } from 'lucide-react';
import type { Track } from '../context/DJMixerContext';

interface DJDashboardProps {
  user: { name: string; role: string; email: string };
  tracks: Track[];
  onUploadTrack: (track: Track) => void;
  onSelectTrack: (deck: 'A' | 'B', track: Track) => void;
  onEnterStudio: () => void;
}

export const DJDashboard: React.FC<DJDashboardProps> = ({
  user,
  tracks,
  onUploadTrack,
  onSelectTrack,
  onEnterStudio
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  
  // Preview audio state for Listeners
  const [previewTrackId, setPreviewTrackId] = useState<string | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
    };
  }, []);

  const handlePreview = (track: Track) => {
    if (previewTrackId === track.id) {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
      setPreviewTrackId(null);
    } else {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
      const audio = new Audio(track.url);
      audio.loop = true;
      audio.play().catch(err => console.log("Audio play blocked", err));
      previewAudioRef.current = audio;
      setPreviewTrackId(track.id);
    }
  };

  // Drag handers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.name.endsWith('.mp3') && !file.name.endsWith('.wav') && !file.name.endsWith('.ogg')) {
      setUploadMsg('Error: Invalid format. Node accepts .mp3, .wav, or .ogg only.');
      return;
    }

    setUploadMsg('Analyzing BPM and sync grids...');
    
    setTimeout(() => {
      const randomBpm = Math.floor(Math.random() * 25) + 110; // 110 - 135 bpm
      const localUrl = URL.createObjectURL(file);
      
      const newTrack: Track = {
        id: `user-track-${Date.now()}`,
        title: file.name.substring(0, file.name.lastIndexOf('.')),
        artist: user.name,
        genre: 'User Upload',
        bpm: randomBpm,
        duration: 180, // dummy duration
        url: localUrl
      };

      onUploadTrack(newTrack);
      setUploadMsg(`Successfully loaded: ${file.name} (Detected ${randomBpm} BPM).`);
      
      setTimeout(() => setUploadMsg(''), 4000);
    }, 1500);
  };

  // Mock Notifications (Cleared sample data)
  const notifications = [
    { id: 1, text: "Identity verified. Session sync completed on the BeatFusion grid.", time: "Just now" }
  ];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-8 text-left z-20 relative">
      {/* Top Banner Profile Summary */}
      <div className="glass-panel border-cyber-cyan/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyber-cyan/5 rounded-full blur-[60px] pointer-events-none" />
        
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-cyber-cyan to-cyber-purple flex items-center justify-center font-display text-white font-black text-2xl shadow-neon-cyan select-none">
            {user.name.substring(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-2xl font-extrabold text-white tracking-wide uppercase">{user.name}</h2>
              <span className="px-2 py-0.5 bg-cyber-purple/20 border border-cyber-purple/40 text-cyber-purple text-[9px] font-tech font-bold uppercase rounded">
                {user.role}
              </span>
            </div>
            <p className="text-gray-400 text-xs font-tech">{user.email}</p>
          </div>
        </div>

        {user.role !== 'Listener' && (
          <div className="flex items-center gap-4">
            <button
              onClick={onEnterStudio}
              className="px-6 py-3 bg-cyber-pink hover:bg-cyber-pink/90 text-white font-display font-extrabold tracking-widest text-xs rounded-lg transition-all shadow-neon-pink hover:scale-[1.02] cursor-pointer flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              LAUNCH DJ CONSOLE
            </button>
          </div>
        )}
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {user.role === 'Listener' ? (
          <>
            <div className="glass-panel border-white/5 p-4 rounded-xl flex items-center gap-4">
              <div className="p-3 bg-cyber-cyan/10 rounded-lg text-cyber-cyan">
                <Music className="w-5 h-5" />
              </div>
              <div>
                <div className="text-gray-500 font-tech uppercase text-[10px] tracking-wider">MIXES LISTENED</div>
                <div className="font-display font-bold text-xl text-white">42</div>
              </div>
            </div>

            <div className="glass-panel border-white/5 p-4 rounded-xl flex items-center gap-4">
              <div className="p-3 bg-cyber-pink/10 rounded-lg text-cyber-pink">
                <Disc className="w-5 h-5" />
              </div>
              <div>
                <div className="text-gray-500 font-tech uppercase text-[10px] tracking-wider">FAVORITE GENRE</div>
                <div className="font-display font-bold text-base text-cyber-pink">SYNTHWAVE</div>
              </div>
            </div>

            <div className="glass-panel border-white/5 p-4 rounded-xl flex items-center gap-4">
              <div className="p-3 bg-cyber-purple/10 rounded-lg text-cyber-purple">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="text-gray-500 font-tech uppercase text-[10px] tracking-wider">GRID REPUTATION</div>
                <div className="font-display font-bold text-xl text-white">2.4K XP</div>
              </div>
            </div>

            <div className="glass-panel border-white/5 p-4 rounded-xl flex items-center gap-4">
              <div className="p-3 bg-cyber-yellow/10 rounded-lg text-cyber-yellow">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <div className="text-gray-500 font-tech uppercase text-[10px] tracking-wider">LIVE GRID STREAMS</div>
                <div className="font-display font-bold text-base text-cyber-green animate-pulse">12 ACTIVE</div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="glass-panel border-white/5 p-4 rounded-xl flex items-center gap-4">
              <div className="p-3 bg-cyber-cyan/10 rounded-lg text-cyber-cyan">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-gray-500 font-tech uppercase text-[10px] tracking-wider">SPECTATOR FOLLOWERS</div>
                <div className="font-display font-bold text-xl text-white">14.8K</div>
              </div>
            </div>

            <div className="glass-panel border-white/5 p-4 rounded-xl flex items-center gap-4">
              <div className="p-3 bg-cyber-pink/10 rounded-lg text-cyber-pink">
                <Disc className="w-5 h-5" />
              </div>
              <div>
                <div className="text-gray-500 font-tech uppercase text-[10px] tracking-wider">RECORDED MIXES</div>
                <div className="font-display font-bold text-xl text-white">{tracks.filter(t => !t.isProcedural).length + 3}</div>
              </div>
            </div>

            <div className="glass-panel border-white/5 p-4 rounded-xl flex items-center gap-4">
              <div className="p-3 bg-cyber-purple/10 rounded-lg text-cyber-purple">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="text-gray-500 font-tech uppercase text-[10px] tracking-wider">BATTLE RANK</div>
                <div className="font-display font-bold text-xl text-white">MASTER III</div>
              </div>
            </div>

            <div className="glass-panel border-white/5 p-4 rounded-xl flex items-center gap-4">
              <div className="p-3 bg-cyber-yellow/10 rounded-lg text-cyber-yellow">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <div className="text-gray-500 font-tech uppercase text-[10px] tracking-wider">LIVE LISTENERS</div>
                <div className="font-display font-bold text-xl text-white">3,850</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Track Manager & Library */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-panel border-white/5 p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="font-display text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Music className="w-5 h-5 text-cyber-cyan" /> Music Library
              </h3>
              <span className="font-tech text-xs text-cyber-cyan">{tracks.length} Tracks Syncing</span>
            </div>

            <div className="divide-y divide-white/5 max-h-96 overflow-y-auto pr-2 space-y-2">
              {tracks.map((track) => (
                <div key={track.id} className="py-2.5 flex items-center justify-between hover:bg-white/5 px-2 rounded-lg transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyber-dark rounded border border-white/5 text-cyber-purple group-hover:text-cyber-cyan transition-colors">
                      <FileAudio className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wide">{track.title}</h4>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-tech">
                        {track.artist} • {track.genre} • {track.bpm} BPM
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {user.role === 'Listener' ? (
                      <button
                        onClick={() => handlePreview(track)}
                        className={`px-3 py-1 font-tech text-[10px] font-bold uppercase rounded transition-all cursor-pointer border ${
                          previewTrackId === track.id
                            ? 'bg-cyber-pink text-white border-cyber-pink shadow-neon-pink animate-pulse'
                            : 'bg-cyber-cyan/20 hover:bg-cyber-cyan text-cyber-cyan hover:text-black border-cyber-cyan/30 hover:shadow-neon-cyan'
                        }`}
                      >
                        {previewTrackId === track.id ? 'STOP PREVIEW' : 'PLAY PREVIEW'}
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => onSelectTrack('A', track)}
                          className="px-2.5 py-1 bg-cyber-pink/20 hover:bg-cyber-pink text-white hover:text-black font-tech text-[10px] font-bold uppercase rounded transition-all cursor-pointer border border-cyber-pink/30 hover:shadow-neon-pink"
                        >
                          LOAD A
                        </button>
                        <button
                          onClick={() => onSelectTrack('B', track)}
                          className="px-2.5 py-1 bg-cyber-cyan/20 hover:bg-cyber-cyan text-black hover:bg-cyber-cyan font-tech text-[10px] font-bold uppercase rounded transition-all cursor-pointer border border-cyber-cyan/30 hover:shadow-neon-cyan"
                        >
                          LOAD B
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Drag & Drop Audio Upload Container */}
          {user.role !== 'Listener' && (
            <div className="glass-panel border-white/5 p-6 rounded-2xl space-y-4">
              <h3 className="font-display text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Upload className="w-5 h-5 text-cyber-pink" /> Drag & Drop Audio Upload
              </h3>

              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all ${
                  dragActive 
                    ? 'border-cyber-pink bg-cyber-pink/5 scale-[0.99]' 
                    : 'border-white/10 hover:border-cyber-pink/50 hover:bg-white/5'
                }`}
              >
                <Upload className={`w-10 h-10 mb-4 transition-transform ${dragActive ? 'text-cyber-pink animate-bounce' : 'text-gray-600'}`} />
                <p className="text-xs text-gray-400 font-sans mb-1 text-center">
                  Drag and drop your <span className="text-cyber-pink font-bold">.mp3</span> or <span className="text-cyber-pink font-bold">.wav</span> loops here
                </p>
                <p className="text-[10px] text-gray-600 uppercase tracking-widest font-tech text-center">
                  or click below to browse directories
                </p>

                <label className="mt-4 px-4 py-2 bg-cyber-deep border border-cyber-pink hover:bg-cyber-pink hover:text-white text-cyber-pink text-xs font-display font-extrabold tracking-widest rounded-lg transition-all cursor-pointer">
                  BROWSE CORES
                  <input
                    type="file"
                    accept="audio/mp3, audio/wav, audio/mpeg"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>

              {uploadMsg && (
                <div className="p-3 bg-cyber-dark border border-cyber-pink/30 rounded-lg text-xs font-tech text-center text-cyber-pink animate-pulse">
                  {uploadMsg}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar Info & Alerts */}
        <div className="space-y-6">
          
          {/* Notifications feed */}
          <div className="glass-panel border-white/5 p-6 rounded-2xl space-y-4">
            <h3 className="font-display text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Bell className="w-5 h-5 text-cyber-yellow" /> Neural Notifications
            </h3>
            <div className="space-y-3">
              {notifications.map((n) => (
                <div key={n.id} className="p-3 bg-cyber-dark/60 border border-white/5 rounded-xl text-xs space-y-1">
                  <p className="text-gray-300 leading-normal">{n.text}</p>
                  <span className="text-[10px] font-tech text-cyber-yellow/70 block text-right">{n.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Analytics telemetry sparkline simulation */}
          <div className="glass-panel border-white/5 p-6 rounded-2xl space-y-4">
            <h3 className="font-display text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyber-purple" /> Telemetry Charts
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-1 bg-cyber-dark/50 p-3 rounded-lg border border-white/5">
                <div className="flex justify-between text-xs font-tech">
                  <span className="text-gray-500 uppercase">MATRIX LOAD</span>
                  <span className="text-cyber-cyan font-bold">42%</span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-cyber-cyan h-full w-[42%] rounded-full shadow-neon-cyan" />
                </div>
              </div>

              <div className="space-y-1 bg-cyber-dark/50 p-3 rounded-lg border border-white/5">
                <div className="flex justify-between text-xs font-tech">
                  <span className="text-gray-500 uppercase">STREAM QUALITY</span>
                  <span className="text-cyber-pink font-bold">100%</span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-cyber-pink h-full w-[100%] rounded-full shadow-neon-pink" />
                </div>
              </div>

              <div className="space-y-1 bg-cyber-dark/50 p-3 rounded-lg border border-white/5">
                <div className="flex justify-between text-xs font-tech">
                  <span className="text-gray-500 uppercase">CPU NODE SYNC</span>
                  <span className="text-cyber-purple font-bold">68%</span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-cyber-purple h-full w-[68%] rounded-full shadow-neon-purple" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
