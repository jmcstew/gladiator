// LowBlowEasterEgg.jsx - Hidden Secret Attack!
import React, { useState, useEffect, useRef, useCallback } from 'react'

// Konami code sequence
const KONAMI_CODE = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'b', 'a'
]

// Alternative: Secret click pattern (5 rapid clicks on opponent portrait)
const SECRET_CLICK_PATTERN = ['click', 'click', 'click', 'click', 'click']

// Opponent low blow reaction images (in assets folder)
const LOW_BLOW_IMAGES = {
  'Crixus': '/assets/lowblow-crixus.png',
  'Varro': '/assets/lowblow-varro.png',
  'Priscus': '/assets/lowblow-priscus.png',
  'Sicarius': '/assets/lowblow-sicarius.png',
  'Amazonia': '/assets/lowblow-amazonia.png',
  'Kriemhild': '/assets/lowblow-kriemhild.png',
  "Boudicca's Daughter": "/assets/lowblow-boudicca.png",
  'Spartacus Reborn': '/assets/lowblow-spartacus.png',
  'Lycus the Beast': '/assets/lowblow-lycus.png',
  'Cassia the Scarlet': '/assets/lowblow-cassia.png',
  'Grimhild': '/assets/lowblow-grimhild.png',
  'Xylon the Broken': '/assets/lowblow-xylon.png',
}

export const useLowBlowEasterEgg = (battle, setBattle, onVictory) => {
  const [triggered, setTriggered] = useState(false)
  const [showAnimation, setShowAnimation] = useState(false)
  const [clickCount, setClickCount] = useState(0)
  const [clickTimer, setClickTimer] = useState(null)
  
  const keySequence = useRef([])
  const animationTimeout = useRef(null)
  
  // Listen for konami code
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (triggered || showAnimation) return
      
      keySequence.current.push(e.key)
      
      const maxLen = KONAMI_CODE.length
      if (keySequence.current.length > maxLen) {
        keySequence.current = keySequence.current.slice(-maxLen)
      }
      
      const seqStr = keySequence.current.join(',')
      const konamiStr = KONAMI_CODE.join(',')
      
      if (seqStr === konamiStr) {
        activateLowBlow()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [triggered, showAnimation])
  
  const handleOpponentClick = useCallback(() => {
    if (triggered || showAnimation) return
    
    if (clickTimer) {
      clearTimeout(clickTimer)
    }
    
    setClickCount(prev => {
      const newCount = prev + 1
      
      if (newCount >= SECRET_CLICK_PATTERN.length) {
        activateLowBlow()
        return 0
      }
      
      setClickTimer(setTimeout(() => {
        setClickCount(0)
      }, 1500))
      
      return newCount
    })
  }, [triggered, showAnimation, clickTimer])
  
  const activateLowBlow = useCallback(() => {
    if (!battle || triggered || showAnimation) return
    
    setTriggered(true)
    setShowAnimation(true)
    playLowBlowSound()
    
    animationTimeout.current = setTimeout(() => {
      setShowAnimation(false)
      
      if (setBattle && onVictory) {
        setBattle(null)
        onVictory({
          gold: battle.opponent_level * 50,
          xp: battle.opponent_level * 100,
          leveled_up: false,
        })
      }
      
      setTimeout(() => {
        setTriggered(false)
      }, 2000)
    }, 2500)
  }, [battle, triggered, showAnimation, setBattle, onVictory])
  
  useEffect(() => {
    return () => {
      if (animationTimeout.current) clearTimeout(animationTimeout.current)
      if (clickTimer) clearTimeout(clickTimer)
    }
  }, [animationTimeout, clickTimer])
  
  useEffect(() => {
    setClickCount(0)
    setTriggered(false)
    setShowAnimation(false)
    keySequence.current = []
  }, [battle])
  
  return {
    triggered,
    showAnimation,
    clickCount,
    totalClicks: SECRET_CLICK_PATTERN.length,
    handleOpponentClick,
    trigger: activateLowBlow,
  }
}

const playLowBlowSound = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioCtx.createOscillator()
    const gainNode = audioCtx.createGain()
    
    oscillator.type = 'sawtooth'
    oscillator.frequency.setValueAtTime(150, audioCtx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.3)
    
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3)
    
    oscillator.connect(gainNode)
    gainNode.connect(audioCtx.destination)
    
    oscillator.start()
    oscillator.stop(audioCtx.currentTime + 0.3)
  } catch (e) {
    console.log('Audio not available')
  }
}

export const LowBlowAnimation = ({ show, opponentName, onComplete }) => {
  const [currentMessage, setCurrentMessage] = useState(0)
  const [imageError, setImageError] = useState(false)
  
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onComplete, 2500)
      const messageTimer = setInterval(() => {
        setCurrentMessage(prev => (prev + 1) % messages.length)
      }, 800)
      
      return () => {
        clearTimeout(timer)
        clearInterval(messageTimer)
      }
    }
  }, [show, onComplete])
  
  if (!show) return null
  
  const messages = [
    "🎯 THAT'S GOTTA HURT!",
    "😬 DIRECT HIT!",
    "💥 THE OLD ONE-TWO!",
    "⚡ TOO QUICK!",
    "🦵 LOW BLOW ALERT!",
    "😂 OOPS! DIDN'T SEE THAT!",
    "🥊 BELOW THE BELT!",
    "🎭 COMIC TIMING!",
  ]
  
  const message = messages[currentMessage]
  const opponentImage = opponentName ? LOW_BLOW_IMAGES[opponentName] : null
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.95)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      animation: 'lowBlowFlash 0.5s ease-out',
    }}>
      <style>{`
        @keyframes lowBlowFlash {
          0% { background: rgba(255, 0, 0, 0.5); }
          100% { background: rgba(0, 0, 0, 0.95); }
        }
        
        @keyframes lowBlowText {
          0% { opacity: 0; transform: scale(0.5) rotate(-10deg); }
          20% { opacity: 1; transform: scale(1.2) rotate(5deg); }
          40% { transform: scale(1) rotate(0deg); }
          80% { opacity: 1; }
          100% { opacity: 0; transform: translateY(-50px); }
        }
        
        @keyframes lowBlowIcon {
          0% { transform: scale(0) rotate(-180deg); }
          50% { transform: scale(1.5) rotate(0deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
      `}</style>
      
      {/* Opponent reaction image */}
      {opponentImage && !imageError && (
        <div style={{
          width: '280px',
          height: '280px',
          borderRadius: '20px',
          overflow: 'hidden',
          marginBottom: '2rem',
          border: '4px solid #FFD700',
          boxShadow: '0 0 50px rgba(255, 215, 0, 0.5)',
          animation: 'lowBlowIcon 0.5s ease-out',
        }}>
          <img 
            src={opponentImage} 
            alt={`${opponentName} low blow reaction`}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={() => setImageError(true)}
          />
        </div>
      )}
      
      {/* Fallback emoji if no image */}
      {(!opponentImage || imageError) && (
        <div style={{
          fontSize: '8rem',
          animation: 'lowBlowIcon 0.5s ease-out',
          marginBottom: '2rem',
        }}>
          🦵💥
        </div>
      )}
      
      {/* Animated message */}
      <div style={{
        fontSize: '2.5rem',
        fontFamily: 'Cinzel, serif',
        fontWeight: 'bold',
        color: '#FFD700',
        textShadow: '0 0 30px rgba(255, 215, 0, 0.8)',
        animation: 'lowBlowText 2s ease-out forwards',
        textAlign: 'center',
        padding: '0 2rem',
      }}>
        {message}
      </div>
      
      {/* Victory text */}
      <div style={{
        marginTop: '3rem',
        fontSize: '1.5rem',
        color: '#fff',
        opacity: 0,
        animation: 'lowBlowText 1.5s ease-out 0.5s forwards',
      }}>
        ⚔️ INSTANT VICTORY! ⚔️
      </div>
      
      {/* Hint */}
      <div style={{
        position: 'absolute',
        bottom: '2rem',
        fontSize: '0.9rem',
        color: '#666',
        fontStyle: 'italic',
      }}>
        🤫 You found the secret...
      </div>
    </div>
  )
}

export const LowBlowTrigger = ({ battle, setBattle, onVictory, children }) => {
  const { triggered, showAnimation, clickCount, totalClicks, handleOpponentClick } = 
    useLowBlowEasterEgg(battle, setBattle, onVictory)
  
  return (
    <>
      <div onClick={handleOpponentClick} style={{ cursor: 'pointer' }}>
        {children}
      </div>
      
      {/* Click progress dots */}
      {battle && !triggered && clickCount > 0 && (
        <div style={{
          position: 'absolute',
          top: '-20px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '4px',
        }}>
          {[...Array(totalClicks)].map((_, i) => (
            <div
              key={i}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: i < clickCount ? '#FFD700' : '#333',
                transition: 'background 0.2s',
              }}
            />
          ))}
        </div>
      )}
      
      <LowBlowAnimation show={showAnimation} opponentName={battle?.opponent_name} onComplete={() => {}} />
    </>
  )
}

export const LOW_BLOW_ACHIEVEMENT = {
  id: 'dirty_fighter',
  title: 'Dirty Fighter',
  description: 'Discover the secret low blow attack!',
  icon: '🦵',
  category: 'special',
  hidden: true,
}

export { LOW_BLOW_IMAGES }

export default {
  useLowBlowEasterEgg,
  LowBlowAnimation,
  LowBlowTrigger,
  LOW_BLOW_ACHIEVEMENT,
  LOW_BLOW_IMAGES,
  KONAMI_CODE,
}
