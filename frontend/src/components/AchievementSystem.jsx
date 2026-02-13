// AchievementSystem.jsx - Achievement UI and State Management
import { useState, useEffect, useCallback } from 'react'

// Achievement definitions
export const ACHIEVEMENTS = {
  // Combat achievements
  FIRST_BLOOD: {
    id: 'first_blood',
    title: 'First Blood',
    description: 'Deal your first damage in combat',
    icon: '⚔️',
    category: 'combat',
    condition: (stats) => stats.totalDamageDealt >= 1,
    hidden: false,
  },
  KILL_10: {
    id: 'kill_10',
    title: 'Arena Veteran',
    description: 'Defeat 10 opponents',
    icon: '💀',
    category: 'combat',
    condition: (stats) => stats.wins >= 10,
    hidden: false,
  },
  KILL_50: {
    id: 'kill_50',
    title: 'Legend Killer',
    description: 'Defeat 50 opponents',
    icon: '🗡️',
    category: 'combat',
    condition: (stats) => stats.wins >= 50,
    hidden: false,
  },
  KILL_100: {
    id: 'kill_100',
    title: 'Champion of Rome',
    description: 'Defeat 100 opponents',
    icon: '🏆',
    category: 'combat',
    condition: (stats) => stats.wins >= 100,
    hidden: false,
  },
  UNTOUCHABLE: {
    id: 'untouchable',
    title: 'Untouchable',
    description: 'Win a battle without taking damage',
    icon: '🛡️',
    category: 'combat',
    condition: (stats) => stats.battlesNoDamage >= 1,
    hidden: false,
  },
  COMBO_MASTER: {
    id: 'combo_master',
    title: 'Combo Master',
    description: 'Reach 10 combo in a single battle',
    icon: '🔥',
    category: 'combat',
    condition: (stats) => stats.maxCombo >= 10,
    hidden: false,
  },
  CRITICAL_KING: {
    id: 'critical_king',
    title: 'Critical King',
    description: 'Land 10 critical hits',
    icon: '💥',
    category: 'combat',
    condition: (stats) => stats.totalCrits >= 10,
    hidden: false,
  },
  
  // Progression achievements
  LEVEL_5: {
    id: 'level_5',
    title: 'Rising Gladiator',
    description: 'Reach level 5',
    icon: '⭐',
    category: 'progression',
    condition: (stats) => stats.level >= 5,
    hidden: false,
  },
  LEVEL_10: {
    id: 'level_10',
    title: 'Arena Legend',
    description: 'Reach level 10',
    icon: '🌟',
    category: 'progression',
    condition: (stats) => stats.level >= 10,
    hidden: false,
  },
  REACH_ROME: {
    id: 'reach_rome',
    title: 'All Roads Lead to Rome',
    description: 'Travel to Rome for the first time',
    icon: '🏛️',
    category: 'progression',
    condition: (stats) => stats.visitedCities?.includes('Rome'),
    hidden: false,
  },
  DEFEAT_CHAMPION: {
    id: 'defeat_champion',
    title: 'Champion Slayer',
    description: 'Defeat the Emperor\'s Champion',
    icon: '👑',
    category: 'progression',
    condition: (stats) => stats.bossesDefeated?.includes('The Emperor\'s Champion'),
    hidden: false,
  },
  
  // Collection achievements
  FIRST_PET: {
    id: 'first_pet',
    title: 'Animal Friend',
    description: 'Adopt your first pet',
    icon: '🐾',
    category: 'collection',
    condition: (stats) => (stats.pets?.length || 0) >= 1,
    hidden: false,
  },
  PET_COLLECTOR: {
    id: 'pet_collector',
    title: 'Pet Collector',
    description: 'Own 5 different pets',
    icon: '🐕',
    category: 'collection',
    condition: (stats) => (stats.pets?.length || 0) >= 5,
    hidden: false,
  },
  FIRST_LEGENDARY: {
    id: 'first_legendary',
    title: 'Fortune Smiles',
    description: 'Acquire your first legendary item',
    icon: '💎',
    category: 'collection',
    condition: (stats) => stats.legendaryItems >= 1,
    hidden: false,
  },
  FULL_SET: {
    id: 'full_set',
    title: 'Armored to the Teeth',
    description: 'Equip items in all 6 slots',
    icon: '🛡️',
    category: 'collection',
    condition: (stats) => stats.equippedSlots >= 6,
    hidden: false,
  },
  
  // Gold achievements
  GOLD_1000: {
    id: 'gold_1000',
    title: 'Wealthy Warrior',
    description: 'Accumulate 1,000 gold',
    icon: '💰',
    category: 'wealth',
    condition: (stats) => stats.totalGoldEarned >= 1000,
    hidden: false,
  },
  GOLD_10000: {
    id: 'gold_10000',
    title: 'Richest in Rome',
    description: 'Accumulate 10,000 gold',
    icon: '💴',
    category: 'wealth',
    condition: (stats) => stats.totalGoldEarned >= 10000,
    hidden: false,
  },
  
  // Special achievements
  EXECUTIONER: {
    id: 'executioner',
    title: 'Executioner',
    description: 'Defeat an opponent in Capua (execution)',
    icon: '⚰️',
    category: 'special',
    condition: (stats) => stats.executions >= 1,
    hidden: false,
  },
  ESCAPED: {
    id: 'escaped',
    title: 'Lucky Survivor',
    description: 'Successfully plead for mercy',
    icon: '🙏',
    category: 'special',
    condition: (stats) => stats.successfulPleads >= 1,
    hidden: false,
  },
  DIRTY_FIGHTER: {
    id: 'dirty_fighter',
    title: 'Dirty Fighter',
    description: 'Discover the secret low blow attack!',
    icon: '🦵',
    category: 'special',
    condition: (stats) => stats.lowBlowUsed >= 1,
    hidden: true,
  },
  SPEED_DEMO: {
    id: 'speed_demo',
    title: 'Speed Demon',
    description: 'Win a battle in under 30 seconds',
    icon: '⚡',
    category: 'special',
    condition: (stats) => stats.fastestWin <= 30,
    hidden: true,
  },
}

// Achievement Categories
export const CATEGORIES = {
  all: { name: 'All', icon: '🏅' },
  combat: { name: 'Combat', icon: '⚔️' },
  progression: { name: 'Progression', icon: '📈' },
  collection: { name: 'Collection', icon: '🎒' },
  wealth: { name: 'Wealth', icon: '💰' },
  special: { name: 'Special', icon: '⭐' },
}

// Achievement Hook
export const useAchievements = (gladiatorStats = {}) => {
  const [unlocked, setUnlocked] = useState([])
  const [recentAchievement, setRecentAchievement] = useState(null)
  const [showNotification, setShowNotification] = useState(false)
  
  // Load saved achievements
  useEffect(() => {
    const saved = localStorage.getItem('gladiator_achievements')
    if (saved) {
      setUnlocked(JSON.parse(saved))
    }
  }, [])
  
  // Check achievements against stats
  const checkAchievements = useCallback((stats) => {
    const newUnlocked = []
    
    Object.values(ACHIEVEMENTS).forEach(achievement => {
      if (!unlocked.includes(achievement.id) && achievement.condition(stats)) {
        newUnlocked.push(achievement.id)
      }
    })
    
    if (newUnlocked.length > 0) {
      const updated = [...unlocked, ...newUnlocked]
      setUnlocked(updated)
      localStorage.setItem('gladiator_achievements', JSON.stringify(updated))
      
      // Show notification for first new achievement
      const latest = newUnlocked[newUnlocked.length - 1]
      const achievement = Object.values(ACHIEVEMENTS).find(a => a.id === latest)
      if (achievement) {
        setRecentAchievement(achievement)
        setShowNotification(true)
      }
    }
  }, [unlocked])
  
  // Dismiss notification
  const dismissNotification = useCallback(() => {
    setShowNotification(false)
    setRecentAchievement(null)
  }, [])
  
  // Reset achievements (for testing)
  const resetAchievements = useCallback(() => {
    setUnlocked([])
    localStorage.removeItem('gladiator_achievements')
  }, [])
  
  // Get progress for specific achievement
  const getProgress = useCallback((achievementId, stats) => {
    const achievement = ACHIEVEMENTS[achievementId]
    if (!achievement) return null
    
    // This would need custom logic per achievement
    return { current: 0, target: 1, percent: 0 }
  }, [])
  
  return {
    unlocked,
    recentAchievement,
    showNotification,
    checkAchievements,
    dismissNotification,
    resetAchievements,
    getProgress,
  }
}

// Achievement Badge Component
export const AchievementBadge = ({ achievement, unlocked, size = 'medium' }) => {
  const sizes = {
    small: { icon: '1.5rem', font: '0.7rem', padding: '0.3rem' },
    medium: { icon: '2.5rem', font: '0.9rem', padding: '0.5rem' },
    large: { icon: '4rem', font: '1.2rem', padding: '0.8rem' },
  }
  
  const currentSize = sizes[size] || sizes.medium
  
  return (
    <div 
      className={`achievement-badge ${unlocked ? 'unlocked' : 'locked'}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: currentSize.padding,
        background: unlocked ? 
          'linear-gradient(135deg, rgba(255,215,0,0.2), rgba(218,165,32,0.1))' :
          'rgba(0,0,0,0.3)',
        border: unlocked ? '2px solid #FFD700' : '1px solid #444',
        borderRadius: '12px',
        opacity: unlocked ? 1 : 0.5,
        transition: 'all 0.3s ease',
        cursor: unlocked ? 'pointer' : 'default',
        minWidth: '80px',
      }}
      title={unlocked ? achievement.description : '??? - Not yet unlocked'}
    >
      <div style={{ fontSize: currentSize.icon, filter: unlocked ? 'none' : 'grayscale(100%)' }}>
        {unlocked ? achievement.icon : '🔒'}
      </div>
      <div style={{
        fontSize: currentSize.font,
        fontWeight: 'bold',
        color: unlocked ? '#FFD700' : '#666',
        textAlign: 'center',
        marginTop: '4px',
        fontFamily: 'Cinzel, serif',
      }}>
        {unlocked ? achievement.title : '???'}
      </div>
    </div>
  )
}

// Achievement Notification Popup
export const AchievementNotification = ({ achievement, show, onDismiss }) => {
  useEffect(() => {
    if (show && onDismiss) {
      const timer = setTimeout(onDismiss, 4000)
      return () => clearTimeout(timer)
    }
  }, [show, onDismiss])
  
  if (!show || !achievement) return null
  
  return (
    <div className="achievement-notification" style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'linear-gradient(135deg, rgba(0,0,0,0.95), rgba(50,30,0,0.95))',
      border: '3px solid #FFD700',
      borderRadius: '20px',
      padding: '2rem 3rem',
      zIndex: 2000,
      textAlign: 'center',
      animation: 'achievementPopup 0.5s ease-out',
      boxShadow: '0 0 50px rgba(255,215,0,0.5)',
    }}>
      <style>{`
        @keyframes achievementPopup {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.5);
          }
          50% {
            transform: translate(-50%, -50%) scale(1.1);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
      `}</style>
      
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</div>
      <div style={{
        fontSize: '1.2rem',
        color: '#FFD700',
        fontFamily: 'Cinzel, serif',
        marginBottom: '0.5rem',
        textTransform: 'uppercase',
        letterSpacing: '0.2em',
      }}>
        Achievement Unlocked!
      </div>
      <div style={{
        fontSize: '2rem',
        color: '#fff',
        fontFamily: 'Cinzel, serif',
        marginBottom: '0.5rem',
      }}>
        {achievement.icon} {achievement.title}
      </div>
      <div style={{
        fontSize: '1rem',
        color: '#ccc',
        opacity: 0.8,
      }}>
        {achievement.description}
      </div>
    </div>
  )
}

// Achievement Gallery Page
export const AchievementGallery = ({ unlockedAchievements }) => {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false)
  
  const filteredAchievements = Object.values(ACHIEVEMENTS).filter(achievement => {
    if (showUnlockedOnly && !unlockedAchievements.includes(achievement.id)) {
      return false
    }
    if (selectedCategory !== 'all' && achievement.category !== selectedCategory) {
      return false
    }
    return true
  })
  
  const unlockedCount = unlockedAchievements.length
  const totalCount = Object.keys(ACHIEVEMENTS).length
  
  return (
    <div className="achievement-gallery" style={{
      padding: '2rem',
      background: 'rgba(0,0,0,0.5)',
      borderRadius: '16px',
      minHeight: '400px',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '2px solid var(--secondary)',
      }}>
        <h2 style={{
          fontFamily: 'Cinzel, serif',
          color: 'var(--secondary)',
          margin: 0,
        }}>
          🏆 Achievements
        </h2>
        <div style={{
          fontSize: '1.2rem',
          color: '#FFD700',
        }}>
          {unlockedCount} / {totalCount} Unlocked
        </div>
      </div>
      
      {/* Progress bar */}
      <div style={{
        width: '100%',
        height: '8px',
        background: '#333',
        borderRadius: '4px',
        marginBottom: '2rem',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${(unlockedCount / totalCount) * 100}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #FFD700, #FFA500)',
          borderRadius: '4px',
          transition: 'width 0.5s ease',
        }} />
      </div>
      
      {/* Category filters */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        marginBottom: '2rem',
      }}>
        {Object.entries(CATEGORIES).map(([key, category]) => (
          <button
            key={key}
            onClick={() => setSelectedCategory(key)}
            style={{
              padding: '0.5rem 1rem',
              background: selectedCategory === key ? 
                'var(--primary)' : 'rgba(255,255,255,0.1)',
              border: `1px solid ${selectedCategory === key ? 'var(--secondary)' : '#444'}`,
              borderRadius: '20px',
              color: '#fff',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {category.icon} {category.name}
          </button>
        ))}
      </div>
      
      {/* Toggle unlocked only */}
      <label style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '2rem',
        cursor: 'pointer',
      }}>
        <input
          type="checkbox"
          checked={showUnlockedOnly}
          onChange={(e) => setShowUnlockedOnly(e.target.checked)}
        />
        Show unlocked only
      </label>
      
      {/* Achievement grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: '1rem',
      }}>
        {filteredAchievements.map(achievement => (
          <AchievementBadge
            key={achievement.id}
            achievement={achievement}
            unlocked={unlockedAchievements.includes(achievement.id)}
            size="medium"
          />
        ))}
      </div>
    </div>
  )
}

export default {
  ACHIEVEMENTS,
  CATEGORIES,
  useAchievements,
  AchievementBadge,
  AchievementNotification,
  AchievementGallery,
}
