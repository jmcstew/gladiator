import React, { useState, useEffect, useRef } from 'react'

function PleadScreen({ gladiator, city, pleaResult, onContinue, onMercy, onNoMercy }) {
  const [animationPhase, setAnimationPhase] = useState('pleading') // pleading, judging, verdict
  const [thumbAngle, setThumbAngle] = useState(0)
  const [showResult, setShowResult] = useState(false)

  const thumbRef = useRef(null)
  const animationRef = useRef(null)

  const cityConfig = {
    Capua: {
      arbiter: 'Magistrate',
      title: '🏛️ The Magistrate',
      description: 'The city magistrate considers your fate...',
      scene: '/assets/magistrate-scene.png',
      color: '#8B4513',
      bgGradient: 'linear-gradient(180deg, #2a1810 0%, #1a0a05 100%)',
    },
    Alexandria: {
      arbiter: 'Governor',
      femaleArbiter: 'Cleopatra',
      title: '👑 Cleopatra',
      description: 'The Queen of Egypt weighs your plea...',
      scene: '/assets/governor-scene.png',
      color: '#DAA520',
      bgGradient: 'linear-gradient(180deg, #2a2510 0%, #1a1505 100%)',
    },
    Rome: {
      arbiter: 'Emperor',
      title: '👑 The Emperor',
      description: 'The Emperor of Rome delivers judgment...',
      scene: '/assets/emperor-scene.png',
      color: '#FFD700',
      bgGradient: 'linear-gradient(180deg, #2a2010 0%, #1a1005 100%)',
    },
  }

  const config = cityConfig[city] || cityConfig.Capua

  // Move from pleading to judging after 2 seconds
  useEffect(() => {
    if (animationPhase === 'pleading') {
      const timer = setTimeout(() => {
        setAnimationPhase('judging')
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [animationPhase])

  // Oscillate thumb animation
  useEffect(() => {
    if (animationPhase === 'judging') {
      let angle = 0
      let direction = 1

      const animate = () => {
        // Oscillate between -45 (thumbs down) and 45 (thumbs up)
        angle += 2 * direction
        if (angle >= 45) direction = -1
        if (angle <= -45) direction = 1
        setThumbAngle(angle)
        animationRef.current = requestAnimationFrame(animate)
      }

      animationRef.current = requestAnimationFrame(animate)

      // After oscillating, show verdict
      const verdictTimer = setTimeout(() => {
        setAnimationPhase('verdict')
        setShowResult(true)
      }, 3000)

      return () => {
        cancelAnimationFrame(animationRef.current)
        clearTimeout(verdictTimer)
      }
    }
  }, [animationPhase])

  const getThumbEmoji = () => {
    if (!showResult) return '👍'
    return pleaResult?.spared ? '👍' : '👎'
  }

  const getThumbColor = () => {
    if (!showResult) return '#FFD700'
    return pleaResult?.spared ? '#4CAF50' : '#ff4444'
  }

  const getVerdictText = () => {
    if (!showResult) return ''
    if (pleaResult?.spared) return 'MERCY GRANTED!'
    return 'NO MERCY!'
  }

  const getVerdictMessage = () => {
    if (!showResult) return ''
    if (pleaResult?.spared) {
      return 'Cleopatra has spoken! You live to fight another day!'
    }
    return `${config.title} shows no mercy. Your fate is sealed...`
  }

  return (
    <div className="plead-screen" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
      background: config.bgGradient,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    }}>
      {/* Background Scene */}
      <div className="scene-background" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.4,
        backgroundImage: `url(${config.scene})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }} />

      {/* Overlay gradient */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.8) 100%)',
      }} />

      {/* Content */}
      <div className="plead-content" style={{
        position: 'relative',
        zIndex: 10,
        textAlign: 'center',
        maxWidth: '800px',
        padding: '2rem',
      }}>
        {/* Title */}
        <h1 style={{
          fontFamily: '"Cinzel", serif',
          fontSize: 'clamp(1.5rem, 4vw, 3rem)',
          color: config.color,
          textShadow: '0 0 30px rgba(0,0,0,0.8)',
          marginBottom: '1rem',
          animation: 'glow 2s ease-in-out infinite',
        }}>
          {config.title}
        </h1>

        {/* Description */}
        <p style={{
          fontSize: '1.2rem',
          color: 'rgba(255,255,255,0.8)',
          marginBottom: '2rem',
        }}>
          {showResult ? config.arbiter + ' has spoken!' : config.description}
        </p>

        {/* Gladiator Pleading */}
        <div className="gladiator-pleading" style={{
          marginBottom: '2rem',
        }}>
          <div style={{
            width: '200px',
            height: '200px',
            margin: '0 auto',
            animation: showResult
              ? (pleaResult?.spared ? 'victory-bounce 0.5s ease' : 'defeat-shake 0.5s ease')
              : 'plead-shake 2s ease-in-out infinite',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '3px solid rgba(255,255,255,0.3)',
            boxShadow: '0 0 30px rgba(0,0,0,0.5)',
          }}>
            <img
              src={`/assets/pleading-${gladiator?.gender || 'male'}.png`}
              alt="Pleading gladiator"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>
          <p style={{
            fontSize: '1rem',
            opacity: 0.7,
            marginTop: '0.5rem',
          }}>
            {gladiator?.name} pleads for mercy...
          </p>
        </div>

        {/* Thumb Animation */}
        {!showResult && (
          <div className="thumb-container" style={{
            marginBottom: '2rem',
          }}>
            <div ref={thumbRef} style={{
              width: '180px',
              height: '180px',
              transform: `rotate(${thumbAngle}deg)`,
              transition: 'transform 0.1s linear',
              filter: `drop-shadow(0 0 20px ${getThumbColor()})`,
            }}>
              <img
                src="/assets/thumb-up.png"
                alt="Thumb"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            </div>
            <p style={{
              fontSize: '0.9rem',
              opacity: 0.6,
              marginTop: '0.5rem',
            }}>
              The {config.title.toLowerCase().replace('👑 ', '')} is deciding...
            </p>
          </div>
        )}

        {/* Verdict Display */}
        {showResult && (
          <div className="verdict" style={{
            animation: 'scaleIn 0.5s ease',
          }}>
            {/* Large Thumb */}
            <div style={{
              width: '250px',
              height: '250px',
              marginBottom: '1rem',
              animation: pleaResult?.spared
                ? 'victory-pulse 1s ease-in-out infinite'
                : 'none',
              filter: `drop-shadow(0 0 30px ${getThumbColor()})`,
            }}>
              <img
                src={pleaResult?.spared ? '/assets/thumb-up.png' : '/assets/thumb-down.png'}
                alt={pleaResult?.spared ? 'Mercy' : 'No Mercy'}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            </div>

            {/* Verdict Text */}
            <h2 style={{
              fontFamily: '"Cinzel", serif',
              fontSize: '2.5rem',
              color: getThumbColor(),
              textShadow: `0 0 30px ${getThumbColor()}`,
              marginBottom: '1rem',
            }}>
              {getVerdictText()}
            </h2>

            {/* Verdict Message */}
            <p style={{
              fontSize: '1.1rem',
              color: 'rgba(255,255,255,0.9)',
              marginBottom: '2rem',
              maxWidth: '500px',
              margin: '0 auto 2rem auto',
            }}>
              {getVerdictMessage()}
            </p>

            {/* Continue Button */}
            <button
              onClick={() => {
                if (pleaResult?.spared) {
                  onMercy?.()
                } else {
                  onNoMercy?.()
                }
              }}
              className="btn btn-primary"
              style={{
                padding: '1rem 3rem',
                fontSize: '1.2rem',
                background: pleaResult?.spared
                  ? 'linear-gradient(135deg, #228B22, #32CD32)'
                  : 'linear-gradient(135deg, #8B0000, #FF4500)',
                border: `2px solid ${getThumbColor()}`,
              }}
            >
              {pleaResult?.spared ? '✅ Live to Fight!' : '💀 Face Your Fate'}
            </button>
          </div>
        )}

        {/* Mercy Chance Display */}
        {!showResult && (
          <div className="mercy-chance" style={{
            padding: '1rem 2rem',
            background: 'rgba(0,0,0,0.5)',
            borderRadius: '12px',
            border: '1px solid var(--border-glow)',
          }}>
            <p style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '0.5rem' }}>
              Your chance of mercy:
            </p>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#DAA520',
            }}>
              {Math.round(20 + (gladiator?.charisma || 0) * 1.5)}%
            </div>
            <p style={{ fontSize: '0.8rem', opacity: 0.5, marginTop: '0.5rem' }}>
              (Base 20% + {gladiator?.charisma || 0} CHA × 1.5%)
            </p>
          </div>
        )}
      </div>

      {/* Animations */}
      <style>{`
        @keyframes glow {
          0%, 100% { text-shadow: 0 0 30px ${config.color}, 0 0 60px ${config.color}; }
          50% { text-shadow: 0 0 50px ${config.color}, 0 0 100px ${config.color}; }
        }

        @keyframes plead-shake {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          25% { transform: translateX(-5px) rotate(-5deg); }
          75% { transform: translateX(5px) rotate(5deg); }
        }

        @keyframes victory-bounce {
          0% { transform: scale(1); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }

        @keyframes victory-pulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 30px #4CAF50); }
          50% { transform: scale(1.1); filter: drop-shadow(0 0 50px #4CAF50); }
        }

        @keyframes defeat-shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }

        @keyframes scaleIn {
          from { transform: scale(0.5); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .plead-screen {
          animation: fadeIn 0.5s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export default PleadScreen
