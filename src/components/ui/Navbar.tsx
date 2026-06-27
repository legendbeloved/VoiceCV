import React, { useEffect, useState } from 'react';
import { FileText, Home, Menu, Mic2, Moon, Sparkles, Sun, X, Users, Target, Mail, Upload, Route, Palette, Briefcase, Database, Settings, MessageSquare } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from './Button';
import { motion, AnimatePresence } from 'motion/react';
import type { ThemeMode } from '../../App';

interface NavbarProps {
  onLogoClick: () => void;
  theme: ThemeMode;
  onThemeToggle: () => void;
}

export function Navbar({ onLogoClick, theme, onThemeToggle }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const mobileLinks = [
    { label: 'Home', href: '/', icon: Home, active: location.pathname === '/' },
    { label: 'Record', href: '/record', icon: Mic2, active: location.pathname === '/record' },
    { label: 'Profiles', href: '/profiles', icon: Users, active: location.pathname === '/profiles' },
    { label: 'ATS Optimizer', href: '/ats-optimizer', icon: Target, active: location.pathname === '/ats-optimizer' },
    { label: 'Cover Letter', href: '/cover-letter', icon: Mail, active: location.pathname === '/cover-letter' },
    { label: 'Import', href: '/import', icon: Upload, active: location.pathname === '/import' },
    { label: 'Career Path', href: '/career-path', icon: Route, active: location.pathname === '/career-path' },
    { label: 'Themes', href: '/themes', icon: Palette, active: location.pathname === '/themes' },
    { label: 'Portfolio', href: '/portfolio', icon: Briefcase, active: location.pathname === '/portfolio' },
    { label: 'Vault', href: '/vault', icon: Database, active: location.pathname === '/vault' },
    { label: 'Interview', href: '/interview', icon: MessageSquare, active: location.pathname === '/interview' },
    { label: 'Settings', href: '/settings', icon: Settings, active: location.pathname === '/settings' },
  ];

  const handleLogoClick = () => {
    setIsMenuOpen(false);
    onLogoClick();
    navigate('/');
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false);
    };

    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-20 px-4 sm:px-8 flex items-center justify-between border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_88%,transparent)] backdrop-blur-3xl pointer-events-auto">
      <button className="flex items-center gap-3 text-left" onClick={handleLogoClick} aria-label="Go to VoiceCV home">
        <div className="w-10 h-10 bg-[var(--accent)] rounded-xl flex items-center justify-center shadow-lg shadow-brand-violet/20">
          <Mic2 size={20} className="text-[var(--on-accent)]" />
        </div>
        <div className="flex flex-col">
          <span className="font-display font-extrabold text-xl leading-none text-[var(--text)] uppercase">VoiceCV</span>
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--accent)]">Career Engine</span>
        </div>
      </button>

      <nav className="hidden lg:flex items-center gap-8">
        <Link to="/record" className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--muted)] hover:text-[var(--text)] transition-all duration-300">Record</Link>
        <Link to="/profiles" className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--muted)] hover:text-[var(--text)] transition-all duration-300">Profiles</Link>
        <Link to="/ats-optimizer" className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--muted)] hover:text-[var(--text)] transition-all duration-300">ATS</Link>
        <Link to="/cover-letter" className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--muted)] hover:text-[var(--text)] transition-all duration-300">Cover Letter</Link>
        <Link to="/career-path" className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--muted)] hover:text-[var(--text)] transition-all duration-300">Career Path</Link>
      </nav>

      <div className="flex items-center gap-4">
        <Button
          variant="icon"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          tooltip={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          onClick={onThemeToggle}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </Button>
        <Link to="/record" className="hidden md:block">
          <Button size="sm" leftIcon={<Sparkles size={14} />}>
            Start
          </Button>
        </Link>
        <Button
          variant="icon"
          className="lg:hidden"
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.button
              aria-label="Close menu backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 top-20 z-40 bg-black/35 backdrop-blur-sm lg:hidden"
            />
            <motion.nav
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="fixed left-4 right-4 top-24 z-50 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-3xl border border-[var(--border)] bg-[var(--bg)] p-4 shadow-[var(--shadow)] lg:hidden"
              aria-label="Mobile navigation"
            >
              <div className="mb-3 rounded-2xl bg-[var(--surface)] p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.26em] text-[var(--accent)]">Menu</p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Move through the VoiceCV flow or access all features.</p>
              </div>

              <div className="space-y-2">
                {mobileLinks.map((item) => {
                  const Icon = item.icon;
                  const content = (
                    <span className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all ${item.active ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--text)]' : 'border-transparent text-[var(--muted)] hover:border-[var(--border)] hover:bg-[var(--surface)] hover:text-[var(--text)]'}`}>
                      <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${item.active ? 'bg-[var(--accent)] text-[var(--on-accent)]' : 'bg-[var(--surface)] text-[var(--accent)]'}`}>
                        <Icon size={16} />
                      </span>
                      <span className="font-display text-sm font-bold uppercase tracking-[0.08em]">{item.label}</span>
                    </span>
                  );

                  return (
                    <Link key={item.label} to={item.href} onClick={() => setIsMenuOpen(false)}>
                      {content}
                    </Link>
                  );
                })}
              </div>

              <div className="mt-4 flex justify-end">
                <Button
                  variant="icon"
                  aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                  onClick={onThemeToggle}
                  className="h-12 w-12"
                >
                  {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </Button>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
