import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Database, Search, Filter, Trash2, 
  Eye, FileText, Clock, ChevronRight,
  MoreVertical, Download, Star
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Link } from 'react-router-dom';

interface SavedCV {
  id: string;
  role: string;
  date: string;
  status: 'complete' | 'draft';
  score: number;
}

export default function VaultPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock data for initial UI - will be replaced with Firestore real-time sync
  const [items] = useState<SavedCV[]>([
    { id: '1', role: 'Full Stack Engineer', date: '2024-05-01', status: 'complete', score: 98 },
    { id: '2', role: 'Product Manager', date: '2024-04-28', status: 'complete', score: 92 },
    { id: '3', role: 'UI/UX Designer', date: '2024-04-25', status: 'draft', score: 85 },
    { id: '4', role: 'DevOps Architect', date: '2024-04-20', status: 'complete', score: 95 },
  ]);

  const filteredItems = items.filter(item => 
    item.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <header className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-violet/10 flex items-center justify-center text-brand-violet">
            <Database size={24} />
          </div>
          <div>
            <h1 className="text-4xl font-display font-black tracking-tight uppercase">Local Vault</h1>
            <p className="text-white/40 text-xs font-bold tracking-[0.3em] uppercase">Multi-Document History</p>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 mt-8">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand-violet transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search your career engine history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:ring-2 focus:ring-brand-violet/30 transition-all font-medium"
            />
          </div>
          <Button variant="secondary" className="flex gap-2">
            <Filter size={18} />
            Filter
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           className="group cursor-pointer"
        >
          <Link to="/record">
            <div className="h-full border-2 border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center p-8 hover:border-brand-violet/50 hover:bg-brand-violet/5 transition-all text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/20 group-hover:text-brand-violet group-hover:scale-110 transition-all">
                <FileText size={32} />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg">New Session</h3>
                <p className="text-xs text-white/40">Record a new voice pitch</p>
              </div>
            </div>
          </Link>
        </motion.div>

        {filteredItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card variant="glass" className="group h-full flex flex-col p-8 hover:border-brand-violet/30 transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2">
                <button className="p-2 text-white/10 hover:text-white/40 transition-colors">
                  <MoreVertical size={16} />
                </button>
              </div>

              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/60">
                   <FileText size={24} />
                </div>
                <Badge className={item.score > 90 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-brand-violet/10 text-brand-violet border-brand-violet/20'}>
                   {item.score} Score
                </Badge>
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-display font-bold mb-1 group-hover:text-brand-violet transition-colors">{item.role}</h3>
                <p className="text-xs text-white/40 flex items-center gap-2 mb-4">
                  <Clock size={12} />
                  Saved {item.date}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                   <Badge variant="outline" className="text-[9px] uppercase border-white/5">Resume</Badge>
                   <Badge variant="outline" className="text-[9px] uppercase border-white/5">Cover Letter</Badge>
                   <Badge variant="outline" className="text-[9px] uppercase border-white/5">LinkedIn</Badge>
                </div>
              </div>

              <div className="flex gap-2">
                <Link to={`/portfolio/${item.id}`} className="flex-1">
                  <Button className="w-full text-xs py-2 px-0 font-bold uppercase tracking-widest">
                    Open Profile
                  </Button>
                </Link>
                <Button variant="ghost" className="p-3 text-white/20 hover:text-destructive">
                   <Trash2 size={16} />
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-16 flex flex-col items-center py-12 border-t border-white/5">
        <div className="flex items-center gap-1 mb-4">
           {[1,2,3,4,5].map(i => <Star key={i} size={14} className="text-voice-amber fill-voice-amber" />)}
        </div>
        <p className="text-sm font-bold text-white/40 uppercase tracking-widest text-center">
           Your professional legacy, secured in the vault.
        </p>
      </div>
    </div>
  );
}
