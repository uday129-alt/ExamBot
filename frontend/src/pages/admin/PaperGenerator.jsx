import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import GlassCard from '../../components/GlassCard';
import Loader from '../../components/Loader';
import { 
  FileText, 
  BookOpen, 
  Clock, 
  HelpCircle, 
  Check, 
  Send, 
  AlertCircle 
} from 'lucide-react';

export default function PaperGenerator() {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [duration, setDuration] = useState(60);
  const [totalQuestions, setTotalQuestions] = useState(10);
  
  // Difficulty sliders
  const [easyPercent, setEasyPercent] = useState(30);
  const [mediumPercent, setMediumPercent] = useState(40);
  const [hardPercent, setHardPercent] = useState(30);

  const [compiling, setCompiling] = useState(false);
  const [compiledPaper, setCompiledPaper] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Auto-adjust hard percentage to ensure sum = 100%
  const handleEasyChange = (val) => {
    const easyVal = parseInt(val, 10);
    setEasyPercent(easyVal);
    const remainder = 100 - easyVal;
    // Split remainder or adjust medium/hard
    if (mediumPercent > remainder) {
      setMediumPercent(remainder);
      setHardPercent(0);
    } else {
      setHardPercent(remainder - mediumPercent);
    }
  };

  const handleMediumChange = (val) => {
    const medVal = parseInt(val, 10);
    setMediumPercent(medVal);
    const remainder = 100 - medVal;
    if (easyPercent > remainder) {
      setEasyPercent(remainder);
      setHardPercent(0);
    } else {
      setHardPercent(remainder - easyPercent);
    }
  };

  const handleCompileSubmit = async (e) => {
    e.preventDefault();
    if (!title || !subject) {
      setErrorMsg('Please specify both Title and Subject.');
      return;
    }

    const totalMix = easyPercent + mediumPercent + hardPercent;
    if (totalMix !== 100) {
      setErrorMsg(`Difficulty percentages must add up to exactly 100% (currently ${totalMix}%).`);
      return;
    }

    setCompiling(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setCompiledPaper(null);

    try {
      const res = await api.post('/papers/create', {
        title,
        subject,
        duration: parseInt(duration, 10),
        totalQuestions: parseInt(totalQuestions, 10),
        difficultyMix: {
          easy: easyPercent,
          medium: mediumPercent,
          hard: hardPercent,
        },
      });

      setCompiledPaper(res.data.paper);
      setSuccessMsg('Question paper compiled successfully in draft mode.');
    } catch (err) {
      console.error('Compilation failed:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to compile paper. Ensure questions exist in the bank.');
    } finally {
      setCompiling(false);
    }
  };

  const handlePublish = async () => {
    if (!compiledPaper) return;
    setPublishing(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await api.put(`/papers/${compiledPaper._id}/publish`);
      setCompiledPaper(res.data.paper);
      setSuccessMsg('Question paper published successfully! Students can now take this exam.');
    } catch (err) {
      console.error('Publish failed:', err);
      setErrorMsg('Failed to publish the compiled exam paper.');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-white">Paper Compiler</h2>
        <p className="text-textMuted text-sm mt-1">Select topics, adjust difficulty, and compile custom MCQ exam papers</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form controls */}
        <div className="lg:col-span-1">
          <GlassCard hoverEffect={false}>
            <h3 className="text-lg font-bold text-white mb-6">Paper Settings</h3>

            <form onSubmit={handleCompileSubmit} className="space-y-5">
              {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3.5 rounded-xl flex items-start gap-2.5 text-sm">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-textLight uppercase tracking-wider block">Exam Paper Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Database Midterm 2026"
                  className="w-full bg-white/5 border border-borderGray rounded-xl py-3 px-4 text-sm text-textLight placeholder-textMuted focus:outline-none focus:border-accentPurple transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-textLight uppercase tracking-wider block">Subject Topic Name</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Relational Databases"
                  className="w-full bg-white/5 border border-borderGray rounded-xl py-3 px-4 text-sm text-textLight placeholder-textMuted focus:outline-none focus:border-accentPurple transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-textLight uppercase tracking-wider block">Duration (Min)</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    min={5}
                    className="w-full bg-white/5 border border-borderGray rounded-xl py-3 px-4 text-sm text-textLight focus:outline-none focus:border-accentPurple transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-textLight uppercase tracking-wider block">Total Questions</label>
                  <input
                    type="number"
                    value={totalQuestions}
                    onChange={(e) => setTotalQuestions(e.target.value)}
                    min={1}
                    className="w-full bg-white/5 border border-borderGray rounded-xl py-3 px-4 text-sm text-textLight focus:outline-none focus:border-accentPurple transition-all"
                    required
                  />
                </div>
              </div>

              {/* Sliders */}
              <div className="space-y-4 pt-2 border-t border-borderGray/30">
                <div className="flex items-center justify-between text-xs font-bold text-textLight">
                  <span>DIFFICULTY DISTRIBUTION</span>
                  <span className={easyPercent + mediumPercent + hardPercent === 100 ? 'text-green-400' : 'text-red-400'}>
                    Sum: {easyPercent + mediumPercent + hardPercent}%
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-textMuted">
                    <span>Easy Questions</span>
                    <span className="text-textLight font-semibold">{easyPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={easyPercent}
                    onChange={(e) => handleEasyChange(e.target.value)}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-green-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-textMuted">
                    <span>Medium Questions</span>
                    <span className="text-textLight font-semibold">{mediumPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={mediumPercent}
                    onChange={(e) => handleMediumChange(e.target.value)}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accentPurple"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-textMuted">
                    <span>Hard Questions</span>
                    <span className="text-textLight font-semibold">{hardPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={hardPercent}
                    disabled // Automatically balanced
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-not-allowed accent-accentPink"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={compiling}
                className="w-full py-3.5 bg-gradient-to-r from-accentPurple to-accentPink hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 disabled:opacity-50 transition-all mt-6"
              >
                {compiling ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <FileText size={18} />
                    Compile Draft Paper
                  </>
                )}
              </button>
            </form>
          </GlassCard>
        </div>

        {/* Output list preview */}
        <div className="lg:col-span-2 space-y-6">
          {successMsg && (
            <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-xl flex items-start gap-2.5 text-sm">
              <Check size={18} className="shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <GlassCard hoverEffect={false} className="min-h-[450px] flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-borderGray/30 pb-4 mb-6">
                <h3 className="text-lg font-bold text-white">Paper Compilation Preview</h3>
                {compiledPaper && (
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                      compiledPaper.published 
                        ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                        : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                    }`}>
                      {compiledPaper.published ? 'Published' : 'Draft'}
                    </span>
                    {!compiledPaper.published && (
                      <button
                        onClick={handlePublish}
                        disabled={publishing}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-accentPurple hover:bg-purple-600 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
                      >
                        {publishing ? (
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <Send size={12} />
                            Publish Paper
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {compiling ? (
                <div className="py-24"><Loader message="Retrieving database question items & assembling mix..." /></div>
              ) : !compiledPaper ? (
                <div className="text-center py-20 text-textMuted border border-dashed border-borderGray rounded-xl">
                  <FileText size={40} className="mx-auto text-white/10 mb-3" />
                  <p className="text-sm font-medium">No compiled exam paper loaded.</p>
                  <p className="text-xs mt-1">Assemble specifications and compile to review questions layout.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Summary Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl border border-borderGray bg-white/[0.01]">
                    <div>
                      <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider block">Subject</span>
                      <span className="text-sm font-bold text-white block mt-0.5">{compiledPaper.subject}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider block">Total Questions</span>
                      <span className="text-sm font-bold text-white block mt-0.5">{compiledPaper.questions?.length ?? 0} Items</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider block">Max Marks</span>
                      <span className="text-sm font-bold text-white block mt-0.5">{compiledPaper.totalMarks} Marks</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider block">Duration</span>
                      <span className="text-sm font-bold text-white block mt-0.5">{compiledPaper.duration} Minutes</span>
                    </div>
                  </div>

                  {/* Question Lists */}
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {compiledPaper.questions?.map((q, idx) => (
                      <div key={q._id} className="p-4 border border-borderGray rounded-xl space-y-2.5">
                        <div className="flex items-start justify-between gap-4">
                          <span className="text-xs font-bold text-accentPurple bg-accentPurple/10 px-2 py-0.5 rounded border border-accentPurple/20 shrink-0">
                            Q{idx + 1}
                          </span>
                          <p className="text-xs font-semibold text-white mr-auto">{q.questionText}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize shrink-0 ${
                            q.difficulty === 'easy' 
                              ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                              : q.difficulty === 'medium' 
                                ? 'bg-accentPurple/10 text-accentPurple border-accentPurple/20' 
                                : 'bg-accentPink/10 text-accentPink border-accentPink/20'
                          }`}>
                            {q.difficulty}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pl-8">
                          {q.options?.map((opt, oIdx) => (
                            <div 
                              key={oIdx} 
                              className={`text-[11px] p-2 rounded-lg border ${
                                opt === q.correctAnswer 
                                  ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                                  : 'border-borderGray bg-white/[0.01] text-textMuted'
                              }`}
                            >
                              {oIdx + 1}. {opt}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {compiledPaper && !compiledPaper.published && (
              <div className="text-xs text-textMuted bg-yellow-500/5 border border-yellow-500/10 p-3 rounded-xl flex items-center gap-2 mt-6">
                <AlertCircle size={14} className="shrink-0 text-yellow-400" />
                <span>This paper is in <strong>Draft</strong> mode. Students cannot access it until you click "Publish Paper".</span>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
