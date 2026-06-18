import React, { useRef, useEffect } from 'react';

interface WaveformVisualizerProps {
  isRecording: boolean;
  getFrequencyData: () => Uint8Array | null;
  isPaused?: boolean;
  isComplete?: boolean;
}

export function WaveformVisualizer({ 
  isRecording, 
  getFrequencyData, 
  isPaused = false,
  isComplete = false 
}: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;
      const styles = getComputedStyle(document.documentElement);
      const accent = styles.getPropertyValue('--accent').trim() || '#2E5CFF';
      const warm = styles.getPropertyValue('--warm').trim() || '#D97706';
      const border = styles.getPropertyValue('--border').trim() || 'rgba(148, 163, 184, 0.25)';
      const success = styles.getPropertyValue('--success').trim() || '#10B981';

      ctx.clearRect(0, 0, width, height);

      const freqData = getFrequencyData();
      const barCount = 40;
      const barWidth = 4;
      const gap = 6;
      const totalWidth = barCount * (barWidth + gap) - gap;
      const startX = (width - totalWidth) / 2;

      // Draw baseline or results line
      if (!isRecording && !isComplete) {
        ctx.beginPath();
        ctx.moveTo(startX, centerY);
        ctx.lineTo(startX + totalWidth, centerY);
        ctx.strokeStyle = border;
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (isComplete) {
        ctx.beginPath();
        ctx.moveTo(startX, centerY);
        ctx.lineTo(startX + totalWidth, centerY);
        ctx.strokeStyle = success;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      if (isRecording || isPaused) {
        if (isPaused) {
          ctx.globalAlpha = 0.5;
        }

        for (let i = 0; i < barCount; i++) {
          let amplitude = 0;
          if (freqData) {
            // Map freqData to barCount
            const freqIdx = Math.floor((i / barCount) * freqData.length);
            amplitude = freqData[freqIdx];
          }

          // Map 0-255 to 4px to 80px
          const barHeight = Math.max(4, (amplitude / 255) * 80);
          const x = startX + i * (barWidth + gap);
          
          ctx.fillStyle = amplitude > 180 ? warm : accent;
          ctx.beginPath();
          ctx.roundRect(x, centerY - barHeight / 2, barWidth, barHeight, 3);
          ctx.fill();
        }

        ctx.globalAlpha = 1.0;
      }

      if (isRecording && !isPaused) {
        animationRef.current = requestAnimationFrame(draw);
      }
    };

    if (isRecording && !isPaused) {
      animationRef.current = requestAnimationFrame(draw);
    } else {
      draw();
    }

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [isRecording, getFrequencyData, isPaused, isComplete]);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={120}
      className="w-full max-w-full"
      aria-label="Audio waveform visualizer"
      role="img"
    />
  );
}
