import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import GlassCard from '../../components/GlassCard';
import Loader from '../../components/Loader';
import { 
  Award, 
  CheckCircle, 
  HelpCircle, 
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Clock
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [topics, setTopics] = useState({ strong: [], weak: [] });
  const [recentExams, setRecentExams] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Load student stats
        const res = await api.get('/analytics/student');
        setStats(res.data.stats);
        setCharts(res.data.charts);
        setTopics(res.data.topics);

        // Load recent exams
        const historyRes = await api.get('/exams/history');
        setRecentExams(historyRes.data.results.slice(0, 3));
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
        setError('Failed to fetch dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <div className="h-full flex items-center justify-center"><Loader message="Retrieving report cards & study plans..." /></div>;

  const COLORS = ['#10b981', '#ef4444', '#9ca3af'];

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-white">Student Dashboard</h2>
        <p className="text-textMuted text-sm mt-1">Review active results, accuracy charts, and AI study plans</p>
      </div>

      {error && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 p-4 rounded-xl flex items-center gap-3">
          <AlertTriangle size={20} />
          <span>{error} Attempting simulations for visual details.</span>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard hoverEffect={true} className="flex flex-col justify-between">
          <div className="text-textMuted text-xs font-bold uppercase tracking-wider">Exams Taken</div>
          <div className="flex items-baseline justify-between mt-4">
            <span className="text-3xl font-extrabold text-white">{stats?.examsTaken ?? 0}</span>
            <Award size={20} className="text-accentPurple animate-pulse" />
          </div>
        </GlassCard>

        <GlassCard hoverEffect={true} className="flex flex-col justify-between">
          <div className="text-textMuted text-xs font-bold uppercase tracking-wider">Avg Score</div>
          <div className="flex items-baseline justify-between mt-4">
            <span className="text-3xl font-extrabold text-white">{stats?.averagePercentage ?? 0}%</span>
            <TrendingUp size={20} className="text-green-400" />
          </div>
        </GlassCard>

        <GlassCard hoverEffect={true} className="flex flex-col justify-between">
          <div className="text-textMuted text-xs font-bold uppercase tracking-wider">Overall Accuracy</div>
          <div className="flex items-baseline justify-between mt-4">
            <span className="text-3xl font-extrabold text-white">{stats?.accuracy ?? 0}%</span>
            <CheckCircle size={20} className="text-accentPink" />
          </div>
        </GlassCard>

        <GlassCard hoverEffect={true} className="flex flex-col justify-between">
          <div className="text-textMuted text-xs font-bold uppercase tracking-wider">Questions Solved</div>
          <div className="flex items-baseline justify-between mt-4">
            <span className="text-3xl font-extrabold text-white">
              {(stats?.correctCount ?? 0) + (stats?.wrongCount ?? 0)}
            </span>
            <HelpCircle size={20} className="text-yellow-400" />
          </div>
        </GlassCard>
      </div>

      {/* Recharts trends */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Line Chart for scores */}
        <GlassCard hoverEffect={false} className="lg:col-span-2">
          <h3 className="text-lg font-bold text-white mb-6">Score Progress Trend</h3>
          <div className="h-80 w-full">
            {charts?.scoreTrend?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.scoreTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} unit="%" domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#11131c', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }}
                    labelClassName="text-white"
                  />
                  <Line type="monotone" dataKey="percentage" stroke="#7c3aed" strokeWidth={3} dot={{ r: 6 }} name="Percentage" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-textMuted text-sm">
                No exam attempts on file yet. Try taking your first quiz!
              </div>
            )}
          </div>
        </GlassCard>

        {/* Pie Chart for accuracy */}
        <GlassCard hoverEffect={false} className="lg:col-span-1 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-6">Answer Breakdown</h3>
            <div className="h-56 w-full flex items-center justify-center">
              {stats?.examsTaken > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts.accuracyData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {charts.accuracyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#11131c', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-textMuted text-sm">No answering stats.</div>
              )}
            </div>
          </div>
          <div className="flex justify-around text-xs text-textMuted border-t border-borderGray/30 pt-4 mt-4">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#10b981]"></span>Correct</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#ef4444]"></span>Wrong</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#9ca3af]"></span>Skipped</span>
          </div>
        </GlassCard>
      </div>

      {/* AI Recommendations & Recent exams list */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Strengths & Weaknesses */}
        <GlassCard hoverEffect={false} className="lg:col-span-1 space-y-6">
          <div>
            <h3 className="text-base font-extrabold text-white mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-green-400" /> Topic Strengths
            </h3>
            <div className="flex flex-wrap gap-2">
              {topics.strong?.map((topic, idx) => (
                <span key={idx} className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400">
                  {topic}
                </span>
              ))}
            </div>
          </div>

          <div className="border-t border-borderGray/30 pt-6">
            <h3 className="text-base font-extrabold text-white mb-4 flex items-center gap-2">
              <TrendingDown size={16} className="text-red-400" /> Focus Targets
            </h3>
            <div className="flex flex-wrap gap-2">
              {topics.weak?.map((topic, idx) => (
                <span key={idx} className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                  {topic}
                </span>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Recent Exams attempts */}
        <GlassCard hoverEffect={false} className="lg:col-span-2">
          <h3 className="text-lg font-bold text-white mb-6">Recent Exam Reports</h3>
          
          {recentExams.length === 0 ? (
            <div className="text-center py-12 text-textMuted border border-dashed border-borderGray rounded-xl text-sm">
              No recent exam grades recorded.
            </div>
          ) : (
            <div className="space-y-4">
              {recentExams.map((result) => (
                <div key={result._id} className="p-4 border border-borderGray rounded-xl flex items-center justify-between hover:bg-white/[0.01] transition-all">
                  <div>
                    <h4 className="text-sm font-bold text-white">{result.paper?.title}</h4>
                    <span className="text-xs text-textMuted block mt-1">Subject: {result.paper?.subject}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <span className="text-lg font-extrabold text-white">{result.obtainedMarks}/{result.totalMarks}</span>
                      <span className="text-xs text-textMuted block mt-0.5">{result.percentage}%</span>
                    </div>
                    <span className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm ${
                      result.grade.startsWith('A') 
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                        : result.grade.startsWith('B') || result.grade.startsWith('C') 
                          ? 'bg-accentPurple/10 text-accentPurple border border-accentPurple/20' 
                          : 'bg-accentPink/10 text-accentPink border border-accentPink/20'
                    }`}>
                      {result.grade}
                    </span>
                    <Link
                      to={`/student/results/${result._id}`}
                      className="p-2 border border-borderGray hover:border-accentPurple hover:bg-accentPurple/10 rounded-xl text-textMuted hover:text-white transition-all"
                    >
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
