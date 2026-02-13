import React, { useState, useEffect } from 'react'

const API_URL = 'http://localhost:8000'

function Equipment({ gladiator, onUpdate }) {
  const [equipment, setEquipment] = useState({ equipped: {}, inventory: [] })
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [showLoot, setShowLoot] = useState(false)
  const [lastBattle, setLastBattle] = useState(null)

  useEffect(() => {
    fetchEquipment()
  }, [gladiator.id])

  const fetchEquipment = () => {
    fetch(`${API_URL}/equipment/${gladiator.id}`)
      .then(res => res.json())
      .then(data => {
        setEquipment(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }

  const equipItem = async (itemId) => {
    setActionLoading(itemId)
    try {
      const res = await fetch(`${API_URL}/equipment/${gladiator.id}/equip/${itemId}`, {
        method: 'POST',
      })
      
      if (res.ok) {
        fetchEquipment()
        onUpdate(gladiator.id)
      } else {
        const error = await res.json()
        alert(error.detail || 'Failed to equip')
      }
    } catch (err) {
      alert(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const unequipSlot = async (slot) => {
    setActionLoading(slot)
    try {
      const res = await fetch(`${API_URL}/equipment/${gladiator.id}/unequip/${slot}`, {
        method: 'POST',
      })
      
      if (res.ok) {
        fetchEquipment()
        onUpdate(gladiator.id)
      } else {
        const error = await res.json()
        alert(error.detail || 'Failed to unequip')
      }
    } catch (err) {
      alert(err.message)
    } finally {
      setActionLoading(null)
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

  const slots = ['helmet', 'chestplate', 'gauntlets', 'weapon', 'shield', 'greaves']

  if (loading) {
    return <div>Loading equipment...</div>
  }

  return (
    <div className="equipment">
      <h2>🛡️ Equipment</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Equipped Slots */}
        <div className="card">
          <h3>Currently Equipped</h3>
          <div className="equipment-slots">
            {slots.map(slot => {
              const item = equipment.equipped[slot]
              return (
                <div 
                  key={slot}
                  className="equipment-slot"
                  style={{ borderColor: item ? getRarityColor(item.rarity) : 'var(--dark)' }}
                >
                  <div className="slot-icon">{getIcon(slot)}</div>
                  <div className="slot-content">
                    <div className="slot-label" style={{ textTransform: 'capitalize' }}>{slot}</div>
                    {item ? (
                      <div className="slot-item">
                        <div style={{ color: getRarityColor(item.rarity) }}>{item.name}</div>
                        <div className="slot-stats">
                          {item.damage > 0 && `⚔️ ${item.damage}`}
                          {item.armor > 0 && `🛡️ ${item.armor}`}
                          {item.strength_bonus > 0 && ` +${item.strength_bonus} STR`}
                        </div>
                        <button 
                          className="btn btn-secondary"
                          style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem', marginTop: '0.5rem' }}
                          onClick={() => unequipSlot(slot)}
                          disabled={actionLoading === slot}
                        >
                          Unequip
                        </button>
                      </div>
                    ) : (
                      <div className="slot-empty">Empty</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Inventory */}
        <div className="card">
          <h3>Inventory ({equipment.inventory.length} items)</h3>
          <div className="inventory-list">
            {equipment.inventory.map(inv => (
              <div 
                key={inv.id}
                className="inventory-item"
                style={{ borderColor: getRarityColor(inv.item.rarity) }}
              >
                <div className="item-icon">{getIcon(inv.item.type)}</div>
                <div className="item-info">
                  <div style={{ color: getRarityColor(inv.item.rarity) }}>
                    {inv.item.name}
                  </div>
                  <div className="item-stats">
                    {inv.item.type === 'weapon' && `⚔️ ${inv.item.damage}`}
                    {inv.item.type !== 'weapon' && inv.item.armor > 0 && `🛡️ ${inv.item.armor}`}
                    {inv.item.strength_bonus > 0 && ` +${inv.item.strength_bonus} STR`}
                    {inv.item.agility_bonus > 0 && ` +${inv.item.agility_bonus} AGI`}
                    {inv.item.endurance_bonus > 0 && ` +${inv.item.endurance_bonus} END`}
                  </div>
                </div>
                {inv.is_equipped ? (
                  <span className="equipped-badge">Equipped</span>
                ) : (
                  <button 
                    className="btn btn-primary"
                    style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}
                    onClick={() => equipItem(inv.item.id)}
                    disabled={actionLoading === inv.item.id}
                  >
                    {actionLoading === inv.item.id ? '...' : 'Equip'}
                  </button>
                )}
              </div>
            ))}
            {equipment.inventory.length === 0 && (
              <div style={{ opacity: 0.6, textAlign: 'center', padding: '2rem' }}>
                No items in inventory. Visit the shop or loot defeated foes!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="card" style={{ marginTop: '1rem' }}>
        <h3>📊 Total Stats</h3>
        <div className="stats-grid">
          <div className="stat">
            <div className="stat-value">{gladiator.strength}</div>
            <div className="stat-label">Strength</div>
          </div>
          <div className="stat">
            <div className="stat-value">{gladiator.agility}</div>
            <div className="stat-label">Agility</div>
          </div>
          <div className="stat">
            <div className="stat-value">{gladiator.endurance}</div>
            <div className="stat-label">Endurance</div>
          </div>
          <div className="stat">
            <div className="stat-value">{gladiator.intelligence}</div>
            <div className="stat-label">Intelligence</div>
          </div>
          <div className="stat">
            <div className="stat-value">{gladiator.charisma}</div>
            <div className="stat-label">Charisma</div>
          </div>
        </div>
        <p style={{ textAlign: 'center', marginTop: '1rem', opacity: 0.7 }}>
          Equipment bonuses are already included in your stats!
        </p>
      </div>
    </div>
  )
}

export default Equipment
