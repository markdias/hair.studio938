import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import IntroVideo from './components/IntroVideo'
import { Navbar, Hero, Services, TeamSection, PriceList, Testimonials, Contact, Footer } from './components/LandingPage'
import Gallery from './components/Gallery'
import BookingSystem from './components/BookingSystem'
import CookieConsent from './components/CookieConsent'
import MaintenanceScreen from './components/MaintenanceScreen'
import CustomSection from './components/CustomSection'
import SectionPage from './components/SectionPage'
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

// Default order for sections
const DEFAULT_ORDER = [
  { id: 'services', label: 'Services', sort_order: 10 },
  { id: 'team', label: 'Team', sort_order: 20 },
  { id: 'pricing', label: 'Pricing', sort_order: 30 },
  { id: 'testimonials', label: 'Testimonials', sort_order: 40 },
  { id: 'booking', label: 'Booking', sort_order: 50 },
  { id: 'gallery', label: 'Gallery', sort_order: 60 },
  { id: 'contact', label: 'Contact', sort_order: 70, is_separate_page: true }
];

// Custom Hook for fetching CMS data
const useSiteData = () => {
  const [siteData, setSiteData] = useState({
    settings: {}, services: [], pricing: [], team: [], gallery: [], testimonials: [], phoneNumbers: [], customSections: [], pageSections: [], loading: true
  });

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
        { data: customSects },
        { data: sections }
      ] = await Promise.all([
        supabase.from('site_settings').select('*'),
        supabase.from('services_overview').select('*'),
        supabase.from('price_list').select('*').order('sort_order'),
        supabase.from('stylist_calendars').select('*').order('sort_order'),
        supabase.from('gallery_images').select('*').order('sort_order'),
        supabase.from('testimonials').select('*').order('sort_order'),
        supabase.from('phone_numbers').select('*').order('display_order'),
        supabase.from('custom_sections').select('*, custom_section_elements(*)').order('sort_order'),
        supabase.from('site_page_sections').select('*').order('sort_order')
      ]);

      const settingsObj = {};
      if (settings) settings.forEach(s => settingsObj[s.key] = s.value);

      // Merge fetched sections with defaults
      let mergedSections = sections || [];

      // Ensure ALL default sections exist in the list and have default properties
      DEFAULT_ORDER.forEach(def => {
        const existing = mergedSections.find(s => s.id === def.id);
        if (!existing) {
          mergedSections.push({ ...def, enabled: true });
        } else {
          // Merge properties from default that might be missing or should be enforced
          if (existing.is_separate_page === undefined || existing.id === 'contact') {
            existing.is_separate_page = def.is_separate_page;
          }
        }
      });

      // Add any custom sections that aren't in the list yet
      if (customSects) {
        customSects.forEach(cs => {
          if (cs.enabled !== false && !mergedSections.find(ps => ps.id === cs.id)) {
            mergedSections.push({
              id: cs.id,
              is_custom: true,
              enabled: true,
              sort_order: 999
            });
          }
        });
      }

      setSiteData({
        settings: settingsObj,
        services: srvs || [],
        pricing: prices || [],
        team: stls || [],
        gallery: gly || [],
        testimonials: tests || [],
        phoneNumbers: phones || [],
        customSections: customSects || [],
        pageSections: mergedSections,
        loading: false
      });
    } catch (err) {
      console.warn('CMS data fetch failed:', err.message);
      setSiteData(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchSiteData();
  }, []);

  return { ...siteData, refreshSiteData: fetchSiteData };
};

const MainSite = ({ siteData }) => {
  const [showMainSite, setShowMainSite] = useState(() => {
    return localStorage.getItem('hasSeenIntro') === 'true';
  })

  const handleIntroComplete = () => {
    localStorage.setItem('hasSeenIntro', 'true');
    setShowMainSite(true);
  }

  if (siteData.loading) return null;

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
              <Hero settings={siteData.settings} pageSections={siteData.pageSections} />

              {(() => {
                const sortedSections = [...siteData.pageSections].sort((a, b) => (a.sort_order || 999) - (b.sort_order || 999));

                return sortedSections.map(section => {
                  const id = section.id;
                  // If explicit enabled field exists and is false, skip (unless it's custom and we handled it)
                  if (section.enabled === false) return null;

                  // Skip sections that are set to be separate pages
                  if (section.is_separate_page) return null;

                  // Fixed Sections
                  if (id === 'services') return <Services key="services" services={siteData.services} settings={siteData.settings} />;
                  if (id === 'team') return <TeamSection key="team" team={siteData.team} settings={siteData.settings} />;
                  if (id === 'pricing') return <PriceList key="pricing" pricing={siteData.pricing} settings={siteData.settings} />;
                  if (id === 'testimonials') return <Testimonials key="testimonials" testimonials={siteData.testimonials} settings={siteData.settings} />;
                  if (id === 'booking') return <BookingSystem key="booking" settings={siteData.settings} />;
                  if (id === 'gallery') return <Gallery key="gallery" images={siteData.gallery} settings={siteData.settings} />;
                  if (id === 'contact') return <Contact key="contact" settings={siteData.settings} phoneNumbers={siteData.phoneNumbers} />;

                  // Custom Sections
                  const customSection = siteData.customSections.find(s => s.id === id);
                  if (customSection) {
                    return <CustomSection key={customSection.id} data={customSection} />;
                  }
                  return null;
                });
              })()}

              <Footer settings={siteData.settings} phoneNumbers={siteData.phoneNumbers} pageSections={siteData.pageSections} />
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
  const siteData = useSiteData();

  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<MainSite siteData={siteData} />} />
          <Route path="/section/:sectionId" element={<SectionPage siteData={siteData} />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard refreshSiteData={siteData.refreshSiteData} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App
