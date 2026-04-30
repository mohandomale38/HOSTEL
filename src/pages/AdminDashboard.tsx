import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  DoorOpen, 
  CreditCard, 
  MessageSquare,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  Star,
  Bell
} from 'lucide-react';
import { 
  getRooms, 
  getNotices,
  getAllUsers,
  getAllComplaints,
  getFeedbacks
} from '../lib/db';
import { formatCurrency, cn } from '../lib/utils';
import { motion } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';

export function AdminDashboard({ darkMode }: { darkMode?: boolean }) {
  const [rooms, setRooms] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [residents, setResidents] = useState<any[]>([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    occupancy: 0,
    totalCapacity: 0,
    occupiedCount: 0,
    activeComplaints: 0,
    avgRating: 0
  });

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [roomList, complaintList, feedbackList, userList] = await Promise.all([
        getRooms(),
        getAllComplaints(),
        getFeedbacks(),
        getAllUsers()
      ]);

      if (roomList) {
        setRooms(roomList);
        const occupied = (roomList as any[]).reduce((acc, r) => acc + (r.occupancy || 0), 0);
        const capacity = (roomList as any[]).reduce((acc, r) => acc + (r.capacity || 0), 0);
        setStats(prev => ({
          ...prev,
          totalCapacity: capacity,
          occupiedCount: occupied,
          occupancy: Math.round((occupied / capacity) * 100) || 0
        }));
      }

      if (complaintList) {
        setStats(prev => ({ ...prev, activeComplaints: (complaintList as any[]).filter(c => c.status !== 'Resolved').length }));
        setComplaints(complaintList);
      }

      if (feedbackList) {
        const avg = (feedbackList as any[]).reduce((acc, f) => acc + (f.rating || 0), 0) / (feedbackList.length || 1);
        setStats(prev => ({ ...prev, avgRating: Number(avg.toFixed(1)) || 0 }));
        setFeedbacks(feedbackList);
      }

      if (userList) {
        setResidents((userList as any[]).filter(u => u.role === 'resident'));
      }
      setLoading(false);
    }
    loadData();
  }, []);

  return (
    <div className="space-y-8 pb-12 pr-4">
      {/* High-Level Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-2">
        <StatCard 
          icon={<Users className="text-indigo-600" />} 
          label="Resident Matrix" 
          value={residents.length} 
          trend="Live Sync"
          onClick={() => navigate('/admin/residents')}
          darkMode={darkMode}
        />
        <StatCard 
          icon={<DoorOpen className="text-emerald-600" />} 
          label="Unit Saturation" 
          value={`${stats.occupancy}%`} 
          progress={stats.occupancy}
          trend={`${stats.occupiedCount}/${stats.totalCapacity} units`}
          onClick={() => navigate('/admin/rooms')}
          darkMode={darkMode}
        />
        <StatCard 
          icon={<MessageSquare className="text-rose-600" />} 
          label="Escalations" 
          value={stats.activeComplaints}
          urgent={stats.activeComplaints > 0}
          trend={stats.activeComplaints > 0 ? "Priority Action" : "Optimized"}
          onClick={() => navigate('/admin/complaints')}
          darkMode={darkMode}
        />
        <StatCard 
          icon={<Star className="text-amber-500" />} 
          label="Sentiment Pulse" 
          value={stats.avgRating}
          trend={`${feedbacks.length} data points`}
          onClick={() => navigate('/resident/feedback')} 
          darkMode={darkMode}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Operational Table */}
        <div className={cn(
          "lg:col-span-2 p-10 rounded-[48px] shadow-2xl transition-all duration-700 border-2",
          darkMode ? "glass-dark border-white/5 shadow-indigo-950/20" : "glass border-white/80 shadow-slate-200/40"
        )}>
          <div className="flex items-center justify-between mb-10">
            <h3 className={cn("text-xl font-black uppercase tracking-tight flex items-center gap-4", darkMode ? "text-white" : "text-slate-900")}>
              <TrendingUp size={24} className="text-indigo-600" /> Operational Matrix
            </h3>
            <button 
              onClick={() => navigate('/admin/rooms')}
              className={cn(
                "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border",
                darkMode ? "bg-white/5 border-white/5 text-indigo-400 hover:bg-white/10" : "bg-indigo-50 border-indigo-100 text-indigo-600 hover:bg-indigo-100/50"
              )}
            >
              Full Ledger
            </button>
          </div>
          
          <div className="overflow-visible">
            <table className="w-full text-left">
              <thead>
                <tr className={cn(
                  "text-[10px] uppercase tracking-[0.2em] border-b-2",
                  darkMode ? "text-slate-500 border-white/5" : "text-slate-400 border-slate-100"
                )}>
                  <th className="pb-6 font-black">Designation</th>
                  <th className="pb-6 font-black">Saturation</th>
                  <th className="pb-6 font-black">Status</th>
                  <th className="pb-6 font-black text-right">Details</th>
                </tr>
              </thead>
              <tbody className={cn(
                "divide-y-2",
                darkMode ? "divide-white/5" : "divide-slate-50"
              )}>
                {rooms.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-20 text-center text-slate-500 italic font-medium">Synchronizing stay patterns...</td>
                  </tr>
                ) : (
                  rooms.slice(0, 6).map((room) => (
                    <tr key={room.id} className={cn(
                      "group transition-all duration-300",
                      darkMode ? "hover:bg-white/[0.02]" : "hover:bg-slate-50/50"
                    )}>
                      <td className="py-6">
                        <p className={cn("font-black tracking-tight", darkMode ? "text-white" : "text-slate-900")}>Unit {room.number}</p>
                        <p className={cn("text-[9px] font-black uppercase tracking-[0.2em]", darkMode ? "text-slate-600" : "text-slate-400")}>{room.type} Cluster</p>
                      </td>
                      <td className="py-6">
                         <div className="flex items-center gap-4">
                            <div className={cn(
                              "flex-1 max-w-[80px] h-1.5 rounded-full overflow-hidden",
                              darkMode ? "bg-white/5" : "bg-slate-100"
                            )}>
                               <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${(room.occupancy/room.capacity)*100}%` }}
                                className="h-full bg-indigo-600 rounded-full" 
                               />
                            </div>
                            <span className={cn("text-[10px] font-black", darkMode ? "text-slate-400" : "text-slate-600")}>{room.occupancy}/{room.capacity}</span>
                         </div>
                      </td>
                      <td className="py-6">
                        <StatusBadge status={room.status} darkMode={darkMode} />
                      </td>
                      <td className="py-6 text-right">
                        <button 
                          onClick={() => navigate('/admin/rooms')}
                          className={cn(
                            "w-10 h-10 rounded-2xl flex items-center justify-center transition-all",
                            darkMode ? "bg-white/5 text-slate-500 hover:text-indigo-400 hover:bg-white/10" : "bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                          )}
                        >
                           <ArrowRight size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar Reports */}
        <div className="space-y-8">
           <div className={cn(
             "p-10 rounded-[48px] border-2 transition-all duration-700 shadow-xl",
             darkMode ? "glass-dark border-white/5 shadow-indigo-950/10" : "glass border-indigo-50 shadow-slate-200/30"
           )}>
              <h3 className={cn("text-lg font-black mb-8 uppercase tracking-tighter", darkMode ? "text-white" : "text-slate-900")}>Live Feedbacks</h3>
              <div className="space-y-5">
                {feedbacks.length === 0 ? (
                  <div className={cn(
                    "py-16 text-center rounded-[32px] text-[10px] font-black uppercase tracking-[0.2em] border-2 border-dashed",
                    darkMode ? "bg-white/[0.02] border-white/5 text-slate-700" : "bg-slate-50 border-slate-100 text-slate-400"
                  )}>Quiet Pulse</div>
                ) : (
                  feedbacks.slice(0, 3).map((fb) => (
                    <div key={fb.id} className={cn(
                      "p-5 rounded-[24px] border-2 transition-all duration-300 group/item",
                      darkMode ? "bg-white/5 border-white/5 hover:border-indigo-900/50" : "bg-white/50 border-white hover:border-indigo-100 shadow-sm"
                    )}>
                      <div className="flex gap-1.5 mb-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={12} fill={i < fb.rating ? "currentColor" : "none"} className={i < fb.rating ? "text-amber-400" : (darkMode ? "text-slate-800" : "text-slate-200")} />
                        ))}
                      </div>
                      <p className={cn(
                        "text-[11px] font-medium italic line-clamp-2 leading-relaxed opacity-80",
                        darkMode ? "text-slate-300" : "text-slate-600"
                      )}>"{fb.comment}"</p>
                    </div>
                  ))
                )}
              </div>
           </div>

           <div className={cn(
             "p-10 rounded-[48px] shadow-2xl transition-all duration-700 border-2",
             darkMode ? "glass-dark border-indigo-500/10 shadow-indigo-950/30" : "bg-slate-900 border-slate-800 text-white shadow-slate-400/50"
           )}>
              <div className="flex items-center justify-between mb-10">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Command Core</h3>
                 <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <ToolButton icon={<Plus size={20} />} label="Add Unit" onClick={() => navigate('/admin/rooms')} darkMode={darkMode} />
                <ToolButton icon={<Users size={20} />} label="Citizens" onClick={() => navigate('/admin/residents')} darkMode={darkMode} />
                <ToolButton icon={<CreditCard size={20} />} label="Ledger" onClick={() => navigate('/admin/payments')} darkMode={darkMode} />
                <ToolButton icon={<Bell size={20} />} label="Broadcast" onClick={() => navigate('/admin/notices')} darkMode={darkMode} />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function ToolButton({ icon, label, onClick, darkMode }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-3 p-4 rounded-3xl border transition-all group",
        darkMode ? "bg-white/5 border-white/5 hover:bg-white/10" : "bg-white/5 border border-white/10 hover:bg-white/10"
      )}
    >
      <div className="text-indigo-400 group-hover:scale-110 transition-transform">{icon}</div>
      <span className={cn("text-[9px] font-black uppercase tracking-widest", darkMode ? "text-slate-500" : "text-slate-300")}>{label}</span>
    </button>
  );
}

function StatCard({ icon, label, value, trend, progress, urgent, onClick, darkMode }: any) {
  return (
    <motion.div 
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={cn(
        "p-5 rounded-3xl cursor-pointer transition-all border-2",
        darkMode ? "glass-dark border-white/5 hover:bg-white/5" : "glass-sm border-white hover:bg-white/40",
        onClick && "active:scale-95"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <p className={cn("text-[10px] font-bold uppercase tracking-widest leading-none", darkMode ? "text-slate-500" : "text-slate-400")}>{label}</p>
        {trend && (
          <span className={cn(
            "text-[9px] font-bold px-1.5 py-0.5 rounded-lg uppercase whitespace-nowrap",
            urgent ? "bg-rose-500 text-white" : (darkMode ? "bg-emerald-500/10 text-emerald-400" : "text-emerald-600 font-bold")
          )}>
            {trend}
          </span>
        )}
      </div>
      <h4 className={cn("text-2xl font-black", darkMode ? "text-white" : "text-slate-900")}>{value}</h4>
      {progress !== undefined && (
        <div className={cn(
          "mt-3 w-full h-1.5 rounded-full overflow-hidden",
          darkMode ? "bg-white/10" : "bg-indigo-100"
        )}>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-indigo-600"
          />
        </div>
      )}
    </motion.div>
  );
}

function StatusBadge({ status, darkMode }: { status: string, darkMode?: boolean }) {
  const lightStyles: any = {
    'Available': 'bg-slate-200 text-slate-600 border-transparent',
    'Full': 'bg-emerald-100 text-emerald-700 border-transparent',
    'Maintenance': 'bg-amber-100 text-amber-700 border-transparent',
    'Occupied': 'bg-emerald-100 text-emerald-700 border-transparent',
    'Vacant': 'bg-slate-200 text-slate-600 border-transparent'
  };

  const darkStyles: any = {
    'Available': 'bg-white/5 text-slate-400 border-white/5',
    'Full': 'bg-emerald-900/20 text-emerald-400 border-emerald-900/10',
    'Maintenance': 'bg-amber-900/20 text-amber-400 border-amber-900/10',
    'Occupied': 'bg-emerald-900/20 text-emerald-400 border-emerald-900/10',
    'Vacant': 'bg-white/5 text-slate-400 border-white/5'
  };

  const styles = darkMode ? darkStyles : lightStyles;
  const label = status === 'Full' ? 'Occupied' : status === 'Available' ? 'Vacant' : status;

  return (
    <span className={cn(
      "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
      styles[status] || styles['Available']
    )}>
      {label}
    </span>
  );
}
