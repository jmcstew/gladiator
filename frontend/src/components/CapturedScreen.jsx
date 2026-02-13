import React, { useState, useEffect } from 'react'

function CapturedScreen({ gladiator, captureDetails, onContinue }) {
  const [fadeIn, setFadeIn] = useState(false)

  useEffect(() => {
    // Trigger fade in animation
    const timer = setTimeout(() => setFadeIn(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleContinue = () => {
    onContinue?.()
  }

  return (
    <div className={`captured-screen ${fadeIn ? 'fade-in' : ''}`}>
      <div className="captured-background">
        <img 
          src={`/assets/captured-${gladiator?.gender || 'male'}-screen.png`} 
          alt="Captured" 
          className="captured-image"
        />
        <div className="captured-overlay" />
      </div>
      
      <div className="captured-content">
        <h1 className="captured-title">💀 CAPTURED!</h1>
        
        <p className="captured-message">
          Defeated in battle, you have been taken prisoner by your enemies.
        </p>
        
        <div className="transport-info">
          <h2>🚚 Transportation</h2>
          <p>
            You are being shipped back to <strong>Capua</strong> in chains...
          </p>
        </div>
        
        {captureDetails && (
          <div className="loss-details">
            <h2>📦 Lost Equipment</h2>
            <ul className="lost-items">
              {captureDetails.lost_equipment && captureDetails.lost_equipment.length > 0 ? (
                captureDetails.lost_equipment.map((item, index) => (
                  <li key={index}>{item}</li>
                ))
              ) : (
                <li>No equipment to lose!</li>
              )}
            </ul>
          </div>
        )}
        
        <div className="preserved-stats">
          <h2>✅ Preserved</h2>
          <p>Your physical stats remain intact:</p>
          <div className="stats-row">
            <span className="stat">💪 STR: {gladiator?.strength}</span>
            <span className="stat">🏃 AGI: {gladiator?.agility}</span>
            <span className="stat">❤️ END: {gladiator?.endurance}</span>
          </div>
        </div>
        
        <div className="capture-count">
          <p>Total Captures: <strong>{gladiator?.capture_count || 0}</strong></p>
        </div>
        
        <button 
          className="continue-button"
          onClick={handleContinue}
        >
          <span className="button-text">🔗 CONTINUE FROM CAPUA</span>
        </button>
        
        <p className="warning-text">
          ⚠️ Train harder before returning to {captureDetails?.old_city || 'the arena'}!
        </p>
      </div>

      <style>{`
        .captured-screen {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 9998;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        
        .captured-screen.fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .captured-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }
        
        .captured-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .captured-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            180deg,
            rgba(0,0,0,0.3) 0%,
            rgba(0,0,0,0.6) 50%,
            rgba(0,0,0,0.95) 100%
          );
        }
        
        .captured-content {
          position: relative;
          z-index: 10;
          text-align: center;
          color: white;
          padding: 2rem;
          max-width: 600px;
        }
        
        .captured-title {
          font-family: 'Cinzel', serif;
          font-size: 3rem;
          color: #ff6b6b;
          text-shadow: 
            0 4px 30px rgba(0,0,0,0.9),
            0 0 60px rgba(255, 107, 107, 0.5);
          margin-bottom: 1.5rem;
          animation: shake 0.5s ease-in-out;
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        
        .captured-message {
          font-size: 1.2rem;
          line-height: 1.8;
          opacity: 0.9;
          margin-bottom: 2rem;
          text-shadow: 0 2px 10px rgba(0,0,0,0.8);
        }
        
        .transport-info {
          background: rgba(139, 0, 0, 0.4);
          border: 1px solid #ff6b6b;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }
        
        .transport-info h2 {
          font-family: 'Cinzel', serif;
          color: #ff6b6b;
          margin-bottom: 0.5rem;
        }
        
        .transport-info p {
          font-size: 1rem;
          opacity: 0.9;
        }
        
        .loss-details {
          background: rgba(0, 0, 0, 0.5);
          border: 1px solid #DAA520;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }
        
        .loss-details h2 {
          font-family: 'Cinzel', serif;
          color: #DAA520;
          margin-bottom: 0.5rem;
        }
        
        .lost-items {
          list-style: none;
          padding: 0;
          margin: 0.5rem 0 0 0;
        }
        
        .lost-items li {
          padding: 0.25rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          color: #ff6b6b;
        }
        
        .lost-items li:last-child {
          border-bottom: none;
        }
        
        .preserved-stats {
          background: rgba(0, 100, 0, 0.2);
          border: 1px solid #4CAF50;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }
        
        .preserved-stats h2 {
          font-family: 'Cinzel', serif;
          color: #4CAF50;
          margin-bottom: 0.5rem;
        }
        
        .preserved-stats p {
          font-size: 0.9rem;
          opacity: 0.8;
          margin-bottom: 0.5rem;
        }
        
        .stats-row {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
          margin-top: 0.5rem;
        }
        
        .stats-row .stat {
          font-weight: bold;
          color: #4CAF50;
        }
        
        .capture-count {
          font-size: 0.9rem;
          opacity: 0.7;
          margin-bottom: 1rem;
        }
        
        .continue-button {
          background: linear-gradient(135deg, #8B0000 0%, #B22222 50%, #8B0000 100%);
          border: 2px solid #DAA520;
          padding: 1rem 2.5rem;
          font-size: 1.1rem;
          font-family: 'Cinzel', serif;
          color: #DAA520;
          cursor: pointer;
          border-radius: 8px;
          display: inline-flex;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(139, 0, 0, 0.5);
          animation: pulse 2s ease-in-out infinite;
        }
        
        .continue-button:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 6px 30px rgba(139, 0, 0, 0.7);
        }
        
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 4px 20px rgba(139, 0, 0, 0.5);
          }
          50% {
            box-shadow: 0 4px 30px rgba(139, 0, 0, 0.7);
          }
        }
        
        .button-text {
          letter-spacing: 0.1em;
        }
        
        .warning-text {
          margin-top: 1.5rem;
          font-size: 0.9rem;
          color: #ff6b6b;
          opacity: 0.8;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .captured-title {
            font-size: 2rem;
          }
          
          .captured-message {
            font-size: 1rem;
          }
          
          .stats-row {
            flex-direction: column;
            gap: 0.5rem;
          }
          
          .continue-button {
            padding: 0.8rem 2rem;
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  )
}

export default CapturedScreen
