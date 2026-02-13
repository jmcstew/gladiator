// useSaveSystem.js - Save System Hook for ALL ROADS LEAD TO ROME
import { useState, useCallback, useEffect } from 'react'

const SAVE_VERSION = '1.0.0'
const STORAGE_KEY_SLOTS = 'all_roads_save_slots'
const STORAGE_KEY_AUTO = 'all_roads_auto_save'

// Create save data from gladiator and stats
export const createSaveData = (gladiator, combatStats, settings) => {
  return {
    version: SAVE_VERSION,
    timestamp: Date.now(),
    gladiator: {
      id: gladiator.id,
      name: gladiator.name,
      gender: gladiator.gender,
      level: gladiator.level,
      xp: gladiator.xp,
      gold: gladiator.gold,
      homeland: gladiator.homeland,
      currentCity: gladiator.current_city,
      stats: {
        strength: gladiator.strength,
        agility: gladiator.agility,
        endurance: gladiator.endurance,
        intelligence: gladiator.intelligence,
        charisma: gladiator.charisma,
      },
      attributes: {
        height: gladiator.height,
        weight: gladiator.weight,
        chest: gladiator.chest,
        muscles: gladiator.muscles,
        arms: gladiator.arms,
        legs: gladiator.legs,
      },
    },
    equipment: {
      weapon: gladiator.equipped?.weapon || null,
      helmet: gladiator.equipped?.helmet || null,
      chestplate: gladiator.equipped?.chestplate || null,
      gauntlets: gladiator.equipped?.gauntlets || null,
      shield: gladiator.equipped?.shield || null,
      greaves: gladiator.equipped?.greaves || null,
    },
    inventory: gladiator.inventory || [],
    pets: gladiator.pets || [],
    combatStats: {
      wins: combatStats.wins || 0,
      losses: combatStats.losses || 0,
      totalDamageDealt: combatStats.totalDamageDealt || 0,
      totalCrits: combatStats.totalCrits || 0,
      maxCombo: combatStats.maxCombo || 0,
      battlesNoDamage: combatStats.battlesNoDamage || 0,
      level: combatStats.level || 1,
      totalGoldEarned: combatStats.totalGoldEarned || 0,
      legendaryItems: combatStats.legendaryItems || 0,
      executed: combatStats.executed || 0,
      successfulPleads: combatStats.successfulPleads || 0,
      enemiesDefeated: combatStats.enemiesDefeated || [],
      bossesDefeated: combatStats.bossesDefeated || [],
    },
    settings: settings || {
      musicVolume: 0.7,
      sfxVolume: 0.8,
      masterVolume: 0.5,
    },
  }
}

// Load save data into gladiator format
export const loadSaveData = (saveData) => {
  const { gladiator, equipment, inventory, pets, combatStats, settings } = saveData
  
  return {
    ...gladiator,
    current_city: gladiator.currentCity,
    equipped: equipment,
    inventory: inventory || [],
    pets: pets || [],
    ...combatStats,
    ...settings,
  }
}

export const useSaveSystem = () => {
  const [saveSlots, setSaveSlots] = useState([
    { id: 1, name: 'Auto-Save', timestamp: null, hasData: false },
    { id: 2, name: 'Slot 2', timestamp: null, hasData: false },
    { id: 3, name: 'Slot 3', timestamp: null, hasData: false },
  ])
  
  const [lastAutoSave, setLastAutoSave] = useState(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)

  // Initialize save slots from localStorage
  useEffect(() => {
    const storedSlots = localStorage.getItem(STORAGE_KEY_SLOTS)
    if (storedSlots) {
      try {
        const slots = JSON.parse(storedSlots)
        setSaveSlots(slots)
      } catch (e) {
        console.error('Failed to load save slots:', e)
      }
    }
    
    // Check auto-save
    const autoSave = localStorage.getItem(STORAGE_KEY_AUTO)
    if (autoSave) {
      try {
        const data = JSON.parse(autoSave)
        setLastAutoSave(data.timestamp)
      } catch (e) {
        console.error('Failed to load auto-save:', e)
      }
    }
  }, [])

  // Save slot to localStorage
  const persistSlots = useCallback((slots) => {
    localStorage.setItem(STORAGE_KEY_SLOTS, JSON.stringify(slots))
    setSaveSlots(slots)
  }, [])

  // Save to a specific slot
  const saveToSlot = useCallback((slotId, gladiator, combatStats, settings) => {
    setSaving(true)
    
    try {
      const saveData = createSaveData(gladiator, combatStats, settings)
      const slotKey = `all_roads_save_${slotId}`
      localStorage.setItem(slotKey, JSON.stringify(saveData))
      
      const updatedSlots = saveSlots.map(slot => {
        if (slot.id === slotId) {
          return {
            ...slot,
            timestamp: Date.now(),
            hasData: true,
            name: gladiator.name,
          }
        }
        return slot
      })
      
      persistSlots(updatedSlots)
      setSaving(false)
      return true
    } catch (e) {
      console.error('Failed to save:', e)
      setSaving(false)
      return false
    }
  }, [saveSlots, persistSlots])

  // Auto-save
  const autoSave = useCallback((gladiator, combatStats, settings) => {
    const saveData = createSaveData(gladiator, combatStats, settings)
    
    try {
      localStorage.setItem(STORAGE_KEY_AUTO, JSON.stringify(saveData))
      setLastAutoSave(Date.now())
      return true
    } catch (e) {
      console.error('Failed to auto-save:', e)
      return false
    }
  }, [])

  // Load from slot
  const loadFromSlot = useCallback((slotId) => {
    setLoading(true)
    
    try {
      const slotKey = `all_roads_save_${slotId}`
      const saved = localStorage.getItem(slotKey)
      
      if (saved) {
        const data = JSON.parse(saved)
        setLoading(false)
        
        // Validate version
        if (data.version !== SAVE_VERSION) {
          console.warn('Save version mismatch, attempting migration')
        }
        
        return loadSaveData(data)
      }
      
      setLoading(false)
      return null
    } catch (e) {
      console.error('Failed to load save:', e)
      setLoading(false)
      return null
    }
  }, [])

  // Load auto-save
  const loadAutoSave = useCallback(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AUTO)
      if (saved) {
        const data = JSON.parse(saved)
        return loadSaveData(data)
      }
      return null
    } catch (e) {
      console.error('Failed to load auto-save:', e)
      return null
    }
  }, [])

  // Delete slot
  const deleteSlot = useCallback((slotId) => {
    const slotKey = `all_roads_save_${slotId}`
    localStorage.removeItem(slotKey)
    
    const updatedSlots = saveSlots.map(slot => {
      if (slot.id === slotId) {
        return {
          id: slotId,
          name: slotId === 1 ? 'Auto-Save' : `Slot ${slotId}`,
          timestamp: null,
          hasData: false,
        }
      }
      return slot
    })
    
    persistSlots(updatedSlots)
  }, [saveSlots, persistSlots])

  // Export slot to file
  const exportSlot = useCallback((slotId) => {
    try {
      const slotKey = `all_roads_save_${slotId}`
      const saved = localStorage.getItem(slotKey)
      
      if (saved) {
        const data = JSON.parse(saved)
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        
        const a = document.createElement('a')
        a.href = url
        a.download = `all-roads-save-${slotId}-${Date.now()}.json`
        a.click()
        
        URL.revokeObjectURL(url)
        return true
      }
      return false
    } catch (e) {
      console.error('Failed to export save:', e)
      return false
    }
  }, [])

  // Import from file
  const importSave = useCallback((file, slotId = 2) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result)
          
          // Validate it's a save file
          if (!data.version || !data.gladiator) {
            reject(new Error('Invalid save file'))
            return
          }
          
          // Save to slot
          const slotKey = `all_roads_save_${slotId}`
          localStorage.setItem(slotKey, JSON.stringify(data))
          
          const updatedSlots = saveSlots.map(slot => {
            if (slot.id === slotId) {
              return {
                ...slot,
                timestamp: data.timestamp,
                hasData: true,
                name: data.gladiator.name,
              }
            }
            return slot
          })
          
          persistSlots(updatedSlots)
          resolve(loadSaveData(data))
        } catch (err) {
          reject(new Error('Failed to parse save file'))
        }
      }
      
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
  }, [saveSlots, persistSlots])

  // Format timestamp for display
  const formatTimestamp = useCallback((timestamp) => {
    if (!timestamp) return 'Empty'
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date
    
    // Less than 1 minute
    if (diff < 60000) {
      return 'Just now'
    }
    // Less than 1 hour
    if (diff < 3600000) {
      const mins = Math.floor(diff / 60000)
      return `${mins}m ago`
    }
    // Same day
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    // Older
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }, [])

  // Get save details for a slot
  const getSlotDetails = useCallback((slotId) => {
    const slotKey = `all_roads_save_${slotId}`
    const saved = localStorage.getItem(slotKey)
    
    if (saved) {
      try {
        const data = JSON.parse(saved)
        return {
          name: data.gladiator.name,
          level: data.gladiator.level,
          city: data.gladiator.currentCity,
          gold: data.gladiator.gold,
          timestamp: data.timestamp,
          hasData: true,
        }
      } catch (e) {
        return { hasData: false }
      }
    }
    return { hasData: false }
  }, [])

  return {
    saveSlots,
    lastAutoSave,
    saving,
    loading,
    saveToSlot,
    autoSave,
    loadFromSlot,
    loadAutoSave,
    deleteSlot,
    exportSlot,
    importSave,
    formatTimestamp,
    getSlotDetails,
  }
}

export default useSaveSystem
