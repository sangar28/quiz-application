
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { QuizInstructions } from './components/student/QuizInstructions';
import { StudentQuizPage } from './pages/student/StudentQuizPage';
import { StudentResultPage } from './pages/student/StudentResultPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { QuizManagementPage } from './pages/admin/QuizManagementPage';
import { AdminResultsPage } from './pages/admin/AdminResultsPage';

const RootRedirect = () => {
  const { authenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  return <Navigate to="/student" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/student"
            element={
              <ProtectedRoute>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/quiz/:quizId/instructions"
            element={
              <ProtectedRoute>
                <QuizInstructions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/quiz/:quizId"
            element={
              <ProtectedRoute>
                <StudentQuizPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/result/:attemptId"
            element={
              <ProtectedRoute>
                <StudentResultPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/quizzes"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <QuizManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/quizzes/:quizId"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <QuizManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/results"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminResultsPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
