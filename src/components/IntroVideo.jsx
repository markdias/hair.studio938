import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const IntroVideo = ({ onComplete }) => {
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

  // Instagram direct video source
  const videoSource = "https://scontent-lhr8-1.cdninstagram.com/o1/v/t2/f2/m367/AQNVz1v-aWJ4kSrCjfsDCwv7jgGHTgjjAJ3Pw67LYbT4o6yjHJxDNewL_nMek-G_cJQUqrWFGjI-xeR8WAgyRCGuZhEnD7wZRbQIVxo.mp4?_nc_cat=108&_nc_sid=5e9851&_nc_ht=scontent-lhr8-1.cdninstagram.com&_nc_ohc=kOI9OFaicugQ7kNvwGJLeP0&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5JTlNUQUdSQU0uQ0xJUFMuQzIuNzIwLmRhc2hfYmFzZWxpbmVfMV92MSIsInhwdl9hc3NldF9pZCI6NDg5NDk2NzQwNjI2Mzk0LCJhc3NldF9hZ2VfZGF5cyI6NTA2LCJ2aV91c2VjYXNlX2lkIjoxMDA5OSwiZHVyYXRpb25fcyI6MzYsInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&ccb=17-1&vs=96ac43f134896f3c&_nc_vs=HBksFQIYQGlnX2VwaGVtZXJhbC8yQzQ0RDkzRTQxQTQzQTA4ODk0MUZEMzcyRjgwNkE4NV92aWRlb19kYXNoaW5pdC5tcDQVAALIARIAFQIYR2lnX3hwdl9yZWVsc19wZXJtYW5lbnRfc3JfcHJvZC84MzExMDg0MjAyMzA3OTQ5XzcxODk2MTg1ODU3MzA0MTY2ODUubXA0FQICyAESACgAGAAbAogHdXNlX29pbAExEnByb2dyZXNzaXZlX3JlY2lwZQExFQAAJrT_v_W6zN4BFQIoAkMyLBdAQiIMSbpeNRgSZGFzaF9iYXNlbGluZV8xX3YxEQB1_gdl5p0BAA&_nc_gid=ZDwt-Lyioi4_GUX8FiCmeA&_nc_zt=28&oh=00_Afont8LHH0BbtklXzqopnukmDyIw5Tky-C1DO6ZcCnappw&oe=6981B795";

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
            backgroundColor: '#3D2B1F',
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
            <source src={videoSource} type="video/mp4" />
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
              border: '1px solid #EAE0D5',
              color: '#EAE0D5',
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
