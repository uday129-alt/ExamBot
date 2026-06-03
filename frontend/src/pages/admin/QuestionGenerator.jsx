import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import GlassCard from '../../components/GlassCard';
import Loader from '../../components/Loader';
import { 
  Sparkles, 
  HelpCircle, 
  Check, 
  AlertCircle, 
  FileQuestion,
  ChevronDown
} from 'lucide-react';

export default function QuestionGenerator() {
  const [syllabi, setSyllabi] = useState([]);
  const [loadingSyllabi, setLoadingSyllabi] = useState(true);
  
  const [selectedSyllabus, setSelectedSyllabus] = useState('');
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');
  const [bloomLevel, setBloomLevel] = useState('understand');
  
  const [generating, setGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    const fetchSyllabi = async () => {
      try {
        const res = await api.get('/syllabus');
        // Only load processed syllabi
        const processed = res.data.syllabi.filter(s => s.status === 'processed');
        setSyllabi(processed);
        if (processed.length > 0) {
          setSelectedSyllabus(processed[0]._id);
        }
      } catch (err) {
        console.error('Failed to load syllabi:', err);
      } finally {
        setLoadingSyllabi(false);
      }
    };
    fetchSyllabi();
  }, []);

  const handleGenerateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSyllabus) {
      setErrorMsg('Please select a course syllabus to serve as context.');
      return;
    }

    setGenerating(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setGeneratedQuestions([]);

    try {
      const res = await api.post('/questions/generate', {
        syllabusId: selectedSyllabus,
        numQuestions: parseInt(numQuestions, 10),
        difficulty,
        bloomLevel,
        topic,
      });

      setGeneratedQuestions(res.data.questions);
      setSuccessMsg(`Successfully generated ${res.data.count} MCQs using RAG! Saved to question bank.`);
    } catch (err) {
      console.error('Question generation failed:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to generate questions. Check Groq API configuration.');
    } finally {
      setGenerating(false);
    }
  };

  const bloomLabels = {
    remember: 'Remember (Recall details)',
    understand: 'Understand (Explain concepts)',
    apply: 'Apply (Use info in new situations)',
    analyze: 'Analyze (Draw connections)',
    evaluate: 'Evaluate (Justify stands/decisions)',
    create: 'Create (Produce original work)',
  };

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-white">AI Question Generator</h2>
        <p className="text-textMuted text-sm mt-1">Generate multi-choice assessment items using RAG context and Groq LLM</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form controls */}
        <div className="lg:col-span-1">
          <GlassCard hoverEffect={false}>
            <h3 className="text-lg font-bold text-white mb-6">Generation Parameters</h3>

            {loadingSyllabi ? (
              <Loader message="Loading curriculum lists..." />
            ) : syllabi.length === 0 ? (
              <div className="text-center py-6 text-textMuted border border-dashed border-borderGray rounded-xl text-sm">
                <AlertCircle size={24} className="mx-auto text-yellow-400 mb-2" />
                <p>No processed syllabus found.</p>
                <p className="text-xs mt-1">Please index a syllabus file first.</p>
              </div>
            ) : (
              <form onSubmit={handleGenerateSubmit} className="space-y-5">
                {errorMsg && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3.5 rounded-xl flex items-start gap-2 text-sm">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold text-textLight uppercase tracking-wider block">Course Context</label>
                  <select
                    value={selectedSyllabus}
                    onChange={(e) => setSelectedSyllabus(e.target.value)}
                    className="w-full bg-[#11131c] border border-borderGray rounded-xl py-3 px-4 text-sm text-textLight focus:outline-none focus:border-accentPurple transition-all"
                  >
                    {syllabi.map((s) => (
                      <option key={s._id} value={s._id}>{s.subject}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-textLight uppercase tracking-wider block">Topical Search Query (Optional)</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., normal forms, indexing"
                    className="w-full bg-white/5 border border-borderGray rounded-xl py-3 px-4 text-sm text-textLight placeholder-textMuted focus:outline-none focus:border-accentPurple transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-textLight uppercase tracking-wider block">Questions Count</label>
                  <select
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(e.target.value)}
                    className="w-full bg-[#11131c] border border-borderGray rounded-xl py-3 px-4 text-sm text-textLight focus:outline-none focus:border-accentPurple transition-all"
                  >
                    <option value={3}>3 Questions</option>
                    <option value={5}>5 Questions</option>
                    <option value={10}>10 Questions</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-textLight uppercase tracking-wider block">Target Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full bg-[#11131c] border border-borderGray rounded-xl py-3 px-4 text-sm text-textLight focus:outline-none focus:border-accentPurple transition-all"
                  >
                    <option value="easy">Easy (1 Mark)</option>
                    <option value="medium">Medium (2 Marks)</option>
                    <option value="hard">Hard (3 Marks)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-textLight uppercase tracking-wider block">Bloom's Taxonomy Goal</label>
                  <select
                    value={bloomLevel}
                    onChange={(e) => setBloomLevel(e.target.value)}
                    className="w-full bg-[#11131c] border border-borderGray rounded-xl py-3 px-4 text-sm text-textLight focus:outline-none focus:border-accentPurple transition-all"
                  >
                    {Object.keys(bloomLabels).map((lvl) => (
                      <option key={lvl} value={lvl}>{bloomLabels[lvl]}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={generating}
                  className="w-full py-3.5 bg-gradient-to-r from-accentPurple to-accentPink hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 disabled:opacity-50 transition-all mt-6"
                >
                  {generating ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Generate Questions
                    </>
                  )}
                </button>
              </form>
            )}
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

          <GlassCard hoverEffect={false} className="min-h-[400px] flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-white mb-6">Generated Questions Preview</h3>
              
              {generating ? (
                <div className="py-24"><Loader message="Retrieving RAG vectors and compiling items via Llama 3..." /></div>
              ) : generatedQuestions.length === 0 ? (
                <div className="text-center py-20 text-textMuted border border-dashed border-borderGray rounded-xl">
                  <FileQuestion size={40} className="mx-auto text-white/10 mb-3" />
                  <p className="text-sm font-medium">No questions generated yet in this session.</p>
                  <p className="text-xs mt-1">Configure criteria and click generate to invoke RAG.</p>
                </div>
              ) : (
                <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
                  {generatedQuestions.map((q, idx) => (
                    <div key={idx} className="border border-borderGray p-4 rounded-xl space-y-3 bg-white/[0.01]">
                      <div className="flex items-start justify-between gap-4">
                        <span className="text-sm font-bold text-accentPurple bg-accentPurple/10 px-2 py-0.5 rounded-lg border border-accentPurple/20 shrink-0">
                          Q{idx + 1}
                        </span>
                        <p className="text-sm font-semibold text-white mr-auto">{q.questionText || q.question}</p>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-accentPink/15 text-accentPink border border-accentPink/20 capitalize shrink-0">
                          {q.bloomLevel || bloomLevel}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-textMuted pl-9">
                        {(q.options || []).map((opt, oIdx) => (
                          <div 
                            key={oIdx} 
                            className={`p-2 rounded-lg border ${
                              opt === q.correctAnswer 
                                ? 'bg-green-500/10 border-green-500/30 text-green-400 font-semibold' 
                                : 'border-borderGray bg-white/[0.01]'
                            }`}
                          >
                            {oIdx + 1}. {opt}
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-xs text-textMuted pt-2 border-t border-borderGray/30 pl-9">
                        <span>Topic: <strong className="text-textLight">{q.topic}</strong></span>
                        <span>Marks: <strong className="text-textLight">{q.marks}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {generatedQuestions.length > 0 && (
              <div className="text-xs text-textMuted text-right pt-6 border-t border-borderGray mt-6">
                💡 Questions have been automatically committed to the Mongo database question bank.
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
