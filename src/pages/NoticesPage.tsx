import React, { useEffect, useState } from 'react';
import { getNotices, addNotice } from '../lib/db';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Plus, Search, Filter, Calendar, User, Send, Info, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

export default function NoticesPage({ isAdmin, darkMode }: { isAdmin: boolean, darkMode?: boolean }) {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const data = await getNotices();
    if (data) setNotices(data);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <h2 className={cn("text-xl font-black border-l-4 border-indigo-600 pl-4 uppercase tracking-tighter", darkMode ? "text-white" : "text-slate-900")}>Announcements Board</h2>
        
        {isAdmin && (
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/20 uppercase text-[10px] tracking-widest"
          >
            <Plus size={20} /> Post Bulletin
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={cn(
              "h-48 animate-pulse rounded-[40px]",
              darkMode ? "glass-dark" : "glass"
            )} />
          ))
        ) : notices.length === 0 ? (
          <div className={cn(
            "col-span-full py-20 text-center rounded-[32px] italic font-medium",
            darkMode ? "glass-dark text-slate-600" : "glass text-slate-400"
          )}>
            No bulletins posted yet.
          </div>
        ) : (
          notices.map((notice, idx) => (
            <NoticeCard key={notice.id || idx} notice={notice} darkMode={darkMode} />
          ))
        )}
      </div>

      <AnimatePresence>
        {isAdmin && isAddModalOpen && (
          <AddNoticeModal onClose={() => setIsAddModalOpen(false)} darkMode={darkMode} onSuccess={() => {
            setIsAddModalOpen(false);
            load();
          }} />
        )}
      </AnimatePresence>
    </div>
  );
}

function NoticeCard({ notice, darkMode }: any) {
  const isHighPriority = notice.priority === 'High';
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className={cn(
        "p-8 rounded-[48px] relative group border-2 transition-all duration-500",
        darkMode ? "glass-dark border-white/5 shadow-2xl shadow-indigo-900/10" : "glass border-white/60 hover:border-indigo-100"
      )}
    >
      <div className="flex items-start justify-between mb-6">
        <div className={cn(
          "w-14 h-14 rounded-3xl flex items-center justify-center shadow-lg transition-transform group-hover:rotate-6",
          isHighPriority 
            ? "bg-rose-600 text-white" 
            : "bg-indigo-600 text-white"
        )}>
          <Bell size={28} />
        </div>
        <div className="flex flex-col items-end">
           <span className={cn(
             "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest leading-none border",
             isHighPriority 
               ? (darkMode ? "bg-rose-900/20 text-rose-400 border-rose-900/30" : "bg-rose-100 text-rose-700 border-rose-200") 
               : (darkMode ? "bg-slate-900/20 text-slate-400 border-slate-900/30" : "bg-slate-100 text-slate-500 border-slate-200")
           )}>
             {notice.priority} Priority
           </span>
           <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-500 font-black uppercase tracking-widest">
             <Calendar size={12} className="text-indigo-500" /> {notice.createdAt ? format(notice.createdAt.toDate(), 'PPP') : '-'}
           </div>
        </div>
      </div>

      <h3 className={cn("text-2xl font-black mb-4 tracking-tight", darkMode ? "text-white" : "text-slate-900")}>{notice.title}</h3>
      <p className={cn("leading-relaxed font-medium mb-8", darkMode ? "text-slate-400" : "text-slate-500")}>
        {notice.content}
      </p>

      <div className={cn(
        "flex items-center justify-between pt-6 border-t",
        darkMode ? "border-white/5" : "border-slate-100"
      )}>
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center",
            darkMode ? "bg-white/5 text-slate-500" : "bg-slate-100 text-slate-400"
          )}>
             <User size={14} />
          </div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">HQ ADMIN</span>
        </div>
        <button className={cn(
          "text-xs font-black flex items-center gap-3 group/btn transition-colors",
          darkMode ? "text-indigo-400 hover:text-white" : "text-indigo-600 hover:text-indigo-800"
        )}>
           Extended View <Info size={14} className="group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}

function AddNoticeModal({ onClose, onSuccess, darkMode }: any) {
  const [formData, setFormData] = useState({ title: '', content: '', priority: 'Normal' });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    await addNotice(formData);
    toast.success("Notice posted successfully to the board.");
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/20 backdrop-blur-[6px]">
       <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={cn(
          "w-full max-w-xl p-10 rounded-[48px] shadow-2xl border-2",
          darkMode ? "glass-dark border-white/5" : "glass border-white/80"
        )}
      >
        <h3 className={cn("text-3xl font-black mb-8 tracking-tight", darkMode ? "text-white" : "text-slate-900")}>Draft Bulletin</h3>
        <form onSubmit={handleSubmit} className="space-y-6">
           <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Subject Scope</label>
            <input 
              required
              value={formData.title}
              onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g., Water Supply Maintenance"
              className={cn(
                "w-full border-2 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-lg",
                darkMode ? "bg-white/5 border-white/5 text-white" : "bg-white/50 border-slate-100 text-slate-700"
              )}
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Priority Hierarchy</label>
            <div className="grid grid-cols-2 gap-4">
               {['Normal', 'High'].map(p => (
                 <button 
                   key={p}
                   type="button"
                   onClick={() => setFormData(f => ({ ...f, priority: p }))}
                   className={cn(
                     "py-3 rounded-2xl border-2 transition-all font-black uppercase text-[10px] tracking-widest",
                     formData.priority === p 
                       ? "bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-900/20" 
                       : (darkMode ? "border-white/5 text-slate-500 hover:bg-white/5" : "border-slate-100 text-slate-400 hover:border-indigo-200")
                   )}
                 >
                   {p}
                 </button>
               ))}
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Notice Payload</label>
            <textarea 
              rows={5}
              required
              value={formData.content}
              onChange={e => setFormData(f => ({ ...f, content: e.target.value }))}
              className={cn(
                "w-full border-2 rounded-[24px] px-6 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium resize-none leading-relaxed",
                darkMode ? "bg-white/5 border-white/5 text-white" : "bg-white/50 border-slate-100 text-slate-700"
              )}
              placeholder="Detail the announcement specifications..."
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
              Discard
            </button>
            <button type="submit" className="flex-1 py-4 px-6 rounded-2xl bg-indigo-600 text-white font-black uppercase text-[10px] tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/40 flex items-center justify-center gap-3">
               Publish Bulletin <Send size={20} />
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
