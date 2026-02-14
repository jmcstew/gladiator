import React, { useState, useEffect, useRef, useCallback } from 'react'
import GameOverScreen from './GameOverScreen'
import CapturedScreen from './CapturedScreen'
import PleadScreen from './PleadScreen'
import {
  createBloodSplatter,
  createBloodBurst,
  createBloodSplash,
  BloodSplatter,
  DepthOfField,
  VignetteFocus,
  useScreenShake,
  ScreenShake,
  CriticalFlash,
  useSlowMotion,
  SlowMotionOverlay,
  FinisherEffect,
  ComboCounter,
  DamageNumbers,
  DAMAGE_TYPES,
  useDamageNumbers,
  VictoryPopup
} from './CombatEffects'
import { SmoothHPBar, BattleHPBars } from './SmoothHPBar'
import { useOpponentDialogue, DialogueBox } from './OpponentDialogue'
import { useCombatAudio, AUDIO_STATES } from './CombatAudioSystem'
import { useAchievements, AchievementNotification } from './AchievementSystem'
import { useSaveSystem } from '../hooks/useSaveSystem'
import { LowBlowTrigger, LowBlowAnimation } from './LowBlowEasterEgg'

const API_URL = 'http://localhost:8000'

function Arena({
  gladiator,
  onCityChange,
  onGameOver,
  onRestart,
  combatStats: propCombatStats,
  setCombatStats: propSetCombatStats,
  settings = { musicVolume: 0.7, sfxVolume: 0.8, masterVolume: 0.5 },
  autoSave: propAutoSave
}) {
  // Local state for combat stats (sync with parent)
  const [combatStats, setCombatStats] = useState(propCombatStats || {
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
    lowBlowUsed: 0,
    enemiesDefeated: [],
    bossesDefeated: [],
  })

  // Sync with parent when props change
  useEffect(() => {
    if (propCombatStats) {
      setCombatStats(propCombatStats)
    }
  }, [propCombatStats])

  // Save system
  const { autoSave } = useSaveSystem()

  // Auto-save after battle ends
  useEffect(() => {
    if (!gladiator) return

    // Check if we just finished a battle (battle is null but we have combat data)
    const lastBattleEnded = localStorage.getItem('all_roads_last_battle_ended')
    const now = Date.now()

    // Only auto-save once after battle ends
    if (lastBattleEnded && now - parseInt(lastBattleEnded) < 5000) {
      autoSave(gladiator, combatStats, settings)
      localStorage.removeItem('all_roads_last_battle_ended')
    }
  }, [gladiator, combatStats, settings, autoSave])
  const [battle, setBattle] = useState(null)
  const [log, setLog] = useState([])
  const [loading, setLoading] = useState(false)
  const [gladiatorHP, setGladiatorHP] = useState(gladiator.endurance * 10)
  const [opponentHP, setOpponentHP] = useState(0)
  const [showEffect, setShowEffect] = useState(null)
  const [showLoot, setShowLoot] = useState(false)
  const [availableLoot, setAvailableLoot] = useState([])
  const [lastBattleId, setLastBattleId] = useState(null)
  const [isCaptured, setIsCaptured] = useState(false)
  const [captureDetails, setCaptureDetails] = useState(null)
  const [gameOver, setGameOver] = useState(false)
  const [showPlead, setShowPlead] = useState(false)
  const [pleadResult, setPleadResult] = useState(null)
  const [victoryData, setVictoryData] = useState(null)
  const [lowBlowVictory, setLowBlowVictory] = useState(null)

  // Combat Effects State
  const [bloodEffects, setBloodEffects] = useState([])
  const [depthOfField, setDepthOfField] = useState({ active: false, focusX: 50, focusY: 50, intensity: 'medium' })
  const [vignette, setVignette] = useState({ active: false, focusX: 50, focusY: 50, intense: false })
  const [criticalFlash, setCriticalFlash] = useState(false)
  const [finisherActive, setFinisherActive] = useState(false)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)



  // Hooks for effects
  const { shaking, shakeIntensity, triggerShake } = useScreenShake()
  const { damages, addDamage, addCrit, addHeal, addMiss, addExecute, clear: clearDamages } = useDamageNumbers()
  const { slowMo, triggerSlowMo } = useSlowMotion()
  const { audioState, setBattleState, playHitSound, playVictorySound, playDefeatSound, playLevelUpSound, playButtonSound, toggleMute, muted } = useCombatAudio()
  const { currentDialogue, showDialogue, say: sayDialogue } = useOpponentDialogue(battle?.opponent_name)
  const { recentAchievement, showNotification, dismissNotification, checkAchievements } = useAchievements(combatStats)

  const logRef = useRef(null)
  const battlefieldRef = useRef(null)
  const comboTimerRef = useRef(null)
  const battleStartHP = useRef(null)
  const enemyStartHP = useRef(null)

  const effects = {
    attack: '/assets/attack-effect.png',
    defend: '/assets/defend-effect.png',
    special: '/assets/special-effect.png',
    flee: '/assets/flee-effect.png',
    victory: '/assets/victory.png',
    defeat: '/assets/defeat.png',
    captured: '/assets/defeat.png',
  }

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [log])

  // Clear blood effects periodically
  useEffect(() => {
    if (bloodEffects.length > 50) {
      setBloodEffects(prev => prev.slice(-30))
    }
  }, [bloodEffects.length])

  // Combo timeout
  useEffect(() => {
    if (combo > 0) {
      if (comboTimerRef.current) clearTimeout(comboTimerRef.current)
      comboTimerRef.current = setTimeout(() => setCombo(0), 3000)
    }
  }, [combo])

  // Check achievements when stats change
  useEffect(() => {
    checkAchievements(combatStats)
  }, [combatStats, checkAchievements])

  const removeBloodEffect = useCallback((id) => {
    setBloodEffects(prev => prev.filter(e => e.id !== id))
  }, [])

  const triggerBloodEffect = useCallback((type, x, y, intensity = 1) => {
    let newEffects = []
    if (type === 'burst') {
      newEffects = createBloodBurst(x, y)
    } else if (type === 'splash') {
      newEffects.push(createBloodSplash(x, y))
    } else {
      newEffects = createBloodSplatter(battlefieldRef, x, y, intensity)
    }
    setBloodEffects(prev => [...prev, ...newEffects])
  }, [battlefieldRef])

  const startBattle = async (type = 'arena') => {
    setLoading(true)
    setLog([])
    setShowLoot(false)
    setShowEffect(null)
    setIsCaptured(false)
    setCaptureDetails(null)
    setBloodEffects([])
    setCombo(0)
    clearDamages()

    // Play button sound
    playButtonSound()

    // Focus depth of field on battlefield
    setDepthOfField({ active: true, focusX: 50, focusY: 50, intensity: 'subtle' })
    setTimeout(() => setDepthOfField(prev => ({ ...prev, active: false })), 1000)

    // Set battle music
    setBattleState(AUDIO_STATES.BATTLE_NORMAL)

    try {
      const res = await fetch(`${API_URL}/arena/start/${gladiator.id}?battle_type=${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!res.ok) {
        const error = await res.json()
        setLog([`❌ ${error.detail || 'Battle failed'}`])
        setLoading(false)
        setBattleState(AUDIO_STATES.IDLE)
        return
      }

      const data = await res.json()
      setBattle(data)
      setGladiatorHP(data.gladiator_hp)
      setOpponentHP(data.opponent_hp)

      // Track starting HP for "no damage" achievement
      battleStartHP.current = data.gladiator_hp
      enemyStartHP.current = data.opponent_hp

      setLog([`⚔️ Battle started against ${data.opponent_name} (Lv.${data.opponent_level})!`])

      // Focus on opponent during battle start
      setDepthOfField({ active: true, focusX: 70, focusY: 40, intensity: 'medium' })
      setTimeout(() => setDepthOfField(prev => ({ ...prev, active: false })), 1500)

      // Show opponent pre-battle dialogue
      sayDialogue('preBattle')

      // Enable actions after dialogue
      setLoading(false)

      if (data.dialogue) {
        setLog(prev => [...prev, `\n💬 "${data.dialogue}"`])
      }
    } catch (err) {
      setLog([`❌ Error: ${err.message}`])
      setLoading(false)
      setBattleState(AUDIO_STATES.IDLE)
    }
  }

  const takeAction = async (action) => {
    if (!battle) return

    playButtonSound()
    setShowEffect(action)
    setTimeout(() => setShowEffect(null), 500)
    triggerShake(action === 'special' ? 2 : 1, action === 'special' ? 200 : 300)
    setLoading(true)

    // Combo increase
    const newCombo = combo + 1
    setCombo(newCombo)
    if (newCombo > maxCombo) {
      setMaxCombo(newCombo)
      setCombatStats(prev => ({ ...prev, maxCombo: newCombo }))
    }

    try {
      const res = await fetch(`${API_URL}/arena/battle/${battle.battle_id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })

      const data = await res.json()

      if (data.captured) {
        setIsCaptured(true)
        setCaptureDetails(data.captured_details)
        setShowEffect('captured')
        triggerShake(3, 500)
        playDefeatSound()

        // Track stats
        setCombatStats(prev => ({
          ...prev,
          losses: prev.losses + 1,
          executed: data.executed ? prev.executed + 1 : prev.executed,
        }))

        setLog(prev => [...prev,
        `\n💀 ${data.message}`,
        `\n📍 Sent back to: ${data.captured_details.new_city}`,
        `📦 Lost equipment: ${data.captured_details.lost_equipment.join(', ') || 'None'}`
        ])

        // Heavy vignette on capture
        setVignette({ active: true, focusX: 50, focusY: 50, intense: true })
        setTimeout(() => setVignette(prev => ({ ...prev, active: false })), 2000)

        setBattleState(AUDIO_STATES.DEFEAT)
        onCityChange?.(data.captured_details.new_city)
        // Trigger auto-save after battle
        localStorage.setItem('all_roads_last_battle_ended', Date.now().toString())
        setBattle(null)
        setLoading(false)
        return
      }

      // Calculate hit intensity for blood effects
      const isCrit = data.damage_dealt > battle.opponent_level * 3
      const hitIntensity = isCrit ? 2 : (data.damage_dealt / battle.opponent_level)
      const isSpecial = action === 'special'

      // Update combat stats
      if (data.damage_dealt > 0) {
        setCombatStats(prev => ({
          ...prev,
          totalDamageDealt: prev.totalDamageDealt + data.damage_dealt,
          totalCrits: isCrit ? prev.totalCrits + 1 : prev.totalCrits,
        }))
      }

      // Show damage number with new system
      if (data.damage_dealt > 0) {
        if (isCrit) {
          addCrit(data.damage_dealt, { x: 70, y: 40 })
        } else {
          addDamage(data.damage_dealt, DAMAGE_TYPES.NORMAL, { x: 70 + (Math.random() - 0.5) * 10, y: 40 + (Math.random() - 0.5) * 5 })
        }
      } else if (data.damage_dealt === 0 && action !== 'defend') {
        addMiss({ x: 70, y: 40 })
        sayDialogue('onHit') // Enemy taunts on miss
      }

      // Play hit sound
      if (data.damage_dealt > 0) {
        playHitSound(isCrit)
      }

      // Critical flash for big hits
      if (isCrit) {
        setCriticalFlash(true)
        setTimeout(() => setCriticalFlash(false), 150)

        // Slow motion on critical hits
        triggerSlowMo(800)

        // Focus depth of field
        setDepthOfField({ active: true, focusX: 70, focusY: 40, intensity: 'strong' })
        setTimeout(() => setDepthOfField(prev => ({ ...prev, active: false })), 500)

        // Enemy reacts to crit
        sayDialogue('onCrit')
      } else if (data.damage_dealt > 0) {
        // Enemy taunts on normal hit
        sayDialogue('onHit')
      }

      // Blood splatter on opponent hit
      if (data.damage_dealt > 0 && !isSpecial) {
        triggerBloodEffect('splash', 70 + Math.random() * 10, 40 + Math.random() * 10, hitIntensity)
      }

      // Heavy blood burst on critical hits
      if (isCrit) {
        triggerBloodEffect('burst', 70, 40, 2)
      }

      // Screen shake on big hits
      if (data.damage_dealt > battle.opponent_level * 2 || isSpecial) {
        triggerShake(isCrit ? 3 : (isSpecial ? 2 : 1), isCrit ? 400 : 300)
      }

      // Handle Plead result
      if (action === 'plead') {
        setLoading(false)
        const result = {
          spared: data.escaped && data.spared,
          escaped: data.escaped,
        }
        setPleadResult(result)
        setShowPlead(true)

        if (data.escaped) {
          setCombatStats(prev => ({ ...prev, successfulPleads: prev.successfulPleads + 1 }))
          setDepthOfField({ active: true, focusX: 50, focusY: 50, intensity: 'subtle' })
        } else {
          sayDialogue('lowHP') // Enemy mocks failed plead
        }
        return
      }

      if (data.escaped === false && data.spared === false) {
        setLog(prev => [...prev, `💀 PLEA DENIED! The Emperor shows no mercy!`])
        triggerShake(2, 500)
        setVignette({ active: true, focusX: 50, focusY: 50, intense: true })
        setTimeout(() => setVignette(prev => ({ ...prev, active: false })), 1500)
      }

      // Check for low HP dialogue
      if (data.opponent_hp <= battle.opponent_level * 2) {
        sayDialogue('lowHP')
      }

      const roundLog = [
        `📍 Round ${data.rounds}:`,
        `   You used ${action}: Dealt ${data.damage_dealt}, Took ${data.damage_taken}`,
        `   Your HP: ${data.gladiator_hp} | Opponent HP: ${data.opponent_hp}`,
      ]

      if (data.victory === true) {
        roundLog.push(`🎉 VICTORY! +${data.gold_earned} gold, +${data.experience_earned} XP`)
        if (data.leveled_up) {
          roundLog.push(`⬆️ LEVEL UP!`)
          playLevelUpSound()
          setCombatStats(prev => ({ ...prev, level: prev.level + 1 }))
        }
        setShowEffect('victory')
        setLastBattleId(battle.battle_id)

        // Track no-damage victory
        if (battleStartHP.current && battleStartHP.current === data.gladiator_hp) {
          setCombatStats(prev => ({ ...prev, battlesNoDamage: prev.battlesNoDamage + 1 }))
        }

        // Track gold earned
        setCombatStats(prev => ({ ...prev, wins: prev.wins + 1, totalGoldEarned: prev.totalGoldEarned + data.gold_earned }))

        // Show victory popup
        setVictoryData({ gold: data.gold_earned, xp: data.experience_earned })
        setTimeout(() => setVictoryData(null), 2000)

        // Play victory sound
        playVictorySound()
        setBattleState(AUDIO_STATES.VICTORY)

        // Victory effects
        setFinisherActive(true)
        setTimeout(() => setFinisherActive(false), 1000)

        // Victory vignette
        setVignette({ active: true, focusX: 50, focusY: 50, intense: false })
        setTimeout(() => setVignette(prev => ({ ...prev, active: false })), 2000)

        // Blood pool effect
        triggerBloodEffect('pool', 70, 55, 1)

        // Enemy defeat dialogue
        sayDialogue('defeat')

      } else if (data.victory === false) {
        roundLog.push(`💀 DEFEAT! +${data.experience_earned} XP`)
        setShowEffect('defeat')
        triggerShake(3, 500)
        playDefeatSound()
        setBattleState(AUDIO_STATES.DEFEAT)

        // Track stats
        setCombatStats(prev => ({ ...prev, losses: prev.losses + 1, executed: data.executed ? prev.executed + 1 : prev.executed }))

        // Heavy blood on defeat
        triggerBloodEffect('burst', 70, 40, 1.5)

        if (data.executed) {
          setGameOver(true)
          setVignette({ active: true, focusX: 50, focusY: 50, intense: true })
        } else {
          sayDialogue('victory') // Enemy boasts on victory
        }
      }

      setLog(prev => [...prev, roundLog.join('\n')])
      setGladiatorHP(data.gladiator_hp)
      setOpponentHP(data.opponent_hp)

      if (data.victory !== null) {
        // Trigger auto-save after battle
        localStorage.setItem('all_roads_last_battle_ended', Date.now().toString())
        setBattle(null)
        setTimeout(() => setBattleState(AUDIO_STATES.IDLE), 2000)
        if (data.victory === true) {
          fetchLoot(battle.battle_id)
        }
      }
    } catch (err) {
      setLog(prev => [...prev, `❌ Error: ${err.message}`])
    } finally {
      setLoading(false)
    }
  }

  const fetchLoot = async (battleId) => {
    try {
      const res = await fetch(`${API_URL}/arena/battle/${battleId}/available-loot`)
      const data = await res.json()
      if (data.can_loot && data.loot.length > 0) {
        setAvailableLoot(data.loot)
        setShowLoot(true)
      }
    } catch (err) {
      console.error('Failed to fetch loot:', err)
    }
  }

  const lootItem = async (itemId) => {
    try {
      const res = await fetch(`${API_URL}/arena/battle/${lastBattleId}/loot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: itemId }),
      })

      if (res.ok) {
        const data = await res.json()
        setLog(prev => [...prev, `🏆 Looted: ${data.item.name}!`])
        setShowLoot(false)

        // Track legendary items
        if (data.item.rarity === 'legendary') {
          setCombatStats(prev => ({ ...prev, legendaryItems: prev.legendaryItems + 1 }))
        }
      }
    } catch (err) {
      alert('Failed to loot item')
    }
  }

  const maxGladiatorHP = gladiator.endurance * 10
  const maxOpponentHP = battle ? battle.opponent_level * 10 : 100

  const getOpponentPortrait = (name) => {
    const portraits = {
      // Capua opponents
      'Crixus': '/assets/opponent-crixus.png',
      'Varro': '/assets/opponent-varro.png',
      'Priscus': '/assets/opponent-priscus.png',
      // Alexandria opponents
      'Sicarius': '/assets/opponent-3-sicarius.png',
      'Amazonia': '/assets/opponent-6-amazonia.png',
      'Kriemhild': '/assets/opponent-4-kriemhild.png',
      "Boudicca's Daughter": '/assets/opponent-2-boudicca.png',
      // Rome opponents
      'Spartacus Reborn': '/assets/opponent-7-spartacus.png',
      'Lycus the Beast': '/assets/opponent-8-lycus.png',
      'Lyca the Beast': '/assets/opponent-8-lycus.png',
      'Cassia the Scarlet': '/assets/opponent-9-cassia.png',
      'Grimhild': '/assets/opponent-10-grimhild.png',
      'Xylon the Broken': '/assets/opponent-5-xylon.png',
    }
    return portraits[name] || '/assets/defeat.png'
  }

  return (
    <div className="arena">
      {/* Combat Effects Overlays */}
      <ScreenShake shaking={shaking} intensity={shakeIntensity} />
      <CriticalFlash active={criticalFlash} />
      <SlowMotionOverlay active={slowMo} />
      <FinisherEffect active={finisherActive} onComplete={() => setFinisherActive(false)} />
      <DepthOfField {...depthOfField} />
      <VignetteFocus {...vignette} />
      <ComboCounter combo={combo} maxCombo={maxCombo} />

      {/* Achievement Notification */}
      <AchievementNotification
        achievement={recentAchievement}
        show={showNotification}
        onDismiss={dismissNotification}
      />

      {/* Dialogue Box */}
      <DialogueBox
        dialogue={currentDialogue}
        show={showDialogue}
        onComplete={() => { }}
      />

      {/* Player Panel */}
      <div className="gladiator-panel card">
        <h3>{gladiator.name}</h3>
        <div className="avatar">
          {gladiator.gender === 'male' ? '👨' : '👩'}
        </div>
        <p className="city-badge">📍 {gladiator.current_city || 'Capua'}</p>

        <div className="stats-grid" style={{ marginTop: '1rem' }}>
          <div className="stat">
            <div className="stat-value">{gladiator.strength}</div>
            <div className="stat-label">STR</div>
          </div>
          <div className="stat">
            <div className="stat-value">{gladiator.agility}</div>
            <div className="stat-label">AGI</div>
          </div>
          <div className="stat">
            <div className="stat-value">{gladiator.endurance}</div>
            <div className="stat-label">END</div>
          </div>
          <div className="stat">
            <div className="stat-value">{gladiator.charisma || 0}</div>
            <div className="stat-label">CHA</div>
          </div>
        </div>

        {/* Smooth HP Bar for Player */}
        <div style={{ marginTop: '1rem', width: '100%' }}>
          <SmoothHPBar
            currentHP={gladiatorHP}
            maxHP={maxGladiatorHP}
            label="HP"
            size="medium"
            colorScheme="default"
            showPrediction={true}
          />
        </div>

        {gladiator.current_city !== 'Capua' && (
          <div className="capture-warning">
            ⚠️ Lose = Capture & Equipment Loss!
          </div>
        )}
      </div>

      {/* Battlefield */}
      <div
        ref={battlefieldRef}
        className={`battlefield card ${shaking ? 'screen-shake' : ''}`}
        style={{
          backgroundImage: 'url(/assets/arena-bg.png)',
          backgroundSize: 'cover',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <BloodSplatter effects={bloodEffects} onComplete={removeBloodEffect} />

        <h3>🏟️ {gladiator.current_city || 'Capua'} Arena</h3>

        {isCaptured ? (
          <CapturedScreen
            gladiator={gladiator}
            captureDetails={captureDetails}
            onContinue={() => {
              setIsCaptured(false)
              setCaptureDetails(null)
              onCityChange?.('Capua')
            }}
          />
        ) : !battle ? (
          <div className="battle-start">
            {/* Arena Floor Animation */}
            <div className="arena-floor">
              <div className="arena-sand"></div>
              <div className="arena-lines"></div>
            </div>
            
            <p style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Choose your challenge in {gladiator.current_city || 'Capua'}:</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary battle-btn"
                onClick={() => startBattle('arena')}
                disabled={loading}
              >
                <span className="btn-icon">⚔️</span>
                <span>Arena Fight</span>
              </button>
              <button
                className="btn btn-secondary battle-btn"
                onClick={() => startBattle('tournament')}
                disabled={loading}
              >
                <span className="btn-icon">🏆</span>
                <span>Tournament</span>
              </button>
              {gladiator.current_city === 'Rome' && (
                <button
                  className="btn btn-danger battle-btn boss-btn"
                  onClick={() => startBattle('boss')}
                  disabled={loading}
                >
                  <span className="btn-icon">👹</span>
                  <span>BOSS: Emperor's Champion</span>
                </button>
              )}
            </div>

            {gladiator.current_city !== 'Capua' && (
              <p className="warning-text pulse-warning">
                ⚠️ Warning: Outside Capua, defeat means capture and equipment loss!
              </p>
            )}
          </div>
        ) : (
          <div className="battle-active">
            {/* Enhanced VS Display */}
            <div className="vs-display">
              <div className="vs-badge">
                <span className="vs-text">VS</span>
                <span className="vs-glow"></span>
              </div>
              <h4 className="vs-opponent">{battle.opponent_name}</h4>
            </div>

            {/* Round Counter */}
            <div className="round-counter">
              <span className="round-label">ROUND</span>
              <span className="round-number">{battle.rounds || 1}</span>
            </div>

            {/* Combat Effect */}
            {showEffect && (
              <div className="combat-effect" style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 100,
              }}>
                <img
                  src={effects[showEffect]}
                  alt={showEffect}
                  style={{ width: '200px', height: '200px', objectFit: 'contain' }}
                />
              </div>
            )}

            {/* Smooth HP Bar for Enemy */}
            <div style={{ margin: '1rem 0', position: 'relative' }}>
              <SmoothHPBar
                currentHP={opponentHP}
                maxHP={maxOpponentHP}
                label={battle.opponent_name}
                size="medium"
                colorScheme="blood"
                showPrediction={true}
              />

              {/* Floating Damage Numbers */}
              <DamageNumbers
                damages={damages}
                onComplete={(id) => { }}
              />
            </div>

            {/* Battle Log with enhanced styling */}
            <div className="battle-log enhanced-log" ref={logRef}>
              {log.length === 0 ? (
                <div className="log-placeholder">
                  <span className="placeholder-icon">⚔️</span>
                  <p>The battle awaits...</p>
                </div>
              ) : (
                log.map((entry, i) => (
                  <div 
                    key={i} 
                    className={`round ${entry.includes('VICTORY') ? 'victory' : ''} ${entry.includes('DEFEAT') ? 'defeat' : ''}`}
                  >
                    {entry}
                  </div>
                ))
              )}
            </div>

            {/* Action Feedback Indicators */}
            <div className="action-indicators">
              <div className="turn-indicator">
                {loading ? (
                  <>
                    <span className="thinking-dots"></span>
                    <span>Battle in progress...</span>
                  </>
                ) : (
                  <>
                    <span className="ready-dot"></span>
                    <span>Your turn!</span>
                  </>
                )}
              </div>
            </div>

            {/* Loot Modal */}
            {showLoot && (
              <div className="loot-modal">
                <div className="card victory-animation" style={{ maxWidth: '500px', width: '90%' }}>
                  <h3>🏆 Victory! Loot the fallen...</h3>
                  <p>Choose ONE item from your defeated opponent:</p>
                  <div className="loot-options">
                    {availableLoot.map(item => (
                      <div
                        key={item.id}
                        className="loot-item"
                        onClick={() => lootItem(item.id)}
                      >
                        <strong>{item.name}</strong>
                        <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                          {item.type === 'weapon' ? `⚔️ ${item.damage} Damage` : `🛡️ ${item.armor} Armor`}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: item.rarity === 'legendary' ? '#FFD700' : '#888' }}>
                          {item.rarity?.toUpperCase()}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    className="btn btn-secondary"
                    style={{ marginTop: '1rem' }}
                    onClick={() => setShowLoot(false)}
                  >
                    Skip Loot
                  </button>
                </div>
              </div>
            )}

            <div className="battle-controls enhanced-controls">
              <button
                className="btn btn-primary control-btn attack-btn"
                onClick={() => takeAction('attack')}
                disabled={loading}
              >
                <span className="control-icon">🗡️</span>
                <span className="control-label">ATTACK</span>
                <span className="control-desc">Deal damage</span>
              </button>
              <button
                className="btn btn-secondary control-btn defend-btn"
                onClick={() => takeAction('defend')}
                disabled={loading}
              >
                <span className="control-icon">🛡️</span>
                <span className="control-label">DEFEND</span>
                <span className="control-desc">Reduce damage</span>
              </button>
              <button
                className="btn btn-secondary control-btn special-btn"
                onClick={() => takeAction('special')}
                disabled={loading}
              >
                <span className="control-icon">✨</span>
                <span className="control-label">SPECIAL</span>
                <span className="control-desc">High damage, may miss</span>
              </button>
              <button
                className="btn btn-plead control-btn plead-btn"
                onClick={() => takeAction('plead')}
                disabled={loading}
              >
                <span className="control-icon">🙏</span>
                <span className="control-label">PLEAD</span>
                <span className="control-desc">{gladiator.charisma ? `~${Math.min(80, 20 + gladiator.charisma * 1.5).toFixed(0)}% chance` : '~20% chance'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Opponent Panel */}
      <div className="opponent-panel card">
        <h3>Opponent</h3>
        {battle ? (
          <>
            <LowBlowTrigger
              battle={battle}
              setBattle={setBattle}
              onVictory={(victoryData) => {
                setLowBlowVictory(victoryData)
                setCombatStats(prev => ({
                  ...prev,
                  lowBlowUsed: (prev.lowBlowUsed || 0) + 1,
                }))
                setVictoryData(victoryData)
                setTimeout(() => setLowBlowVictory(null), 2500)
              }}
            >
              <div className="avatar opponent-portrait">
                <img
                  src={getOpponentPortrait(battle.opponent_name)}
                  alt={battle.opponent_name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                />
              </div>
            </LowBlowTrigger>
            
            {/* Opponent Name & Level */}
            <p className="opponent-name" style={{ 
              fontFamily: 'Cinzel, serif', 
              fontSize: '1.2rem', 
              color: '#ff6b6b',
              fontWeight: 'bold',
              marginBottom: '0.25rem'
            }}>
              {battle.opponent_name}
            </p>
            <p className="opponent-level" style={{ 
              color: '#ffa500', 
              fontSize: '0.95rem',
              marginBottom: '0.5rem'
            }}>
              Level {battle.opponent_level}
            </p>
            <p className="opponent-city" style={{ 
              opacity: 0.8, 
              fontSize: '0.85rem',
              marginBottom: '0.75rem'
            }}>
              📍 {battle.opponent_city || gladiator.current_city}
            </p>

            {/* Opponent Stats - Mirroring Player */}
            <div className="stats-grid opponent-stats" style={{ 
              marginTop: '1rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.5rem',
              padding: '0.75rem',
              background: 'rgba(139, 0, 0, 0.2)',
              borderRadius: '10px',
              border: '1px solid rgba(255, 68, 68, 0.3)'
            }}>
              <div className="stat opponent-stat">
                <div className="stat-value" style={{ 
                  color: '#ff6b6b',
                  fontSize: '1.1rem',
                  textShadow: '0 0 10px rgba(255, 68, 68, 0.5)'
                }}>
                  {battle.opponent_strength || battle.opponent_level + 10}
                </div>
                <div className="stat-label" style={{ 
                  color: '#ff6b6b',
                  fontSize: '0.7rem'
                }}>
                  STR
                </div>
              </div>
              <div className="stat opponent-stat">
                <div className="stat-value" style={{ 
                  color: '#ff6b6b',
                  fontSize: '1.1rem',
                  textShadow: '0 0 10px rgba(255, 68, 68, 0.5)'
                }}>
                  {battle.opponent_agility || battle.opponent_level + 8}
                </div>
                <div className="stat-label" style={{ 
                  color: '#ff6b6b',
                  fontSize: '0.7rem'
                }}>
                  AGI
                </div>
              </div>
              <div className="stat opponent-stat">
                <div className="stat-value" style={{ 
                  color: '#ff6b6b',
                  fontSize: '1.1rem',
                  textShadow: '0 0 10px rgba(255, 68, 68, 0.5)'
                }}>
                  {battle.opponent_endurance || battle.opponent_level + 12}
                </div>
                <div className="stat-label" style={{ 
                  color: '#ff6b6b',
                  fontSize: '0.7rem'
                }}>
                  END
                </div>
              </div>
            </div>

            {/* Opponent HP Preview */}
            <div style={{ 
              marginTop: '1rem',
              padding: '0.5rem',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '8px',
              fontSize: '0.85rem'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                color: '#ff6b6b',
                marginBottom: '0.25rem'
              }}>
                <span>HP</span>
                <span>{opponentHP} / {maxOpponentHP}</span>
              </div>
              <div style={{
                width: '100%',
                height: '8px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${(opponentHP / maxOpponentHP) * 100}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #ff4444, #ff6b6b)',
                  borderRadius: '4px',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          </>
        ) : (
          <p style={{ opacity: 0.7 }}>Select a battle to see your opponent</p>
        )}
      </div>

      {/* Game Over Screen */}
      {gameOver && (
        <GameOverScreen
          gladiator={gladiator}
          onRestart={onRestart}
        />
      )}

      {/* Captured Screen */}
      {isCaptured && (
        <CapturedScreen
          gladiator={gladiator}
          captureDetails={captureDetails}
          onContinue={() => {
            setIsCaptured(false)
            setCaptureDetails(null)
            onCityChange?.('Capua')
          }}
        />
      )}

      {/* Plead Screen */}
      {showPlead && (
        <PleadScreen
          gladiator={gladiator}
          city={gladiator.current_city || 'Capua'}
          pleaResult={pleadResult}
          onMercy={() => {
            setShowPlead(false)
            setPleadResult(null)
            // Trigger auto-save after battle ends
            localStorage.setItem('all_roads_last_battle_ended', Date.now().toString())
            setBattle(null)
          }}
          onNoMercy={() => {
            setShowPlead(false)
            setPleadResult(null)
            if (gladiator.current_city === 'Capua') {
              setGameOver(true)
            } else {
              setIsCaptured(true)
              setCaptureDetails({
                old_city: gladiator.current_city,
                lost_equipment: [],
                capture_count: 0,
              })
              onCityChange?.('Capua')
            }
          }}
        />
      )}

      {/* Low Blow Animation Overlay */}
      <LowBlowAnimation
        show={!!lowBlowVictory}
        opponentName={battle?.opponent_name}
        onComplete={() => setLowBlowVictory(null)}
      />

      {/* Victory Popup */}
      <VictoryPopup
        show={!!victoryData}
        onComplete={() => setVictoryData(null)}
        gold={victoryData?.gold || 0}
        xp={victoryData?.xp || 0}
      />
    </div>
  )
}

export default Arena
