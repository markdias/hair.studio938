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
            backgroundColor: (isScrolled || isMenuOpen) ? 'rgba(61, 43, 31, 0.98)' : 'transparent',
            backdropFilter: (isScrolled || isMenuOpen) ? 'blur(10px)' : 'none',
            transition: 'all 0.4s ease',
            color: (isScrolled || isMenuOpen) ? '#EAE0D5' : '#FFFFFF',
            boxSizing: 'border-box'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <img
                    src="/logo.png"
                    alt="938 Logo"
                    style={{ height: isScrolled ? '60px' : '85px', width: isScrolled ? '60px' : '85px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(234, 224, 213, 0.2)', transition: 'all 0.4s ease' }}
                />
            </div>

            {/* Desktop Menu */}
            <div className="nav-links" style={{ display: 'flex', gap: '40px', alignItems: 'center', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px', fontWeight: '500' }}>
                <a href="#home">Home</a>
                <a href="#services">Services</a>
                <a href="#team">Team</a>
                <a href="#pricing">Pricing</a>
                <a href="#gallery">Gallery</a>
                <a href="#contact">Contact</a>
                <a href="#booking" className="btn-primary" style={{
                    padding: '10px 24px',
                    backgroundColor: isScrolled ? '#EAE0D5' : '#3D2B1F',
                    color: isScrolled ? '#3D2B1F' : '#EAE0D5',
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
                <a href="#services" onClick={toggleMenu}>Services</a>
                <a href="#team" onClick={toggleMenu}>Team</a>
                <a href="#pricing" onClick={toggleMenu}>Pricing</a>
                <a href="#gallery" onClick={toggleMenu}>Gallery</a>
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
            backgroundImage: 'url("/salon_bg.png")',
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
                <h1 className="responsive-title" style={{
                    fontSize: 'clamp(3.5rem, 8vw, 5.5rem)',
                    marginBottom: '1.5rem',
                    lineHeight: '1.1',
                    width: '100%'
                }}>{settings.hero_title || "Where Hair Dreams Come True"}</h1>
                <p className="responsive-p" style={{ fontSize: '1.25rem', marginBottom: '2.5rem', letterSpacing: '2px', fontWeight: '300', opacity: 0.9 }}>
                    {settings.hero_subtitle || "Luxury hair styling and bespoke treatments at 938 High Road."}
                </p>
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

const Services = ({ services = [] }) => {
    const iconMap = {
        Calendar: <Calendar style={{ color: '#3D2B1F' }} />,
        MapPin: <MapPin style={{ color: '#3D2B1F' }} />,
        Phone: <Phone style={{ color: '#3D2B1F' }} />,
    };

    const displayServices = services.length > 0 ? services : [
        { title: "Hair Magic", description: "Expert coloring and transformations tailored to you.", icon_name: "Calendar" },
        { title: "Salon Life", description: "A premium experience in every detail of your visit.", icon_name: "MapPin" },
        { title: "Bespoke Styling", description: "Crafting the perfect look for your unique identity.", icon_name: "Phone" }
    ];

    return (
        <section id="services" style={{ padding: '120px 50px', backgroundColor: '#FFFFFF' }}>
            <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                <h2 style={{ fontSize: '3rem', color: '#3D2B1F', marginBottom: '15px' }}>Our Services</h2>
                <div style={{ width: '60px', height: '2px', backgroundColor: '#3D2B1F', margin: '0 auto' }}></div>
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
                            backgroundColor: '#F5F1ED',
                            borderRadius: '8px',
                            textAlign: 'center',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <div style={{ marginBottom: '25px', display: 'flex', justifyContent: 'center' }}>
                            {iconMap[service.icon_name] || iconMap.Calendar}
                        </div>
                        <h3 style={{ fontSize: '1.8rem', marginBottom: '15px', color: '#3D2B1F' }}>{service.title}</h3>
                        <p style={{ color: '#666', lineHeight: '1.8' }}>{service.description || service.desc}</p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

const TeamSection = ({ team = [] }) => {
    const defaultTeam = [
        { name: "Jo", role: "Owner & Creative Director", description: "Expert in bespoke coloring and luxury extensions.", image_url: "/jo.png" },
        { name: "Viktor", role: "Master Stylist", description: "Specializing in precision cuts and seamless balayage.", image_url: "/viktor.png" },
        { name: "Nisha", role: "Senior Stylist", description: "Crafting glam transformations and signature styles.", image_url: "/nisha.png" }
    ];

    const displayTeam = team.length > 0 ? team : defaultTeam;

    return (
        <section id="team" style={{ padding: '120px 50px', backgroundColor: '#F5F1ED' }}>
            <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                <h2 style={{ fontSize: '3rem', color: '#3D2B1F', marginBottom: '15px' }}>Meet the Dream Team</h2>
                <div style={{ width: '60px', height: '2px', backgroundColor: '#3D2B1F', margin: '0 auto' }}></div>
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
                        <h3 style={{ fontSize: '2rem', color: '#3D2B1F', marginBottom: '5px' }}>{member.stylist_name || member.name}</h3>
                        <p style={{ color: '#3D2B1F', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '3px', fontSize: '0.85rem', marginBottom: '20px', opacity: 0.8 }}>{member.role}</p>
                        <p style={{ color: '#666', lineHeight: '1.8', maxWidth: '320px', margin: '0 auto', fontSize: '1.05rem' }}>{member.description || member.desc}</p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

const PriceList = ({ pricing = [] }) => {
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
                    color: '#3D2B1F',
                    textAlign: 'center',
                    marginBottom: '60px',
                    fontWeight: '400',
                    lineHeight: '1'
                }}>
                    Price list
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
                                color: '#3D2B1F',
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
                                        <span style={{ fontSize: '1rem', color: '#3D2B1F', opacity: 0.8 }}>{item.name}</span>
                                        <span style={{ fontSize: '1rem', color: '#3D2B1F', fontWeight: '600', whiteSpace: 'nowrap' }}>{item.price}</span>
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

    return (
        <section id="contact" style={{
            padding: '120px 20px',
            backgroundColor: '#3D2B1F',
            color: '#EAE0D5',
            textAlign: 'center'
        }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h2 style={{ fontSize: 'clamp(2.5rem, 8vw, 4rem)', color: '#FFF', marginBottom: '15px' }}>Contact Us</h2>
                <div style={{ width: '60px', height: '2px', backgroundColor: '#EAE0D5', margin: '0 auto 40px' }}></div>

                <div className="contact-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '40px',
                    marginTop: '60px'
                }}>
                    <ContactItem
                        icon={<Phone size={24} />}
                        label="Call Us"
                        value={phone}
                        link={phoneLink}
                    />
                    <ContactItem
                        icon={<MessageCircle size={24} />}
                        label="WhatsApp"
                        value={whatsapp}
                        link={whatsappLink}
                    />
                    <ContactItem
                        icon={<Mail size={24} />}
                        label="Email"
                        value={email}
                        link={`mailto:${email}`}
                    />
                    {settings.instagram_url && (
                        <ContactItem
                            icon={<Instagram size={24} />}
                            label="Instagram"
                            value="Follow Us"
                            link={settings.instagram_url}
                        />
                    )}
                    {settings.facebook_url && (
                        <ContactItem
                            icon={<Facebook size={24} />}
                            label="Facebook"
                            value="Join Us"
                            link={settings.facebook_url}
                        />
                    )}
                    {settings.tiktok_url && (
                        <ContactItem
                            icon={<Music2 size={24} />}
                            label="TikTok"
                            value="Watch Us"
                            link={settings.tiktok_url}
                        />
                    )}
                </div>

                <div style={{ marginTop: '80px', opacity: 0.8 }}>
                    <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '1.1rem' }}>
                        <MapPin size={20} /> {address}
                    </p>
                </div>
            </div>
        </section>
    );
};

const ContactItem = ({ icon, label, value, link }) => (
    <div style={{ padding: '30px', backgroundColor: 'rgba(234, 224, 213, 0.05)', borderRadius: '12px' }}>
        <div style={{ color: '#EAE0D5', marginBottom: '15px', display: 'flex', justifyContent: 'center' }}>{icon}</div>
        <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.6, marginBottom: '5px' }}>{label}</div>
        <a href={link} style={{ color: '#FFF', fontSize: '1.2rem', fontWeight: '600', textDecoration: 'none' }}>{value}</a>
    </div>
);

const Footer = ({ settings = {} }) => {
    return (
        <footer style={{ padding: '80px 50px', backgroundColor: '#3D2B1F', color: '#EAE0D5' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '60px' }}>
                <div>
                    <img
                        src="/logo.png"
                        alt="938 Logo"
                        style={{ height: '140px', width: '140px', borderRadius: '50%', marginBottom: '25px', objectFit: 'cover', border: '1px solid rgba(234, 224, 213, 0.2)' }}
                    />
                    <p style={{ opacity: 0.8, lineHeight: '1.8' }}>Where Hair Dreams Come True! Follow us for fabulous hair moments!</p>
                    <div style={{ display: 'flex', gap: '20px', marginTop: '30px' }}>
                        {settings.instagram_url && (
                            <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer">
                                <Instagram size={24} />
                            </a>
                        )}
                        {settings.facebook_url && (
                            <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer">
                                <Facebook size={24} />
                            </a>
                        )}
                        {settings.tiktok_url && (
                            <a href={settings.tiktok_url} target="_blank" rel="noopener noreferrer">
                                <Music2 size={24} />
                            </a>
                        )}
                        {!settings.instagram_url && !settings.facebook_url && !settings.tiktok_url && (
                            <a href="https://www.instagram.com/hair.studio938/" target="_blank" rel="noopener noreferrer">
                                <Instagram size={24} />
                            </a>
                        )}
                    </div>
                </div>

                <div>
                    <h4 style={{ textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '25px' }}>Location</h4>
                    <p style={{ opacity: 0.8 }}>{settings.address || "938 High Road, London, N12 9RT"}</p>
                </div>

                <div>
                    <h4 style={{ textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '25px' }}>Opening Hours</h4>
                    <p style={{ opacity: 0.8 }}>{settings.opening_hours || "Tuesday - Saturday: 9:00 AM - 6:00 PM"}</p>
                </div>
            </div>

            <div style={{ maxWidth: '1200px', margin: '80px auto 0', paddingTop: '40px', borderTop: '1px solid rgba(234, 224, 213, 0.1)', textAlign: 'center', opacity: 0.6, fontSize: '0.9rem' }}>
                &copy; {new Date().getFullYear()} Hair Studio 938. All rights reserved.
            </div>
        </footer>
    );
};

export { Navbar, Hero, Services, TeamSection, PriceList, Contact, Footer };
