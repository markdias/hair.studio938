import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Instagram } from 'lucide-react';

const images = [
    '/instagram/img7.jpg',
    '/instagram/img2.jpg',
    '/instagram/img3.jpg',
    '/instagram/img4.jpg',
    '/instagram/img5.jpg',
    '/instagram/img6.jpg',
];

const Gallery = ({ images = [], settings = {} }) => {
    if (settings.show_gallery_section === 'false') return null;
    const defaultImages = [
        '/instagram/img7.jpg',
        '/instagram/img2.jpg',
        '/instagram/img3.jpg',
        '/instagram/img4.jpg',
        '/instagram/img5.jpg',
        '/instagram/img6.jpg',
    ];

    const displayImages = images.length > 0 ? images.map(img => img.image_url) : defaultImages;
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    useEffect(() => {
        if (displayImages.length === 0) return;
        const timer = setInterval(() => {
            nextSlide();
        }, 5000);
        return () => clearInterval(timer);
    }, [currentIndex, displayImages.length]);

    const slideVariants = {
        enter: (direction) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0,
            scale: 0.9
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.8,
                ease: [0.4, 0, 0.2, 1]
            }
        },
        exit: (direction) => ({
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0,
            scale: 0.9,
            transition: {
                duration: 0.8,
                ease: [0.4, 0, 0.2, 1]
            }
        })
    };

    const nextSlide = () => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % displayImages.length);
    };

    const prevSlide = () => {
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
    };

    if (displayImages.length === 0) return null;

    return (
        <section id="gallery" style={{
            padding: '120px 0',
            backgroundColor: 'var(--primary-brown)',
            overflow: 'hidden',
            position: 'relative'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', position: 'relative' }}>
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <h2 style={{
                        fontSize: 'clamp(2.5rem, 8vw, 4rem)',
                        color: 'var(--accent-cream)',
                        marginBottom: '15px'
                    }}>{settings.gallery_heading_name || 'Gallery'}</h2>
                    <div style={{ width: '60px', height: '2px', backgroundColor: 'var(--accent-cream)', margin: '0 auto 20px' }}></div>
                    <a
                        href="https://www.instagram.com/hair.studio938/"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: 'var(--accent-cream)',
                            opacity: 0.8,
                            fontSize: '1rem',
                            letterSpacing: '1px'
                        }}
                    >
                        <Instagram size={20} /> @hair.studio938
                    </a>
                </div>

                <div style={{
                    position: 'relative',
                    height: 'clamp(400px, 60vh, 700px)',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <AnimatePresence initial={false} custom={direction}>
                        <motion.div
                            key={currentIndex}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            style={{
                                position: 'absolute',
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <div style={{
                                width: 'min(100%, 800px)',
                                height: '100%',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                boxShadow: '0 30px 60px rgba(0,0,0,0.3)',
                                border: '8px solid rgba(234, 224, 213, 0.1)'
                            }}>
                                <img
                                    src={displayImages[currentIndex]}
                                    alt={`Instagram Post ${currentIndex + 1}`}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation Controls */}
                    <div style={{
                        position: 'absolute',
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'space-between',
                        zIndex: 10,
                        padding: '0 20px',
                        boxSizing: 'border-box'
                    }}>
                        <button
                            onClick={prevSlide}
                            style={{
                                backgroundColor: 'rgba(234, 224, 213, 0.2)',
                                backdropFilter: 'blur(5px)',
                                color: 'var(--accent-cream)',
                                width: '50px',
                                height: '50px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(234, 224, 213, 0.4)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(234, 224, 213, 0.2)'}
                        >
                            <ChevronLeft size={30} />
                        </button>
                        <button
                            onClick={nextSlide}
                            style={{
                                backgroundColor: 'rgba(234, 224, 213, 0.2)',
                                backdropFilter: 'blur(5px)',
                                color: 'var(--accent-cream)',
                                width: '50px',
                                height: '50px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(234, 224, 213, 0.4)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(234, 224, 213, 0.2)'}
                        >
                            <ChevronRight size={30} />
                        </button>
                    </div>
                </div>

                {/* Indicators */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '12px',
                    marginTop: '40px'
                }}>
                    {displayImages.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                setDirection(idx > currentIndex ? 1 : -1);
                                setCurrentIndex(idx);
                            }}
                            style={{
                                width: idx === currentIndex ? '30px' : '10px',
                                height: '10px',
                                borderRadius: '5px',
                                backgroundColor: idx === currentIndex ? 'var(--accent-cream)' : 'rgba(234, 224, 213, 0.3)',
                                transition: 'all 0.3s ease'
                            }}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Gallery;
