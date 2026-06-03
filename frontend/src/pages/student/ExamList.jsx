import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import GlassCard from '../../components/GlassCard';
import Loader from '../../components/Loader';
import { 
  BookOpen, 
  Clock, 
  HelpCircle, 
  Award, 
  Play, 
  AlertTriangle 
} from 'lucide-react';

export default function ExamList() {
  const navigate = useNavigate();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPublishedPapers = async () => {
      try {
        const res = await api.get('/papers');
        setPapers(res.data.papers);
      } catch (err) {
        console.error('Failed to load published papers:', err);
        setError('Failed to fetch available exams list.');
      } finally {
        setLoading(false);
      }
    };
    fetchPublishedPapers();
  }, []);

  const handleStartExam = (paperId) => {
    navigate(`/student/exam/${paperId}`);
  };

  if (loading) return <div className="h-full flex items-center justify-center"><Loader message="Retrieving active examination schedules..." /></div>;

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-white">Active Assessments</h2>
        <p className="text-textMuted text-sm mt-1">Select a published exam paper to start or resume your assessment session</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl flex items-center gap-3">
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}

      {papers.length === 0 ? (
        <div className="text-center py-20 text-textMuted border border-dashed border-borderGray rounded-xl">
          <BookOpen size={40} className="mx-auto text-white/10 mb-3" />
          <p className="text-sm font-medium">No active examinations published.</p>
          <p className="text-xs mt-1">Please ask your instructor to publish a compiled exam paper.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {papers.map((paper) => (
            <GlassCard key={paper._id} hoverEffect={true} className="flex flex-col justify-between h-64">
              <div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[10px] font-bold text-accentPurple bg-accentPurple/10 px-2.5 py-0.5 rounded-lg border border-accentPurple/20 uppercase tracking-wider">
                    {paper.subject}
                  </span>
                  <span className="text-xs text-textMuted flex items-center gap-1">
                    <Clock size={12} />
                    {paper.duration} Min
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mt-4 leading-snug">{paper.title}</h3>
                
                <div className="flex items-center gap-4 text-xs text-textMuted mt-4">
                  <span className="flex items-center gap-1">
                    <HelpCircle size={14} />
                    {paper.questions?.length ?? 0} Questions
                  </span>
                  <span className="flex items-center gap-1">
                    <Award size={14} />
                    {paper.totalMarks} Marks
                  </span>
                </div>
              </div>

              <div className="pt-6 border-t border-borderGray/30 flex items-center justify-between mt-auto">
                <span className="text-xs text-textMuted">Instructor: <strong className="text-white">{paper.createdBy?.username || 'Admin'}</strong></span>
                <button
                  onClick={() => handleStartExam(paper._id)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-accentPurple to-accentPink hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs rounded-xl shadow-md transition-all transform hover:-translate-y-0.5"
                >
                  <Play size={12} fill="white" />
                  Attempt Exam
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
