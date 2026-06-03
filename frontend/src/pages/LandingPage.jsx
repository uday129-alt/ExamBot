import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, GraduationCap, CheckCircle, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';
import GlassCard from '../components/GlassCard';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-darkBg overflow-hidden flex flex-col justify-between py-12 px-6 relative">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accentPurple/25 rounded-full blur-3xl -z-10 animate-pulse-subtle"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-accentPink/15 rounded-full blur-3xl -z-10 animate-pulse-subtle" style={{ animationDelay: '1.5s' }}></div>

      <div className="max-w-6xl mx-auto w-full space-y-16 my-auto">
        {/* Header Hero */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accentPurple/10 border border-accentPurple/30 text-accentPurple text-xs font-semibold uppercase tracking-wider animate-bounce">
            <Sparkles size={14} />
            AI-Powered Examination Suite
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            AI Exam Paper{' '}
            <span className="bg-gradient-to-r from-accentPurple via-purple-400 to-accentPink bg-clip-text text-transparent">
              Generator & Evaluator
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-textMuted text-base md:text-lg">
            Create academic question papers directly from syllabus uploads using RAG, let students take exams with autosaving timers, and deliver instant, AI-graded diagnostics.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => navigate('/register')}
              className="flex items-center gap-2 bg-gradient-to-r from-accentPurple to-accentPink hover:from-purple-500 hover:to-pink-500 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-purple-500/20 transform hover:-translate-y-0.5 transition-all"
            >
              Get Started Free
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="bg-white/5 border border-borderGray hover:bg-white/10 text-white font-semibold px-8 py-3.5 rounded-xl transition-all"
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          <GlassCard>
            <div className="w-12 h-12 rounded-xl bg-accentPurple/20 flex items-center justify-center text-accentPurple border border-accentPurple/30 mb-6">
              <Cpu size={24} />
            </div>
            <h3 className="text-xl font-bold text-textLight mb-2">RAG Syllabus Indexing</h3>
            <p className="text-textMuted text-sm leading-relaxed">
              Upload PDF, DOCX, or TXT curriculum files. Our engine chunks and indexes them into Pinecone vectors, ready for precise topical question compilation.
            </p>
          </GlassCard>

          <GlassCard>
            <div className="w-12 h-12 rounded-xl bg-accentPink/20 flex items-center justify-center text-accentPink border border-accentPink/30 mb-6">
              <GraduationCap size={24} />
            </div>
            <h3 className="text-xl font-bold text-textLight mb-2">Bloom's Taxonomy mapping</h3>
            <p className="text-textMuted text-sm leading-relaxed">
              Define target cognitive distributions: Remember, Understand, Apply, Analyze, Evaluate, Create. Support custom difficulty mixes (Easy, Medium, Hard).
            </p>
          </GlassCard>

          <GlassCard>
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400 border border-green-500/30 mb-6">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-xl font-bold text-textLight mb-2">AI Grading & Feedback</h3>
            <p className="text-textMuted text-sm leading-relaxed">
              Compare answers instantly. Deliver immediate letter grades alongside comprehensive diagnostic feedback covering strengths, weak topics, and personalized study guides.
            </p>
          </GlassCard>
        </div>

        {/* Role Comparison details */}
        <div className="grid md:grid-cols-2 gap-8 border-t border-borderGray pt-12">
          <div>
            <h4 className="text-lg font-bold text-accentPurple mb-4 flex items-center gap-2">
              <CheckCircle size={18} /> For Educators (Admins)
            </h4>
            <ul className="space-y-3 text-sm text-textMuted">
              <li>• Upload course syllabus documents and manage RAG context</li>
              <li>• Auto-generate multiple-choice questions matching lesson goals</li>
              <li>• Compile and publish papers with customizable difficulty matrices</li>
              <li>• Analyze overall cohort performance via the administrator dashboard</li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold text-accentPink mb-4 flex items-center gap-2">
              <CheckCircle size={18} /> For Students
            </h4>
            <ul className="space-y-3 text-sm text-textMuted">
              <li>• Sit for published tests with active countdowns and secure lock interfaces</li>
              <li>• Save test answers incrementally via automatic background synchronization</li>
              <li>• Receive instant feedback detailing cognitive strengths and study planners</li>
              <li>• Track individual grade improvements over time on Recharts lines</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-textMuted mt-12">
        © 2026 AI Exam Paper Generator & Evaluator. Engineered for Advanced Assessment.
      </footer>
    </div>
  );
}
