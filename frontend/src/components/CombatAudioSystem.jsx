// CombatAudioSystem.jsx - Dynamic Combat Music & Sound Effects
import { useState, useEffect, useRef, useCallback } from 'react'

// Music/Sound states
export const AUDIO_STATES = {
  IDLE: 'idle',
  BATTLE_NORMAL: 'battle_normal',
  BATTLE_INTENSE: 'battle_intense',
  CRITICAL: 'critical',
  VICTORY: 'victory',
  DEFEAT: 'defeat',
  PLEAD: 'plead',
}

// Sound effect definitions (using Web Audio API)
const SOUND_EFFECTS = {
  // Hit sounds
  HIT_NORMAL: { frequency: 200, duration: 0.1, type: 'sawtooth' },
  HIT_CRIT: { frequency: 400, duration: 0.2, type: 'square' },
  HIT_BLOCK: { frequency: 150, duration: 0.1, type: 'sine' },
  
  // UI sounds
  BUTTON_CLICK: { frequency: 800, duration: 0.05, type: 'sine' },
  LEVEL_UP: { frequency: 523, duration: 0.1, type: 'square' },
  ACHIEVEMENT: { frequency: 659, duration: 0.3, type: 'triangle' },
  
  // Combat ambience
  SWING_WHOOSH: { frequency: 300, duration: 0.15, type: 'sawtooth' },
  SWORD_CLANG: { frequency: 800, duration: 0.1, type: 'square' },
  
  // Special
  SPECIAL_ATTACK: { frequency: 523, duration: 0.3, type: 'sawtooth' },
  VICTORY_FANFARE: { frequency: 659, duration: 0.5, type: 'triangle' },
  DEFEAT_MUSIC: { frequency: 220, duration: 1.0, type: 'sine' },
}

// Ambient noise generators
const createAmbientNoise = (context, type) => {
  const bufferSize = context.sampleRate * 2
  const buffer = context.createBuffer(1, bufferSize, context.sampleRate)
  const data = buffer.getChannelData(0)
  
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1
  }
  
  const noise = context.createBufferSource()
  noise.buffer = buffer
  noise.loop = true
  
  const gainNode = context.createGain()
  gainNode.gain.value = 0
  
  const filter = context.createBiquadFilter()
  filter.type = type === 'crowd' ? 'lowpass' : 'bandpass'
  filter.frequency.value = type === 'crowd' ? 1000 : 2000
  
  noise.connect(filter)
  filter.connect(gainNode)
  
  return { noise, gainNode, filter }
}

// Play a simple sound effect
export const playSound = (soundName, volume = 1.0) => {
  const context = new (window.AudioContext || window.webkitAudioContext)()
  const sound = SOUND_EFFECTS[soundName]
  
  if (!sound) return
  
  const oscillator = context.createOscillator()
  const gainNode = context.createGain()
  
  oscillator.type = sound.type
  oscillator.frequency.setValueAtTime(sound.frequency, context.currentTime)
  
  gainNode.gain.setValueAtTime(volume * 0.3, context.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + sound.duration)
  
  oscillator.connect(gainNode)
  gainNode.connect(context.destination)
  
  oscillator.start()
  oscillator.stop(context.currentTime + sound.duration)
}

// Combat Audio Hook
export const useCombatAudio = () => {
  const [audioState, setAudioState] = useState(AUDIO_STATES.IDLE)
  const [intensity, setIntensity] = useState(0)
  const [volume, setVolume] = useState(0.5)
  const [muted, setMuted] = useState(false)
  
  const audioContextRef = useRef(null)
  const gainNodeRef = useRef(null)
  const oscillatorsRef = useRef([])
  
  // Initialize audio context
  useEffect(() => {
    const initAudio = async () => {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
      gainNodeRef.current = audioContextRef.current.createGain()
      gainNodeRef.current.gain.value = volume
      gainNodeRef.current.connect(audioContextRef.current.destination)
    }
    
    initAudio()
    
    return () => {
      oscillatorsRef.current.forEach(osc => {
        try { osc.stop() } catch (e) {}
      })
      audioContextRef.current?.close()
    }
  }, [])
  
  // Update volume
  useEffect(() => {
    gainNodeRef.current?.gain.setValueAtTime(muted ? 0 : volume, audioContextRef.current?.currentTime || 0)
  }, [volume, muted])
  
  // Play state change sound
  useEffect(() => {
    if (audioState === AUDIO_STATES.CRITICAL) {
      playSound('HIT_CRIT', 0.5)
    }
  }, [audioState])
  
  const setBattleState = useCallback((state, newIntensity = 0) => {
    setAudioState(state)
    setIntensity(newIntensity)
    
    // Adjust gain based on intensity
    if (gainNodeRef.current) {
      const targetGain = muted ? 0 : volume * (0.5 + newIntensity * 0.5)
      gainNodeRef.current.gain.linearRampToValueAtTime(
        targetGain,
        (audioContextRef.current?.currentTime || 0) + 0.5
      )
    }
  }, [volume, muted])
  
  const playHitSound = useCallback((isCrit = false) => {
    playSound(isCrit ? 'HIT_CRIT' : 'HIT_NORMAL', isCrit ? 0.8 : 0.5)
  }, [])
  
  const playVictorySound = useCallback(() => {
    playSound('VICTORY_FANFARE', 0.6)
  }, [])
  
  const playDefeatSound = useCallback(() => {
    playSound('DEFEAT_MUSIC', 0.4)
  }, [])
  
  const playLevelUpSound = useCallback(() => {
    playSound('LEVEL_UP', 0.6)
    setTimeout(() => playSound('ACHIEVEMENT', 0.4), 150)
  }, [])
  
  const playAchievementSound = useCallback(() => {
    playSound('ACHIEVEMENT', 0.5)
  }, [])
  
  const playButtonSound = useCallback(() => {
    playSound('BUTTON_CLICK', 0.3)
  }, [])
  
  const toggleMute = useCallback(() => {
    setMuted(prev => !prev)
  }, [])
  
  return {
    audioState,
    intensity,
    volume,
    muted,
    setBattleState,
    setIntensity,
    setVolume,
    playHitSound,
    playVictorySound,
    playDefeatSound,
    playLevelUpSound,
    playAchievementSound,
    playButtonSound,
    toggleMute,
  }
}

// Sound Notification Component
export const SoundNotification = ({ show, message, type = 'info', onComplete }) => {
  useEffect(() => {
    if (show && onComplete) {
      const timer = setTimeout(onComplete, 2000)
      return () => clearTimeout(timer)
    }
  }, [show, onComplete])
  
  if (!show) return null
  
  const icons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    achievement: '🏆',
    critical: '💥',
  }
  
  return (
    <div className={`sound-notification ${type}`} style={{
      position: 'fixed',
      top: '100px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: type === 'achievement' ? 
        'linear-gradient(135deg, rgba(255,215,0,0.9), rgba(139,69,19,0.9))' :
        'rgba(0,0,0,0.8)',
      border: `2px solid ${type === 'achievement' ? '#FFD700' : '#666'}`,
      borderRadius: '12px',
      padding: '1rem 2rem',
      zIndex: 1000,
      animation: 'notificationSlide 0.3s ease-out',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      fontFamily: 'Cinzel, serif',
      fontSize: '1.2rem',
    }}>
      <style>{`
        @keyframes notificationSlide {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
      <span style={{ fontSize: '1.5rem' }}>{icons[type]}</span>
      <span>{message}</span>
    </div>
  )
}

// Audio Settings Component
export const AudioSettings = ({ volume, muted, onVolumeChange, onMuteToggle }) => {
  return (
    <div className="audio-settings" style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'rgba(0,0,0,0.8)',
      border: '1px solid var(--secondary)',
      borderRadius: '8px',
      padding: '1rem',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    }}>
      <button 
        onClick={onMuteToggle}
        style={{
          background: 'none',
          border: 'none',
          fontSize: '1.5rem',
          cursor: 'pointer',
        }}
      >
        {muted ? '🔇' : '🔊'}
      </button>
      
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={volume}
        onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
        style={{
          width: '100px',
          accentColor: 'var(--secondary)',
        }}
      />
      
      <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>
        {Math.round(volume * 100)}%
      </span>
    </div>
  )
}

// Battle Intensity Meter
export const IntensityMeter = ({ intensity }) => {
  return (
    <div className="intensity-meter" style={{
      position: 'fixed',
      bottom: '80px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: '4px',
      zIndex: 50,
    }}>
      {[1, 2, 3, 4, 5].map(level => (
        <div
          key={level}
          style={{
            width: '30px',
            height: '10px',
            borderRadius: '4px',
            background: intensity >= level ? 
              `linear-gradient(90deg, #ff4444, #FFD700)` :
              'rgba(255,255,255,0.2)',
            transition: 'all 0.3s ease',
            boxShadow: intensity >= level ? 
              `0 0 10px ${level >= 4 ? '#ff0000' : '#ffaa00'}` : 
              'none',
          }}
        />
      ))}
    </div>
  )
}

// Export all utilities
export default {
  AUDIO_STATES,
  playSound,
  useCombatAudio,
  SoundNotification,
  AudioSettings,
  IntensityMeter,
}
