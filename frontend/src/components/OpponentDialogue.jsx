// OpponentDialogue.jsx - Dynamic Opponent Dialogue System
import { useState, useEffect, useCallback } from 'react'

// Pre-battle dialogue for each opponent
export const OPPONENT_DIALOGUE = {
  Crixus: {
    preBattle: [
      "Welcome to the arena, rookie. I'll teach you your first lesson.",
      "I've broken more gladiators than you've killed. Prepare to fall.",
      "Your blood will stain these sands red today.",
    ],
    onHit: [
      "Is that all you've got?",
      "Pathetic strike!",
      "You're holding that sword wrong!",
    ],
    onCrit: [
      "Impressive... for a beginner.",
      "Finally, a real challenge!",
      "You're starting to annoy me.",
    ],
    lowHP: [
      "I'm just warming up!",
      "This is nothing!",
      "You haven't seen my true strength!",
    ],
    defeat: [
      "Not bad... for a rookie.",
      "I'll remember you...",
      "The arena will claim you soon enough.",
    ],
    victory: [
      "As expected. Easy victory.",
      "Another insect crushed.",
      "Next!",
    ],
  },
  Varro: {
    preBattle: [
      "A shield wall cannot be breached. Prepare to fall.",
      "I am the wall. You are the wave that breaks against me.",
      "No blade has pierced my defense in ten years.",
    ],
    onHit: [
      "My shield remains unbreached.",
      "You tire yourself against the inevitable.",
      "Pointless effort.",
    ],
    onCrit: [
      "A lucky strike. Means nothing.",
      "I've endured worse from war elephants.",
      "My grandmother fights better than you.",
    ],
    lowHP: [
      "The wall may crack, but it never falls!",
      "You think you can break me?!",
      "This is just the beginning!",
    ],
    defeat: [
      "The wall... has fallen...",
      "Impossible... I've never...",
      "Perhaps... there is always a first time...",
    ],
    victory: [
      "The wall stands eternal.",
      "Another challenger, another victory.",
      "No one breaches Varro's defenses.",
    ],
  },
  Priscus: {
    preBattle: [
      "Two blades, one purpose: your demise.",
      "I am the storm. You are the leaf in my wind.",
      "Your blood will honor my blades.",
    ],
    onHit: [
      "Too slow!",
      "My blades hunger for more!",
      "Dance for me, gladiator!",
    ],
    onCrit: [
      "Now we dance!",
      "Finally, some sport!",
      "Your fear... delicious!",
    ],
    lowHP: [
      "I'm just getting started!",
      "More! Give me MORE!",
      "Is that all the blood you have?!",
    ],
    defeat: [
      "The storm... has passed...",
      "My blades... are satisfied... for now...",
      "Well fought. But not well enough.",
    ],
    victory: [
      "A worthy warm-up.",
      "Your blades will make fine trophies.",
      "Next challenger: present yourself!",
    ],
  },
  Sicarius: {
    preBattle: [
      "The desert winds carry the scent of death. That scent is you.",
      "I strike from silence. You will not see me coming.",
      "By the time you feel my blade, it will already be over.",
    ],
    onHit: [
      "Too predictable.",
      "I read your movements like hieroglyphs.",
      "The desert sends its regards.",
    ],
    onCrit: [
      "Quick reflexes. Rare in this place.",
      "You're... competent. Almost disappointing.",
      "Don't bore me with competence.",
    ],
    lowHP: [
      "I'll end this quickly.",
      "Make it interesting, at least.",
      "Finish this, I have other appointments.",
    ],
    defeat: [
      "The assassin... is assassinated...",
      "A worthy opponent... finally...",
      "The desert winds... mourn my passing...",
    ],
    victory: [
      "Swift. Silent. Supreme.",
      "Another contract completed.",
      "Your blood fetches a fine price.",
    ],
  },
  Amazonia: {
    preBattle: [
      "My sisters watch from the afterlife. I won't disappoint them.",
      "I am daughter of warriors. You are but a training dummy.",
      "The arena has never seen my equal.",
    ],
    onHit: [
      "My grandmother hits harder.",
      "Is this a dance or a fight?",
      "My little sister fights with more fury!",
    ],
    onCrit: [
      "Finally! A real fight!",
      "Now I shall enjoy this!",
      "My sisters are cheering!",
    ],
    lowHP: [
      "THIS IS WHERE YOU DIE!",
      "MY BLOOD RUNS HOTTER THAN YOURS!",
      "I AM THE STORM!",
    ],
    defeat: [
      "The daughter... falls...",
      "My sisters... will avenge me...",
      "Well fought, warrior. Well fought.",
    ],
    victory: [
      "My sisters smile upon me today.",
      "You fought with honor. Not that it mattered.",
      "The arena belongs to the Amazons!",
    ],
  },
  Kriemhild: {
    preBattle: [
      "The frozen north taught me to survive. You will learn to die.",
      "I carry the fury of a thousand frozen winters.",
      "Your warm blood will freeze on my blade.",
    ],
    onHit: [
      "Cold. Empty. Just like your chances.",
      "The north wind cuts deeper than your blade.",
      "You southerners know nothing of war.",
    ],
    onCrit: [
      "Ah! You have some fight in you!",
      "Now the game begins!",
      "Warming up to this!",
    ],
    lowHP: [
      "My blood runs cold. My fury runs hot!",
      "I've survived worse than you!",
      "The north has killed greater warriors than you!",
    ],
    defeat: [
      "The north... falls... but never freezes...",
      "Carry my name... to the frozen lands...",
      "Valhalla... awaits...",
    ],
    victory: [
      "The north remains unconquered.",
      "Another southerner meets their end.",
      "Tell them Kriemhild sent you to the afterlife.",
    ],
  },
  "Boudicca's Daughter": {
    preBattle: [
      "My mother burned your cities. I will burn your hopes.",
      "For every fallen Celtic warrior, a Roman falls.",
      "Your empire crumbles. You will too.",
    ],
    onHit: [
      "That was for my mother.",
      "My blade thirsts for Roman blood.",
      "This arena will be your tomb!",
    ],
    onCrit: [
      "My mother would have smiled at that.",
      "Celtic steel! Celtic fury!",
      "The spirits of my ancestors guide my hand!",
    ],
    lowHP: [
      "I will NOT fall here!",
      "My mother's spirit fuels my arm!",
      "VICTORY OR VALHALLA!",
    ],
    defeat: [
      "Mother... forgive me...",
      "The Celtic flame... burns eternal...",
      "My blood... waters the seeds of rebellion...",
    ],
    victory: [
      "For Boudicca! For Britannia!",
      "Another Roman scourge eliminated.",
      "The empire's days are numbered.",
    ],
  },
  "Spartacus Reborn": {
    preBattle: [
      "They say I am the ghost of a legend. I am his VENGEANCE.",
      "I am what happens when slaves stop kneeling.",
      "Freedom is forged in blood. Today, yours.",
    ],
    onHit: [
      "Strike true, for those who cannot!",
      "Every cut is a革命's battle cry!",
      "Your chains are in your mind. Mine are broken!",
    ],
    onCrit: [
      "THIS IS WHAT FREEDOM LOOKS LIKE!",
      "The arena will crumble beneath my rage!",
      "LEGEND NEVER DIES!",
    ],
    lowHP: [
      "I AM SPARTACUS! I WILL NOT FALL!",
      "My brothers in arms ROAR in my veins!",
      "KILL ME OR BE KILLED!",
    ],
    defeat: [
      "They... can never... kill... the spirit...",
      "Spartacus... lives... in all of us...",
      "Another martyr for the cause...",
    ],
    victory: [
      "I am Spartacus! REMEMBER THAT!",
      "Every slave fights when I fight!",
      "The Colosseum trembles at my name!",
    ],
  },
  "Lycus the Beast": {
    preBattle: [
      "The animals taught me to kill. Now I teach you.",
      "I've wrestled lions. You are no lion.",
      "Welcome to my jungle. Your blood will water my arena.",
    ],
    onHit: [
      "Weak! Like a newborn cub!",
      "Is that all the prey offers?!",
      "The beasts laugh at your struggles!",
    ],
    onCrit: [
      "Now we're hunting!",
      "TASTE THE BEAST'S FURY!",
      "I smell your fear, little prey!",
    ],
    lowHP: [
      "THE BEAST NEVER DIES!",
      "THIS IS MY ARENA! MY RULES!",
      "I AM ALPHA! I AM APEX!",
    ],
    defeat: [
      "The beast... is tamed...",
      "Another... hunter... becomes... prey...",
      "The jungle... remembers...",
    ],
    victory: [
      "I am the apex predator!",
      "Nature's perfect killing machine... wins again.",
      "Your corpse will feed my pets.",
    ],
  },
  "Cassia the Scarlet": {
    preBattle: [
      "Your blood will honor the arena gods. Consider it a blessing.",
      "I've seen the underworld. I'm just visiting yours.",
      "Pray to your gods. They won't save you.",
    ],
    onHit: [
      "Blood for the altar.",
      "Your soul is already marked.",
      "Is that a prayer I hear?",
    ],
    onCrit: [
      "Your soul weakens. I can taste it.",
      "The gods are pleased with your suffering.",
      "Soon, you will see what I've seen.",
    ],
    lowHP: [
      "I grow... weary of this game...",
      "Your soul... calls to me...",
      "FINISH THIS... FOR THE GODS!",
    ],
    defeat: [
      "The underworld... welcomes me home...",
      "I go... to serve... the arena gods...",
      "My work... continues... in the shadows...",
    ],
    victory: [
      "The gods are satisfied... for now.",
      "Your soul joins my collection.",
      "Another believer in the old ways.",
    ],
  },
  Grimhild: {
    preBattle: [
      "My wolves hunger. You will feed them.",
      "I am the hunt. I am the hunter.",
      "Your blood will scent the wind. My wolves will find it.",
    ],
    onHit: [
      "My wolves smell your fear.",
      "The hunt has barely begun.",
      "You bleed as all prey bleeds.",
    ],
    onCrit: [
      "My wolves growl in approval.",
      "Now you understand. This is the hunt.",
      "BLEED FOR THE WOLVES!",
    ],
    lowHP: [
      "THE WOLVES GIVE ME STRENGTH!",
      "I AM THE HUNT!",
      "MY PACK FIGHTS WITH ME!",
    ],
    defeat: [
      "The alpha... falls...",
      "The pack... remembers...",
      "Hunt... well... little wolves...",
    ],
    victory: [
      "The wolves feast tonight!",
      "Another hunt successfully concluded.",
      "The forest is safer without you.",
    ],
  },
  "Xylon the Broken": {
    preBattle: [
      "They took my fingers. They didn't take my rage.",
      "I lost pieces of myself in the mines. I found fury.",
      "Your bones will join my collection.",
    ],
    onHit: [
      "I've endured worse than your measly strike.",
      "Pain is my companion. You're just an annoyance.",
      "Strike true, while you still have working hands.",
    ],
    onCrit: [
      "RAGE AGAINST THE DYING OF THE LIGHT!",
      "I BREAK THOSE WHO BREAK ME!",
      "YOU CANNOT KILL WHAT WON'T DIE!",
    ],
    lowHP: [
      "I AM XYLON! BROKEN BUT NEVER BENT!",
      "DESTROY ME OR BE DESTROYED!",
      "THE MINES COULDN'T BREAK ME!",
    ],
    defeat: [
      "Xylon... finally... broken...",
      "The mines... free... at last...",
      "Rage... fades... to... peace...",
    ],
    victory: [
      "Broken... but unbroken spirit!",
      "Another battle. Another win. Against all odds.",
      "They took my fingers. I took their lives.",
    ],
  },
}

// Generic dialogue (fallback)
export const GENERIC_DIALOGUE = {
  preBattle: [
    "Prepare to die, gladiator!",
    "I'll enjoy this.",
    "Your end approaches.",
    "I've killed better than you.",
  ],
  onHit: [
    "Too slow!",
    "Pathetic!",
    "Is that all?",
    "My grandmother hits harder!",
  ],
  onCrit: [
    "Impressive!",
    "Finally, a challenge!",
    "You're starting to irritate me!",
  ],
  lowHP: [
    "This isn't over!",
    "I'll not fall here!",
    "I've worse wounds than this!",
  ],
  defeat: [
    "Well... fought...",
    "The arena... claims another...",
    "I'll... remember you...",
  ],
  victory: [
    "As expected.",
    "Next!",
    "Easy victory.",
  ],
}

// Dialogue Hook
export const useOpponentDialogue = (opponentName) => {
  const [currentDialogue, setCurrentDialogue] = useState(null)
  const [showDialogue, setShowDialogue] = useState(false)
  const [dialogueQueue, setDialogueQueue] = useState([])
  
  const dialogueSet = OPPONENT_DIALOGUE[opponentName] || GENERIC_DIALOGUE
  
  const say = useCallback((type = 'preBattle', force = false) => {
    const options = dialogueSet[type] || GENERIC_DIALOGUE[type] || []
    if (options.length === 0) return
    
    const line = options[Math.floor(Math.random() * options.length)]
    
    // Queue dialogue if one is already showing
    if (showDialogue && !force) {
      setDialogueQueue(prev => [...prev, { text: line, type }])
    } else {
      setCurrentDialogue({ text: line, type })
      setShowDialogue(true)
      
      // Auto-hide after delay
      setTimeout(() => {
        setShowDialogue(false)
      }, 2500)
    }
  }, [dialogueSet, showDialogue])
  
  // Process queue when dialogue finishes
  useEffect(() => {
    if (!showDialogue && dialogueQueue.length > 0) {
      const next = dialogueQueue[0]
      setDialogueQueue(prev => prev.slice(1))
      setCurrentDialogue({ text: next.text, type: next.type })
      setShowDialogue(true)
      
      setTimeout(() => {
        setShowDialogue(false)
      }, 2500)
    }
  }, [showDialogue, dialogueQueue])
  
  return {
    currentDialogue,
    showDialogue,
    say,
  }
}

// Dialogue Display Component
export const DialogueBox = ({ dialogue, show, onComplete }) => {
  useEffect(() => {
    if (show && onComplete) {
      const timer = setTimeout(onComplete, 3000)
      return () => clearTimeout(timer)
    }
  }, [show, onComplete])
  
  if (!show || !dialogue) return null
  
  const typeStyles = {
    preBattle: { border: '#ff6b6b', bg: 'rgba(139, 0, 0, 0.8)' },
    onHit: { border: '#ffa500', bg: 'rgba(100, 50, 0, 0.8)' },
    onCrit: { border: '#FFD700', bg: 'rgba(100, 80, 0, 0.8)' },
    lowHP: { border: '#ff0000', bg: 'rgba(150, 0, 0, 0.8)' },
    defeat: { border: '#666', bg: 'rgba(30, 30, 30, 0.9)' },
    victory: { border: '#4CAF50', bg: 'rgba(0, 80, 0, 0.8)' },
  }
  
  const style = typeStyles[dialogue.type] || typeStyles.preBattle
  
  return (
    <div style={{
      position: 'fixed',
      top: '150px',
      left: '50%',
      transform: 'translateX(-50%)',
      maxWidth: '500px',
      background: style.bg,
      border: `2px solid ${style.border}`,
      borderRadius: '12px',
      padding: '1rem 1.5rem',
      zIndex: 500,
      animation: 'dialogueSlide 0.3s ease-out',
      boxShadow: `0 0 20px ${style.border}40`,
    }}>
      <style>{`
        @keyframes dialogueSlide {
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
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem',
      }}>
        <div style={{
          fontSize: '2rem',
          filter: 'grayscale(100%) opacity(0.7)',
        }}>
          💬
        </div>
        <div>
          <div style={{
            fontSize: '0.8rem',
            color: style.border,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '0.5rem',
          }}>
            {dialogue.type === 'preBattle' && '⚔️ Challenger approaches'}
            {dialogue.type === 'onHit' && '💢 Enemy taunts'}
            {dialogue.type === 'onCrit' && '💥 Enemy reacts'}
            {dialogue.type === 'lowHP' && '🔥 Enemy roars'}
            {dialogue.type === 'defeat' && '💀 Enemy falls'}
            {dialogue.type === 'victory' && '🏆 Enemy boasts'}
          </div>
          <div style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '1.1rem',
            color: '#fff',
            fontStyle: dialogue.type === 'defeat' ? 'italic' : 'normal',
          }}>
            "{dialogue.text}"
          </div>
        </div>
      </div>
    </div>
  )
}

// Portrait Shake Effect Component
export const PortraitShake = ({ show, children }) => {
  if (!show) return children
  
  return (
    <div style={{
      animation: 'portraitShake 0.3s ease-in-out',
    }}>
      <style>{`
        @keyframes portraitShake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-5px) rotate(-2deg); }
          40% { transform: translateX(5px) rotate(2deg); }
          60% { transform: translateX(-3px) rotate(-1deg); }
          80% { transform: translateX(3px) rotate(1deg); }
        }
      `}</style>
      {children}
    </div>
  )
}

export default {
  OPPONENT_DIALOGUE,
  GENERIC_DIALOGUE,
  useOpponentDialogue,
  DialogueBox,
  PortraitShake,
}
