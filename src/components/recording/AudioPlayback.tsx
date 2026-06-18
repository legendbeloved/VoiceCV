import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause } from 'lucide-react';
import { Button } from '../ui/Button';

interface AudioPlaybackProps {
  audioBlob: Blob;
}

export function AudioPlayback({ audioBlob }: AudioPlaybackProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    const url = URL.createObjectURL(audioBlob);
    setAudioUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [audioBlob]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const onTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const onLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const onEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const onScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full p-5 rounded-3xl flex items-center gap-5 border border-[var(--border)] bg-[var(--surface)]">
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onLoadedMetadata}
          onEnded={onEnded}
          hidden
        />
      )}
      
      <Button
        variant="icon"
        onClick={togglePlay}
        className="w-14 h-14 bg-[var(--warm)] text-[var(--bg)] shadow-[0_0_20px_rgba(245,158,11,0.24)]"
      >
        {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
      </Button>

      <div className="flex-1 space-y-2">
        <div className="flex justify-between text-[10px] font-mono text-[var(--muted)] uppercase tracking-widest">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <input
          type="range"
          min="0"
          max={duration || 0}
          step="0.1"
          value={currentTime}
          onChange={onScrub}
          className="w-full h-1 rounded-full appearance-none cursor-pointer accent-brand-violet"
          style={{
            background: `linear-gradient(to right, var(--accent) ${duration ? (currentTime / duration) * 100 : 0}%, var(--border) ${duration ? (currentTime / duration) * 100 : 0}%)`
          }}
        />
      </div>

      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 12px;
          height: 12px;
          background: var(--accent);
          border-radius: 50%;
          border: 2px solid var(--bg);
          cursor: pointer;
          box-shadow: 0 0 10px rgba(46, 92, 255, 0.35);
        }
        input[type="range"]::-moz-range-thumb {
          width: 12px;
          height: 12px;
          background: var(--accent);
          border-radius: 50%;
          border: 2px solid var(--bg);
          cursor: pointer;
          box-shadow: 0 0 10px rgba(46, 92, 255, 0.35);
        }
      `}</style>
    </div>
  );
}
