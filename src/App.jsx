import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import IntroVideo from './components/IntroVideo'
import { Navbar, Hero, Services, TeamSection, PriceList, Testimonials, Contact, Footer } from './components/LandingPage'
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

  // CMS Data States
  const [siteData, setSiteData] = useState({
    settings: {}, services: [], pricing: [], team: [], gallery: [], testimonials: [], loading: true
  });

  useEffect(() => {
    fetchSiteData();
  }, []);

  const fetchSiteData = async () => {
    try {
      const [
        { data: settings },
        { data: srvs },
        { data: prices },
        { data: stls },
        { data: gly },
        { data: tests }
      ] = await Promise.all([
        supabase.from('site_settings').select('*'),
        supabase.from('services_overview').select('*'),
        supabase.from('price_list').select('*').order('sort_order'),
        supabase.from('stylist_calendars').select('*'),
        supabase.from('gallery_images').select('*').order('sort_order'),
        supabase.from('testimonials').select('*').order('sort_order')
      ]);

      const settingsObj = {};
      if (settings) settings.forEach(s => settingsObj[s.key] = s.value);

      setSiteData({
        settings: settingsObj,
        services: srvs || [],
        pricing: prices || [],
        team: stls || [],
        gallery: gly || [],
        testimonials: tests || [],
        loading: false
      });
    } catch (err) {
      console.warn('CMS data fetch failed (tables might not exist yet):', err.message);
      setSiteData(prev => ({ ...prev, loading: false }));
    }
  };

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
          <Navbar settings={siteData.settings} />
          <Hero settings={siteData.settings} />
          <Services services={siteData.services} settings={siteData.settings} />
          <TeamSection team={siteData.team} settings={siteData.settings} />
          <PriceList pricing={siteData.pricing} settings={siteData.settings} />
          <Testimonials testimonials={siteData.testimonials} settings={siteData.settings} />
          <BookingSystem />
          <Gallery images={siteData.gallery} settings={siteData.settings} />
          <Contact settings={siteData.settings} />
          <Footer settings={siteData.settings} />
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
