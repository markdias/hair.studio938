import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Instagram, MapPin, Phone, Calendar, Menu, X, Mail, MessageCircle, Facebook, Music2 } from 'lucide-react';
import PrivacyPolicyModal from './PrivacyPolicyModal';
import TermsAndConditionsModal from './TermsAndConditionsModal';

const Navbar = ({ settings, customSections = [], pageSections = [] }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const location = useLocation();
    const isHomePage = location.pathname === '/';

    const getLink = (id) => {
        const section = pageSections.find(s => s.id === id);
        const isSeparate = section?.is_separate_page;

        if (isSeparate) {
            return `/section/${id}`;
        }
        return isHomePage ? `#${id}` : `/#${id}`;
    };

    const handleNavClick = (e, id) => {
        const section = pageSections.find(s => s.id === id);
        const isSeparate = section?.is_separate_page;

        if (isHomePage && !isSeparate) {
            // Default behavior for anchor links on home page
            return;
        }

        if (!isSeparate) {
            // If we are on a separate page and clicking a home anchor, standard behavior (Link to /#id) handles it,
            // but we might want to manually scroll if it doesn't work automatically. 
            // React Router's HashLink or simple a tag usually works.
        }

        setIsMenuOpen(false);
    };

    const isCompact = true;

    return (
        <nav className={isMenuOpen ? 'mobile-menu-active' : ''} style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            padding: isCompact ? '15px 20px' : '30px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 1000,
            backgroundColor: (isCompact || isMenuOpen) ? 'rgba(var(--navbar-bg-rgb, var(--primary-rgb)), 0.98)' : 'rgba(var(--navbar-bg-rgb, var(--primary-rgb)), 0.8)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.4s ease',
            color: 'var(--navbar-text, var(--accent))',
            boxSizing: 'border-box'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <img
                    src={settings.logo_url}
                    alt="938 Logo"
                    style={{
                        height: isCompact ? `${(parseInt(settings.logo_size) || 85) * 0.7}px` : `${parseInt(settings.logo_size) || 85}px`,
                        width: isCompact ? `${(parseInt(settings.logo_size) || 85) * 0.7}px` : `${parseInt(settings.logo_size) || 85}px`,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '1px solid rgba(80, 174, 36, 0.2)',
                        transition: 'all 0.4s ease'
                    }}
                />
                <span style={{
                    fontSize: isCompact ? '1.2rem' : '1.5rem',
                    fontWeight: '700',
                    letterSpacing: '1px',
                    transition: 'all 0.4s ease',
                    fontFamily: 'var(--font-heading)'
                }}>
                    {settings.business_name}
                </span>
            </div>

            {/* Desktop Menu */}
            <div className="nav-links" style={{ display: 'flex', gap: '40px', alignItems: 'center', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px', fontWeight: '500' }}>
                <Link to="/">Home</Link>
                {(() => {
                    const DEFAULT_ORDER = [
                        { id: 'services', label: 'Services', sort_order: 10 },
                        { id: 'team', label: 'Team', sort_order: 20 },
                        { id: 'pricing', label: 'Pricing', sort_order: 30 },
                        { id: 'gallery', label: 'Gallery', sort_order: 60 },
                        { id: 'testimonials', label: 'Testimonials', sort_order: 40 },
                        { id: 'contact', label: 'Contact', sort_order: 70 }
                    ];

                    let sectionsToRender = pageSections.length > 0
                        ? [...pageSections]
                        : DEFAULT_ORDER.map(s => ({ ...s, enabled: true }));

                    DEFAULT_ORDER.forEach(def => {
                        if (!sectionsToRender.find(s => s.id === def.id)) {
                            sectionsToRender.push({ ...def, enabled: true });
                        }
                    });

                    customSections.forEach(cs => {
                        if (cs.enabled !== false && !sectionsToRender.find(ps => ps.id === cs.id)) {
                            sectionsToRender.push({
                                id: cs.id,
                                is_custom: true,
                                enabled: true,
                                sort_order: 999
                            });
                        }
                    });

                    return sectionsToRender.sort((a, b) => (a.sort_order || 999) - (b.sort_order || 999)).map(section => {
                        const id = section.id;
                        if (section.enabled === false) return null;

                        let label = '';
                        if (id === 'services' && settings.show_services_section !== 'false') label = settings.services_menu_name || 'Services';
                        else if (id === 'team' && settings.show_team_section !== 'false') label = settings.team_menu_name || 'Team';
                        else if (id === 'pricing' && settings.show_pricing_section !== 'false') label = settings.pricing_menu_name || 'Pricing';
                        else if (id === 'gallery' && settings.show_gallery_section !== 'false') label = settings.gallery_menu_name || 'Gallery';
                        else if (id === 'testimonials' && settings.show_testimonials_section === 'true') label = settings.testimonials_menu_name || 'Testimonials';
                        else if (id === 'contact') label = settings.contact_menu_name || 'Contact';
                        else if (id === 'booking') return null;
                        else {
                            const custom = customSections.find(s => s.id === id);
                            if (custom && custom.enabled !== false) label = custom.menu_name;
                        }

                        if (!label) return null;

                        const isSeparate = section.is_separate_page;
                        const linkTarget = isSeparate ? `/section/${id}` : (isHomePage ? `#${id}` : `/#${id}`);

                        // Using standard anchor for hash links on same page to ensure scrolling works, Link for routes
                        if (isSeparate || !isHomePage) {
                            return <Link key={id} to={linkTarget}>{label}</Link>;
                        } else {
                            return <a key={id} href={linkTarget}>{label}</a>;
                        }
                    });
                })()}
                {(() => {
                    const bookingSection = pageSections.find(s => s.id === 'booking');
                    const isVisible = settings.show_booking_section !== 'false' && bookingSection?.enabled !== false;

                    if (isVisible) {
                        const isSeparate = bookingSection?.is_separate_page;
                        const style = {
                            padding: '10px 24px',
                            backgroundColor: 'var(--accent)',
                            color: 'var(--primary)',
                            textDecoration: 'none'
                        };

                        if (isSeparate) {
                            return <Link to="/section/booking" className="btn-primary" style={style}>{settings.booking_menu_name || 'Book Now'}</Link>;
                        }
                        return isHomePage ? (
                            <a href="#booking" className="btn-primary" style={style}>{settings.booking_menu_name || 'Book Now'}</a>
                        ) : (
                            <Link to="/#booking" className="btn-primary" style={style}>{settings.booking_menu_name || 'Book Now'}</Link>
                        );
                    }
                    return null;
                })()}
            </div>

            {/* Mobile Menu Toggle */}
            <button className="mobile-menu-toggle" onClick={toggleMenu}>
                {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
            </button>

            {/* Mobile Menu Overlay */}
            <div className="nav-links-mobile">
                <Link to="/" onClick={toggleMenu}>Home</Link>
                {(() => {
                    const DEFAULT_ORDER = [
                        { id: 'services', label: 'Services', sort_order: 10 },
                        { id: 'team', label: 'Team', sort_order: 20 },
                        { id: 'pricing', label: 'Pricing', sort_order: 30 },
                        { id: 'gallery', label: 'Gallery', sort_order: 60 },
                        { id: 'testimonials', label: 'Testimonials', sort_order: 40 },
                        { id: 'contact', label: 'Contact', sort_order: 70 }
                    ];

                    let sectionsToRender = pageSections.length >
                        0
                        ? [...pageSections]
                        : DEFAULT_ORDER.map(s => ({ ...s, enabled: true }));

                    DEFAULT_ORDER.forEach(def => {
                        if (!sectionsToRender.find(s => s.id === def.id)) {
                            sectionsToRender.push({ ...def, enabled: true });
                        }
                    });

                    customSections.forEach(cs => {
                        if (cs.enabled !== false && !sectionsToRender.find(ps => ps.id === cs.id)) {
                            sectionsToRender.push({
                                id: cs.id,
                                is_custom: true,
                                enabled: true,
                                sort_order: 999
                            });
                        }
                    });

                    return sectionsToRender.sort((a, b) => (a.sort_order || 999) - (b.sort_order || 999)).map(section => {
                        const id = section.id;
                        if (section.enabled === false) return null;

                        let label = '';
                        if (id === 'services' && settings.show_services_section !== 'false') label = settings.services_menu_name || 'Services';
                        else if (id === 'team' && settings.show_team_section !== 'false') label = settings.team_menu_name || 'Team';
                        else if (id === 'pricing' && settings.show_pricing_section !== 'false') label = settings.pricing_menu_name || 'Pricing';
                        else if (id === 'gallery' && settings.show_gallery_section !== 'false') label = settings.gallery_menu_name || 'Gallery';
                        else if (id === 'testimonials' && settings.show_testimonials_section === 'true') label = settings.testimonials_menu_name || 'Testimonials';
                        else if (id === 'booking' && settings.show_booking_section !== 'false') label = settings.booking_menu_name || 'Book Now';
                        else if (id === 'contact') label = settings.contact_menu_name || 'Contact';
                        else {
                            const custom = customSections.find(s => s.id === id);
                            if (custom && custom.enabled !== false) label = custom.menu_name;
                        }

                        if (!label) return null;

                        const isSeparate = section.is_separate_page;
                        const linkTarget = isSeparate ? `/section/${id}` : (isHomePage ? `#${id}` : `/#${id}`);

                        // Using standard anchor for hash links on same page to ensure scrolling works, Link for routes
                        if (isSeparate || !isHomePage) {
                            return <Link key={id} to={linkTarget} onClick={toggleMenu}>{label}</Link>;
                        } else {
                            return <a key={id} href={linkTarget} onClick={toggleMenu}>{label}</a>;
                        }
                    });
                })()}
                {(() => {
                    const bookingSection = pageSections.find(s => s.id === 'booking');
                    if (bookingSection?.enabled !== false) {
                        const isSeparate = bookingSection?.is_separate_page;
                        if (isSeparate) {
                            return <Link to="/section/booking" className="btn-primary" onClick={toggleMenu}>Book Now</Link>;
                        } else {
                            return isHomePage ? (
                                <a href="#booking" className="btn-primary" onClick={toggleMenu}>Book Now</a>
                            ) : (
                                <Link to="/#booking" className="btn-primary" onClick={toggleMenu}>Book Now</Link>
                            );
                        }
                    }
                    return null;
                })()}
            </div>
        </nav>
    );
};

const Hero = ({ settings = {}, pageSections = [] }) => {
    const isBookingEnabled = pageSections.find(s => s.id === 'booking')?.enabled !== false;

    return (
        <section id="home" style={{
            height: '100vh',
            width: '100%',
            position: 'relative',
            backgroundImage: `url("${settings.hero_bg_url}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            color: 'var(--white)',
            paddingLeft: 'max(5%, 40px)',
            paddingRight: 'max(5%, 40px)'
        }}>
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(to right, rgba(var(--black-rgb, 0,0,0), 0.8) 0%, rgba(var(--black-rgb, 0,0,0), 0.4) 50%, transparent 100%)',
                zIndex: 1
            }} />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
                style={{
                    position: 'relative',
                    zIndex: 2,
                    textAlign: 'left',
                    maxWidth: '900px',
                    padding: '0',
                    boxSizing: 'border-box'
                }}
            >
                <div style={{
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    letterSpacing: '4px',
                    marginBottom: '1rem',
                    opacity: 0.8,
                    fontWeight: '600',
                    color: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px'
                }}>
                    <div style={{ width: '40px', height: '1px', backgroundColor: 'var(--accent)', opacity: 0.6 }}></div>
                    {settings.business_name}
                </div>
                <h1 className="responsive-title" style={{
                    fontSize: 'clamp(3.5rem, 8vw, 5.5rem)',
                    marginBottom: '1.5rem',
                    lineHeight: '1.1',
                    width: '100%'
                }}>{settings.hero_title || ""}</h1>
                <p className="responsive-p" style={{ fontSize: '1.25rem', marginBottom: '2rem', letterSpacing: '1px', fontWeight: '300', opacity: 0.9, lineHeight: '1.6', maxWidth: '600px' }}>
                    {settings.hero_subtitle}
                </p>
                {settings.show_opening_hours !== 'false' && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        gap: '12px',
                        marginBottom: '2.5rem',
                        opacity: 0.8,
                        fontSize: '0.95rem',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                    }}>
                        <Calendar size={18} />
                        <span>{settings.opening_hours}</span>
                    </div>
                )}
                <div className="hero-buttons" style={{ display: 'flex', gap: '20px', justifyContent: 'flex-start', flexWrap: 'wrap', width: '100%', marginTop: '3rem' }}>
                    {(() => {
                        const bookingSection = pageSections.find(s => s.id === 'booking');
                        const isVisible = settings.show_booking_section !== 'false' && bookingSection?.enabled !== false;
                        if (!isVisible) return null;

                        const isSeparate = bookingSection?.is_separate_page;
                        if (isSeparate) {
                            return <Link to="/section/booking" className="btn-primary" style={{ textDecoration: 'none' }}>{settings.booking_menu_name || 'Book Now'}</Link>;
                        }
                        return <a href="#booking" className="btn-primary" style={{ textDecoration: 'none' }}>{settings.booking_menu_name || 'Book Now'}</a>;
                    })()}
                    {(() => {
                        const servicesSection = pageSections.find(s => s.id === 'services');
                        const isSeparate = servicesSection?.is_separate_page;
                        const style = {
                            border: '1px solid var(--white)',
                            color: 'var(--white)',
                            padding: '12px 32px',
                            borderRadius: '4px',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            fontWeight: '600',
                            textDecoration: 'none'
                        };

                        if (isSeparate) {
                            return <Link to="/section/services" style={style}>Our Services</Link>;
                        }
                        return <a href="#services" style={style}>Our Services</a>;
                    })()}
                </div>
            </motion.div>
        </section>
    );
};

const Services = ({ services = [], settings = {}, isSeparatePage = false }) => {
    if (settings.show_services_section === 'false') return null;
    const bgColor = settings.services_bg_color;
    const textColor = settings.services_text_color;

    const sectionStyle = {
        padding: isSeparatePage ? '40px 50px' : '120px 50px',
        backgroundColor: bgColor && bgColor !== 'auto' ? bgColor : 'var(--white)',
        color: textColor && textColor !== 'auto' ? textColor : 'inherit'
    };

    const headingStyle = {
        fontSize: '3rem',
        color: textColor && textColor !== 'auto' ? textColor : 'var(--primary)',
        marginBottom: '15px'
    };

    const lineStyle = {
        width: '60px',
        height: '2px',
        backgroundColor: textColor && textColor !== 'auto' ? textColor : 'var(--primary)',
        margin: '0 auto'
    };

    const iconMap = {
        Calendar: <Calendar style={{ color: textColor && textColor !== 'auto' ? textColor : 'var(--primary)' }} />,
        MapPin: <MapPin style={{ color: textColor && textColor !== 'auto' ? textColor : 'var(--primary)' }} />,
        Phone: <Phone style={{ color: textColor && textColor !== 'auto' ? textColor : 'var(--primary)' }} />,
    };

    const displayServices = services;

    return (
        <section id="services" style={sectionStyle}>
            <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                <h2 style={headingStyle}>
                    {settings.services_heading_name || 'Our Services'}
                </h2>
                <div style={lineStyle}></div>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '40px',
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                {displayServices.map((service, index) => (
                    <motion.div
                        key={index}
                        whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(var(--primary-rgb), 0.1)', borderColor: 'rgba(var(--primary-rgb), 0.3)' }}
                        style={{
                            padding: '60px 40px',
                            backgroundColor: 'var(--secondary)',
                            borderRadius: '12px',
                            textAlign: 'center',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            border: '1px solid rgba(var(--primary-rgb), 0.08)',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
                        }}
                    >
                        <div style={{ marginBottom: '25px', display: 'flex', justifyContent: 'center' }}>
                            {iconMap[service.icon_name] || iconMap.Calendar}
                        </div>
                        <h3 style={{ fontSize: '1.8rem', marginBottom: '15px', color: textColor && textColor !== 'auto' ? textColor : 'var(--primary)' }}>{service.title}</h3>
                        <p style={{ color: textColor && textColor !== 'auto' ? textColor : '#666', opacity: textColor && textColor !== 'auto' ? 0.8 : 1, lineHeight: '1.8' }}>{service.description || service.desc}</p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

const TeamSection = ({ team = [], settings = {}, isSeparatePage = false }) => {
    if (settings.show_team_section === 'false') return null;
    const bgColor = settings.team_bg_color;
    const textColor = settings.team_text_color;

    const sectionStyle = {
        padding: isSeparatePage ? '40px 50px' : '120px 50px',
        backgroundColor: bgColor && bgColor !== 'auto' ? bgColor : 'var(--secondary)',
        color: textColor && textColor !== 'auto' ? textColor : 'inherit'
    };

    const headingStyle = {
        fontSize: '3rem',
        color: textColor && textColor !== 'auto' ? textColor : 'var(--primary)',
        marginBottom: '15px'
    };

    const lineStyle = {
        width: '60px',
        height: '2px',
        backgroundColor: textColor && textColor !== 'auto' ? textColor : 'var(--primary)',
        margin: '0 auto'
    };

    const displayTeam = team;

    return (
        <section id="team" style={sectionStyle}>
            <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                <h2 style={headingStyle}>
                    {settings.team_heading_name || 'Meet the Dream Team'}
                </h2>
                <div style={lineStyle}></div>
            </div>

            <div className="responsive-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '80px',
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                {displayTeam.map((member, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.2 }}
                        style={{ textAlign: 'center' }}
                    >
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            style={{
                                width: 'min(280px, 70vw)',
                                height: 'min(280px, 70vw)',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                margin: '0 auto 35px',
                                border: '8px solid var(--white)',
                                boxShadow: '0 25px 50px rgba(var(--black-rgb, 0,0,0), 0.12)',
                                position: 'relative'
                            }}
                        >
                            <img src={member.image_url || member.img} alt={member.stylist_name || member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </motion.div>
                        <h3 style={{ fontSize: '1.8rem', color: textColor && textColor !== 'auto' ? textColor : 'var(--primary)', marginBottom: '8px', fontFamily: 'var(--font-heading)' }}>{member.stylist_name || member.name}</h3>
                        <p style={{ color: textColor && textColor !== 'auto' ? textColor : 'var(--primary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '4px', fontSize: '0.75rem', marginBottom: '20px', opacity: 0.7 }}>{member.role}</p>
                        <p style={{ color: textColor && textColor !== 'auto' ? textColor : '#666', opacity: textColor && textColor !== 'auto' ? 0.8 : 1, lineHeight: '1.8', maxWidth: '320px', margin: '0 auto', fontSize: '1rem', fontStyle: 'italic' }}>{member.description || member.desc}</p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

const PriceList = ({ pricing = [], settings = {}, isSeparatePage = false }) => {
    // Show on separate page even if section is hidden on landing page
    if (!isSeparatePage && settings.show_pricing_section === 'false') return null;

    const bgColor = settings.pricing_bg_color;
    const textColor = settings.pricing_text_color;
    const currency = settings.pricing_currency_symbol || '';

    const formatPrice = (priceStr, currencySymbol) => {
        if (!priceStr) return '';
        if (!currencySymbol) return priceStr;
        if (priceStr.includes(currencySymbol)) return priceStr;
        // Prepend currency symbol to each number group
        // Handles: "100" -> "£100", "From 100" -> "From £100", "100-200" -> "£100-£200"
        return priceStr.replace(/(\d+(\.\d+)?)/g, `${currencySymbol}$1`);
    };

    const sectionStyle = {
        padding: isSeparatePage ? '40px 50px' : '120px 50px',
        backgroundColor: bgColor && bgColor !== 'auto' ? bgColor : 'var(--white)',
        color: textColor && textColor !== 'auto' ? textColor : 'inherit',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    };

    const cardStyle = {
        backgroundColor: textColor && textColor !== 'auto' ? 'rgba(255,255,255,0.05)' : 'var(--accent)',
        maxWidth: '900px',
        width: '100%',
        padding: '80px 40px',
        boxShadow: '0 30px 60px rgba(var(--black-rgb, 0,0,0), 0.08)',
        position: 'relative',
        boxSizing: 'border-box',
        border: '1px solid rgba(var(--primary-rgb), 0.05)',
        borderRadius: '12px'
    };

    const headingStyle = {
        fontFamily: 'var(--font-heading)',
        fontSize: '6rem',
        color: textColor && textColor !== 'auto' ? textColor : 'var(--primary)',
        textAlign: 'center',
        marginBottom: '60px',
        fontWeight: '400',
        lineHeight: '1'
    };

    // Transform flat pricing list into categories
    const categoriesMap = pricing.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push({ name: item.item_name, price: item.price });
        return acc;
    }, {});

    const displayCategories = Object.entries(categoriesMap).map(([title, items]) => ({ title, items }));

    return (
        <section id="pricing" style={sectionStyle}>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                style={cardStyle}
            >
                <h2 className="price-list-title" style={headingStyle}>
                    {settings.pricing_heading_name || 'Price list'}
                </h2>

                <div className="pricing-info" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '40px',
                    width: '100%'
                }}>
                    {displayCategories.map((cat, idx) => (
                        <div key={idx} style={{ width: '100%' }}>
                            <h3 style={{
                                fontFamily: 'var(--font-heading)',
                                fontSize: 'clamp(1.1rem, 3vw, 1.4rem)',
                                fontWeight: '700',
                                color: textColor && textColor !== 'auto' ? textColor : 'var(--primary)',
                                letterSpacing: '2px',
                                marginBottom: '20px',
                                borderBottom: textColor && textColor !== 'auto' ? `1px solid ${textColor}22` : '1px solid rgba(var(--primary-rgb), 0.1)',
                                paddingBottom: '10px'
                            }}>
                                {cat.title}
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {cat.items.map((item, i) => (
                                    <div key={i} className="pricing-item" style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'baseline',
                                        gap: '20px'
                                    }}>
                                        <span style={{ fontSize: '1rem', color: textColor && textColor !== 'auto' ? textColor : 'var(--primary)', opacity: 0.8 }}>{item.name}</span>
                                        <span style={{ fontSize: '1rem', color: textColor && textColor !== 'auto' ? textColor : 'var(--primary)', fontWeight: '600', whiteSpace: 'nowrap' }}>
                                            {formatPrice(item.price, currency)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </section>
    );
};

const Contact = ({ settings = {}, phoneNumbers = [], isSeparatePage = false }) => {
    const bgColor = settings.contact_bg_color;
    const textColor = settings.contact_text_color;

    const email = settings.email || "";
    const address = settings.address || "";

    const sectionStyle = {
        padding: isSeparatePage ? '40px 20px' : '120px 20px',
        backgroundColor: bgColor && bgColor !== 'auto' ? bgColor : 'var(--text-main)',
        color: textColor && textColor !== 'auto' ? textColor : 'var(--accent)',
        textAlign: 'center'
    };

    const headingStyle = {
        fontSize: 'clamp(2.5rem, 8vw, 4rem)',
        color: textColor && textColor !== 'auto' ? textColor : 'var(--white)',
        marginBottom: '15px'
    };

    const lineStyle = {
        width: '60px',
        height: '2px',
        backgroundColor: textColor && textColor !== 'auto' ? textColor : 'var(--accent)',
        margin: '0 auto 40px'
    };

    // Build contact cards array
    const contactCards = [];

    // Add phone number cards - one card per phone number
    phoneNumbers.forEach((phoneItem, index) => {
        const number = phoneItem.number;
        const phoneLink = `tel:${number.replace(/\s/g, '')}`;
        const whatsappLink = `https://wa.me/44${number.replace(/\s|^0/g, '')}`;

        if (phoneItem.type === 'both') {
            contactCards.push({
                key: `phone-both-${index}`,
                isCombined: true,
                label: "Call or WhatsApp",
                value: number,
                options: [
                    { icon: <Phone size={18} />, label: "Call Us", link: phoneLink },
                    { icon: <MessageCircle size={18} />, label: "WhatsApp", link: whatsappLink }
                ]
            });
        } else if (phoneItem.type === 'phone') {
            contactCards.push({
                key: `phone-${index}`,
                icon: <Phone size={24} />,
                label: "Phone",
                value: number,
                link: phoneLink
            });
        } else if (phoneItem.type === 'whatsapp') {
            contactCards.push({
                key: `whatsapp-${index}`,
                icon: <MessageCircle size={24} />,
                label: "WhatsApp",
                value: number,
                link: whatsappLink
            });
        }
    });

    contactCards.push({
        key: 'email',
        icon: <Mail size={24} />,
        label: "Email",
        value: email,
        link: `mailto:${email}`
    });

    contactCards.push({
        key: 'address',
        icon: <MapPin size={24} />,
        label: "Location",
        value: address,
        link: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
    });

    if (settings.instagram_url) {
        contactCards.push({
            key: 'instagram',
            icon: <Instagram size={24} />,
            label: "Instagram",
            value: "Follow Us",
            link: settings.instagram_url
        });
    }

    if (settings.facebook_url) {
        contactCards.push({
            key: 'facebook',
            icon: <Facebook size={24} />,
            label: "Facebook",
            value: "Join Us",
            link: settings.facebook_url
        });
    }

    if (settings.tiktok_url) {
        contactCards.push({
            key: 'tiktok',
            icon: <Music2 size={24} />,
            label: "TikTok",
            value: "Watch Us",
            link: settings.tiktok_url
        });
    }

    // Calculate optimal number of columns for balanced rows
    const totalCards = contactCards.length;
    let columns;
    if (totalCards <= 3) {
        columns = totalCards;
    } else if (totalCards === 4) {
        columns = 2; // 2x2 grid
    } else if (totalCards === 5 || totalCards === 6) {
        columns = 3; // 3+2 or 3+3
    } else {
        columns = 4;
    }

    return (
        <section id="contact" style={sectionStyle}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <h2 style={headingStyle}>{settings.contact_heading_name || "Contact Us"}</h2>
                <div style={lineStyle}></div>

                <div className="contact-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${columns}, 1fr)`,
                    gap: '30px',
                    marginTop: '60px'
                }}>
                    {contactCards.map(({ key, ...cardProps }) => (
                        <ContactCard key={key} {...cardProps} textColor={textColor} />
                    ))}
                </div>

                {/* Full Width Google Map */}
                <div style={{
                    width: '100%',
                    height: '450px',
                    marginTop: '80px',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: '0 20px 50px rgba(var(--black-rgb, 0, 0, 0), 0.3)',
                    border: '1px solid rgba(var(--accent-rgb), 0.1)'
                }}>
                    <iframe
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        title={`${settings.business_name || 'Business'} Location`}
                        src={`https://www.google.com/maps?q=${encodeURIComponent(address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                    ></iframe>
                </div>
            </div>
        </section>
    );
};

const ContactCard = ({ icon, label, value, link, isCombined, options, textColor }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const cardStyle = {
        padding: '40px 30px',
        backgroundColor: textColor && textColor !== 'auto' ? 'rgba(var(--white-rgb, 255,255,255), 0.05)' : 'rgba(var(--accent-rgb), 0.05)',
        borderRadius: '16px',
        border: textColor && textColor !== 'auto' ? `1px solid ${textColor}22` : '1px solid rgba(var(--accent-rgb), 0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease',
        cursor: isCombined ? 'pointer' : 'default',
        minHeight: '180px',
        position: 'relative',
        overflow: 'hidden'
    };

    if (isCombined) {
        return (
            <motion.div
                whileHover={{ y: -5, backgroundColor: textColor && textColor !== 'auto' ? 'rgba(var(--white-rgb), 0.08)' : 'rgba(var(--accent-rgb), 0.08)' }}
                onClick={() => setIsExpanded(!isExpanded)}
                style={cardStyle}
            >
                <div style={{
                    display: 'flex',
                    gap: '15px',
                    color: textColor && textColor !== 'auto' ? textColor : 'var(--accent)',
                    marginBottom: '15px'
                }}>
                    <Phone size={24} />
                    <MessageCircle size={24} />
                </div>
                {!isExpanded ? (
                    <>
                        <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.6, marginBottom: '5px', color: textColor && textColor !== 'auto' ? textColor : 'inherit' }}>{label}</div>
                        <div style={{ color: textColor && textColor !== 'auto' ? textColor : 'var(--white)', fontSize: '1.2rem', fontWeight: '600' }}>{value}</div>
                        <div style={{ fontSize: '0.7rem', marginTop: '10px', opacity: 0.4, color: textColor && textColor !== 'auto' ? textColor : 'inherit' }}>Click for options</div>
                    </>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}
                    >
                        {options.map((opt, i) => (
                            <a
                                key={i}
                                href={opt.link}
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    padding: '12px',
                                    backgroundColor: 'var(--accent)',
                                    color: 'var(--primary)',
                                    borderRadius: '8px',
                                    textDecoration: 'none',
                                    fontWeight: '600',
                                    fontSize: '0.9rem'
                                }}
                            >
                                {opt.icon} {opt.label}
                            </a>
                        ))}
                    </motion.div>
                )}
            </motion.div>
        );
    }

    return (
        <motion.div
            whileHover={{ y: -5, backgroundColor: textColor && textColor !== 'auto' ? 'rgba(var(--white-rgb), 0.08)' : 'rgba(var(--accent-rgb), 0.08)' }}
            style={cardStyle}
        >
            <div style={{ color: textColor && textColor !== 'auto' ? textColor : 'var(--accent)', marginBottom: '15px' }}>{icon}</div>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.6, marginBottom: '5px', color: textColor && textColor !== 'auto' ? textColor : 'inherit' }}>{label}</div>
            <a href={link} target={link.startsWith('http') ? "_blank" : "_self"} rel="noopener noreferrer" style={{ color: textColor && textColor !== 'auto' ? textColor : '#FFF', fontSize: '1.1rem', fontWeight: '600', textDecoration: 'none', wordBreak: 'break-word' }}>{value}</a>
        </motion.div>
    );
};

const ContactOption = ({ icon, label, value, link, textColor }) => (
    <motion.div
        whileHover={{ x: 5, backgroundColor: textColor && textColor !== 'auto' ? 'rgba(var(--white-rgb), 0.08)' : 'rgba(var(--accent-rgb), 0.08)' }}
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            padding: '12px 15px',
            borderRadius: '10px',
            transition: 'background-color 0.2s ease',
            textDecoration: 'none'
        }}
    >
        <div style={{ color: textColor && textColor !== 'auto' ? textColor : 'rgba(var(--white-rgb), 0.7)' }}>{icon}</div>
        <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.8rem', opacity: 0.6, color: textColor && textColor !== 'auto' ? textColor : 'var(--white)', marginBottom: '2px' }}>{label}</div>
            <a href={link} target={link.startsWith('http') ? "_blank" : "_self"} rel="noopener noreferrer" style={{ color: textColor && textColor !== 'auto' ? textColor : 'var(--white)', fontSize: '1.1rem', fontWeight: '600', textDecoration: 'none', wordBreak: 'break-word' }}>{value}</a>
        </div>
    </motion.div>
);

const Testimonials = ({ testimonials = [], settings = {}, isSeparatePage = false }) => {
    if (settings.show_testimonials_section !== 'true' || testimonials.length === 0) return null;
    const bgColor = settings.testimonials_bg_color;
    const textColor = settings.testimonials_text_color;

    const sectionStyle = {
        padding: isSeparatePage ? '40px 20px' : '120px 20px',
        backgroundColor: bgColor && bgColor !== 'auto' ? bgColor : 'var(--secondary)',
        color: textColor && textColor !== 'auto' ? textColor : 'inherit'
    };

    const headingStyle = {
        fontSize: '3rem',
        color: textColor && textColor !== 'auto' ? textColor : 'var(--primary)',
        marginBottom: '15px'
    };

    const lineStyle = {
        width: '60px',
        height: '2px',
        backgroundColor: textColor && textColor !== 'auto' ? textColor : 'var(--primary)',
        margin: '0 auto'
    };

    return (
        <section id="testimonials" style={sectionStyle}>
            <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                <h2 style={headingStyle}>
                    {settings.testimonials_heading_name || 'Customer Testimonials'}
                </h2>
                <div style={lineStyle}></div>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '30px',
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                {testimonials.map((t, index) => (
                    <motion.div
                        key={t.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        style={{
                            backgroundColor: textColor && textColor !== 'auto' ? 'rgba(var(--white-rgb), 0.05)' : 'var(--white)',
                            padding: '40px',
                            borderRadius: '16px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '20px',
                            border: '1px solid rgba(var(--primary-rgb), 0.08)',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                        whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(var(--primary-rgb), 0.1)', borderColor: 'rgba(var(--primary-rgb), 0.3)' }}
                    >
                        {t.image_url && (
                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto' }}>
                                <img src={t.image_url} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                        )}
                        <div style={{ flex: 1 }}>
                            <p style={{ color: textColor && textColor !== 'auto' ? textColor : 'var(--text-main)', opacity: textColor && textColor !== 'auto' ? 0.8 : 1, lineHeight: '1.8', fontStyle: 'italic', fontSize: '1.1rem', textAlign: 'center' }}>
                                "{t.description}"
                            </p>
                        </div>
                        {t.name && (
                            <p style={{ color: textColor && textColor !== 'auto' ? textColor : 'var(--primary)', fontWeight: '700', textAlign: 'center', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                - {t.name}
                            </p>
                        )}
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

const Footer = ({ settings = {}, phoneNumbers = [], pageSections = [] }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const isHomePage = location.pathname === '/';
    const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
    const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

    const businessName = settings.business_name || '';
    const footerDescription = settings.footer_description || "";
    const email = settings.email || "";
    const address = settings.address || "";
    const phone = phoneNumbers.length > 0 ? phoneNumbers[0].number : (settings.phone || "");

    return (
        <>
            <footer style={{
                padding: '80px 20px 40px',
                backgroundColor: 'var(--secondary)',
                color: 'var(--primary)',
                borderTop: '1px solid rgba(61, 43, 31, 0.1)'
            }}>
                <div style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '40px',
                    paddingBottom: '20px'
                }}>
                    {/* Column 1: Brand */}
                    <div style={{ textAlign: 'left' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '400', fontFamily: 'var(--font-heading)', color: 'var(--text-main)', margin: '0 0 20px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            {settings.business_name || 'Hair Studio 938'}
                        </h3>
                        <p style={{ color: 'var(--text-main)', opacity: 0.7, lineHeight: '1.6', maxWidth: '250px', marginBottom: '25px', fontSize: '0.9rem' }}>
                            {settings.footer_description || "Premium hair styling and aesthetic treatments."}
                        </p>
                        {(() => {
                            const bookingSection = pageSections.find(s => s.id === 'booking');
                            const isSeparate = bookingSection?.is_separate_page;
                            const style = {
                                color: 'var(--primary)',
                                textDecoration: 'none',
                                fontWeight: '700',
                                fontSize: '0.85rem',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                borderBottom: '1px solid var(--primary)',
                                width: 'fit-content',
                                paddingBottom: '2px'
                            };

                            if (isSeparate) {
                                return <Link to="/section/booking" style={style}>Book Online</Link>;
                            }
                            return isHomePage ? (
                                <a href="#booking" style={style}>Book Online</a>
                            ) : (
                                <Link to="/#booking" style={style}>Book Online</Link>
                            );
                        })()}
                    </div>

                    {/* Column 2: Links */}
                    {(settings?.show_privacy_section !== 'false' || settings?.show_terms_section !== 'false') && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <h4 style={{
                                fontFamily: 'var(--font-heading)',
                                fontSize: '1.4rem',
                                margin: 0
                            }}>Important Links</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {settings?.show_privacy_section !== 'false' && (
                                    <button
                                        onClick={() => setIsPrivacyModalOpen(true)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: 'var(--primary)',
                                            fontSize: '0.95rem',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            padding: 0,
                                            opacity: 0.8,
                                            transition: 'opacity 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                                        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
                                    >
                                        {settings?.privacy_menu_name || "Privacy Policy"}
                                    </button>
                                )}
                                {settings?.show_terms_section !== 'false' && (
                                    <button
                                        onClick={() => setIsTermsModalOpen(true)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: 'var(--primary)',
                                            fontSize: '0.95rem',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            padding: 0,
                                            opacity: 0.8,
                                            transition: 'opacity 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                                        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
                                    >
                                        {settings?.terms_menu_name || "Terms & Conditions"}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Column 3: Contact Us */}
                    <div>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: '400', color: 'var(--text-main)', marginBottom: '25px', fontFamily: 'var(--font-heading)' }}>Contact Us</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', color: 'var(--text-main)', opacity: 0.7, fontSize: '0.95rem', lineHeight: '1.6' }}>
                            <p style={{ margin: 0, maxWidth: '200px' }}>
                                {settings.business_address || "Unit 5, 938 High Road, London, N12 9RT"}
                            </p>
                            {settings.business_email && (
                                <a href={`mailto:${settings.business_email}`} style={{ color: 'inherit', textDecoration: 'none' }}>{settings.business_email}</a>
                            )}
                            {settings.business_phone && (
                                <a href={`tel:${settings.business_phone}`} style={{ color: 'inherit', textDecoration: 'none' }}>{settings.business_phone}</a>
                            )}
                            {/* Additional Phones */}
                            {phoneNumbers.map((phone) => (
                                <a key={phone.id} href={phone.type === 'whatsapp' ? `https://wa.me/${phone.number.replace(/\+/g, '')}` : `tel:${phone.number}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                    {phone.number}
                                </a>
                            ))}

                            {settings.instagram_url && (
                                <a
                                    href={settings.instagram_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: 'var(--primary)', marginTop: '5px', width: 'fit-content' }}
                                >
                                    <Instagram size={20} />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Column 4: Opening Hours */}
                    {settings.show_opening_hours !== 'false' && (
                        <div>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: '400', color: 'var(--text-main)', marginBottom: '25px', fontFamily: 'var(--font-heading)' }}>Opening Hours</h4>
                            <p style={{ color: 'var(--text-main)', opacity: 0.7, lineHeight: '1.6', fontSize: '0.95rem' }}>
                                {settings.opening_hours || "Tue-Sat: 9 AM - 6 PM"}
                            </p>
                            {/* Dynamic Payment Icons */}
                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px', opacity: 0.8, flexWrap: 'wrap' }}>
                                {(() => {
                                    const paymentLogos = {
                                        'visa': 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg',
                                        'mastercard': 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg',
                                        'paypal': 'https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg',
                                        'applepay': 'https://upload.wikimedia.org/wikipedia/commons/b/b0/Apple_Pay_logo.svg',
                                        'googlepay': 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Google_Pay_Logo_%282020%29.svg',
                                        'amex': 'https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg',
                                    };
                                    const methods = (settings.payment_methods || 'visa,mastercard,paypal').split(',').filter(Boolean);
                                    return methods.map(method => (
                                        <img
                                            key={method}
                                            src={paymentLogos[method]}
                                            alt={method}
                                            style={{ height: '24px' }}
                                            onError={(e) => e.target.style.display = 'none'}
                                        />
                                    ));
                                })()}
                            </div>
                        </div>
                    )}
                </div>

                {/* Copyright */}
                <div style={{
                    maxWidth: '1200px',
                    margin: '20px auto 0',
                    paddingTop: '20px',
                    borderTop: '1px solid rgba(var(--primary-rgb), 0.1)',
                    textAlign: 'center',
                    fontSize: '0.85rem',
                    opacity: 0.5,
                    cursor: 'default'
                }}
                    onDoubleClick={() => navigate('/admin/dashboard')}
                    title="Double click to access Admin Dashboard">
                    &copy; {new Date().getFullYear()} {businessName}. All Rights Reserved.
                </div>
            </footer>

            {/* Modals */}
            <PrivacyPolicyModal
                isOpen={isPrivacyModalOpen}
                onClose={() => setIsPrivacyModalOpen(false)}
                content={settings.privacy_policy || ''}
                title={settings.privacy_heading_name}
            />
            <TermsAndConditionsModal
                isOpen={isTermsModalOpen}
                onClose={() => setIsTermsModalOpen(false)}
                content={settings.terms_and_conditions || ''}
                title={settings.terms_heading_name}
            />
        </>
    );
};



export { Navbar, Hero, Services, TeamSection, PriceList, Testimonials, Contact, Footer };
