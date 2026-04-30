import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, 
  MessageSquare, 
  Bell, 
  Info, 
  History,
  AlertCircle,
  Plus,
  Send,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Star,
  Home,
  DoorOpen
} from 'lucide-react';
import { 
  getMyComplaints, 
  getMyPayments, 
  getNotices,
  raiseComplaint,
  getUserProfile,
  getRooms
} from '../lib/db';
import { formatCurrency } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';

export function ResidentDashboard({ userId, darkMode }: { userId: string, darkMode?: boolean }) {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [myRoom, setMyRoom] = useState<any>(null);
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      const c = await getMyComplaints(userId);
      const p = await getMyPayments(userId);
      const n = await getNotices();
      const prof = await getUserProfile(userId);
      
      if (c) setComplaints(c);
      if (p) setPayments(p);
      if (n) setNotices(n);
      if (prof) {
        setProfile(prof);
        if (prof.roomId) {
          const rooms = await getRooms();
          const r = rooms?.find(rm => rm.id === prof.roomId);
          if (r) setMyRoom(r);
        }
      }
    }
    loadData();
  }, [userId]);

  return (
    <div className="space-y-8 pb-12 pr-4">
      {/* Hero Welcome Section */}
      <div className={cn(
        "p-12 rounded-[56px] relative overflow-hidden text-white shadow-2xl transition-all duration-700 border-2",
        darkMode ? "glass-dark border-indigo-500/20 shadow-indigo-900/40" : "bg-indigo-600 border-indigo-500/50 shadow-indigo-200"
      )}>
        <div className="absolute top-0 right-0 p-12 opacity-5 -mr-16 -mt-16 pointer-events-none transition-transform duration-1000">
          <Home size={320} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8 bg-white/20 w-fit px-5 py-2 rounded-2xl backdrop-blur-xl border border-white/10">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Sovereign Resident Node</span>
          </div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-6xl font-black mb-6 tracking-tighter"
          >
            Welcome, {profile?.name?.split(' ')[0] || 'Resident'}
          </motion.h1>
          <p className="text-indigo-100/80 text-xl font-medium max-w-lg mb-12 leading-relaxed tracking-tight">
            Your high-performance interface for stay management and collaborative living.
          </p>
          
          <div className="flex flex-wrap gap-5">
            <button 
              onClick={() => setIsComplaintModalOpen(true)}
              className={cn(
                "px-10 py-5 rounded-[28px] font-black shadow-2xl hover:scale-105 active:scale-95 transition-all text-[11px] uppercase tracking-widest flex items-center gap-3",
                darkMode ? "bg-white text-indigo-700" : "bg-white text-indigo-600"
              )}
            >
              <Plus size={20} /> Raise Ticket
            </button>
            <button 
              onClick={() => navigate('/resident/room')}
              className={cn(
                "px-10 py-5 rounded-[28px] font-black hover:scale-105 active:scale-95 transition-all text-[11px] uppercase tracking-widest flex items-center gap-3 border-2",
                darkMode ? "bg-indigo-500/10 border-indigo-400/20 text-white hover:bg-indigo-500/30" : "bg-indigo-500 border-indigo-400 text-white hover:bg-indigo-400"
              )}
            >
              <DoorOpen size={20} /> {myRoom ? 'Unit Matrix' : 'Initialize Unit'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Essential Tracking */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Room & Rent Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* My Room Info */}
            <div className={cn(
              "p-10 rounded-[48px] relative group border-2 transition-all duration-700 shadow-xl",
              darkMode ? "glass-dark border-indigo-500/10 shadow-indigo-900/10" : "glass border-indigo-100 shadow-slate-200/50"
            )}>
              <div className="flex items-start justify-between mb-10">
                <div className={cn(
                  "p-5 rounded-3xl transition-transform group-hover:rotate-6 shadow-lg",
                  darkMode ? "bg-indigo-500/20 text-indigo-400" : "bg-indigo-50 text-indigo-600"
                )}>
                  <DoorOpen size={32} />
                </div>
                {myRoom ? (
                  <StatusChip status="Allocated" darkMode={darkMode} />
                ) : (
                  <span className={cn(
                    "text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest border",
                    darkMode ? "text-rose-400 bg-rose-500/10 border-rose-500/20" : "text-rose-500 bg-rose-50 border-rose-100"
                  )}>Pending Initialization</span>
                )}
              </div>
              
              {myRoom ? (
                <div>
                  <h3 className={cn("text-4xl font-black mb-2 tracking-tight", darkMode ? "text-white" : "text-slate-900")}>Unit {myRoom.number}</h3>
                  <p className={cn("text-[11px] font-black uppercase tracking-[0.3em]", darkMode ? "text-indigo-400/60" : "text-slate-500")}>{myRoom.type} Configuration</p>
                </div>
              ) : (
                <div>
                  <h3 className={cn("text-3xl font-black mb-3 tracking-tighter", darkMode ? "text-white" : "text-slate-900")}>Void Unit</h3>
                  <p className={cn("text-xs font-medium leading-relaxed opacity-70", darkMode ? "text-slate-400" : "text-slate-500")}>Select your preferred live-environment to begin your StayEase experience.</p>
                </div>
              )}

              {myRoom && (
                <div className={cn(
                  "mt-10 pt-8 border-t flex items-center justify-between",
                  darkMode ? "border-white/5" : "border-slate-100"
                )}>
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                      <span className={cn("text-[11px] font-black uppercase tracking-widest", darkMode ? "text-slate-500" : "text-slate-900")}>Occupancy Load</span>
                   </div>
                   <span className="text-xs font-black text-indigo-500">{myRoom.occupancy}/{myRoom.capacity}</span>
                </div>
              )}
            </div>

            {/* Rent Snapshot */}
            <div className={cn(
              "p-10 rounded-[48px] border-2 transition-all duration-700 shadow-xl",
              darkMode ? "glass-dark border-white/5" : "glass border-slate-100 shadow-slate-200/50"
            )}>
               <div className="flex items-start justify-between mb-10">
                <div className={cn(
                  "p-5 rounded-3xl transition-transform group-hover:-rotate-6 shadow-lg",
                  darkMode ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-50 text-emerald-600"
                )}>
                  <CreditCard size={32} />
                </div>
                <StatusChip status="Up to Date" darkMode={darkMode} />
              </div>

              <div>
                <h3 className={cn("text-4xl font-black mb-2 tracking-tight", darkMode ? "text-white" : "text-slate-900")}>{formatCurrency(myRoom?.rent || 8500)}</h3>
                <p className={cn("text-[11px] font-black uppercase tracking-[0.3em]", darkMode ? "text-emerald-500/60" : "text-slate-500")}>Cycle Cutoff: May 05</p>
              </div>

              <button 
                onClick={() => navigate('/resident/payments')}
                 className={cn(
                   "mt-10 w-full py-5 rounded-[24px] font-black uppercase text-[10px] tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-2xl",
                   darkMode ? "bg-white text-slate-900 hover:bg-slate-100" : "bg-slate-900 text-white hover:bg-slate-800"
                 )}
              >
                Invoicing Ledger <ArrowRight size={18} />
              </button>
            </div>
          </div>

          {/* Activity Timeline / Notices */}
          <div className="space-y-8">
            <h3 className={cn(
              "text-xl font-black border-l-4 border-indigo-600 pl-6 uppercase tracking-[0.2em] flex items-center gap-5",
              darkMode ? "text-white" : "text-slate-900"
            )}>
              <Bell size={24} className="text-indigo-600" /> Control Board
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {notices.length === 0 ? (
                <div className={cn(
                  "p-12 text-center rounded-[48px] font-medium col-span-2 border-2 border-dashed",
                  darkMode ? "bg-white/[0.02] border-white/5 text-slate-700" : "bg-slate-50 border-slate-100 text-slate-400"
                )}>
                  Board is clear. No active broadcasts.
                </div>
              ) : (
                notices.slice(0, 2).map((notice, idx) => (
                  <div key={notice.id || `not-${idx}`} className="h-full">
                    <NoticeItem notice={notice} onClick={() => navigate('/resident/notices')} darkMode={darkMode} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Mini Management Sidebar */}
        <div className="space-y-8">
          <div className={cn(
            "p-10 rounded-[48px] shadow-2xl border-2 transition-all duration-700",
            darkMode ? "glass-dark border-white/5 shadow-indigo-950/20" : "glass border-white/80 shadow-slate-200/50"
          )}>
            <div className="flex items-center justify-between mb-10">
              <h3 className={cn("text-lg font-black uppercase tracking-tighter", darkMode ? "text-white" : "text-slate-900")}>Active Pulse</h3>
              <button 
                onClick={() => navigate('/resident/complaints')}
                className="text-[10px] font-black text-indigo-500 underline-offset-4 uppercase tracking-[0.2em] hover:underline"
              >
                Ledger
              </button>
            </div>

            <div className="space-y-5">
              {complaints.length === 0 ? (
                <div className={cn(
                  "flex flex-col items-center justify-center py-20 text-center rounded-[32px] border-2 border-dashed transition-colors hover:bg-white/[0.02]",
                  darkMode ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100"
                )}>
                  <CheckCircle2 size={40} className={darkMode ? "text-slate-800" : "text-slate-200"} mb-4 />
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-4">Node Stable</p>
                </div>
              ) : (
                complaints.slice(0, 3).map((complaint) => (
                   <div 
                    key={complaint.id} 
                    className={cn(
                      "p-6 rounded-[28px] border-2 shadow-sm transition-all duration-300 hover:scale-[1.02]",
                      darkMode ? "bg-white/5 border-white/5 hover:border-indigo-900/50" : "bg-white border-slate-50"
                    )}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <p className={cn("font-black text-sm tracking-tight leading-tight flex-1 mr-4", darkMode ? "text-white" : "text-slate-900")}>{complaint.title}</p>
                      <StatusChip status={complaint.status} darkMode={darkMode} />
                    </div>
                    <div className="flex items-center gap-2 text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">
                      <Clock size={12} className="text-indigo-500" /> {complaint.createdAt ? format(complaint.createdAt.toDate(), 'MMM dd') : '-'}
                    </div>
                  </div>
                ))
              )}
            </div>

            <button 
              onClick={() => navigate('/resident/feedback')}
              className={cn(
                "mt-10 w-full p-8 rounded-[40px] border-2 flex items-center gap-5 group transition-all text-left",
                darkMode ? "bg-amber-500/10 border-amber-500/10 hover:bg-amber-500/20" : "bg-amber-50 border-amber-100/50 hover:bg-amber-100"
              )}
            >
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-110 duration-500",
                darkMode ? "bg-amber-500 text-white" : "bg-white text-amber-500"
              )}>
                <Star size={28} fill="currentColor" />
              </div>
              <div className="flex-1">
                <p className={cn("text-[11px] font-black uppercase tracking-widest", darkMode ? "text-white" : "text-slate-900")}>Community Loop</p>
                <p className={cn("text-[10px] font-black uppercase tracking-[0.2em] opacity-60", darkMode ? "text-amber-500/70" : "text-slate-500")}>Submit Pulse</p>
              </div>
            </button>
          </div>
          
          {/* Quick Stats Card */}
          <div className={cn(
            "p-10 rounded-[48px] relative overflow-hidden transition-all duration-700 shadow-2xl border-2",
            darkMode ? "glass-dark border-indigo-500/20 shadow-indigo-950/20" : "bg-slate-900 border-slate-800 text-white shadow-slate-400"
          )}>
            <div className="absolute top-0 right-0 p-10 text-white/5 -mr-8 -mt-8 pointer-events-none group-hover:scale-110 transition-transform">
              <Calendar size={180} />
            </div>
            <h4 className={cn("text-[10px] font-black uppercase tracking-[0.3em] mb-10", darkMode ? "text-indigo-400/80" : "text-white/40")}>Statisitcal Core</h4>
            <div className="space-y-8 relative z-10">
              <div className="flex justify-between items-end border-b-2 border-white/5 pb-5 transition-all hover:bg-white/5 rounded-xl px-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tickets Cleared</p>
                <p className="text-3xl font-black text-indigo-400">12</p>
              </div>
              <div className="flex justify-between items-end border-b-2 border-white/5 pb-5 transition-all hover:bg-white/5 rounded-xl px-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nodes Resolved</p>
                <p className="text-3xl font-black text-emerald-400">04</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isComplaintModalOpen && (
          <ComplaintModal 
            onClose={() => setIsComplaintModalOpen(false)} 
            userId={userId} 
            darkMode={darkMode}
            onSuccess={() => {
              setIsComplaintModalOpen(false);
              // In real app, re-fetch
              getMyComplaints(userId).then(setComplaints);
              toast.success("Complaint registered successfully!");
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function NoticeItem({ notice, onClick, darkMode }: { notice: any, onClick?: any, darkMode?: boolean }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className={cn(
        "p-4 rounded-3xl flex items-center gap-4 group cursor-pointer hover:scale-[1.01] transition-all active:scale-95 shadow-lg",
        darkMode ? "glass-dark border border-indigo-500/30 text-white shadow-indigo-900/20" : "bg-indigo-600 text-white shadow-indigo-100"
      )}
    >
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
        darkMode ? "bg-indigo-500/20 text-indigo-400" : "bg-white/20"
      )}>
        <Bell size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold leading-snug line-clamp-1">{notice.title}</p>
        <p className={cn(
          "text-xs line-clamp-1 mt-0.5",
          darkMode ? "text-slate-400" : "text-indigo-100"
        )}>{notice.content}</p>
      </div>
      <div className="text-right shrink-0">
        <p className={cn(
          "text-[10px] font-bold uppercase tracking-tight",
          darkMode ? "text-indigo-500/70" : "text-indigo-200"
        )}>Posted</p>
        <p className="text-[10px] font-black">{format(notice.createdAt?.toDate ? notice.createdAt.toDate() : new Date(), 'HH:mm')}</p>
      </div>
    </motion.div>
  );
}

function StatusChip({ status, darkMode }: { status: string, darkMode?: boolean }) {
  const lightStyles: any = {
    'Pending': 'text-rose-500 bg-rose-50 border-rose-100',
    'In-Progress': 'text-amber-500 bg-amber-50 border-amber-100',
    'Resolved': 'text-emerald-500 bg-emerald-50 border-emerald-100',
    'Allocated': 'text-indigo-500 bg-indigo-50 border-indigo-100',
    'Up to Date': 'text-emerald-500 bg-emerald-50 border-emerald-100'
  };

  const darkStyles: any = {
    'Pending': 'text-rose-400 bg-rose-900/20 border-rose-900/30',
    'In-Progress': 'text-amber-400 bg-amber-900/20 border-amber-900/30',
    'Resolved': 'text-emerald-400 bg-emerald-900/20 border-emerald-900/30',
    'Allocated': 'text-indigo-400 bg-indigo-900/20 border-indigo-900/30',
    'Up to Date': 'text-emerald-400 bg-emerald-900/20 border-emerald-900/30'
  };

  const styles = darkMode ? darkStyles : lightStyles;

  return (
    <span className={cn("text-[9px] font-black px-1.5 py-0.5 rounded-lg uppercase tracking-tighter border", styles[status] || styles['Pending'])}>
      {status}
    </span>
  );
}

function ComplaintModal({ onClose, userId, onSuccess, darkMode }: any) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Maintenance'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await raiseComplaint(userId, formData);
      onSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/20 backdrop-blur-[6px]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={cn(
          "w-full max-w-lg rounded-[48px] shadow-2xl overflow-hidden border-2",
          darkMode ? "glass-dark border-indigo-500/20" : "glass border-white/80"
        )}
      >
        <div className="p-10">
          <h3 className={cn("text-2xl font-black mb-8 tracking-tight", darkMode ? "text-white" : "text-slate-900")}>New Support Ticket</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className={cn("block text-[10px] font-black uppercase tracking-widest mb-3 ml-1", darkMode ? "text-slate-400" : "text-slate-400")}>What is the issue?</label>
              <input 
                required
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className={cn(
                  "w-full border-2 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold placeholder:text-slate-300",
                  darkMode ? "bg-white/5 border-white/5 text-white" : "bg-white/50 border-slate-100"
                )}
                placeholder="e.g., Leaking Tap in Room 204"
              />
            </div>
            <div>
              <label className={cn("block text-[10px] font-black uppercase tracking-widest mb-3 ml-1", darkMode ? "text-slate-400" : "text-slate-400")}>Priority Category</label>
              <select 
                value={formData.category}
                onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className={cn(
                  "w-full border-2 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold appearance-none",
                  darkMode ? "bg-white/5 border-white/5 text-white" : "bg-white/50 border-slate-100"
                )}
              >
                <option className="bg-slate-900">Maintenance</option>
                <option className="bg-slate-900">Plumbing</option>
                <option className="bg-slate-900">Electricity</option>
                <option className="bg-slate-900">Others</option>
              </select>
            </div>
            <div>
              <label className={cn("block text-[10px] font-black uppercase tracking-widest mb-3 ml-1", darkMode ? "text-slate-400" : "text-slate-400")}>Detail Description</label>
              <textarea 
                required
                rows={4}
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className={cn(
                  "w-full border-2 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none font-medium placeholder:text-slate-300",
                  darkMode ? "bg-white/5 border-white/5 text-white" : "bg-white/50 border-slate-100 font-medium"
                )}
                placeholder="Describe the issue in detail..."
              />
            </div>
            
            <div className="flex items-center gap-4 pt-6">
              <button 
                type="button"
                onClick={onClose}
                className={cn(
                  "flex-1 py-4 rounded-2xl border-2 font-black uppercase tracking-widest text-[10px] transition-all",
                  darkMode ? "border-white/5 text-slate-400 hover:bg-white/5" : "border-slate-100 text-slate-600 hover:bg-slate-50"
                )}
              >
                Cancel
              </button>
              <button 
                disabled={loading}
                className="flex-1 py-4 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Clock className="animate-spin" size={18} /> : <Send size={18} />}
                Launch Ticket
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
