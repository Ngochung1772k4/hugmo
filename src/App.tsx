import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { CreateStudySet } from './pages/CreateStudySet';
import { EditStudySet } from './pages/EditStudySet';
import { StudySetDetail } from './pages/StudySetDetail';
import { FlashcardMode } from './pages/FlashcardMode';
import { QuizMode } from './pages/QuizMode';
import { WrittenMode } from './pages/WrittenMode';
import { TopikOverviewPage } from './features/topikReading/pages/TopikOverviewPage';
import { TopikGrammarPage } from './features/topikReading/pages/TopikGrammarPage';
import { TopikSimilarPage } from './features/topikReading/pages/TopikSimilarPage';
import { TopikPracticePage } from './features/topikReading/pages/TopikPracticePage';
import { TopikWrongPage } from './features/topikReading/pages/TopikWrongPage';
import { PassageListPage } from './features/topikReader/pages/PassageListPage';
import { PassageFormPage } from './features/topikReader/pages/PassageFormPage';
import { InteractiveReaderPage } from './features/topikReader/pages/InteractiveReaderPage';
import { PassageVocabularyPage } from './features/topikReader/pages/PassageVocabularyPage';
import { Q54HubPage } from './features/topikWriting54/pages/Q54HubPage';
import { Q54QuestionPage } from './features/topikWriting54/pages/Q54QuestionPage';
import { Q54PracticePage } from './features/topikWriting54/pages/Q54PracticePage';
import { Q54ErrorNotebookPage } from './features/topikWriting54/pages/Q54ErrorNotebookPage';
import { Writing51HubPage } from './features/topikWriting5152/pages/Writing51HubPage';
import { Writing51LearnPage } from './features/topikWriting5152/pages/Writing51LearnPage';
import { Writing51PracticePage } from './features/topikWriting5152/pages/Writing51PracticePage';
import { Writing52HubPage } from './features/topikWriting5152/pages/Writing52HubPage';
import { Writing52LearnPage } from './features/topikWriting5152/pages/Writing52LearnPage';
import { Writing52PracticePage } from './features/topikWriting5152/pages/Writing52PracticePage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-brand-500 selection:text-white">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/study-sets/new"
                element={
                  <ProtectedRoute>
                    <CreateStudySet />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/study-sets/:id"
                element={
                  <ProtectedRoute>
                    <StudySetDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/study-sets/:id/edit"
                element={
                  <ProtectedRoute>
                    <EditStudySet />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/study-sets/:id/flashcards"
                element={
                  <ProtectedRoute>
                    <FlashcardMode />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/study-sets/:id/quiz"
                element={
                  <ProtectedRoute>
                    <QuizMode />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/study-sets/:id/write"
                element={
                  <ProtectedRoute>
                    <WrittenMode />
                  </ProtectedRoute>
                }
              />
              <Route path="/topik/reading/1-4" element={<ProtectedRoute><TopikOverviewPage /></ProtectedRoute>} />
              <Route path="/topik/reading/1-4/grammar" element={<ProtectedRoute><TopikGrammarPage /></ProtectedRoute>} />
              <Route path="/topik/reading/1-4/similar" element={<ProtectedRoute><TopikSimilarPage /></ProtectedRoute>} />
              <Route path="/topik/reading/1-4/practice" element={<ProtectedRoute><TopikPracticePage /></ProtectedRoute>} />
              <Route path="/topik/reading/1-4/wrong" element={<ProtectedRoute><TopikWrongPage /></ProtectedRoute>} />
              <Route path="/topik/reader" element={<ProtectedRoute><PassageListPage /></ProtectedRoute>} />
              <Route path="/topik/reader/new" element={<ProtectedRoute><PassageFormPage /></ProtectedRoute>} />
              <Route path="/topik/reader/:id" element={<ProtectedRoute><InteractiveReaderPage /></ProtectedRoute>} />
              <Route path="/topik/reader/:id/edit" element={<ProtectedRoute><PassageFormPage /></ProtectedRoute>} />
              <Route path="/topik/reader/:id/vocabulary" element={<ProtectedRoute><PassageVocabularyPage /></ProtectedRoute>} />
              <Route path="/topik/writing/54" element={<ProtectedRoute><Q54HubPage /></ProtectedRoute>} />
              <Route path="/topik/writing/54/questions/:id" element={<ProtectedRoute><Q54QuestionPage /></ProtectedRoute>} />
              <Route path="/topik/writing/54/practice/:id" element={<ProtectedRoute><Q54PracticePage /></ProtectedRoute>} />
              <Route path="/topik/writing/54/errors" element={<ProtectedRoute><Q54ErrorNotebookPage /></ProtectedRoute>} />
              <Route path="/topik/writing/51" element={<ProtectedRoute><Writing51HubPage /></ProtectedRoute>} />
              <Route path="/topik/writing/51/learn" element={<ProtectedRoute><Writing51LearnPage /></ProtectedRoute>} />
              <Route path="/topik/writing/51/practice" element={<Navigate to="/topik/writing/51" replace />} />
              <Route path="/topik/writing/51/practice/:id" element={<ProtectedRoute><Writing51PracticePage /></ProtectedRoute>} />
              <Route path="/topik/writing/52" element={<ProtectedRoute><Writing52HubPage /></ProtectedRoute>} />
              <Route path="/topik/writing/52/learn" element={<ProtectedRoute><Writing52LearnPage /></ProtectedRoute>} />
              <Route path="/topik/writing/52/practice" element={<Navigate to="/topik/writing/52" replace />} />
              <Route path="/topik/writing/52/practice/:id" element={<ProtectedRoute><Writing52PracticePage /></ProtectedRoute>} />

              {/* Redirections */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
