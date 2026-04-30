import React, { useEffect, useState } from 'react';
import { getMyPayments, getAllPayments, makePayment } from '../lib/db';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, Download, Plus, Search, Filter, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function PaymentsPage({ isAdmin, userId, darkMode }: { isAdmin: boolean, userId: string, darkMode?: boolean }) {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);

  useEffect(() => {
    loadPayments();
  }, []);

  async function loadPayments() {
    setLoading(true);
    const data = isAdmin ? await getAllPayments() : await getMyPayments(userId);
    if (data) setPayments(data);
    setLoading(false);
  }

  const totalRevenue = payments.reduce((acc, p) => acc + (p.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={cn(
          "md:col-span-2 p-8 rounded-[40px] relative overflow-hidden group border-2 transition-all duration-500",
          darkMode ? "glass-dark border-white/5" : "glass border-white/60"
        )}>
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
             <CreditCard size={180} className={darkMode ? "text-white" : "text-indigo-600"} />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">
              {isAdmin ? "TOTAL PORTFOLIO REVENUE" : "TOTAL LIFETIME INVESTED"}
            </p>
            <h3 className={cn("text-5xl font-black mb-2 tracking-tight", darkMode ? "text-white" : "text-slate-900")}>{formatCurrency(totalRevenue)}</h3>
            <p className="text-sm font-bold text-indigo-500">Processing {payments.length} successful settlements</p>
            
            <div className="mt-8 flex flex-wrap gap-4">
               {!isAdmin && (
                 <button 
                   onClick={() => setIsPayModalOpen(true)}
                   className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/20 flex items-center gap-2"
                 >
                   <Plus size={18} /> Settle Dues
                 </button>
               )}
               <button className={cn(
                 "px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-2 border-2",
                 darkMode ? "bg-white/5 border-white/5 text-white hover:bg-white/10" : "bg-white/50 border-slate-100 text-slate-700 hover:bg-white"
               )}>
                 <Download size={18} /> Tax Report
               </button>
            </div>
          </div>
        </div>

        <div className={cn(
          "p-8 rounded-[40px] flex flex-col justify-center border-2 transition-all duration-500",
          darkMode ? "glass-dark border-amber-500/10" : "glass border-amber-100"
        )}>
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-lg",
              darkMode ? "bg-amber-500/20 text-amber-400" : "bg-amber-50 text-amber-600"
            )}>
              <Clock size={24} />
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Cycle Horizon</p>
            <h4 className={cn("text-3xl font-black mb-1 tracking-tight", darkMode ? "text-white" : "text-slate-900")}>{formatCurrency(8500)}</h4>
            <p className={cn(
              "text-[10px] font-black uppercase tracking-widest",
              darkMode ? "text-amber-400" : "text-amber-600"
            )}>Due in 6 Days</p>
        </div>
      </div>

      {/* Transaction List */}
      <div className={cn(
        "p-8 rounded-[40px] border-2 transition-all duration-500",
        darkMode ? "glass-dark border-white/5" : "glass border-white/60"
      )}>
        <div className="flex items-center justify-between mb-8 px-2">
          <h3 className={cn("text-xl font-black tracking-tight", darkMode ? "text-white" : "text-slate-900")}>Transactional Audit</h3>
          <div className="flex items-center gap-2">
            <button className={cn(
              "p-3 rounded-xl transition-all",
              darkMode ? "bg-white/5 text-slate-500 hover:bg-white/10" : "bg-slate-50 text-slate-400"
            )}><Search size={18} /></button>
            <button className={cn(
              "p-3 rounded-xl transition-all",
              darkMode ? "bg-white/5 text-slate-500 hover:bg-white/10" : "bg-slate-50 text-slate-400"
            )}><Filter size={18} /></button>
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar">
           <table className="w-full text-left border-collapse min-w-[700px]">
             <thead>
               <tr className={cn(
                 "text-[10px] uppercase font-black tracking-widest text-slate-500 border-b",
                 darkMode ? "border-white/5" : "border-slate-100"
               )}>
                 <th className="pb-6 px-4">Ref Trace</th>
                 <th className="pb-6 px-4">{isAdmin ? "Origin Entity" : "Description Scope"}</th>
                 <th className="pb-6 px-4">Timestamp</th>
                 <th className="pb-6 px-4">Verification</th>
                 <th className="pb-6 px-4 text-right">Value</th>
               </tr>
             </thead>
             <tbody className="text-sm font-medium">
               {loading ? (
                 Array.from({ length: 3 }).map((_, i) => (
                   <tr key={i} className="animate-pulse">
                     <td colSpan={5} className="py-6 px-4">
                       <div className={cn("h-4 w-full rounded-lg", darkMode ? "bg-white/5" : "bg-slate-50")} />
                     </td>
                   </tr>
                 ))
               ) : payments.length === 0 ? (
                 <tr>
                    <td colSpan={5} className="py-24 text-center text-slate-500 italic font-medium">Clear history — no active transactions.</td>
                 </tr>
               ) : (
                 payments.map((p) => (
                   <tr key={p.id} className={cn(
                     "border-b transition-colors group",
                     darkMode ? "border-white/5 hover:bg-white/5" : "border-slate-50 hover:bg-slate-50/50"
                   )}>
                     <td className="py-6 px-4 font-mono text-[10px] text-slate-500">{p.transactionId}</td>
                     <td className="py-6 px-4">
                       <div className="flex items-center gap-4">
                         <div className={cn(
                           "w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                           p.status === 'Paid' 
                             ? (darkMode ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-600") 
                             : (darkMode ? "bg-amber-500/10 text-amber-400" : "bg-amber-50 text-amber-600")
                         )}>
                           {p.status === 'Paid' ? <ArrowDownLeft size={18} /> : <Clock size={18} />}
                         </div>
                         <div>
                           <p className={cn("font-black tracking-tight", darkMode ? "text-white" : "text-slate-900")}>{p.month} {p.year} Unit Settlement</p>
                           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{p.method}</p>
                         </div>
                       </div>
                     </td>
                     <td className="py-6 px-4 text-slate-500 font-bold text-[11px] uppercase tracking-wider">{p.createdAt ? format(p.createdAt.toDate(), 'dd MMM yyyy') : '-'}</td>
                     <td className="py-6 px-4">
                        <span className={cn(
                          "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                          p.status === 'Paid' 
                            ? (darkMode ? "bg-emerald-900/20 text-emerald-400 border-emerald-900/30" : "bg-emerald-100 text-emerald-700 border-emerald-200") 
                            : (darkMode ? "bg-amber-900/20 text-amber-400 border-amber-900/30" : "bg-amber-100 text-amber-700 border-amber-200")
                        )}>
                          {p.status}
                        </span>
                     </td>
                     <td className={cn("py-6 px-4 text-right font-black text-base", darkMode ? "text-white" : "text-slate-900")}>{formatCurrency(p.amount)}</td>
                   </tr>
                 ))
               )}
             </tbody>
           </table>
        </div>
      </div>

      <AnimatePresence>
        {isPayModalOpen && (
          <PayModal 
            onClose={() => setIsPayModalOpen(false)} 
            darkMode={darkMode}
            userId={userId} 
            onSuccess={() => {
              setIsPayModalOpen(false);
              loadPayments();
            }} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPayModalOpen && (
          <PayModal 
            onClose={() => setIsPayModalOpen(false)} 
            userId={userId} 
            onSuccess={() => {
              setIsPayModalOpen(false);
              loadPayments();
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function PayModal({ onClose, userId, onSuccess, darkMode }: any) {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    // Simulate API delay
    await new Promise(r => setTimeout(r, 1500));
    const now = new Date();
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    await makePayment(userId, 8500, months[now.getMonth()], now.getFullYear());
    toast.success("Payment successful! Transaction ID generated.");
    onSuccess();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/20 backdrop-blur-[6px]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={cn(
          "w-full max-w-md p-10 rounded-[48px] shadow-2xl text-center border-2",
          darkMode ? "glass-dark border-white/5" : "glass border-white/80"
        )}
      >
        <div className={cn(
          "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl",
          darkMode ? "bg-indigo-500/20 text-indigo-400" : "bg-indigo-50 text-indigo-600"
        )}>
          <CreditCard size={40} />
        </div>
        <h3 className={cn("text-3xl font-black mb-2 tracking-tight", darkMode ? "text-white" : "text-slate-900")}>Confirm Clearance</h3>
        <p className={cn("mb-10 px-4 font-medium", darkMode ? "text-slate-400" : "text-slate-500")}>
          Authorizing <span className={cn("font-black", darkMode ? "text-white" : "text-slate-900")}>{formatCurrency(8500)}</span> settlement for <span className="font-bold underline decoration-indigo-500">April 2024</span> rent cycle.
        </p>
        
        <div className="space-y-4">
          <button 
            disabled={loading}
            onClick={handlePay} 
            className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/40 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>Authorize Transaction <Plus size={20} /></>
            )}
          </button>
          <button 
            onClick={onClose} 
            className="w-full py-4 text-slate-500 font-black uppercase text-[10px] tracking-widest hover:text-rose-500 transition-all"
          >
            Abort Operation
          </button>
        </div>

        <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-center gap-2 text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">
           <ArrowUpRight size={12} className="text-emerald-500" /> SECURE TUNNEL ENCRYPTED
        </div>
      </motion.div>
    </div>
  )
}
