import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Zap, Mic, Send, Bot, User as UserIcon, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { useVoiceCVStore } from '../store/useVoiceCVStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { GoogleGenAI } from "@google/genai";
import { useNavigate } from 'react-router-dom';

export function InterviewSimulatorPage({ onToast }: { onToast: (m: string, v: any) => void }) {
  const navigate = useNavigate();
  const { assets } = useVoiceCVStore();
  const [messages, setMessages] = useState<{ role: 'ai' | 'user', content: string }[]>([
    { role: 'ai', content: "Hello! I'm your AI hiring manager. We've reviewed your background. Are you ready to start our mock interview session?" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMsg = inputValue;
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error('API Key missing');
      
      const ai = new GoogleGenAI({ apiKey });
      
      const context = `
        You are a supportive but professional hiring manager conducting a mock interview.
        The candidate's role: ${assets?.role || 'Professional'}
        The candidate's background: ${assets?.resume || 'Extracted from voice pitch'}
        Previous Prep Questions: ${assets?.interviewPrep || ''}
        
        Guidelines:
        1. Ask ONE question at a time.
        2. Provide brief, constructive feedback before moving to the next question.
        3. Stay in character.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: messages.concat({ role: 'user', content: userMsg }).map(m => ({
          role: m.role === 'ai' ? 'model' : 'user',
          parts: [{ text: m.content }]
        })),
        config: { systemInstruction: context }
      });

      const text = response.text;

      setMessages(prev => [...prev, { role: 'ai', content: text }]);
    } catch (error) {
      console.error(error);
      onToast('AI could not respond. Check your API key.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!assets) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-center space-y-6">
        <div className="w-20 h-20 bg-brand-violet/10 rounded-full flex items-center justify-center text-brand-violet">
          <AlertCircle size={40} />
        </div>
        <h2 className="text-3xl font-display font-bold">No Interview Prep Data</h2>
        <p className="text-white/40 max-w-md">You need to record a voice session first to generate the interview questions and context for the simulator.</p>
        <Button onClick={() => navigate('/record')}>Go to Recording</Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[1000px] mx-auto w-full h-[calc(100vh-140px)] flex flex-col gap-8 pb-8"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-black tracking-tight flex items-center gap-3">
            <MessageSquare size={28} className="text-emerald-400" />
            Interview Simulator
          </h1>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">Hiring Manager Persona Active</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
          <Sparkles size={14} className="text-voice-amber" />
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Context: {assets.role}</span>
        </div>
      </header>

      <Card variant="glass" padding="none" className="flex-1 flex flex-col overflow-hidden border-white/5 relative">
        <div className="absolute inset-0 bg-brand-violet/5 opacity-10 pointer-events-none" />
        
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth relative z-10">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: msg.role === 'ai' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}
            >
              <div className={`flex gap-4 max-w-[80%] ${msg.role === 'ai' ? 'flex-row' : 'flex-row-reverse'}`}>
                <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center border ${
                  msg.role === 'ai' ? 'bg-brand-violet/10 border-brand-violet/20 text-brand-violet' : 'bg-white/5 border-white/10 text-white/40'
                }`}>
                  {msg.role === 'ai' ? <Bot size={20} /> : <UserIcon size={20} />}
                </div>
                <div className={`rounded-2xl p-4 text-sm leading-relaxed ${
                  msg.role === 'ai' ? 'bg-white/5 text-white/80 rounded-tl-none' : 'bg-brand-violet text-white rounded-tr-none'
                }`}>
                  {msg.content}
                </div>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/5 p-4 rounded-2xl flex items-center gap-3 text-white/40">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-xs font-bold uppercase tracking-widest">Hiring Manager is thinking...</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-white/[0.02] border-t border-white/5 relative z-10">
          <div className="relative flex items-center gap-4">
            <input
              type="text"
              placeholder="Type your interview response..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-6 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-violet/30 transition-all"
            />
            <Button 
              onClick={handleSend} 
              disabled={isLoading || !inputValue}
              className="h-[52px] w-[52px] p-0 rounded-2xl flex items-center justify-center"
            >
              <Send size={20} />
            </Button>
          </div>
          <div className="flex items-center justify-center mt-4">
             <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] flex items-center gap-2">
                <Mic size={10} />
                Pro Tip: Be concise and use the STAR method
             </span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
