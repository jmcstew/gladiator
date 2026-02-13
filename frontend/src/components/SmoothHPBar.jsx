// SmoothHPBar.jsx - Animated Health Bars with Interpolation
import { useState, useEffect, useRef, useCallback } from 'react'

// Animated HP Bar Component
export const SmoothHPBar = ({ 
  currentHP, 
  maxHP, 
  showText = true,
  size = 'medium',
  colorScheme = 'default',
  showPrediction = true,
  temporaryHP = 0,
  label = 'HP',
}) => {
  const [displayHP, setDisplayHP] = useState(currentHP)
  const [prevHP, setPrevHP] = useState(currentHP)
  const [animating, setAnimating] = useState(false)
  const [damageFlash, setDamageFlash] = useState(false)
  const [healFlash, setHealFlash] = useState(false)
  
  const animationRef = useRef(null)
  const startTimeRef = useRef(null)
  const startValueRef = useRef(currentHP)
  const endValueRef = useRef(currentHP)
  
  // Size configurations
  const sizes = {
    small: { height: '8px', fontSize: '0.7rem', padding: '2px' },
    medium: { height: '16px', fontSize: '0.85rem', padding: '4px' },
    large: { height: '24px', fontSize: '1rem', padding: '6px' },
  }
  
  const currentSize = sizes[size] || sizes.medium
  
  // Color schemes
  const colorSchemes = {
    default: {
      high: 'linear-gradient(90deg, #228B22, #32CD32)',
      medium: 'linear-gradient(90deg, #FFA500, #FFD700)',
      low: 'linear-gradient(90deg, #8B0000, #FF4500)',
      critical: 'linear-gradient(90deg, #ff0000, #ff4444)',
    },
    blood: {
      high: 'linear-gradient(90deg, #8B0000, #DC143C)',
      medium: 'linear-gradient(90deg, #8B0000, #FF4500)',
      low: 'linear-gradient(90deg, #5C0000, #8B0000)',
      critical: 'linear-gradient(90deg, #3a0000, #5C0000)',
    },
    magic: {
      high: 'linear-gradient(90deg, #4B0082, #9370DB)',
      medium: 'linear-gradient(90deg, #4B0082, #BA55D3)',
      low: 'linear-gradient(90deg, #2F0050, #4B0082)',
      critical: 'linear-gradient(90deg, #1a0030, #2F0050)',
    },
    gold: {
      high: 'linear-gradient(90deg, #B8860B, #FFD700)',
      medium: 'linear-gradient(90deg, #B8860B, #DAA520)',
      low: 'linear-gradient(90deg, #8B6508, #B8860B)',
      critical: 'linear-gradient(90deg, #5C4800, #8B6508)',
    },
  }
  
  const currentColors = colorSchemes[colorScheme] || colorSchemes.default
  
  // Get HP percentage
  const hpPercent = Math.max(0, Math.min(100, (displayHP / maxHP) * 100))
  const totalPercent = Math.max(0, Math.min(100, ((displayHP + temporaryHP) / maxHP) * 100))
  const tempPercent = Math.max(0, Math.min(100, (temporaryHP / maxHP) * 100))
  
  // Determine color based on HP
  const getColor = () => {
    if (hpPercent <= 15) return currentColors.critical
    if (hpPercent <= 35) return currentColors.low
    if (hpPercent <= 60) return currentColors.medium
    return currentColors.high
  }
  
  // Animation function
  const animateHP = useCallback((startHP, endHP, duration = 300) => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    
    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp
      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function (ease-out)
      const eased = 1 - Math.pow(1 - progress, 3)
      
      const newHP = startHP + (endHP - startHP) * eased
      setDisplayHP(newHP)
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        setAnimating(false)
      }
    }
    
    animationRef.current = requestAnimationFrame(animate)
  }, [])
  
  // Trigger animation when HP changes
  useEffect(() => {
    if (currentHP !== prevHP) {
      setAnimating(true)
      startTimeRef.current = null
      startValueRef.current = displayHP
      endValueRef.current = Math.max(0, currentHP)
      
      // Trigger flash effect
      if (currentHP < prevHP) {
        setDamageFlash(true)
        setTimeout(() => setDamageFlash(false), 150)
      } else if (currentHP > prevHP) {
        setHealFlash(true)
        setTimeout(() => setHealFlash(false), 150)
      }
      
      animateHP(displayHP, currentHP, Math.abs(currentHP - prevHP) * 2 + 200)
      setPrevHP(currentHP)
    }
  }, [currentHP, prevHP, displayHP, animateHP])
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])
  
  return (
    <div className="hp-bar-container" style={{ width: '100%' }}>
      {/* Label */}
      {showText && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '4px',
          fontSize: currentSize.fontSize,
          fontWeight: 'bold',
          color: hpPercent <= 15 ? '#ff4444' : 'inherit',
        }}>
          <span>{label}</span>
          <span style={{ 
            color: animating ? 'var(--secondary)' : 'inherit',
            transition: 'color 0.2s',
          }}>
            {Math.ceil(displayHP)} / {maxHP}
            {temporaryHP > 0 && ` (+${temporaryHP})`}
          </span>
        </div>
      )}
      
      {/* Main HP Bar */}
      <div style={{
        position: 'relative',
        background: '#1a1a1a',
        height: currentSize.height,
        borderRadius: currentSize.height,
        overflow: 'hidden',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)',
        transition: 'transform 0.1s',
        transform: damageFlash ? 'scale(1.02)' : 'scale(1)',
      }}>
        {/* Background gradient */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(255,255,255,0.05)',
        }} />
        
        {/* HP Fill */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: `${hpPercent}%`,
          background: getColor(),
          borderRadius: currentSize.height,
          transition: 'width 0.1s linear, background 0.3s',
          boxShadow: hpPercent <= 15 ? 
            '0 0 20px rgba(255,0,0,0.5), inset 0 -2px 4px rgba(0,0,0,0.3)' :
            'inset 0 -2px 4px rgba(0,0,0,0.3)',
          filter: healFlash ? 'brightness(1.3)' : 'none',
        }}>
          {/* Shine effect */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '40%',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.3), transparent)',
            borderRadius: `${currentSize.height} ${currentSize.height} 0 0`,
          }} />
        </div>
        
        {/* Temporary HP overlay */}
        {temporaryHP > 0 && (
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            height: '100%',
            width: `${tempPercent}%`,
            background: 'linear-gradient(90deg, rgba(100,149,237,0.6), rgba(65,105,225,0.4))',
            borderRadius: currentSize.height,
            borderLeft: '2px solid #6495ED',
          }}>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: currentSize.fontSize * 0.7,
              color: '#87CEEB',
              fontWeight: 'bold',
            }}>
              +{temporaryHP}
            </div>
          </div>
        )}
        
        {/* Prediction indicator (incoming damage) */}
        {showPrediction && temporaryHP === 0 && animating && (
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            height: '100%',
            width: '3px',
            background: '#ff0000',
            animation: 'predictionPulse 0.5s ease-in-out',
          }} />
        )}
        
        {/* Critical HP warning pulse */}
        {hpPercent <= 15 && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: currentSize.height,
            border: '2px solid rgba(255,0,0,0.5)',
            animation: 'criticalPulse 1s ease-in-out infinite',
          }} />
        )}
      </div>
      
      {/* HP Text */}
      {showText && (
        <div style={{
          textAlign: 'center',
          marginTop: '4px',
          fontSize: currentSize.fontSize * 0.8,
          opacity: 0.7,
        }}>
          {Math.round((displayHP / maxHP) * 100)}%
        </div>
      )}
      
      <style>{`
        @keyframes predictionPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        
        @keyframes criticalPulse {
          0%, 100% { border-color: rgba(255,0,0,0.3); }
          50% { border-color: rgba(255,0,0,0.8); }
        }
        
        @keyframes healPulse {
          0% { filter: brightness(1); }
          50% { filter: brightness(1.5); }
          100% { filter: brightness(1); }
        }
      `}</style>
    </div>
  )
}

// Dual HP Bar (Player + Enemy side by side)
export const BattleHPBars = ({ 
  playerHP, 
  playerMaxHP, 
  enemyHP, 
  enemyMaxHP,
  enemyName,
  showLabels = true,
}) => {
  return (
    <div style={{
      display: 'flex',
      gap: '2rem',
      justifyContent: 'space-between',
      marginBottom: '1rem',
    }}>
      {/* Player HP */}
      <div style={{ flex: 1 }}>
        <SmoothHPBar
          currentHP={playerHP}
          maxHP={playerMaxHP}
          label="YOU"
          size="medium"
          colorScheme="default"
        />
      </div>
      
      {/* VS indicator */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: 'var(--secondary)',
      }}>
        VS
      </div>
      
      {/* Enemy HP */}
      <div style={{ flex: 1 }}>
        {showLabels && (
          <div style={{
            textAlign: 'center',
            marginBottom: '4px',
            fontSize: '0.9rem',
            color: 'var(--secondary)',
            fontWeight: 'bold',
          }}>
            {enemyName}
          </div>
        )}
        <SmoothHPBar
          currentHP={enemyHP}
          maxHP={enemyMaxHP}
          label="ENEMY"
          size="medium"
          colorScheme="blood"
        />
      </div>
    </div>
  )
}

// Mini HP Bar (compact, no text)
export const MiniHPBar = ({ currentHP, maxHP }) => {
  const percent = Math.max(0, Math.min(100, (currentHP / maxHP) * 100))
  
  return (
    <div style={{
      width: '100%',
      height: '4px',
      background: '#333',
      borderRadius: '2px',
      overflow: 'hidden',
    }}>
      <div style={{
        width: `${percent}%`,
        height: '100%',
        background: percent > 50 ? '#4CAF50' : percent > 25 ? '#FFA500' : '#f44336',
        transition: 'width 0.3s ease',
      }} />
    </div>
  )
}

export default {
  SmoothHPBar,
  BattleHPBars,
  MiniHPBar,
}
