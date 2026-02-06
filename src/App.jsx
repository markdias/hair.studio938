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
import { SpeedInsights } from "@vercel/speed-insights/react"
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import { supabase } from './lib/supabase'
import { useTheme } from './lib/ThemeContext'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import './App.css'

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // If no hash, scroll to top
    if (!hash) {
      window.scrollTo(0, 0);
    }
    // If hash exists, try to scroll to the element
    else {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else {
        // Fallback for home page anchors if they haven't rendered yet
        setTimeout(() => {
          const retryElement = document.getElementById(id);
          if (retryElement) retryElement.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [pathname, hash]);

  return null;
};

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
  { id: 'team', label: 'Our Team', sort_order: 20 },
  { id: 'pricing', label: 'Pricing', sort_order: 30 },
  { id: 'testimonials', label: 'Testimonials', sort_order: 40 },
  { id: 'booking', label: 'Booking', sort_order: 50 },
  { id: 'gallery', label: 'Gallery', sort_order: 60 },
  { id: 'contact', label: 'Contact', sort_order: 70, is_separate_page: true }
];

// Custom Hook for fetching CMS data
const useSiteData = () => {
  const [siteData, setSiteData] = useState({
    settings: {}, services: [], pricing: [], team: [], gallery: [], testimonials: [], phoneNumbers: [], customSections: [], pageSections: [], footerSections: [], loading: true
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
        { data: fetchedSections },
        { data: fetchedFooterSections }
      ] = await Promise.all([
        supabase.from('site_settings').select('*'),
        supabase.from('services_overview').select('*'),
        supabase.from('price_list').select('*').order('sort_order'),
        supabase.from('stylist_calendars').select('*').order('sort_order'),
        supabase.from('gallery_images').select('*').order('sort_order'),
        supabase.from('testimonials').select('*').order('sort_order'),
        supabase.from('phone_numbers').select('*').order('display_order'),
        supabase.from('custom_sections').select('*, custom_section_elements(*)').order('sort_order'),
        supabase.from('site_page_sections').select('*').order('sort_order'),
        supabase.from('footer_sections').select('*').order('sort_order')
      ]);

      const settingsObj = {};
      if (settings) settings.forEach(s => settingsObj[s.key] = s.value);

      // Merge fetched sections with defaults
      let finalSections = fetchedSections || [];

      // Ensure ALL default sections exist in the list and have default properties
      DEFAULT_ORDER.forEach(def => {
        const existing = finalSections.find(s => s.id === def.id);
        if (!existing) {
          finalSections.push({ ...def, enabled: true });
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
          if (cs.enabled !== false && !finalSections.find(ps => ps.id === cs.id)) {
            finalSections.push({
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
        pageSections: finalSections,
        footerSections: fetchedFooterSections || [],
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
  const { settings, pageSections, loading } = siteData;
  // Get maintenance state from theme context
  const { maintenance, loading: themeLoading } = useTheme();
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    // Only show intro if it's the first time and an intro video/url exists
    const hasSeenIntro = localStorage.getItem('hasSeenIntro');
    if (hasSeenIntro !== 'true' && (settings.intro_video_url || settings.intro_video_custom_url)) {
      setShowIntro(true);
    }
  }, [settings.intro_video_url, settings.intro_video_custom_url]);

  if (loading || themeLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--primary)]">
        <Loader2 size={40} className="animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  // Kill Switch Check - Show maintenance screen if site is disabled or theme data is missing
  if (settings.site_enabled === 'false' || maintenance) {
    return <MaintenanceScreen />;
  }

  const handleIntroComplete = () => {
    localStorage.setItem('hasSeenIntro', 'true');
    setShowIntro(false);
  };

  // Determine intro video URL (prefer custom URL if provided)
  const introVideoUrl = settings.intro_video_custom_url || settings.intro_video_url;

  return (
    <>
      {/* Kill Switch Check - Show maintenance screen if site is disabled or theme missing */}
      {(siteData.settings.site_enabled === 'false' || maintenance) ? (
        <MaintenanceScreen />
      ) : (
        <>
          {showIntro && introVideoUrl && (
            <IntroVideo onComplete={handleIntroComplete} videoUrl={introVideoUrl} />
          )}

          {(!showIntro || !introVideoUrl) && (
            <main className="main-content">
              <Navbar settings={siteData.settings} customSections={siteData.customSections} pageSections={siteData.pageSections} />
              <Hero settings={siteData.settings} pageSections={siteData.pageSections} />

              <div className="flex-grow">
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
                    if (id === 'booking') {
                      if (siteData.settings.show_booking_section === 'false') return null;
                      return <BookingSystem key="booking" settings={siteData.settings} />;
                    }
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
              </div>

              <Footer settings={siteData.settings} phoneNumbers={siteData.phoneNumbers} pageSections={siteData.pageSections} footerSections={siteData.footerSections} />
              <Analytics />
              <SpeedInsights />
            </main>
          )}
        </>
      )}
    </>
  );
};

function App() {
  const siteData = useSiteData();

  useEffect(() => {
    if (siteData.settings.site_title) {
      document.title = siteData.settings.site_title;
    } else if (siteData.settings.business_name) {
      document.title = siteData.settings.business_name;
    }
  }, [siteData.settings.site_title, siteData.settings.business_name]);

  return (
    <BrowserRouter>
      <ScrollToTop />
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
        <CookieConsent />
      </div>
    </BrowserRouter>
  );
}

export default App
