import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Home, ShieldCheck, User, LogIn, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { getUserProfile, createUserProfile } from '../lib/db';

export default function AuthPage({ onProfileUpdate }: { onProfileUpdate: (p: any) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [roomNo, setRoomNo] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const normalizedEmail = email.toLowerCase();
      const defaultAdminEmail = 'mohandomale38@gmail.com';
      const defaultAdminPassword = 'mohan123';

      if (normalizedEmail === defaultAdminEmail) {
        if (password !== defaultAdminPassword) {
          toast.error('Incorrect password. Please try again.');
          return;
        }

        onProfileUpdate({
          userId: normalizedEmail,
          email: normalizedEmail,
          name: 'Admin',
          role: 'admin',
          avatarUrl: null,
        });
        toast.success('Welcome back to StayEase, Admin!');
        return;
      }

      const existingProfile = await getUserProfile(normalizedEmail);
      if (!existingProfile) {
        toast.error('No account found for this email. Please register first.');
        return;
      }
      if (existingProfile.password !== password) {
        toast.error('Incorrect password. Please try again.');
        return;
      }
      onProfileUpdate({ ...existingProfile, userId: normalizedEmail });
      toast.success(`Welcome back to StayEase, ${existingProfile.name || 'Resident'}!`);
    } catch (error) {
      console.error('Login error:', error);
      const message = error instanceof Error ? error.message : String(error);
      toast.error(`Login failed: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!name || !roomNo || !mobile || !email || !password) {
      toast.error('Please complete all fields before registering.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    if (!/^[0-9]{10}$/.test(mobile)) {
      toast.error('Mobile number must be 10 digits.');
      return;
    }

    setLoading(true);
    try {
      const normalizedEmail = email.toLowerCase();
      const existingProfile = await getUserProfile(normalizedEmail);
      if (existingProfile) {
        toast.error('A user with this email already exists. Please login.');
        setMode('login');
        return;
      }

      const profile = {
        userId: normalizedEmail,
        name,
        email: normalizedEmail,
        mobile,
        roomNo,
        password,
        role: 'resident',
        avatarUrl: null,
      };

      await createUserProfile(normalizedEmail, profile);
      onProfileUpdate(profile);
      toast.success('Registration successful. Welcome to StayEase!');
    } catch (error) {
      console.error('Registration error:', error);
      const message = error instanceof Error ? error.message : String(error);
      toast.error(`Registration failed: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] relative flex items-center justify-center p-4 overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/10 blur-[150px] rounded-full delay-700 animate-pulse" />
      
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
        <div className="hidden lg:flex flex-col gap-10">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-5 group w-fit"
          >
            <div className="w-20 h-20 bg-indigo-600 rounded-[32px] flex items-center justify-center shadow-[0_0_50px_rgba(79,70,229,0.4)] group-hover:scale-110 transition-all duration-500">
              <Home className="text-white w-10 h-10" />
            </div>
            <div>
              <h1 className="text-5xl font-black text-white tracking-tight">StayEase</h1>
              <p className="text-indigo-400 font-black uppercase tracking-[0.3em] text-[10px]">Prop-Tech Ecosystem</p>
            </div>
          </motion.div>

          <div className="space-y-8">
            <h2 className="text-6xl font-black text-white leading-[1.05] tracking-tighter">
              Redefining the <span className="text-indigo-500">Living Experience.</span>
            </h2>
            <p className="text-xl text-slate-400 font-medium max-w-lg leading-relaxed">
              The premier command center for modern property management. Efficiency meets elegance in every interaction.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 max-w-lg">
            <div className="glass-dark p-8 rounded-[40px] border border-white/5 shadow-2xl">
              <div className="text-indigo-400 font-black text-3xl mb-1">500+</div>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Active Residents</p>
            </div>
            <div className="glass-dark p-8 rounded-[40px] border border-white/5 shadow-2xl">
              <div className="text-emerald-400 font-black text-3xl mb-1">99.9%</div>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">System Efficiency</p>
            </div>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-dark p-12 lg:p-16 rounded-[64px] border-2 border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] relative overflow-hidden group"
        >
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl group-hover:bg-indigo-600/20 transition-all duration-1000" />
          
          <div className="relative z-10">
            <div className="mb-8 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMode('login')}
                  className={cn(
                    'flex-1 py-4 rounded-full font-black uppercase tracking-[0.2em] transition-all',
                    mode === 'login'
                      ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20'
                      : 'bg-white/10 text-slate-200 hover:bg-white/15'
                  )}
                >
                  Login
                </button>
                <button
                  onClick={() => setMode('register')}
                  className={cn(
                    'flex-1 py-4 rounded-full font-black uppercase tracking-[0.2em] transition-all',
                    mode === 'register'
                      ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20'
                      : 'bg-white/10 text-slate-200 hover:bg-white/15'
                  )}
                >
                  Register
                </button>
              </div>
              <div>
                <h3 className="text-4xl font-black text-white mb-3 tracking-tight">
                  {mode === 'login' ? 'Student Login' : 'Student Registration'}
                </h3>
                <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">
                  {mode === 'login'
                    ? 'Sign in with email and password'
                    : 'Create your student profile to access StayEase'}
                </p>
              </div>
            </div>

            <div className="space-y-6 mb-12">
              {mode === 'register' && (
                <>
                  <label className="block text-sm font-bold uppercase tracking-[0.15em] text-slate-300">
                    Full Name
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Student Name"
                      className="mt-3 w-full rounded-[28px] border border-white/10 bg-slate-950/70 px-5 py-4 text-white placeholder:text-slate-500 focus:border-indigo-500 outline-none"
                    />
                  </label>
                  <label className="block text-sm font-bold uppercase tracking-[0.15em] text-slate-300">
                    Room Number
                    <input
                      type="text"
                      value={roomNo}
                      onChange={(e) => setRoomNo(e.target.value)}
                      placeholder="Room No"
                      className="mt-3 w-full rounded-[28px] border border-white/10 bg-slate-950/70 px-5 py-4 text-white placeholder:text-slate-500 focus:border-indigo-500 outline-none"
                    />
                  </label>
                  <label className="block text-sm font-bold uppercase tracking-[0.15em] text-slate-300">
                    Mobile Number
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="10-digit mobile number"
                      className="mt-3 w-full rounded-[28px] border border-white/10 bg-slate-950/70 px-5 py-4 text-white placeholder:text-slate-500 focus:border-indigo-500 outline-none"
                    />
                  </label>
                </>
              )}

              <label className="block text-sm font-bold uppercase tracking-[0.15em] text-slate-300">
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-3 w-full rounded-[28px] border border-white/10 bg-slate-950/70 px-5 py-4 text-white placeholder:text-slate-500 focus:border-indigo-500 outline-none"
                />
              </label>

              <label className="relative block text-sm font-bold uppercase tracking-[0.15em] text-slate-300">
                Password
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="mt-3 w-full rounded-[28px] border border-white/10 bg-slate-950/70 px-5 py-4 pr-14 text-white placeholder:text-slate-500 focus:border-indigo-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-[calc(100%_-_42px)] text-slate-300 hover:text-white"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </label>
            </div>

            <button
              disabled={loading}
              onClick={mode === 'login' ? handleLogin : handleRegister}
              className={cn(
                'w-full h-20 rounded-[32px] font-black shadow-2xl transition-all duration-500 flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50 text-[11px] uppercase tracking-[0.25em]',
                mode === 'register' ? 'bg-emerald-500 text-white hover:bg-emerald-400' : 'bg-indigo-600 text-white hover:bg-indigo-500'
              )}
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className="w-7 h-7 border-4 border-current border-t-transparent rounded-full"
                />
              ) : (
                <>
                  <LogIn size={24} />
                  {mode === 'login' ? 'Sign In' : 'Register Student'}
                </>
              )}
            </button>

            <div className="mt-12 flex items-center gap-6">
              <div className="h-px flex-1 bg-white/5" />
              <div className="flex items-center gap-3 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">
                <ShieldCheck size={16} /> Secure Access
              </div>
              <div className="h-px flex-1 bg-white/5" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
