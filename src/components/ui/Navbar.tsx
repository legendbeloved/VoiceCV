import React, { useEffect, useState } from 'react';
import { Home, Menu, Mic2, Moon, Sparkles, Sun, X, Target, Mail, Upload, Route, Database, Settings } from 'lucide-react';
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
    { label: 'ATS Optimizer', href: '/ats-optimizer', icon: Target, active: location.pathname === '/ats-optimizer' },
    { label: 'Cover Letter', href: '/cover-letter', icon: Mail, active: location.pathname === '/cover-letter' },
    { label: 'Import', href: '/import', icon: Upload, active: location.pathname === '/import' },
    { label: 'Career Path', href: '/career-path', icon: Route, active: location.pathname === '/career-path' },
    { label: 'Vault', href: '/vault', icon: Database, active: location.pathname === '/vault' },
    { label: 'Settings', href: '/settings', icon: Settings, active: location.pathname === '/settings' },
  ];

  const desktopLinks = [
    { label: 'Record', href: '/record' },
    { label: 'Profiles', href: '/profiles' },
    { label: 'ATS', href: '/ats-optimizer' },
    { label: 'Cover letter', href: '/cover-letter' },
    { label: 'Import', href: '/import' },
    { label: 'Career path', href: '/career-path' },
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

      <nav className="hidden lg:flex items-center gap-1 xl:gap-2" aria-label="Primary navigation">
        {desktopLinks.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={`rounded-lg px-2.5 py-2 text-[10px] font-black uppercase tracking-[0.16em] transition-all duration-200 xl:px-3 xl:tracking-[0.2em] ${isActive ? 'bg-[var(--accent-soft)] text-[var(--text)] shadow-sm ring-1 ring-[var(--accent)]/45' : 'text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]'}`}
            >
              {item.label}
            </Link>
          );
        })}
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
              className="fixed left-4 right-4 top-24 z-50 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-3xl border border-[var(--border)] bg-[var(--bg)] p-3 shadow-[var(--shadow)] lg:hidden scrollbar-thin"
              aria-label="Mobile navigation"
            >
              <div className="mb-2 rounded-2xl bg-[var(--surface)] px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-[0.26em] text-[var(--accent)]">Menu</p>
              </div>

              <div className="space-y-0.5">
                {mobileLinks.map((item) => {
                  const Icon = item.icon;
                  const content = (
                    <span className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 transition-all ${item.active ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--text)]' : 'border-transparent text-[var(--muted)] hover:border-[var(--border)] hover:bg-[var(--surface)] hover:text-[var(--text)]'}`}>
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${item.active ? 'bg-[var(--accent)] text-[var(--on-accent)]' : 'bg-[var(--surface)] text-[var(--accent)]'}`}>
                        <Icon size={14} />
                      </span>
                      <span className="font-display text-[11px] font-bold uppercase tracking-[0.08em]">{item.label}</span>
                    </span>
                  );

                  return (
                    <Link key={item.label} to={item.href} onClick={() => setIsMenuOpen(false)}>
                      {content}
                    </Link>
                  );
                })}
              </div>

              <div className="mt-3 flex justify-end border-t border-[var(--border)] pt-3">
                <Button
                  variant="icon"
                  aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                  onClick={onThemeToggle}
                  className="h-10 w-10"
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
