import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User as UserIcon, Mail, Lock, UserPlus, AlertCircle } from 'lucide-react';
import GlassCard from '../components/GlassCard';

export default function Register() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password || !role) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await register(username, email, password, role);
      if (data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/student');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-darkBg flex items-center justify-center p-6 relative">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-accentPink/15 rounded-full blur-3xl -z-10"></div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-white">Create Account</h2>
          <p className="text-textMuted text-sm mt-2">Join our AI-powered academic assessment portal</p>
        </div>

        <GlassCard hoverEffect={false} className="glow-card">
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3.5 rounded-xl flex items-start gap-2.5 text-sm">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-textLight uppercase tracking-wider block">Username</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-textMuted">
                  <UserIcon size={18} />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="johndoe"
                  className="w-full bg-white/5 border border-borderGray rounded-xl py-3 pl-10 pr-4 text-sm text-textLight placeholder-textMuted focus:outline-none focus:border-accentPurple focus:ring-1 focus:ring-accentPurple/30 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-textLight uppercase tracking-wider block">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-textMuted">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  className="w-full bg-white/5 border border-borderGray rounded-xl py-3 pl-10 pr-4 text-sm text-textLight placeholder-textMuted focus:outline-none focus:border-accentPurple focus:ring-1 focus:ring-accentPurple/30 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-textLight uppercase tracking-wider block">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-textMuted">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="•••••••• (min 6 characters)"
                  className="w-full bg-white/5 border border-borderGray rounded-xl py-3 pl-10 pr-4 text-sm text-textLight placeholder-textMuted focus:outline-none focus:border-accentPurple focus:ring-1 focus:ring-accentPurple/30 transition-all"
                  minLength={6}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-textLight uppercase tracking-wider block">Select Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-[#11131c] border border-borderGray rounded-xl py-3 px-4 text-sm text-textLight focus:outline-none focus:border-accentPurple transition-all"
              >
                <option value="student">Student Account</option>
                <option value="admin">Educator / Admin Account</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-accentPurple to-accentPink hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 disabled:opacity-50 transition-all mt-6"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <UserPlus size={18} />
                  Register Account
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-xs text-textMuted border-t border-borderGray pt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-accentPurple hover:text-purple-400 font-semibold transition-all">
              Sign In
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
