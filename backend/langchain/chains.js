import { getChatModel } from './groqService.js';
import { logger } from '../utils/logger.js';

/**
 * Clean LLM markdown response wrappers if present
 */
function parseCleanJson(text) {
  let cleanText = text.trim();
  if (cleanText.startsWith('```json')) {
    cleanText = cleanText.substring(7);
  } else if (cleanText.startsWith('```')) {
    cleanText = cleanText.substring(3);
  }
  if (cleanText.endsWith('```')) {
    cleanText = cleanText.substring(0, cleanText.length - 3);
  }
  return JSON.parse(cleanText.trim());
}

/**
 * Generates MCQs from syllabus context using Groq LLM.
 */
export async function generateQuestions(contextText, subject, numQuestions, difficulty, bloomLevel) {
  const model = getChatModel();
  
  if (!model) {
    logger.warn('Groq LLM is in mock mode. Generating mock questions.');
    return generateMockQuestions(subject, numQuestions, difficulty, bloomLevel);
  }

  const prompt = `You are an expert academic professor. Generate exactly ${numQuestions} Multiple Choice Questions (MCQs) for the subject "${subject}" based ONLY on the following syllabus context:

---
${contextText}
---

Requirements:
1. Every question must be directly related to the provided syllabus context.
2. Match the requested Difficulty: "${difficulty}" and Bloom's Taxonomy Level: "${bloomLevel}".
3. Set the marks parameter: Easy = 1 mark, Medium = 2 marks, Hard = 3 marks.
4. Each question must have exactly 4 distinct options.
5. Topic parameter should specify the specific topic/section from the syllabus that covers the question.
6. The output MUST be a valid JSON array of question objects. Do not include any other explanations, markdown wrappers, or preambles.

JSON Schema:
[
  {
    "question": "Clear and concise question text",
    "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
    "correctAnswer": "The exact string corresponding to the correct option",
    "difficulty": "${difficulty}",
    "bloomLevel": "${bloomLevel}",
    "marks": ${difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3},
    "topic": "Topic Name"
  }
]`;

  try {
    const response = await model.invoke(prompt);
    const result = parseCleanJson(response.content);
    
    if (Array.isArray(result)) {
      logger.success(`Successfully generated ${result.length} questions using Groq.`);
      return result;
    }
    throw new Error('LLM did not return an array');
  } catch (error) {
    logger.error('Failed to generate questions via Groq, falling back to simulated generation', error);
    return generateMockQuestions(subject, numQuestions, difficulty, bloomLevel);
  }
}

/**
 * Generates AI feedback and evaluation report cards.
 */
export async function generateFeedback(studentResponses, paperQuestions, breakdown, totalMarks, obtainedMarks, percentage, grade) {
  const model = getChatModel();

  if (!model) {
    logger.warn('Groq LLM is in mock mode. Generating mock feedback.');
    return generateMockFeedback(breakdown, percentage, grade);
  }

  const responseSummary = studentResponses.map((res, i) => {
    const q = paperQuestions.find(pq => pq._id.toString() === res.questionId);
    if (!q) return null;
    return {
      question: q.questionText,
      topic: q.topic,
      bloomLevel: q.bloomLevel,
      difficulty: q.difficulty,
      correctAnswer: q.correctAnswer,
      studentAnswer: res.selectedAnswer,
      isCorrect: res.isCorrect
    };
  }).filter(Boolean);

  const prompt = `You are an AI Academic Advisor. Evaluate this student's exam performance and generate a detailed diagnostic feedback report.

Student Exam Summary:
- Marks obtained: ${obtainedMarks} / ${totalMarks} (${percentage}%)
- Grade: ${grade}
- Questions Correct: ${breakdown.correct}, Wrong: ${breakdown.wrong}, Skipped: ${breakdown.skipped}

Detailed Questions & Student Answers:
${JSON.stringify(responseSummary, null, 2)}

Provide feedback as a JSON object matching this schema:
{
  "strengths": ["at least 2 strengths the student demonstrated, referencing concepts or cognitive levels"],
  "weakAreas": ["at least 2 topics or cognitive levels where the student struggled"],
  "topicsToImprove": ["specific topic names from the exam the student should restudy"],
  "recommendedStudyPlan": ["step-by-step action plan to improve marks (at least 3 items)"],
  "bloomAnalysis": {
    "remember": "brief performance review for recall questions",
    "understand": "brief performance review for understanding questions",
    "apply": "brief performance review for application questions",
    "analyze": "brief performance review for analytical questions",
    "evaluate": "brief performance review for evaluation questions",
    "create": "brief performance review for synthesis/creative questions"
  }
}

Output ONLY the JSON object. Do not include any other explanations, formatting, or conversational text.`;

  try {
    const response = await model.invoke(prompt);
    return parseCleanJson(response.content);
  } catch (error) {
    logger.error('Failed to generate AI feedback via Groq, returning fallback feedback.', error);
    return generateMockFeedback(breakdown, percentage, grade);
  }
}

/**
 * Generate simulated questions based on subject when Groq is not configured/active.
 */
function generateMockQuestions(subject, count, difficulty, bloomLevel) {
  const mockBank = {
    programming: [
      { q: "What is the primary function of a compiler?", o: ["To execute code directly", "To translate source code to machine code", "To debug memory leaks", "To optimize database queries"], c: "To translate source code to machine code", t: "Syntax and Translation" },
      { q: "Which data structure operates on a Last-In, First-Out (LIFO) basis?", o: ["Queue", "Stack", "Linked List", "Binary Tree"], c: "Stack", t: "Linear Data Structures" },
      { q: "What is the time complexity of searching a sorted array using binary search?", o: ["O(n)", "O(1)", "O(log n)", "O(n^2)"], c: "O(log n)", t: "Search Algorithms" },
      { q: "Which of the following is NOT an OOP pillar?", o: ["Encapsulation", "Polymorphism", "Compilation", "Inheritance"], c: "Compilation", t: "Object Oriented Principles" },
      { q: "What does the 'A' in ACID database transactions stand for?", o: ["Atomicity", "Association", "Availability", "Allocation"], c: "Atomicity", t: "Database Transactions" }
    ],
    general: [
      { q: "Which component is known as the brain of the computer?", o: ["Random Access Memory", "Central Processing Unit", "Hard Disk Drive", "Network Interface Card"], c: "Central Processing Unit", t: "Computer Architecture" },
      { q: "What is the purpose of an IP address?", o: ["To uniquely identify a device on a network", "To store locally cached files", "To speed up graphic rendering", "To encrypt password storage"], c: "To uniquely identify a device on a network", t: "Networking Basics" },
      { q: "Which protocol is used to securely browse websites?", o: ["HTTP", "FTP", "HTTPS", "SMTP"], c: "HTTPS", t: "Web Protocols" },
      { q: "What type of storage is volatile and cleared on reboot?", o: ["SSD", "RAM", "HDD", "EEPROM"], c: "RAM", t: "Memory Systems" },
      { q: "What is the primary role of an Operating System?", o: ["To compile programs", "To manage system resources and hardware", "To generate web pages", "To run virus checks"], c: "To manage system resources and hardware", t: "OS Concepts" }
    ]
  };

  const pool = subject.toLowerCase().includes('db') || subject.toLowerCase().includes('code') || subject.toLowerCase().includes('program') || subject.toLowerCase().includes('comput')
    ? mockBank.programming 
    : mockBank.general;

  const questions = [];
  const marksVal = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3;

  for (let i = 0; i < count; i++) {
    const template = pool[i % pool.length];
    questions.push({
      question: `[Simulated] ${template.q} (Ref: ${subject} - ${i+1})`,
      options: template.o,
      correctAnswer: template.c,
      difficulty,
      bloomLevel,
      marks: marksVal,
      topic: template.t
    });
  }

  return questions;
}

/**
 * Generate simulated feedback when Groq is not active.
 */
function generateMockFeedback(breakdown, percentage, grade) {
  const strengths = [];
  const weakAreas = [];
  const topicsToImprove = [];
  const recommendedStudyPlan = [];
  const bloomAnalysis = {
    remember: "Demonstrated solid recall of core definitions.",
    understand: "Understands fundamental concepts well.",
    apply: "Good performance in solving standard practice problems.",
    analyze: "Could focus more on breaking down complex scenarios.",
    evaluate: "Requires practice in comparing design alternatives.",
    create: "Requires improvement in constructing novel solutions."
  };

  if (percentage >= 80) {
    strengths.push("Excellent retention of syllabus concepts.", "Strong application of logical theories under pressure.");
    weakAreas.push("Subtle edge cases in advanced modules.", "Self-checking answers to avoid minor calculation errors.");
    topicsToImprove.push("Edge-case exception handling", "System scaling architectures");
    recommendedStudyPlan.push("Review high-performance optimization techniques.", "Solve advanced-level simulation question sheets.", "Participate in peer teaching sessions.");
  } else if (percentage >= 50) {
    strengths.push("Good foundation in core factual questions.", "Capable of applying concepts in basic exercises.");
    weakAreas.push("Advanced analytical and system design questions.", "Time management during tricky questions.");
    topicsToImprove.push("Multi-step analytical methods", "Relational database normalizations");
    recommendedStudyPlan.push("Dedicate 2 hours to mapping system diagrams.", "Re-read units related to analytics and evaluation.", "Take timed quizzes targeting Medium & Hard questions.");
  } else {
    strengths.push("Reasonable performance in basic recollection (Remember level).", "Attempted most questions.");
    weakAreas.push("Understanding relational mappings.", "Critical analytical reasoning.");
    topicsToImprove.push("Fundamental architectural definitions", "Core algorithms and runtime analysis");
    recommendedStudyPlan.push("Re-read the complete syllabus textbook chapters.", "Work through introductory tutorial videos on weak topics.", "Attempt Easy-level quizzes exclusively to boost confidence.");
  }

  return {
    strengths,
    weakAreas,
    topicsToImprove,
    recommendedStudyPlan,
    bloomAnalysis
  };
}
