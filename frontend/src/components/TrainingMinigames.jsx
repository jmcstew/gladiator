import React, { useState, useEffect, useRef } from 'react'

function TrainingMinigames({ gladiator, onTrainingComplete }) {
  const [selectedStat, setSelectedStat] = useState(null)
  const [gameState, setGameState] = useState('menu') // menu, playing, results
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [gameMessage, setGameMessage] = useState('')
  const [streak, setStreak] = useState(0)
  const [highScore, setHighScore] = useState(0)
  
  const gameRef = useRef(null)
  const timerRef = useRef(null)

  const trainingConfig = {
    str: {
      name: '💪 Strength Training',
      subtitle: 'Rock Smash',
      description: 'Time your clicks to smash stones!',
      color: '#ff6b6b',
      duration: 15,
      icon: '🪨'
    },
    agi: {
      name: '🏃 Agility Training',
      subtitle: 'Dodge Dash',
      description: 'React fast to avoid attacks!',
      color: '#4CAF50',
      duration: 20,
      icon: '⚡'
    },
    end: {
      name: '❤️ Endurance Training',
      subtitle: 'Marathon Run',
      description: 'Hold your stamina as long as possible!',
      color: '#2196F3',
      duration: 30,
      icon: '🏃'
    }
  }

  const startGame = (stat) => {
    setSelectedStat(stat)
    setGameState('playing')
    setScore(0)
    setStreak(0)
    setGameMessage('')
    setTimeLeft(trainingConfig[stat].duration)
  }

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endGame()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [gameState, timeLeft])

  // ============ STR GAME: ROCK SMASH ============
  const StrGame = () => {
    const [rocks, setRocks] = useState([])
    const [targetRock, setTargetRock] = useState(null)
    const [hitEffect, setHitEffect] = useState(false)

    useEffect(() => {
      spawnRock()
    }, [])

    const spawnRock = () => {
      const sizes = ['small', 'medium', 'large', 'huge']
      const newRock = {
        id: Date.now(),
        size: sizes[Math.floor(Math.random() * sizes.length)],
        points: { small: 10, medium: 25, large: 50, huge: 100 }[sizes[Math.floor(Math.random() * sizes.length)]],
        x: Math.random() * 80 + 10,
        y: Math.random() * 60 + 20,
        scale: 0.8
      }
      setRocks([newRock])
      setTargetRock(newRock)
    }

    const handleSmash = (rock) => {
      if (rock.id === targetRock?.id) {
        setHitEffect(true)
        setTimeout(() => setHitEffect(false), 200)
        setScore(prev => prev + rock.points + (streak * 5))
        setStreak(prev => prev + 1)
        setGameMessage(`+${rock.points + (streak * 5)}! (x${streak + 1})`)
        
        // Spawn next rock after short delay
        setTimeout(() => {
          setRocks([])
          setTargetRock(null)
          setTimeout(spawnRock, 200)
        }, 150)
      } else {
        setStreak(0)
        setGameMessage('Missed!')
      }
    }

    return (
      <div className="str-game" style={{ position: 'relative', height: '300px', background: 'linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%)', borderRadius: '12px', overflow: 'hidden' }}>
        {/* Score display */}
        <div style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', zIndex: 10 }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#DAA520' }}>{score}</div>
          <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>Points</div>
        </div>

        {/* Rocks */}
        {rocks.map(rock => (
          <button
            key={rock.id}
            onClick={() => handleSmash(rock)}
            style={{
              position: 'absolute',
              left: `${rock.x}%`,
              top: `${rock.y}%`,
              transform: 'translate(-50%, -50%) scale(0.8)',
              fontSize: rock.size === 'small' ? '3rem' : rock.size === 'medium' ? '5rem' : rock.size === 'large' ? '7rem' : '9rem',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              filter: hitEffect && targetRock?.id === rock.id ? 'brightness(2) drop-shadow(0 0 20px red)' : 'drop-shadow(0 5px 10px rgba(0,0,0,0.5))',
              transition: 'transform 0.1s, filter 0.1s',
              zIndex: 5
            }}
          >
            🪨
          </button>
        ))}

        {/* Instructions */}
        <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.8rem', opacity: 0.6 }}>
          Click the rocks to smash them! Bigger = More points
        </div>
      </div>
    )
  }

  // ============ AGI GAME: DODGE DASH ============
  const AgiGame = () => {
    const [playerPos, setPlayerPos] = useState(50)
    const [attacks, setAttacks] = useState([])
    const [dodged, setDodged] = useState(0)
    const [hitEffect, setHitEffect] = useState(false)

    useEffect(() => {
      if (gameState !== 'playing') return

      const spawnAttack = () => {
        const newAttack = {
          id: Date.now(),
          y: 10,
          x: Math.random() * 70 + 15
        }
        setAttacks(prev => [...prev, newAttack])
      }

      const moveAttacks = setInterval(() => {
        setAttacks(prev => {
          const moved = prev.map(a => ({ ...a, y: a.y + 8 }))
          const playerZone = { min: playerPos - 10, max: playerPos + 10 }
          
          // Check hits
          const hits = moved.filter(a => a.y > 80 && a.x >= playerZone.min && a.x <= playerZone.max)
          if (hits.length > 0 && !hitEffect) {
            setHitEffect(true)
            setTimeout(() => setHitEffect(false), 300)
            setStreak(0)
            setScore(prev => Math.max(0, prev - 10))
          }
          
          // Count dodges
          const dodgedNew = moved.filter(a => a.y > 95).length
          if (dodgedNew > 0) {
            setDodged(prev => prev + dodgedNew)
            setScore(prev => prev + dodgedNew * 15)
          }
          
          return moved.filter(a => a.y <= 100)
        })
      }, 50)

      const spawnInterval = setInterval(spawnAttack, 1200)

      return () => {
        clearInterval(moveAttacks)
        clearInterval(spawnInterval)
      }
    }, [gameState, playerPos])

    return (
      <div className="agi-game" style={{ position: 'relative', height: '300px', background: 'linear-gradient(180deg, #1a3a1a 0%, #0d1a0d 100%)', borderRadius: '12px', overflow: 'hidden' }}>
        {/* Score display */}
        <div style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', zIndex: 10 }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4CAF50' }}>{score}</div>
          <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>Dodged: {dodged}</div>
        </div>

        {/* Player */}
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            left: `${playerPos}%`,
            transform: 'translateX(-50%)',
            fontSize: '3rem',
            filter: hitEffect ? 'grayscale(1) brightness(0.5)' : 'drop-shadow(0 0 10px cyan)',
            transition: 'left 0.1s',
            zIndex: 10
          }}
        >
          🏃
        </div>

        {/* Attacks */}
        {attacks.map(attack => (
          <div
            key={attack.id}
            style={{
              position: 'absolute',
              top: `${attack.y}%`,
              left: `${attack.x}%`,
              transform: 'translate(-50%, -50%)',
              fontSize: '2rem',
              zIndex: 5
            }}
          >
            ⚔️
          </div>
        ))}

        {/* Controls */}
        <div style={{ position: 'absolute', bottom: '5px', left: '50%', transform: 'translateX(-50%)', width: '80%' }}>
          <input
            type="range"
            min="10"
            max="90"
            value={playerPos}
            onChange={(e) => setPlayerPos(Number(e.target.value))}
            style={{ width: '100%', cursor: 'pointer' }}
          />
        </div>

        {/* Instructions */}
        <div style={{ position: 'absolute', bottom: '50px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.8rem', opacity: 0.6 }}>
          Use slider to dodge incoming attacks!
        </div>
      </div>
    )
  }

  // ============ END GAME: MARATHON RUN ============
  const EndGame = () => {
    const [stamina, setStamina] = useState(100)
    const [distance, setDistance] = useState(0)
    const [isRunning, setIsRunning] = useState(false)
    const [exhaustionLevel, setExhaustionLevel] = useState(0)

    useEffect(() => {
      if (gameState !== 'playing') return

      const runGame = setInterval(() => {
        // Exhaustion increases over time
        setExhaustionLevel(prev => Math.min(100, prev + 2))
        
        // Running drains stamina, walking recovers
        if (isRunning && stamina > 0) {
          setStamina(prev => Math.max(0, prev - 3))
          setDistance(prev => prev + 2)
        } else {
          setIsRunning(false)
          setStamina(prev => Math.min(100, prev + 1))
        }
      }, 100)

      return () => clearInterval(runGame)
    }, [gameState, isRunning, stamina])

    const toggleRun = () => {
      if (stamina > 0) {
        setIsRunning(!isRunning)
      }
    }

    const getExhaustionColor = () => {
      if (exhaustionLevel < 30) return '#4CAF50'
      if (exhaustionLevel < 60) return '#FFA500'
      if (exhaustionLevel < 85) return '#ff6b6b'
      return '#ff0000'
    }

    return (
      <div className="end-game" style={{ position: 'relative', height: '300px', background: 'linear-gradient(180deg, #1a2a3a 0%, #0d1520 100%)', borderRadius: '12px', overflow: 'hidden' }}>
        {/* Score display */}
        <div style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', zIndex: 10 }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2196F3' }}>{distance}m</div>
          <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>Distance</div>
        </div>

        {/* Runner */}
        <div
          style={{
            position: 'absolute',
            top: '45%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '4rem',
            animation: isRunning ? 'float 0.3s ease-in-out infinite' : 'none',
            filter: exhaustionLevel > 80 ? 'grayscale(1) brightness(0.5)' : 'drop-shadow(0 0 10px cyan)'
          }}
        >
          🏃
        </div>

        {/* Exhaustion bar */}
        <div style={{ position: 'absolute', top: '60%', left: '50%', transform: 'translateX(-50%)', width: '80%', textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', marginBottom: '5px', color: getExhaustionColor() }}>
            Exhaustion Level
          </div>
          <div style={{ width: '100%', height: '12px', background: '#333', borderRadius: '6px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${exhaustionLevel}%`,
                height: '100%',
                background: getExhaustionColor(),
                transition: 'width 0.2s, background 0.5s'
              }}
            />
          </div>
        </div>

        {/* Stamina indicator */}
        <div style={{ position: 'absolute', bottom: '60px', left: '50%', transform: 'translateX(-50%)', width: '80%', textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', marginBottom: '5px', color: stamina > 30 ? '#4CAF50' : '#ff6b6b' }}>
            Stamina: {Math.round(stamina)}%
          </div>
          <div style={{ width: '100%', height: '12px', background: '#333', borderRadius: '6px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${stamina}%`,
                height: '100%',
                background: stamina > 30 ? '#4CAF50' : '#ff6b6b',
                transition: 'width 0.2s'
              }}
            />
          </div>
        </div>

        {/* Run/Walk button */}
        <button
          onClick={toggleRun}
          disabled={stamina <= 0 && isRunning}
          style={{
            position: 'absolute',
            bottom: '15px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '10px 30px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            background: isRunning ? '#FFA500' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: stamina > 0 ? 'pointer' : 'not-allowed',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
          }}
        >
          {isRunning ? '🏃 Running! (Click to Walk)' : '🚶 Walking (Click to Run)'}
        </button>

        {/* Instructions */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '0.7rem', opacity: 0.6 }}>
          Run to gain distance but watch exhaustion!
        </div>
      </div>
    )
  }

  const endGame = () => {
    clearInterval(timerRef.current)
    setGameState('results')
    if (score > highScore) {
      setHighScore(score)
    }
  }

  const calculateStatGain = () => {
    // Base gain + performance bonus
    const baseGain = 1
    const bonus = Math.floor(score / 50)
    return Math.min(baseGain + bonus, 5) // Cap at 5 per session
  }

  const handleClaim = () => {
    const gain = calculateStatGain()
    onTrainingComplete?.(selectedStat, gain)
  }

  if (gameState === 'menu') {
    return (
      <div className="training-menu">
        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>🏋️ Training Grounds</h2>
        <p style={{ textAlign: 'center', opacity: 0.7, marginBottom: '2rem' }}>
          Complete mini-games to earn stat bonuses!
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {Object.entries(trainingConfig).map(([stat, config]) => (
            <button
              key={stat}
              onClick={() => startGame(stat)}
              style={{
                padding: '1.5rem',
                background: 'rgba(0, 0, 0, 0.5)',
                border: `2px solid ${config.color}`,
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span style={{ fontSize: '3rem' }}>{config.icon}</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: config.color }}>
                {config.name.split(' - ')[1]}
              </span>
              <span style={{ fontSize: '0.85rem', opacity: 0.7 }}>
                {config.description}
              </span>
              <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>
                Duration: {config.duration}s
              </span>
            </button>
          ))}
        </div>

        <style>{`
          .training-menu button:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(218, 165, 32, 0.3);
          }
        `}</style>
      </div>
    )
  }

  if (gameState === 'playing') {
    return (
      <div className="game-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Timer bar */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: 'bold' }}>{trainingConfig[selectedStat].icon} {trainingConfig[selectedStat].name}</span>
            <span style={{ color: timeLeft <= 5 ? '#ff4444' : '#DAA520' }}>⏱️ {timeLeft}s</span>
          </div>
          <div style={{ height: '8px', background: '#333', borderRadius: '4px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${(timeLeft / trainingConfig[selectedStat].duration) * 100}%`,
                height: '100%',
                background: timeLeft <= 5 ? '#ff4444' : 'linear-gradient(90deg, #DAA520, #FFD700)',
                transition: 'width 1s linear'
              }}
            />
          </div>
        </div>

        {/* Game message */}
        {gameMessage && (
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <span style={{
              display: 'inline-block',
              padding: '0.5rem 1.5rem',
              background: 'rgba(218, 165, 32, 0.3)',
              border: '1px solid #DAA520',
              borderRadius: '20px',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              color: '#DAA520',
              animation: 'pulse 0.5s ease'
            }}>
              {gameMessage}
            </span>
          </div>
        )}

        {/* Active game */}
        {selectedStat === 'str' && <StrGame />}
        {selectedStat === 'agi' && <AgiGame />}
        {selectedStat === 'end' && <EndGame />}

        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
        `}</style>
      </div>
    )
  }

  if (gameState === 'results') {
    const gain = calculateStatGain()
    const statName = { str: 'Strength', agi: 'Agility', end: 'Endurance' }[selectedStat]

    return (
      <div className="results" style={{ textAlign: 'center', maxWidth: '400px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '1rem' }}>🏆 Training Complete!</h2>
        
        <div style={{
          padding: '2rem',
          background: 'rgba(0, 0, 0, 0.5)',
          border: '2px solid #DAA520',
          borderRadius: '16px',
          marginBottom: '1.5rem'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎯</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#DAA520' }}>{score} points</div>
          <div style={{ opacity: 0.6 }}>High Score: {highScore}</div>
        </div>

        <div style={{
          padding: '1.5rem',
          background: 'rgba(76, 175, 80, 0.2)',
          border: '2px solid #4CAF50',
          borderRadius: '12px',
          marginBottom: '1.5rem'
        }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#4CAF50' }}>
            +{gain} {statName}
          </div>
          <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>
            Current: {gladiator[selectedStat] || 0} → {(gladiator[selectedStat] || 0) + gain}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            onClick={handleClaim}
            className="btn btn-primary"
            style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}
          >
            ✅ Claim Rewards
          </button>
          <button
            onClick={() => startGame(selectedStat)}
            className="btn btn-secondary"
            style={{ padding: '1rem 2rem' }}
          >
            🔄 Play Again
          </button>
        </div>
      </div>
    )
  }

  return null
}

export default TrainingMinigames
