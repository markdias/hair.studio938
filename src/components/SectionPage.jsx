import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Navbar, Services, TeamSection, PriceList, Testimonials, Contact, Footer } from './LandingPage';
import Gallery from './Gallery';
import BookingSystem from './BookingSystem';
import CustomSection from './CustomSection';
import Breadcrumbs from './Breadcrumbs';
import { Loader2 } from 'lucide-react';

const SectionPage = ({ siteData }) => {
    const { sectionId } = useParams();
    const { settings, customSections, pageSections, loading } = siteData;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[var(--primary-brown)]">
                <Loader2 size={40} className="animate-spin text-[var(--accent-cream)]" />
            </div>
        );
    }

    const section = pageSections.find(s => s.id === sectionId);

    // Fallback if section doesn't exist or isn't a separate page
    if (!section || !section.is_separate_page) return <Navigate to="/" />;

    // Helper to determine styles based on section ID and settings
    const getSectionStyles = (id) => {
        let bgColor = 'var(--primary-brown)';
        let textColor = 'var(--accent-cream)'; // Default for dark backgrounds like primary-brown

        switch (id) {
            case 'services':
                bgColor = (settings.services_bg_color && settings.services_bg_color !== 'auto') ? settings.services_bg_color : '#FFFFFF';
                textColor = (settings.services_text_color && settings.services_text_color !== 'auto') ? settings.services_text_color : 'var(--primary-brown)';
                break;
            case 'team':
                bgColor = (settings.team_bg_color && settings.team_bg_color !== 'auto') ? settings.team_bg_color : 'var(--soft-cream)';
                textColor = (settings.team_text_color && settings.team_text_color !== 'auto') ? settings.team_text_color : 'var(--primary-brown)';
                break;
            case 'pricing':
                bgColor = (settings.pricing_bg_color && settings.pricing_bg_color !== 'auto') ? settings.pricing_bg_color : '#FFFFFF';
                textColor = (settings.pricing_text_color && settings.pricing_text_color !== 'auto') ? settings.pricing_text_color : 'var(--primary-brown)';
                break;
            case 'testimonials':
                bgColor = (settings.testimonials_bg_color && settings.testimonials_bg_color !== 'auto') ? settings.testimonials_bg_color : 'var(--soft-cream)';
                textColor = (settings.testimonials_text_color && settings.testimonials_text_color !== 'auto') ? settings.testimonials_text_color : 'var(--primary-brown)';
                break;
            case 'contact':
                bgColor = (settings.contact_bg_color && settings.contact_bg_color !== 'auto') ? settings.contact_bg_color : 'var(--text-dark)';
                textColor = (settings.contact_text_color && settings.contact_text_color !== 'auto') ? settings.contact_text_color : 'var(--accent-cream)';
                break;
            case 'gallery':
                bgColor = (settings.gallery_bg_color && settings.gallery_bg_color !== 'auto') ? settings.gallery_bg_color : 'var(--primary-brown)';
                textColor = (settings.gallery_text_color && settings.gallery_text_color !== 'auto') ? settings.gallery_text_color : 'var(--accent-cream)';
                break;
            case 'booking':
                bgColor = (settings.booking_bg_color && settings.booking_bg_color !== 'auto') ? settings.booking_bg_color : 'var(--soft-cream)';
                textColor = (settings.booking_text_color && settings.booking_text_color !== 'auto') ? settings.booking_text_color : 'var(--primary-brown)';
                break;
            default:
                const custom = customSections.find(s => s.id === id);
                if (custom) {
                    bgColor = custom.background_color || '#FFFFFF'; // Default custom sections to white base if not set
                    textColor = custom.text_color || 'var(--primary-brown)';
                    // Special case: if background is transparent/missing, assume landing page default (soft cream/white)
                    if (!custom.background_color || custom.background_color === 'transparent') {
                        bgColor = '#FFFFFF';
                    }
                }
                break;
        }
        return { backgroundColor: bgColor, color: textColor };
    };

    const styles = getSectionStyles(sectionId);

    const renderSection = () => {
        switch (sectionId) {
            case 'services':
                return <Services services={siteData.services} settings={settings} />;
            case 'team':
                return <TeamSection team={siteData.team} settings={settings} />;
            case 'pricing':
                return <PriceList pricing={siteData.pricing} settings={settings} />;
            case 'testimonials':
                return <Testimonials testimonials={siteData.testimonials} settings={settings} />;
            case 'gallery':
                return <Gallery images={siteData.gallery} settings={settings} />;
            case 'booking':
                return <BookingSystem settings={settings} />;
            case 'contact':
                return <Contact settings={settings} phoneNumbers={siteData.phoneNumbers} />;
            default:
                const custom = customSections.find(s => s.id === sectionId);
                if (custom) {
                    return <CustomSection data={custom} />;
                }
                return <div>Section not found</div>;
        }
    };

    return (
        <div className="section-page min-h-screen transition-colors duration-300" style={{ backgroundColor: styles.backgroundColor }}>
            <Navbar settings={siteData.settings} customSections={siteData.customSections} pageSections={siteData.pageSections} />
            <Breadcrumbs label={section.label} textColor={styles.color} />
            <div className="section-content">
                {renderSection()}
            </div>
            <Footer settings={siteData.settings} phoneNumbers={siteData.phoneNumbers} pageSections={siteData.pageSections} />
        </div>
    );
};

export default SectionPage;
