import React from 'react';
import { AlertTriangle, Wrench, Mail, Phone } from 'lucide-react';

const MaintenanceScreen = () => {
    return (
        <div style={{
            minHeight: '100vh',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--soft-cream)',
            padding: '20px',
            boxSizing: 'border-box'
        }}>
            <div style={{
                maxWidth: '600px',
                width: '100%',
                textAlign: 'center',
                padding: '60px 40px',
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
                border: '2px solid var(--primary-brown)'
            }}>
                {/* Icon */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '30px'
                }}>
                    <div style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--soft-cream)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '3px solid var(--primary-brown)'
                    }}>
                        <Wrench size={48} style={{ color: 'var(--primary-brown)' }} />
                    </div>
                </div>

                {/* Title */}
                <h1 style={{
                    fontSize: '2.5rem',
                    color: 'var(--primary-brown)',
                    marginBottom: '20px',
                    fontFamily: 'var(--font-heading)',
                    lineHeight: '1.2'
                }}>
                    We'll Be Back Soon
                </h1>

                {/* Message */}
                <p style={{
                    fontSize: '1.1rem',
                    color: '#666',
                    lineHeight: '1.8',
                    marginBottom: '40px'
                }}>
                    We're currently performing scheduled maintenance to improve your experience.
                    We'll be back up and running shortly.
                </p>

                {/* Divider */}
                <div style={{
                    height: '2px',
                    backgroundColor: 'var(--soft-cream)',
                    marginBottom: '30px'
                }} />

                {/* Contact Info */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '15px',
                    alignItems: 'center'
                }}>
                    <p style={{
                        fontSize: '0.95rem',
                        color: '#888',
                        marginBottom: '5px'
                    }}>
                        For urgent matters, please contact us:
                    </p>

                    <div style={{
                        display: 'flex',
                        gap: '30px',
                        flexWrap: 'wrap',
                        justifyContent: 'center'
                    }}>
                        <a
                            href="tel:02084451234"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                color: 'var(--primary-brown)',
                                textDecoration: 'none',
                                fontSize: '0.95rem',
                                fontWeight: '500',
                                transition: 'opacity 0.3s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                        >
                            <Phone size={18} />
                            <span>Call Us</span>
                        </a>

                        <a
                            href="mailto:hair.studio938@gmail.com"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                color: 'var(--primary-brown)',
                                textDecoration: 'none',
                                fontSize: '0.95rem',
                                fontWeight: '500',
                                transition: 'opacity 0.3s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                        >
                            <Mail size={18} />
                            <span>Email Us</span>
                        </a>
                    </div>
                </div>

                {/* Thank You Message */}
                <p style={{
                    marginTop: '40px',
                    fontSize: '0.9rem',
                    color: '#999',
                    fontStyle: 'italic'
                }}>
                    Thank you for your patience!
                </p>
            </div>

            {/* Responsive styles */}
            <style>{`
                @media (max-width: 768px) {
                    h1 {
                        font-size: 2rem !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default MaintenanceScreen;
