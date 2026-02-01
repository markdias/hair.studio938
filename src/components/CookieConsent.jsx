import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';

const CookieConsent = () => {
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        // Check if user has already made a choice
        const consent = localStorage.getItem('cookieConsent');
        if (!consent) {
            // Show banner after a short delay for better UX
            setTimeout(() => {
                setShowBanner(true);
            }, 1000);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookieConsent', 'accepted');
        setShowBanner(false);
    };

    const handleDecline = () => {
        localStorage.setItem('cookieConsent', 'declined');
        setShowBanner(false);
    };

    return (
        <AnimatePresence>
            {showBanner && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    style={{
                        position: 'fixed',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        zIndex: 9999,
                        padding: '20px',
                        backgroundColor: 'var(--primary-brown)',
                        color: 'var(--accent-cream)',
                        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.3)',
                        borderTop: '1px solid rgba(234, 224, 213, 0.2)'
                    }}
                >
                    <div style={{
                        maxWidth: '1200px',
                        margin: '0 auto',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '20px',
                        flexWrap: 'wrap'
                    }}>
                        {/* Icon and Message */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px',
                            flex: '1 1 300px'
                        }}>
                            <Cookie size={32} style={{ flexShrink: 0, opacity: 0.9 }} />
                            <div>
                                <p style={{
                                    margin: 0,
                                    fontSize: '1rem',
                                    lineHeight: '1.6',
                                    fontWeight: '400'
                                }}>
                                    We use cookies to enhance your browsing experience and analyze our traffic. By clicking "Accept", you consent to our use of cookies.
                                    {/* Uncomment when privacy policy is available */}
                                    {/* <a 
                                        href="/privacy-policy" 
                                        style={{ 
                                            color: 'var(--accent-cream)', 
                                            textDecoration: 'underline',
                                            marginLeft: '5px'
                                        }}
                                    >
                                        Learn more
                                    </a> */}
                                </p>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div style={{
                            display: 'flex',
                            gap: '12px',
                            flexShrink: 0
                        }}>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleDecline}
                                style={{
                                    padding: '10px 24px',
                                    backgroundColor: 'transparent',
                                    color: 'var(--accent-cream)',
                                    border: '1px solid var(--accent-cream)',
                                    borderRadius: '4px',
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                Decline
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleAccept}
                                style={{
                                    padding: '10px 24px',
                                    backgroundColor: 'var(--accent-cream)',
                                    color: 'var(--primary-brown)',
                                    border: '1px solid var(--accent-cream)',
                                    borderRadius: '4px',
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                Accept
                            </motion.button>
                        </div>
                    </div>

                    {/* Responsive styles for mobile */}
                    <style>{`
                        @media (max-width: 768px) {
                            .cookie-consent-container {
                                flex-direction: column;
                                align-items: flex-start;
                            }
                            .cookie-consent-buttons {
                                width: 100%;
                                justify-content: stretch;
                            }
                            .cookie-consent-buttons button {
                                flex: 1;
                            }
                        }
                    `}</style>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CookieConsent;
