import { generateCyberpunkLoop, generateTechnoPulseLoop } from '../utils/audioGenerator';
import type { Track } from '../context/DJMixerContext';

// A function to generate the default mock tracks
export const getPresetTracks = (): Track[] => {
  try {
    const track1Url = generateCyberpunkLoop(120, 8.0);
    const track2Url = generateTechnoPulseLoop(126, 8.0);
    const track3Url = generateCyberpunkLoop(132, 6.0); // faster
    const track4Url = generateTechnoPulseLoop(115, 10.0); // slower retro

    return [
      {
        id: 'cyberpunk-neon-ride',
        title: 'Cyberpunk Neon Ride',
        artist: 'BeatFusion AI',
        genre: 'Synthwave',
        bpm: 120,
        duration: 8,
        url: track1Url,
        isProcedural: true
      },
      {
        id: 'techno-pulse-grid',
        title: 'Techno Pulse Grid',
        artist: 'Pixel DJ',
        genre: 'Techno',
        bpm: 126,
        duration: 8,
        url: track2Url,
        isProcedural: true
      },
      {
        id: 'acid-wasteland',
        title: 'Acid Wasteland',
        artist: 'Vector Runner',
        genre: 'Electro',
        bpm: 132,
        duration: 6,
        url: track3Url,
        isProcedural: true
      },
      {
        id: 'retro-horizon',
        title: 'Retro Horizon',
        artist: 'Retrowave Grid',
        genre: 'Synthwave',
        bpm: 115,
        duration: 10,
        url: track4Url,
        isProcedural: true
      }
    ];
  } catch (e) {
    console.error("Error generating preset tracks", e);
    return [];
  }
};

// Mood options for recommendation panel
export interface Mood {
  name: string;
  energy: 'High' | 'Medium' | 'Low';
  color: string;
  associatedGenres: string[];
}

export const MOODS: Mood[] = [
  { name: 'Cyberpunk Energy', energy: 'High', color: 'text-cyber-pink border-cyber-pink', associatedGenres: ['Techno', 'Electro'] },
  { name: 'Neon Chill', energy: 'Low', color: 'text-cyber-cyan border-cyber-cyan', associatedGenres: ['Synthwave'] },
  { name: 'Retro Groove', energy: 'Medium', color: 'text-cyber-yellow border-cyber-yellow', associatedGenres: ['Synthwave', 'Electro'] },
  { name: 'Deep Space Pulse', energy: 'High', color: 'text-cyber-purple border-cyber-purple', associatedGenres: ['Techno'] }
];
