import React, { useState } from 'react'
import IntroVideo from './components/IntroVideo'
import { Navbar, Hero, Services, TeamSection, PriceList, Contact, Footer } from './components/LandingPage'
import Gallery from './components/Gallery'
import BookingSystem from './components/BookingSystem'
import { Analytics } from '@vercel/analytics/react'
import './App.css'

function App() {
  const [showMainSite, setShowMainSite] = useState(() => {
    return localStorage.getItem('hasSeenIntro') === 'true';
  })

  const handleIntroComplete = () => {
    localStorage.setItem('hasSeenIntro', 'true');
    setShowMainSite(true);
  }

  return (
    <div className="app-container">
      {!showMainSite && (
        <IntroVideo onComplete={handleIntroComplete} />
      )}

      {showMainSite && (
        <main className="main-content">
          <Navbar />
          <Hero />
          <Services />
          <TeamSection />
          <PriceList />
          <BookingSystem />
          <Gallery />
          <Contact />
          <Footer />
          <Analytics />
        </main>
      )}
    </div>
  )
}

export default App
