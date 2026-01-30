import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Instagram, MapPin, Phone, Calendar, Menu, X } from 'lucide-react';

const Navbar = () => {
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

const Hero = () => {
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
                    padding: '0 20px'
                }}
            >
                <h1 className="responsive-title" style={{ fontSize: '5rem', marginBottom: '1rem', lineHeight: '1' }}>Where Hair Dreams Come True</h1>
                <p className="responsive-p" style={{ fontSize: '1.25rem', marginBottom: '2.5rem', letterSpacing: '2px', fontWeight: '300', opacity: 0.9 }}>
                    Luxury hair styling and bespoke treatments at 938 High Road.
                </p>
                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
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

const Services = () => {
    const services = [
        { title: "Hair Magic", desc: "Expert coloring and transformations tailored to you.", icon: <Calendar style={{ color: '#3D2B1F' }} /> },
        { title: "Salon Life", desc: "A premium experience in every detail of your visit.", icon: <MapPin style={{ color: '#3D2B1F' }} /> },
        { title: "Bespoke Styling", desc: "Crafting the perfect look for your unique identity.", icon: <Phone style={{ color: '#3D2B1F' }} /> }
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
                {services.map((service, index) => (
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
                            {service.icon}
                        </div>
                        <h3 style={{ fontSize: '1.8rem', marginBottom: '15px', color: '#3D2B1F' }}>{service.title}</h3>
                        <p style={{ color: '#666', lineHeight: '1.8' }}>{service.desc}</p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

const TeamSection = () => {
    const team = [
        { name: "Jo", role: "Owner & Creative Director", desc: "Expert in bespoke coloring and luxury extensions.", img: "/jo.png" },
        { name: "Viktor", role: "Master Stylist", desc: "Specializing in precision cuts and seamless balayage.", img: "/viktor.png" },
        { name: "Nisha", role: "Senior Stylist", desc: "Crafting glam transformations and signature styles.", img: "/nisha.png" }
    ];

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
                {team.map((member, index) => (
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
                            <img src={member.img} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </motion.div>
                        <h3 style={{ fontSize: '2rem', color: '#3D2B1F', marginBottom: '5px' }}>{member.name}</h3>
                        <p style={{ color: '#3D2B1F', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '3px', fontSize: '0.85rem', marginBottom: '20px', opacity: 0.8 }}>{member.role}</p>
                        <p style={{ color: '#666', lineHeight: '1.8', maxWidth: '320px', margin: '0 auto', fontSize: '1.05rem' }}>{member.desc}</p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

const PriceList = () => {
    const categories = [
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
                    padding: '80px 100px',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.05)',
                    position: 'relative'
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

                <div className="pricing-grid-container" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '60px', position: 'relative' }}>
                    <div className="vertical-divider" style={{
                        position: 'absolute',
                        top: '0',
                        right: '180px',
                        width: '1px',
                        height: '100%',
                        backgroundColor: 'rgba(61, 43, 31, 0.2)'
                    }}></div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '50px' }}>
                        {categories.map((cat, idx) => (
                            <div key={idx}>
                                <h3 style={{
                                    fontFamily: "'Inter', sans-serif",
                                    fontSize: '1.4rem',
                                    fontWeight: '700',
                                    color: '#3D2B1F',
                                    letterSpacing: '2px',
                                    marginBottom: '20px'
                                }}>
                                    {cat.title}
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {cat.items.map((item, i) => (
                                        <div key={i} className="pricing-item" style={{ display: 'grid', gridTemplateColumns: '1fr 150px', alignItems: 'baseline' }}>
                                            <span style={{ fontSize: '1.05rem', color: '#3D2B1F', opacity: 0.8 }}>{item.name}</span>
                                            <span style={{ fontSize: '1.05rem', color: '#3D2B1F', fontWeight: '600', textAlign: 'right' }}>{item.price}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </section>
    );
};

const BookingSection = () => {
    return (
        <section id="booking" style={{
            padding: '120px 50px',
            backgroundColor: '#3D2B1F',
            color: '#EAE0D5',
            textAlign: 'center'
        }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h2 style={{ fontSize: '3.5rem', marginBottom: '30px', color: '#FFF' }}>Ready for Your Transformation?</h2>
                <p style={{ fontSize: '1.2rem', marginBottom: '50px', opacity: 0.9, lineHeight: '1.8' }}>
                    Join us at Hair Studio 938 for a luxury experience tailored to you. Whether it's a fresh cut, a bold color change, or a complete makeover, our experts are ready to make your hair dreams come true.
                </p>
                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <a href="https://www.instagram.com/hair.studio938/" target="_blank" className="btn-primary" style={{ backgroundColor: '#EAE0D5', color: '#3D2B1F', padding: '16px 40px', fontSize: '1.1rem' }}>
                        Book via Instagram DM
                    </a>
                    <a href="tel:+442084451234" className="btn-primary" style={{ border: '1px solid #EAE0D5', backgroundColor: 'transparent', padding: '16px 40px', fontSize: '1.1rem' }}>
                        Call the Salon
                    </a>
                </div>
                <p style={{ marginTop: '40px', opacity: 0.7, fontSize: '0.9rem' }}>
                    <MapPin size={16} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                    938 High Road, London, N12 9RT
                </p>
            </div>
        </section>
    );
};

const Footer = () => {
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
                        <a href="https://www.instagram.com/hair.studio938/" target="_blank">
                            <Instagram size={24} />
                        </a>
                    </div>
                </div>

                <div>
                    <h4 style={{ textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '25px' }}>Location</h4>
                    <p style={{ opacity: 0.8 }}>938 High Road, London<br />United Kingdom N12 9RT</p>
                </div>

                <div>
                    <h4 style={{ textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '25px' }}>Opening Hours</h4>
                    <p style={{ opacity: 0.8 }}>Tuesday - Saturday<br />9:00 AM - 6:00 PM</p>
                </div>
            </div>

            <div style={{ maxWidth: '1200px', margin: '80px auto 0', paddingTop: '40px', borderTop: '1px solid rgba(234, 224, 213, 0.1)', textAlign: 'center', opacity: 0.6, fontSize: '0.9rem' }}>
                &copy; {new Date().getFullYear()} Hair Studio 938. All rights reserved.
            </div>
        </footer>
    );
};

export { Navbar, Hero, Services, TeamSection, PriceList, BookingSection, Footer };
