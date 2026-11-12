import React, { useEffect, useState } from 'react';
import { Menu, Mic2, Moon, Sparkles, Sun, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from './Button';
import { motion, AnimatePresence } from 'motion/react';
import type { ThemeMode } from '../../App';

interface NavbarProps {
  onLogoClick: () => void;
  theme: ThemeMode;
  onThemeToggle: () => void;
}

const groups = [
  {
    label: 'Create',
    links: [
      { label: 'Record', href: '/record' },
      { label: 'Import', href: '/import' },
    ],
  },
  {
    label: 'Improve',
    links: [
      { label: 'ATS', href: '/ats-optimizer' },
      { label: 'Cover letter', href: '/cover-letter' },
      { label: 'Career path', href: '/career-path' },
      { label: 'Interview', href: '/interview' },
    ],
  },
  {
    label: 'Library',
    links: [
      { label: 'Profiles', href: '/profiles' },
      { label: 'Vault', href: '/vault' },
      { label: 'Themes', href: '/themes' },
      { label: 'Settings', href: '/settings' },
      { label: 'Premium', href: '/upgrade' },
    ],
  },
];

export function Navbar({ onLogoClick, theme, onThemeToggle }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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
    <header className="fixed top-0 left-0 right-0 z-50 h-20 px-4 sm:px-6 flex items-center justify-between gap-3 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_88%,transparent)] backdrop-blur-3xl pointer-events-auto">
      <button className="flex min-w-0 items-center gap-2 text-left sm:gap-3" onClick={handleLogoClick} aria-label="Go to VoiceCV home">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)] shadow-lg shadow-brand-violet/20 sm:h-10 sm:w-10">
          <Mic2 size={18} className="text-[var(--on-accent)]" />
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="font-display text-base font-extrabold uppercase leading-none text-[var(--text)] sm:text-xl">VoiceCV</span>
          <span className="hidden text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--accent)] sm:block">Career Engine</span>
        </div>
      </button>

      <nav className="hidden xl:flex items-center gap-4" aria-label="Primary navigation">
        {groups.map((group) => (
          <div key={group.label} className="flex items-center gap-1">
            <span className="mr-1 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--muted)]">{group.label}</span>
            {group.links.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`rounded-lg px-2.5 py-2 text-[11px] font-bold transition-all duration-200 ${isActive ? 'bg-[var(--accent-soft)] text-[var(--text)] ring-1 ring-[var(--accent)]/45' : 'text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]'}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="flex items-center gap-2 sm:gap-3">
        <Button
          variant="icon"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          tooltip={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          onClick={onThemeToggle}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </Button>
        <Link to="/record" className="hidden sm:block">
          <Button size="sm" leftIcon={<Sparkles size={14} />}>
            Start
          </Button>
        </Link>
        <Button
          variant="icon"
          className="xl:hidden"
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
              className="fixed inset-0 top-20 z-[70] bg-black/55 xl:hidden"
            />
            <motion.nav
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              style={{ backgroundColor: 'var(--bg)' }}
              className="fixed left-3 right-3 top-24 z-[80] max-h-[calc(100dvh-7rem)] overflow-y-auto rounded-3xl border border-[var(--border)] p-4 shadow-[var(--shadow)] xl:hidden"
              aria-label="Mobile navigation"
            >
              {groups.map((group) => (
                <div key={group.label} className="mb-4">
                  <p className="px-2 pb-2 text-[10px] font-black uppercase tracking-[0.22em] text-[var(--accent)]">{group.label}</p>
                  <div className="space-y-1">
                    {group.links.map((item) => {
                      const isActive = location.pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={() => setIsMenuOpen(false)}
                          aria-current={isActive ? 'page' : undefined}
                          className={`block rounded-xl px-3 py-3 text-sm font-bold ${isActive ? 'bg-[var(--accent-soft)] text-[var(--text)]' : 'text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]'}`}
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
              <Link to="/record" onClick={() => setIsMenuOpen(false)} className="block">
                <Button className="w-full" leftIcon={<Sparkles size={16} />}>Record your story</Button>
              </Link>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
