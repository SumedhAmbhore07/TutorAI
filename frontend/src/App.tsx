import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Courses from './pages/Courses';
import Quizzes from './pages/Quizzes';
import Tutor from './pages/Tutor';
import Profile from './pages/Profile';
import CommunityPage from './pages/CommunityPage';
import { useTimeTracker } from './hooks/useTimeTracker';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function TimeTracker() {
  useTimeTracker();
  return null;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TimeTracker />
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="courses" element={<Courses />} />
            <Route path="quizzes" element={<Quizzes />} />
            <Route path="tutor" element={<Tutor />} />
            <Route path="profile" element={<Profile />} />
            <Route path="community" element={<CommunityPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}
export default App;
