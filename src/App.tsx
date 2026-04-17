import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { evaluatorRouter } from './evaluator/router';
import { PracticePage } from './pages/Practice';
import { ExamPage } from './pages/Exam';
import { ExamListPage } from './pages/ExamList';
import { AdminPage } from './pages/Admin';
import { HomePage } from './pages/Home';
import { LearnPage } from './pages/Learn';

export function App() {
  const [isPyodideReady, setIsPyodideReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    evaluatorRouter
      .init()
      .then(() => setIsPyodideReady(true))
      .catch((err) => setInitError(err.message));
  }, []);

  if (initError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-red-900/20 rounded-lg border border-red-700">
          <h2 className="text-red-400 text-xl mb-2">Failed to initialize Python environment</h2>
          <p className="text-gray-400">{initError}</p>
        </div>
      </div>
    );
  }

  if (!isPyodideReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-400">Loading Python environment...</p>
          <p className="text-gray-500 text-sm mt-2">This may take a few seconds on first load</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <a href="/" className="text-xl font-bold text-purple-600 dark:text-purple-400">
              Python Learning
            </a>
            <div className="flex gap-6">
              <a href="/learn" className="text-gray-600 dark:text-gray-300 hover:text-purple-600">
                Learn
              </a>
              <a href="/practice" className="text-gray-600 dark:text-gray-300 hover:text-purple-600">
                Practice
              </a>
              <a href="/exam" className="text-gray-600 dark:text-gray-300 hover:text-purple-600">
                Exam
              </a>
              <a href="/admin" className="text-gray-600 dark:text-gray-300 hover:text-purple-600">
                Admin
              </a>
            </div>
          </nav>
        </header>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/learn" element={<Navigate to="/learn/python-basics" replace />} />
          <Route path="/learn/*" element={<LearnPage />} />
          <Route path="/practice" element={<Navigate to="/practice/ch01_basics" replace />} />
          <Route path="/practice/:chapterId" element={<PracticePage />} />
          <Route path="/exam" element={<ExamListPage />} />
          <Route path="/exam/:examId" element={<ExamPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
