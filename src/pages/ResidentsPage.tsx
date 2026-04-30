import React, { useEffect, useState } from 'react';
import { getAllUsers, getRooms, allocateRoom } from '../lib/db';
import { motion } from 'motion/react';
import { User, Search, Filter, Mail, Phone, MapPin, Shield, Edit2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function ResidentsPage({ darkMode }: { darkMode?: boolean }) {
  const [residents, setResidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getAllUsers();
      if (data) setResidents(data.filter((u: any) => u.role === 'resident'));
      setLoading(false);
    }
    load();
  }, []);

  const filtered = residents.filter(r => 
    r.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <div className="relative flex-1 max-w-md">
          <Search className={cn("absolute left-4 top-1/2 -translate-y-1/2", darkMode ? "text-slate-500" : "text-slate-400")} size={18} />
          <input 
            type="text"
            placeholder="Search residents by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(
              "w-full border-2 rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold",
              darkMode ? "bg-white/5 border-white/5 text-white placeholder:text-slate-700" : "bg-white/50 border-slate-100 text-slate-700"
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
           Array.from({ length: 6 }).map((_, i) => (
             <div key={i} className={cn(
               "h-64 animate-pulse rounded-[32px]",
               darkMode ? "glass-dark" : "glass"
             )} />
           ))
        ) : filtered.length === 0 ? (
          <div className={cn(
            "col-span-full py-20 text-center rounded-[32px] italic font-medium",
            darkMode ? "glass-dark text-slate-600 border-white/5" : "glass text-slate-400 border-slate-100 border-2"
          )}>
            No residents found matching your search.
          </div>
        ) : (
          filtered.map((resident) => (
            <ResidentCard key={resident.id} resident={resident} darkMode={darkMode} onUpdate={() => {
              getAllUsers().then(data => data && setResidents(data.filter((u: any) => u.role === 'resident')));
            }} />
          ))
        )}
      </div>
    </div>
  );
}

function parseCreatedAt(value: any) {
  if (!value) return null;
  if (typeof value === 'string') return new Date(value);
  if (typeof value.toDate === 'function') return value.toDate();
  return new Date(value);
}

function ResidentCard({ resident, onUpdate, darkMode }: any) {
  const [isAllocating, setIsAllocating] = useState(false);
  const [rooms, setRooms] = useState<any[]>([]);

  const handleAllocate = async (roomId: string) => {
    await allocateRoom(roomId, resident.id);
    toast.success(`Allocated Room ${rooms.find(r => r.id === roomId)?.number} to ${resident.name}`);
    setIsAllocating(false);
    onUpdate();
  };

  useEffect(() => {
    if (isAllocating) {
      getRooms().then(data => setRooms(data || []));
    }
  }, [isAllocating]);

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className={cn(
        "p-8 rounded-[40px] relative group overflow-hidden border-2 transition-all duration-500",
        darkMode ? "glass-dark border-white/5 hover:bg-white/5" : "glass border-white/60 hover:bg-white"
      )}
    >
      <div className={cn(
        "absolute top-0 right-0 p-8 transition-transform group-hover:scale-110",
        darkMode ? "text-white/5" : "text-slate-100"
      )}>
        <User size={140} />
      </div>
      <div className="flex flex-col items-center text-center relative z-10">
        <div className={cn(
          "w-24 h-24 rounded-full p-1 shadow-2xl mb-8 relative group/avatar",
          darkMode ? "bg-slate-900 shadow-indigo-900/20" : "bg-white shadow-slate-200"
        )}>
          <div className="w-full h-full rounded-full overflow-hidden">
            {resident.avatarUrl ? (
              <img src={resident.avatarUrl} alt={resident.name} className="w-full h-full object-cover" />
            ) : (
              <div className={cn(
                "w-full h-full flex items-center justify-center transition-colors",
                darkMode ? "bg-white/5 text-indigo-400 group-hover/avatar:bg-white/10" : "bg-indigo-50 text-indigo-500 group-hover/avatar:bg-indigo-100"
              )}>
                <User size={40} />
              </div>
            )}
          </div>
          {resident.isVerified && (
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-2 rounded-full shadow-lg ring-4 ring-inherit">
              <Shield size={14} fill="currentColor" />
            </div>
          )}
        </div>
        
        <div className="w-full space-y-1 mb-8">
          <h3 className={cn("text-xl font-black tracking-tight", darkMode ? "text-white" : "text-slate-900")}>
            {resident.name || 'Anonymous Resident'}
          </h3>
          <p className="text-[10px] font-black uppercase text-indigo-500 tracking-[0.2em]">Verified Member</p>
        </div>
        
        <div className="space-y-4 w-full text-left">
           <div className={cn(
             "flex items-center gap-4 px-4 py-3 rounded-2xl border transition-colors",
             darkMode ? "bg-white/5 border-white/5 text-slate-400 group-hover:border-white/10" : "bg-slate-50/50 border-slate-100 text-slate-600"
           )}>
             <Mail size={16} className="text-indigo-500 shrink-0" />
             <span className="truncate font-bold text-sm tracking-tight">{resident.email}</span>
           </div>
           <div className={cn(
             "flex items-center gap-4 px-4 py-3 rounded-2xl border transition-colors",
             darkMode ? "bg-white/5 border-white/5 text-slate-400 group-hover:border-white/10" : "bg-slate-50/50 border-slate-100 text-slate-600"
           )}>
             <MapPin size={16} className="text-indigo-500 shrink-0" />
             <span className="font-bold text-sm tracking-tight">{resident.roomId ? `Unit ${resident.roomId}` : 'Not Allocated'}</span>
           </div>
           <div className="flex items-center justify-between px-2 pt-2">
             <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
               Member Since
             </div>
             <div className={cn("text-[10px] font-black uppercase tracking-widest", darkMode ? "text-slate-300" : "text-slate-900")}>
               {resident.createdAt ? format(parseCreatedAt(resident.createdAt), 'MMM yyyy') : 'Recently'}
             </div>
           </div>
        </div>

        {isAllocating ? (
          <div className="mt-8 w-full space-y-3">
            <select 
              onChange={(e) => handleAllocate(e.target.value)}
              className={cn(
                "w-full border-2 rounded-2xl px-4 py-3 text-sm font-black focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none",
                darkMode ? "bg-slate-900 border-white/5 text-white" : "bg-white border-slate-100 text-slate-900"
              )}
            >
              <option value="">Select Target Unit</option>
              {rooms.map(r => (
                <option key={r.id} value={r.id} disabled={r.status === 'Full'} className="bg-slate-900">
                  #{r.number} ({r.type} • {r.occupancy}/{r.capacity})
                </option>
              ))}
            </select>
            <button 
              onClick={() => setIsAllocating(false)}
              className="w-full py-2 text-[10px] font-black text-rose-500 uppercase tracking-widest hover:text-rose-400 transition-colors"
            >
              Cancel Operation
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setIsAllocating(true)}
            className={cn(
              "mt-8 w-full py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 border-2",
              darkMode 
                ? "bg-white/5 border-white/5 text-white hover:bg-white/10 shadow-indigo-900/20" 
                : "bg-slate-900 border-slate-900 text-white hover:bg-slate-800 shadow-slate-200"
            )}
          >
             <Edit2 size={16} /> Allocation Console
          </button>
        )}
      </div>
    </motion.div>
  );
}
