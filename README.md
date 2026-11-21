<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# VoiceCV - AI-Powered Career Coaching Studio

## 🚀 Live Demo
**Visit**: http://localhost:3000

## ✨ Features

### 🎤 Voice Recording & AI Generation
- 60-second microphone recording with real-time transcription
- AI-powered resume generation
- Cover letter generation
- LinkedIn bio creation
- ATS Optimizer (keyword matching & scoring)

### 🎨 Theme System
- **8 built-in themes**: Voyager, Minimalist, Neon, Executive, Harbor, Sage, Ink, Dusk
- **Custom theme builder**: Save your own paper/ink/accent colors
- **Theme persistence**: Saved to Supabase & localStorage
- **Responsive design**: Works on mobile, tablet, and desktop

### 👥 User Management
- **Multi-profile support**: Different profiles for different job applications
- **Document vault**: Search and save resumes, cover letters, LinkedIn profiles
- **Supabase Auth**: Secure authentication with RLS policies

### 📄 Additional Features
- **DOCX export**: Polished career document exports
- **Interview simulator**: Practice AI-generated questions
- **Career path suggestions**: Based on your story
- **Cover letter AI**: Company-agnostic prose

## 🛠️ Quick Start

### Prerequisites
- Node.js (v18+ recommended)
- Gemini API key

### Installation
```bash
npm install
```

### Configuration
1. Set `GEMINI_API_KEY` in `.env.local`
2. Configure Supabase URL and anon key in `.env.local`

### Run Locally
```bash
npm run dev
```
**Visit**: http://localhost:3000

### Deploy to Vercel
Add these 3 environment variables:
- `GEMINI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

## 📁 Project Structure

```
src/
├── components/         # UI components (Navbar, SideMenu, Footer, etc.)
├── pages/             # 16 complete pages
├── store/             # Zustand state management
├── lib/               # Utility functions (gemini, supabase, pdf, docx)
├── auth/              # Authentication & RLS policies
└── types/             # TypeScript type definitions
```

## 📊 Git History
16 commits on main branch, covering:
- Core feature implementation
- TypeScript fixes and Supabase integration
- Theme system with 8+ themes
- RLS security policies
- Voice recording & AI generation
- Sidebar navigation
- Mobile responsiveness

## 🛠️ Known Issues
- **1 pre-existing TypeScript error** in `LiveResumePreview.tsx(191)` - Markdown component `className` prop type mismatch (compile-time only, app runs fine)
- **Vite console warnings** import analysis (harmless, app functions correctly)

## 🎯 Quick Test Checklist
After running `npm run dev` and visiting http://localhost:3000:
- [ ] Page loads without errors
- [ ] Voice recording works (60s max)
- [ ] Themes selectable and persist
- [ ] AI generates resume/cover letter/LI bio
- [ ] Navigation works (navbar + side menu)
- [ ] ATS Optimizer functional
- [ ] Profile management works

## 📞 Need Help?
- Check the [scratchpad.md](scratchpad.md) for detailed status
- Visit the [GitHub repository](https://github.com/legendbeloved/VoiceCV)
- Ensure `.env.local` has required API keys