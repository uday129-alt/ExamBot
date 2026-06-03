# Implementation Plan - AI Exam Paper Generator & Evaluator

Create a complete, production-ready MERN + RAG application named **AI Exam Paper Generator & Evaluator** to upload syllabus documents, chunk and index them into Pinecone, generate customized MCQ papers using LangChain and Groq LLM (llama-3.3-70b-versatile), provide a student testing interface, auto-evaluate answers, generate feedback, and display comprehensive analytics.

---

## Proposed Tech Stack & Key Libraries

### Frontend
- **Framework**: React.js with Vite
- **Styling**: Tailwind CSS for UI components, offering a sleek, premium dark-themed SaaS interface. We will build custom premium glassmorphic cards and dashboards without relying on external UI libraries like ShadCN UI that require CLI setup.
- **Routing**: `react-router-dom`
- **Forms**: `react-hook-form`
- **Charts**: `recharts` for rich, interactive, premium dashboards.
- **HTTP Client**: `axios`

### Backend
- **Framework**: Node.js & Express.js
- **Database**: MongoDB (via `mongoose`)
- **Vector Search**: Pinecone (via `@pinecone-database/pinecone`)
- **AI/LLM Engine**: LangChain & Groq (via `@langchain/groq`, `@langchain/core`, `groq-sdk`)
- **Embeddings**: Local embedding generation using `@xenova/transformers` (pipeline `'feature-extraction'`, model `'Xenova/all-MiniLM-L6-v2'`) to ensure no extra paid APIs are required for embedding.
- **Document Parsing**: `pdf-parse`, `mammoth` (for DOCX), and standard text reading.
- **Authentication**: JWT (`jsonwebtoken`) and hashing (`bcryptjs`).
- **File Uploads**: `multer` for handling syllabus documents securely.
- **Security & Utilities**: `cors`, `helmet`, `express-rate-limit`, `dotenv`.

---

## User Review Required

> [!IMPORTANT]
> **Embedding Generation Strategy**
> We are using `@xenova/transformers` locally in the Node.js backend to generate embeddings with `Xenova/all-MiniLM-L6-v2` (equivalent to `sentence-transformers/all-MiniLM-L6-v2`). This avoids external API call charges and allows running the embedding model directly in memory.
>
> **LangSmith Tracing**
> We will configure LangSmith tracing as requested using environmental variables. Please ensure you have a valid `LANGCHAIN_API_KEY` to verify tracing in production.

---

## Open Questions

> [!NOTE]
> None at the moment. If any issues arise with Pinecone index dimensions or Groq rate limits, we will handle them with fallback mock mechanisms or detailed logging. We assume the Pinecone Index is configured for **384 dimensions** (matching `all-MiniLM-L6-v2` / `Xenova/all-MiniLM-L6-v2`).

---

## Proposed Directory Structure

We will populate the root directory with:
- `backend/`: Express server, routes, controllers, schemas, langchain modules.
- `frontend/`: React app with Vite, routes, components, and pages.
- `.env`: Centralized environment file.
- `start.bat`: Launch script for running both frontend and backend concurrently.

```
root/
├── backend/
│   ├── config/          # db.js, pinecone.js, langchain.js
│   ├── controllers/     # authController.js, syllabusController.js, etc.
│   ├── langchain/       # ragService.js, groqService.js, chains.js
│   ├── middlewares/     # authMiddleware.js, errorMiddleware.js, uploadMiddleware.js
│   ├── models/          # User.js, Syllabus.js, Question.js, Paper.js, Exam.js, Result.js
│   ├── routes/          # authRoutes.js, syllabusRoutes.js, etc.
│   ├── services/        # dbServices, emailServices
│   ├── utils/           # logger.js, envValidator.js
│   ├── uploads/         # Local temp directory for file uploads
│   ├── server.js        # Main Express server entrypoint
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # Button, Card, Sidebar, Navbar, Loading, Toast
│   │   ├── context/     # AuthContext, ExamContext
│   │   ├── hooks/       # useFetch, etc.
│   │   ├── pages/       # Login, Register, AdminDashboard, StudentDashboard, ExamPage, etc.
│   │   ├── services/    # api.js
│   │   ├── utils/       # formatters.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── .env
├── start.bat
└── README.md
```

---

## Database Schemas

We will define Mongoose models for:
1. **User**: Name, Email, Password, Role (`admin`, `student`).
2. **Syllabus**: Subject, OriginalFilename, FilePath, PineconeNamespace, UploadedBy.
3. **Question**: Subject, QuestionText, Options, CorrectAnswer, Difficulty (`easy`, `medium`, `hard`), BloomLevel (`remember`, `understand`, `apply`, `analyze`, `evaluate`, `create`), Marks, Topic, SyllabusId.
4. **QuestionPaper**: Title, Subject, Questions (References to Question), TotalMarks, Duration, DifficultyMix, BloomMix, Published (`boolean`), CreatedBy.
5. **Exam**: Student (Reference to User), Paper (Reference to QuestionPaper), Status (`started`, `submitted`), StartTime, EndTime, Answers (Map of QuestionId -> SelectedOption).
6. **Result**: Student, Paper, Exam, TotalMarks, ObtainedMarks, Percentage, Grade, Breakdown (Correct, Wrong, Skipped), AiFeedback (Strengths, Weak Areas, Study Plan, Bloom Performance).

---

## Proposed Changes

### [Backend Components]

#### [NEW] [server.js](file:///c:/GEN_AI/NTA/backend/server.js)
Main Express application. Sets up Helmet, CORS, Rate-limiting, Routes, Error handling, and database connections.

#### [NEW] [db.js](file:///c:/GEN_AI/NTA/backend/config/db.js)
Initializes MongoDB Atlas connection.

#### [NEW] [pinecone.js](file:///c:/GEN_AI/NTA/backend/config/pinecone.js)
Initializes Pinecone client connection.

#### [NEW] [envValidator.js](file:///c:/GEN_AI/NTA/backend/utils/envValidator.js)
Validates all required env variables on boot and crashes gracefully if missing.

#### [NEW] [ragService.js](file:///c:/GEN_AI/NTA/backend/langchain/ragService.js)
Parses files (PDF, DOCX, TXT), splits text using `RecursiveCharacterTextSplitter`, generates embeddings with `@xenova/transformers`, and upserts vectors with metadata into Pinecone.

#### [NEW] [groqService.js](file:///c:/GEN_AI/NTA/backend/langchain/groqService.js)
Chains for generating questions, evaluating results, and providing AI feedback. Connects with LangSmith tracing if env is set.

#### [NEW] Controllers, Routes, and Models
Full MERN implementations for User, Syllabus, Questions, Papers, Exams, and Results.

---

### [Frontend Components]

#### [NEW] [App.jsx](file:///c:/GEN_AI/NTA/frontend/src/App.jsx)
Router setup with protected routes for Admin and Student role-based views.

#### [NEW] Auth Pages
Login & Registration pages with smooth dark mode layouts.

#### [NEW] Admin Dashboard
Syllabus Upload page, Question Generator UI (with difficulty/Bloom sliders), Paper Configurator & Publisher, Admin Analytics.

#### [NEW] Student Dashboard
Exam History, Score Trends, Recommendations, active exams list.

#### [NEW] Exam Taking UI
FullScreen lock, Auto-Save timer, Previous/Next/Review navigation, Submit flow.

#### [NEW] Results and Feedback Page
Visual score charts, Topic recommendations, PDF receipt generator.

---

## Verification Plan

### Automated Verification
- We will write a validation script to test Pinecone connection, Groq LLM API, and MongoDB connection.
- We will run the backend and frontend local build tools.

### Manual Verification
- We will start the MERN application using the created `start.bat` file.
- Verify JWT registration, login, and authorization.
- Verify PDF/Text syllabus upload, chunk extraction, and Pinecone vector creation.
- Verify AI generation of questions and paper compiling.
- Verify exam completion, auto grading, AI feedback generation, and dashboard visual charts.
