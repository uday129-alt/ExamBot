import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import GlassCard from '../../components/GlassCard';
import Loader from '../../components/Loader';
import { 
  Award, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  ArrowLeft, 
  Printer, 
  BookOpen, 
  ListOrdered 
} from 'lucide-react';

export default function ResultDetail() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await api.get(`/results/${id}`);
        setResult(res.data.result);
      } catch (err) {
        console.error('Failed to load result:', err);
        setError('Could not retrieve this result card.');
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="h-full flex items-center justify-center"><Loader message="Retrieving AI diagnostic reports..." /></div>;
  if (error) return <div className="h-full flex items-center justify-center text-red-400 p-6"><AlertTriangle className="mr-2" />{error}</div>;
  if (!result) return null;

  const { paper, breakdown, aiFeedback } = result;

  return (
    <div className="space-y-8 p-6">
      {/* Top action header */}
      <div className="flex items-center justify-between gap-4 no-print">
        <Link 
          to="/student/history" 
          className="flex items-center gap-2 text-xs font-semibold text-textMuted hover:text-white transition-all"
        >
          <ArrowLeft size={14} />
          Back to History
        </Link>
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-4 py-2 border border-borderGray hover:bg-white/5 rounded-xl text-xs font-bold text-white transition-all shadow-md"
        >
          <Printer size={14} />
          Download PDF Report
        </button>
      </div>

      {/* Main Print Container */}
      <div className="space-y-8 print-card">
        {/* Title Block */}
        <div className="text-center md:text-left border-b border-borderGray/30 pb-6">
          <h2 className="text-3xl font-extrabold text-white print-title">{paper?.title}</h2>
          <p className="text-textMuted text-sm mt-2">
            Assessment completed on {new Date(result.evaluatedAt).toLocaleDateString()} at {new Date(result.evaluatedAt).toLocaleTimeString()}
          </p>
        </div>

        {/* Score Overview cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <GlassCard hoverEffect={false} className="flex flex-col items-center justify-center text-center">
            <div className="text-[10px] font-bold text-textMuted uppercase tracking-wider">Score Secured</div>
            <div className="text-3xl font-extrabold text-white mt-2">
              {result.obtainedMarks} <span className="text-sm font-normal text-textMuted">/ {result.totalMarks}</span>
            </div>
          </GlassCard>

          <GlassCard hoverEffect={false} className="flex flex-col items-center justify-center text-center">
            <div className="text-[10px] font-bold text-textMuted uppercase tracking-wider">Percentage</div>
            <div className="text-3xl font-extrabold text-white mt-2">{result.percentage}%</div>
          </GlassCard>

          <GlassCard hoverEffect={false} className="flex flex-col items-center justify-center text-center">
            <div className="text-[10px] font-bold text-textMuted uppercase tracking-wider">Final Grade</div>
            <div className="text-3xl font-black text-accentPurple mt-2">{result.grade}</div>
          </GlassCard>

          <GlassCard hoverEffect={false} className="flex flex-col items-center justify-center text-center">
            <div className="text-[10px] font-bold text-textMuted uppercase tracking-wider">Correct Answers</div>
            <div className="text-3xl font-extrabold text-green-400 mt-2">
              {breakdown.correct} <span className="text-xs font-normal text-textMuted">/ {paper?.questions?.length}</span>
            </div>
          </GlassCard>
        </div>

        {/* AI FEEDBACK SUMMARY */}
        {aiFeedback && (
          <div className="grid md:grid-cols-2 gap-8 pt-4">
            {/* Strengths & Weaknesses */}
            <GlassCard hoverEffect={false} className="space-y-6">
              <div>
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider border-b border-borderGray/30 pb-2 mb-4 flex items-center gap-2 print-title">
                  <CheckCircle size={16} className="text-green-400" /> Key Strengths
                </h3>
                <ul className="space-y-2">
                  {aiFeedback.strengths?.map((str, idx) => (
                    <li key={idx} className="text-xs text-textMuted leading-relaxed flex items-start gap-2">
                      <span className="text-green-400 shrink-0">•</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider border-b border-borderGray/30 pb-2 mb-4 flex items-center gap-2 print-title">
                  <XCircle size={16} className="text-red-400" /> Focus Areas
                </h3>
                <ul className="space-y-2">
                  {aiFeedback.weakAreas?.map((wk, idx) => (
                    <li key={idx} className="text-xs text-textMuted leading-relaxed flex items-start gap-2">
                      <span className="text-red-400 shrink-0">•</span>
                      <span>{wk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </GlassCard>

            {/* Study Plan */}
            <GlassCard hoverEffect={false} className="space-y-6">
              <div>
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider border-b border-borderGray/30 pb-2 mb-4 flex items-center gap-2 print-title">
                  <ListOrdered size={16} className="text-accentPurple" /> AI Recommended Study Plan
                </h3>
                <ul className="space-y-2.5">
                  {aiFeedback.recommendedStudyPlan?.map((plan, idx) => (
                    <li key={idx} className="text-xs text-textMuted leading-relaxed flex items-start gap-2">
                      <span className="text-accentPurple font-black shrink-0">{idx + 1}.</span>
                      <span>{plan}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider border-b border-borderGray/30 pb-2 mb-4 flex items-center gap-2 print-title">
                  <BookOpen size={16} className="text-yellow-400" /> Review Topics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {aiFeedback.topicsToImprove?.map((topic, idx) => (
                    <span key={idx} className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-white/5 border border-borderGray text-textLight">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {/* DETAILED QUESTION SHEET REVIEW */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-white border-b border-borderGray/30 pb-3 print-title">
            Question Sheet Evaluation
          </h3>

          <div className="space-y-4">
            {paper?.questions?.map((q, idx) => {
              const studentAns = result.exam?.answers?.[q._id] || '';
              const isCorrect = studentAns.trim() === q.correctAnswer.trim();
              const isSkipped = studentAns.trim() === '';

              return (
                <div key={q._id} className="border border-borderGray p-5 rounded-xl space-y-4 print-card">
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-xs font-bold text-accentPurple bg-accentPurple/10 px-2 py-0.5 rounded border border-accentPurple/20 shrink-0">
                      Q{idx + 1}
                    </span>
                    <p className="text-sm font-bold text-white mr-auto print-title">{q.questionText}</p>
                    
                    {isSkipped ? (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-textMuted border border-borderGray shrink-0">
                        Skipped
                      </span>
                    ) : isCorrect ? (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 shrink-0 flex items-center gap-1">
                        <CheckCircle size={10} /> Correct
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 shrink-0 flex items-center gap-1">
                        <XCircle size={10} /> Incorrect
                      </span>
                    )}
                  </div>

                  {/* Options display with highlighting */}
                  <div className="grid md:grid-cols-2 gap-3 pl-8 text-xs text-textMuted">
                    {q.options?.map((opt, oIdx) => {
                      const isStudentSelected = studentAns === opt;
                      const isCorrectAnswer = q.correctAnswer === opt;
                      
                      let cardStyle = 'border-borderGray bg-white/[0.01]';
                      if (isCorrectAnswer) {
                        cardStyle = 'bg-green-500/10 border-green-500/30 text-green-400 font-semibold';
                      } else if (isStudentSelected && !isCorrect) {
                        cardStyle = 'bg-red-500/10 border-red-500/30 text-red-400';
                      }

                      return (
                        <div key={oIdx} className={`p-2.5 rounded-lg border ${cardStyle}`}>
                          {String.fromCharCode(65 + oIdx)}. {opt}
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="flex justify-between items-center text-[10px] text-textMuted pl-8 pt-2 border-t border-borderGray/20">
                    <span>Topic: <strong className="text-textLight">{q.topic}</strong></span>
                    <span>Bloom: <strong className="text-textLight capitalize">{q.bloomLevel}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
