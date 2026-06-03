import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import { User, Settings, Shield, Mail, Key } from 'lucide-react';

export default function ProfileSettings() {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-white">Account & Portal Settings</h2>
        <p className="text-textMuted text-sm mt-1">Manage credentials, view authorization scope, and configure testing limits</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Profile Details */}
        <GlassCard hoverEffect={false}>
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <User size={18} className="text-accentPurple" /> Profile Details
          </h3>

          <div className="space-y-5">
            <div className="border-b border-borderGray/30 pb-4">
              <span className="text-xs text-textMuted font-bold uppercase tracking-wider block">Username</span>
              <span className="text-sm font-semibold text-white mt-1 block">{user.username}</span>
            </div>

            <div className="border-b border-borderGray/30 pb-4">
              <span className="text-xs text-textMuted font-bold uppercase tracking-wider block">Email Address</span>
              <span className="text-sm font-semibold text-white mt-1 block">{user.email}</span>
            </div>

            <div className="pb-2">
              <span className="text-xs text-textMuted font-bold uppercase tracking-wider block">Role Authorization</span>
              <span className="text-xs font-bold uppercase mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accentPurple/25 text-accentPurple border border-accentPurple/30">
                <Shield size={12} />
                {user.role} Account
              </span>
            </div>
          </div>
        </GlassCard>

        {/* System Settings */}
        <GlassCard hoverEffect={false}>
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Settings size={18} className="text-accentPink" /> Portal Settings
          </h3>

          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-borderGray/30 pb-4">
              <div>
                <span className="text-sm font-semibold text-white block">Integrity Monitor</span>
                <span className="text-xs text-textMuted mt-0.5 block">Log browser focus and tab changes during test sessions.</span>
              </div>
              <div className="w-10 h-6 bg-accentPurple rounded-full p-1 cursor-pointer shrink-0">
                <div className="w-4 h-4 bg-white rounded-full translate-x-4 transition-all"></div>
              </div>
            </div>

            <div className="flex items-center justify-between border-b border-borderGray/30 pb-4">
              <div>
                <span className="text-sm font-semibold text-white block">Autosave Synchronization</span>
                <span className="text-xs text-textMuted mt-0.5 block">Periodically upload answers to server databases every 10 seconds.</span>
              </div>
              <div className="w-10 h-6 bg-accentPurple rounded-full p-1 cursor-pointer shrink-0">
                <div className="w-4 h-4 bg-white rounded-full translate-x-4 transition-all"></div>
              </div>
            </div>

            <div className="flex items-center justify-between pb-2">
              <div>
                <span className="text-sm font-semibold text-white block">Local RAG Fallback</span>
                <span className="text-xs text-textMuted mt-0.5 block">Utilize local text searches when vector indexes are not active.</span>
              </div>
              <div className="w-10 h-6 bg-accentPurple rounded-full p-1 cursor-pointer shrink-0">
                <div className="w-4 h-4 bg-white rounded-full translate-x-4 transition-all"></div>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
