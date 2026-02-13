import React, { useState, useEffect } from 'react'

function VictoryPose({ gladiator, onContinue }) {
  const [selectedPose, setSelectedPose] = useState(null)
  const [showContinue, setShowContinue] = useState(false)
  const [animationKey, setAnimationKey] = useState(0)

  const victoryPoses = [
    {
      id: 'triumph',
      name: 'Triumphant',
      description: 'Arms raised high in victory',
      image: '/assets/victory-male.png',
    },
    {
      id: 'power',
      name: 'Power Strike',
      description: 'Weapon raised, muscles flexed',
      image: '/assets/victory-male.png',
    },
    {
      id: 'defiant',
      name: 'Defiant Stance',
      description: 'Confident, arms crossed',
      image: '/assets/victory-male.png',
    },
  ]

  const femaleVictoryPoses = [
    {
      id: 'triumph_f',
      name: 'Triumphant',
      description: 'Arms raised high in victory',
      image: '/assets/victory-female.png',
    },
    {
      id: 'power_f',
      name: 'Power Strike',
      description: 'Weapon raised, fierce expression',
      image: '/assets/victory-female.png',
    },
    {
      id: 'defiant_f',
      name: 'Defiant Stance',
      description: 'Confident, powerful pose',
      image: '/assets/victory-female.png',
    },
  ]

  const poses = gladiator?.gender === 'female' ? femaleVictoryPoses : victoryPoses

  useEffect(() => {
    if (selectedPose) {
      // Trigger animation replay
      setAnimationKey(prev => prev + 1)
      // Show continue button after pose animation
      const timer = setTimeout(() => setShowContinue(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [selectedPose])

  const handlePoseSelect = (pose) => {
    setSelectedPose(pose)
    setShowContinue(false)
  }

  return (
    <div className="victory-pose" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9998,
      background: 'linear-gradient(180deg, rgba(0,0,0,0.95) 0%, rgba(50,30,0,0.9) 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      {/* Victory Title */}
      <h1 style={{
        fontFamily: '"Cinzel", serif',
        fontSize: 'clamp(2rem, 5vw, 4rem)',
        color: '#FFD700',
        textShadow: '0 0 30px rgba(255, 215, 0, 0.7)',
        marginBottom: '0.5rem',
        animation: 'glow 2s ease-in-out infinite',
      }}>
        🎉 VICTORY! 🎉
      </h1>
      
      <p style={{
        fontSize: '1.2rem',
        color: 'rgba(255,255,255,0.8)',
        marginBottom: '2rem',
      }}>
        {gladiator?.name} defeated {gladiator?.opponent_name || 'their opponent'}!
      </p>

      {/* Pose Selection or Display */}
      {!selectedPose ? (
        <>
          <h2 style={{
            fontFamily: '"Cinzel", serif',
            color: '#DAA520',
            marginBottom: '1.5rem',
          }}>
            Choose Your Victory Pose
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            maxWidth: '800px',
            width: '100%',
          }}>
            {poses.map((pose) => (
              <button
                key={pose.id}
                onClick={() => handlePoseSelect(pose)}
                style={{
                  padding: '1.5rem',
                  background: 'rgba(0,0,0,0.5)',
                  border: '2px solid #444',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <div style={{
                  width: '150px',
                  height: '150px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '2px solid #DAA520',
                  marginBottom: '0.5rem',
                }}>
                  <img 
                    src={pose.image}
                    alt={pose.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </div>
                <span style={{
                  fontFamily: '"Cinzel", serif',
                  fontSize: '1.1rem',
                  color: '#FFD700',
                  fontWeight: 'bold',
                }}>
                  {pose.name}
                </span>
                <span style={{
                  fontSize: '0.85rem',
                  opacity: 0.7,
                }}>
                  {pose.description}
                </span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div key={animationKey} style={{
          animation: 'victory-appear 0.5s ease',
          textAlign: 'center',
        }}>
          {/* Large Victory Portrait */}
          <div style={{
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '4px solid #FFD700',
            boxShadow: '0 0 50px rgba(255, 215, 0, 0.6)',
            margin: '0 auto 2rem auto',
          }}>
            <img 
              src={selectedPose.image}
              alt="Victory pose"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>

          {/* Pose Name */}
          <h2 style={{
            fontFamily: '"Cinzel", serif',
            fontSize: '2rem',
            color: '#FFD700',
            textShadow: '0 0 20px rgba(255, 215, 0, 0.5)',
            marginBottom: '0.5rem',
          }}>
            {selectedPose.name}
          </h2>
          
          <p style={{
            fontSize: '1rem',
            opacity: 0.8,
            marginBottom: '2rem',
          }}>
            {selectedPose.description}
          </p>

          {/* Continue Button */}
          {showContinue && (
            <button
              onClick={onContinue}
              className="btn btn-primary"
              style={{
                padding: '1rem 3rem',
                fontSize: '1.2rem',
                animation: 'bounce 0.5s ease',
              }}
            >
              Continue →
            </button>
          )}
        </div>
      )}

      {/* Rewards Display */}
      <div style={{
        marginTop: '2rem',
        padding: '1rem 2rem',
        background: 'rgba(0,0,0,0.5)',
        borderRadius: '12px',
        border: '1px solid #DAA520',
        display: 'flex',
        gap: '2rem',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', color: '#FFD700' }}>💰</div>
          <div style={{ fontWeight: 'bold' }}>+{gladiator?.gold_earned || 0} Gold</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', color: '#4CAF50' }}>✨</div>
          <div style={{ fontWeight: 'bold' }}>+{gladiator?.experience_earned || 0} XP</div>
        </div>
      </div>

      <style>{`
        @keyframes glow {
          0%, 100% { text-shadow: 0 0 30px rgba(255, 215, 0, 0.7); }
          50% { text-shadow: 0 0 50px rgba(255, 215, 0, 1); }
        }

        @keyframes victory-appear {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        button:hover {
          transform: translateY(-5px);
          border-color: #FFD700 !important;
          box-shadow: 0 10px 30px rgba(255, 215, 0, 0.3);
        }
      `}</style>
    </div>
  )
}

export default VictoryPose
