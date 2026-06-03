# AI Exam Paper Generator & Evaluator

An AI-driven academic examination portal built on MERN (MongoDB, Express, React, Node.js) and RAG (Retrieval-Augmented Generation) architectures. The system processes uploaded course syllabi, converts them into high-dimension vectors stored in Pinecone, generates MCQ questions aligning with Bloom's Taxonomy cognitive categories, monitors student testing sessions with autosaving timers, grades responses automatically, and aggregates performance diagnostics on visual analytics dashboards.

---

## Key Features

1. **Syllabus Document Parsing & RAG**: Upload PDF, DOCX, or TXT files. The text is chunked using a recursive character splitting algorithm and indexed.
2. **Local Embedding Generation**: Generates 384-dimensional vectors directly in the backend memory using `@xenova/transformers` (running `all-MiniLM-L6-v2` locally), eliminating the need for paid external embedding APIs.
3. **AI Question Generation**: Harnesses Llama 3.3 (via Groq) to assemble questions matching target difficulty (Easy, Medium, Hard) and Bloom's cognitive taxonomy levels.
4. **Custom Exam Paper Compiler**: Creates balanced papers containing question mix ratios.
5. **Secure Exam Engine**: Displays timer count-downs, autosaves progress to database collections every 10 seconds, tracks tab switches to prevent cheating, and submits attempts automatically on timeouts.
6. **AI Diagnostics & Performance Dashboards**: Delivers letter grades and reports containing strengths, target study areas, and weekly learning agendas. Recharts maps cohort and individual statistics.
7. **Resilient Offline Fallbacks**: Automatically switches to local MongoDB text-based search queries and mock LLM configurations if Pinecone or Groq API keys are not supplied.

---

## Tech Stack

- **Frontend**: React.js, Vite, Tailwind CSS, Recharts, Lucide Icons, Axios.
- **Backend**: Node.js (ES Modules), Express.js, Multer, Helmet, Express-Rate-Limit.
- **Database**: MongoDB Atlas, Pinecone Vector DB.
- **AI Integration**: LangChain Core, LangChain Groq SDK, Xenova ONNX pipeline.

---

## Directory Structure

```
root/
├── backend/
│   ├── config/          # Database, Pinecone, and LangChain configurations
│   ├── controllers/     # API controllers (Auth, Syllabus, Exam, Results)
│   ├── langchain/       # LangChain ChatGroq chains and RAG queries
│   ├── middlewares/     # Route protection, file uploads, error formatting
│   ├── models/          # Mongoose database schemas
│   ├── routes/          # Express route bindings
│   ├── utils/           # Logger, env validator, file parsers
│   └── uploads/         # Local temp directory for file uploads
├── frontend/
│   ├── src/
│   │   ├── components/  # Layouts (Navbar, Sidebar), loaders, glass cards
│   │   ├── context/     # Global state contexts (Auth, Exam)
│   │   ├── pages/       # Dashboard pages, landing view, exam interfaces
│   │   ├── services/    # Axios client instances
│   │   └── index.css    # Global stylesheet, custom glassmorphism styles
│   ├── index.html
│   └── vite.config.js
├── .env                 # Centralized environment file
├── start.bat            # Windows single-click service launcher
└── README.md
```

---

## Environment Variables Configuration

Create a file named `.env` in the project root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend Configuration
FRONTEND_URL=http://localhost:5173

# Database Configuration
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/ai_exam_generator

# Authentication
JWT_SECRET=your_jwt_signing_key_secret

# AI & LLM (Groq)
GROQ_API_KEY=gsk_your_groq_api_key

# Vector Database (Pinecone)
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=ai-exam-generator

# LangChain Tracing (LangSmith)
LANGCHAIN_API_KEY=your_langsmith_api_key
LANGCHAIN_TRACING_V2=true
LANGCHAIN_PROJECT=AI_EXAM_GENERATOR
```

> [!IMPORTANT]
> **Pinecone Index Configuration**
> Ensure your Pinecone Index is configured for **384 dimensions** (cosine similarity) to match the `all-MiniLM-L6-v2` embedding dimension.

---

## Local Installation & Launch

1. Clone or copy the project directories onto your local system.
2. Fill in the `.env` file credentials.
3. double-click the `start.bat` script file in the project root.
4. The script will concurrently initialize backend and frontend servers and open your browser window to `http://localhost:5173`.

---

## Deployment Instructions

### 1. Database & Vector DB Setup
- **MongoDB Atlas**: Create a free-tier cluster. Whitelist incoming IPs (`0.0.0.0/0`), copy the URI string, and replace username/password parameters.
- **Pinecone**: Create an index named `ai-exam-generator` with **384 dimensions** and **cosine** metric.

### 2. Backend (Render Deployment)
- Connect your GitHub repository to [Render](https://render.com/).
- Choose **Web Service** template.
- **Build Command**: `cd backend && npm install`
- **Start Command**: `cd backend && npm start`
- Add all required environmental variables (ensure `NODE_ENV=production` is set).

### 3. Frontend (Vercel Deployment)
- Import project repository to [Vercel](https://vercel.com/).
- Choose **Vite** project framework.
- **Root Directory**: Select `frontend` or set build folder paths.
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- Configure Environment Variables (e.g., set `/api` proxy target mapping if not using direct domain endpoints).

---

## Troubleshooting Guide

- **ONNX model downloading slow on start**: On the very first upload or query, the backend will fetch the `Xenova/all-MiniLM-L6-v2` weights (approx. 90MB) from Hugging Face and store it in your node_modules directory. Please wait a few seconds. If internet access is limited, the server will gracefully fallback to local text matching.
- **Pinecone dimension mismatch**: Ensure your Pinecone index is set to exactly 384 dimensions. If it is set to 1536 (OpenAI standard), calls will throw index parameter mismatches.
- **"Not Authorized" errors**: Check if your JWT token has expired or if you are logging in with mismatched user accounts (e.g., student trying to call upload syllabus endpoints).
