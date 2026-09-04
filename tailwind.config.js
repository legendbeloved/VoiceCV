/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        voidIndigo: '#101522',
        voiceAmber: '#D97706',
      },
    },
  },
  safelist: [
    // Theme preview utility classes from ThemesPage.tsx
    'bg-void-indigo',
    'bg-white', 'text-black',
    'bg-black', 'border-cyan-500/50',
    'bg-slate-900', 'border-amber-600/30',
    // Ensure theme colors don't get purged
    'bg-brand-violet',
    'bg-white/5', 'bg-white/10', 'bg-white/20', 'bg-white/30', 'bg-white/40', 'bg-white/50', 'bg-white/60',
    'bg-void-indigo/40',
    'bg-brand-violet/5', 'bg-brand-violet/10', 'bg-brand-violet/20',
    'text-white/20', 'text-white/30', 'text-white/40', 'text-white/50', 'text-white/60',
  ],
  plugins: [
    '@tailwindcss/typography',
  ],
}