// Utility to procedurally generate synthetic loops in memory and output them as WAV Blobs.
// This guarantees zero CORS issues and allows offline operation.

// Write WAV header helper
const writeString = (view: DataView, offset: number, string: string) => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
};

const encodeWAV = (samples: Float32Array[], sampleRate: number): Blob => {
  const buffer = new ArrayBuffer(44 + samples[0].length * 2 * 2); // 16-bit stereo
  const view = new DataView(buffer);

  /* RIFF identifier */
  writeString(view, 0, 'RIFF');
  /* file length */
  view.setUint32(4, 36 + samples[0].length * 2 * 2, true);
  /* RIFF type */
  writeString(view, 8, 'WAVE');
  /* format chunk identifier */
  writeString(view, 12, 'fmt ');
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw PCM) */
  view.setUint16(20, 1, true);
  /* channel count (2 channels) */
  view.setUint16(22, 2, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * 4, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, 4, true);
  /* bits per sample */
  view.setUint16(34, 16, true);
  /* data chunk identifier */
  writeString(view, 36, 'data');
  /* data chunk length */
  view.setUint32(40, samples[0].length * 2 * 2, true);

  // Write PCM audio samples (Float32 to Int16 PCM conversion)
  let offset = 44;
  for (let i = 0; i < samples[0].length; i++) {
    // Left channel
    let sL = Math.max(-1, Math.min(1, samples[0][i]));
    view.setInt16(offset, sL < 0 ? sL * 0x8000 : sL * 0x7fff, true);
    // Right channel
    let sR = Math.max(-1, Math.min(1, samples[1][i]));
    view.setInt16(offset + 2, sR < 0 ? sR * 0x8000 : sR * 0x7fff, true);
    
    offset += 4;
  }

  return new Blob([buffer], { type: 'audio/wav' });
};

// Generates procedural Synthwave track
export const generateCyberpunkLoop = (bpm: number = 120, durationSeconds: number = 8.0): string => {
  const sampleRate = 44100;
  const numSamples = sampleRate * durationSeconds;
  const left = new Float32Array(numSamples);
  const right = new Float32Array(numSamples);

  const beatDuration = 60 / bpm;
  const stepDuration = beatDuration / 4; // sixteenth note

  // Bass notes frequencies
  const notesA = [55.00, 55.00, 48.99, 51.91]; // A1, A1, G1, G#1

  for (let i = 0; i < numSamples; i++) {
    const time = i / sampleRate;
    const currentBeat = time / beatDuration;
    
    let sample = 0;

    // 1. Kick Drum (Four-on-the-floor)
    const beatProgress = (time % beatDuration) / beatDuration;
    const kickEnv = Math.exp(-beatProgress * 15.0);
    const kickFreq = 150 * Math.exp(-beatProgress * 40.0) + 40;
    const kickVal = Math.sin(2 * Math.PI * kickFreq * (time % beatDuration)) * kickEnv;
    sample += kickVal * 0.45;

    // 2. Snare Drum (Beats 2 and 4)
    const isSnareBeat = Math.floor(currentBeat % 4) === 1 || Math.floor(currentBeat % 4) === 3;
    if (isSnareBeat) {
      const snareProgress = (time % beatDuration) / beatDuration;
      // Snare is noise + sine tone decay
      const snareEnv = Math.exp(-snareProgress * 8.0);
      const snareNoise = (Math.random() * 2 - 1) * 0.15;
      const snareTone = Math.sin(2 * Math.PI * 180 * snareProgress) * 0.1;
      sample += (snareNoise + snareTone) * snareEnv * 0.35;
    }

    // 3. Hi-hat (Eighth-note off-beats)
    const isHatStep = Math.floor(time / (beatDuration / 2)) % 2 === 1;
    if (isHatStep) {
      const hatProgress = (time % (beatDuration / 2)) / (beatDuration / 2);
      const hatEnv = Math.exp(-hatProgress * 30.0);
      const hatNoise = (Math.random() * 2 - 1) * hatEnv * 0.12;
      sample += hatNoise;
    }

    // 4. pulsing Bassline (sixteenth notes)
    const bassProgress = (time % stepDuration) / stepDuration;
    const bassEnv = Math.exp(-bassProgress * 6.0);
    const bassIndex = Math.floor(currentBeat / 4) % notesA.length;
    const bassFreq = notesA[bassIndex];
    // Sawtooth wave approximation for bass
    const bassPhase = (time * bassFreq) % 1;
    const bassVal = (2 * bassPhase - 1) * bassEnv * 0.22;
    sample += bassVal;

    // 5. Arpeggiated Lead Synth
    const arpProg = (time % (stepDuration * 2)) / (stepDuration * 2);
    const arpEnv = Math.exp(-arpProg * 4.0);
    // Simple arp pattern notes (A Minor scale)
    // A4 (440Hz), C5 (523.25Hz), E5 (659.25Hz), G5 (783.99Hz)
    const arpNotes = [440.00, 523.25, 659.25, 783.99, 880.00, 783.99, 659.25, 523.25];
    const arpStep = Math.floor(time / (stepDuration * 2)) % arpNotes.length;
    const arpFreq = arpNotes[arpStep];
    const arpPhase = (time * arpFreq) % 1.0;
    // Triangle wave approximation
    const arpVal = (4 * Math.abs(arpPhase - 0.5) - 1) * arpEnv * 0.12;
    sample += arpVal;

    // Stereo panning values
    const pan = 0.5 + 0.15 * Math.sin(2 * Math.PI * 0.25 * time); // auto-pan lead
    left[i] = sample * (1 - pan);
    right[i] = sample * pan;
  }

  const wavBlob = encodeWAV([left, right], sampleRate);
  return URL.createObjectURL(wavBlob);
};

export const generateTechnoPulseLoop = (bpm: number = 126, durationSeconds: number = 8.0): string => {
  const sampleRate = 44100;
  const numSamples = sampleRate * durationSeconds;
  const left = new Float32Array(numSamples);
  const right = new Float32Array(numSamples);

  const beatDuration = 60 / bpm;
  const stepDuration = beatDuration / 4; // sixteenth note

  // Acid bass frequency
  // E1 (41.20Hz), G1 (49.00Hz), A1 (55.00Hz), B1 (61.74Hz)
  const baseFreqs = [41.20, 48.99, 55.00, 48.99];

  for (let i = 0; i < numSamples; i++) {
    const time = i / sampleRate;
    const currentBeat = time / beatDuration;
    const currentStep = Math.floor(time / stepDuration);

    let sample = 0;

    // 1. Kick (Subby techno kick)
    const kickProgress = (time % beatDuration) / beatDuration;
    const kickEnv = Math.exp(-kickProgress * 12.0);
    const kickFreq = 130 * Math.exp(-kickProgress * 45.0) + 38;
    const kickVal = Math.sin(2 * Math.PI * kickFreq * (time % beatDuration)) * kickEnv;
    sample += kickVal * 0.5;

    // 2. Techno Hat (Offbeat sizzle)
    const isHatStep = Math.floor(time / (beatDuration / 2)) % 2 === 1;
    if (isHatStep) {
      const hatProgress = (time % (beatDuration / 2)) / (beatDuration / 2);
      const hatEnv = Math.exp(-hatProgress * 22.0);
      const hatNoise = (Math.random() * 2 - 1) * hatEnv * 0.14;
      sample += hatNoise;
    }

    // 3. Clap (Beats 2 and 4, delayed noise bursts)
    const isClapBeat = Math.floor(currentBeat % 4) === 1 || Math.floor(currentBeat % 4) === 3;
    if (isClapBeat) {
      const clapProgress = (time % beatDuration) / beatDuration;
      const clapEnv = Math.exp(-clapProgress * 10.0);
      // Double clap hit
      const clapTrigger = clapProgress < 0.05 
        ? Math.exp(-clapProgress * 50.0) * (Math.random() * 2 - 1)
        : Math.exp(-(clapProgress - 0.05) * 15.0) * (Math.random() * 2 - 1);
      sample += clapTrigger * clapEnv * 0.25;
    }

    // 4. Acid Bass sweep
    const bassProgress = (time % stepDuration) / stepDuration;
    const bassEnv = Math.exp(-bassProgress * 4.0);
    const chordIndex = Math.floor(currentBeat / 4) % baseFreqs.length;
    const rootFreq = baseFreqs[chordIndex];
    // Dynamic sixteenth note riff pattern (octave double)
    const stepOffsets = [1, 2, 1, 2.2, 1, 1.5, 2, 1.2, 1, 2, 1.5, 2, 1, 1.5, 1, 2.5];
    const scaleFactor = stepOffsets[currentStep % stepOffsets.length];
    const bassFreq = rootFreq * scaleFactor;
    
    // Sawtooth wave for acid bass
    const bassPhase = (time * bassFreq) % 1.0;
    const rawSaw = (2 * bassPhase - 1);
    
    // Lowpass envelope sweep filter simulation
    const filterEnv = Math.exp(-bassProgress * 3.0);
    const filterFreq = 300 + filterEnv * 1200;
    const filterVal = Math.sin(2 * Math.PI * filterFreq * time) * 0.5 + 0.5; // resonance wave
    
    sample += rawSaw * filterVal * bassEnv * 0.22;

    // Stereo field
    const pan = 0.5 + 0.2 * Math.cos(2 * Math.PI * 0.5 * time + 1); // pan effect
    left[i] = sample * (1 - pan);
    right[i] = sample * pan;
  }

  const wavBlob = encodeWAV([left, right], sampleRate);
  return URL.createObjectURL(wavBlob);
};
