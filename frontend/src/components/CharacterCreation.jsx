import React, { useState } from 'react'

const HOMELANDS = [
  { id: 'Rome', name: 'Rome', bonus: '+2 Charisma, +1 Intelligence' },
  { id: 'Gaul', name: 'Gaul', bonus: '+2 Strength, +1 Agility' },
  { id: 'Sparta', name: 'Sparta', bonus: '+3 Endurance, +1 Strength' },
  { id: 'Egypt', name: 'Egypt', bonus: '+2 Agility, +1 Intelligence' },
  { id: 'Germania', name: 'Germania', bonus: '+2 Strength, +1 Endurance' },
]

const API_URL = 'http://localhost:8000'

function CharacterCreation({ onCreated }) {
  const [form, setForm] = useState({
    name: '',
    gender: 'male',
    homeland: 'Rome',
    height: 50,
    weight: 50,
    chest: 50,
    muscles: 50,
    arms: 50,
    legs: 50,
  })

  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.detail || 'Failed to create gladiator')
      }

      const data = await res.json()
      onCreated(data.id)
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const updateSlider = (field, value) => {
    setForm(prev => ({ ...prev, [field]: parseInt(value) }))
  }

  // Calculate derived stats
  const getStrength = () => Math.floor(form.weight * 0.4 + form.muscles * 0.4 + form.arms * 0.2)
  const getAgility = () => Math.floor(form.height * 0.4 + form.legs * 0.4 + form.weight * 0.2)
  const getEndurance = () => Math.floor(form.chest * 0.4 + form.weight * 0.3 + form.legs * 0.3)
  const getIntelligence = () => Math.floor(form.height * 0.5 + form.weight * 0.2 + form.chest * 0.3)
  const getCharisma = () => Math.floor(form.height * 0.5 + form.chest * 0.3 + form.weight * 0.2)

  // Homeland bonuses
  const getHomelandBonus = () => {
    const bonuses = {
      'Rome': { charisma: 2, intelligence: 1 },
      'Gaul': { strength: 2, agility: 1 },
      'Sparta': { endurance: 3, strength: 1 },
      'Egypt': { agility: 2, intelligence: 1 },
      'Germania': { strength: 2, endurance: 1 },
    }
    return bonuses[form.homeland] || {}
  }
  const bonus = getHomelandBonus()

  return (
    <div className="character-creation">
      <h2>Create Your Gladiator</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="card">
          <h3>Basic Information</h3>
          
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="Enter your gladiator's name"
              required
            />
          </div>

          <div className="form-group">
            <label>Gender</label>
            <select value={form.gender} onChange={(e) => updateField('gender', e.target.value)}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div className="form-group">
            <label>Homeland</label>
            <select value={form.homeland} onChange={(e) => updateField('homeland', e.target.value)}>
              {HOMELANDS.map(h => (
                <option key={h.id} value={h.id}>{h.name} ({h.bonus})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="card">
          <h3>Body Attributes (affect combat stats)</h3>
          
          <div className="slider-group">
            <div className="slider-header">
              <label>Height</label>
              <span>{form.height < 33 ? 'Short' : form.height < 66 ? 'Average' : 'Tall'}</span>
            </div>
            <input
              type="range"
              className="slider"
              min="1"
              max="99"
              value={form.height}
              onChange={(e) => updateSlider('height', e.target.value)}
            />
          </div>

          <div className="slider-group">
            <div className="slider-header">
              <label>Weight</label>
              <span>{form.weight < 33 ? 'Slim' : form.weight < 66 ? 'Average' : 'Broad'}</span>
            </div>
            <input
              type="range"
              className="slider"
              min="1"
              max="99"
              value={form.weight}
              onChange={(e) => updateSlider('weight', e.target.value)}
            />
          </div>

          <div className="slider-group">
            <div className="slider-header">
              <label>Chest</label>
              <span>{form.chest < 33 ? 'Small' : form.chest < 66 ? 'Medium' : 'Large'}</span>
            </div>
            <input
              type="range"
              className="slider"
              min="1"
              max="99"
              value={form.chest}
              onChange={(e) => updateSlider('chest', e.target.value)}
            />
          </div>

          <div className="slider-group">
            <div className="slider-header">
              <label>Muscles</label>
              <span>{form.muscles < 33 ? 'Lean' : form.muscles < 66 ? 'Athletic' : 'Ripped'}</span>
            </div>
            <input
              type="range"
              className="slider"
              min="1"
              max="99"
              value={form.muscles}
              onChange={(e) => updateSlider('muscles', e.target.value)}
            />
          </div>

          <div className="slider-group">
            <div className="slider-header">
              <label>Arms</label>
              <span>{form.arms < 33 ? 'Thin' : form.arms < 66 ? 'Average' : 'Thick'}</span>
            </div>
            <input
              type="range"
              className="slider"
              min="1"
              max="99"
              value={form.arms}
              onChange={(e) => updateSlider('arms', e.target.value)}
            />
          </div>

          <div className="slider-group">
            <div className="slider-header">
              <label>Legs</label>
              <span>{form.legs < 33 ? 'Slim' : form.legs < 66 ? 'Average' : 'Powerful'}</span>
            </div>
            <input
              type="range"
              className="slider"
              min="1"
              max="99"
              value={form.legs}
              onChange={(e) => updateSlider('legs', e.target.value)}
            />
          </div>
        </div>

        <div className="card">
          <h3>Preview Stats (Homeland bonuses included)</h3>
          
          <div className="stats-preview">
            <div className="stat-row">
              <span className="stat-name">STR</span>
              <span className="stat-value">{getStrength()}{bonus.strength ? `+${bonus.strength}` : ''}</span>
            </div>
            <div className="stat-row">
              <span className="stat-name">AGI</span>
              <span className="stat-value">{getAgility()}{bonus.agility ? `+${bonus.agility}` : ''}</span>
            </div>
            <div className="stat-row">
              <span className="stat-name">END</span>
              <span className="stat-value">{getEndurance()}{bonus.endurance ? `+${bonus.endurance}` : ''}</span>
            </div>
            <div className="stat-row">
              <span className="stat-name">INT</span>
              <span className="stat-value">{getIntelligence()}{bonus.intelligence ? `+${bonus.intelligence}` : ''}</span>
            </div>
            <div className="stat-row">
              <span className="stat-name">CHA</span>
              <span className="stat-value">{getCharisma()}{bonus.charisma ? `+${bonus.charisma}` : ''}</span>
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading || !form.name}>
          {loading ? 'Creating...' : 'Enter the Arena!'}
        </button>
      </form>
    </div>
  )
}

export default CharacterCreation
