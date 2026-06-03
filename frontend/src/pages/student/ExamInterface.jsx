import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ExamContext } from '../../context/ExamContext';
import Loader from '../../components/Loader';
import GlassCard from '../../components/GlassCard';
import { 
  Clock, 
  Flag, 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  CheckCircle,
  AlertTriangle,
  Send
} from 'lucide-react';

export default function ExamInterface() {
  const { paperId } = useParams();
  const navigate = useNavigate();
  const {
    activeExam,
    activePaper,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    answers,
    flaggedQuestions,
    timeLeft,
    loading,
    error,
    autosaveStatus,
    loadExamSession,
    setAnswerForQuestion,
    toggleFlagQuestion,
    submitExamSession,
    cleanExamState
  } = useContext(ExamContext);

  const [submitting, setSubmitting] = useState(false);
  const [fullscreenWarning, setFullscreenWarning] = useState(false);

  // Load exam session on mount
  useEffect(() => {
    loadExamSession(paperId);
    
    // Tab visibility change detection for integrity checks
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setFullscreenWarning(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // Clean state on exit
      cleanExamState();
    };
  }, [paperId]);

  // Format remaining seconds into HH:MM:SS
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (opt) => {
    const q = activePaper.questions[currentQuestionIndex];
    setAnswerForQuestion(q._id, opt);
  };

  const handleSubmit = async () => {
    const totalQCount = activePaper?.questions?.length ?? 0;
    const answeredCount = Object.keys(answers).filter(k => answers[k] !== '').length;
    
    if (answeredCount < totalQCount) {
      if (!window.confirm(`You have answered ${answeredCount} out of ${totalQCount} questions. Are you sure you want to submit?`)) {
        return;
      }
    } else {
      if (!window.confirm('Are you sure you want to submit your exam?')) {
        return;
      }
    }

    setSubmitting(true);
    try {
      const resultObj = await submitExamSession();
      if (resultObj) {
        navigate(`/student/results/${resultObj._id}`);
      }
    } catch (err) {
      console.error('Submission failed:', err);
      alert('Failed to submit exam: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !activePaper) return <div className="h-screen flex items-center justify-center bg-darkBg"><Loader message="Initializing secure test environment..." /></div>;
  if (error) return <div className="h-screen flex items-center justify-center bg-darkBg text-red-400 p-6"><AlertTriangle className="mr-2" />{error}</div>;
  if (!activePaper || !activeExam) return null;

  const currentQuestion = activePaper.questions[currentQuestionIndex];
  const selectedAnswer = answers[currentQuestion._id] || '';
  const isFlagged = flaggedQuestions.has(currentQuestion._id);

  return (
    <div className="min-h-screen bg-darkBg text-textLight flex flex-col justify-between relative select-none">
      
      {/* Top Header details */}
      <header className="glass-panel border-b border-borderGray px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div>
          <h3 className="font-extrabold text-white text-base md:text-lg">{activePaper.title}</h3>
          <div className="flex items-center gap-4 text-xs text-textMuted mt-1">
            <span>Subject: {activePaper.subject}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              {autosaveStatus === 'saving' && <span className="text-yellow-400 animate-pulse">Autosaving...</span>}
              {autosaveStatus === 'saved' && <span className="text-green-400 flex items-center gap-1"><Save size={12} /> Saved</span>}
              {autosaveStatus === 'error' && <span className="text-red-400">Save Error</span>}
            </span>
          </div>
        </div>

        {/* Timer countdown */}
        <div className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border font-mono font-bold text-sm md:text-base ${
          timeLeft < 300 
            ? 'bg-red-500/10 border-red-500/30 text-red-400 animate-pulse' 
            : 'bg-white/5 border-borderGray text-white'
        }`}>
          <Clock size={18} />
          <span>{formatTime(timeLeft)}</span>
        </div>
      </header>

      {/* Main content grid */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-6 grid md:grid-cols-4 gap-8">
        
        {/* Exam Navigation Sidebar */}
        <div className="md:col-span-1 space-y-6">
          <GlassCard hoverEffect={false} className="h-full flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-textLight uppercase tracking-wider mb-4 border-b border-borderGray/30 pb-2">
                Questions Index
              </h4>
              <div className="grid grid-cols-5 gap-2 max-h-[300px] overflow-y-auto pr-1">
                {activePaper.questions.map((q, idx) => {
                  const hasAnswer = !!answers[q._id];
                  const flagged = flaggedQuestions.has(q._id);
                  const active = idx === currentQuestionIndex;
                  
                  return (
                    <button
                      key={q._id}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`h-9 w-9 rounded-lg border text-xs font-bold transition-all flex items-center justify-center ${
                        active
                          ? 'border-accentPurple bg-accentPurple text-white shadow-md shadow-purple-500/20'
                          : flagged
                            ? 'border-purple-400 bg-purple-400/20 text-purple-300'
                            : hasAnswer
                              ? 'border-green-500 bg-green-500/10 text-green-400'
                              : 'border-borderGray bg-white/5 hover:bg-white/10 text-textMuted'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Index legend */}
            <div className="border-t border-borderGray/30 pt-4 mt-6 text-[10px] text-textMuted space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-accentPurple"></span>
                <span>Active Question</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-green-500/20 border border-green-500"></span>
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-purple-400/20 border border-purple-400"></span>
                <span>Flagged for Review</span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Question Panel */}
        <div className="md:col-span-3 space-y-6">
          {fullscreenWarning && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 p-4 rounded-xl flex items-center justify-between text-xs gap-3">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} />
                <span><strong>Attention:</strong> Navigating away from this tab has been logged. Please focus on the exam window.</span>
              </div>
              <button 
                onClick={() => setFullscreenWarning(false)}
                className="px-2.5 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 rounded font-bold"
              >
                Dismiss
              </button>
            </div>
          )}

          <GlassCard hoverEffect={false} className="min-h-[350px] flex flex-col justify-between relative">
            <div>
              {/* Question header */}
              <div className="flex items-center justify-between gap-4 border-b border-borderGray/30 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-accentPurple bg-accentPurple/10 border border-accentPurple/20 px-3 py-1 rounded-xl">
                    Question {currentQuestionIndex + 1} of {activePaper.questions.length}
                  </span>
                  <span className="text-xs text-textMuted font-medium">({currentQuestion.marks} Marks)</span>
                </div>
                <button
                  onClick={() => toggleFlagQuestion(currentQuestion._id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                    isFlagged
                      ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                      : 'border-borderGray hover:border-textMuted text-textMuted'
                  }`}
                >
                  <Flag size={12} fill={isFlagged ? '#c084fc' : 'none'} />
                  Review Later
                </button>
              </div>

              {/* Question Text */}
              <p className="text-base md:text-lg font-bold text-white mb-8 select-text leading-relaxed">
                {currentQuestion.questionText}
              </p>

              {/* Options */}
              <div className="grid md:grid-cols-2 gap-4">
                {currentQuestion.options.map((opt, oIdx) => {
                  const isSelected = selectedAnswer === opt;
                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleOptionSelect(opt)}
                      className={`w-full text-left p-4 rounded-xl border text-sm transition-all flex items-center gap-4 ${
                        isSelected
                          ? 'border-accentPurple bg-accentPurple/10 text-white font-bold ring-1 ring-accentPurple/30'
                          : 'border-borderGray hover:border-textMuted hover:bg-white/[0.01] text-textMuted'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center border text-xs font-black shrink-0 ${
                        isSelected 
                          ? 'bg-accentPurple border-accentPurple text-white' 
                          : 'border-borderGray text-textMuted'
                      }`}>
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Navigation controls */}
            <div className="flex items-center justify-between pt-6 border-t border-borderGray/30 mt-8">
              <button
                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                className="flex items-center gap-1.5 px-4 py-2 border border-borderGray hover:bg-white/5 rounded-xl disabled:opacity-50 text-xs font-semibold text-white transition-all"
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              {currentQuestionIndex === activePaper.questions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-6 py-2.5 bg-gradient-to-r from-accentPurple to-accentPink hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-500/20 disabled:opacity-50 transition-all"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Send size={12} />
                      Submit Assessment
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => setCurrentQuestionIndex(prev => Math.min(activePaper.questions.length - 1, prev + 1))}
                  className="flex items-center gap-1.5 px-4 py-2 border border-borderGray hover:bg-white/5 rounded-xl text-xs font-semibold text-white transition-all"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          </GlassCard>
        </div>

      </div>

      <footer className="text-center text-xs text-textMuted p-6 border-t border-borderGray/10">
        🔒 Active Secure Browser Session ID: {activeExam._id} • Answers are automatically synchronized.
      </footer>
    </div>
  );
}
