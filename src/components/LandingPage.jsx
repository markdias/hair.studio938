import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Instagram, MapPin, Phone, Calendar, Menu, X, Mail, MessageCircle, Facebook, Music2, Scissors, Star, Sparkles, Palette, Feather, Droplet, Wind, Sun, Moon, Zap, Heart, Smile } from 'lucide-react';
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
            height: '96px',
            padding: '0 40px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 1000,
            backgroundColor: 'rgba(var(--navbar-bg-rgb), 0.95)',
            backdropFilter: 'blur(20px)',
            transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)',
            color: 'var(--navbar-text)',
            boxSizing: 'border-box',
            borderBottom: '1px solid rgba(var(--accent-rgb), 0.1)'
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
            <div className="nav-links" style={{
                display: 'flex',
                gap: '30px',
                alignItems: 'center',
                textTransform: 'uppercase',
                fontSize: '12px',
                letterSpacing: '2.4px',
                fontWeight: '500',
                fontFamily: 'var(--font-body)'
            }}>
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
                            backgroundColor: 'var(--primary)',
                            color: 'var(--white)',
                            textDecoration: 'none',
                            fontSize: '10px',
                            letterSpacing: '2px',
                            borderRadius: '4px',
                            border: '1px solid var(--accent)'
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
                background: 'linear-gradient(to right, rgba(var(--primary-rgb), 0.8) 0%, rgba(var(--primary-rgb), 0.4) 50%, transparent 100%)',
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
                    fontSize: 'clamp(3.5rem, 8vw, 6.5rem)',
                    marginBottom: '1.5rem',
                    lineHeight: '1.05',
                    width: '100%',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: '400',
                    letterSpacing: '-0.02em'
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
                        fontSize: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '2.4px',
                        fontWeight: '500',
                        fontFamily: 'var(--font-body)'
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
                            border: '1px solid var(--accent)',
                            color: 'var(--white)',
                            padding: '14px 32px',
                            borderRadius: '4px',
                            textTransform: 'uppercase',
                            letterSpacing: '2px',
                            fontWeight: '500',
                            textDecoration: 'none',
                            fontSize: '14px',
                            transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)'
                        };

                        if (isSeparate) {
                            return <Link to="/section/services" style={style} className="btn-secondary-outline">Our Services</Link>;
                        }
                        return <a href="#services" style={style} className="btn-secondary-outline">Our Services</a>;
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
        padding: isSeparatePage ? '64px 40px' : '128px 40px',
        backgroundColor: bgColor && bgColor !== 'auto' ? bgColor : 'var(--bg-primary)',
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
        Scissors: <Scissors style={{ color: textColor && textColor !== 'auto' ? textColor : 'var(--primary)' }} />,
        Star: <Star style={{ color: textColor && textColor !== 'auto' ? textColor : 'var(--primary)' }} />,
        Sparkles: <Sparkles style={{ color: textColor && textColor !== 'auto' ? textColor : 'var(--primary)' }} />,
        Palette: <Palette style={{ color: textColor && textColor !== 'auto' ? textColor : 'var(--primary)' }} />,
        Feather: <Feather style={{ color: textColor && textColor !== 'auto' ? textColor : 'var(--primary)' }} />,
        Droplet: <Droplet style={{ color: textColor && textColor !== 'auto' ? textColor : 'var(--primary)' }} />,
        Wind: <Wind style={{ color: textColor && textColor !== 'auto' ? textColor : 'var(--primary)' }} />,
        Sun: <Sun style={{ color: textColor && textColor !== 'auto' ? textColor : 'var(--primary)' }} />,
        Moon: <Moon style={{ color: textColor && textColor !== 'auto' ? textColor : 'var(--primary)' }} />,
        Zap: <Zap style={{ color: textColor && textColor !== 'auto' ? textColor : 'var(--primary)' }} />,
        Heart: <Heart style={{ color: textColor && textColor !== 'auto' ? textColor : 'var(--primary)' }} />,
        Smile: <Smile style={{ color: textColor && textColor !== 'auto' ? textColor : 'var(--primary)' }} />,
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
                            padding: service.image_url ? '0 0 40px 0' : '60px 40px',
                            backgroundColor: 'var(--bg-secondary)',
                            borderRadius: '4px',
                            textAlign: 'center',
                            transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)',
                            border: '1px solid rgba(var(--accent-rgb), 0.3)',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}
                    >
                        {service.image_url && (
                            <div style={{
                                width: '100%',
                                height: '500px',
                                marginBottom: '30px',
                                overflow: 'hidden'
                            }}>
                                <img
                                    src={service.image_url}
                                    alt={service.title}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                />
                            </div>
                        )}
                        <div style={{ padding: service.image_url ? '0 40px' : '0' }}>
                            {service.icon_name !== '' && (
                                <div style={{ marginBottom: '25px', display: 'flex', justifyContent: 'center' }}>
                                    {iconMap[service.icon_name] || iconMap.Calendar}
                                </div>
                            )}
                            <h3 style={{ fontSize: '1.8rem', marginBottom: '15px', color: textColor && textColor !== 'auto' ? textColor : 'var(--primary)' }}>{service.title}</h3>
                            <p style={{ color: textColor && textColor !== 'auto' ? textColor : '#666', opacity: textColor && textColor !== 'auto' ? 0.8 : 1, lineHeight: '1.8' }}>{service.description || service.desc}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

const TeamSection = ({ team = [], settings = {}, isSeparatePage = false }) => {
    const [hoveredMember, setHoveredMember] = useState(null);
    if (settings.show_team_section === 'false') return null;
    const bgColor = settings.team_bg_color;
    const textColor = settings.team_text_color;

    const sectionStyle = {
        padding: isSeparatePage ? '64px 40px' : '128px 40px',
        backgroundColor: bgColor && bgColor !== 'auto' ? bgColor : 'var(--bg-secondary)',
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
                            onHoverStart={() => setHoveredMember(index)}
                            onHoverEnd={() => setHoveredMember(null)}
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
                            <img
                                src={member.image_url || member.img}
                                alt={member.stylist_name || member.name}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    opacity: hoveredMember === index && member.hover_video_url ? 0 : 1,
                                    transition: 'opacity 0.4s ease'
                                }}
                            />
                            {member.hover_video_url && hoveredMember === index && (
                                <video
                                    src={member.hover_video_url}
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                />
                            )}
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
        backgroundColor: textColor && textColor !== 'auto' ? 'rgba(255,255,255,0.05)' : 'var(--white)',
        maxWidth: '960px',
        width: '100%',
        padding: '100px 60px',
        boxShadow: '0 40px 80px rgba(0,0,0,0.04)',
        position: 'relative',
        boxSizing: 'border-box',
        border: '1px solid rgba(var(--accent-rgb), 0.2)',
        borderRadius: '4px'
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
                                fontSize: '0.9rem',
                                fontWeight: '700',
                                color: textColor && textColor !== 'auto' ? textColor : 'var(--primary)',
                                letterSpacing: '3px',
                                textTransform: 'uppercase',
                                marginBottom: '20px',
                                borderBottom: textColor && textColor !== 'auto' ? `1px solid ${textColor}22` : '1px solid rgba(var(--primary-rgb), 0.1)',
                                paddingBottom: '15px'
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
        padding: '60px 40px',
        backgroundColor: textColor && textColor !== 'auto' ? 'rgba(var(--white-rgb, 255,255,255), 0.05)' : 'var(--bg-secondary)',
        borderRadius: '4px',
        border: textColor && textColor !== 'auto' ? `1px solid ${textColor}22` : '1px solid rgba(var(--accent-rgb), 0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1)',
        cursor: isCombined ? 'pointer' : 'default',
        minHeight: '180px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
    };

    if (isCombined) {
        return (
            <motion.div
                whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(var(--primary-rgb), 0.1)', borderColor: 'rgba(var(--primary-rgb), 0.3)' }}
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
            whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(var(--primary-rgb), 0.1)', borderColor: 'rgba(var(--primary-rgb), 0.3)' }}
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

const Footer = ({ settings = {}, phoneNumbers = [], pageSections = [], footerSections = [] }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const isHomePage = location.pathname === '/';
    const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
    const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

    const businessName = settings.business_name || '';

    // Default order if footerSections is empty
    const displaySections = footerSections.length > 0
        ? footerSections.filter(s => s.enabled)
        : [
            { id: 'brand', type: 'brand', sort_order: 10 },
            { id: 'links', type: 'links', sort_order: 20 },
            { id: 'contact', type: 'contact', sort_order: 30 },
            { id: 'hours', type: 'hours', sort_order: 40 }
        ];

    const sortedSections = [...displaySections].sort((a, b) => a.sort_order - b.sort_order);

    const renderSection = (section) => {
        const config = section.config || {};

        // Global styles now controlled by settings.footer_bg_color / footer_text_color
        // We no longer use per-section background/text colors

        const sectionStyle = {
            textAlign: 'left',
            padding: '0 10px',
        };

        const headingStyle = {
            fontSize: '1.1rem',
            fontWeight: '600',
            marginBottom: '20px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            // Color inherited from footer container
        };

        const textStyle = {
            lineHeight: '1.8',
            opacity: 0.9,
            margin: 0
            // Color inherited from footer container
        };

        const linkStyle = {
            color: 'inherit',
            textDecoration: 'none',
            transition: 'opacity 0.2s',
            // Color inherited from footer container
        };

        switch (section.type) {
            case 'brand':
                return (
                    <div style={{ textAlign: 'left', ...sectionStyle }}>
                        <h3 style={headingStyle}>
                            {settings.business_name || 'Hair Studio 938'}
                        </h3>
                        <p style={{ ...textStyle, maxWidth: '250px', marginBottom: '25px' }}>
                            {config.description || settings.footer_description || "Premium hair styling and aesthetic treatments."}
                        </p>
                        {(() => {
                            const bookingSection = pageSections.find(s => s.id === 'booking');
                            const isSeparate = bookingSection?.is_separate_page;
                            const bookBtnStyle = {
                                color: 'inherit',
                                textDecoration: 'none',
                                fontWeight: '700',
                                fontSize: '0.85rem',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                borderBottom: `1px solid currentColor`,
                                width: 'fit-content',
                                paddingBottom: '2px'
                            };

                            if (isSeparate) {
                                return <Link to="/section/booking" style={bookBtnStyle}>Book Online</Link>;
                            }
                            return isHomePage ? (
                                <a href="#booking" style={bookBtnStyle}>Book Online</a>
                            ) : (
                                <Link to="/#booking" style={bookBtnStyle}>Book Online</Link>
                            );
                        })()}
                    </div>
                );
            case 'links':
                if (settings?.show_privacy_section === 'false' && settings?.show_terms_section === 'false') return null;
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', ...sectionStyle }}>
                        <h4 style={headingStyle}>{section.heading || "Important Links"}</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', ...textStyle }}>
                            {settings?.show_privacy_section !== 'false' && config.show_privacy !== false && (
                                <button
                                    onClick={() => setIsPrivacyModalOpen(true)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'inherit',
                                        fontSize: '0.95rem',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        padding: 0,
                                        opacity: 0.8,
                                        transition: 'opacity 0.2s',
                                        width: 'fit-content'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
                                >
                                    {settings?.privacy_menu_name || "Privacy Policy"}
                                </button>
                            )}
                            {settings?.show_terms_section !== 'false' && config.show_terms !== false && (
                                <button
                                    onClick={() => setIsTermsModalOpen(true)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'inherit',
                                        fontSize: '0.95rem',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        padding: 0,
                                        opacity: 0.8,
                                        transition: 'opacity 0.2s',
                                        width: 'fit-content'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
                                >
                                    {settings?.terms_menu_name || "Terms & Conditions"}
                                </button>
                            )}
                        </div>
                    </div>
                );
            case 'contact':
                return (
                    <div style={sectionStyle}>
                        <h4 style={headingStyle}>
                            {section.heading || "Contact Us"}
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', ...textStyle, fontSize: '0.95rem' }}>
                            {config.show_address !== false && (
                                <p style={{ margin: 0, maxWidth: '200px' }}>
                                    {settings.address || settings.business_address || "Unit 5, 938 High Road, London, N12 9RT"}
                                </p>
                            )}
                            {config.show_email !== false && (settings.email || settings.business_email) && (
                                <a href={`mailto:${settings.email || settings.business_email}`} style={linkStyle}>{settings.email || settings.business_email}</a>
                            )}
                            {config.show_phone !== false && (settings.phone || settings.business_phone) && (
                                <a href={`tel:${settings.phone || settings.business_phone}`} style={linkStyle}>{settings.phone || settings.business_phone}</a>
                            )}
                            {/* Additional Phones */}
                            {config.show_phone !== false && phoneNumbers.map((phone) => (
                                <a key={phone.id} href={phone.type === 'whatsapp' ? `https://wa.me/${phone.number.replace(/\+/g, '')}` : `tel:${phone.number}`} style={linkStyle}>
                                    {phone.number}
                                </a>
                            ))}

                            {config.show_socials !== false && settings.instagram_url && (
                                <a
                                    href={settings.instagram_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: 'inherit', marginTop: '5px', width: 'fit-content' }}
                                >
                                    <Instagram size={20} />
                                </a>
                            )}
                        </div>
                    </div>
                );
            case 'hours':
                if (settings.show_opening_hours === 'false') return null;
                return (
                    <div style={sectionStyle}>
                        <h4 style={headingStyle}>
                            {section.heading || "Opening Hours"}
                        </h4>
                        <p style={{ ...textStyle, fontSize: '0.95rem', whiteSpace: 'pre-line' }}>
                            {config.hours_text || settings.opening_hours || "Tue-Sat: 9 AM - 6 PM"}
                        </p>
                        {/* Dynamic Payment Icons - usually don't need overrides */}
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
                );
            default:
                return null;
        }
    };

    return (
        <>
            <footer style={{
                padding: '80px 20px 40px',
                backgroundColor: settings.footer_bg_color || 'var(--secondary)',
                color: settings.footer_text_color || 'var(--primary)',
                borderTop: '1px solid rgba(61, 43, 31, 0.1)'
            }}>
                <div style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: '40px',
                    paddingBottom: '20px'
                }}>
                    {sortedSections.map(section => (
                        <div key={section.id} style={{ flex: '1 1 250px', maxWidth: '300px' }}>
                            {renderSection(section)}
                        </div>
                    ))}
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
