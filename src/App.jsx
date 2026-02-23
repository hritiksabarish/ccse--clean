import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import AnalysisPage from './pages/AnalysisPage';
import ResultsPage from './pages/ResultsPage';
import PortfolioPage from './pages/PortfolioPage';
import AIChatWidget from './components/AIChatWidget';
import CreditScoreMaterializationIntro from './components/CreditScoreMaterializationIntro';
import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';
function App() {
  const [showIntro, setShowIntro] = useState(() => {
    return !sessionStorage.getItem('climateIntelIntroPlayed');
  });

  const handleIntroComplete = () => {
    sessionStorage.setItem('climateIntelIntroPlayed', 'true');
    setShowIntro(false);
  };

  return (
    <>
      <AnimatePresence>
        {showIntro && <CreditScoreMaterializationIntro key="intro" onComplete={handleIntroComplete} />}
      </AnimatePresence>

      {!showIntro && (
        <Router>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout>
                    <HomePage />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/analysis" element={
                <ProtectedRoute>
                  <Layout>
                    <AnalysisPage />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/results" element={
                <ProtectedRoute>
                  <Layout>
                    <ResultsPage />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/portfolio" element={
                <ProtectedRoute>
                  <Layout>
                    <PortfolioPage />
                  </Layout>
                </ProtectedRoute>
              } />
            </Routes>
            <AIChatWidget />
          </AuthProvider>
        </Router>
      )}
    </>
  );
}

export default App;
