// SaveSlots.jsx - Save/Load Menu Component
import React, { useState, useRef } from 'react'
import { useSaveSystem } from '../hooks/useSaveSystem'

const SaveSlots = ({
  gladiator,
  combatStats,
  settings,
  onSaveComplete,
  onLoadComplete,
  onClose
}) => {
  const {
    saveSlots,
    lastAutoSave,
    saving,
    loading,
    saveToSlot,
    autoSave,
    loadFromSlot,
    loadAutoSave,
    deleteSlot,
    exportSlot,
    importSave,
    formatTimestamp,
    getSlotDetails,
  } = useSaveSystem()

  const [activeTab, setActiveTab] = useState('save') // 'save' | 'load' | 'settings'
  const [importFile, setImportFile] = useState(null)
  const [message, setMessage] = useState(null)
  const fileInputRef = useRef(null)

  // Show temporary message
  const showMessage = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleSave = (slotId) => {
    if (!gladiator) {
      showMessage('No character to save!', 'error')
      return
    }

    const success = saveToSlot(slotId, gladiator, combatStats, settings)
    if (success) {
      showMessage(`Saved to ${slotId === 1 ? 'Auto-Save' : `Slot ${slotId}`}`, 'success')
      onSaveComplete?.()
    } else {
      showMessage('Failed to save!', 'error')
    }
  }

  const handleLoad = (slotId) => {
    const data = loadFromSlot(slotId)
    if (data) {
      showMessage('Character loaded!', 'success')
      onLoadComplete?.(data)
    } else {
      showMessage('Slot is empty!', 'error')
    }
  }

  const handleLoadAuto = () => {
    const data = loadAutoSave()
    if (data) {
      showMessage('Auto-save loaded!', 'success')
      onLoadComplete?.(data)
    } else {
      showMessage('No auto-save found!', 'error')
    }
  }

  const handleExport = (slotId) => {
    const success = exportSlot(slotId)
    if (success) {
      showMessage('Save exported!', 'success')
    } else {
      showMessage('Failed to export!', 'error')
    }
  }

  const handleImport = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Ask which slot to import to
    const slotId = prompt('Import to which slot? (2 or 3)', '2')
    if (slotId !== '2' && slotId !== '3') return

    importSave(file, parseInt(slotId))
      .then((data) => {
        showMessage('Save imported!', 'success')
        onLoadComplete?.(data)
      })
      .catch((err) => {
        showMessage(err.message, 'error')
      })

    // Reset input
    setImportFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDelete = (slotId) => {
    if (slotId === 1) {
      showMessage('Cannot delete auto-save!', 'error')
      return
    }

    if (confirm(`Delete Slot ${slotId}? This cannot be undone.`)) {
      deleteSlot(slotId)
      showMessage('Slot deleted!', 'success')
    }
  }

  return (
    <div className="save-modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(5px)',
    }}>
      <div className="save-modal" style={{
        background: 'linear-gradient(180deg, rgba(20, 10, 10, 0.98) 0%, rgba(10, 5, 5, 0.98) 100%)',
        border: '2px solid rgba(218, 165, 32, 0.5)',
        borderRadius: '20px',
        padding: '2rem',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 0 50px rgba(0, 0, 0, 0.8), 0 0 100px rgba(218, 165, 32, 0.1)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid rgba(218, 165, 32, 0.3)',
        }}>
          <h2 style={{
            fontFamily: 'Cinzel, serif',
            color: '#DAA520',
            margin: 0,
            fontSize: '1.8rem',
          }}>
            💾 Save / Load
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#888',
              fontSize: '1.5rem',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        {/* Auto-save indicator */}
        {lastAutoSave && (
          <div style={{
            background: 'rgba(76, 175, 80, 0.2)',
            border: '1px solid rgba(76, 175, 80, 0.5)',
            borderRadius: '8px',
            padding: '0.75rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem',
          }}>
            <span>🔄</span>
            <span style={{ flex: 1 }}>
              Auto-saved {formatTimestamp(lastAutoSave)}
            </span>
            <button
              className="btn btn-secondary"
              style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}
              onClick={handleLoadAuto}
              disabled={loading}
            >
              Load
            </button>
          </div>
        )}

        {/* Message */}
        {message && (
          <div style={{
            background: message.type === 'error'
              ? 'rgba(244, 67, 54, 0.2)'
              : 'rgba(76, 175, 80, 0.2)',
            border: `1px solid ${message.type === 'error' ? '#f44336' : '#4CAF50'}`,
            borderRadius: '8px',
            padding: '0.75rem',
            marginBottom: '1rem',
            textAlign: 'center',
          }}>
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1.5rem',
        }}>
          {['save', 'load', 'import/export'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: activeTab === tab
                  ? 'linear-gradient(135deg, rgba(218, 165, 32, 0.3), rgba(139, 69, 19, 0.3))'
                  : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${activeTab === tab ? '#DAA520' : 'rgba(255, 255, 255, 0.1)'}`,
                borderRadius: '8px',
                color: activeTab === tab ? '#DAA520' : '#888',
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.2s',
              }}
            >
              {tab === 'import/export' ? 'Import/Export' : tab}
            </button>
          ))}
        </div>

        {/* Save Tab */}
        {activeTab === 'save' && (
          <div className="save-slots">
            {saveSlots.map(slot => {
              const details = slot.hasData ? getSlotDetails(slot.id) : null

              return (
                <div key={slot.id} className="save-slot" style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '1rem',
                  marginBottom: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                }}>
                  {/* Slot Icon */}
                  <div style={{
                    width: '50px',
                    height: '50px',
                    background: slot.id === 1
                      ? 'rgba(76, 175, 80, 0.2)'
                      : 'rgba(218, 165, 32, 0.2)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                  }}>
                    {slot.id === 1 ? '🔄' : '💾'}
                  </div>

                  {/* Slot Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', color: '#fff', marginBottom: '0.25rem' }}>
                      {slot.id === 1 ? 'Auto-Save' : `Slot ${slot.id}`}
                    </div>
                    {slot.hasData && details ? (
                      <div style={{ fontSize: '0.85rem', color: '#888' }}>
                        <div>📍 {details.name} | Lv.{details.level} | 💰 {details.gold}g</div>
                        <div>📅 {formatTimestamp(slot.timestamp)}</div>
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.85rem', color: '#666', fontStyle: 'italic' }}>
                        Empty
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {slot.hasData ? (
                      <>
                        <button
                          className="btn btn-primary"
                          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                          onClick={() => handleLoad(slot.id)}
                          disabled={loading}
                        >
                          📂 Load
                        </button>
                        {slot.id !== 1 && (
                          <button
                            className="btn btn-danger"
                            style={{ padding: '0.5rem 0.8rem', fontSize: '0.85rem' }}
                            onClick={() => handleDelete(slot.id)}
                          >
                            🗑️
                          </button>
                        )}
                      </>
                    ) : (
                      <button
                        className="btn btn-primary"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                        onClick={() => handleSave(slot.id)}
                        disabled={saving || !gladiator}
                      >
                        💾 Save
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Load Tab */}
        {activeTab === 'load' && (
          <div className="load-slots">
            <div style={{
              background: 'rgba(218, 165, 32, 0.1)',
              border: '1px solid rgba(218, 165, 32, 0.3)',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1rem',
              textAlign: 'center',
            }}>
              <p style={{ margin: 0, color: '#888' }}>
                💡 Select a save slot to load your character
              </p>
            </div>

            {saveSlots.filter(s => s.hasData).length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '2rem',
                color: '#666',
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                No saves found. Start a new game and save!
              </div>
            ) : (
              saveSlots.filter(s => s.hasData).map(slot => {
                const details = getSlotDetails(slot.id)
                return (
                  <div key={slot.id} className="load-slot" style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '1rem',
                    marginBottom: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                    onClick={() => handleLoad(slot.id)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.border = '1px solid #DAA520'
                      e.currentTarget.style.background = 'rgba(218, 165, 32, 0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)'
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    <div style={{
                      width: '60px',
                      height: '60px',
                      background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.3), rgba(139, 69, 19, 0.3))',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                    }}>
                      👤
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '1.1rem' }}>
                        {details.name}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#DAA520', marginTop: '0.25rem' }}>
                        Level {details.level} | {details.city || 'Capua'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.25rem' }}>
                        💰 {details.gold}g | 📅 {formatTimestamp(slot.timestamp)}
                      </div>
                    </div>
                    <div style={{ fontSize: '1.5rem' }}>➡️</div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* Import/Export Tab */}
        {activeTab === 'import/export' && (
          <div className="import-export">
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '1rem',
            }}>
              <h3 style={{ color: '#DAA520', marginTop: 0, marginBottom: '1rem' }}>
                📤 Export Save
              </h3>
              <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '1rem' }}>
                Download your save file to back up or share your progress.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {saveSlots.filter(s => s.hasData).map(slot => (
                  <button
                    key={slot.id}
                    className="btn btn-secondary"
                    onClick={() => handleExport(slot.id)}
                  >
                    {slot.id === 1 ? '🔄 Auto' : `💾 Slot ${slot.id}`}
                  </button>
                ))}
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '1.5rem',
            }}>
              <h3 style={{ color: '#DAA520', marginTop: 0, marginBottom: '1rem' }}>
                📥 Import Save
              </h3>
              <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '1rem' }}>
                Load a previously exported save file.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                style={{ display: 'none' }}
              />

              <button
                className="btn btn-secondary"
                onClick={() => fileInputRef.current?.click()}
                style={{ width: '100%' }}
              >
                📁 Choose File to Import
              </button>

              <p style={{ color: '#666', fontSize: '0.8rem', marginTop: '0.5rem', textAlign: 'center' }}>
                Save will be imported to Slot 2 or 3
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{
          marginTop: '1.5rem',
          paddingTop: '1rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          textAlign: 'center',
          fontSize: '0.8rem',
          color: '#666',
        }}>
          💡 Saves are stored in your browser. Clear browser data to reset.
        </div>
      </div>

      {/* CSS */}
      <style>{`
        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-family: 'Cinzel', serif;
          font-size: 0.95rem;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #8B0000, #FF4500);
          color: #ffffff !important;
          box-shadow: 0 4px 15px rgba(139, 0, 0, 0.4);
          text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
        }
        
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(139, 0, 0, 0.6);
        }
        
        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          color: #cccccc !important;
        }
        
        .btn-secondary {
          background: #333333;
          color: #DAA520;
          border: 1px solid #DAA520;
          text-shadow: none;
        }
        
        .btn-secondary:hover {
          background: #DAA520;
          color: #000000;
        }
        
        .btn-danger {
          background: rgba(244, 67, 54, 0.2);
          color: #f44336;
          border: 1px solid #f44336;
        }
        
        .btn-danger:hover {
          background: #f44336;
          color: white;
        }
      `}</style>
    </div>
  )
}

export default SaveSlots
