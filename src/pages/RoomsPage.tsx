import React, { useEffect, useState } from 'react';
import { getRooms, updateRoom, addRoom, allocateRoom, getUserProfile } from '../lib/db';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { DoorOpen, Plus, Search, Filter, MoreVertical, Edit2, Trash2, UserPlus, CheckCircle2, AlertCircle, Star } from 'lucide-react';
import { toast } from 'sonner';

export default function RoomsPage({ isAdmin, userId, darkMode }: { isAdmin: boolean, userId?: string, darkMode?: boolean }) {
  const [rooms, setRooms] = useState<any[]>([]);
  const [userRoomId, setUserRoomId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    loadRooms();
    if (userId) {
      getUserProfile(userId).then((p: any) => setUserRoomId(p?.roomId || null));
    }
  }, [userId]);

  async function loadRooms() {
    setLoading(true);
    const data = await getRooms();
    if (data) setRooms(data);
    setLoading(false);
  }

  const filteredRooms = rooms.filter(r => 
    r.number.toLowerCase().includes(search.toLowerCase()) ||
    r.type.toLowerCase().includes(search.toLowerCase())
  );

  const myAllocatedRoom = rooms.find(r => r.id === userRoomId);
  const otherRooms = rooms.filter(r => r.id !== userRoomId);

  return (
    <div className="space-y-8 pb-12 pr-4">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative flex-1 max-w-xl">
          <Search className={cn("absolute left-6 top-1/2 -translate-y-1/2", darkMode ? "text-slate-500" : "text-slate-400")} size={20} />
          <input 
            type="text"
            placeholder="Search by Room Number or Bed Count..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(
              "w-full border-2 rounded-[32px] pl-16 pr-6 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold shadow-sm",
              darkMode ? "bg-white/5 border-white/5 text-white placeholder:text-slate-600" : "bg-white border-slate-100 text-slate-700"
            )}
          />
        </div>
        
        {isAdmin && (
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-[24px] font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/20"
          >
            <Plus size={24} /> New Room
          </button>
        )}
      </div>

      {/* Resident: Show Allocated Room First */}
      {!isAdmin && myAllocatedRoom && (
        <div className="space-y-4">
          <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest ml-4">Your Active Allocation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <RoomCard room={myAllocatedRoom} isAdmin={isAdmin} userId={userId} onUpdate={loadRooms} isMyRoom darkMode={darkMode} />
          </div>
          <div className={cn("h-px w-full", darkMode ? "bg-white/5" : "bg-slate-100")} />
        </div>
      )}

      {/* Main Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest ml-4">
          {isAdmin ? 'Entire Inventory' : 'Available for Booking'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={cn(
                "h-64 animate-pulse rounded-[40px]",
                darkMode ? "glass-dark" : "glass"
              )} />
            ))
          ) : (isAdmin ? filteredRooms : otherRooms.filter(r => r.status === 'Available')).length === 0 ? (
            <div className={cn(
              "col-span-full py-24 text-center rounded-[48px] font-medium border-2 border-dashed",
              darkMode ? "glass-dark border-white/5 text-slate-600" : "glass border-slate-200 text-slate-400"
            )}>
              No matching spaces found.
            </div>
          ) : (
            (isAdmin ? filteredRooms : otherRooms.filter(r => r.status === 'Available')).map((room) => (
              <RoomCard 
                key={room.id} 
                room={room} 
                isAdmin={isAdmin} 
                userId={userId} 
                onUpdate={loadRooms} 
                darkMode={darkMode}
              />
            ))
          )}
        </div>
      </div>

      <AnimatePresence>
        {isAddModalOpen && (
          <AddRoomModal onClose={() => setIsAddModalOpen(false)} darkMode={darkMode} onSuccess={() => {
            setIsAddModalOpen(false);
            loadRooms();
          }} />
        )}
      </AnimatePresence>
    </div>
  );
}

function RoomCard({ room, isAdmin, userId, onUpdate, isMyRoom, darkMode }: any) {
  const [isBooking, setIsBooking] = useState(false);

  const handleStatusToggle = async () => {
    if (!isAdmin) return;
    const newStatus = room.status === 'Available' ? 'Maintenance' : 'Available';
    await updateRoom(room.id, { status: newStatus });
    toast.success(`Room ${room.number} moved to ${newStatus}`);
    onUpdate();
  };

  const handleBook = async () => {
    if (!userId) return;
    setIsBooking(true);
    await allocateRoom(room.id, userId);
    toast.success(`Booking request for Room ${room.number} successful!`);
    onUpdate();
    setIsBooking(false);
  };

  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className={cn(
        "p-8 rounded-[40px] group relative overflow-hidden transition-all duration-500 border-2",
        isMyRoom ? "glass-indigo border-indigo-400/30 shadow-2xl shadow-indigo-900/40" : 
        darkMode ? "glass-dark border-white/5 hover:bg-white/5" : "glass border-white/50 hover:bg-indigo-50/20"
      )}
    >
      <div className="flex items-start justify-between mb-8">
        <div className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:rotate-12",
          isMyRoom ? "bg-white/20 text-white" : 
          darkMode ? "bg-indigo-500/20 text-indigo-400" : "bg-indigo-50 text-indigo-600"
        )}>
          <DoorOpen size={28} />
        </div>
        <div className="flex flex-col items-end">
          <span className={cn(
            "text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-[0.1em] border",
            isMyRoom ? "bg-white/20 text-white border-white/10" : 
            room.status === 'Available' ? (darkMode ? "bg-emerald-900/20 text-emerald-400 border-emerald-900/30" : "bg-emerald-100 text-emerald-700 border-emerald-200") :
            room.status === 'Full' ? (darkMode ? "bg-indigo-900/20 text-indigo-400 border-indigo-900/30" : "bg-indigo-100 text-indigo-700 border-indigo-200") : 
            (darkMode ? "bg-amber-900/20 text-amber-400 border-amber-900/30" : "bg-amber-100 text-amber-700 border-amber-200")
          )}>
            {isMyRoom ? 'Allocated' : room.status}
          </span>
          <p className={cn("text-[10px] font-black mt-2 uppercase tracking-widest", isMyRoom ? "text-indigo-100" : "text-slate-500")}>{room.type} Room</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className={cn("text-3xl font-black tracking-tight", isMyRoom ? "text-white" : darkMode ? "text-white" : "text-slate-900")}>Room {room.number}</h3>
          <p className={cn("text-base font-black mt-1", isMyRoom ? "text-indigo-100" : "text-indigo-600")}>
            {formatCurrency(room.rent)} <span className={cn("text-[10px] uppercase tracking-widest font-bold opacity-60", isMyRoom ? "text-white" : "text-slate-500")}>/ month</span>
          </p>
        </div>

        <div className={cn("pt-6 border-t font-black uppercase tracking-[0.2em] text-[10px] space-y-4", 
          isMyRoom ? "border-white/20" : darkMode ? "border-white/5" : "border-slate-100")}>
          <div className="flex items-center justify-between">
            <span className={isMyRoom ? "text-indigo-100" : "text-slate-500"}>Live Occupancy</span>
            <span className={isMyRoom ? "text-white" : darkMode ? "text-slate-400" : "text-slate-900"}>{room.occupancy} / {room.capacity} beds</span>
          </div>
          <div className={cn("w-full h-2 rounded-full overflow-hidden", isMyRoom ? "bg-white/10" : darkMode ? "bg-white/5" : "bg-slate-100")}>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(room.occupancy / room.capacity) * 100}%` }}
              className={cn(
                "h-full rounded-full",
                isMyRoom ? "bg-white" : (room.occupancy / room.capacity) >= 1 ? "bg-indigo-600" : "bg-emerald-500"
              )}
            />
          </div>
        </div>

        {!isAdmin && room.status === 'Available' && !isMyRoom && (
          <button 
            disabled={isBooking}
            onClick={handleBook}
            className="w-full py-4 rounded-[20px] bg-indigo-600 text-white font-black hover:bg-indigo-700 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50 shadow-xl shadow-indigo-900/20"
          >
            {isBooking ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Request Booking"}
          </button>
        )}
      </div>

      {isAdmin && (
        <div className={cn(
          "absolute bottom-6 right-8 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 flex gap-1 backdrop-blur-md p-1.5 rounded-2xl shadow-xl",
          darkMode ? "bg-slate-900/90" : "bg-white/90"
        )}>
           <button className="p-2.5 text-slate-400 hover:text-indigo-600 transition-all rounded-xl hover:bg-indigo-50/50" title="Edit Details">
             <Edit2 size={16} />
           </button>
           <button 
             onClick={handleStatusToggle}
             className="p-2.5 text-slate-400 hover:text-amber-600 transition-all rounded-xl hover:bg-amber-50/50" 
             title="Toggle Maintenance Mode"
           >
             {room.status === 'Maintenance' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
           </button>
           <button 
             className="p-2.5 text-slate-400 hover:text-rose-600 transition-all rounded-xl hover:bg-rose-50/50" 
             title="Remove Inventory"
           >
             <Trash2 size={16} />
           </button>
        </div>
      )}
    </motion.div>
  );
}

function AddRoomModal({ onClose, onSuccess, darkMode }: any) {
  const [formData, setFormData] = useState({
    number: '',
    type: 'Double',
    rent: 8500,
    capacity: 2
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    await addRoom(formData);
    toast.success(`Room ${formData.number} added successfully`);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={cn(
          "w-full max-w-md p-8 rounded-[40px] shadow-2xl border-2",
          darkMode ? "glass-dark border-indigo-500/20" : "glass border-white/80"
        )}
      >
        <h3 className={cn("text-2xl font-black mb-6", darkMode ? "text-white" : "text-slate-900")}>New Inventory Unit</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Room Number</label>
            <input 
              required
              value={formData.number}
              onChange={e => setFormData(f => ({ ...f, number: e.target.value }))}
              placeholder="e.g., 301"
              className={cn(
                "w-full border-2 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold",
                darkMode ? "bg-white/5 border-white/5 text-white placeholder:text-slate-700" : "bg-white/50 border-slate-100"
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Type</label>
              <select 
                value={formData.type}
                onChange={e => setFormData(f => ({ ...f, type: e.target.value }))}
                className={cn(
                  "w-full border-2 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold appearance-none",
                  darkMode ? "bg-slate-900 border-white/5 text-white" : "bg-white/50 border-slate-100"
                )}
              >
                <option>Single</option>
                <option>Double</option>
                <option>Triple</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Capacity</label>
              <input 
                type="number"
                required
                min={1}
                value={formData.capacity}
                onChange={e => setFormData(f => ({ ...f, capacity: Math.max(1, parseInt(e.target.value) || 1) }))}
                className={cn(
                   "w-full border-2 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold",
                   darkMode ? "bg-white/5 border-white/5 text-white" : "bg-white/50 border-slate-100"
                )}
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Monthly Rent</label>
            <input 
              type="number"
              required
              min={0}
              value={formData.rent}
              onChange={e => setFormData(f => ({ ...f, rent: Math.max(0, parseInt(e.target.value) || 0) }))}
              className={cn(
                "w-full border-2 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold",
                darkMode ? "bg-white/5 border-white/5 text-white" : "bg-white/50 border-slate-100"
              )}
            />
          </div>
          
          <div className="flex gap-4 pt-6">
            <button 
              type="button" 
              onClick={onClose} 
              className={cn(
                "flex-1 py-3.5 px-6 rounded-2xl border-2 font-black uppercase text-[10px] tracking-widest transition-all",
                darkMode ? "border-white/5 text-slate-500 hover:bg-white/5" : "border-slate-100 text-slate-500 hover:bg-slate-50"
              )}
            >
              Cancel
            </button>
            <button type="submit" className="flex-1 py-3.5 px-6 rounded-2xl bg-indigo-600 text-white font-black uppercase text-[10px] tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/20">Create Room</button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
