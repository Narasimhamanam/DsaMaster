import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Building2, Code2, Target, ArrowRight, ExternalLink, Sparkles, Filter, X } from 'lucide-react';
import { COMPANY_TRACKS } from '../config/companyTracks';


export default function CompanyTracksPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all'); // all, product, service
  const [selectedCompany, setSelectedCompany] = useState(null);

  const filteredTracks = COMPANY_TRACKS.filter((track) => {
    if (activeFilter === 'all') return true;
    return track.type === activeFilter;
  });

  const handleStartPrep = (company) => {
    if (!company) return;
    setSelectedCompany(null);
    setTimeout(() => {
      navigate(`/roadmap?track=${company.id}&animate=true`);
    }, 300);
  };


  return (
    <div className="max-w-6xl mx-auto space-y-6 pt-4 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-text-primary flex items-center gap-2">
          <Building2 className="w-8 h-8 text-brand-400" /> Company Prep Tracks
        </h1>
        <p className="text-text-secondary text-sm">
          Targeted DSA packages recommended specifically for passing assessments of top product and service companies.
        </p>
      </div>

      {/* Filter toolbar */}
      <div className="flex items-center gap-1.5 bg-bg-secondary/20 p-4 rounded-xl border border-bg-border/40">
        <Filter className="w-4 h-4 text-text-muted mr-2" />
        {[
          { id: 'all', label: 'All Tracks' },
          { id: 'product', label: 'Product Companies' },
          { id: 'service', label: 'Service Companies' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeFilter === f.id
                ? 'bg-brand-600 text-white shadow-glow-sm'
                : 'bg-bg-hover/60 text-text-secondary hover:text-text-primary hover:bg-bg-hover'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid of Company Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTracks.map((track) => (
          <motion.div
            key={track.id}
            layout
            onClick={() => setSelectedCompany(track)}
            className={`glass-card p-6 bg-bg-secondary/40 border hover:bg-bg-hover/40 flex flex-col justify-between gap-5 cursor-pointer relative overflow-hidden group transition-all duration-300 ${track.color}`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black bg-bg-primary/50 border border-bg-border`}>
                  {track.initial}
                </div>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${track.badge}`}>
                  {track.type}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-text-primary text-base group-hover:text-brand-400 transition-colors">
                  {track.name}
                </h3>
                <div className="flex items-center gap-2 mt-1.5 text-xs text-text-secondary">
                  <span>{track.difficulty}</span>
                  <span>•</span>
                  <span>{track.problems}</span>
                </div>
                <p className="text-text-muted text-xs mt-3 leading-relaxed line-clamp-2">
                  {track.desc}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-bg-border/30 flex justify-between items-center text-xs">
              <span className="text-text-muted">
                {track.topics.length} core topics
              </span>
              <span className="text-brand-400 group-hover:text-brand-300 font-bold flex items-center gap-1">
                View Track <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal for detailed track view */}
      <AnimatePresence>
        {selectedCompany && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-bg-secondary border border-bg-border p-6 rounded-2xl shadow-xl relative space-y-6"
            >
              <button
                onClick={() => setSelectedCompany(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-bg-hover text-text-muted hover:text-text-primary"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-4 border-b border-bg-border/40 pb-4">
                <div className="w-14 h-14 rounded-2xl bg-bg-primary border border-bg-border flex items-center justify-center text-xl font-black text-brand-400">
                  {selectedCompany.initial}
                </div>
                <div>
                  <h3 className="font-bold text-text-primary text-lg">{selectedCompany.name} Preparation Track</h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-text-muted">
                    <span>{selectedCompany.difficulty}</span>
                    <span>•</span>
                    <span>{selectedCompany.problems}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-text-secondary uppercase mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Focus Strategy
                  </h4>
                  <p className="text-xs text-text-secondary leading-relaxed bg-bg-primary/20 p-3 rounded-lg border border-bg-border/30">
                    {selectedCompany.desc}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-text-secondary uppercase mb-2">
                    Recommended Topics
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCompany.topics.map((t) => (
                      <span key={t} className="text-xs text-text-primary bg-bg-hover border border-bg-border px-3 py-1 rounded-lg">
                        {t.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setSelectedCompany(null)}
                  className="btn-secondary px-4 py-2.5 text-xs font-bold"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleStartPrep(selectedCompany);
                  }}
                  className="btn-primary px-5 py-2.5 text-xs font-bold"
                >
                  Start Preparation Track
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
