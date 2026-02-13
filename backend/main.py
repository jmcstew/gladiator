# Gladiator Game Backend - Main API

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
from sqlalchemy import create_engine, and_, or_
from sqlalchemy.orm import sessionmaker, Session
import uuid
import random

from models import Base, Gladiator, Item, InventoryItem, Battle, Skill, GladiatorSkill, HOMELAND_BONUSES, COMBAT_STYLES

# ============ CITY CONFIGURATION ============

CITIES = {
    "Capua": {
        "name": "Capua",
        "description": "The city where gladiators are made. The ludus awaits your training.",
        "image": "capua-arena.png",
        "opponent_levels": [1, 2, 3, 4],
        "shop_level": 1,
        "next_city": "Alexandria",
        "vehicle_required": "merchant_cart",
        "vehicle_price": 500,
        "boss": None,
    },
    "Alexandria": {
        "name": "Alexandria",
        "description": "The great library city of Egypt. Warriors from across the known world gather here.",
        "image": "alexandria.png",
        "opponent_levels": [3, 4, 5, 6, 7],
        "shop_level": 2,
        "next_city": "Rome",
        "vehicle_required": "chariot",
        "vehicle_price": 1500,
        "boss": None,
    },
    "Rome": {
        "name": "Rome",
        "description": "The eternal city. The Colosseum awaits—the ultimate test of your might.",
        "image": "rome-colosseum.png",
        "opponent_levels": [6, 7, 8, 9, 10],
        "shop_level": 3,
        "next_city": None,
        "vehicle_required": None,
        "vehicle_price": None,
        "boss": "The Emperor's Champion",
    },
}

# Opponent pool for each city
CITY_OPPONENTS = {
    "Capua": [
        {"name": "Crixus", "style": "gladiator", "dialogue": "Welcome to the arena, rookie. I'll teach you your first lesson."},
        {"name": "Varro", "style": "hoplite", "dialogue": "A shield wall cannot be breached. Prepare to fall."},
        {"name": "Priscus", "style": "murillo", "dialogue": "Two blades, one purpose: your demise."},
    ],
    "Alexandria": [
        {"name": "Sicarius", "style": "retiarius", "dialogue": "The desert winds carry the scent of death. That scent is you."},
        {"name": "Amazonia", "style": "thraex", "dialogue": "My sisters watch from the afterlife. I won't disappoint them."},
        {"name": "Kriemhild", "style": "hoplite", "dialogue": "The frozen north taught me to survive. You will learn to die."},
        {"name": "Boudicca's Daughter", "style": "dimachaerus", "dialogue": "My blade is quick. Your death will be quicker."},
    ],
    "Rome": [
        {"name": "Spartacus Reborn", "style": "hoplite", "dialogue": "They say I am the ghost of a legend. Tonight, I'll make you a memory."},
        {"name": "Lyca the Beast", "style": "bestiarius", "dialogue": "The animals taught me to kill. Let me show you what I've learned."},
        {"name": "Cassia the Scarlet", "style": "retiarius", "dialogue": "Your blood will honor the arena gods. I promise it will be beautiful."},
        {"name": "Grimhild", "style": "thraex", "dialogue": "My wolves hunger. After I kill you, they'll feast."},
        {"name": "Xylon the Broken", "style": "retiarius", "dialogue": "They took my fingers, but not my spirit. Let's see if you have any."},
    ],
}

# Boss opponent
BOSS_OPPONENT = {
    "name": "The Emperor's Champion",
    "level": 12,
    "style": "champion",
    "dialogue": "You have fought well to reach this arena. But none have defeated the Emperor's Champion. Tonight, that tradition continues—or ends.",
}

# Database setup
DATABASE_URL = "sqlite:///./gladiator.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Gladiator Game API",
    description="Local multiplayer gladiator battle game",
    version="0.1.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ============ MODELS ============

class GladiatorCreate(BaseModel):
    name: str
    gender: str
    homeland: str
    height: int = 50
    weight: int = 50
    chest: int = 50
    muscles: int = 50
    arms: int = 50
    legs: int = 50

class GladiatorResponse(BaseModel):
    id: str
    name: str
    gender: str
    homeland: str
    level: int
    experience: int
    gold: int
    wins: int
    losses: int
    strength: int
    agility: int
    endurance: int
    intelligence: int
    charisma: int

class BattleStart(BaseModel):
    battle_type: str = "arena"  # arena, tournament, boss

class BattleRound(BaseModel):
    action: str  # attack, defend, special, flee
    target: Optional[str] = None

# ============ HELPER FUNCTIONS ============

def calculate_stats(body_attrs, homeland, level):
    """Calculate combat stats from body attributes and homeland bonuses"""
    bonuses = HOMELAND_BONUSES.get(homeland, {})
    
    stats = {
        "strength": 10 + (body_attrs["muscles"] // 5) + (body_attrs["weight"] // 10) + bonuses.get("strength", 0),
        "agility": 10 + (body_attrs["legs"] // 5) + (body_attrs["height"] // 10) + bonuses.get("agility", 0),
        "endurance": 10 + (body_attrs["chest"] // 5) + bonuses.get("endurance", 0),
        "intelligence": 10 + bonuses.get("intelligence", 0),
        "charisma": 10 + bonuses.get("charisma", 0),
    }
    
    # Level scaling
    stats["strength"] += level * 2
    stats["agility"] += level
    stats["endurance"] += level * 2
    stats["intelligence"] += level
    stats["charisma"] += level
    
    return stats

# ============ AUTH ENDPOINTS ============

@app.post("/auth/register", response_model=GladiatorResponse)
def register_gladiator(data: GladiatorCreate, db: Session = Depends(get_db)):
    """Create a new gladiator"""
    if data.homeland not in HOMELAND_BONUSES:
        raise HTTPException(status_code=400, detail="Invalid homeland")
    
    body_attrs = {
        "height": data.height,
        "weight": data.weight,
        "chest": data.chest,
        "muscles": data.muscles,
        "arms": data.arms,
        "legs": data.legs,
    }
    
    stats = calculate_stats(body_attrs, data.homeland, 1)
    
    gladiator = Gladiator(
        id=str(uuid.uuid4()),
        name=data.name,
        gender=data.gender,
        homeland=data.homeland,
        height=data.height,
        weight=data.weight,
        chest=data.chest,
        muscles=data.muscles,
        arms=data.arms,
        legs=data.legs,
        level=1,
        experience=0,
        skill_points=3,
        gold=100,
        wins=0,
        losses=0,
        strength=stats["strength"],
        agility=stats["agility"],
        endurance=stats["endurance"],
        intelligence=stats["intelligence"],
        charisma=stats["charisma"],
    )
    
    db.add(gladiator)
    db.commit()
    db.refresh(gladiator)
    
    return gladiator

@app.get("/gladiator/{gladiator_id}", response_model=GladiatorResponse)
def get_gladiator(gladiator_id: str, db: Session = Depends(get_db)):
    """Get gladiator details"""
    gladiator = db.query(Gladiator).filter(Gladiator.id == gladiator_id).first()
    if not gladiator:
        raise HTTPException(status_code=404, detail="Gladiator not found")
    return gladiator

# ============ SHOP ENDPOINTS ============

@app.get("/shop/items")
def get_items(db: Session = Depends(get_db)):
    """Get all shop items"""
    items = db.query(Item).all()
    return items

@app.post("/shop/buy")
def buy_item(gladiator_id: str, item_id: str, db: Session = Depends(get_db)):
    """Purchase an item from the shop"""
    gladiator = db.query(Gladiator).filter(Gladiator.id == gladiator_id).first()
    if not gladiator:
        raise HTTPException(status_code=404, detail="Gladiator not found")
    
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    if gladiator.gold < item.buy_price:
        raise HTTPException(status_code=400, detail="Not enough gold")
    
    # Deduct gold
    gladiator.gold -= item.buy_price
    
    # Add to inventory
    inventory_item = InventoryItem(
        id=str(uuid.uuid4()),
        gladiator_id=gladiator_id,
        item_id=item_id,
    )
    db.add(inventory_item)
    db.commit()
    
    return {"message": f"Purchased {item.name}", "remaining_gold": gladiator.gold}

# ============ ARENA ENDPOINTS ============

@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

# ============ WORLD MAP / CITY PROGRESSION ============

@app.get("/worldmap")
def get_worldmap():
    """Get all cities and their status"""
    return {
        "cities": CITIES,
        "current_city_required": "Capua",
    }

@app.get("/worldmap/{gladiator_id}")
def get_gladiator_worldmap(gladiator_id: str, db: Session = Depends(get_db)):
    """Get gladiator's city progression status"""
    gladiator = db.query(Gladiator).filter(Gladiator.id == gladiator_id).first()
    if not gladiator:
        raise HTTPException(status_code=404, detail="Gladiator not found")
    
    current_city_data = CITIES.get(gladiator.current_city, CITIES["Capua"])
    
    # Check travel requirements
    can_travel = False
    travel_message = ""
    
    if current_city_data["next_city"]:
        next_city = CITIES[current_city_data["next_city"]]
        vehicles = gladiator.vehicles or []
        
        if next_city["vehicle_required"] in vehicles:
            can_travel = True
            travel_message = f"Ready to travel to {next_city['name']}"
        else:
            travel_message = f"Purchase a {next_city['vehicle_required'].replace('_', ' ')} to travel to {next_city['name']}"
    
    # Get boss status
    boss_available = False
    boss_unlocked = False
    
    if gladiator.current_city == "Rome":
        boss_available = True
        # Boss unlocked after winning 5 battles in Rome
        rome_wins = db.query(Battle).filter(
            Battle.gladiator_id == gladiator_id,
            Battle.victory == True,
            Battle.opponent_level >= 6
        ).count()
        boss_unlocked = rome_wins >= 5
    
    return {
        "gladiator_id": gladiator_id,
        "current_city": gladiator.current_city,
        "city_data": current_city_data,
        "vehicles": gladiator.vehicles or [],
        "capture_count": gladiator.capture_count,
        "can_travel": can_travel,
        "travel_message": travel_message,
        "next_city": current_city_data["next_city"],
        "boss_available": boss_available,
        "boss_unlocked": boss_unlocked,
    }

@app.post("/worldmap/{gladiator_id}/travel")
def travel_to_city(gladiator_id: str, target_city: str, db: Session = Depends(get_db)):
    """Travel to another city if requirements are met"""
    gladiator = db.query(Gladiator).filter(Gladiator.id == gladiator_id).first()
    if not gladiator:
        raise HTTPException(status_code=404, detail="Gladiator not found")
    
    if target_city not in CITIES:
        raise HTTPException(status_code=400, detail="Invalid city")
    
    current_city_data = CITIES.get(gladiator.current_city, CITIES["Capua"])
    
    # Check if this is the next city
    if target_city != current_city_data.get("next_city"):
        raise HTTPException(status_code=400, detail="Can only travel to the next city")
    
    # Check vehicle requirement
    vehicles = gladiator.vehicles or []
    vehicle_required = current_city_data.get("vehicle_required")
    
    if vehicle_required and vehicle_required not in vehicles:
        raise HTTPException(status_code=400, detail=f"Vehicle required: {vehicle_required}")
    
    # Travel successful
    old_city = gladiator.current_city
    gladiator.current_city = target_city
    db.commit()
    
    return {
        "message": f"Traveled from {old_city} to {target_city}",
        "new_city": target_city,
        "city_data": CITIES[target_city],
    }

@app.post("/worldmap/{gladiator_id}/buy-vehicle")
def buy_vehicle(gladiator_id: str, vehicle_type: str, db: Session = Depends(get_db)):
    """Purchase a vehicle to unlock city travel"""
    gladiator = db.query(Gladiator).filter(Gladiator.id == gladiator_id).first()
    if not gladiator:
        raise HTTPException(status_code=404, detail="Gladiator not found")
    
    # Get vehicle item from shop
    vehicle_item = db.query(Item).filter(
        Item.type == "vehicle",
        Item.name.ilike(f"%{vehicle_type}%")
    ).first()
    
    if not vehicle_item:
        raise HTTPException(status_code=404, detail="Vehicle not found in shop")
    
    vehicles = gladiator.vehicles or []
    
    # Check if already owned
    if vehicle_type in vehicles or any(v in vehicles for v in [vehicle_type, vehicle_item.name]):
        raise HTTPException(status_code=400, detail="You already own this vehicle")
    
    # Check gold
    if gladiator.gold < vehicle_item.buy_price:
        raise HTTPException(status_code=400, detail=f"Not enough gold. Need {vehicle_item.buy_price}")
    
    # Purchase
    gladiator.gold -= vehicle_item.buy_price
    
    # Determine vehicle key
    vehicle_key = vehicle_type.lower().replace(" ", "_")
    if "merchant" in vehicle_type.lower():
        vehicle_key = "merchant_cart"
    elif "chariot" in vehicle_type.lower():
        vehicle_key = "chariot"
    
    if vehicles:
        vehicles.append(vehicle_key)
    else:
        vehicles = [vehicle_key]
    
    gladiator.vehicles = vehicles
    db.commit()
    
    return {
        "message": f"Purchased {vehicle_item.name}!",
        "vehicle": vehicle_key,
        "remaining_gold": gladiator.gold,
        "can_travel": True,
    }

@app.post("/arena/battle/{battle_id}/action")
def battle_action(battle_id: str, action: BattleRound, db: Session = Depends(get_db)):
    """Execute a battle action with capture logic"""
    battle = db.query(Battle).filter(Battle.id == battle_id).first()
    if not battle:
        raise HTTPException(status_code=404, detail="Battle not found")
    
    gladiator = db.query(Gladiator).filter(Gladiator.id == battle.gladiator_id).first()
    
    # Simple combat logic
    damage_dealt = 0
    damage_taken = 0
    
    if action.action == "attack":
        damage_dealt = random.randint(gladiator.strength // 2, gladiator.strength)
        opponent_dmg = random.randint(battle.opponent_level * 3, battle.opponent_level * 5)
        damage_taken = opponent_dmg
    elif action.action == "defend":
        damage_dealt = random.randint(gladiator.agility // 3, gladiator.agility // 2)
        damage_taken = random.randint(battle.opponent_level, battle.opponent_level * 2)
    elif action.action == "special":
        damage_dealt = random.randint(gladiator.strength, gladiator.strength * 2)
        damage_taken = random.randint(battle.opponent_level * 4, battle.opponent_level * 6)
    elif action.action == "plead":
        # Pleading to the emperor - charisma based chance to be spared
        charisma = gladiator.charisma or 0
        
        # Calculate charisma bonus (base 20% + charisma modifier)
        base_chance = 0.20
        charisma_bonus = charisma * 0.015  # +1.5% per charisma point
        flee_chance = min(0.80, base_chance + charisma_bonus)
        
        if random.random() < flee_chance:
            return {
                "message": "You pleaded with the Emperor... and they MERCED! You live to fight another day!",
                "victory": False,
                "escaped": True,
                "spared": True
            }
        else:
            # Failed to plead - face capture/execution
            return {
                "message": "The Emperor has spoken: No mercy! You are to be... dealt with.",
                "victory": False,
                "escaped": False,
                "spared": False
            }
    
    # Update battle
    battle.rounds += 1
    battle.damage_dealt += damage_dealt
    battle.damage_taken += damage_taken
    
    gladiator_hp = gladiator.endurance * 10 - battle.damage_taken
    opponent_hp = battle.opponent_level * 10 - battle.damage_dealt
    
    # Check for end conditions
    victory = None
    leveled_up = False
    
    if opponent_hp <= 0:
        victory = True
        battle.victory = True
        battle.gold_earned = battle.opponent_level * 25
        battle.experience_earned = battle.opponent_level * 50
        gladiator.wins += 1
        gladiator.gold += battle.gold_earned
        gladiator.experience += battle.experience_earned
        
        # Level up check
        exp_to_level = gladiator.level * 100
        if gladiator.experience >= exp_to_level:
            gladiator.level += 1
            gladiator.experience -= exp_to_level
            gladiator.skill_points += 2
            gladiator.strength += 2
            gladiator.agility += 1
            gladiator.endurance += 2
            leveled_up = True
            
    elif gladiator_hp <= 0 or (action.action == "plead" and battle.damage_taken >= gladiator.endurance * 10):
        victory = False
        battle.victory = False
        
        # Handle PLEDGE FAILED case (plead but denied)
        if action.action == "plead" and battle.damage_taken >= gladiator.endurance * 10:
            # Player tried to plead but was denied - skip damage, go straight to fate
            battle.damage_taken = gladiator.endurance * 10
            battle.message = "The Emperor has spoken: No mercy! You are to be... dealt with."
        else:
            battle.experience_earned = battle.opponent_level * 10
            gladiator.experience += battle.experience_earned
            
        gladiator.losses += 1
        
        # ============ EXECUTION LOGIC (Lose in Capua or Plead Denied) ============
        # If player loses in Capua or their plea was denied, they are executed - GAME OVER
        if gladiator.current_city == "Capua" or (action.action == "plead" and battle.damage_taken >= gladiator.endurance * 10):
            gladiator.is_active = False  # Mark as dead
            gladiator.is_captive = False
            
            db.commit()
            
            return {
                "battle_id": battle_id,
                "action": action.action,
                "damage_dealt": damage_dealt,
                "damage_taken": damage_taken,
                "gladiator_hp": 0,
                "opponent_hp": max(0, opponent_hp),
                "victory": False,
                "executed": True,
                "game_over": True,
                "message": "You have been executed in the arena!",
                "final_stats": {
                    "level": gladiator.level,
                    "wins": gladiator.wins,
                    "losses": gladiator.losses,
                    "final_city": gladiator.current_city,
                }
            }
        
        # ============ CAPTURE LOGIC (Rogue-like) ============
        # Player is captured and sent back to Capua
        # All equipment is lost, but physical stats remain
        if gladiator.current_city != "Capua":
            gladiator.is_captive = True
            gladiator.capture_count += 1
            
            # Strip all equipment
            old_equipment = []
            for slot in ["helmet_id", "chestplate_id", "gauntlets_id", "weapon_id", "shield_id", "greaves_id"]:
                item_id = getattr(gladiator, slot)
                if item_id:
                    item = db.query(Item).filter(Item.id == item_id).first()
                    if item:
                        old_equipment.append(item.name)
                    setattr(gladiator, slot, None)
            
            # Remove stat bonuses from equipment
            base_stats = calculate_stats({
                "height": gladiator.height,
                "weight": gladiator.weight,
                "chest": gladiator.chest,
                "muscles": gladiator.muscles,
                "arms": gladiator.arms,
                "legs": gladiator.legs,
            }, gladiator.homeland, gladiator.level)
            
            # Keep level-scaled stats but remove equipment bonuses
            gladiator.strength = base_stats["strength"]
            gladiator.agility = base_stats["agility"]
            gladiator.endurance = base_stats["endurance"]
            gladiator.charisma = base_stats["charisma"]
            
            # Send back to Capua
            old_city = gladiator.current_city
            gladiator.current_city = "Capua"
            
            db.commit()
            
            return {
                "battle_id": battle_id,
                "action": action.action,
                "damage_dealt": damage_dealt,
                "damage_taken": damage_taken,
                "gladiator_hp": 0,
                "opponent_hp": max(0, opponent_hp),
                "victory": False,
                "captured": True,
                "message": f"CAPTURED! You've been taken prisoner and shipped back to Capua.",
                "captured_details": {
                    "old_city": old_city,
                    "new_city": "Capua",
                    "lost_equipment": old_equipment,
                    "stats_preserved": True,
                    "capture_count": gladiator.capture_count,
                },
                "rounds": battle.rounds,
                "experience_earned": battle.experience_earned,
            }
    
    db.commit()
    
    return {
        "battle_id": battle_id,
        "action": action.action,
        "damage_dealt": damage_dealt,
        "damage_taken": damage_taken,
        "gladiator_hp": max(0, gladiator_hp),
        "opponent_hp": max(0, opponent_hp),
        "victory": victory,
        "captured": False,
        "rounds": battle.rounds,
        "gold_earned": battle.gold_earned if victory else 0,
        "experience_earned": battle.experience_earned,
        "leveled_up": leveled_up,
    }

@app.post("/arena/start/{gladiator_id}")
def start_arena_battle(gladiator_id: str, battle_type: str = "arena", db: Session = Depends(get_db)):
    """Start a battle against AI opponent with city-specific opponents"""
    gladiator = db.query(Gladiator).filter(Gladiator.id == gladiator_id).first()
    if not gladiator:
        raise HTTPException(status_code=404, detail="Gladiator not found")
    
    city_data = CITIES.get(gladiator.current_city, CITIES["Capua"])
    
    # Boss battle override
    if battle_type == "boss":
        if gladiator.current_city != "Rome":
            raise HTTPException(status_code=400, detail="Boss only available in Rome")
        
        # Check boss unlock
        rome_wins = db.query(Battle).filter(
            Battle.gladiator_id == gladiator_id,
            Battle.victory == True,
            Battle.opponent_level >= 6
        ).count()
        
        if rome_wins < 5:
            raise HTTPException(status_code=400, detail="Win 5 battles in Rome (Lv.6+) to unlock the boss")
        
        boss = BOSS_OPPONENT
        opponent_name = boss["name"]
        opponent_level = boss["level"]
        dialogue = boss["dialogue"]
        
    else:
        # Regular arena battle
        opponent_pool = CITY_OPPONENTS.get(gladiator.current_city, CITY_OPPONENTS["Capua"])
        opponent = random.choice(opponent_pool)
        opponent_name = opponent["name"]
        dialogue = opponent["dialogue"]
        
        # Level scaling based on city
        level_range = city_data["opponent_levels"]
        opponent_level = random.choice(level_range)
    
    battle = Battle(
        id=str(uuid.uuid4()),
        gladiator_id=gladiator_id,
        opponent_name=opponent_name,
        opponent_level=opponent_level,
        battle_type=battle_type,
    )
    
    db.add(battle)
    db.commit()
    db.refresh(battle)
    
    return {
        "battle_id": battle.id,
        "opponent_name": opponent_name,
        "opponent_level": opponent_level,
        "opponent_city": gladiator.current_city,
        "dialogue": dialogue,
        "gladiator_hp": gladiator.endurance * 10,
        "opponent_hp": opponent_level * 10,
        "status": "started",
    }

@app.get("/arena/history/{gladiator_id}")
def get_battle_history(gladiator_id: str, db: Session = Depends(get_db)):
    """Get gladiator's battle history"""
    battles = db.query(Battle).filter(Battle.gladiator_id == gladiator_id).order_by(Battle.created_at.desc()).all()
    return battles

# ============ PROGRESSION ENDPOINTS ============

@app.get("/progression/{gladiator_id}")
def get_progression(gladiator_id: str, db: Session = Depends(get_db)):
    """Get gladiator progression info"""
    gladiator = db.query(Gladiator).filter(Gladiator.id == gladiator_id).first()
    if not gladiator:
        raise HTTPException(status_code=404, detail="Gladiator not found")
    
    exp_to_next = gladiator.level * 100
    
    return {
        "level": gladiator.level,
        "experience": gladiator.experience,
        "exp_to_next": exp_to_next,
        "skill_points": gladiator.skill_points,
        "wins": gladiator.wins,
        "losses": gladiator.losses,
        "win_rate": gladiator.wins / max(1, gladiator.wins + gladiator.losses),
    }

@app.post("/progression/train/{gladiator_id}/{stat}")
def train_stat(gladiator_id: str, stat: str, db: Session = Depends(get_db)):
    """Spend skill point to train a stat"""
    gladiator = db.query(Gladiator).filter(Gladiator.id == gladiator_id).first()
    if not gladiator:
        raise HTTPException(status_code=404, detail="Gladiator not found")
    
    if gladiator.skill_points <= 0:
        raise HTTPException(status_code=400, detail="No skill points available")
    
    valid_stats = ["strength", "agility", "endurance", "intelligence", "charisma"]
    if stat not in valid_stats:
        raise HTTPException(status_code=400, detail=f"Invalid stat. Choose: {valid_stats}")
    
    setattr(gladiator, stat, getattr(gladiator, stat) + 1)
    gladiator.skill_points -= 1
    db.commit()
    
    return {
        "stat": stat,
        "new_value": getattr(gladiator, stat),
        "skill_points_remaining": gladiator.skill_points,
    }

# ============ EQUIPMENT ENDPOINTS ============

@app.post("/equipment/{gladiator_id}/equip/{item_id}")
def equip_item(gladiator_id: str, item_id: str, db: Session = Depends(get_db)):
    """Equip an item from inventory to active slot"""
    gladiator = db.query(Gladiator).filter(Gladiator.id == gladiator_id).first()
    if not gladiator:
        raise HTTPException(status_code=404, detail="Gladiator not found")
    
    # Check if item is in inventory
    inv_item = db.query(InventoryItem).filter(
        InventoryItem.gladiator_id == gladiator_id,
        InventoryItem.item_id == item_id
    ).first()
    
    if not inv_item:
        raise HTTPException(status_code=404, detail="Item not in inventory")
    
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # Unequip current item of same type if any
    slot_map = {
        "helmet": "helmet_id",
        "chestplate": "chestplate_id",
        "gauntlets": "gauntlets_id",
        "weapon": "weapon_id",
        "shield": "shield_id",
        "greaves": "greaves_id",
    }
    
    slot = slot_map.get(item.type)
    if not slot:
        raise HTTPException(status_code=400, detail="Cannot equip this item type")
    
    # Unequip current
    current_item_id = getattr(gladiator, slot)
    if current_item_id:
        old_item = db.query(Item).filter(Item.id == current_item_id).first()
        if old_item:
            # Remove stat bonuses
            gladiator.strength -= old_item.strength_bonus
            gladiator.agility -= old_item.agility_bonus
            gladiator.endurance -= old_item.endurance_bonus
            gladiator.charisma -= old_item.charisma_bonus
    
    # Equip new item
    setattr(gladiator, slot, item_id)
    
    # Apply stat bonuses
    gladiator.strength += item.strength_bonus
    gladiator.agility += item.agility_bonus
    gladiator.endurance += item.endurance_bonus
    gladiator.charisma += item.charisma_bonus
    
    db.commit()
    
    return {
        "message": f"Equipped {item.name}",
        "slot": item.type,
        "stats": {
            "strength": gladiator.strength,
            "agility": gladiator.agility,
            "endurance": gladiator.endurance,
        }
    }

@app.post("/equipment/{gladiator_id}/unequip/{slot}")
def unequip_item(gladiator_id: str, slot: str, db: Session = Depends(get_db)):
    """Unequip an item from active slot"""
    gladiator = db.query(Gladiator).filter(Gladiator.id == gladiator_id).first()
    if not gladiator:
        raise HTTPException(status_code=404, detail="Gladiator not found")
    
    slot_map = {
        "helmet": "helmet_id",
        "chestplate": "chestplate_id",
        "gauntlets": "gauntlets_id",
        "weapon": "weapon_id",
        "shield": "shield_id",
        "greaves": "greaves_id",
    }
    
    slot_col = slot_map.get(slot)
    if not slot_col:
        raise HTTPException(status_code=400, detail="Invalid slot")
    
    current_item_id = getattr(gladiator, slot_col)
    if not current_item_id:
        raise HTTPException(status_code=400, detail="Nothing equipped in this slot")
    
    item = db.query(Item).filter(Item.id == current_item_id).first()
    if item:
        # Remove stat bonuses
        gladiator.strength -= item.strength_bonus
        gladiator.agility -= item.agility_bonus
        gladiator.endurance -= item.endurance_bonus
        gladiator.charisma -= item.charisma_bonus
    
    setattr(gladiator, slot_col, None)
    db.commit()
    
    return {"message": f"Unequipped {slot}"}

@app.get("/equipment/{gladiator_id}")
def get_equipment(gladiator_id: str, db: Session = Depends(get_db)):
    """Get equipped items and inventory"""
    gladiator = db.query(Gladiator).filter(Gladiator.id == gladiator_id).first()
    if not gladiator:
        raise HTTPException(status_code=404, detail="Gladiator not found")
    
    # Get equipped items
    equipped = {}
    slot_map = {
        "helmet": gladiator.helmet_id,
        "chestplate": gladiator.chestplate_id,
        "gauntlets": gladiator.gauntlets_id,
        "weapon": gladiator.weapon_id,
        "shield": gladiator.shield_id,
        "greaves": gladiator.greaves_id,
    }
    
    for slot, item_id in slot_map.items():
        if item_id:
            item = db.query(Item).filter(Item.id == item_id).first()
            if item:
                equipped[slot] = item
    
    # Get inventory
    inventory = db.query(InventoryItem).filter(InventoryItem.gladiator_id == gladiator_id).all()
    inventory_items = []
    for inv in inventory:
        item = db.query(Item).filter(Item.id == inv.item_id).first()
        if item:
            inventory_items.append({
                **inv.__dict__,
                "item": item,
            })
    
    return {
        "equipped": equipped,
        "inventory": inventory_items,
        "total_slots": 6,
        "used_slots": len(equipped),
    }

# ============ LOOTING ENDPOINTS ============

@app.post("/arena/battle/{battle_id}/loot")
def loot_defeated(battle_id: str, item_id: str, db: Session = Depends(get_db)):
    """Loot one item from defeated opponent"""
    battle = db.query(Battle).filter(Battle.id == battle_id).first()
    if not battle:
        raise HTTPException(status_code=404, detail="Battle not found")
    
    if battle.victory != True:
        raise HTTPException(status_code=400, detail="Can only loot from defeated opponents")
    
    gladiator = db.query(Gladiator).filter(Gladiator.id == battle.gladiator_id).first()
    if not gladiator:
        raise HTTPException(status_code=404, detail="Gladiator not found")
    
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # Check if already looted this battle
    # For simplicity, assume one loot per victory
    
    # Add to inventory
    inventory_item = InventoryItem(
        id=str(uuid.uuid4()),
        gladiator_id=gladiator.id,
        item_id=item_id,
    )
    db.add(inventory_item)
    db.commit()
    
    return {
        "message": f"Looted {item.name}!",
        "item": {
            "id": item.id,
            "name": item.name,
            "type": item.type,
            "rarity": item.rarity,
        }
    }

@app.get("/arena/battle/{battle_id}/available-loot")
def get_available_loot(battle_id: str, db: Session = Depends(get_db)):
    """Get items available to loot from defeated opponent"""
    battle = db.query(Battle).filter(Battle.id == battle_id).first()
    if not battle:
        raise HTTPException(status_code=404, detail="Battle not found")
    
    if battle.victory != True:
        raise HTTPException(status_code=400, detail="Battle not won yet")
    
    # Generate loot based on opponent level
    loot_pool = db.query(Item).filter(
        Item.rarity.in_(["common", "uncommon"]),
        Item.type != "consumable"
    ).limit(5).all()
    
    # Include a random item from the opponent's "loadout"
    loot_items = []
    for item in loot_pool:
        loot_items.append({
            "id": item.id,
            "name": item.name,
            "type": item.type,
            "rarity": item.rarity,
            "damage": item.damage,
            "armor": item.armor,
        })
    
    return {
        "battle_id": battle_id,
        "opponent_name": battle.opponent_name,
        "can_loot": True,
        "loot": loot_items,
    }

# ============ PET ENDPOINTS ============

@app.get("/pets")
def get_available_pets(db: Session = Depends(get_db)):
    """Get all available pets for purchase"""
    from models import Pet
    pets = db.query(Pet).all()
    return [
        {
            "id": pet.id,
            "name": pet.name,
            "type": pet.type,
            "rarity": pet.rarity,
            "attack_bonus": pet.attack_bonus,
            "defense_bonus": pet.defense_bonus,
            "hp_bonus": pet.hp_bonus,
            "ability_name": pet.ability_name,
            "ability_description": pet.ability_description,
            "buy_price": pet.buy_price,
            "description": pet.description,
        }
        for pet in pets
    ]

@app.get("/pets/owned/{gladiator_id}")
def get_owned_pets(gladiator_id: str, db: Session = Depends(get_db)):
    """Get pets owned by a gladiator"""
    from models import Pet, GladiatorPet
    import models
    
    gladiator = db.query(Gladiator).filter(Gladiator.id == gladiator_id).first()
    if not gladiator:
        raise HTTPException(status_code=404, detail="Gladiator not found")
    
    # Get all owned pets
    owned = db.query(GladiatorPet).filter(GladiatorPet.gladiator_id == gladiator_id).all()
    
    pets_data = []
    for owned_pet in owned:
        pet = db.query(Pet).filter(Pet.id == owned_pet.pet_id).first()
        if pet:
            pets_data.append({
                "id": owned_pet.id,
                "pet_id": pet.id,
                "name": pet.name,
                "type": pet.type,
                "rarity": pet.rarity,
                "level": owned_pet.level,
                "experience": owned_pet.experience,
                "attack_bonus": pet.attack_bonus,
                "defense_bonus": pet.defense_bonus,
                "hp_bonus": pet.hp_bonus,
                "ability_name": pet.ability_name,
                "ability_description": pet.ability_description,
            })
    
    return {
        "pets": pets_data,
        "active_pet_id": gladiator.active_pet_id,
    }

@app.post("/pets/buy")
def buy_pet(gladiator_id: str, pet_id: str, db: Session = Depends(get_db)):
    """Purchase a pet"""
    from models import Pet, GladiatorPet
    
    gladiator = db.query(Gladiator).filter(Gladiator.id == gladiator_id).first()
    if not gladiator:
        raise HTTPException(status_code=404, detail="Gladiator not found")
    
    pet = db.query(Pet).filter(Pet.id == pet_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    
    if gladiator.gold < pet.buy_price:
        raise HTTPException(status_code=400, detail=f"Not enough gold. Need {pet.buy_price}")
    
    # Check if already owned
    existing = db.query(GladiatorPet).filter(
        GladiatorPet.gladiator_id == gladiator_id,
        GladiatorPet.pet_id == pet_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You already own this pet")
    
    # Deduct gold and add pet
    gladiator.gold -= pet.buy_price
    
    new_pet = GladiatorPet(
        id=str(uuid.uuid4()),
        gladiator_id=gladiator_id,
        pet_id=pet_id,
        level=1,
        experience=0,
    )
    db.add(new_pet)
    
    # If this is the first pet, make it active
    if not gladiator.active_pet_id:
        gladiator.active_pet_id = new_pet.id
    
    db.commit()
    
    return {
        "message": f"Purchased {pet.name}!",
        "pet_name": pet.name,
        "remaining_gold": gladiator.gold,
    }

@app.post("/pets/activate")
def activate_pet(gladiator_id: str, pet_id: str, db: Session = Depends(get_db)):
    """Set a pet as the active companion"""
    gladiator = db.query(Gladiator).filter(Gladiator.id == gladiator_id).first()
    if not gladiator:
        raise HTTPException(status_code=404, detail="Gladiator not found")
    
    # Verify ownership
    from models import GladiatorPet
    owned = db.query(GladiatorPet).filter(
        GladiatorPet.gladiator_id == gladiator_id,
        GladiatorPet.pet_id == pet_id
    ).first()
    if not owned:
        raise HTTPException(status_code=404, detail="You don't own this pet")
    
    gladiator.active_pet_id = pet_id
    db.commit()
    
    return {"message": "Pet activated!"}

# ============ HEALTH CHECK ============

@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}
