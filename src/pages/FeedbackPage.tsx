import React, { useEffect, useState } from 'react';
import { submitFeedback, getFeedbacks } from '../lib/db';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Star, Send, User, Calendar, Quote } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

export default function FeedbackPage({ isAdmin, userId, darkMode }: { isAdmin: boolean, userId: string, darkMode?: boolean }) {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const data = await getFeedbacks();
    if (data) setFeedbacks(data);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <h2 className={cn("text-xl font-black border-l-4 border-indigo-600 pl-4 uppercase tracking-tighter", darkMode ? "text-white" : "text-slate-900")}>Community Pulse</h2>
        
        {!isAdmin && (
          <button 
            onClick={() => setIsSubmitModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/20 uppercase text-[10px] tracking-widest"
          >
            <Star size={20} /> Share Experience
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={cn(
              "h-48 animate-pulse rounded-[32px]",
              darkMode ? "glass-dark" : "glass"
            )} />
          ))
        ) : feedbacks.length === 0 ? (
          <div className={cn(
            "col-span-full py-20 text-center rounded-[32px] italic font-medium",
            darkMode ? "glass-dark text-slate-600" : "glass text-slate-400"
          )}>
            Pulse is quiet. Be the first to share!
          </div>
        ) : (
          feedbacks.map((fb) => (
            <FeedbackCard key={fb.id} feedback={fb} darkMode={darkMode} />
          ))
        )}
      </div>

      <AnimatePresence>
        {!isAdmin && isSubmitModalOpen && (
          <SubmitFeedbackModal onClose={() => setIsSubmitModalOpen(false)} darkMode={darkMode} onSuccess={() => {
            setIsSubmitModalOpen(false);
            load();
          }} userId={userId} />
        )}
      </AnimatePresence>
    </div>
  );
}

function FeedbackCard({ feedback, darkMode }: any) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className={cn(
        "p-8 rounded-[40px] relative group border-2 transition-all duration-500",
        darkMode ? "glass-dark border-white/5 shadow-2xl shadow-indigo-900/10" : "glass border-white/60 hover:border-indigo-100"
      )}
    >
      <Quote className={cn(
        "absolute top-4 right-4 transition-colors",
        darkMode ? "text-white/5" : "text-slate-100"
      )} size={64} />
      
      <div className="flex gap-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star 
            key={i} 
            size={16} 
            fill={i < feedback.rating ? "currentColor" : "none"} 
            className={i < feedback.rating ? "text-amber-400" : (darkMode ? "text-slate-700" : "text-slate-200")}
          />
        ))}
      </div>

      <p className={cn("mb-8 font-medium italic relative z-10 line-clamp-4 leading-relaxed", darkMode ? "text-slate-400" : "text-slate-600")}>
        "{feedback.comment}"
      </p>

      <div className={cn(
        "flex items-center gap-3 pt-6 border-t",
        darkMode ? "border-white/5" : "border-slate-50"
      )}>
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110",
          darkMode ? "bg-indigo-500/10 text-indigo-400" : "bg-indigo-50 text-indigo-600"
        )}>
           <User size={18} />
        </div>
        <div>
          <p className={cn("text-[10px] font-black uppercase tracking-widest", darkMode ? "text-slate-200" : "text-slate-900")}>Verified Member</p>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest opacity-60">
            {feedback.createdAt ? format(feedback.createdAt.toDate(), 'PPP') : 'Recently'}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function SubmitFeedbackModal({ onClose, onSuccess, userId, darkMode }: any) {
  const [formData, setFormData] = useState({ rating: 5, comment: '' });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    await submitFeedback(userId, formData);
    toast.success("Thank you for your valuable feedback!");
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/20 backdrop-blur-[6px]">
       <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={cn(
          "w-full max-w-lg p-10 rounded-[48px] shadow-2xl border-2 transition-all duration-500",
          darkMode ? "glass-dark border-white/5" : "glass border-white/80"
        )}
      >
        <h3 className={cn("text-2xl font-black mb-8 tracking-tight", darkMode ? "text-white" : "text-slate-900")}>Experience Audit</h3>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 ml-1 text-center">Satisfaction Matrix</label>
            <div className="flex justify-center gap-4">
               {[1, 2, 3, 4, 5].map(r => (
                 <button 
                  key={r}
                  type="button"
                  onClick={() => setFormData(f => ({ ...f, rating: r }))}
                  className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all border-2",
                    formData.rating >= r 
                      ? (darkMode ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : "bg-amber-400 text-white border-amber-500 shadow-xl shadow-amber-500/20") 
                      : (darkMode ? "bg-white/5 border-white/5 text-slate-700 hover:text-slate-500" : "bg-slate-50 border-slate-100 text-slate-300 hover:text-slate-400")
                  )}
                 >
                    <Star size={22} fill={formData.rating >= r ? "currentColor" : "none"} />
                 </button>
               ))}
            </div>
          </div>
          
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Open Narrative</label>
            <textarea 
              rows={4}
              required
              value={formData.comment}
              onChange={e => setFormData(f => ({ ...f, comment: e.target.value }))}
              className={cn(
                "w-full border-2 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium resize-none leading-relaxed",
                darkMode ? "bg-white/5 border-white/5 text-white" : "bg-white/50 border-slate-100 text-slate-700"
              )}
              placeholder="Constructive patterns or friction points..."
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className={cn(
                "flex-1 py-4 px-6 rounded-2xl border-2 font-black uppercase text-[10px] tracking-widest transition-all",
                darkMode ? "border-white/5 text-slate-500 hover:bg-white/5" : "border-slate-100 text-slate-500 hover:bg-slate-50"
              )}
            >
              Cancel
            </button>
            <button type="submit" className="flex-1 py-4 px-6 rounded-2xl bg-indigo-600 text-white font-black uppercase text-[10px] tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/40 flex items-center justify-center gap-3">
               Submit Pulse <Send size={20} />
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
