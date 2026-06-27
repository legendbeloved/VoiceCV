import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Route, ArrowRight, TrendingUp, BookOpen, Clock, Sparkles, Target, AlertCircle } from 'lucide-react';
import { useVoiceCVStore } from '../store/useVoiceCVStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { suggestCareerPath, CareerPathSuggestion } from '../lib/gemini';
import { useNavigate } from 'react-router-dom';

export default function CareerPathPage({ onToast }: { onToast: (msg: string, v: 'success' | 'error' | 'info') => void }) {
  const { assets } = useVoiceCVStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<CareerPathSuggestion | null>(null);

  const handleAnalyze = async () => {
    if (!assets) {
      onToast('Generate a profile first to get career path suggestions.', 'error');
      return;
    }
    setLoading(true);
    try {
      const result = await suggestCareerPath(assets);
      setSuggestion(result);
      onToast('Career path analysis complete.', 'success');
    } catch (error) {
      const msg = error instanceof Error && error.message.includes('API key')
        ? 'Gemini API key is missing.'
        : 'Analysis failed. Please try again.';
      onToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto w-full max-w-6xl space-y-8">
      <header>
        <p className="text-xs font-black uppercase tracking-[0.28em] text-[var(--accent)]">Career Path Suggestions</p>
        <h1 className="mt-3 text-4xl sm:text-5xl font-display font-extrabold text-[var(--text)]">Discover your next career move</h1>
        <p className="mt-4 text-[var(--muted)] max-w-2xl">AI analyzes your experience, skills, and strengths to suggest career progression paths, identify skill gaps, and recommend courses.</p>
      </header>

      {!assets ? (
        <Card variant="solid" padding="lg" className="text-center py-16">
          <AlertCircle size={48} className="mx-auto mb-4 text-[var(--muted)] opacity-40" />
          <p className="text-lg font-bold text-[var(--text)] mb-2">No profile data</p>
          <p className="text-sm text-[var(--muted)] mb-6">Record your career story or import a profile first to get personalized career path suggestions.</p>
          <Button onClick={() => navigate('/record')} rightIcon={<ArrowRight size={18} />}>Go to Recording</Button>
        </Card>
      ) : !suggestion ? (
        <Card variant="solid" padding="lg" className="text-center py-16">
          <Route size={48} className="mx-auto mb-4 text-[var(--accent)] opacity-60" />
          <p className="text-lg font-bold text-[var(--text)] mb-2">Ready to analyze your career path</p>
          <p className="text-sm text-[var(--muted)] mb-6">Based on your profile as <span className="text-[var(--accent)]">{assets.role}</span>, we can suggest progression paths, skill gaps, and learning resources.</p>
          <Button onClick={handleAnalyze} loading={loading} size="lg" rightIcon={<Sparkles size={18} />}>
            Analyze Career Path
          </Button>
        </Card>
      ) : (
        <div className="space-y-8">
          <Card variant="solid" padding="lg" className="space-y-4">
            <div className="flex items-center gap-3">
              <Target size={20} className="text-[var(--accent)]" />
              <h2 className="font-display text-xl font-bold text-[var(--text)]">Current Role</h2>
            </div>
            <p className="text-lg font-bold text-[var(--accent)]">{suggestion.currentRole}</p>
            {suggestion.overallAdvice && (
              <p className="text-sm leading-7 text-[var(--muted)] mt-3 p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">{suggestion.overallAdvice}</p>
            )}
          </Card>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {suggestion.suggestedRoles.map((role, i) => (
              <motion.div
                key={role.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card variant="solid" padding="lg" className="space-y-4 h-full flex flex-col">
                  <div className="flex items-start justify-between">
                    <h3 className="font-display text-lg font-bold text-[var(--text)]">{role.title}</h3>
                    <Badge className={role.matchScore >= 80 ? 'bg-green-500/10 text-green-400 border-green-500/20' : role.matchScore >= 60 ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}>
                      {role.matchScore}% match
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                    <Clock size={14} />
                    <span>Timeline: {role.timeline}</span>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-2">Skills Required</p>
                    <div className="flex flex-wrap gap-1.5">
                      {role.skillsRequired.map((skill) => (
                        <Badge key={skill} className="text-[10px] border-[var(--border)] bg-[var(--surface)] text-[var(--text)]">{skill}</Badge>
                      ))}
                    </div>
                  </div>

                  {role.skillsGap.length > 0 && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-red-400 mb-2">Skills Gap</p>
                      <div className="flex flex-wrap gap-1.5">
                        {role.skillsGap.map((skill) => (
                          <Badge key={skill} className="text-[10px] bg-red-500/10 text-red-400 border-red-500/20">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {role.recommendedCourses.length > 0 && (
                    <div className="mt-auto">
                      <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-2 flex items-center gap-1.5">
                        <BookOpen size={12} /> Recommended Courses
                      </p>
                      <div className="space-y-2">
                        {role.recommendedCourses.map((course, j) => (
                          <div key={j} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
                            <p className="text-sm font-bold text-[var(--text)]">{course.name}</p>
                            <p className="text-xs text-[var(--accent)]">{course.provider}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center pt-8">
            <Button variant="ghost" onClick={() => { setSuggestion(null); }} leftIcon={<Route size={16} />}>
              Analyze Again
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
