import React, { useState, useEffect } from 'react'

function GameOverScreen({ gladiator, onRestart }) {
  const [fadeOut, setFadeOut] = useState(false)
  const [showStats, setShowStats] = useState(false)

  useEffect(() => {
    // Show stats after a brief delay
    const timer = setTimeout(() => setShowStats(true), 500)
    return () => clearTimeout(timer)
  }, [])

  const handleRestart = () => {
    setFadeOut(true)
    setTimeout(() => {
      onRestart()
    }, 1000)
  }

  return (
    <div className={`gameover-screen ${fadeOut ? 'fade-out' : ''}`}>
      <div className="gameover-background">
        <img 
          src={`/assets/gameover-${gladiator?.gender || 'male'}-screen.png`} 
          alt="Game Over" 
          className="gameover-image"
        />
        <div className="gameover-overlay" />
      </div>
      
      <div className="gameover-content">
        <h1 className="gameover-title">YOU HAVE FALLEN</h1>
        
        <p className="gameover-message">
          The arena claims another warrior.<br />
          The Emperor has spoken. Your life is forfeit.
        </p>
        
        {showStats && (
          <div className="final-stats">
            <h2>Final Record</h2>
            <div className="stats-grid">
              <div className="stat">
                <span className="stat-value">{gladiator?.level || 1}</span>
                <span className="stat-label">Level</span>
              </div>
              <div className="stat">
                <span className="stat-value">{gladiator?.wins || 0}</span>
                <span className="stat-label">Victories</span>
              </div>
              <div className="stat">
                <span className="stat-value">{gladiator?.losses || 0}</span>
                <span className="stat-label">Defeats</span>
              </div>
              <div className="stat">
                <span className="stat-value">{gladiator?.current_city || 'Capua'}</span>
                <span className="stat-label">Final City</span>
              </div>
            </div>
          </div>
        )}
        
        <button 
          className="restart-button"
          onClick={handleRestart}
        >
          <span className="button-text">🔄 START ANEW</span>
        </button>
        
        <p className="flavor-text">
          "All roads lead to Rome... but not all warriors reach it."
        </p>
      </div>

      <style>{`
        .gameover-screen {
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
        
        .gameover-screen.fade-out {
          animation: fadeOut 1s ease-out forwards;
        }
        
        @keyframes fadeOut {
          to {
            opacity: 0;
            transform: scale(0.95);
          }
        }
        
        .gameover-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }
        
        .gameover-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .gameover-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            180deg,
            rgba(0,0,0,0.5) 0%,
            rgba(0,0,0,0.7) 50%,
            rgba(0,0,0,0.9) 100%
          );
        }
        
        .gameover-content {
          position: relative;
          z-index: 10;
          text-align: center;
          color: white;
          padding: 2rem;
          max-width: 600px;
        }
        
        .gameover-title {
          font-family: 'Cinzel', serif;
          font-size: 3.5rem;
          color: #8B0000;
          text-shadow: 
            0 4px 30px rgba(0,0,0,0.9),
            0 0 60px rgba(139, 0, 0, 0.5);
          margin-bottom: 1.5rem;
          animation: titleAppear 1s ease-out;
          letter-spacing: 0.1em;
        }
        
        @keyframes titleAppear {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .gameover-message {
          font-size: 1.2rem;
          line-height: 1.8;
          opacity: 0.9;
          margin-bottom: 2rem;
          text-shadow: 0 2px 10px rgba(0,0,0,0.8);
          animation: fadeIn 1s ease-out 0.3s both;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 0.9; }
        }
        
        .final-stats {
          background: rgba(0, 0, 0, 0.6);
          border: 1px solid #8B0000;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          animation: slideUp 0.5s ease-out;
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .final-stats h2 {
          font-family: 'Cinzel', serif;
          color: #DAA520;
          margin-bottom: 1rem;
          font-size: 1.3rem;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }
        
        .stat {
          text-align: center;
        }
        
        .stat-value {
          display: block;
          font-size: 1.5rem;
          font-weight: bold;
          color: #DAA520;
        }
        
        .stat-label {
          font-size: 0.8rem;
          opacity: 0.7;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        
        .restart-button {
          background: linear-gradient(135deg, #1a1a1a 0%, #333 50%, #1a1a1a 100%);
          border: 2px solid #8B0000;
          padding: 1rem 2.5rem;
          font-size: 1.2rem;
          font-family: 'Cinzel', serif;
          color: #fff;
          cursor: pointer;
          border-radius: 8px;
          display: inline-flex;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
          animation: pulse 2s ease-in-out infinite;
        }
        
        .restart-button:hover {
          background: linear-gradient(135deg, #8B0000 0%, #B22222 50%, #8B0000 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 30px rgba(139, 0, 0, 0.6);
        }
        
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
          }
          50% {
            box-shadow: 0 4px 30px rgba(139, 0, 0, 0.3);
          }
        }
        
        .button-text {
          letter-spacing: 0.15em;
        }
        
        .flavor-text {
          margin-top: 2rem;
          font-style: italic;
          opacity: 0.6;
          font-size: 0.9rem;
          text-shadow: 0 2px 10px rgba(0,0,0,0.8);
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .gameover-title {
            font-size: 2rem;
          }
          
          .gameover-message {
            font-size: 1rem;
          }
          
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .stat-value {
            font-size: 1.2rem;
          }
        }
      `}</style>
    </div>
  )
}

export default GameOverScreen
