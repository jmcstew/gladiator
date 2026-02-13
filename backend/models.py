# Database Models for Gladiator Game

from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import uuid

Base = declarative_base()

def generate_id():
    return str(uuid.uuid4())

# Character Creation Models
class Gladiator(Base):
    """Main gladiator character"""
    __tablename__ = "gladiators"
    
    id = Column(String, primary_key=True, default=generate_id)
    name = Column(String, nullable=False)
    gender = Column(String, nullable=False)  # male/female
    
    # Homeland (affects starting bonuses)
    homeland = Column(String, nullable=False)  # Rome, Gaul, Sparta, Egypt, Germania
    
    # Body Attributes (0-100)
    height = Column(Integer, default=50)  # Short to Tall
    weight = Column(Integer, default=50)  # Slim to Broad
    chest = Column(Integer, default=50)   # Small to Large
    muscles = Column(Integer, default=50)  # Lean to Ripped
    arms = Column(Integer, default=50)     # Thin to Thick
    legs = Column(Integer, default=50)    # Slim to Powerful
    
    # Combat Stats (derived from body + equipment + skills)
    strength = Column(Integer, default=10)
    agility = Column(Integer, default=10)
    endurance = Column(Integer, default=10)
    intelligence = Column(Integer, default=10)
    charisma = Column(Integer, default=10)
    
    # Leveling
    level = Column(Integer, default=1)
    experience = Column(Integer, default=0)
    skill_points = Column(Integer, default=0)
    
    # Resources
    gold = Column(Integer, default=100)
    wins = Column(Integer, default=0)
    losses = Column(Integer, default=0)
    
    # Equipment Slots
    helmet_id = Column(String, nullable=True)
    chestplate_id = Column(String, nullable=True)
    gauntlets_id = Column(String, nullable=True)
    weapon_id = Column(String, nullable=True)
    shield_id = Column(String, nullable=True)
    greaves_id = Column(String, nullable=True)
    
    # City Progression (Rogue-like)
    current_city = Column(String, default="Capua")  # Capua, Alexandria, Rome
    vehicles = Column(JSON, default=list)  # ["chariot", "merchant_cart"]
    
    # Pet Companion
    active_pet_id = Column(String, nullable=True)  # Active pet companion
    
    # Status
    is_active = Column(Boolean, default=True)
    is_captive = Column(Boolean, default=False)  # Captured and sent back
    capture_count = Column(Integer, default=0)  # Times captured
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    inventory = relationship("InventoryItem", back_populates="gladiator")
    battle_history = relationship("Battle", back_populates="gladiator")
    pets = relationship("GladiatorPet", back_populates="gladiator")

class Item(Base):
    """Shop items - weapons, armor, consumables"""
    __tablename__ = "items"
    
    id = Column(String, primary_key=True, default=generate_id)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)  # weapon, helmet, chestplate, gauntlets, shield, greaves, consumable
    rarity = Column(String, default="common")  # common, uncommon, rare, epic, legendary
    
    # Stats provided
    strength_bonus = Column(Integer, default=0)
    agility_bonus = Column(Integer, default=0)
    endurance_bonus = Column(Integer, default=0)
    charisma_bonus = Column(Integer, default=0)
    
    # Item specifics
    damage = Column(Integer, default=0)  # weapons
    armor = Column(Integer, default=0)   # armor pieces
    speed_penalty = Column(Integer, default=0)  # heavy armor
    
    # Economy
    buy_price = Column(Integer, nullable=False)
    sell_price = Column(Integer, nullable=True)
    
    # Visual
    description = Column(String, nullable=True)
    icon = Column(String, nullable=True)  # emoji or icon name

class InventoryItem(Base):
    """Items owned by gladiator"""
    __tablename__ = "inventory_items"
    
    id = Column(String, primary_key=True, default=generate_id)
    gladiator_id = Column(String, ForeignKey("gladiators.id"))
    item_id = Column(String, ForeignKey("items.id"))
    quantity = Column(Integer, default=1)
    is_equipped = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    gladiator = relationship("Gladiator", back_populates="inventory")
    item = relationship("Item")

class Skill(Base):
    """Trainable skills"""
    __tablename__ = "skills"
    
    id = Column(String, primary_key=True, default=generate_id)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)  # combat, defense, special
    description = Column(String, nullable=True)
    max_level = Column(Integer, default=10)
    base_bonus = Column(Integer, default=1)

class GladiatorSkill(Base):
    """Gladiator's learned skills"""
    __tablename__ = "gladiator_skills"
    
    id = Column(String, primary_key=True, default=generate_id)
    gladiator_id = Column(String, ForeignKey("gladiators.id"))
    skill_id = Column(String, ForeignKey("skills.id"))
    level = Column(Integer, default=1)

class Battle(Base):
    """Arena battles"""
    __tablename__ = "battles"
    
    id = Column(String, primary_key=True, default=generate_id)
    gladiator_id = Column(String, ForeignKey("gladiators.id"))
    
    # Battle info
    opponent_name = Column(String, nullable=False)
    opponent_level = Column(Integer, nullable=False)
    battle_type = Column(String, default="arena")  # arena, tournament, boss
    
    # Result
    victory = Column(Boolean, nullable=True)  # True/False or None if ongoing
    rounds = Column(Integer, default=0)
    damage_dealt = Column(Integer, default=0)
    damage_taken = Column(Integer, default=0)
    enemies_killed = Column(Integer, default=0)
    
    # Rewards
    gold_earned = Column(Integer, default=0)
    experience_earned = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    gladiator = relationship("Gladiator", back_populates="battle_history")

# ============ PETS ============

class Pet(Base):
    """Available pet types"""
    __tablename__ = "pets"
    
    id = Column(String, primary_key=True, default=generate_id)
    name = Column(String, nullable=False)  # e.g., "Lion", "Eagle", "Wolf"
    type = Column(String, nullable=False)  # feline, avian, canine
    rarity = Column(String, default="common")  # common, uncommon, rare, epic, legendary
    
    # Combat bonuses
    attack_bonus = Column(Integer, default=0)
    defense_bonus = Column(Integer, default=0)
    hp_bonus = Column(Integer, default=0)
    
    # Special abilities
    ability_name = Column(String, nullable=True)
    ability_description = Column(String, nullable=True)
    
    # Visual
    icon = Column(String, nullable=True)  # emoji or image
    image = Column(String, nullable=True)  # generated image path
    
    # Economy
    buy_price = Column(Integer, nullable=False)
    
    description = Column(String, nullable=True)

class GladiatorPet(Base):
    """Pet owned by a gladiator"""
    __tablename__ = "gladiator_pets"
    
    id = Column(String, primary_key=True, default=generate_id)
    gladiator_id = Column(String, ForeignKey("gladiators.id"))
    pet_id = Column(String, ForeignKey("pets.id"))
    
    # Stats
    level = Column(Integer, default=1)
    experience = Column(Integer, default=0)
    
    # Status
    is_active = Column(Boolean, default=True)  # Active companion
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    gladiator = relationship("Gladiator", back_populates="pets")
    pet = relationship("Pet")

# Homeland Bonuses
HOMELAND_BONUSES = {
    "Rome": {"charisma": 2, "intelligence": 1},
    "Gaul": {"strength": 2, "agility": 1},
    "Sparta": {"endurance": 3, "strength": 1},
    "Egypt": {"agility": 2, "intelligence": 1},
    "Germania": {"strength": 2, "endurance": 1},
}
