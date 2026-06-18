import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VoiceRecorderProps {
  onTranscriptionComplete: (text: string) => void;
  isProcessing: boolean;
}

export default function VoiceRecorder({ onTranscriptionComplete, isProcessing }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [transcription, setTranscription] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Setup Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setTranscription(finalTranscript + interimTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        if (event.error === 'not-allowed') {
          setError('Microphone access denied. Please enable it in settings.');
        }
      };

      recognitionRef.current = recognition;
    } else {
      setError('Speech recognition not supported in this browser.');
    }
  }, []);

  useEffect(() => {
    let timer: number;
    if (isRecording && timeRemaining > 0) {
      timer = window.setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && isRecording) {
      stopRecording();
    }
    return () => clearInterval(timer);
  }, [isRecording, timeRemaining]);

  const startRecording = () => {
    setIsRecording(true);
    setTranscription('');
    setTimeRemaining(60);
    setError(null);
    try {
      recognitionRef.current?.start();
    } catch (e) {
      console.error('Start failed', e);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    recognitionRef.current?.stop();
    if (transcription.trim()) {
      onTranscriptionComplete(transcription);
    } else if (!error) {
           setError('No voice detected. Please try speaking again.');
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-8">
      {/* Visual Feedback Circle */}
      <div className="relative w-64 h-64 flex items-center justify-center">
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="absolute inset-0 bg-brand-violet rounded-full blur-[40px]"
            />
          )}
        </AnimatePresence>
        
        <div className={`relative z-10 w-full h-full glass-liquid rounded-full flex flex-col items-center justify-center border-2 transition-colors duration-500 ${isRecording ? 'border-voice-amber' : 'border-white/10'}`}>
          <span className="text-4xl font-display font-bold tracking-tighter mb-2">
            {timeRemaining}s
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
            {isRecording ? 'Capturing Expertise' : 'Speak Once'}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-4 w-full">
        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={isProcessing}
            className="group relative px-12 py-5 bg-brand-violet text-white rounded-full font-display font-bold text-xl overflow-hidden active:scale-95 transition-transform hover:shadow-[0_0_40px_rgba(124,58,237,0.4)] disabled:opacity-50"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <div className="flex items-center gap-3">
              <Mic size={24} />
              Start Recording
            </div>
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="px-12 py-5 bg-white text-void-indigo rounded-full font-display font-bold text-xl flex items-center gap-3 active:scale-95 transition-transform"
          >
            <Square size={24} fill="currentColor" />
            End Session
          </button>
        )}

        <AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-voice-amber font-medium"
            >
              <Loader2 size={18} className="animate-spin" />
              Gemini is crafting your brand...
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 text-red-400 bg-red-400/10 px-4 py-2 rounded-xl text-sm"
            >
              <AlertCircle size={16} />
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Transcription Preview (Glass Card) */}
      {transcription && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full glass-liquid p-6 rounded-3xl"
        >
          <div className="flex items-center gap-2 mb-3 text-[10px] font-bold uppercase tracking-widest text-white/40">
            <Sparkles size={12} className="text-brand-violet" />
            Live Transcription
          </div>
          <p className="text-white/70 leading-relaxed italic">
            "{transcription}"
          </p>
        </motion.div>
      )}
    </div>
  );
}
