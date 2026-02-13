import React, { useState, useEffect, useRef } from 'react'

function CharismaMinigame({ gladiator, onComplete }) {
  const [gameState, setGameState] = useState('menu') // menu, playing, results
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(20)
  const [crowdMood, setCrowdMood] = useState(50) // 0-100
  const [speechText, setSpeechText] = useState('')
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [missedWords, setMissedWords] = useState(0)
  const [words, setWords] = useState([])
  const [speechEffect, setSpeechEffect] = useState(false)
  
  const timerRef = useRef(null)
  const wordRefs = useRef([])

  const speechPhrases = [
    "I BEG THE MERCY OF THE EMPEROR",
    "I HAVE FOUGHT WITH HONOR",
    "SPARE ME AND I WILL SERVE",
    "I PLEAD FOR MY LIFE",
    "THE CROWD WILL CHEER MY VICTORY",
    "I AM WORTHY OF MERCY",
    "LET ME LIVE TO FIGHT AGAIN",
    "I BOW BEFORE YOUR GREATNESS"
  ]

  const startGame = () => {
    const phrase = speechPhrases[Math.floor(Math.random() * speechPhrases.length)]
    const wordList = phrase.split(' ')
    setWords(wordList.map((w, i) => ({ word: w, typed: false, correct: false })))
    setCurrentWordIndex(0)
    setScore(0)
    setMissedWords(0)
    setCrowdMood(50)
    setSpeechText('')
    setGameState('playing')
    setTimeLeft(20)
  }

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endGame()
            return 0
          }
          // Crowd mood slowly decays
          setCrowdMood(m => Math.max(0, m - 1))
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [gameState, timeLeft])

  useEffect(() => {
    if (gameState === 'playing' && wordRefs.current[currentWordIndex]) {
      wordRefs.current[currentWordIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }
  }, [currentWordIndex])

  const handleKeyPress = (e) => {
    if (gameState !== 'playing') return
    
    const key = e.key.toUpperCase()
    const currentWord = words[currentWordIndex]
    
    if (!currentWord) return
    
    const expectedChar = currentWord[currentWordIndex === 0 ? 0 : currentWord.typed.length]
    
    if (key === expectedChar) {
      // Correct keystroke
      const newWords = [...words]
      newWords[currentWordIndex] = {
        ...currentWord,
        typed: currentWord.typed + key
      }
      setWords(newWords)
      
      // Check if word is complete
      if (newWords[currentWordIndex].typed.length === currentWord.length) {
        newWords[currentWordIndex] = {
          ...currentWord,
          typed: currentWord.length,
          correct: true
        }
        setWords(newWords)
        
        // Bonus points for correct word
        setScore(s => s + 10 + Math.floor(crowdMood / 10))
        setCrowdMood(m => Math.min(100, m + 5))
        setCurrentWordIndex(i => i + 1)
        setSpeechEffect(true)
        setTimeout(() => setSpeechEffect(false), 150)
      }
    } else if (key.length === 1 && key !== ' ') {
      // Wrong keystroke
      setScore(s => Math.max(0, s - 2))
      setMissedWords(m => m + 1)
      setCrowdMood(m => Math.max(0, m - 3))
      setSpeechEffect(true)
      setTimeout(() => setSpeechEffect(false), 100)
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameState, currentWordIndex, words])

  const endGame = () => {
    clearInterval(timerRef.current)
    setGameState('results')
  }

  const calculateStatGain = () => {
    const baseGain = 1
    const crowdBonus = Math.floor(crowdMood / 20)
    const accuracyBonus = Math.floor((words.length - missedWords) / words.length * 3)
    return Math.min(baseGain + crowdBonus + accuracyBonus, 5)
  }

  const getCrowdEmoji = () => {
    if (crowdMood < 25) return '😤'
    if (crowdMood < 50) return '😐'
    if (crowdMood < 75) return '🙂'
    return '🤩'
  }

  const getCrowdColor = () => {
    if (crowdMood < 25) return '#ff4444'
    if (crowdMood < 50) return '#FFA500'
    if (crowdMood < 75) return '#4CAF50'
    return '#FFD700'
  }

  if (gameState === 'menu') {
    return (
      <div className="charisma-menu" style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎭</div>
        <h2 style={{ marginBottom: '0.5rem' }}>🎤 Oratory Training</h2>
        <p style={{ opacity: 0.7, marginBottom: '1.5rem' }}>
          Master the art of persuasion to plea for your life!
        </p>
        
        <div style={{
          background: 'rgba(0, 0, 0, 0.4)',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{ marginBottom: '1rem' }}>How to Play:</h3>
          <div style={{ textAlign: 'left', fontSize: '0.95rem', lineHeight: '1.8' }}>
            <p>🗣️ <strong>Type the speech</strong> as quickly as possible!</p>
            <p>👥 <strong>Keep the crowd happy</strong> - they judge your performance</p>
            <p>⏱️ <strong>20 seconds</strong> to make your case!</p>
            <p>💡 <strong>Higher score</strong> = more charisma gain</p>
          </div>
        </div>

        <button
          onClick={startGame}
          className="btn btn-primary"
          style={{ padding: '1rem 3rem', fontSize: '1.2rem' }}
        >
          🎯 Start Speech
        </button>
        
        <p style={{ marginTop: '1rem', opacity: 0.6, fontSize: '0.9rem' }}>
          Use your keyboard to type!
        </p>
      </div>
    )
  }

  if (gameState === 'playing') {
    return (
      <div className="charisma-game" style={{ maxWidth: '700px', margin: '0 auto' }}>
        {/* Timer and Crowd */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>Time</div>
            <div style={{ 
              fontSize: '2rem', 
              fontWeight: 'bold',
              color: timeLeft <= 5 ? '#ff4444' : '#DAA520'
            }}>
              {timeLeft}s
            </div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>Crowd Mood {getCrowdEmoji()}</div>
            <div style={{ 
              width: '150px',
              height: '20px',
              background: '#333',
              borderRadius: '10px',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <div style={{
                width: `${crowdMood}%`,
                height: '100%',
                background: getCrowdColor(),
                transition: 'width 0.3s, background 0.5s'
              }} />
            </div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>Score</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#DAA520' }}>{score}</div>
          </div>
        </div>

        {/* Speech Display */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.5)',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '1rem',
          minHeight: '120px',
          border: speechEffect ? '2px solid #FFD700' : '1px solid var(--border-glow)',
          transition: 'border 0.15s'
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
            {words.map((word, wordIndex) => (
              <span
                key={wordIndex}
                ref={el => wordRefs.current[wordIndex] = el}
                style={{
                  fontSize: wordIndex === currentWordIndex ? '1.8rem' : '1.4rem',
                  fontWeight: 'bold',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  background: word.correct 
                    ? 'rgba(76, 175, 80, 0.3)' 
                    : wordIndex === currentWordIndex 
                      ? 'rgba(255, 215, 0, 0.2)'
                      : 'transparent',
                  color: word.correct 
                    ? '#4CAF50' 
                    : wordIndex === currentWordIndex 
                      ? '#FFD700'
                      : 'rgba(255, 255, 255, 0.5)',
                  textShadow: wordIndex === currentWordIndex ? '0 0 10px rgba(255, 215, 0, 0.5)' : 'none',
                  transition: 'all 0.15s'
                }}
              >
                {word.word.split('').map((char, charIndex) => {
                  const isTyped = charIndex < word.typed?.length
                  return (
                    <span key={charIndex} style={{
                      color: word.correct 
                        ? '#4CAF50' 
                        : isTyped 
                          ? '#FFD700' 
                          : 'inherit'
                    }}>
                      {char}
                    </span>
                  )
                })}
              </span>
            ))}
          </div>
        </div>

        {/* Progress */}
        <div style={{ textAlign: 'center', opacity: 0.7, fontSize: '0.9rem' }}>
          Words: {words.filter(w => w.correct).length} / {words.length} | 
          Missed: {missedWords} | 
          Crowd: {crowdMood}%
        </div>

        {/* Instructions */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '1rem',
          padding: '1rem',
          background: 'rgba(218, 165, 32, 0.1)',
          borderRadius: '8px',
          fontSize: '0.9rem'
        }}>
          🗣️ <strong>Type the speech above!</strong> Press any key to type.
        </div>
      </div>
    )
  }

  if (gameState === 'results') {
    const gain = calculateStatGain()
    
    return (
      <div className="results" style={{ textAlign: 'center', maxWidth: '400px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '1rem' }}>📜 Speech Complete!</h2>
        
        {/* Performance */}
        <div style={{
          padding: '2rem',
          background: 'rgba(0, 0, 0, 0.5)',
          border: '2px solid #DAA520',
          borderRadius: '16px',
          marginBottom: '1.5rem'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎭</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#DAA520' }}>{score} points</div>
          <div style={{ opacity: 0.6 }}>Words: {words.filter(w => w.correct).length}/{words.length}</div>
        </div>

        {/* Crowd Result */}
        <div style={{
          padding: '1rem',
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '12px',
          marginBottom: '1.5rem',
          border: `2px solid ${getCrowdColor()}`
        }}>
          <div style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
            👥 Crowd Response: {getCrowdEmoji()}
          </div>
          <div style={{ color: getCrowdColor(), fontWeight: 'bold' }}>
            {crowdMood < 25 ? 'They threw vegetables!' : 
             crowdMood < 50 ? 'They listened unenthusiastically.' : 
             crowdMood < 75 ? 'They nodded in approval!' : 
             'They CHEERED for you!'}
          </div>
        </div>

        {/* Charisma Gain */}
        <div style={{
          padding: '1.5rem',
          background: 'rgba(76, 175, 80, 0.2)',
          border: '2px solid #4CAF50',
          borderRadius: '12px',
          marginBottom: '1.5rem'
        }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#4CAF50' }}>
            +{gain} Charisma
          </div>
          <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>
            Current: {gladiator.charisma || 0} → {(gladiator.charisma || 0) + gain}
          </div>
          {gain >= 3 && (
            <div style={{ marginTop: '0.5rem', color: '#FFD700' }}>✨ Outstanding performance!</div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            onClick={() => onComplete?.('charisma', gain)}
            className="btn btn-primary"
            style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}
          >
            ✅ Claim Rewards
          </button>
          <button
            onClick={startGame}
            className="btn btn-secondary"
            style={{ padding: '1rem 2rem' }}
          >
            🔄 Try Again
          </button>
        </div>
      </div>
    )
  }

  return null
}

export default CharismaMinigame
