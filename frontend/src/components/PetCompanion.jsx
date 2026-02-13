import React, { useState, useEffect } from 'react'

const API_URL = 'http://localhost:8000'

function PetCompanion({ gladiator, onUpdate }) {
  const [availablePets, setAvailablePets] = useState([])
  const [ownedPets, setOwnedPets] = useState([])
  const [activePet, setActivePet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(null)
  const [selectedPet, setSelectedPet] = useState(null)

  useEffect(() => {
    fetchPets()
  }, [gladiator])

  const fetchPets = async () => {
    try {
      const [petsRes, ownedRes] = await Promise.all([
        fetch(`${API_URL}/pets`),
        fetch(`${API_URL}/pets/owned/${gladiator.id}`)
      ])
      
      const petsData = await petsRes.json()
      const ownedData = await ownedRes.json()
      
      setAvailablePets(petsData)
      setOwnedPets(ownedData.pets || [])
      setActivePet(ownedData.active_pet)
      setLoading(false)
    } catch (err) {
      console.error('Failed to fetch pets:', err)
      setLoading(false)
    }
  }

  const buyPet = async (petId) => {
    setPurchasing(petId)
    try {
      const res = await fetch(`${API_URL}/pets/buy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gladiator_id: gladiator.id,
          pet_id: petId,
        }),
      })

      if (res.ok) {
        onUpdate(gladiator.id)
        fetchPets()
      } else {
        const error = await res.json()
        alert(error.detail || 'Purchase failed')
      }
    } catch (err) {
      alert(err.message)
    } finally {
      setPurchasing(null)
    }
  }

  const activatePet = async (petId) => {
    try {
      const res = await fetch(`${API_URL}/pets/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gladiator_id: gladiator.id,
          pet_id: petId,
        }),
      })

      if (res.ok) {
        fetchPets()
      }
    } catch (err) {
      console.error('Failed to activate pet:', err)
    }
  }

  const getRarityColor = (rarity) => {
    const colors = {
      common: '#9e9e9e',
      uncommon: '#4caf50',
      rare: '#2196f3',
      epic: '#9c27b0',
      legendary: '#ff9800',
    }
    return colors[rarity] || '#9e9e9e'
  }

  const getPetIcon = (type) => {
    const icons = {
      feline: '🦁',
      avian: '🦅',
      canine: '🐺',
    }
    return icons[type] || '🐾'
  }

  if (loading) {
    return <div className="loading-spinner">Loading pets...</div>
  }

  return (
    <div className="pet-companion" style={{ padding: '1rem' }}>
      <h2>🐾 Pet Companions</h2>

      {/* Active Pet Display */}
      {activePet && (
        <div className="card" style={{ marginBottom: '1.5rem', border: '2px solid #FFD700' }}>
          <h3 style={{ color: '#FFD700', marginBottom: '1rem' }}>⭐ Active Companion</h3>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '3px solid #FFD700',
              background: 'rgba(0,0,0,0.3)',
            }}>
              <img 
                src={activePet.image || `/assets/pet-${activePet.type}.png`}
                alt={activePet.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ marginBottom: '0.5rem' }}>{getPetIcon(activePet.type)} {activePet.name}</h4>
              <p style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '0.5rem' }}>
                Level {activePet.level} {activePet.rarity} companion
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {activePet.attack_bonus > 0 && (
                  <span style={{ color: '#ff6b6b' }}>⚔️ +{activePet.attack_bonus} ATK</span>
                )}
                {activePet.defense_bonus > 0 && (
                  <span style={{ color: '#4CAF50' }}>🛡️ +{activePet.defense_bonus} DEF</span>
                )}
                {activePet.hp_bonus > 0 && (
                  <span style={{ color: '#2196F3' }}>❤️ +{activePet.hp_bonus} HP</span>
                )}
              </div>
              {activePet.ability_name && (
                <p style={{ fontSize: '0.85rem', color: '#DAA520', marginTop: '0.5rem' }}>
                  ✨ {activePet.ability_name}: {activePet.ability_description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Owned Pets */}
      {ownedPets.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3>📦 Your Pets</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            {ownedPets.map((pet) => (
              <div 
                key={pet.id}
                className="pet-card"
                style={{
                  padding: '1rem',
                  background: pet.id === activePet?.id ? 'rgba(255, 215, 0, 0.1)' : 'rgba(0,0,0,0.3)',
                  borderRadius: '12px',
                  border: `2px solid ${pet.id === activePet?.id ? '#FFD700' : getRarityColor(pet.rarity)}`,
                }}
              >
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    background: 'rgba(0,0,0,0.5)',
                  }}>
                    <img 
                      src={pet.image || `/assets/pet-${pet.type}.png`}
                      alt={pet.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4>{getPetIcon(pet.type)} {pet.name}</h4>
                    <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>
                      Level {pet.level} • {pet.rarity}
                    </p>
                  </div>
                </div>
                
                {pet.id !== activePet?.id && (
                  <button
                    onClick={() => activatePet(pet.id)}
                    className="btn btn-secondary"
                    style={{ 
                      width: '100%', 
                      marginTop: '0.75rem',
                      padding: '0.5rem',
                      fontSize: '0.9rem',
                    }}
                  >
                    ⭐ Make Active
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pet Shop */}
      <div className="card">
        <h3>🐾 Pet Shop</h3>
        <p style={{ opacity: 0.7, marginBottom: '1rem' }}>
          Companions fight alongside you in battle!
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
          {availablePets.map((pet) => {
            const alreadyOwned = ownedPets.some(p => p.pet_id === pet.id)
            
            return (
              <div 
                key={pet.id}
                className="shop-pet"
                style={{
                  padding: '1rem',
                  background: 'rgba(0,0,0,0.3)',
                  borderRadius: '12px',
                  border: `1px solid ${getRarityColor(pet.rarity)}`,
                  opacity: alreadyOwned ? 0.6 : 1,
                }}
              >
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '2rem' }}>{getPetIcon(pet.type)}</span>
                  <div>
                    <h4 style={{ color: getRarityColor(pet.rarity) }}>{pet.name}</h4>
                    <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>{pet.type}</p>
                  </div>
                </div>
                
                <div style={{ fontSize: '0.85rem', marginBottom: '0.75rem', opacity: 0.8 }}>
                  {pet.attack_bonus > 0 && <div>⚔️ +{pet.attack_bonus} ATK</div>}
                  {pet.defense_bonus > 0 && <div>🛡️ +{pet.defense_bonus} DEF</div>}
                  {pet.hp_bonus > 0 && <div>❤️ +{pet.hp_bonus} HP</div>}
                  {pet.ability_name && (
                    <div style={{ color: '#DAA520' }}>✨ {pet.ability_name}</div>
                  )}
                </div>
                
                <button
                  onClick={() => buyPet(pet.id)}
                  disabled={alreadyOwned || purchasing === pet.id || gladiator.gold < pet.buy_price}
                  className="btn btn-primary"
                  style={{ 
                    width: '100%',
                    background: alreadyOwned 
                      ? 'linear-gradient(135deg, #4CAF50, #45a049)' 
                      : undefined,
                  }}
                >
                  {alreadyOwned 
                    ? '✓ Owned' 
                    : purchasing === pet.id 
                      ? 'Buying...' 
                      : `💰 ${pet.buy_price}`
                  }
                </button>
              </div>
            )
          })}
        </div>
      </div>

      <style>{`
        .shop-pet:hover {
          transform: translateY(-3px);
          border-color: #FFD700 !important;
        }
      `}</style>
    </div>
  )
}

export default PetCompanion
