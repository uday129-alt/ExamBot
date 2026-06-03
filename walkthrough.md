# Walkthrough - AI Exam Paper Generator & Evaluator

We have built a complete, production-ready MERN + RAG application named **AI Exam Paper Generator & Evaluator**. It handles uploading curriculum files, text splitting, indexing, RAG query retrieval, AI exam question generation (Groq Llama 3.3), secure test sessions with timers and autosaves, grading, and visual dashboard statistics.

---

## What was Accomplished

### 1. Backend Service Layer & Configs
- **Security & Setup**: Configured Helmet, CORS, and Rate-Limiter in [server.js](file:///c:/GEN_AI/NTA/backend/server.js). Implemented strict environment variable validation in [envValidator.js](file:///c:/GEN_AI/NTA/backend/utils/envValidator.js) to crash gracefully if critical keys are missing.
- **RAG & Vector Management**:
  - Implemented local embedding generation (384 dimensions) using `@xenova/transformers` in [embeddingService.js](file:///c:/GEN_AI/NTA/backend/services/embeddingService.js).
  - Built a recursive splitter and Pinecone client upsert mapping in [vectorStoreService.js](file:///c:/GEN_AI/NTA/backend/services/vectorStoreService.js).
  - Implemented a local MongoDB search fallback using text indexing in [SyllabusChunk.js](file:///c:/GEN_AI/NTA/backend/models/SyllabusChunk.js) to let developers test the RAG generator even without active Pinecone credentials.
- **AI LLM Chains**: Constructed ChatGroq prompts and JSON parsing in [chains.js](file:///c:/GEN_AI/NTA/backend/langchain/chains.js) to generate MCQs matching cognitive levels and return diagnostic report cards. Equipped with mock subject fallbacks if keys are placeholder values.

### 2. Mongoose Schemas & Database Collections
- [User.js](file:///c:/GEN_AI/NTA/backend/models/User.js): Credentials hashing and role scopes (`admin` vs `student`).
- [Syllabus.js](file:///c:/GEN_AI/NTA/backend/models/Syllabus.js): Curriculum documents status and namespaces.
- [Question.js](file:///c:/GEN_AI/NTA/backend/models/Question.js): Multi-key indexing for difficulty, Bloom levels, and topics.
- [Paper.js](file:///c:/GEN_AI/NTA/backend/models/Paper.js): Exam title details and lists of questions.
- [Exam.js](file:///c:/GEN_AI/NTA/backend/models/Exam.js): Student responses mapping and remaining duration tracking.
- [Result.js](file:///c:/GEN_AI/NTA/backend/models/Result.js): Obtained scores, accuracy splits, and diagnostic feedback.

### 3. API Controllers & Routes
- [authController.js](file:///c:/GEN_AI/NTA/backend/controllers/authController.js) and [authRoutes.js](file:///c:/GEN_AI/NTA/backend/routes/authRoutes.js): Auth operations.
- [syllabusController.js](file:///c:/GEN_AI/NTA/backend/controllers/syllabusController.js) and [syllabusRoutes.js](file:///c:/GEN_AI/NTA/backend/routes/syllabusRoutes.js): Syllabus uploads and deletion vector cleanups.
- [questionController.js](file:///c:/GEN_AI/NTA/backend/controllers/questionController.js) and [questionRoutes.js](file:///c:/GEN_AI/NTA/backend/routes/questionRoutes.js): Paginated search bank and RAG questions generators.
- [paperController.js](file:///c:/GEN_AI/NTA/backend/controllers/paperController.js) and [paperRoutes.js](file:///c:/GEN_AI/NTA/backend/routes/paperRoutes.js): custom papers compiler.
- [examController.js](file:///c:/GEN_AI/NTA/backend/controllers/examController.js) and [examRoutes.js](file:///c:/GEN_AI/NTA/backend/routes/examRoutes.js): active test starts, resumes, autosaves, and submission gradings.
- [analyticsController.js](file:///c:/GEN_AI/NTA/backend/controllers/analyticsController.js) and [analyticsRoutes.js](file:///c:/GEN_AI/NTA/backend/routes/analyticsRoutes.js): Recharts dashboard metric aggregations.

### 4. Frontend Application UI
- **Design & Layout**: Styled with custom glassmorphism styles and dark neon borders in [index.css](file:///c:/GEN_AI/NTA/frontend/src/index.css).
- **Client & Contexts**: Set up Axios interceptors in [api.js](file:///c:/GEN_AI/NTA/frontend/src/services/api.js) and active session timers and countdowns in [ExamContext.jsx](file:///c:/GEN_AI/NTA/frontend/src/context/ExamContext.jsx).
- **Core Pages**:
  - [LandingPage.jsx](file:///c:/GEN_AI/NTA/frontend/src/pages/LandingPage.jsx), [Login.jsx](file:///c:/GEN_AI/NTA/frontend/src/pages/Login.jsx), [Register.jsx](file:///c:/GEN_AI/NTA/frontend/src/pages/Register.jsx).
  - Admin views: [AdminDashboard.jsx](file:///c:/GEN_AI/NTA/frontend/src/pages/admin/AdminDashboard.jsx), [SyllabusUpload.jsx](file:///c:/GEN_AI/NTA/frontend/src/pages/admin/SyllabusUpload.jsx), [QuestionGenerator.jsx](file:///c:/GEN_AI/NTA/frontend/src/pages/admin/QuestionGenerator.jsx), [PaperGenerator.jsx](file:///c:/GEN_AI/NTA/frontend/src/pages/admin/PaperGenerator.jsx), [QuestionBank.jsx](file:///c:/GEN_AI/NTA/frontend/src/pages/admin/QuestionBank.jsx).
  - Student views: [StudentDashboard.jsx](file:///c:/GEN_AI/NTA/frontend/src/pages/student/StudentDashboard.jsx), [ExamList.jsx](file:///c:/GEN_AI/NTA/frontend/src/pages/student/ExamList.jsx), [ExamInterface.jsx](file:///c:/GEN_AI/NTA/frontend/src/pages/student/ExamInterface.jsx), [ResultDetail.jsx](file:///c:/GEN_AI/NTA/frontend/src/pages/student/ResultDetail.jsx), [ExamHistory.jsx](file:///c:/GEN_AI/NTA/frontend/src/pages/student/ExamHistory.jsx).
  - Shared views: [ProfileSettings.jsx](file:///c:/GEN_AI/NTA/frontend/src/pages/ProfileSettings.jsx).

---

## How to Verify Locally

1. **Verify Environment Configurations**:
   Ensure MongoDB is running locally or copy your Atlas URI to the `.env` file at root. Add valid API keys to test RAG and LLM models.
2. **Execute Services Concurrent Launcher**:
   Double-click [start.bat](file:///c:/GEN_AI/NTA/start.bat) at root. The launcher will run the Node and Vite dev commands, wait briefly, and open `http://localhost:5173`.
3. **Register and Login**:
   Create an educator account (Admin) and upload a syllabus file on the uploads dashboard.
4. **Generate & Compile Assessments**:
   Set RAG parameters on the question generation panel, then compile a paper under Paper Compiler and set it to Published.
5. **Sit for Exams**:
   Create a student account, navigate to active exams, attempt the test, watch the timer autosave your state, and submit to view your AI diagnostic report card and performance metrics.
