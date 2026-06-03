import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import GlassCard from '../../components/GlassCard';
import Loader from '../../components/Loader';
import { 
  Database, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  HelpCircle,
  Award
} from 'lucide-react';

export default function QuestionBank() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [bloomLevel, setBloomLevel] = useState('');
  const [subject, setSubject] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/questions', {
        params: {
          page,
          limit: 6,
          search,
          difficulty,
          bloomLevel,
          subject,
        }
      });
      setQuestions(res.data.questions);
      setTotalPages(res.data.pages);
      setTotalItems(res.data.total);
    } catch (err) {
      console.error('Failed to load question bank:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [page, difficulty, bloomLevel, subject]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchQuestions();
  };

  const handleClearFilters = () => {
    setSearch('');
    setDifficulty('');
    setBloomLevel('');
    setSubject('');
    setPage(1);
  };

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white">Question Bank</h2>
          <p className="text-textMuted text-sm mt-1">Review, filter, and search all generated assessment questions</p>
        </div>
        <div className="text-xs font-bold text-accentPurple bg-accentPurple/10 px-3.5 py-1.5 rounded-xl border border-accentPurple/20">
          Total Items: {totalItems} Questions
        </div>
      </div>

      {/* Filter bar */}
      <GlassCard hoverEffect={false}>
        <form onSubmit={handleSearchSubmit} className="grid md:grid-cols-5 gap-4">
          <div className="relative md:col-span-2">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-textMuted">
              <Search size={16} />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions or topics..."
              className="w-full bg-white/5 border border-borderGray rounded-xl py-2.5 pl-9 pr-4 text-xs text-textLight placeholder-textMuted focus:outline-none focus:border-accentPurple transition-all"
            />
          </div>

          <div>
            <select
              value={difficulty}
              onChange={(e) => { setDifficulty(e.target.value); setPage(1); }}
              className="w-full bg-[#11131c] border border-borderGray rounded-xl py-2.5 px-4 text-xs text-textLight focus:outline-none focus:border-accentPurple transition-all"
            >
              <option value="">Any Difficulty</option>
              <option value="easy">Easy (1 Mark)</option>
              <option value="medium">Medium (2 Marks)</option>
              <option value="hard">Hard (3 Marks)</option>
            </select>
          </div>

          <div>
            <select
              value={bloomLevel}
              onChange={(e) => { setBloomLevel(e.target.value); setPage(1); }}
              className="w-full bg-[#11131c] border border-borderGray rounded-xl py-2.5 px-4 text-xs text-textLight focus:outline-none focus:border-accentPurple transition-all"
            >
              <option value="">Any Bloom Level</option>
              <option value="remember">Remember</option>
              <option value="understand">Understand</option>
              <option value="apply">Apply</option>
              <option value="analyze">Analyze</option>
              <option value="evaluate">Evaluate</option>
              <option value="create">Create</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-accentPurple hover:bg-purple-600 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md transition-all"
            >
              Search
            </button>
            <button
              type="button"
              onClick={handleClearFilters}
              className="bg-white/5 border border-borderGray hover:bg-white/10 text-textLight font-semibold text-xs py-2.5 px-3 rounded-xl transition-all"
            >
              Reset
            </button>
          </div>
        </form>
      </GlassCard>

      {/* Questions list */}
      {loading ? (
        <Loader message="Querying question bank databases..." />
      ) : questions.length === 0 ? (
        <div className="text-center py-20 text-textMuted border border-dashed border-borderGray rounded-xl">
          <Database size={40} className="mx-auto text-white/10 mb-3" />
          <p className="text-sm font-medium">No matching questions found.</p>
          <p className="text-xs mt-1">Adjust search parameters or generate new questions via RAG.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {questions.map((q) => (
              <GlassCard key={q._id} hoverEffect={true} className="flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-accentPurple/15 text-accentPurple border border-accentPurple/25">
                      {q.subject}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${
                      q.difficulty === 'easy' 
                        ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                        : q.difficulty === 'medium' 
                          ? 'bg-accentPurple/10 text-accentPurple border-accentPurple/20' 
                          : 'bg-accentPink/10 text-accentPink border-accentPink/20'
                    }`}>
                      {q.difficulty}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-white mt-4 leading-relaxed">{q.questionText}</h4>

                  <div className="grid grid-cols-2 gap-2 text-xs text-textMuted mt-4 pl-4 border-l-2 border-borderGray">
                    {q.options?.map((opt, idx) => (
                      <div 
                        key={idx} 
                        className={`p-2 rounded-lg border ${
                          opt === q.correctAnswer 
                            ? 'bg-green-500/10 border-green-500/30 text-green-400 font-semibold' 
                            : 'border-borderGray bg-white/[0.01]'
                        }`}
                      >
                        {idx + 1}. {opt}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-textMuted pt-4 border-t border-borderGray/30">
                  <span className="truncate max-w-[150px]">Topic: <strong className="text-textLight">{q.topic}</strong></span>
                  <span className="capitalize">Bloom: <strong className="text-textLight">{q.bloomLevel}</strong></span>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-borderGray">
              <span className="text-xs text-textMuted">
                Showing Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 border border-borderGray hover:bg-white/5 rounded-xl disabled:opacity-50 transition-all text-white"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 border border-borderGray hover:bg-white/5 rounded-xl disabled:opacity-50 transition-all text-white"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
