import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Instagram, MapPin, Phone, Calendar, Menu, X, Mail, MessageCircle, Facebook, Music2 } from 'lucide-react';

const Navbar = ({ settings }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <nav className={isMenuOpen ? 'mobile-menu-active' : ''} style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            padding: isScrolled ? '15px 20px' : '30px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 1000,
            backgroundColor: (isScrolled || isMenuOpen) ? 'rgba(var(--primary-brown-rgb), 0.98)' : 'rgba(var(--primary-brown-rgb), 0.8)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.4s ease',
            color: 'var(--accent-cream)',
            boxSizing: 'border-box'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <img
                    src={settings.logo_url || "/logo.png"}
                    alt="938 Logo"
                    style={{
                        height: isScrolled ? `${(parseInt(settings.logo_size) || 85) * 0.7}px` : `${parseInt(settings.logo_size) || 85}px`,
                        width: isScrolled ? `${(parseInt(settings.logo_size) || 85) * 0.7}px` : `${parseInt(settings.logo_size) || 85}px`,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        transition: 'all 0.4s ease'
                    }}
                />
                <span style={{
                    fontSize: isScrolled ? '1.2rem' : '1.5rem',
                    fontWeight: '700',
                    letterSpacing: '1px',
                    transition: 'all 0.4s ease',
                    fontFamily: 'var(--font-heading)'
                }}>
                    {settings.business_name || 'STUDIO 938'}
                </span>
            </div>

            {/* Desktop Menu */}
            <div className="nav-links" style={{ display: 'flex', gap: '40px', alignItems: 'center', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px', fontWeight: '500' }}>
                <a href="#home">Home</a>
                {settings.show_services_section !== 'false' && (
                    <a href="#services">{settings.services_menu_name || 'Services'}</a>
                )}
                {settings.show_team_section !== 'false' && (
                    <a href="#team">{settings.team_menu_name || 'Team'}</a>
                )}
                {settings.show_pricing_section !== 'false' && (
                    <a href="#pricing">{settings.pricing_menu_name || 'Pricing'}</a>
                )}
                {settings.show_gallery_section !== 'false' && (
                    <a href="#gallery">{settings.gallery_menu_name || 'Gallery'}</a>
                )}
                {settings.show_testimonials_section === 'true' && (
                    <a href="#testimonials">{settings.testimonials_menu_name || 'Testimonials'}</a>
                )}
                <a href="#contact">Contact</a>
                <a href="#booking" className="btn-primary" style={{
                    padding: '10px 24px',
                    backgroundColor: 'var(--accent-cream)',
                    color: 'var(--primary-brown)',
                    textDecoration: 'none'
                }}>
                    Book Now
                </a>
            </div>

            {/* Mobile Menu Toggle */}
            <button className="mobile-menu-toggle" onClick={toggleMenu}>
                {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
            </button>

            {/* Mobile Menu Overlay */}
            <div className="nav-links-mobile">
                <a href="#home" onClick={toggleMenu}>Home</a>
                {settings.show_services_section !== 'false' && (
                    <a href="#services" onClick={toggleMenu}>{settings.services_menu_name || 'Services'}</a>
                )}
                {settings.show_team_section !== 'false' && (
                    <a href="#team" onClick={toggleMenu}>{settings.team_menu_name || 'Team'}</a>
                )}
                {settings.show_pricing_section !== 'false' && (
                    <a href="#pricing" onClick={toggleMenu}>{settings.pricing_menu_name || 'Pricing'}</a>
                )}
                {settings.show_gallery_section !== 'false' && (
                    <a href="#gallery" onClick={toggleMenu}>{settings.gallery_menu_name || 'Gallery'}</a>
                )}
                {settings.show_testimonials_section === 'true' && (
                    <a href="#testimonials" onClick={toggleMenu}>{settings.testimonials_menu_name || 'Testimonials'}</a>
                )}
                <a href="#contact" onClick={toggleMenu}>Contact</a>
                <a href="#booking" className="btn-primary" onClick={toggleMenu}>Book Now</a>
            </div>
        </nav>
    );
};

const Hero = ({ settings = {} }) => {
    return (
        <section id="home" style={{
            height: '100vh',
            width: '100%',
            position: 'relative',
            backgroundImage: `url("${settings.hero_bg_url || "/salon_bg.png"}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF'
        }}>
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(61, 43, 31, 0.6))',
                zIndex: 1
            }} />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
                style={{
                    position: 'relative',
                    zIndex: 2,
                    textAlign: 'center',
                    maxWidth: '800px',
                    padding: '0 15px',
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
                    color: 'var(--accent-cream)'
                }}>
                    {settings.business_name || 'STUDIO 938'}
                </div>
                <h1 className="responsive-title" style={{
                    fontSize: 'clamp(3.5rem, 8vw, 5.5rem)',
                    marginBottom: '1.5rem',
                    lineHeight: '1.1',
                    width: '100%'
                }}>{settings.hero_title || "Where Hair Dreams Come True"}</h1>
                <p className="responsive-p" style={{ fontSize: '1.25rem', marginBottom: '1.5rem', letterSpacing: '2px', fontWeight: '300', opacity: 0.9 }}>
                    {settings.hero_subtitle || "Luxury hair styling and bespoke treatments at 938 High Road."}
                </p>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    marginBottom: '2.5rem',
                    opacity: 0.8,
                    fontSize: '0.95rem',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                }}>
                    <Calendar size={18} />
                    <span>{settings.opening_hours || "Tuesday - Saturday: 9:00 AM - 6:00 PM"}</span>
                </div>
                <div className="hero-buttons" style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap', width: '100%', margin: '0 auto' }}>
                    <a href="#booking" className="btn-primary" style={{ textDecoration: 'none' }}>Book Now</a>
                    <a href="#services" style={{
                        border: '1px solid #FFFFFF',
                        color: '#FFFFFF',
                        padding: '12px 32px',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        fontWeight: '600',
                        textDecoration: 'none'
                    }}>
                        Our Services
                    </a>
                </div>
            </motion.div>
        </section>
    );
};

const Services = ({ services = [], settings = {} }) => {
    if (settings.show_services_section === 'false') return null;
    const iconMap = {
        Calendar: <Calendar style={{ color: 'var(--primary-brown)' }} />,
        MapPin: <MapPin style={{ color: 'var(--primary-brown)' }} />,
        Phone: <Phone style={{ color: 'var(--primary-brown)' }} />,
    };

    const displayServices = services.length > 0 ? services : [
        { title: "Hair Magic", description: "Expert coloring and transformations tailored to you.", icon_name: "Calendar" },
        { title: "Salon Life", description: "A premium experience in every detail of your visit.", icon_name: "MapPin" },
        { title: "Bespoke Styling", description: "Crafting the perfect look for your unique identity.", icon_name: "Phone" }
    ];

    return (
        <section id="services" style={{ padding: '120px 50px', backgroundColor: '#FFFFFF' }}>
            <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                <h2 style={{ fontSize: '3rem', color: 'var(--primary-brown)', marginBottom: '15px' }}>
                    {settings.services_heading_name || 'Our Services'}
                </h2>
                <div style={{ width: '60px', height: '2px', backgroundColor: 'var(--primary-brown)', margin: '0 auto' }}></div>
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
                        whileHover={{ y: -10 }}
                        style={{
                            padding: '50px 40px',
                            backgroundColor: 'var(--soft-cream)',
                            borderRadius: '8px',
                            textAlign: 'center',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <div style={{ marginBottom: '25px', display: 'flex', justifyContent: 'center' }}>
                            {iconMap[service.icon_name] || iconMap.Calendar}
                        </div>
                        <h3 style={{ fontSize: '1.8rem', marginBottom: '15px', color: 'var(--primary-brown)' }}>{service.title}</h3>
                        <p style={{ color: '#666', lineHeight: '1.8' }}>{service.description || service.desc}</p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

const TeamSection = ({ team = [], settings = {} }) => {
    if (settings.show_team_section === 'false') return null;
    const defaultTeam = [
        { name: "Jo", role: "Owner & Creative Director", description: "Expert in bespoke coloring and luxury extensions.", image_url: "/jo.png" },
        { name: "Viktor", role: "Master Stylist", description: "Specializing in precision cuts and seamless balayage.", image_url: "/viktor.png" },
        { name: "Nisha", role: "Senior Stylist", description: "Crafting glam transformations and signature styles.", image_url: "/nisha.png" }
    ];

    const displayTeam = team.length > 0 ? team : defaultTeam;

    return (
        <section id="team" style={{ padding: '120px 50px', backgroundColor: 'var(--soft-cream)' }}>
            <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                <h2 style={{ fontSize: '3rem', color: 'var(--primary-brown)', marginBottom: '15px' }}>
                    {settings.team_heading_name || 'Meet the Dream Team'}
                </h2>
                <div style={{ width: '60px', height: '2px', backgroundColor: 'var(--primary-brown)', margin: '0 auto' }}></div>
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
                                margin: '0 auto 30px',
                                border: '12px solid #FFFFFF',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                            }}
                        >
                            <img src={member.image_url || member.img} alt={member.stylist_name || member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </motion.div>
                        <h3 style={{ fontSize: '2rem', color: 'var(--primary-brown)', marginBottom: '5px' }}>{member.stylist_name || member.name}</h3>
                        <p style={{ color: 'var(--primary-brown)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '3px', fontSize: '0.85rem', marginBottom: '20px', opacity: 0.8 }}>{member.role}</p>
                        <p style={{ color: '#666', lineHeight: '1.8', maxWidth: '320px', margin: '0 auto', fontSize: '1.05rem' }}>{member.description || member.desc}</p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

const PriceList = ({ pricing = [], settings = {} }) => {
    if (settings.show_pricing_section === 'false') return null;
    // Transform flat pricing list into categories
    const categoriesMap = pricing.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push({ name: item.item_name, price: item.price });
        return acc;
    }, {});

    const displayCategories = pricing.length > 0
        ? Object.entries(categoriesMap).map(([title, items]) => ({ title, items }))
        : [
            {
                title: "CUT & STYLING",
                items: [
                    { name: "Wash cut & blowdry", price: "£50" },
                    { name: "Wash & cut", price: "£30-£35" },
                    { name: "Wash & blowdry", price: "£25-35" },
                    { name: "Styling (flat iron/curls)", price: "£20" },
                    { name: "Hair Up", price: "From £60" }
                ]
            },
            {
                title: "COLOURING",
                items: [
                    { name: "T-section highlights", price: "£50" },
                    { name: "Half head highlights", price: "£75" },
                    { name: "Full head highlights", price: "£95" },
                    { name: "Full head of baby lights", price: "£120" },
                    { name: "Balyage", price: "£180-£225" },
                    { name: "Full head tint", price: "From £70" },
                    { name: "Root tint", price: "From £50" },
                    { name: "Toner", price: "£25" }
                ]
            },
            {
                title: "HAIR TREATMENTS",
                items: [
                    { name: "Keratin blowdry", price: "£140-£150" },
                    { name: "Hair Botox", price: "£35" },
                    { name: "Olaplex", price: "£25" }
                ]
            },
            {
                title: "HAIR EXTENSIONS",
                items: [
                    { name: "Hair extensions on consultation", price: "£0" },
                    { name: "Extensions maintenance", price: "£100-150" }
                ]
            },
            {
                title: "MAKE UP",
                items: [
                    { name: "Natural make up", price: "£55" },
                    { name: "Full glam make up", price: "£65" },
                    { name: "Wedding make up packages available", price: "" }
                ]
            }
        ];

    return (
        <section id="pricing" style={{
            padding: '120px 50px',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }}>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                style={{
                    backgroundColor: '#EDE4DB',
                    maxWidth: '900px',
                    width: '100%',
                    padding: '60px 20px',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.05)',
                    position: 'relative',
                    boxSizing: 'border-box'
                }}
            >
                <h2 className="price-list-title" style={{
                    fontFamily: "'Great Vibes', cursive",
                    fontSize: '6rem',
                    color: 'var(--primary-brown)',
                    textAlign: 'center',
                    marginBottom: '60px',
                    fontWeight: '400',
                    lineHeight: '1'
                }}>
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
                                fontFamily: "'Inter', sans-serif",
                                fontSize: 'clamp(1.1rem, 3vw, 1.4rem)',
                                fontWeight: '700',
                                color: 'var(--primary-brown)',
                                letterSpacing: '2px',
                                marginBottom: '20px',
                                borderBottom: '1px solid rgba(61,43,31,0.1)',
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
                                        <span style={{ fontSize: '1rem', color: 'var(--primary-brown)', opacity: 0.8 }}>{item.name}</span>
                                        <span style={{ fontSize: '1rem', color: 'var(--primary-brown)', fontWeight: '600', whiteSpace: 'nowrap' }}>{item.price}</span>
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

const Contact = ({ settings = {} }) => {
    const phone = settings.phone || "07376 168558";
    const phoneLink = `tel:${phone.replace(/\s/g, '')}`;
    const whatsapp = settings.whatsapp || "07376 168558";
    const whatsappLink = `https://wa.me/44${whatsapp.replace(/\s|^0/g, '')}`;
    const email = settings.email || "hair.studio938@gmail.com";
    const address = settings.address || "938 High Road, London, N12 9RT";

    const activeCards = [
        { type: 'combined' },
        { type: 'email' },
        { type: 'address' },
        settings.instagram_url && { type: 'instagram' },
        settings.facebook_url && { type: 'facebook' },
        settings.tiktok_url && { type: 'tiktok' }
    ].filter(Boolean);

    const cardCount = activeCards.length;

    return (
        <section id="contact" style={{
            padding: '120px 20px',
            backgroundColor: 'var(--primary-brown)',
            color: 'var(--accent-cream)',
            textAlign: 'center'
        }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <h2 style={{ fontSize: 'clamp(2.5rem, 8vw, 4rem)', color: '#FFF', marginBottom: '15px' }}>Contact Us</h2>
                <div style={{ width: '60px', height: '2px', backgroundColor: 'var(--accent-cream)', margin: '0 auto 40px' }}></div>

                <div className="contact-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: cardCount === 4
                        ? 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))'
                        : 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '30px',
                    marginTop: '60px'
                }}>
                    <ContactCard
                        isCombined
                        label="Call or WhatsApp"
                        value={phone}
                        options={[
                            { icon: <Phone size={18} />, label: "Call Us", link: phoneLink },
                            { icon: <MessageCircle size={18} />, label: "WhatsApp", link: whatsappLink }
                        ]}
                    />
                    <ContactCard
                        icon={<Mail size={24} />}
                        label="Email"
                        value={email}
                        link={`mailto:${email}`}
                    />
                    <ContactCard
                        icon={<MapPin size={24} />}
                        label="Location"
                        value={address}
                        link={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                    />
                    {settings.instagram_url && (
                        <ContactCard
                            icon={<Instagram size={24} />}
                            label="Instagram"
                            value="Follow Us"
                            link={settings.instagram_url}
                        />
                    )}
                    {settings.facebook_url && (
                        <ContactCard
                            icon={<Facebook size={24} />}
                            label="Facebook"
                            value="Join Us"
                            link={settings.facebook_url}
                        />
                    )}
                    {settings.tiktok_url && (
                        <ContactCard
                            icon={<Music2 size={24} />}
                            label="TikTok"
                            value="Watch Us"
                            link={settings.tiktok_url}
                        />
                    )}
                </div>
            </div>
        </section>
    );
};

const ContactCard = ({ icon, label, value, link, isCombined, options }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const cardStyle = {
        padding: '40px 30px',
        backgroundColor: 'rgba(234, 224, 213, 0.05)',
        borderRadius: '16px',
        border: '1px solid rgba(234, 224, 213, 0.1)',
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
                whileHover={{ y: -5, backgroundColor: 'rgba(234, 224, 213, 0.08)' }}
                onClick={() => setIsExpanded(!isExpanded)}
                style={cardStyle}
            >
                <div style={{
                    display: 'flex',
                    gap: '15px',
                    color: 'var(--accent-cream)',
                    marginBottom: '15px'
                }}>
                    <Phone size={24} />
                    <MessageCircle size={24} />
                </div>
                {!isExpanded ? (
                    <>
                        <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.6, marginBottom: '5px' }}>{label}</div>
                        <div style={{ color: '#FFF', fontSize: '1.2rem', fontWeight: '600' }}>{value}</div>
                        <div style={{ fontSize: '0.7rem', marginTop: '10px', opacity: 0.4 }}>Click for options</div>
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
                                    backgroundColor: 'var(--accent-cream)',
                                    color: 'var(--primary-brown)',
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
            whileHover={{ y: -5, backgroundColor: 'rgba(234, 224, 213, 0.08)' }}
            style={cardStyle}
        >
            <div style={{ color: 'var(--accent-cream)', marginBottom: '15px' }}>{icon}</div>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.6, marginBottom: '5px' }}>{label}</div>
            <a href={link} target={link.startsWith('http') ? "_blank" : "_self"} rel="noopener noreferrer" style={{ color: '#FFF', fontSize: '1.1rem', fontWeight: '600', textDecoration: 'none', wordBreak: 'break-word' }}>{value}</a>
        </motion.div>
    );
};

const Testimonials = ({ testimonials = [], settings = {} }) => {
    if (settings.show_testimonials_section !== 'true' || testimonials.length === 0) return null;

    return (
        <section id="testimonials" style={{ padding: '120px 20px', backgroundColor: 'var(--soft-cream)' }}>
            <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                <h2 style={{ fontSize: '3rem', color: 'var(--primary-brown)', marginBottom: '15px' }}>
                    {settings.testimonials_section_name || 'Customer Testimonials'}
                </h2>
                <div style={{ width: '60px', height: '2px', backgroundColor: 'var(--primary-brown)', margin: '0 auto' }}></div>
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
                            backgroundColor: '#FFFFFF',
                            padding: '40px',
                            borderRadius: '16px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '20px',
                            border: '1px solid rgba(0,0,0,0.05)'
                        }}
                    >
                        {t.image_url && (
                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto' }}>
                                <img src={t.image_url} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                        )}
                        <div style={{ flex: 1 }}>
                            <p style={{ color: '#444', lineHeight: '1.8', fontStyle: 'italic', fontSize: '1.1rem', textAlign: 'center' }}>
                                "{t.description}"
                            </p>
                        </div>
                        {t.name && (
                            <p style={{ color: 'var(--primary-brown)', fontWeight: '700', textAlign: 'center', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                - {t.name}
                            </p>
                        )}
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

const Footer = ({ settings = {} }) => {
    return (
        <footer style={{ padding: '60px 20px', backgroundColor: 'var(--primary-brown)', color: 'var(--accent-cream)', textAlign: 'center' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '40px', borderTop: '1px solid rgba(234, 224, 213, 0.1)', opacity: 0.6, fontSize: '0.9rem' }}>
                &copy; {new Date().getFullYear()} Hair Studio 938. All rights reserved.
            </div>
        </footer>
    );
};

export { Navbar, Hero, Services, TeamSection, PriceList, Testimonials, Contact, Footer };
