import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import MobileNav from './components/layout/MobileNav';
import { ToastContainer } from './components/common/Toast';
import { ScrollToTop } from './components/common/ScrollToTop';

// Dedicated Tabbed Pages
import { PaddockHomePage } from './pages/PaddockHomePage';
import { RealF1Page } from './pages/RealF1Page';
import { QuizPage } from './pages/QuizPage';
import { DriverlePage } from './pages/DriverlePage';
import { CircuitsPage } from './pages/CircuitsPage';
import { StandingsPage } from './pages/StandingsPage';
import { ReactionPage } from './pages/ReactionPage';
import { HigherLowerPage } from './pages/HigherLowerPage';
import { HelmetGuessPage } from './pages/HelmetGuessPage';
import { StrategyPage } from './pages/StrategyPage';

const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <ToastContainer />
      <Navbar />
      <MobileNav />
      <Routes>
        <Route path="/" element={<PaddockHomePage />} />
        <Route path="/f1-real" element={<RealF1Page />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/driverle" element={<DriverlePage />} />
        <Route path="/circuits" element={<CircuitsPage />} />
        <Route path="/reaction" element={<ReactionPage />} />
        <Route path="/higher-lower" element={<HigherLowerPage />} />
        <Route path="/helmet-guess" element={<HelmetGuessPage />} />
        <Route path="/strategy" element={<StrategyPage />} />
        <Route path="/standings" element={<StandingsPage />} />
        <Route path="/leaderboard" element={<Navigate to="/standings" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
