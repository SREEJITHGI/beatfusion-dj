import React, { useRef, useEffect } from 'react';

interface WaveformVisualizerProps {
  analyser: AnalyserNode | null;
  color: 'cyan' | 'pink' | 'purple';
  mode?: 'frequency' | 'waveform';
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  analyser,
  color,
  mode = 'frequency'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const bufferLength = analyser ? analyser.frequencyBinCount : 128;
    const dataArray = new Uint8Array(bufferLength);

    const drawColors = {
      cyan: {
        glow: 'rgba(0, 243, 255, 0.8)',
        fillStart: 'rgba(0, 243, 255, 0.8)',
        fillEnd: 'rgba(0, 100, 255, 0.1)',
        line: '#00f3ff'
      },
      pink: {
        glow: 'rgba(255, 0, 127, 0.8)',
        fillStart: 'rgba(255, 0, 127, 0.8)',
        fillEnd: 'rgba(255, 0, 100, 0.1)',
        line: '#ff007f'
      },
      purple: {
        glow: 'rgba(157, 78, 221, 0.8)',
        fillStart: 'rgba(157, 78, 221, 0.8)',
        fillEnd: 'rgba(100, 0, 255, 0.1)',
        line: '#9d4edd'
      }
    };

    const palette = drawColors[color] || drawColors.cyan;

    const renderFrame = () => {
      const width = rect.width;
      const height = rect.height;

      // Clear with slight alpha to create motion blur trail
      ctx.fillStyle = 'rgba(7, 3, 17, 0.2)';
      ctx.fillRect(0, 0, width, height);

      if (!analyser) {
        // Draw idle line
        ctx.lineWidth = 2;
        ctx.strokeStyle = palette.line;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        
        animationRef.current = requestAnimationFrame(renderFrame);
        return;
      }

      if (mode === 'frequency') {
        analyser.getByteFrequencyData(dataArray);

        const barWidth = (width / bufferLength) * 1.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const percent = dataArray[i] / 255;
          const barHeight = percent * height * 0.85;

          // Draw neon glowing bars
          const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
          gradient.addColorStop(0, palette.fillStart);
          gradient.addColorStop(1, palette.fillEnd);

          ctx.fillStyle = gradient;
          ctx.shadowBlur = 8;
          ctx.shadowColor = palette.glow;
          
          ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
          
          ctx.shadowBlur = 0; // reset shadow
          x += barWidth;
        }
      } else {
        analyser.getByteTimeDomainData(dataArray);

        ctx.lineWidth = 3;
        ctx.strokeStyle = palette.line;
        ctx.shadowBlur = 10;
        ctx.shadowColor = palette.glow;
        ctx.beginPath();

        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        ctx.lineTo(width, height / 2);
        ctx.stroke();
        ctx.shadowBlur = 0; // reset shadow
      }

      animationRef.current = requestAnimationFrame(renderFrame);
    };

    renderFrame();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyser, color, mode]);

  return (
    <div className="w-full h-24 bg-cyber-dark/80 rounded-lg overflow-hidden border border-white/5 relative">
      <canvas ref={canvasRef} className="w-full h-full block" />
      {/* Decorative scale lines */}
      <div className="absolute inset-0 flex flex-col justify-between p-1 pointer-events-none opacity-20 text-[7px] font-tech text-gray-500">
        <div>+12dB</div>
        <div className="border-t border-dashed border-gray-600 w-full" />
        <div>0dB</div>
        <div className="border-t border-dashed border-gray-600 w-full" />
        <div>-Infinity</div>
      </div>
    </div>
  );
};
