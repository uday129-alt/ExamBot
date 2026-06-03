import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import GlassCard from '../../components/GlassCard';
import Loader from '../../components/Loader';
import { History, Clock, FileText, ArrowRight, AlertTriangle } from 'lucide-react';

export default function ExamHistory() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/exams/history');
        setResults(res.data.results);
      } catch (err) {
        console.error('Failed to load history:', err);
        setError('Failed to fetch exam history logs.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return <div className="h-full flex items-center justify-center"><Loader message="Loading gradebook entries..." /></div>;

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-white">Assessment Logs</h2>
        <p className="text-textMuted text-sm mt-1">Browse past attempts, scores, and review detailed AI diagnostics reports</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl flex items-center gap-3">
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}

      {results.length === 0 ? (
        <div className="text-center py-20 text-textMuted border border-dashed border-borderGray rounded-xl">
          <History size={40} className="mx-auto text-white/10 mb-3" />
          <p className="text-sm font-medium">No assessment history on record.</p>
          <p className="text-xs mt-1">Your graded results will populate here once you submit an exam.</p>
        </div>
      ) : (
        <GlassCard hoverEffect={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-borderGray text-xs font-bold text-textMuted uppercase tracking-wider">
                  <th className="py-3 px-4">Exam Paper</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Date Completed</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Grade</th>
                  <th className="py-3 px-4 text-right">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderGray text-sm">
                {results.map((res) => (
                  <tr key={res._id} className="hover:bg-white/[0.01] transition-all">
                    <td className="py-4 px-4 font-bold text-white">
                      {res.paper?.title || 'Unknown Exam'}
                    </td>
                    <td className="py-4 px-4 text-textMuted">{res.paper?.subject || 'N/A'}</td>
                    <td className="py-4 px-4 text-textMuted">
                      {new Date(res.evaluatedAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-extrabold text-white">{res.obtainedMarks} / {res.totalMarks}</span>
                      <span className="text-xs text-textMuted block mt-0.5">{res.percentage}%</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-extrabold text-xs ${
                        res.grade.startsWith('A') 
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                          : res.grade.startsWith('B') || res.grade.startsWith('C') 
                            ? 'bg-accentPurple/10 text-accentPurple border border-accentPurple/20' 
                            : 'bg-accentPink/10 text-accentPink border border-accentPink/20'
                      }`}>
                        {res.grade}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        to={`/student/results/${res._id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 border border-borderGray hover:border-accentPurple hover:bg-accentPurple/10 rounded-lg text-xs font-semibold text-textMuted hover:text-white transition-all"
                      >
                        Details
                        <ArrowRight size={12} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
