import React, { useState, useEffect } from 'react'

const API_URL = 'http://localhost:8000'

// Roman shopkeeper name
const SHOPKEEPER = {
  name: "Livia",
  title: "The Armory Keeper",
  description: "Descendant of a long line of Roman weapon smiths"
}

function Shop({ gladiator, onUpdate }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(null)

  useEffect(() => {
    fetch(`${API_URL}/shop/items`)
      .then(res => res.json())
      .then(data => {
        setItems(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  const buyItem = async (item) => {
    if (gladiator.gold < item.buy_price) {
      alert('Not enough gold!')
      return
    }

    setPurchasing(item.id)
    
    try {
      const res = await fetch(`${API_URL}/shop/buy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gladiator_id: gladiator.id,
          item_id: item.id,
        }),
      })

      if (res.ok) {
        alert(`Purchased ${item.name}!`)
        onUpdate(gladiator.id)
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

  const getIcon = (type) => {
    const icons = {
      helmet: '⛑️',
      chestplate: '🛡️',
      gauntlets: '🧤',
      weapon: '🗡️',
      shield: '🛡️',
      greaves: '👢',
      consumable: '🧪',
    }
    return icons[type] || '📦'
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

  if (loading) {
    return <div>Loading shop...</div>
  }

  return (
    <div className="shop">
      <h2>🛡️ Armory</h2>
      
      {/* Shopkeeper */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '3px solid #DAA520',
            boxShadow: '0 0 20px rgba(218, 165, 32, 0.4)',
            flexShrink: 0,
          }}>
            <img 
              src="/assets/shopkeeper.png"
              alt={SHOPKEEPER.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ marginBottom: '0.25rem' }}>👩‍💼 {SHOPKEEPER.name}</h3>
            <p style={{ 
              color: '#DAA520', 
              fontSize: '0.9rem', 
              fontStyle: 'italic',
              marginBottom: '0.5rem' 
            }}>
              {SHOPKEEPER.title}
            </p>
            <p style={{ 
              opacity: 0.7, 
              fontSize: '0.85rem' 
            }}>
              {SHOPKEEPER.description}
            </p>
          </div>
        </div>
      </div>
      
      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3>Your Gold: 💰 {gladiator.gold}</h3>
      </div>

      <div className="shop-grid">
        {items.map(item => (
          <div 
            key={item.id} 
            className="shop-item"
            style={{ borderColor: getRarityColor(item.rarity) }}
          >
            <div className="icon">{getIcon(item.type)}</div>
            <div className="name">{item.name}</div>
            <div className="price">💰 {item.buy_price}</div>
            <div className="stats">
              {item.type === 'weapon' && `⚔️ Damage: ${item.damage}`}
              {item.type !== 'weapon' && `🛡️ Armor: ${item.armor}`}
              {item.strength_bonus > 0 && ` +${item.strength_bonus} STR`}
              {item.agility_bonus > 0 && ` +${item.agility_bonus} AGI`}
              {item.endurance_bonus > 0 && ` +${item.endurance_bonus} END`}
              {item.charisma_bonus > 0 && ` ⭐ +${item.charisma_bonus} CHA`}
            </div>
            {item.speed_penalty > 0 && (
              <div style={{ color: '#ff6666', fontSize: '0.8rem' }}>
                ⚠️ -{item.speed_penalty} Speed
              </div>
            )}
            <button 
              className="btn btn-primary"
              style={{ marginTop: 'auto' }}
              onClick={() => buyItem(item)}
              disabled={purchasing === item.id || gladiator.gold < item.buy_price}
            >
              {purchasing === item.id ? 'Buying...' : 'Purchase'}
            </button>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="card">
          <p>The armory is empty! (Backend items need to be seeded)</p>
        </div>
      )}
    </div>
  )
}

export default Shop
