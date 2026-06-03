import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Loader from './components/Loader';

// Public Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import SyllabusUpload from './pages/admin/SyllabusUpload';
import QuestionGenerator from './pages/admin/QuestionGenerator';
import PaperGenerator from './pages/admin/PaperGenerator';
import QuestionBank from './pages/admin/QuestionBank';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import ExamList from './pages/student/ExamList';
import ExamInterface from './pages/student/ExamInterface';
import ResultDetail from './pages/student/ResultDetail';
import ExamHistory from './pages/student/ExamHistory';

// Settings Page
import ProfileSettings from './pages/ProfileSettings';

// Route Guards
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-darkBg flex items-center justify-center">
        <Loader message="Authenticating session credentials..." />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const RoleRoute = ({ children, allowedRole }) => {
  const { user } = useContext(AuthContext);
  
  if (user && user.role !== allowedRole) {
    const fallback = user.role === 'admin' ? '/admin' : '/student';
    return <Navigate to={fallback} replace />;
  }
  
  return children;
};

// Layout Wrapper
const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-darkBg flex flex-col justify-between">
      <Navbar />
      <div className="flex flex-col md:flex-row flex-1">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Admin Dashboard Routes */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="admin">
              <DashboardLayout>
                <AdminDashboard />
              </DashboardLayout>
            </RoleRoute>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/syllabus" 
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="admin">
              <DashboardLayout>
                <SyllabusUpload />
              </DashboardLayout>
            </RoleRoute>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/generate-questions" 
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="admin">
              <DashboardLayout>
                <QuestionGenerator />
              </DashboardLayout>
            </RoleRoute>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/compile-paper" 
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="admin">
              <DashboardLayout>
                <PaperGenerator />
              </DashboardLayout>
            </RoleRoute>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/question-bank" 
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="admin">
              <DashboardLayout>
                <QuestionBank />
              </DashboardLayout>
            </RoleRoute>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/settings" 
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="admin">
              <DashboardLayout>
                <ProfileSettings />
              </DashboardLayout>
            </RoleRoute>
          </ProtectedRoute>
        } 
      />

      {/* Student Dashboard Routes */}
      <Route 
        path="/student" 
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="student">
              <DashboardLayout>
                <StudentDashboard />
              </DashboardLayout>
            </RoleRoute>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/student/take-exam" 
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="student">
              <DashboardLayout>
                <ExamList />
              </DashboardLayout>
            </RoleRoute>
          </ProtectedRoute>
        } 
      />
      
      {/* Exam Interface (Independent Fullscreen layout - no sidebar/header) */}
      <Route 
        path="/student/exam/:paperId" 
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="student">
              <ExamInterface />
            </RoleRoute>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/student/results/:id" 
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="student">
              <DashboardLayout>
                <ResultDetail />
              </DashboardLayout>
            </RoleRoute>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/student/history" 
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="student">
              <DashboardLayout>
                <ExamHistory />
              </DashboardLayout>
            </RoleRoute>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/student/analytics" 
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="student">
              <DashboardLayout>
                <StudentDashboard />
              </DashboardLayout>
            </RoleRoute>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/student/settings" 
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="student">
              <DashboardLayout>
                <ProfileSettings />
              </DashboardLayout>
            </RoleRoute>
          </ProtectedRoute>
        } 
      />

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
