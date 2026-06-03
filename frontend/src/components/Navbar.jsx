import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User as UserIcon, BookOpen } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-borderGray px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
        <div className="bg-gradient-to-tr from-accentPurple to-accentPink p-2 rounded-xl text-white shadow-lg shadow-purple-500/20">
          <BookOpen size={22} />
        </div>
        <div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-textLight to-textMuted bg-clip-text text-transparent">
            AI Exam Portal
          </span>
          <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-accentPurple/20 text-accentPurple border border-accentPurple/30">
            MERN + RAG
          </span>
        </div>
      </div>

      {user && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accentPurple/30 to-accentPink/30 border border-borderGray flex items-center justify-center text-white">
              <UserIcon size={18} />
            </div>
            <div className="hidden md:block">
              <div className="text-sm font-semibold text-textLight">{user.username}</div>
              <div className="text-xs text-textMuted capitalize">{user.role} Account</div>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-borderGray hover:border-red-500/30 hover:bg-red-500/10 text-textMuted hover:text-red-400 transition-all text-sm"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      )}
    </header>
  );
}
