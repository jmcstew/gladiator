import React, { useState, useEffect, useCallback } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'
import CharacterCreation from './components/CharacterCreation'
import Arena from './components/Arena'
import Shop from './components/Shop'
import Equipment from './components/Equipment'
import Progression from './components/Progression'
import WorldMap from './components/WorldMap'
import PetCompanion from './components/PetCompanion'
import SplashScreen from './components/SplashScreen'
import SaveSlots from './components/SaveSlots'
import './index.css'

const API_URL = 'http://localhost:8000'

// Default settings
const DEFAULT_SETTINGS = {
  musicVolume: 0.7,
  sfxVolume: 0.8,
  masterVolume: 0.5,
}

function App() {
  const [gladiator, setGladiator] = useState(null)
  const [showSplash, setShowSplash] = useState(true)
  const [showSaveMenu, setShowSaveMenu] = useState(false)
  const [combatStats, setCombatStats] = useState({
    wins: 0,
    losses: 0,
    totalDamageDealt: 0,
    totalCrits: 0,
    maxCombo: 0,
    battlesNoDamage: 0,
    level: 1,
    totalGoldEarned: 0,
    legendaryItems: 0,
    executed: 0,
    successfulPleads: 0,
    enemiesDefeated: [],
    bossesDefeated: [],
  })
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)

  // Load saved settings on mount
  useEffect(() => {
    const saved = localStorage.getItem('all_roads_settings')
    if (saved) {
      try {
        setSettings(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load settings:', e)
      }
    }
  }, [])

  // Save settings when changed
  useEffect(() => {
    localStorage.setItem('all_roads_settings', JSON.stringify(settings))
  }, [settings])

  const loadGladiator = (id) => {
    fetch(`${API_URL}/gladiator/${id}`)
      .then(res => res.json())
      .then(data => {
        setGladiator(data)
        // Track initial combat stats from loaded gladiator
        setCombatStats(prev => ({
          ...prev,
          wins: data.wins || 0,
          losses: data.losses || 0,
          level: data.level || 1,
          totalGoldEarned: data.total_gold_earned || 0,
        }))
      })
      .catch(console.error)
  }

  // Handle loading a saved game
  const handleLoadSave = useCallback((savedData) => {
    // Set the gladiator data
    setGladiator({
      ...savedData.gladiator,
      current_city: savedData.gladiator.currentCity,
      equipped: savedData.equipment,
      inventory: savedData.inventory || [],
      pets: savedData.pets || [],
      wins: savedData.combatStats.wins,
      losses: savedData.combatStats.losses,
      level: savedData.combatStats.level,
      total_gold_earned: savedData.combatStats.totalGoldEarned,
    })
    
    // Set combat stats
    setCombatStats(savedData.combatStats)
    
    // Set settings
    if (savedData.settings) {
      setSettings(savedData.settings)
    }
    
    // Close save menu
    setShowSaveMenu(false)
  }, [])

  const handleSplashComplete = () => {
    setShowSplash(false)
  }

  const handleRestart = () => {
    setGladiator(null)
    setCombatStats({
      wins: 0,
      losses: 0,
      totalDamageDealt: 0,
      totalCrits: 0,
      maxCombo: 0,
      battlesNoDamage: 0,
      level: 1,
      totalGoldEarned: 0,
      legendaryItems: 0,
      executed: 0,
      successfulPleads: 0,
      enemiesDefeated: [],
      bossesDefeated: [],
    })
    window.location.href = '/'
  }

  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }

  return (
    <BrowserRouter>
      {showSplash && <SplashScreen onEnter={handleSplashComplete} />}
      
      {showSaveMenu && (
        <SaveSlots
          gladiator={gladiator}
          combatStats={combatStats}
          settings={settings}
          onSaveComplete={() => {
            // Save completed, just close after a moment
            setTimeout(() => {}, 500)
          }}
          onLoadComplete={handleLoadSave}
          onClose={() => setShowSaveMenu(false)}
        />
      )}
      
      <div className={`app ${showSplash ? 'hidden' : ''}`}>
        <header className="header">
          <h1>ALL ROADS LEAD TO ROME</h1>
          <p className="subtitle">The Journey to Glory Begins</p>
          {gladiator && (
            <div className="gladiator-info">
              <span>📍 {gladiator.current_city || 'Capua'}</span>
              <span>{gladiator.name}</span>
              <span>Lvl {gladiator.level}</span>
              <span>💰 {gladiator.gold}</span>
              <span>🗹 {gladiator.wins}W - {gladiator.losses}L</span>
            </div>
          )}
        </header>

        <nav className="nav">
          {!gladiator ? (
            <>
              <Link to="/create" className="nav-link">Create Gladiator</Link>
              <button onClick={() => setShowSaveMenu(true)} className="nav-link">
                💾 Save/Load
              </button>
            </>
          ) : (
            <>
              <Link to="/worldmap" className="nav-link">🗺️ World Map</Link>
              <Link to="/arena" className="nav-link">🏟️ Arena</Link>
              <Link to="/equipment" className="nav-link">🛡️ Equipment</Link>
              <Link to="/shop" className="nav-link">🛒 Shop</Link>
              <Link to="/pets" className="nav-link">🐾 Pets</Link>
              <Link to="/progression" className="nav-link">📈 Progress</Link>
              <button onClick={() => setShowSaveMenu(true)} className="nav-link">
                💾 Save
              </button>
              <button onClick={() => setShowSaveMenu(true)} className="nav-link">
                📂 Load
              </button>
              <button onClick={handleRestart} className="nav-link logout">Logout</button>
            </>
          )}
        </nav>

        <main className="main">
          <Routes>
            <Route path="/create" element={<CharacterCreation onCreated={loadGladiator} />} />
            <Route path="/worldmap" element={gladiator ? <WorldMap gladiator={gladiator} onTravel={(city) => {
              loadGladiator(gladiator.id)
            }} /> : <Link to="/create">Create a gladiator first!</Link>} />
            <Route path="/arena" element={gladiator ? <Arena 
              gladiator={gladiator} 
              combatStats={combatStats}
              setCombatStats={setCombatStats}
              settings={settings}
              onCityChange={(city) => loadGladiator(gladiator.id)}
              onRestart={handleRestart}
              autoSave={() => {
                // Auto-save logic handled by Arena component
              }}
            /> : <Link to="/create">Create a gladiator first!</Link>} />
            <Route path="/equipment" element={gladiator ? <Equipment gladiator={gladiator} onUpdate={loadGladiator} /> : <Link to="/create">Create a gladiator first!</Link>} />
            <Route path="/shop" element={gladiator ? <Shop gladiator={gladiator} onUpdate={loadGladiator} /> : <Link to="/create">Create a gladiator first!</Link>} />
            <Route path="/pets" element={gladiator ? <PetCompanion gladiator={gladiator} onUpdate={loadGladiator} /> : <Link to="/create">Create a gladiator first!</Link>} />
            <Route path="/progression" element={gladiator ? <Progression gladiator={gladiator} onUpdate={loadGladiator} /> : <Link to="/create">Create a gladiator first!</Link>} />
            <Route path="/" element={
              <div className="welcome">
                <h2>Welcome, Warrior!</h2>
                <p>Create your gladiator and rise through the ranks of the arena.</p>
                <p>Travel from <strong>Capua</strong> → <strong>Alexandria</strong> → <strong>Rome</strong>!</p>
                {!gladiator && (
                  <>
                    <Link to="/create" className="cta-button">Begin Your Journey</Link>
                    <button onClick={() => setShowSaveMenu(true)} className="cta-button" style={{
                      marginLeft: '1rem',
                      background: 'linear-gradient(135deg, #4a0080, #800080)',
                    }}>
                      📂 Load Save
                    </button>
                  </>
                )}
              </div>
            } />
          </Routes>
        </main>

        <footer className="footer">
          <p>ALL ROADS LEAD TO ROME v0.5.0 - Save System & AAA Polish</p>
        </footer>
      </div>
    </BrowserRouter>
  )
}

export default App
