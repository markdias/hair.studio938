import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import IntroVideo from './components/IntroVideo'
import { Navbar, Hero, Services, TeamSection, PriceList, Contact, Footer } from './components/LandingPage'
import Gallery from './components/Gallery'
import BookingSystem from './components/BookingSystem'
import { Analytics } from '@vercel/analytics/react'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import { supabase } from './lib/supabase'
import './App.css'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return null;
  if (!session) return <Navigate to="/admin/login" />;

  return children;
};

const MainSite = () => {
  const [showMainSite, setShowMainSite] = useState(() => {
    return localStorage.getItem('hasSeenIntro') === 'true';
  })

  const handleIntroComplete = () => {
    localStorage.setItem('hasSeenIntro', 'true');
    setShowMainSite(true);
  }

  return (
    <>
      {!showMainSite && (
        <IntroVideo onComplete={handleIntroComplete} />
      )}

      {showMainSite && (
        <main className="main-content">
          <Navbar />
          <Hero />
          <Services />
          <TeamSection />
          <PriceList />
          <BookingSystem />
          <Gallery />
          <Contact />
          <Footer />
          <Analytics />
        </main>
      )}
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<MainSite />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App
