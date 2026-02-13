// CombatEffects.jsx - AAA Blood Splatter & Depth of Field Effects
import { useState, useEffect, useCallback, useRef } from 'react'

// Blood particle configurations
const BLOOD_COLORS = ['#8B0000', '#5C0000', '#cc0000', '#3a0000', '#a00000']

// Generate random blood splatter effect
export const createBloodSplatter = (containerRef, x, y, intensity = 1) => {
  if (!containerRef.current) return []
  
  const effects = []
  const particleCount = Math.floor(5 + intensity * 10)
  
  for (let i = 0; i < particleCount; i++) {
    const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5
    const distance = 20 + Math.random() * 60 * intensity
    const size = 3 + Math.random() * 5
    
    effects.push({
      id: `blood-${Date.now()}-${i}`,
      type: 'spatter',
      x: x,
      y: y,
      size: size,
      color: BLOOD_COLORS[Math.floor(Math.random() * BLOOD_COLORS.length)],
      tx: Math.cos(angle) * distance,
      ty: Math.sin(angle) * distance - 20,
      delay: Math.random() * 0.1,
    })
  }
  
  // Add some drip drops
  const dripCount = Math.floor(2 + intensity * 3)
  for (let i = 0; i < dripCount; i++) {
    effects.push({
      id: `drip-${Date.now()}-${i}`,
      type: 'drip',
      x: x + (Math.random() - 0.5) * 40,
      y: y,
      size: 4 + Math.random() * 4,
      dripDistance: 80 + Math.random() * 120,
      delay: 0.2 + Math.random() * 0.3,
    })
  }
  
  // Add a blood pool on ground
  effects.push({
    id: `pool-${Date.now()}`,
    type: 'pool',
    x: x,
    y: y + 30,
    size: 60 + Math.random() * 40,
  })
  
  return effects
}

// Create burst blood effect (for finishing moves)
export const createBloodBurst = (x, y) => {
  const particles = []
  const particleCount = 12
  
  for (let i = 0; i < particleCount; i++) {
    const angle = (Math.PI * 2 * i) / particleCount
    particles.push({
      id: `burst-${Date.now()}-${i}`,
      x: x,
      y: y,
      px: Math.cos(angle) * (30 + Math.random() * 40),
      py: Math.sin(angle) * (30 + Math.random() * 40),
      size: 4 + Math.random() * 4,
      delay: Math.random() * 0.1,
    })
  }
  
  return particles
}

// Create splash effect (light hit)
export const createBloodSplash = (x, y) => {
  return {
    id: `splash-${Date.now()}`,
    x: x,
    y: y,
    size: 40 + Math.random() * 20,
  }
}

// Blood Splatter Component
export const BloodSplatter = ({ effects, onComplete }) => {
  useEffect(() => {
    if (effects.length === 0) return
    
    const timers = effects.map(effect => {
      const duration = effect.type === 'pool' ? 800 : 
                       effect.type === 'drip' ? 2000 : 
                       effect.type === 'burst' ? 500 : 600
      
      return setTimeout(() => {
        onComplete(effect.id)
      }, duration + (effect.delay || 0) * 1000)
    })
    
    return () => timers.forEach(clearTimeout)
  }, [effects, onComplete])
  
  return (
    <div className="blood-splatter" style={{ position: 'absolute', width: '100%', height: '100%' }}>
      {effects.map(effect => {
        if (effect.type === 'spatter') {
          return (
            <div
              key={effect.id}
              className="blood-spatter"
              style={{
                left: effect.x,
                top: effect.y,
                width: effect.size,
                height: effect.size,
                background: effect.color,
                '--tx': `${effect.tx}px`,
                '--ty': `${effect.ty}px`,
                animationDelay: `${effect.delay}s`,
              }}
            />
          )
        }
        if (effect.type === 'drip') {
          return (
            <div
              key={effect.id}
              className="blood-drop"
              style={{
                left: effect.x,
                top: effect.y,
                width: effect.size,
                height: effect.size * 1.5,
                '--drip-distance': `${effect.dripDistance}px`,
                animationDelay: `${effect.delay}s`,
              }}
            />
          )
        }
        if (effect.type === 'pool') {
          return (
            <div
              key={effect.id}
              className="blood-pool"
              style={{
                left: effect.x - effect.size / 2,
                top: effect.y,
                width: effect.size,
                height: effect.size / 4,
              }}
            />
          )
        }
        if (effect.type === 'burst') {
          return (
            <div
              key={effect.id}
              className="blood-burst"
              style={{
                left: effect.x - 50,
                top: effect.y - 50,
              }}
            >
              <div
                className="burst-particle"
                style={{
                  left: '50%',
                  top: '50%',
                  '--px': `${effect.px}px`,
                  '--py': `${effect.py}px`,
                  animationDelay: `${effect.delay}s`,
                }}
              />
            </div>
          )
        }
        if (effect.type === 'splash') {
          return (
            <div
              key={effect.id}
              className="blood-splash"
              style={{
                left: effect.x - effect.size / 2,
                top: effect.y - effect.size / 2,
                width: effect.size,
                height: effect.size,
              }}
            />
          )
        }
        return null
      })}
    </div>
  )
}

// Depth of Field Overlay Component
export const DepthOfField = ({ active, focusX = 50, focusY = 50, intensity = 'medium' }) => {
  const getIntensityClass = () => {
    switch (intensity) {
      case 'strong': return 'strong'
      case 'subtle': return 'subtle'
      default: return ''
    }
  }
  
  return (
    <div
      className={`depth-of-field ${active ? 'active' : ''} ${getIntensityClass()}`}
      style={{
        '--dof-focus-x': `${focusX}%`,
        '--dof-focus-y': `${focusY}%`,
      }}
    />
  )
}

// Vignette Focus Component (alternative to DoF)
export const VignetteFocus = ({ active, focusX = 50, focusY = 50, intense = false }) => {
  return (
    <div
      className={`vignette-focus ${active ? 'active' : ''} ${intense ? 'intense' : ''}`}
      style={{
        '--focus-x': `${focusX}%`,
        '--focus-y': `${focusY}%`,
      }}
    />
  )
}

// Hit Stop Hook
export const useHitStop = () => {
  const [hitStop, setHitStop] = useState(false)
  
  const triggerHitStop = useCallback((duration = 100) => {
    setHitStop(true)
    setTimeout(() => setHitStop(false), duration)
  }, [])
  
  return { hitStop, triggerHitStop }
}

// Screen Shake Hook
export const useScreenShake = () => {
  const [shaking, setShaking] = useState(false)
  const [shakeIntensity, setShakeIntensity] = useState(1)
  
  const triggerShake = useCallback((intensity = 1, duration = 300) => {
    setShakeIntensity(intensity)
    setShaking(true)
    setTimeout(() => setShaking(false), duration)
  }, [])
  
  return { shaking, shakeIntensity, triggerShake }
}

// Screen Shake Component
export const ScreenShake = ({ shaking, intensity = 1 }) => {
  if (!shaking) return null
  
  const keyframes = `
    @keyframes shake-${intensity} {
      0%, 100% { transform: translate(0, 0); }
      10% { transform: translate(${-3 * intensity}px, ${2 * intensity}px); }
      20% { transform: translate(${-6 * intensity}px, ${-2 * intensity}px); }
      30% { transform: translate(${-3 * intensity}px, ${3 * intensity}px); }
      40% { transform: translate(${3 * intensity}px, ${-3 * intensity}px); }
      50% { transform: translate(${6 * intensity}px, ${2 * intensity}px); }
      60% { transform: translate(${3 * intensity}px, ${-2 * intensity}px); }
      70% { transform: translate(${-3 * intensity}px, ${3 * intensity}px); }
      80% { transform: translate(${-6 * intensity}px, ${-1 * intensity}px); }
      90% { transform: translate(${-3 * intensity}px, ${2 * intensity}px); }
    }
  `
  
  return (
    <>
      <style>{keyframes}</style>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        animation: `shake-${intensity} 0.3s ease`,
      }} />
    </>
  )
}

// Combo Counter Component
export const ComboCounter = ({ combo, maxCombo }) => {
  if (combo < 2) return null
  
  return (
    <div className="combo-counter">
      <span>COMBO</span>
      {combo}×
    </div>
  )
}

// Critical Hit Flash Component
export const CriticalFlash = ({ active }) => {
  if (!active) return null
  
  return (
    <div className="critical-flash" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none',
      zIndex: 9998,
    }} />
  )
}

// Slow Motion Hook
export const useSlowMotion = () => {
  const [slowMo, setSlowMo] = useState(false)
  
  const triggerSlowMo = useCallback((duration = 1500) => {
    setSlowMo(true)
    setTimeout(() => setSlowMo(false), duration)
  }, [])
  
  return { slowMo, triggerSlowMo }
}

// Slow Motion Overlay
export const SlowMotionOverlay = ({ active }) => {
  if (!active) return null
  
  return (
    <div className="slow-motion" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none',
      zIndex: 9997,
      background: 'radial-gradient(circle, transparent 30%, rgba(255,200,100,0.1) 60%, rgba(255,150,50,0.2) 100%)',
    }} />
  )
}

// Finisher Effect Component
export const FinisherEffect = ({ active, onComplete }) => {
  useEffect(() => {
    if (active) {
      const timer = setTimeout(onComplete, 1000)
      return () => clearTimeout(timer)
    }
  }, [active, onComplete])
  
  if (!active) return null
  
  return (
    <div className="finisher-sequence" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none',
      zIndex: 9996,
      background: 'radial-gradient(circle, transparent 20%, rgba(255,0,0,0.3) 60%, rgba(139,0,0,0.6) 100%)',
    }} />
  )
}

// ============ DAMAGE NUMBER SYSTEM ============

// Damage number types
export const DAMAGE_TYPES = {
  NORMAL: 'normal',
  CRIT: 'crit',
  GLANCING: 'glancing',
  HEAL: 'heal',
  BLOCKED: 'blocked',
  MISS: 'miss',
  EXECUTE: 'execute',
}

// Create damage number data
export const createDamageNumber = (value, type = DAMAGE_TYPES.NORMAL, options = {}) => {
  const {
    x = 50,
    y = 40,
    delay = 0,
  } = options
  
  return {
    id: `damage-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    value,
    type,
    x,
    y,
    delay,
  }
}

// Create multiple damage numbers for combo
export const createComboDamage = (values, options = {}) => {
  return values.map((value, index) => 
    createDamageNumber(value, DAMAGE_TYPES.NORMAL, {
      ...options,
      delay: index * 0.1,
      x: options.x + (Math.random() - 0.5) * 10,
      y: options.y + (Math.random() - 0.5) * 5,
    })
  )
}

// Damage Number Display Component
export const DamageNumber = ({ damage }) => {
  const { value, type, x, y, delay } = damage
  
  const getPrefix = () => {
    switch (type) {
      case DAMAGE_TYPES.HEAL: return '+'
      case DAMAGE_TYPES.BLOCKED: return '🛡️ '
      case DAMAGE_TYPES.MISS: return 'Miss'
      case DAMAGE_TYPES.EXECUTE: return '💀 '
      default: return '-'
    }
  }
  
  return (
    <div
      className={`damage-number ${type}`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        animationDelay: `${delay}s`,
      }}
    >
      {getPrefix()}{typeof value === 'number' ? Math.abs(value) : value}
    </div>
  )
}

// Container for multiple damage numbers
export const DamageNumbers = ({ damages, onComplete }) => {
  useEffect(() => {
    if (damages.length === 0) return
    
    const maxDuration = 1200 // 1.2s max animation
    const timer = setTimeout(() => {
      if (damages.length > 0 && onComplete) {
        // Clear all damage numbers after animation
        damages.forEach(d => {
          if (d.type === DAMAGE_TYPES.CRIT) {
            onComplete(d.id)
          }
        })
      }
    }, maxDuration)
    
    return () => clearTimeout(timer)
  }, [damages, onComplete])
  
  if (damages.length === 0) return null
  
  return (
    <div className="damage-container">
      {damages.map((damage) => (
        <DamageNumber key={damage.id} damage={damage} />
      ))}
    </div>
  )
}

// Hook for managing damage numbers
export const useDamageNumbers = () => {
  const [damages, setDamages] = useState([])
  
  const addDamage = useCallback((value, type = DAMAGE_TYPES.NORMAL, options = {}) => {
    const damage = createDamageNumber(value, type, options)
    setDamages(prev => [...prev, damage])
    
    // Auto-remove after animation
    const duration = type === DAMAGE_TYPES.CRIT ? 1200 : 
                    type === DAMAGE_TYPES.EXECUTE ? 1500 : 1000
    setTimeout(() => {
      setDamages(prev => prev.filter(d => d.id !== damage.id))
    }, duration + (damage.delay * 1000))
  }, [])
  
  const addCrit = useCallback((value, options = {}) => {
    addDamage(value, DAMAGE_TYPES.CRIT, options)
  }, [addDamage])
  
  const addHeal = useCallback((value, options = {}) => {
    addDamage(value, DAMAGE_TYPES.HEAL, options)
  }, [addDamage])
  
  const addMiss = useCallback((options = {}) => {
    addDamage('Miss', DAMAGE_TYPES.MISS, options)
  }, [addDamage])
  
  const addBlocked = useCallback((value = 0, options = {}) => {
    addDamage(value, DAMAGE_TYPES.BLOCKED, options)
  }, [addDamage])
  
  const addExecute = useCallback((options = {}) => {
    addDamage('EXECUTION', DAMAGE_TYPES.EXECUTE, options)
  }, [addDamage])
  
  const clear = useCallback(() => {
    setDamages([])
  }, [])
  
  return {
    damages,
    addDamage,
    addCrit,
    addHeal,
    addMiss,
    addBlocked,
    addExecute,
    clear,
  }
}

// Floating Text Component (for custom messages)
export const FloatingText = ({ text, x = 50, y = 30, duration = 1500, color = '#FFD700' }) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        fontFamily: 'Cinzel, serif',
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color,
        textShadow: `0 0 20px ${color}`,
        animation: `floatingText ${duration}ms ease-out forwards`,
        pointerEvents: 'none',
        zIndex: 101,
        whiteSpace: 'nowrap',
      }}
    >
      {text}
      <style>{`
        @keyframes floatingText {
          0% {
            opacity: 0;
            transform: translateY(0) scale(0.5);
          }
          20% {
            opacity: 1;
            transform: translateY(-10px) scale(1.1);
          }
          100% {
            opacity: 0;
            transform: translateY(-60px) scale(1);
          }
        }
      `}</style>
    </div>
  )
}

// Victory Popup Component
export const VictoryPopup = ({ show, onComplete, gold = 0, xp = 0 }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onComplete, 2000)
      return () => clearTimeout(timer)
    }
  }, [show, onComplete])
  
  if (!show) return null
  
  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'linear-gradient(135deg, rgba(0,0,0,0.9), rgba(50,50,50,0.9))',
        border: '3px solid #FFD700',
        borderRadius: '20px',
        padding: '2rem 3rem',
        textAlign: 'center',
        zIndex: 1000,
        animation: 'victoryPopup 0.5s ease-out',
      }}
    >
      <style>{`
        @keyframes victoryPopup {
          0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 0;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.1);
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
        }
      `}</style>
      <h2 style={{
        color: '#FFD700',
        fontFamily: 'Cinzel, serif',
        fontSize: '2.5rem',
        marginBottom: '1rem',
        textShadow: '0 0 20px rgba(255, 215, 0, 0.5)',
      }}>
        🏆 VICTORY 🏆
      </h2>
      <div style={{ color: '#fff', fontSize: '1.2rem' }}>
        <div>💰 +{gold} Gold</div>
        <div>⭐ +{xp} XP</div>
      </div>
    </div>
  )
}

// Export all utilities
export default {
  // Blood Effects
  createBloodSplatter,
  createBloodBurst,
  createBloodSplash,
  BloodSplatter,
  
  // Post-Processing
  DepthOfField,
  VignetteFocus,
  
  // Combat Effects
  useHitStop,
  useScreenShake,
  ScreenShake,
  ComboCounter,
  CriticalFlash,
  useSlowMotion,
  SlowMotionOverlay,
  FinisherEffect,
  
  // Damage Numbers
  DAMAGE_TYPES,
  createDamageNumber,
  createComboDamage,
  DamageNumber,
  DamageNumbers,
  useDamageNumbers,
  
  // Text Effects
  FloatingText,
  VictoryPopup,
}
