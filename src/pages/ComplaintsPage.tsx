import React, { useEffect, useState } from 'react';
import { getMyComplaints, getAllComplaints, updateComplaintStatus, raiseComplaint } from '../lib/db';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Plus, Search, Filter, Clock, CheckCircle2, AlertCircle, ChevronRight, User, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function ComplaintsPage({ isAdmin, userId, darkMode }: { isAdmin: boolean, userId: string, darkMode?: boolean }) {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    loadComplaints();
  }, []);

  async function loadComplaints() {
    setLoading(true);
    const data = isAdmin ? await getAllComplaints() : await getMyComplaints(userId);
    if (data) setComplaints(data);
    setLoading(false);
  }

  const filteredComplaints = complaints.filter(c => filter === 'All' || c.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
           {['All', 'Pending', 'In-Progress', 'Resolved'].map(tab => (
             <button 
               key={tab}
               onClick={() => setFilter(tab)}
               className={cn(
                 "px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                 filter === tab 
                   ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20" 
                   : darkMode 
                     ? "bg-white/5 text-slate-500 hover:bg-white/10" 
                     : "glass-sm text-slate-500 hover:bg-white/50"
               )}
             >
               {tab}
             </button>
           ))}
         </div>
         
         {!isAdmin && (
           <button 
             onClick={() => setIsModalOpen(true)}
             className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/20"
           >
             <Plus size={20} /> New Request
           </button>
         )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={cn(
              "h-40 animate-pulse rounded-[32px]",
              darkMode ? "glass-dark" : "glass"
            )} />
          ))
        ) : filteredComplaints.length === 0 ? (
          <div className={cn(
            "col-span-full py-20 text-center rounded-[32px] italic",
            darkMode ? "glass-dark text-slate-600" : "glass text-slate-400"
          )}>
            No complaints found in this category.
          </div>
        ) : (
          filteredComplaints.map((c) => (
            <ComplaintCard key={c.id} complaint={c} isAdmin={isAdmin} onUpdate={loadComplaints} darkMode={darkMode} />
          ))
        )}
      </div>

      <AnimatePresence>
        {!isAdmin && isModalOpen && (
          <NewComplaintModal onClose={() => setIsModalOpen(false)} darkMode={darkMode} onSuccess={() => {
            setIsModalOpen(false);
            loadComplaints();
          }} userId={userId} />
        )}
      </AnimatePresence>
    </div>
  );
}

function ComplaintCard({ complaint, isAdmin, onUpdate, darkMode }: any) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    await updateComplaintStatus(complaint.id, newStatus);
    toast.success(`Ticket #${complaint.id.slice(0, 5)} marked as ${newStatus}`);
    onUpdate();
    setIsUpdating(false);
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.01 }}
      className={cn(
        "p-6 rounded-[32px] group relative border-2 transition-all duration-500",
        darkMode ? "glass-dark border-white/5 shadow-2xl shadow-indigo-900/10" : "glass border-white/60"
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm",
            complaint.status === 'Resolved' 
              ? (darkMode ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-50 text-emerald-600") 
              : complaint.status === 'In-Progress' 
                ? (darkMode ? "bg-amber-500/20 text-amber-400" : "bg-amber-50 text-amber-600") 
                : (darkMode ? "bg-rose-500/20 text-rose-400" : "bg-rose-50 text-rose-600")
          )}>
            <MessageSquare size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{complaint.category}</p>
            <h4 className={cn("font-bold tracking-tight transition-colors", darkMode ? "text-white group-hover:text-indigo-400" : "text-slate-900 group-hover:text-indigo-600")}>{complaint.title}</h4>
          </div>
        </div>
        <span className={cn(
          "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
          complaint.status === 'Resolved' 
            ? (darkMode ? "bg-emerald-900/20 text-emerald-400 border-emerald-900/30" : "bg-emerald-100 text-emerald-700 border-emerald-200") 
            : complaint.status === 'In-Progress' 
              ? (darkMode ? "bg-amber-900/20 text-amber-400 border-amber-900/30" : "bg-amber-100 text-amber-700 border-amber-200") 
              : (darkMode ? "bg-rose-900/20 text-rose-400 border-rose-900/30" : "bg-rose-100 text-rose-700 border-rose-200")
        )}>
          {complaint.status}
        </span>
      </div>

      <p className={cn("text-sm mb-6 line-clamp-2 leading-relaxed font-medium", darkMode ? "text-slate-400" : "text-slate-500")}>{complaint.description}</p>

      <div className={cn(
        "flex items-center justify-between border-t pt-4",
        darkMode ? "border-white/5" : "border-slate-100"
      )}>
        <div className="flex items-center gap-4">
           {isAdmin && (
             <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
               <User size={12} className="text-indigo-500" /> RES-{complaint.userId.slice(0, 4)}
             </div>
           )}
           <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
             <Clock size={12} className="text-indigo-500" /> {complaint.createdAt ? format(complaint.createdAt.toDate(), 'MMM dd') : '-'}
           </div>
        </div>

        {isAdmin && complaint.status !== 'Resolved' && (
          <div className="flex gap-2">
            <button 
              disabled={isUpdating}
              onClick={() => handleStatusChange(complaint.status === 'Pending' ? 'In-Progress' : 'Resolved')}
              className={cn(
                "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 border",
                darkMode 
                  ? "bg-white/5 border-white/5 text-white hover:bg-white/10" 
                  : "bg-slate-900 text-white border-slate-900 hover:bg-slate-800"
              )}
            >
               {complaint.status === 'Pending' ? 'Start Task' : 'Close Ticket'}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function NewComplaintModal({ onClose, onSuccess, userId, darkMode }: any) {
  const [formData, setFormData] = useState({ title: '', category: 'Maintenance', description: '' });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    await raiseComplaint(userId, formData);
    toast.success("Complaint filed! We will look into it shortly.");
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
        <h3 className={cn("text-2xl font-black mb-8 tracking-tight", darkMode ? "text-white" : "text-slate-900")}>New Complaint</h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Subject</label>
            <input 
              required
              value={formData.title}
              onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g., WiFi Connectivity Issue"
              className={cn(
                "w-full border-2 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold placeholder:text-slate-300",
                darkMode ? "bg-white/5 border-white/5 text-white" : "bg-white/50 border-slate-100 text-slate-700"
              )}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Category</label>
            <select 
              value={formData.category}
              onChange={e => setFormData(f => ({ ...f, category: e.target.value }))}
              className={cn(
                "w-full border-2 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold appearance-none",
                darkMode ? "bg-slate-900 border-white/5 text-white" : "bg-white/50 border-slate-100 text-slate-700"
              )}
            >
              <option>Maintenance</option>
              <option>Security</option>
              <option>Warden</option>
              <option>Food</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Detailed Description</label>
            <textarea 
              rows={4}
              required
              value={formData.description}
              onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
              className={cn(
                "w-full border-2 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium resize-none text-sm",
                darkMode ? "bg-white/5 border-white/5 text-white" : "bg-white/50 border-slate-100 text-slate-700"
              )}
              placeholder="Please provide more details for us to help better..."
            />
          </div>
          
          <div className="flex gap-4 pt-6">
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
            <button type="submit" className="flex-1 py-4 px-6 rounded-2xl bg-indigo-600 text-white font-black uppercase text-[10px] tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/20">Submit Ticket</button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
