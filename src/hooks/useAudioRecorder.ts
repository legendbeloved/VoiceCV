import { useState, useRef, useEffect, useCallback } from 'react';
import { useVoiceCVStore, AudioState } from '../store/useVoiceCVStore';

export function useAudioRecorder() {
  const {
    audioBlob,
    setAudioBlob,
    error,
    setError,
    audioState,
    setAudioState,
    recordingTime: timeLeft,
    setRecordingTime: setTimeLeft,
  } = useVoiceCVStore();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const formattedTime = `0:${timeLeft.toString().padStart(2, '0')}`;

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, []);

  const startRecording = async () => {
    try {
      setError(null);
      chunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Audio Analysis Setup
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 128;
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      // MediaRecorder Setup
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus' 
        : 'audio/mp4';
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        setAudioState('complete');
        cleanup();
      };

      mediaRecorder.start();
      setAudioState('recording');
      setTimeLeft(60);

      timerRef.current = window.setInterval(() => {
        const currentTime = useVoiceCVStore.getState().recordingTime;
        if (currentTime <= 1) {
          stopRecording();
          setTimeLeft(0);
        } else {
          setTimeLeft(currentTime - 1);
        }
      }, 1000);

    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError("Microphone access denied. Please click the lock icon in your browser's address bar and set Microphone to 'Allow' to continue.");
        } else if (err.name === 'NotFoundError') {
          setError("No microphone found. Please connect a recording device and try again.");
        } else {
          setError("Could not access microphone. Please check your browser permissions or use a different browser.");
        }
      } else {
        setError("Microphone access blocked. Check your browser settings and try again.");
      }
      console.error("Recording error:", err);
    }
  };

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setAudioState('paused');
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setAudioState('recording');
      timerRef.current = window.setInterval(() => {
        const currentTime = useVoiceCVStore.getState().recordingTime;
        if (currentTime <= 1) {
          stopRecording();
          setTimeLeft(0);
        } else {
          setTimeLeft(currentTime - 1);
        }
      }, 1000);
    }
  };

  const resetRecording = () => {
    cleanup();
    setAudioBlob(null);
    setAudioState('idle');
    setTimeLeft(60);
    setError(null);
  };

  const getFrequencyData = useCallback(() => {
    if (!analyserRef.current) return null;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    return dataArray;
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
    audioState,
    timeLeft,
    formattedTime,
    getFrequencyData,
    audioBlob,
    error
  };
}
