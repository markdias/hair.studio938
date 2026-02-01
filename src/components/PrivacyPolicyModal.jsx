import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const PrivacyPolicyModal = ({ isOpen, onClose, content }) => {
    // Close on escape key
    React.useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Prevent body scroll when modal is open
    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            zIndex: 10000,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '20px',
                            overflowY: 'auto'
                        }}
                    >
                        {/* Modal Content */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                backgroundColor: 'var(--soft-cream)',
                                borderRadius: '12px',
                                maxWidth: '800px',
                                width: '100%',
                                maxHeight: '80vh',
                                display: 'flex',
                                flexDirection: 'column',
                                position: 'relative',
                                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                                border: '1px solid rgba(61, 43, 31, 0.1)'
                            }}
                        >
                            {/* Header */}
                            <div style={{
                                padding: '30px 40px 20px',
                                borderBottom: '2px solid var(--primary-brown)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <h2 style={{
                                    fontSize: '2rem',
                                    color: 'var(--primary-brown)',
                                    margin: 0,
                                    fontFamily: 'var(--font-heading)'
                                }}>
                                    Privacy Policy
                                </h2>
                                <button
                                    onClick={onClose}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '8px',
                                        color: 'var(--primary-brown)',
                                        transition: 'opacity 0.2s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.6'}
                                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                                >
                                    <X size={28} />
                                </button>
                            </div>

                            {/* Content */}
                            <div style={{
                                padding: '30px 40px',
                                overflowY: 'auto',
                                flex: 1,
                                color: 'var(--text-dark)',
                                lineHeight: '1.8',
                                fontSize: '1rem'
                            }}>
                                {content ? (
                                    <div style={{ whiteSpace: 'pre-wrap' }}>
                                        {content}
                                    </div>
                                ) : (
                                    <p style={{
                                        color: '#999',
                                        fontStyle: 'italic',
                                        textAlign: 'center',
                                        padding: '40px 0'
                                    }}>
                                        No privacy policy has been set yet. Please contact the administrator to add this content.
                                    </p>
                                )}
                            </div>

                            {/* Footer */}
                            <div style={{
                                padding: '20px 40px',
                                borderTop: '1px solid rgba(61, 43, 31, 0.1)',
                                display: 'flex',
                                justifyContent: 'flex-end'
                            }}>
                                <button
                                    onClick={onClose}
                                    className="btn-primary"
                                    style={{
                                        padding: '10px 32px'
                                    }}
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Mobile responsive styles */}
                    <style>{`
                        @media (max-width: 768px) {
                            .privacy-modal-header,
                            .privacy-modal-content,
                            .privacy-modal-footer {
                                padding-left: 20px !important;
                                padding-right: 20px !important;
                            }
                        }
                    `}</style>
                </>
            )}
        </AnimatePresence>
    );
};

export default PrivacyPolicyModal;
