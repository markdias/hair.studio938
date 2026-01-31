import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const IntroVideo = ({ onComplete, videoUrl }) => {
  const [isVideoVisible, setIsVideoVisible] = useState(true);
  const videoRef = useRef(null);

  // Set playback speed
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 1.5; // Speed up the video (1.5x)
    }
  }, []);

  const handleSkip = () => {
    setIsVideoVisible(false);
    setTimeout(onComplete, 1000);
  };

  // Fallback timer
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSkip();
    }, 15000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  // Use the passed videoUrl prop instead of hardcoded URL

  return (
    <AnimatePresence>
      {isVideoVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'var(--primary-brown)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            style={{
              minWidth: '100%',
              minHeight: '100%',
              objectFit: 'cover',
            }}
            onEnded={handleSkip}
          >
            <source src={videoUrl} type="video/mp4" />
          </video>


          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            onClick={handleSkip}
            style={{
              position: 'absolute',
              bottom: '40px',
              right: '40px',
              padding: '12px 24px',
              backgroundColor: 'rgba(234, 224, 213, 0.2)',
              backdropFilter: 'blur(10px)',
              border: '1px solid var(--accent-cream)',
              color: 'var(--accent-cream)',
              borderRadius: '40px',
              fontSize: '0.8rem',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              cursor: 'pointer',
              zIndex: 10000,
              transition: 'all 0.3s ease'
            }}
          >
            Skip Intro
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IntroVideo;
