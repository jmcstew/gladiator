# ALL ROADS LEAD TO ROME - Complete Game Documentation

## 📋 Table of Contents
1. [Game Overview](#game-overview)
2. [Installation & Setup](#installation--setup)
3. [Game Mechanics](#game-mechanics)
4. [API Reference](#api-reference)
5. [Database Schema](#database-schema)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

---

## 🎮 Game Overview

**ALL ROADS LEAD TO ROME** is a roguelike gladiator battle game where players create warriors, fight through three cities, and attempt to reach Rome as the ultimate champion.

### Features
- ⚔️ **Turn-based combat** - Tactical battle system
- 🏛️ **Three cities** - Capua → Alexandria → Rome
- 🎯 **Plead for mercy** - Charisma-based plea system
- 🐾 **Pet companions** - Fight alongside your gladiator
- 🏆 **Victory poses** - Celebrate wins in style
- 💀 **Rogue-like progression** - Captured = equipment lost, back to Capua
- 💀 **Execution** - Lose in Capua = permanent death

---

## 🚀 Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

```bash
cd gladiator/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# or: venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Seed database with items and pets
python seed.py

# Run the API server
uvicorn main:app --reload
```

**Backend runs at:** http://localhost:8000

### Frontend Setup

```bash
cd gladiator/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**Frontend runs at:** http://localhost:5173

---

## ⚔️ Game Mechanics

### Character Creation

**Body Attributes (0-100):**
| Attribute | Affects |
|-----------|---------|
| Height | Agility, reach |
| Weight | Strength, HP |
| Chest | Endurance, HP |
| Muscles | Strength, damage |
| Arms | Strength, damage |
| Legs | Agility, dodge |

**Homeland Bonuses:**
| Homeland | Bonus |
|----------|-------|
| Rome | +2 Charisma, +1 Intelligence |
| Sparta | +3 Endurance, +1 Strength |
| Gaul | +2 Strength, +1 Agility |
| Egypt | +2 Agility, +1 Intelligence |
| Germania | +2 Strength, +1 Endurance |

### Combat System

**Actions:**
| Action | Damage Dealt | Damage Taken | Notes |
|--------|-------------|--------------|-------|
| Attack | STR÷2 to STR | level×3 to ×5 | Standard attack |
| Defend | AGI÷3 to ÷2 | level×1 to ×2 | 50% damage reduction |
| Special | STR to STR×2 | level×4 to ×6 | High risk/reward |
| Plead | - | - | See below |

### Plea System

**Charisma-based mercy chance:**
```
Plea Success % = 20% + (Charisma × 1.5%)
Max: 80% (at 40 CHA)
```

**Example:**
- 10 CHA → 35% chance
- 20 CHA → 50% chance
- 30 CHA → 65% chance
- 40 CHA → 80% chance

**Outcomes:**
| Location | Mercy Granted | Plea Denied |
|----------|--------------|-------------|
| Capua | Escape | 💀 Execution (Game Over) |
| Alexandria/Rome | Escape | 🔗 Capture (back to Capua) |

### City Progression

| City | Required | Opponent Levels | Shop Level |
|------|----------|----------------|------------|
| Capua | - | 1-4 | 1 |
| Alexandria | Merchant Cart (500g) | 3-7 | 2 |
| Rome | Chariot (1500g) | 6-10 | 3 |

### Equipment System

**Slots:** Weapon, Helmet, Chestplate, Gauntlets, Shield, Greaves

**Rarity Tiers:**
| Rarity | Color | Bonus |
|--------|-------|-------|
| Common | Gray | Base stats |
| Uncommon | Green | + |
| Rare |10% stats Blue | +25% stats |
| Epic | Purple | +50% stats |
| Legendary | Gold | +100% stats |

### Pet Companions

Pets fight alongside your gladiator and provide combat bonuses.

**Pet Types:**
| Type | Examples | Bonuses |
|------|----------|---------|
| Feline | Cat, Lion, Lioness | Attack focused |
| Avian | Raven, Eagle, Gryphon | Balanced |
| Canine | Dog, Hound, Wolf | Defense focused |

**Rarity Tiers:**
| Rarity | Price Range | Base Bonuses |
|--------|------------|--------------|
| Common | 100-150g | +2-5 to stats |
| Uncommon | 400-450g | +5-10 to stats |
| Rare | 800-850g | +10-15 to stats |
| Epic | 1500-1600g | +15-20 to stats |
| Legendary | 3000g | +20-35 to stats |

**Pet Abilities:**
| Ability | Effect |
|---------|--------|
| Pack Attack | Extra damage on your attack |
| Sharp Eyes | Increased accuracy |
| Roar of Courage | Defense boost for 1 round |
| Night Vision | Dodge chance increase |
| Royal Pounce | Massive first attack damage |
| Sky Dive | Double aerial damage |
| Dragon's Breath | AoE damage to enemies |

---

## 📡 API Reference

### Authentication

```http
POST /auth/register
Content-Type: application/json

{
  "name": "string",
  "gender": "male|female",
  "homeland": "Rome|Gaul|Sparta|Egypt|Germania",
  "height": 50,
  "weight": 50,
  "chest": 50,
  "muscles": 50,
  "arms": 50,
  "legs": 50
}

Response: { gladiator object }
```

### Gladiator

```http
GET /gladiator/{id}
Response: { gladiator object }

GET /progression/{id}
Response: {
  "level": 1,
  "experience": 0,
  "exp_to_next": 100,
  "skill_points": 3
}

POST /progression/train/{id}/{stat}
Response: { "skill_points_remaining": 2 }
```

### Arena

```http
POST /arena/start/{gladiator_id}?battle_type=arena|tournament|boss
Response: {
  "battle_id": "uuid",
  "opponent_name": "Valerius",
  "opponent_level": 3
}

POST /arena/battle/{battle_id}/action
Content-Type: application/json

{ "action": "attack"|"defend"|"special"|"plead" }

Response: {
  "damage_dealt": 15,
  "damage_taken": 20,
  "gladiator_hp": 80,
  "opponent_hp": 70,
  "victory": true|false|null,
  "escaped": true|false,
  "spared": true|false
}
```

### Shop

```http
GET /shop/items
Response: [ { item objects } ]

POST /shop/buy
Content-Type: application/json

{ "gladiator_id": "uuid", "item_id": "uuid" }
```

### Equipment

```http
GET /equipment/{gladiator_id}
Response: {
  "equipped": { "weapon": {...} },
  "inventory": [ {...} ]
}

POST /equipment/{gladiator_id}/equip/{item_id}
Response: { "message": "Equipped", "stats": {...} }

POST /equipment/{gladiator_id}/unequip/{slot}
Response: { "message": "Unequipped" }
```

### World Map

```http
GET /worldmap
Response: { "cities": {...} }

GET /worldmap/{gladiator_id}
Response: {
  "current_city": "Capua",
  "vehicles": [],
  "capture_count": 0,
  "can_travel": true
}

POST /worldmap/{gladiator_id}/travel
Response: { "message": "Traveled", "new_city": "Alexandria" }

POST /worldmap/{gladiator_id}/buy-vehicle
Content-Type: application/json

{ "vehicle_type": "merchant_cart"|"chariot" }
```

### Pets

```http
GET /pets
Response: [ { pet objects } ]

GET /pets/owned/{gladiator_id}
Response: {
  "pets": [ {...} ],
  "active_pet_id": "uuid"
}

POST /pets/buy
Content-Type: application/json

{ "gladiator_id": "uuid", "pet_id": "uuid" }

POST /pets/activate
Content-Type: application/json

{ "gladiator_id": "uuid", "pet_id": "uuid" }
```

### Health

```http
GET /health
Response: { "status": "healthy", "timestamp": "..." }
```

---

## 🗄️ Database Schema

### Gladiators Table
```sql
CREATE TABLE gladiators (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  gender TEXT NOT NULL,
  homeland TEXT NOT NULL,
  height INT DEFAULT 50,
  weight INT DEFAULT 50,
  chest INT DEFAULT 50,
  muscles INT DEFAULT 50,
  arms INT DEFAULT 50,
  legs INT DEFAULT 50,
  strength INT DEFAULT 10,
  agility INT DEFAULT 10,
  endurance INT DEFAULT 10,
  intelligence INT DEFAULT 10,
  charisma INT DEFAULT 10,
  level INT DEFAULT 1,
  experience INT DEFAULT 0,
  skill_points INT DEFAULT 0,
  gold INT DEFAULT 100,
  wins INT DEFAULT 0,
  losses INT DEFAULT 0,
  helmet_id TEXT,
  chestplate_id TEXT,
  gauntlets_id TEXT,
  weapon_id TEXT,
  shield_id TEXT,
  greaves_id TEXT,
  current_city TEXT DEFAULT 'Capua',
  vehicles JSON,
  active_pet_id TEXT,
  is_active BOOLEAN DEFAULT true,
  is_captive BOOLEAN DEFAULT false,
  capture_count INT DEFAULT 0,
  created_at DATETIME,
  updated_at DATETIME
);
```

### Items Table
```sql
CREATE TABLE items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  rarity TEXT DEFAULT 'common',
  strength_bonus INT DEFAULT 0,
  agility_bonus INT DEFAULT 0,
  endurance_bonus INT DEFAULT 0,
  charisma_bonus INT DEFAULT 0,
  damage INT DEFAULT 0,
  armor INT DEFAULT 0,
  speed_penalty INT DEFAULT 0,
  buy_price INT NOT NULL,
  sell_price INT,
  description TEXT,
  icon TEXT
);
```

### Pets Table
```sql
CREATE TABLE pets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  rarity TEXT DEFAULT 'common',
  attack_bonus INT DEFAULT 0,
  defense_bonus INT DEFAULT 0,
  hp_bonus INT DEFAULT 0,
  ability_name TEXT,
  ability_description TEXT,
  buy_price INT NOT NULL,
  description TEXT
);
```

### Battles Table
```sql
CREATE TABLE battles (
  id TEXT PRIMARY KEY,
  gladiator_id TEXT REFERENCES gladiators(id),
  opponent_name TEXT NOT NULL,
  opponent_level INT NOT NULL,
  battle_type TEXT DEFAULT 'arena',
  victory BOOLEAN,
  rounds INT DEFAULT 0,
  damage_dealt INT DEFAULT 0,
  damage_taken INT DEFAULT 0,
  gold_earned INT DEFAULT 0,
  experience_earned INT DEFAULT 0,
  created_at DATETIME
);
```

---

## 🧪 Testing

### Running Backend Tests

```bash
cd gladiator/backend
pytest tests/ -v

# Run with coverage
pytest tests/ --cov=main --cov-report=html
```

### Test Categories

| Test Class | Description |
|------------|-------------|
| `TestStatsCalculation` | Stat formula tests |
| `TestCharacterCreation` | Registration tests |
| `TestArena` | Battle mechanics tests |
| `TestWorldMap` | City progression tests |
| `TestPets` | Pet companion tests |
| `TestEquipment` | Shop and equipment tests |
| `TestProgression` | Leveling and training tests |
| `TestHealth` | API health check |

---

## 🔧 Troubleshooting

### Common Issues

**1. Database errors on first run**
```bash
# Delete existing database and reseed
rm gladiator/backend/gladiator.db
python seed.py
```

**2. Frontend won't connect to backend**
- Ensure backend is running on port 8000
- Check CORS settings in main.py
- Verify API_URL in frontend components

**3. Pets not appearing in shop**
```bash
# Reseed database
python seed.py
```

**4. Tests failing**
```bash
# Delete test database
rm gladiator/backend/test_gladiator.db
pytest tests/ -v --tb=short
```

### Debug Mode

Enable verbose logging:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

---

## 📝 Change Log

### v0.5.0 - Current
- ✅ Pet companion system (10 pets, 5 rarities)
- ✅ Victory pose system (6 poses)
- ✅ Plead replaces flee (charisma-based)
- ✅ 5 female opponents with LORA portraits
- ✅ 10 unique pet portraits
- ✅ Shopkeeper Livia portrait
- ✅ Elite documentation

### v0.4.0
- ✅ World map with 3 cities
- ✅ Vehicle gating (Merchant Cart, Chariot)
- ✅ Capture system (rogue-like)
- ✅ Execution (game over in Capua)
- ✅ 19 arena opponents

### v0.3.0
- ✅ Equipment system (6 slots, 5 rarities)
- ✅ Loot system (1 item per victory)
- ✅ Combat animations (CSS-based)
- ✅ XP and leveling

### v0.2.0
- ✅ Character creation with body sliders
- ✅ Combat system (4 actions)
- ✅ Basic AI opponents
- ✅ Gold and rewards

### v0.1.0
- ✅ Project structure
- ✅ FastAPI backend
- ✅ React frontend
- ✅ SQLite database

---

## 📄 License

This project is proprietary software.

---

**Document Version:** 1.0  
**Last Updated:** February 12, 2026  
**Game Version:** 0.5.0
