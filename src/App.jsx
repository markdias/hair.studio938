import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import IntroVideo from './components/IntroVideo'
import { Navbar, Hero, Services, TeamSection, PriceList, Testimonials, Contact, Footer } from './components/LandingPage'
import Gallery from './components/Gallery'
import BookingSystem from './components/BookingSystem'
import CookieConsent from './components/CookieConsent'
import MaintenanceScreen from './components/MaintenanceScreen'
import CustomSection from './components/CustomSection'
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
    settings: {}, services: [], pricing: [], team: [], gallery: [], testimonials: [], phoneNumbers: [], customSections: [], pageSections: [], loading: true
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
        { data: tests },
        { data: phones },
        { data: customSects }
      ] = await Promise.all([
        supabase.from('site_settings').select('*'),
        supabase.from('services_overview').select('*'),
        supabase.from('price_list').select('*').order('sort_order'),
        supabase.from('stylist_calendars').select('*'),
        supabase.from('gallery_images').select('*').order('sort_order'),
        supabase.from('testimonials').select('*').order('sort_order'),
        supabase.from('phone_numbers').select('*').order('display_order'),
        supabase.from('custom_sections').select('*, custom_section_elements(*)').eq('enabled', true).order('sort_order'),
        supabase.from('site_page_sections').select('*').order('sort_order')
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
        phoneNumbers: phones || [],
        customSections: customSects || [],
        pageSections: (sections || []).filter(s => s.enabled !== false),
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
      {/* Kill Switch Check - Show maintenance screen if site is disabled */}
      {siteData.settings.site_enabled === 'false' ? (
        <MaintenanceScreen />
      ) : (
        <>
          {!showMainSite && siteData.settings.intro_video_url && (
            <IntroVideo onComplete={handleIntroComplete} videoUrl={siteData.settings.intro_video_url} />
          )}

          {(showMainSite || !siteData.settings.intro_video_url) && (
            <main className="main-content">
              <Navbar settings={siteData.settings} customSections={siteData.customSections} pageSections={siteData.pageSections} />
              <Hero settings={siteData.settings} />

              {siteData.pageSections.length > 0 ? (
                siteData.pageSections.map(section => {
                  const id = section.id;
                  // Fixed Sections
                  if (id === 'services') return <Services key="services" services={siteData.services} settings={siteData.settings} />;
                  if (id === 'team') return <TeamSection key="team" team={siteData.team} settings={siteData.settings} />;
                  if (id === 'pricing') return <PriceList key="pricing" pricing={siteData.pricing} settings={siteData.settings} />;
                  if (id === 'testimonials') return <Testimonials key="testimonials" testimonials={siteData.testimonials} settings={siteData.settings} />;
                  if (id === 'booking') return <BookingSystem key="booking" />;
                  if (id === 'gallery') return <Gallery key="gallery" images={siteData.gallery} settings={siteData.settings} />;
                  if (id === 'contact') return <Contact key="contact" settings={siteData.settings} phoneNumbers={siteData.phoneNumbers} />;

                  // Custom Sections
                  const customSection = siteData.customSections.find(s => s.id === id);
                  if (customSection) {
                    return <CustomSection key={customSection.id} data={customSection} />;
                  }
                  return null;
                })
              ) : (
                // Fallback to default order if pageSections is empty
                <>
                  <Services services={siteData.services} settings={siteData.settings} />
                  <TeamSection team={siteData.team} settings={siteData.settings} />
                  <PriceList pricing={siteData.pricing} settings={siteData.settings} />
                  <Testimonials testimonials={siteData.testimonials} settings={siteData.settings} />
                  <BookingSystem />
                  {siteData.customSections.map((section) => (
                    <CustomSection key={section.id} data={section} />
                  ))}
                  <Gallery images={siteData.gallery} settings={siteData.settings} />
                  <Contact settings={siteData.settings} phoneNumbers={siteData.phoneNumbers} />
                </>
              )}

              <Footer settings={siteData.settings} />
              <Analytics />
              <CookieConsent />
            </main>
          )}
        </>
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
