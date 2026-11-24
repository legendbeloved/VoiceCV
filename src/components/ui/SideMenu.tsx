import React from 'react';
import { Menu, X, Sparkles, Mic2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './Button';
import { useVoiceCVStore } from '../../store/useVoiceCVStore';

interface SideMenuProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  user?: { name: string } | null;
  onLogout?: () => void;
}

export function SideMenu({ isOpen, setIsOpen, user, onLogout }: SideMenuProps) {
  const navigate = useLocation();
  const store = useVoiceCVStore();
  const assets = store.assets;

  const navLinks = [
    { label: 'Record', href: '/record', icon: 'Sparkles' },
    { label: 'Import', href: '/import' },
    { label: 'ATS Optimizer', href: '/ats-optimizer' },
    { label: 'Cover Letter', href: '/cover-letter' },
    { label: 'Career Path', href: '/career-path' },
    { label: 'Profiles', href: '/profiles' },
    { label: 'Vault', href: '/vault' },
    { label: 'Themes', href: '/themes' },
    { label: 'Settings', href: '/settings' },
  ];

  const userProfile = assets?.name ? `${assets.name.split(' ')[0]}` : 'User';

  return (
    <aside
      className={isOpen ? 'fixed inset-0 z-[99] bg-black/80 flex flex-col items-center pt-20' : 'hidden'}
      aria-label="Side navigation"
    >
      {isOpen && (
        <div className="flex flex-col gap-4 w-full max-w-md px-4 py-8">
          {/* Close button */}
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close side menu"
            className="absolute top-4 right-4 rounded-full bg-[var(--surface)] p-2 text-[var(--muted)] hover:text-[var(--text)] transition-colors"
          >
            <X size={24} />
          </button>

          {/* Logo */}
          <div className="text-center mb-8">
            <Mic2 size={40} className="text-[var(--accent)] mb-3" />
            <h2 className="font-display font-bold text-2xl text-[var(--text)]">VoiceCV</h2>
            <p className="text-[var(--muted)] text-sm">Career Engine</p>
          </div>

          {/* Navigation links */}
          <nav className="space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`block rounded-xl px-4 py-3 text-sm font-bold transition-colors ${
                  navigate.pathname === link.href
                    ? 'bg-[var(--accent-soft)] text-[var(--text)]'
                    : 'text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]'
                }`}
                aria-current={navigate.pathname === link.href ? 'page' : undefined}
              >
                <Sparkles size={12} className="mr-2 align-middle" />
                {link.label}
              </Link>
            ))}
          </nav>

          {/* User profile / actions */}
          <div className="pt-6 border-t border-[var(--border)] flex flex-col gap-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">Profile</p>
            <p className="font-medium text-[var(--text)]">{userProfile}</p>

            {onLogout ? (
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
                className="w-full rounded-lg py-2"
              >
                Log out
              </Button>
            ) : null}
          </div>
        </div>
      )}
    </aside>
  );
}