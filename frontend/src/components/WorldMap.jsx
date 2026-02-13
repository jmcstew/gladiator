import React, { useState, useEffect } from 'react'

const API_URL = 'http://localhost:8000'

function WorldMap({ gladiator, onTravel }) {
  const [worldData, setWorldData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showShop, setShowShop] = useState(false)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [purchaseTarget, setPurchaseTarget] = useState(null)

  useEffect(() => {
    if (gladiator?.id) {
      fetchWorldMap()
    }
  }, [gladiator])

  const fetchWorldMap = async () => {
    try {
      const res = await fetch(`${API_URL}/worldmap/${gladiator.id}`)
      const data = await res.json()
      setWorldData(data)
    } catch (err) {
      console.error('Failed to fetch world map:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleTravel = async () => {
    if (!worldData?.can_travel) return

    try {
      const res = await fetch(`${API_URL}/worldmap/${gladiator.id}/travel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_city: worldData.next_city }),
      })
      const data = await res.json()
      
      if (res.ok) {
        alert(`✈️ Traveled to ${data.new_city}!`)
        onTravel?.(data.new_city)
        fetchWorldMap()
      } else {
        alert(data.detail || 'Travel failed')
      }
    } catch (err) {
      alert('Travel failed: ' + err.message)
    }
  }

  const handleBuyVehicle = async (vehicleType) => {
    try {
      const res = await fetch(`${API_URL}/worldmap/${gladiator.id}/buy-vehicle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicle_type: vehicleType }),
      })
      const data = await res.json()
      
      if (res.ok) {
        alert(`🛒 Purchased ${data.vehicle}! ${data.message}`)
        fetchWorldMap()
        setShowPurchaseModal(false)
      } else {
        alert(data.detail || 'Purchase failed')
      }
    } catch (err) {
      alert('Purchase failed: ' + err.message)
    }
  }

  const cities = [
    {
      id: 'Capua',
      name: '🏛️ Capua',
      description: 'The city where gladiators are made. Train here before seeking glory elsewhere.',
      color: '#8B4513',
      bgImage: '/assets/capua-bg.png',
      minLevel: 1,
      maxLevel: 4,
      shopItems: ['Wooden Sword', 'Iron Gladius', 'Leather Armor'],
    },
    {
      id: 'Alexandria',
      name: '🏺 Alexandria',
      description: 'The great library city of Egypt. Warriors from across the known world gather here.',
      color: '#DAA520',
      bgImage: '/assets/alexandria-bg.png',
      minLevel: 3,
      maxLevel: 7,
      shopItems: ['Steel Spatha', 'Khopesh', 'Trident', 'Scale Armor'],
      vehicle: 'Merchant Cart (500 gold)',
    },
    {
      id: 'Rome',
      name: '⚔️ Rome',
      description: 'The eternal city. The Colosseum awaits—the ultimate test of your might.',
      color: '#B8860B',
      bgImage: '/assets/rome-bg.png',
      minLevel: 6,
      maxLevel: 12,
      shopItems: ['Damascus Blade', 'Champion\'s Sword', 'Golden Trident'],
      vehicle: 'Chariot (1500 gold)',
      isBoss: true,
    },
  ]

  const currentCityIndex = cities.findIndex(c => c.id === worldData?.current_city)

  if (loading) {
    return (
      <div className="worldmap loading">
        <p>Loading world map...</p>
      </div>
    )
  }

  return (
    <div className="worldmap">
      {/* Header */}
      <div className="worldmap-header">
        <h2>🗺️ World Map</h2>
        <div className="current-location">
          <span className="label">Current Location:</span>
          <span className="city-name">{worldData?.current_city || 'Capua'}</span>
        </div>
        <div className="capture-stats">
          <span>Captures: {worldData?.capture_count || 0}</span>
          <span className="warning">
            {worldData?.current_city !== 'Capua' && ' ⚠️ Lose battles = lose equipment!'}
          </span>
        </div>
      </div>

      {/* Cities */}
      <div className="cities-container">
        {cities.map((city, index) => {
          const isUnlocked = index <= currentCityIndex + 1
          const isCurrent = city.id === worldData?.current_city
          const isNext = index === currentCityIndex + 1
          
          return (
            <div 
              key={city.id}
              className={`city-card ${isCurrent ? 'current' : ''} ${isUnlocked ? 'unlocked' : 'locked'}`}
              style={{ 
                borderColor: city.color,
                opacity: isUnlocked ? 1 : 0.5,
              }}
            >
              {/* Lock overlay */}
              {!isUnlocked && (
                <div className="lock-overlay">
                  <span>🔒</span>
                  <p>Locked</p>
                </div>
              )}
              
              {/* City header */}
              <div className="city-header" style={{ backgroundColor: city.color }}>
                <h3>{city.name}</h3>
                {isCurrent && <span className="badge">HERE</span>}
                {isNext && <span className="badge next">NEXT</span>}
              </div>
              
              {/* City info */}
              <div className="city-info">
                <p className="description">{city.description}</p>
                
                <div className="city-stats">
                  <div className="stat">
                    <span className="label">Levels</span>
                    <span className="value">{city.minLevel}-{city.maxLevel}</span>
                  </div>
                  <div className="stat">
                    <span className="label">Shop Tier</span>
                    <span className="value">{index + 1}</span>
                  </div>
                </div>
                
                {/* Vehicle requirement */}
                {city.vehicle && isNext && (
                  <div className="vehicle-required">
                    <p>🔑 To unlock next city:</p>
                    <p className="vehicle-name">{city.vehicle}</p>
                    {worldData?.vehicles?.includes(city.vehicle.split(' ')[0].toLowerCase()) ? (
                      <button className="btn btn-success" onClick={handleTravel}>
                        ✈️ Travel to {city.name.replace(/[^\w]/g, '')}
                      </button>
                    ) : (
                      <button 
                        className="btn btn-primary"
                        onClick={() => {
                          setPurchaseTarget(city.vehicle.split(' ')[0].toLowerCase().includes('merchant') ? 'merchant_cart' : 'chariot')
                          setShowPurchaseModal(true)
                        }}
                      >
                        🛒 Buy Vehicle
                      </button>
                    )}
                  </div>
                )}
                
                {/* Boss in Rome */}
                {city.isBoss && isCurrent && (
                  <div className="boss-section">
                    <h4>👹 The Colosseum Boss</h4>
                    <p>The Emperor's Champion awaits those worthy of his attention.</p>
                    <p className="requirement">Win 5 battles (Lv.6+) in Rome to unlock</p>
                    {worldData?.boss_unlocked ? (
                      <button className="btn btn-danger">
                        ⚔️ Fight Boss
                      </button>
                    ) : (
                      <button className="btn btn-secondary" disabled>
                        🔒 Boss Locked
                      </button>
                    )}
                  </div>
                )}
                
                {/* Enter city button */}
                {isCurrent && (
                  <button 
                    className="btn btn-primary enter-city"
                    onClick={() => onTravel?.(city.id)}
                  >
                    🏟️ Enter {city.name.replace(/[^\w]/g, '')}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Travel info */}
      {worldData?.current_city !== 'Rome' && (
        <div className="travel-info">
          <h3>🧭 Your Journey</h3>
          <p>
            Start in <strong>Capua</strong> → Train and earn gold → 
            Buy a <strong>Merchant Cart</strong> to reach <strong>Alexandria</strong> → 
            Earn enough for a <strong>Chariot</strong> → Enter <strong>Rome</strong> and fight the Boss!
          </p>
          <div className="warning-box">
            ⚠️ <strong>Warning:</strong> Outside of Capua, losing a battle means capture! 
            You'll be shipped back to Capua and lose all your equipment (but keep your stats).
          </div>
        </div>
      )}

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="modal-overlay" onClick={() => setShowPurchaseModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>🛒 Purchase Vehicle</h3>
            <p>
              {purchaseTarget?.includes('merchant') 
                ? 'Merchant Cart Ticket - 500 gold' 
                : 'Chariot - 1500 gold'}
            </p>
            <p className="description">
              {purchaseTarget?.includes('merchant')
                ? 'Travel to Alexandria. A safer journey than walking!'
                : 'Travel to Rome in style. Only the finest for a champion.'}
            </p>
            <p className="warning">
              Remember: If captured, you lose all equipment!
            </p>
            <div className="modal-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowPurchaseModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => handleBuyVehicle(purchaseTarget)}
              >
                Purchase
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .worldmap {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .worldmap-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .worldmap-header h2 {
          font-family: 'Cinzel', serif;
          color: var(--secondary);
          margin-bottom: 1rem;
        }
        
        .current-location {
          background: var(--dark);
          padding: 1rem 2rem;
          border-radius: 8px;
          display: inline-block;
          margin-bottom: 0.5rem;
        }
        
        .current-location .label {
          opacity: 0.7;
          margin-right: 0.5rem;
        }
        
        .current-location .city-name {
          color: var(--secondary);
          font-weight: bold;
          font-size: 1.2rem;
        }
        
        .capture-stats {
          font-size: 0.9rem;
          opacity: 0.8;
        }
        
        .capture-stats .warning {
          color: #ff6b6b;
          margin-left: 1rem;
        }
        
        .cities-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-bottom: 2rem;
        }
        
        .city-card {
          background: rgba(0,0,0,0.5);
          border: 2px solid var(--primary);
          border-radius: 12px;
          overflow: hidden;
          position: relative;
        }
        
        .city-card.current {
          box-shadow: 0 0 30px rgba(218, 165, 32, 0.3);
        }
        
        .city-card.locked {
          pointer-events: none;
        }
        
        .lock-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.8);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }
        
        .lock-overlay span {
          font-size: 3rem;
          margin-bottom: 0.5rem;
        }
        
        .city-header {
          padding: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .city-header h3 {
          margin: 0;
          color: white;
        }
        
        .badge {
          background: var(--secondary);
          color: var(--dark);
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: bold;
        }
        
        .badge.next {
          background: var(--primary);
          color: white;
        }
        
        .city-info {
          padding: 1.5rem;
        }
        
        .description {
          opacity: 0.8;
          margin-bottom: 1rem;
          line-height: 1.5;
        }
        
        .city-stats {
          display: flex;
          gap: 2rem;
          margin-bottom: 1rem;
        }
        
        .city-stats .stat {
          text-align: center;
        }
        
        .city-stats .label {
          display: block;
          opacity: 0.7;
          font-size: 0.8rem;
        }
        
        .city-stats .value {
          color: var(--secondary);
          font-weight: bold;
          font-size: 1.2rem;
        }
        
        .vehicle-required {
          background: rgba(0,0,0,0.3);
          padding: 1rem;
          border-radius: 8px;
          margin: 1rem 0;
        }
        
        .vehicle-required p {
          margin-bottom: 0.5rem;
        }
        
        .vehicle-name {
          color: var(--secondary);
          font-weight: bold;
        }
        
        .boss-section {
          background: rgba(139, 0, 0, 0.3);
          padding: 1rem;
          border-radius: 8px;
          margin: 1rem 0;
          border: 1px solid var(--primary);
        }
        
        .boss-section h4 {
          color: #ff6b6b;
          margin-bottom: 0.5rem;
        }
        
        .boss-section .requirement {
          font-size: 0.9rem;
          opacity: 0.8;
        }
        
        .enter-city {
          width: 100%;
          margin-top: 1rem;
        }
        
        .travel-info {
          background: rgba(0,0,0,0.3);
          padding: 1.5rem;
          border-radius: 8px;
          border: 1px solid var(--primary);
        }
        
        .travel-info h3 {
          color: var(--secondary);
          margin-bottom: 1rem;
        }
        
        .travel-info p {
          line-height: 1.6;
        }
        
        .warning-box {
          background: rgba(255, 107, 107, 0.1);
          border: 1px solid #ff6b6b;
          padding: 1rem;
          border-radius: 8px;
          margin-top: 1rem;
          color: #ff6b6b;
        }
        
        .warning-box strong {
          color: #ff6b6b;
        }
        
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .modal {
          background: var(--dark);
          border: 2px solid var(--secondary);
          border-radius: 12px;
          padding: 2rem;
          max-width: 400px;
          width: 90%;
        }
        
        .modal h3 {
          color: var(--secondary);
          margin-bottom: 1rem;
        }
        
        .modal .description {
          margin: 1rem 0;
        }
        
        .modal .warning {
          color: #ff6b6b;
          font-size: 0.9rem;
        }
        
        .modal-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1.5rem;
        }
        
        .modal-actions button {
          flex: 1;
        }
        
        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-family: 'Cinzel', serif;
          font-size: 1rem;
          transition: all 0.3s ease;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, var(--primary), var(--accent));
          color: white;
        }
        
        .btn-secondary {
          background: var(--dark);
          color: var(--secondary);
          border: 1px solid var(--secondary);
        }
        
        .btn-success {
          background: linear-gradient(135deg, #228B22, #32CD32);
          color: white;
        }
        
        .btn-danger {
          background: linear-gradient(135deg, #8B0000, #FF4500);
          color: white;
        }
        
        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  )
}

export default WorldMap
