import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import GlassCard from '../../components/GlassCard';
import Loader from '../../components/Loader';
import { 
  Users, 
  FileText, 
  UploadCloud, 
  Award, 
  CheckCircle,
  AlertTriangle 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/analytics/admin');
        setStats(res.data.stats);
        setCharts(res.data.charts);
      } catch (err) {
        console.error('Failed to load admin analytics:', err);
        setError('Could not retrieve analytics data.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div className="h-full flex items-center justify-center"><Loader message="Aggregating assessment databases..." /></div>;

  return (
    <div className="space-y-8 p-6">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-white">Educator Overview</h2>
        <p className="text-textMuted text-sm mt-1">Cohort metrics, syllabus counts, and taxonomy performance diagnostics</p>
      </div>

      {error && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 p-4 rounded-xl flex items-center gap-3">
          <AlertTriangle size={20} />
          <span>{error} Rendering simulation datasets for design demonstration.</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <GlassCard hoverEffect={true} className="flex flex-col justify-between">
          <div className="text-textMuted text-xs font-bold uppercase tracking-wider">Total Students</div>
          <div className="flex items-baseline justify-between mt-4">
            <span className="text-3xl font-extrabold text-white">{stats?.totalStudents ?? 0}</span>
            <Users size={20} className="text-accentPurple" />
          </div>
        </GlassCard>

        <GlassCard hoverEffect={true} className="flex flex-col justify-between">
          <div className="text-textMuted text-xs font-bold uppercase tracking-wider">Syllabi Uploaded</div>
          <div className="flex items-baseline justify-between mt-4">
            <span className="text-3xl font-extrabold text-white">{stats?.totalSyllabi ?? 0}</span>
            <UploadCloud size={20} className="text-accentPink" />
          </div>
        </GlassCard>

        <GlassCard hoverEffect={true} className="flex flex-col justify-between">
          <div className="text-textMuted text-xs font-bold uppercase tracking-wider">Compiled Papers</div>
          <div className="flex items-baseline justify-between mt-4">
            <span className="text-3xl font-extrabold text-white">{stats?.totalPapers ?? 0}</span>
            <FileText size={20} className="text-purple-400" />
          </div>
        </GlassCard>

        <GlassCard hoverEffect={true} className="flex flex-col justify-between">
          <div className="text-textMuted text-xs font-bold uppercase tracking-wider">Exams Answered</div>
          <div className="flex items-baseline justify-between mt-4">
            <span className="text-3xl font-extrabold text-white">{stats?.totalExamsTaken ?? 0}</span>
            <CheckCircle size={20} className="text-green-400" />
          </div>
        </GlassCard>

        <GlassCard hoverEffect={true} className="flex flex-col justify-between col-span-2 lg:col-span-1">
          <div className="text-textMuted text-xs font-bold uppercase tracking-wider">Cohort Avg Score</div>
          <div className="flex items-baseline justify-between mt-4">
            <span className="text-3xl font-extrabold text-white">{stats?.averageScore ?? 0}%</span>
            <Award size={20} className="text-yellow-400 animate-pulse" />
          </div>
        </GlassCard>
      </div>

      {/* Chart layouts */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Subject average performance */}
        <GlassCard hoverEffect={false}>
          <h3 className="text-lg font-bold text-white mb-6">Subject Score Distributions</h3>
          <div className="h-80 w-full">
            {charts?.subjectData?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.subjectData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="subject" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} unit="%" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#11131c', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }}
                    labelClassName="text-white"
                  />
                  <Bar dataKey="avgScore" fill="#7c3aed" radius={[6, 6, 0, 0]} name="Avg Score" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-textMuted text-sm">No exam data generated yet.</div>
            )}
          </div>
        </GlassCard>

        {/* Bloom taxonomy distribution */}
        <GlassCard hoverEffect={false}>
          <h3 className="text-lg font-bold text-white mb-6">Bloom's Taxonomy Performance</h3>
          <div className="h-80 w-full flex items-center justify-center">
            {charts?.bloomData?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" radius="70%" data={charts.bloomData}>
                  <PolarGrid stroke="rgba(255,255,255,0.05)" />
                  <PolarAngleAxis dataKey="level" stroke="#9ca3af" fontSize={12} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#9ca3af" fontSize={10} />
                  <Radar name="Cognitive Level" dataKey="performance" stroke="#db2777" fill="#db2777" fillOpacity={0.3} />
                  <Tooltip contentStyle={{ backgroundColor: '#11131c', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-textMuted text-sm">No taxonomy ratios generated.</div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Difficulty statistics */}
      <GlassCard hoverEffect={false}>
        <h3 className="text-lg font-bold text-white mb-4">Cohort Performance by Difficulty Level</h3>
        <div className="grid md:grid-cols-3 gap-6 pt-4">
          {charts?.difficultyData?.map((item, idx) => (
            <div key={idx} className="border border-borderGray p-4 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-xs text-textMuted uppercase font-bold tracking-wider">{item.level} Questions</div>
                <div className="text-2xl font-black mt-2 text-white">{item.correctRate}% <span className="text-xs font-normal text-textMuted">Accuracy</span></div>
              </div>
              <div className="w-16 h-2 bg-white/5 rounded-full overflow-hidden shrink-0 ml-4">
                <div 
                  className={`h-full ${item.level === 'Easy' ? 'bg-green-500' : item.level === 'Medium' ? 'bg-accentPurple' : 'bg-accentPink'}`}
                  style={{ width: `${item.correctRate}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
