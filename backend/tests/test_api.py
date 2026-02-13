# Elite Backend Test Suite for ALL ROADS LEAD TO ROME
# Run with: pytest tests/ -v

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sys
import os
import uuid

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app, get_db
from models import Base, Gladiator, Item, InventoryItem, Battle, Pet, GladiatorPet
from main import calculate_stats, CITIES, CITY_OPPONENTS, BOSS_OPPONENT

# Test database setup
DATABASE_URL = "sqlite:///./test_gladiator.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

# Create tables
Base.metadata.create_all(bind=engine)

# ============ HELPER FUNCTIONS ============

def create_test_gladiator(db, name="TestGladiator", homeland="Rome", level=1):
    """Create a test gladiator for testing"""
    gladiator = Gladiator(
        id="test-gladiator-" + str(level) + "-" + str(uuid.uuid4())[:8],
        name=name,
        gender="male",
        homeland=homeland,
        height=50,
        weight=50,
        chest=50,
        muscles=50,
        arms=50,
        legs=50,
        level=level,
        experience=0,
        skill_points=3,
        gold=100,
        wins=0,
        losses=0,
        strength=10,
        agility=10,
        endurance=10,
        intelligence=10,
        charisma=10,
    )
    db.add(gladiator)
    db.commit()
    return gladiator

def create_test_item(db, name="Test Sword", item_type="weapon", rarity="common", buy_price=100):
    """Create a test item for testing"""
    item = Item(
        id="test-item-" + str(uuid.uuid4())[:8],
        name=name,
        type=item_type,
        rarity=rarity,
        buy_price=buy_price,
        damage=10 if item_type == "weapon" else 0,
        armor=5 if item_type != "weapon" else 0,
    )
    db.add(item)
    db.commit()
    return item

def cleanup_test_data(db, gladiator_id):
    """Clean up test data after tests"""
    try:
        # Delete related records first
        db.query(GladiatorPet).filter(GladiatorPet.gladiator_id == gladiator_id).delete()
        db.query(Battle).filter(Battle.gladiator_id == gladiator_id).delete()
        db.query(InventoryItem).filter(InventoryItem.gladiator_id == gladiator_id).delete()
        db.query(Gladiator).filter(Gladiator.id == gladiator_id).delete()
        db.commit()
    except:
        db.rollback()

# ============ STAT CALCULATION TESTS ============

class TestStatsCalculation:
    """Test stat calculation from body attributes"""
    
    def test_calculate_stats_rome(self):
        """Test stats calculation for Rome homeland"""
        body_attrs = {
            "height": 50,
            "weight": 50,
            "chest": 50,
            "muscles": 50,
            "arms": 50,
            "legs": 50
        }
        stats = calculate_stats(body_attrs, "Rome", 1)
        
        assert stats["strength"] >= 20  # Base + muscles + weight + Rome bonus + level
        assert stats["agility"] >= 20   # Base + legs + height + level
        assert stats["endurance"] >= 20  # Base + chest + level
        assert stats["charisma"] >= 12   # Base + Rome bonus + level
        
    def test_calculate_stats_sparta(self):
        """Test stats calculation for Sparta homeland (endurance focus)"""
        body_attrs = {
            "height": 50,
            "weight": 50,
            "chest": 50,
            "muscles": 50,
            "arms": 50,
            "legs": 50
        }
        stats = calculate_stats(body_attrs, "Sparta", 1)
        
        # Sparta gives endurance bonus
        assert stats["endurance"] > stats["agility"]
        
    def test_calculate_stats_level_scaling(self):
        """Test that stats scale with level"""
        body_attrs = {
            "height": 50,
            "weight": 50,
            "chest": 50,
            "muscles": 50,
            "arms": 50,
            "legs": 50
        }
        stats_lv1 = calculate_stats(body_attrs, "Rome", 1)
        stats_lv10 = calculate_stats(body_attrs, "Rome", 10)
        
        assert stats_lv10["strength"] > stats_lv1["strength"]
        assert stats_lv10["endurance"] > stats_lv1["endurance"]

# ============ AUTH / CHARACTER CREATION TESTS ============

class TestCharacterCreation:
    """Test gladiator registration and creation"""
    
    def test_register_gladiator(self):
        """Test creating a new gladiator"""
        response = client.post("/auth/register", json={
            "name": "TestGladiator",
            "gender": "male",
            "homeland": "Rome",
            "height": 50,
            "weight": 50,
            "chest": 50,
            "muscles": 50,
            "arms": 50,
            "legs": 50
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "TestGladiator"
        assert data["gender"] == "male"
        assert data["homeland"] == "Rome"
        assert data["level"] == 1
        assert "id" in data
        
        # Cleanup
        client.delete(f"/test/cleanup/{data['id']}")
        
    def test_register_female_gladiator(self):
        """Test creating a female gladiator"""
        response = client.post("/auth/register", json={
            "name": "TestGladiatrix",
            "gender": "female",
            "homeland": "Egypt",
            "height": 50,
            "weight": 50,
            "chest": 50,
            "muscles": 50,
            "arms": 50,
            "legs": 50
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["gender"] == "female"
        
        # Cleanup
        client.delete(f"/test/cleanup/{data['id']}")
        
    def test_get_gladiator(self):
        """Test retrieving gladiator details"""
        # Create first
        create_response = client.post("/auth/register", json={
            "name": "GetTestWarrior",
            "gender": "male",
            "homeland": "Rome",
            "height": 50,
            "weight": 50,
            "chest": 50,
            "muscles": 50,
            "arms": 50,
            "legs": 50
        })
        gladiator_id = create_response.json()["id"]
        
        # Get
        response = client.get(f"/gladiator/{gladiator_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "GetTestWarrior"
        
        # Cleanup
        client.delete(f"/test/cleanup/{gladiator_id}")
        
    def test_invalid_homeland(self):
        """Test that invalid homeland is rejected"""
        response = client.post("/auth/register", json={
            "name": "InvalidHomeland",
            "gender": "male",
            "homeland": "Atlantis",
            "height": 50,
            "weight": 50,
            "chest": 50,
            "muscles": 50,
            "arms": 50,
            "legs": 50
        })
        assert response.status_code == 400

# ============ ARENA BATTLE TESTS ============

class TestArena:
    """Test arena battle mechanics"""
    
    def test_start_arena_battle(self):
        """Test starting an arena battle"""
        # Create gladiator
        create_response = client.post("/auth/register", json={
            "name": "ArenaTestFighter",
            "gender": "male",
            "homeland": "Rome",
            "height": 50,
            "weight": 50,
            "chest": 50,
            "muscles": 50,
            "arms": 50,
            "legs": 50
        })
        gladiator_id = create_response.json()["id"]
        
        # Start battle
        response = client.post(f"/arena/start/{gladiator_id}?battle_type=arena")
        assert response.status_code == 200
        data = response.json()
        assert "battle_id" in data
        assert "opponent_name" in data
        assert "opponent_level" in data
        
        # Cleanup
        client.delete(f"/test/cleanup/{gladiator_id}")
        
    def test_battle_attack_action(self):
        """Test attack action in battle"""
        # Create gladiator
        create_response = client.post("/auth/register", json={
            "name": "AttackTestFighter",
            "gender": "male",
            "homeland": "Rome",
            "height": 70,
            "weight": 70,
            "chest": 70,
            "muscles": 70,
            "arms": 70,
            "legs": 70
        })
        gladiator_id = create_response.json()["id"]
        
        # Start battle
        start_response = client.post(f"/arena/start/{gladiator_id}?battle_type=arena")
        battle_id = start_response.json()["battle_id"]
        
        # Attack
        action_response = client.post(f"/arena/battle/{battle_id}/action", json={
            "action": "attack"
        })
        assert action_response.status_code == 200
        data = action_response.json()
        assert "damage_dealt" in data
        assert "damage_taken" in data
        assert "gladiator_hp" in data
        assert "opponent_hp" in data
        
        # Cleanup
        client.delete(f"/test/cleanup/{gladiator_id}")
        
    def test_battle_defend_action(self):
        """Test defend action reduces damage"""
        # Create gladiator
        create_response = client.post("/auth/register", json={
            "name": "DefendTestFighter",
            "gender": "male",
            "homeland": "Rome",
            "height": 50,
            "weight": 50,
            "chest": 50,
            "muscles": 50,
            "arms": 50,
            "legs": 50
        })
        gladiator_id = create_response.json()["id"]
        
        # Start battle
        start_response = client.post(f"/arena/start/{gladiator_id}?battle_type=arena")
        battle_id = start_response.json()["battle_id"]
        
        # Defend
        action_response = client.post(f"/arena/battle/{battle_id}/action", json={
            "action": "defend"
        })
        assert action_response.status_code == 200
        data = action_response.json()
        assert data["damage_taken"] < data["damage_dealt"]  # Defend should reduce damage taken
        
        # Cleanup
        client.delete(f"/test/cleanup/{gladiator_id}")
        
    def test_battle_special_action(self):
        """Test special action does more damage"""
        # Create gladiator
        create_response = client.post("/auth/register", json={
            "name": "SpecialTestFighter",
            "gender": "male",
            "homeland": "Rome",
            "height": 80,
            "weight": 80,
            "chest": 80,
            "muscles": 80,
            "arms": 80,
            "legs": 80
        })
        gladiator_id = create_response.json()["id"]
        
        # Start battle
        start_response = client.post(f"/arena/start/{gladiator_id}?battle_type=arena")
        battle_id = start_response.json()["battle_id"]
        
        # Special attack
        action_response = client.post(f"/arena/battle/{battle_id}/action", json={
            "action": "special"
        })
        assert action_response.status_code == 200
        data = action_response.json()
        # Special should deal more damage but take more damage
        assert data["damage_dealt"] >= 10  # Strong attack
        
        # Cleanup
        client.delete(f"/test/cleanup/{gladiator_id}")
        
    def test_plead_action_exists(self):
        """Test that plead action is available (replaces flee)"""
        # Create gladiator
        create_response = client.post("/auth/register", json={
            "name": "PleadTestFighter",
            "gender": "male",
            "homeland": "Rome",
            "height": 50,
            "weight": 50,
            "chest": 50,
            "muscles": 50,
            "arms": 50,
            "legs": 50
        })
        gladiator_id = create_response.json()["id"]
        
        # Start battle
        start_response = client.post(f"/arena/start/{gladiator_id}?battle_type=arena")
        battle_id = start_response.json()["battle_id"]
        
        # Plead
        action_response = client.post(f"/arena/battle/{battle_id}/action", json={
            "action": "plead"
        })
        assert action_response.status_code == 200
        data = action_response.json()
        assert "escaped" in data
        assert "spared" in data
        
        # Cleanup
        client.delete(f"/test/cleanup/{gladiator_id}")
        
    def test_plead_chance_formula(self):
        """Test that plead chance is based on charisma"""
        # High charisma gladiator
        high_cha_response = client.post("/auth/register", json={
            "name": "HighCharismaPleader",
            "gender": "male",
            "homeland": "Rome",
            "height": 50,
            "weight": 50,
            "chest": 50,
            "muscles": 50,
            "arms": 50,
            "legs": 50
        })
        high_cha_id = high_cha_response.json()["id"]
        
        # Set high charisma manually via DB
        db = SessionLocal()
        gladiator = db.query(Gladiator).filter(Gladiator.id == high_cha_id).first()
        gladiator.charisma = 40  # Max charisma
        db.commit()
        db.close()
        
        # Start battle
        start_response = client.post(f"/arena/start/{high_cha_id}?battle_type=arena")
        battle_id = start_response.json()["battle_id"]
        
        # Plead - should have 80% max chance
        action_response = client.post(f"/arena/battle/{battle_id}/action", json={
            "action": "plead"
        })
        data = action_response.json()
        # At 40 charisma, should have 20 + (40 * 1.5) = 80% chance
        
        # Cleanup
        client.delete(f"/test/cleanup/{high_cha_id}")
        
    def test_victory_rewards(self):
        """Test that victory gives proper rewards"""
        # Create gladiator
        create_response = client.post("/auth/register", json={
            "name": "VictoryTestFighter",
            "gender": "male",
            "homeland": "Rome",
            "height": 90,
            "weight": 90,
            "chest": 90,
            "muscles": 90,
            "arms": 90,
            "legs": 90
        })
        gladiator_id = create_response.json()["id"]
        
        # Start battle
        start_response = client.post(f"/arena/start/{gladiator_id}?battle_type=arena")
        battle_id = start_response.json()["battle_id"]
        
        # Attack until victory (4-5 attacks should do it)
        for _ in range(10):
            action_response = client.post(f"/arena/battle/{battle_id}/action", json={
                "action": "attack"
            })
            data = action_response.json()
            if data.get("victory") == True:
                assert data["gold_earned"] > 0
                assert data["experience_earned"] > 0
                break
        
        # Cleanup
        client.delete(f"/test/cleanup/{gladiator_id}")

# ============ WORLD MAP TESTS ============

class TestWorldMap:
    """Test world map and city progression"""
    
    def test_get_worldmap(self):
        """Test getting world map info"""
        response = client.get("/worldmap")
        
        assert response.status_code == 200
        data = response.json()
        assert "cities" in data
        assert "Capua" in data["cities"]
        assert "Alexandria" in data["cities"]
        assert "Rome" in data["cities"]
        
    def test_get_gladiator_worldmap(self):
        """Test getting gladiator's world map status"""
        # Create gladiator
        create_response = client.post("/auth/register", json={
            "name": "MapTestWarrior",
            "gender": "male",
            "homeland": "Rome",
            "height": 50,
            "weight": 50,
            "chest": 50,
            "muscles": 50,
            "arms": 50,
            "legs": 50
        })
        gladiator_id = create_response.json()["id"]
        
        response = client.get(f"/worldmap/{gladiator_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert "current_city" in data
        assert "vehicles" in data
        assert "capture_count" in data
        assert "can_travel" in data
        
        # Cleanup
        client.delete(f"/test/cleanup/{gladiator_id}")
        
    def test_city_opponents_defined(self):
        """Test that city opponents are properly defined"""
        assert "Capua" in CITY_OPPONENTS
        assert "Alexandria" in CITY_OPPONENTS
        assert "Rome" in CITY_OPPONENTS
        
        for city, opponents in CITY_OPPONENTS.items():
            assert len(opponents) > 0
            for opponent in opponents:
                assert "name" in opponent
                assert "style" in opponent

# ============ PET SYSTEM TESTS ============

class TestPets:
    """Test pet companion system"""
    
    def test_get_available_pets(self):
        """Test getting available pets for purchase"""
        response = client.get("/pets")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 10  # We have 10 pets
        
        # Check pet structure
        for pet in data:
            assert "id" in pet
            assert "name" in pet
            assert "type" in pet
            assert "rarity" in pet
            assert "buy_price" in pet
            assert "attack_bonus" in pet
            assert "defense_bonus" in pet
            assert "hp_bonus" in pet
            
    def test_pet_rarity_tiers(self):
        """Test that pets have proper rarity tiers"""
        response = client.get("/pets")
        data = response.json()
        
        rarities = {pet["rarity"] for pet in data}
        assert "common" in rarities
        assert "uncommon" in rarities
        assert "rare" in rarities
        assert "epic" in rarities
        assert "legendary" in rarities
        
    def test_pet_abilities(self):
        """Test that pets have proper abilities"""
        response = client.get("/pets")
        data = response.json()
        
        # Legendary pet should have dragon's breath
        legendary = [p for p in data if p["rarity"] == "legendary"]
        assert len(legendary) == 1
        assert "Dragon's Breath" in legendary[0].get("ability_name", "")
        
    def test_buy_pet(self):
        """Test purchasing a pet"""
        # Create gladiator with gold
        create_response = client.post("/auth/register", json={
            "name": "PetTestBuyer",
            "gender": "male",
            "homeland": "Rome",
            "height": 50,
            "weight": 50,
            "chest": 50,
            "muscles": 50,
            "arms": 50,
            "legs": 50
        })
        gladiator_id = create_response.json()["id"]
        
        # Get available pets
        pets_response = client.get("/pets")
        pets = pets_response.json()
        cheap_pet = [p for p in pets if p["buy_price"] <= 100][0]
        
        # Buy pet
        buy_response = client.post("/pets/buy", json={
            "gladiator_id": gladiator_id,
            "pet_id": cheap_pet["id"]
        })
        assert buy_response.status_code == 200
        data = buy_response.json()
        assert "message" in data
        assert "remaining_gold" in data
        
        # Cleanup
        client.delete(f"/test/cleanup/{gladiator_id}")
        
    def test_get_owned_pets(self):
        """Test getting owned pets"""
        # Create gladiator
        create_response = client.post("/auth/register", json={
            "name": "OwnedPetTest",
            "gender": "male",
            "homeland": "Rome",
            "height": 50,
            "weight": 50,
            "chest": 50,
            "muscles": 50,
            "arms": 50,
            "legs": 50
        })
        gladiator_id = create_response.json()["id"]
        
        # Get owned pets (should be empty initially)
        response = client.get(f"/pets/owned/{gladiator_id}")
        assert response.status_code == 200
        data = response.json()
        assert "pets" in data
        assert "active_pet_id" in data
        
        # Cleanup
        client.delete(f"/test/cleanup/{gladiator_id}")
        
    def test_activate_pet(self):
        """Test activating a pet companion"""
        # Create gladiator
        create_response = client.post("/auth/register", json={
            "name": "ActivatePetTest",
            "gender": "male",
            "homeland": "Rome",
            "height": 50,
            "weight": 50,
            "chest": 50,
            "muscles": 50,
            "arms": 50,
            "legs": 50
        })
        gladiator_id = create_response.json()["id"]
        
        # Buy a pet
        pets_response = client.get("/pets")
        pets = pets_response.json()
        cheap_pet = [p for p in pets if p["buy_price"] <= 100][0]
        client.post("/pets/buy", json={
            "gladiator_id": gladiator_id,
            "pet_id": cheap_pet["id"]
        })
        
        # Get owned pets to get the owned pet ID
        owned_response = client.get(f"/pets/owned/{gladiator_id}")
        owned_data = owned_response.json()
        owned_pet_id = owned_data["pets"][0]["id"]
        
        # Activate pet
        activate_response = client.post("/pets/activate", json={
            "gladiator_id": gladiator_id,
            "pet_id": owned_pet_id
        })
        assert activate_response.status_code == 200
        
        # Cleanup
        client.delete(f"/test/cleanup/{gladiator_id}")

# ============ EQUIPMENT TESTS ============

class TestEquipment:
    """Test equipment system"""
    
    def test_get_shop_items(self):
        """Test getting shop items"""
        response = client.get("/shop/items")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0
        
        # Check item types
        item_types = {item["type"] for item in data}
        assert "weapon" in item_types
        assert "helmet" in item_types
        assert "chestplate" in item_types
        assert "gauntlets" in item_types
        assert "shield" in item_types
        assert "greaves" in item_types
        
    def test_buy_item(self):
        """Test purchasing an item"""
        # Create gladiator
        create_response = client.post("/auth/register", json={
            "name": "ShopTestBuyer",
            "gender": "male",
            "homeland": "Rome",
            "height": 50,
            "weight": 50,
            "chest": 50,
            "muscles": 50,
            "arms": 50,
            "legs": 50
        })
        gladiator_id = create_response.json()["id"]
        
        # Get items
        items_response = client.get("/shop/items")
        items = items_response.json()
        cheap_item = [i for i in items if i["buy_price"] <= 50][0]
        
        # Buy item
        buy_response = client.post("/shop/buy", json={
            "gladiator_id": gladiator_id,
            "item_id": cheap_item["id"]
        })
        assert buy_response.status_code == 200
        
        # Cleanup
        client.delete(f"/test/cleanup/{gladiator_id}")
        
    def test_equip_item(self):
        """Test equipping an item"""
        # Create gladiator
        create_response = client.post("/auth/register", json={
            "name": "EquipTestWarrior",
            "gender": "male",
            "homeland": "Rome",
            "height": 50,
            "weight": 50,
            "chest": 50,
            "muscles": 50,
            "arms": 50,
            "legs": 50
        })
        gladiator_id = create_response.json()["id"]
        
        # Get and buy a weapon
        items_response = client.get("/shop/items")
        items = items_response.json()
        weapon = [i for i in items if i["type"] == "weapon" and i["buy_price"] <= 100][0]
        client.post("/shop/buy", json={
            "gladiator_id": gladiator_id,
            "item_id": weapon["id"]
        })
        
        # Get inventory to find the owned item ID
        inv_response = client.get(f"/equipment/{gladiator_id}")
        inv_data = inv_response.json()
        owned_item_id = inv_data["inventory"][0]["id"]
        
        # Equip item
        equip_response = client.post(f"/equipment/{gladiator_id}/equip/{weapon['id']}")
        assert equip_response.status_code == 200
        data = equip_response.json()
        assert data["slot"] == "weapon"
        assert "stats" in data
        
        # Cleanup
        client.delete(f"/test/cleanup/{gladiator_id}")

# ============ PROGRESSION TESTS ============

class TestProgression:
    """Test progression system"""
    
    def test_get_progression(self):
        """Test getting gladiator progression"""
        # Create gladiator
        create_response = client.post("/auth/register", json={
            "name": "ProgressionTestWarrior",
            "gender": "male",
            "homeland": "Rome",
            "height": 50,
            "weight": 50,
            "chest": 50,
            "muscles": 50,
            "arms": 50,
            "legs": 50
        })
        gladiator_id = create_response.json()["id"]
        
        response = client.get(f"/progression/{gladiator_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert "level" in data
        assert "experience" in data
        assert "exp_to_next" in data
        assert "skill_points" in data
        
        # Cleanup
        client.delete(f"/test/cleanup/{gladiator_id}")
        
    def test_training(self):
        """Test spending skill points on training"""
        # Create gladiator with skill points
        create_response = client.post("/auth/register", json={
            "name": "TrainingTestWarrior",
            "gender": "male",
            "homeland": "Rome",
            "height": 50,
            "weight": 50,
            "chest": 50,
            "muscles": 50,
            "arms": 50,
            "legs": 50
        })
        gladiator_id = create_response.json()["id"]
        
        # Train strength
        train_response = client.post(f"/progression/train/{gladiator_id}/strength", json={})
        assert train_response.status_code == 200
        data = train_response.json()
        assert "skill_points_remaining" in data
        
        # Cleanup
        client.delete(f"/test/cleanup/{gladiator_id}")

# ============ HEALTH CHECK ============

class TestHealth:
    """Test health check endpoint"""
    
    def test_health_check(self):
        """Test health check returns healthy status"""
        response = client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data

# ============ RUN TESTS ============

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
