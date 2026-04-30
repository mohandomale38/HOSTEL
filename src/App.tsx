import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import { 
  Home, 
  Settings, 
  MessageSquare, 
  CreditCard, 
  User as UserIcon, 
  LogOut, 
  Bell,
  Moon,
  Sun,
  LayoutDashboard,
  DoorOpen,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { ResidentDashboard } from './pages/ResidentDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import RoomsPage from './pages/RoomsPage';
import PaymentsPage from './pages/PaymentsPage';
import ComplaintsPage from './pages/ComplaintsPage';
import ResidentsPage from './pages/ResidentsPage';
import NoticesPage from './pages/NoticesPage';
import AuthPage from './pages/AuthPage';
import FeedbackPage from './pages/FeedbackPage';

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Toaster position="top-right" expand={false} richColors />
      <AppContent />
    </BrowserRouter>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppContent() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const savedProfile = window.localStorage.getItem('stayeaseProfile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (profile) {
      window.localStorage.setItem('stayeaseProfile', JSON.stringify(profile));
    } else {
      window.localStorage.removeItem('stayeaseProfile');
    }
  }, [profile]);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  const handleLogout = () => {
    setProfile(null);
    toast.info('Logged out successfully.');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!profile) {
    return <AuthPage onProfileUpdate={(p) => setProfile(p)} />;
  }

  const isAdmin = profile?.role === 'admin';

  return (
    <div className={cn("min-h-screen transition-colors duration-500", darkMode ? "text-slate-100" : "text-slate-900")}>
      <div className="flex h-screen overflow-hidden p-4 md:p-6 gap-4 md:gap-6">
        {/* Sidebar */}
        <aside className={cn(
          "w-20 lg:w-64 flex flex-col transition-all rounded-[32px] shrink-0 overflow-hidden",
          darkMode ? "glass-dark border-indigo-500/10" : "glass border-white/60"
        )}>
          <div className="p-4 lg:p-6 flex items-center justify-center lg:justify-start gap-3 border-b border-white/20">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 shrink-0">
              <Home className="text-white w-6 h-6" />
            </div>
            <span className="font-black text-xl tracking-tight hidden lg:block">StayEase</span>
          </div>

          <nav className="flex-1 p-3 lg:p-4 flex flex-col gap-1 overflow-y-auto no-scrollbar">
            <SidebarLink 
              icon={<LayoutDashboard size={22} />} 
              label="Dashboard" 
              active={location.pathname === (isAdmin ? '/admin' : '/resident')} 
              onClick={() => navigate(isAdmin ? '/admin' : '/resident')} 
              darkMode={darkMode}
            />
            
            {isAdmin ? (
              <>
                <SidebarLink 
                  icon={<DoorOpen size={22} />} 
                  label="Rooms" 
                  active={location.pathname === '/admin/rooms'}
                  onClick={() => navigate('/admin/rooms')}
                  darkMode={darkMode}
                />
                <SidebarLink 
                  icon={<UserIcon size={22} />} 
                  label="Residents" 
                  active={location.pathname === '/admin/residents'}
                  onClick={() => navigate('/admin/residents')}
                  darkMode={darkMode}
                />
                <SidebarLink 
                  icon={<CreditCard size={22} />} 
                  label="Payments" 
                  active={location.pathname === '/admin/payments'}
                  onClick={() => navigate('/admin/payments')}
                  darkMode={darkMode}
                />
                <SidebarLink 
                  icon={<MessageSquare size={22} />} 
                  label="Complaints" 
                  active={location.pathname === '/admin/complaints'}
                  onClick={() => navigate('/admin/complaints')}
                  darkMode={darkMode}
                />
              </>
            ) : (
              <>
                <SidebarLink 
                  icon={<DoorOpen size={22} />} 
                  label="My Room" 
                  active={location.pathname === '/resident/room'}
                  onClick={() => navigate('/resident/room')}
                  darkMode={darkMode}
                />
                <SidebarLink 
                  icon={<CreditCard size={22} />} 
                  label="Rent Details" 
                  active={location.pathname === '/resident/payments'}
                  onClick={() => navigate('/resident/payments')}
                  darkMode={darkMode}
                />
                <SidebarLink 
                  icon={<MessageSquare size={22} />} 
                  label="Complaints" 
                  active={location.pathname === '/resident/complaints'}
                  onClick={() => navigate('/resident/complaints')}
                  darkMode={darkMode}
                />
                <SidebarLink 
                  icon={<Star size={22} />} 
                  label="Feedback" 
                  active={location.pathname === '/resident/feedback'}
                  onClick={() => navigate('/resident/feedback')}
                  darkMode={darkMode}
                />
              </>
            )}

            <div className={cn(
              "mt-4 pt-4 border-t opacity-50 px-2 text-[10px] uppercase font-black tracking-[0.2em] hidden lg:block",
              darkMode ? "border-white/10" : "border-white/20"
            )}>Support</div>
            
            <SidebarLink 
              icon={<Bell size={22} />} 
              label="Notices" 
              active={location.pathname.includes('/notices')}
              onClick={() => navigate(isAdmin ? '/admin/notices' : '/resident/notices')}
              darkMode={darkMode}
            />
            <SidebarLink 
              icon={<Settings size={22} />} 
              label="Settings" 
              active={location.pathname.includes('/settings')}
              onClick={() => navigate(isAdmin ? '/admin/settings' : '/resident/settings')}
              darkMode={darkMode}
            />
          </nav>

          <div className="p-3 lg:p-4 border-t border-white/20">
            <div className="flex items-center justify-center lg:justify-start gap-3 p-2 rounded-2xl hover:bg-white/30 transition-colors group cursor-pointer overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden shrink-0">
                {profile?.avatarUrl ? <img src={profile.avatarUrl} alt="avatar" /> : <UserIcon className="text-indigo-600" />}
              </div>
              <div className="flex-1 min-w-0 hidden lg:block">
                <p className="font-bold text-sm truncate">{profile?.name}</p>
                <p className="text-[10px] text-slate-500 capitalize font-black tracking-widest">{profile?.role}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-rose-500 transition-colors hidden lg:block"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="py-2 flex items-center justify-between shrink-0">
            <div className="flex flex-col">
              <h1 className={cn(
                "text-2xl font-black tracking-tight capitalize",
                darkMode ? "text-white" : "text-slate-900"
              )}>
                {location.pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}
              </h1>
              <p className={cn(
                "text-[10px] font-black uppercase tracking-[0.2em]",
                darkMode ? "text-slate-400" : "text-slate-500"
              )}>Managed by StayEase Engine</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center transition-all shadow-sm",
                  darkMode ? "glass-dark" : "glass-sm hover:bg-white"
                )}
              >
                {darkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-slate-600" />}
              </button>
              <div className={cn(
                "hidden sm:flex h-10 px-4 rounded-2xl items-center gap-2 shadow-sm",
                darkMode ? "glass-dark" : "glass-sm"
              )}>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Live Cloud Sync</span>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto mt-4 pr-1 no-scrollbar pb-10">
            <AnimatePresence mode="wait">
              <Routes location={location}>
                {/* Admin Routes */}
                {isAdmin ? (
                  <>
                    <Route path="/admin" element={<AdminDashboard darkMode={darkMode} />} />
                    <Route path="/admin/rooms" element={<RoomsPage isAdmin={true} darkMode={darkMode} />} />
                    <Route path="/admin/residents" element={<ResidentsPage darkMode={darkMode} />} />
                    <Route path="/admin/payments" element={<PaymentsPage isAdmin={true} userId={profile.userId} darkMode={darkMode} />} />
                    <Route path="/admin/complaints" element={<ComplaintsPage isAdmin={true} userId={profile.userId} darkMode={darkMode} />} />
                    <Route path="/admin/notices" element={<NoticesPage isAdmin={true} darkMode={darkMode} />} />
                    <Route path="/admin/settings" element={<PlaceholderPage title="Account Settings" darkMode={darkMode} />} />
                    <Route path="*" element={<Navigate to="/admin" replace />} />
                  </>
                ) : (
                  <>
                    <Route path="/resident" element={<ResidentDashboard userId={profile.userId} darkMode={darkMode} />} />
                    <Route path="/resident/room" element={<RoomsPage isAdmin={false} userId={profile.userId} darkMode={darkMode} />} />
                    <Route path="/resident/payments" element={<PaymentsPage isAdmin={false} userId={profile.userId} darkMode={darkMode} />} />
                    <Route path="/resident/complaints" element={<ComplaintsPage isAdmin={false} userId={profile.userId} darkMode={darkMode} />} />
                    <Route path="/resident/notices" element={<NoticesPage isAdmin={false} darkMode={darkMode} />} />
                    <Route path="/resident/feedback" element={<FeedbackPage isAdmin={false} userId={profile.userId} darkMode={darkMode} />} />
                    <Route path="/resident/settings" element={<PlaceholderPage title="Account Settings" darkMode={darkMode} />} />
                    <Route path="*" element={<Navigate to="/resident" replace />} />
                  </>
                )}

                {/* Root Redirection */}
                <Route 
                  path="/" 
                  element={<Navigate to={isAdmin ? "/admin" : "/resident"} replace />} 
                />
              </Routes>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarLink({ icon, label, active = false, onClick, darkMode }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void, darkMode?: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
      "flex items-center justify-center lg:justify-start gap-4 px-4 py-4 rounded-2xl transition-all font-bold text-sm w-full relative group",
      active 
        ? (darkMode ? "bg-indigo-600 text-white shadow-xl shadow-indigo-900/40" : "bg-indigo-600 text-white shadow-xl shadow-indigo-100/50")
        : (darkMode ? "text-slate-400 hover:bg-white/5 hover:text-white" : "text-slate-500 hover:bg-white/60 hover:text-indigo-600")
    )}>
      <div className={cn("shrink-0 transition-transform group-hover:scale-110", active && "scale-110")}>
        {icon}
      </div>
      <span className="hidden lg:block flex-1 truncate font-black uppercase tracking-widest text-[10px]">{label}</span>
      {active && <div className="absolute right-3 w-1.5 h-1.5 bg-white rounded-full hidden lg:block" />}
    </button>
  );
}

function PlaceholderPage({ title, darkMode }: { title: string, darkMode?: boolean }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-10 rounded-[48px] h-full flex flex-col items-center justify-center text-center shadow-xl transition-all duration-500",
        darkMode ? "glass-dark shadow-indigo-950/20" : "glass shadow-slate-200/50"
      )}
    >
      <div className={cn(
        "w-24 h-24 rounded-[32px] flex items-center justify-center mb-8 shadow-inner",
        darkMode ? "bg-white/5 text-indigo-400" : "bg-indigo-50 text-indigo-600"
      )}>
        <LayoutDashboard size={48} />
      </div>
      <h2 className={cn("text-4xl font-black mb-4 tracking-tight", darkMode ? "text-white" : "text-slate-900")}>{title}</h2>
      <p className={cn("max-w-md font-medium leading-relaxed", darkMode ? "text-slate-400" : "text-slate-500")}>
        We're ironing out the final details for this module. This section will empower you to manage your <span className="text-indigo-500 font-bold">{title.toLowerCase()}</span> seamlessly.
      </p>
    </motion.div>
  )
}
