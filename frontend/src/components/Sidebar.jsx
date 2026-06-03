import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  UploadCloud, 
  Sparkles, 
  FileText, 
  History, 
  Database,
  GraduationCap,
  BarChart2,
  Settings
} from 'lucide-react';

export default function Sidebar() {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  const adminLinks = [
    { to: '/admin', label: 'Overview', icon: LayoutDashboard },
    { to: '/admin/syllabus', label: 'Upload Syllabus', icon: UploadCloud },
    { to: '/admin/generate-questions', label: 'AI Question Gen', icon: Sparkles },
    { to: '/admin/compile-paper', label: 'Paper Compiler', icon: FileText },
    { to: '/admin/question-bank', label: 'Question Bank', icon: Database },
  ];

  const studentLinks = [
    { to: '/student', label: 'Student Dashboard', icon: LayoutDashboard },
    { to: '/student/take-exam', label: 'Active Exams', icon: GraduationCap },
    { to: '/student/history', label: 'Exam History', icon: History },
    { to: '/student/analytics', label: 'My Analytics', icon: BarChart2 },
  ];

  const links = user.role === 'admin' ? adminLinks : studentLinks;

  return (
    <aside className="w-full md:w-64 glass-panel border-r border-borderGray min-h-screen p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        <div className="px-3 py-2 text-xs font-bold text-textMuted uppercase tracking-wider">
          Navigation Menu
        </div>
        <nav className="flex flex-row md:flex-col flex-wrap gap-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all w-full ${
                    isActive
                      ? 'bg-gradient-to-r from-accentPurple/20 to-accentPink/10 text-white border border-accentPurple/30 font-semibold'
                      : 'text-textMuted hover:text-textLight hover:bg-white/5 border border-transparent'
                  }`
                }
              >
                <Icon size={18} />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="mt-8 pt-4 border-t border-borderGray hidden md:block">
        <div className="flex items-center gap-3 px-3 py-2 text-xs text-textMuted">
          <Settings size={14} />
          <span>System Version 1.0.0</span>
        </div>
      </div>
    </aside>
  );
}
