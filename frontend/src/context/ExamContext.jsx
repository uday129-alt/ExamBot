import React, { createContext, useState, useEffect, useRef } from 'react';
import api from '../services/api';

export const ExamContext = createContext();

export const ExamProvider = ({ children }) => {
  const [activeExam, setActiveExam] = useState(null);
  const [activePaper, setActivePaper] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [autosaveStatus, setAutosaveStatus] = useState('saved'); // 'saved', 'saving', 'error'

  const timerRef = useRef(null);
  const stateRef = useRef({ answers, timeLeft, activeExam });

  // Sync ref to allow accessing fresh state inside timer callback
  useEffect(() => {
    stateRef.current = { answers, timeLeft, activeExam };
  }, [answers, timeLeft, activeExam]);

  // Timer countdown and periodic autosave (every 10s)
  useEffect(() => {
    if (activeExam && activeExam.status === 'started' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            // Handle automatic timeout submission
            handleAutoSubmit();
            return 0;
          }
          const nextTime = prev - 1;
          
          // Trigger autosave every 10 seconds
          if (nextTime % 10 === 0) {
            triggerAutosave(stateRef.current.answers, nextTime);
          }
          
          return nextTime;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeExam]);

  const loadExamSession = async (paperId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/exams/start', { paperId });
      const { exam, paper } = res.data;
      
      setActiveExam(exam);
      setActivePaper(paper);
      setAnswers(exam.answers || {});
      setTimeLeft(exam.remainingSeconds);
      setCurrentQuestionIndex(0);
      setFlaggedQuestions(new Set());
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to start exam session.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const setAnswerForQuestion = (questionId, optionText) => {
    setAnswers((prev) => {
      const updated = { ...prev, [questionId]: optionText };
      // Save progress immediately on answer select
      triggerAutosave(updated, stateRef.current.timeLeft);
      return updated;
    });
  };

  const toggleFlagQuestion = (questionId) => {
    setFlaggedQuestions((prev) => {
      const updated = new Set(prev);
      if (updated.has(questionId)) {
        updated.delete(questionId);
      } else {
        updated.add(questionId);
      }
      return updated;
    });
  };

  const triggerAutosave = async (currentAnswers, secondsRemaining) => {
    const exam = stateRef.current.activeExam;
    if (!exam) return;
    
    setAutosaveStatus('saving');
    try {
      await api.post('/exams/save', {
        examId: exam._id,
        answers: currentAnswers,
        remainingSeconds: secondsRemaining,
      });
      setAutosaveStatus('saved');
    } catch (err) {
      console.error('Autosave failed:', err);
      setAutosaveStatus('error');
    }
  };

  const handleAutoSubmit = async () => {
    console.warn('Time ran out! Submitting exam automatically...');
    try {
      await submitExamSession();
    } catch (err) {
      console.error('Timeout submission failed:', err);
    }
  };

  const submitExamSession = async () => {
    if (!stateRef.current.activeExam) return null;
    setLoading(true);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const res = await api.post('/exams/submit', {
        examId: stateRef.current.activeExam._id,
        answers: stateRef.current.answers,
      });
      
      setActiveExam(null);
      setActivePaper(null);
      return res.data.result;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit exam.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const cleanExamState = () => {
    setActiveExam(null);
    setActivePaper(null);
    setAnswers({});
    setTimeLeft(0);
    setCurrentQuestionIndex(0);
    setFlaggedQuestions(new Set());
  };

  return (
    <ExamContext.Provider
      value={{
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
        cleanExamState,
      }}
    >
      {children}
    </ExamContext.Provider>
  );
};
