import React, { useState, useEffect } from 'react'

function SplashScreen({ onEnter, onLoad }) {
  const [show, setShow] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)

  const handleEnter = () => {
    setFadeOut(true)
    setTimeout(() => {
      onEnter()
    }, 1000)
  }

  if (!show) return null

  return (
    <div className={`splash-screen ${fadeOut ? 'fade-out' : ''}`}>
      <div className="splash-background">
        <img
          src="/assets/splash-screen.png"
          alt="All Roads Lead to Rome"
          className="splash-image"
        />
        <div className="splash-overlay" />
      </div>

      <div className="splash-content">
        <h1 className="game-title">
          <span className="title-line">ALL ROADS</span>
          <span className="title-line lead">LEAD TO</span>
          <span className="title-line rome">ROME</span>
        </h1>

        <p className="tagline">
          Rise from the sands of Capua to the golden throne of the Colosseum
        </p>

        <div className="button-group" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          <button
            className="enter-button"
            onClick={handleEnter}
          >
            <span className="button-text">ENTER THE ARENA</span>
            <span className="button-icon">⚔️</span>
          </button>

          <button
            className="load-button"
            onClick={() => {
              setFadeOut(true)
              setTimeout(() => {
                onLoad?.()
              }, 1000)
            }}
          >
            <span className="button-text">LOAD GAME</span>
            <span className="button-icon">📂</span>
          </button>
        </div>

        <div className="features">
          <div className="feature">
            <span className="feature-icon">🏟️</span>
            <span>3 Cities</span>
          </div>
          <div className="feature">
            <span className="feature-icon">⚔️</span>
            <span>19 Enemies</span>
          </div>
          <div className="feature">
            <span className="feature-icon">💀</span>
            <span>Rogue-like</span>
          </div>
        </div>
      </div>

      <style>{`
        .splash-screen {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        
        .splash-screen.fade-out {
          animation: fadeOut 1s ease-out forwards;
        }
        
        @keyframes fadeOut {
          to {
            opacity: 0;
            transform: scale(1.1);
          }
        }
        
        .splash-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }
        
        .splash-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .splash-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            180deg,
            rgba(0,0,0,0.4) 0%,
            rgba(0,0,0,0.6) 50%,
            rgba(0,0,0,0.9) 100%
          );
        }
        
        .splash-content {
          position: relative;
          z-index: 10;
          text-align: center;
          color: white;
          padding: 2rem;
          max-width: 800px;
        }
        
        .game-title {
          font-family: 'Cinzel', serif;
          margin-bottom: 1.5rem;
          text-transform: uppercase;
        }
        
        .title-line {
          display: block;
          font-size: 3.5rem;
          font-weight: bold;
          text-shadow: 
            0 4px 30px rgba(0,0,0,0.9),
            0 0 80px rgba(218, 165, 32, 0.3);
          letter-spacing: 0.15em;
          line-height: 1.1;
        }
        
        .title-line.lead {
          font-size: 2.5rem;
          font-weight: 300;
          color: #f5f5f5;
          letter-spacing: 0.3em;
        }
        
        .title-line.rome {
          font-size: 5rem;
          color: #FFD700;
          text-shadow: 
            0 4px 30px rgba(0,0,0,0.9),
            0 0 100px rgba(255, 215, 0, 0.6),
            0 0 150px rgba(255, 215, 0, 0.3);
          animation: glow 2.5s ease-in-out infinite alternate;
          margin-top: 0.25rem;
        }
        
        @keyframes glow {
          from {
            text-shadow: 
              0 4px 30px rgba(0,0,0,0.9),
              0 0 80px rgba(255, 215, 0, 0.4);
          }
          to {
            text-shadow: 
              0 4px 30px rgba(0,0,0,0.9),
              0 0 120px rgba(255, 215, 0, 0.7),
              0 0 180px rgba(255, 215, 0, 0.4);
          }
        }
        
        .tagline {
          font-size: 1.2rem;
          opacity: 0.9;
          margin-bottom: 3rem;
          font-style: italic;
          text-shadow: 0 2px 10px rgba(0,0,0,0.8);
        }
        
        .enter-button {
          background: linear-gradient(135deg, #8B0000 0%, #FF4500 50%, #8B0000 100%);
          border: 2px solid #FFD700;
          padding: 1.2rem 3rem;
          font-size: 1.3rem;
          font-family: 'Cinzel', serif;
          color: #FFD700;
          cursor: pointer;
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          gap: 1rem;
          transition: all 0.3s ease;
          box-shadow: 
            0 4px 20px rgba(139, 0, 0, 0.5),
            0 0 40px rgba(255, 215, 0, 0.2);
          animation: pulse 2s ease-in-out infinite;
        }
        
        .enter-button:hover {
          transform: translateY(-3px) scale(1.05);
          box-shadow: 
            0 8px 30px rgba(139, 0, 0, 0.6),
            0 0 60px rgba(255, 215, 0, 0.4);
        }
        
        @keyframes pulse {
          0%, 100% {
            box-shadow: 
              0 4px 20px rgba(139, 0, 0, 0.5),
              0 0 40px rgba(255, 215, 0, 0.2);
          }
          50% {
            box-shadow: 
              0 4px 30px rgba(139, 0, 0, 0.7),
              0 0 60px rgba(255, 215, 0, 0.3);
          }
        }
        
        .button-text {
          letter-spacing: 0.15em;
        }
        
        .button-icon {
          font-size: 1.5rem;
        }
        
        .load-button {
          background: rgba(0, 0, 0, 0.6);
          border: 1px solid #FFD700;
          padding: 1rem 3rem;
          font-size: 1.1rem;
          font-family: 'Cinzel', serif;
          color: #FFD700;
          cursor: pointer;
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          gap: 1rem;
          transition: all 0.3s ease;
          width: 100%;
          justify-content: center;
        }

        .load-button:hover {
          background: rgba(218, 165, 32, 0.2);
          transform: translateY(-2px);
          box-shadow: 0 0 20px rgba(218, 165, 32, 0.2);
        }

        .features {
          display: flex;
          justify-content: center;
          gap: 3rem;
          margin-top: 4rem;
          opacity: 0.8;
        }
        
        .feature {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1rem;
          text-shadow: 0 2px 10px rgba(0,0,0,0.8);
        }
        
        .feature-icon {
          font-size: 1.5rem;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .title-line {
            font-size: 2rem;
          }
          
          .title-line.lead {
            font-size: 1.8rem;
          }
          
          .title-line.rome {
            font-size: 2.5rem;
          }
          
          .tagline {
            font-size: 1rem;
          }
          
          .enter-button {
            padding: 1rem 2rem;
            font-size: 1rem;
          }
          
          .features {
            gap: 1.5rem;
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  )
}

export default SplashScreen
