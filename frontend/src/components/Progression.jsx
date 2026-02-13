import React, { useState, useEffect } from 'react'
import TrainingMinigames from './TrainingMinigames'
import CharismaMinigame from './CharismaMinigame'

const API_URL = 'http://localhost:8000'

function Progression({ gladiator, onUpdate }) {
  const [stats, setStats] = useState(null)
  const [training, setTraining] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showMiniGames, setShowMiniGames] = useState(false)
  const [showCharismaGame, setShowCharismaGame] = useState(false)

  useEffect(() => {
    fetch(`${API_URL}/progression/${gladiator.id}`)
      .then(res => res.json())
      .then(data => {
        setStats(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [gladiator.id])

  const train = async (stat) => {
    if (!stats || stats.skill_points <= 0) {
      alert('No skill points available!')
      return
    }

    setTraining(stat)
    
    try {
      const res = await fetch(`${API_URL}/progression/train/${gladiator.id}/${stat}`, {
        method: 'POST',
      })

      if (res.ok) {
        const data = await res.json()
        setStats(prev => ({
          ...prev,
          skill_points: data.skill_points_remaining,
        }))
        onUpdate(gladiator.id)
      } else {
        const error = await res.json()
        alert(error.detail || 'Training failed')
      }
    } catch (err) {
      alert(err.message)
    } finally {
      setTraining(null)
    }
  }

  const handleMiniGameTraining = async (stat, gain) => {
    try {
      const res = await fetch(`${API_URL}/progression/train/${gladiator.id}/${stat}`, {
        method: 'POST',
      })

      if (res.ok) {
        const data = await res.json()
        setStats(prev => ({
          ...prev,
          skill_points: data.skill_points_remaining,
        }))
        onUpdate(gladiator.id)
        setShowMiniGames(false)
      } else {
        alert('Training failed')
      }
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading) {
    return <div className="loading-spinner">Loading...</div>
  }

  const expPercent = stats ? (stats.experience / stats.exp_to_next) * 100 : 0

  return (
    <div className="progression">
      <h2>📈 Progression</h2>

      {showMiniGames ? (
        <TrainingMinigames 
          gladiator={gladiator}
          onTrainingComplete={handleMiniGameTraining}
        />
      ) : showCharismaGame ? (
        <CharismaMinigame
          gladiator={gladiator}
          onComplete={(stat, gain) => {
            handleMiniGameTraining(stat, gain)
            setShowCharismaGame(false)
          }}
        />
      ) : (
        <>
          <div className="card" style={{ marginBottom: '1rem' }}>
            <h3>Level {stats?.level || gladiator.level}</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Experience</span>
                <span>{stats?.experience || 0} / {stats?.exp_to_next || 100} XP</span>
              </div>
              <div className="xp-bar">
                <div 
                  className="xp-bar-fill"
                  style={{ width: `${expPercent}%` }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <div className="stat">
                <div className="stat-value">{gladiator.wins}</div>
                <div className="stat-label">Wins</div>
              </div>
              <div className="stat">
                <div className="stat-value">{gladiator.losses}</div>
                <div className="stat-label">Losses</div>
              </div>
              <div className="stat">
                <div className="stat-value">
                  {gladiator.wins + gladiator.losses > 0 
                    ? `${Math.round((gladiator.wins / (gladiator.wins + gladiator.losses)) * 100)}%`
                    : '0%'}
                </div>
                <div className="stat-label">Win Rate</div>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '1rem' }}>
            <h3>🎯 Skill Points: {stats?.skill_points || 0}</h3>
            <p style={{ opacity: 0.7, marginBottom: '1rem' }}>
              Spend skill points to increase your attributes. Earn more by leveling up!
            </p>

            <div className="stats-grid">
              {[
                { key: 'strength', icon: '💪', desc: 'Increases damage dealt' },
                { key: 'agility', icon: '🏃', desc: 'Better dodge chance' },
                { key: 'endurance', icon: '❤️', desc: 'More HP, better defense' },
                { key: 'charisma', icon: '⭐', desc: 'Plea success, shop discounts' },
              ].map(attr => (
                <div 
                  key={attr.key}
                  className="stat"
                  style={{ 
                    border: stats?.skill_points > 0 ? '1px solid var(--secondary)' : 'none',
                    cursor: stats?.skill_points > 0 ? 'pointer' : 'default',
                  }}
                  onClick={() => stats?.skill_points > 0 && train(attr.key)}
                >
                  <div style={{ fontSize: '1.5rem' }}>{attr.icon}</div>
                  <div className="stat-value">{gladiator[attr.key] || 0}</div>
                  <div className="stat-label" style={{ textTransform: 'capitalize' }}>{attr.key}</div>
                  {stats?.skill_points > 0 && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginTop: '0.5rem' }}>
                      Click to train (+1)
                    </div>
                  )}
                  <div style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: '0.25rem' }}>
                    {attr.desc}
                  </div>
                </div>
              ))}
            </div>

            {stats?.skill_points > 0 && (
              <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--secondary)' }}>
                💡 Click on a stat to spend a skill point!
              </p>
            )}
          </div>

          <div className="card" style={{ marginBottom: '1rem' }}>
            <h3>🏋️ Training Grounds</h3>
            <p style={{ opacity: 0.7, marginBottom: '1rem' }}>
              Complete mini-games to earn bonus stat points!
            </p>
            
            <div style={{ 
              padding: '1.5rem', 
              background: 'rgba(0,0,0,0.3)', 
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎮</div>
              <h4 style={{ marginBottom: '0.5rem' }}>Mini-Games Available!</h4>
              <p style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '1rem' }}>
                Rock Smash • Dodge Dash • Marathon Run
              </p>
              <button
                onClick={() => setShowMiniGames(true)}
                className="btn btn-primary"
                style={{ padding: '0.75rem 2rem' }}
              >
                🎯 Start Training Games
              </button>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '1rem' }}>
            <h3>🎤 Oratory Training</h3>
            <p style={{ opacity: 0.7, marginBottom: '1rem' }}>
              Master the art of persuasion to plea for your life in the arena!
            </p>
            
            <div style={{ 
              padding: '1.5rem', 
              background: 'rgba(0,0,0,0.3)', 
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎭</div>
              <h4 style={{ marginBottom: '0.5rem' }}>Learn to Plead!</h4>
              <p style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '1rem' }}>
                Type speeches quickly to win over the crowd and Emperor!
              </p>
              <button
                onClick={() => setShowCharismaGame(true)}
                className="btn btn-primary"
                style={{ 
                  padding: '0.75rem 2rem',
                  background: 'linear-gradient(135deg, #6A5ACD, #9370DB)',
                  border: '2px solid #DDA0DD'
                }}
              >
                🎤 Start Oratory Training
              </button>
            </div>
            
            <div style={{ 
              marginTop: '1rem',
              padding: '1rem',
              background: 'rgba(106, 90, 205, 0.2)',
              borderRadius: '8px',
              border: '1px solid #6A5ACD'
            }}>
              <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                <strong>💡 Pro Tip:</strong> Higher charisma = better plea success rate!
              </p>
              <p style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                Current Plea Chance: <strong>{(20 + (gladiator.charisma || 0) * 1.5).toFixed(1)}%</strong>
              </p>
            </div>
          </div>

          <div className="card">
            <h3>🏆 Achievements</h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {gladiator.wins >= 1 && (
                <div style={{ padding: '0.5rem 1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid var(--secondary)' }}>
                  ⚔️ First Blood (Win your first fight)
                </div>
              )}
              {gladiator.wins >= 10 && (
                <div style={{ padding: '0.5rem 1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid gold' }}>
                  🏅 Champion (Win 10 fights)
                </div>
              )}
              {gladiator.level >= 5 && (
                <div style={{ padding: '0.5rem 1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid purple' }}>
                  ⬆️ Veteran (Reach level 5)
                </div>
              )}
              {gladiator.wins >= 25 && (
                <div style={{ padding: '0.5rem 1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid #ff4444' }}>
                  👑 Legend (Win 25 fights)
                </div>
              )}
              {!gladiator.wins && (
                <div style={{ opacity: 0.6 }}>No achievements yet. Enter the arena!</div>
              )}
            </div>
          </div>
        </>
      )}

      <style>{`
        .progression {
          animation: fadeIn 0.3s ease;
        }
        
        .progression .loading-spinner {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 200px;
        }
      `}</style>
    </div>
  )
}

export default Progression
