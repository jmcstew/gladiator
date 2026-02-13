#!/usr/bin/env python3
"""
Simple Test Runner for ALL ROADS LEAD TO ROME
Run with: python3 run_tests.py
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import uuid
from datetime import datetime

# Import app and models
from main import app, get_db
from models import Base, Gladiator, Item, InventoryItem, Battle, Pet, GladiatorPet
from main import calculate_stats, CITIES, CITY_OPPONENTS

# Setup test database
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

# Test counters
tests_run = 0
tests_passed = 0
tests_failed = 0

def test(name, condition, error_msg=""):
    global tests_run, tests_passed, tests_failed
    tests_run += 1
    if condition:
        tests_passed += 1
        print(f"  ✅ {name}")
        return True
    else:
        tests_failed += 1
        print(f"  ❌ {name}")
        if error_msg:
            print(f"     Error: {error_msg}")
        return False

def cleanup(gladiator_id):
    """Clean up test data"""
    db = SessionLocal()
    try:
        db.query(GladiatorPet).filter(GladiatorPet.gladiator_id == gladiator_id).delete()
        db.query(Battle).filter(Battle.gladiator_id == gladiator_id).delete()
        db.query(InventoryItem).filter(InventoryItem.gladiator_id == gladiator_id).delete()
        db.query(Gladiator).filter(Gladiator.id == gladiator_id).delete()
        db.commit()
    except:
        db.rollback()
    finally:
        db.close()

# ============ TEST SUITE ============

print("\n" + "="*60)
print("🧪 ALL ROADS LEAD TO ROME - TEST SUITE")
print("="*60 + "\n")

# Clean start
try:
    os.remove("test_gladiator.db")
except:
    pass

# Test Stats
print("📊 TESTING STAT CALCULATIONS...")
test("Rome homeland gives charisma bonus", 
     calculate_stats({"height":50,"weight":50,"chest":50,"muscles":50,"arms":50,"legs":50}, "Rome", 1)["charisma"] >= 12)
test("Sparta homeland gives endurance bonus", 
     calculate_stats({"height":50,"weight":50,"chest":50,"muscles":50,"arms":50,"legs":50}, "Sparta", 1)["endurance"] >= 15)
test("Level scaling increases stats",
     calculate_stats({"height":50,"weight":50,"chest":50,"muscles":50,"arms":50,"legs":50}, "Rome", 10)["strength"] > 
     calculate_stats({"height":50,"weight":50,"chest":50,"muscles":50,"arms":50,"legs":50}, "Rome", 1)["strength"])

# Test Cities
print("\n🏛️ TESTING CITY CONFIGURATION...")
test("Capua city exists", "Capua" in CITIES)
test("Alexandria city exists", "Alexandria" in CITIES)
test("Rome city exists", "Rome" in CITIES)
test("Capua has opponents", len(CITIES["Capua"]["opponent_levels"]) > 0)
test("Rome has boss", CITIES["Rome"]["boss"] is not None)

# Test City Opponents
print("\n⚔️ TESTING CITY OPPONENTS...")
test("Capua opponents defined", len(CITY_OPPONENTS["Capua"]) > 0)
test("Alexandria opponents defined", len(CITY_OPPONENTS["Alexandria"]) > 0)
test("Rome opponents defined", len(CITY_OPPONENTS["Rome"]) > 0)
test("Opponents have names", all("name" in o for o in CITY_OPPONENTS["Capua"]))
test("Opponents have styles", all("style" in o for o in CITY_OPPONENTS["Capua"]))

# Test Health
print("\n❤️ TESTING HEALTH CHECK...")
response = client.get("/health")
test("Health endpoint returns 200", response.status_code == 200)
test("Health status is healthy", response.json()["status"] == "healthy")

# Test Character Creation
print("\n👤 TESTING CHARACTER CREATION...")
response = client.post("/auth/register", json={
    "name": "TestGladiator",
    "gender": "male",
    "homeland": "Rome",
    "height": 50, "weight": 50, "chest": 50, "muscles": 50, "arms": 50, "legs": 50
})
test("Registration returns 200", response.status_code == 200)
if response.status_code == 200:
    data = response.json()
    test_id = data.get("id")
    test("Gladiator has ID", test_id is not None)
    test("Gladiator name is correct", data.get("name") == "TestGladiator")
    test("Gladiator level is 1", data.get("level") == 1)
    test("Gladiator starts in Capua", data.get("current_city") == "Capua")
    cleanup(test_id)

# Test Female Character
response = client.post("/auth/register", json={
    "name": "TestGladiatrix",
    "gender": "female",
    "homeland": "Egypt",
    "height": 50, "weight": 50, "chest": 50, "muscles": 50, "arms": 50, "legs": 50
})
test("Female gladiator creation works", response.status_code == 200)
if response.status_code == 200:
    cleanup(response.json()["id"])

# Test Invalid Homeland
response = client.post("/auth/register", json={
    "name": "Invalid",
    "gender": "male",
    "homeland": "Atlantis",
    "height": 50, "weight": 50, "chest": 50, "muscles": 50, "arms": 50, "legs": 50
})
test("Invalid homeland rejected", response.status_code == 400)

# Test Arena
print("\n⚔️ TESTING ARENA...")
response = client.post("/auth/register", json={
    "name": "ArenaFighter",
    "gender": "male",
    "homeland": "Rome",
    "height": 70, "weight": 70, "chest": 70, "muscles": 70, "arms": 70, "legs": 70
})
if response.status_code == 200:
    fighter_id = response.json()["id"]
    
    # Start battle
    response = client.post(f"/arena/start/{fighter_id}?battle_type=arena")
    test("Battle starts", response.status_code == 200)
    battle_id = response.json().get("battle_id") if response.status_code == 200 else None
    test("Battle has ID", battle_id is not None)
    
    if battle_id:
        # Test attack
        response = client.post(f"/arena/battle/{battle_id}/action", json={"action": "attack"})
        test("Attack action works", response.status_code == 200)
        data = response.json()
        test("Attack returns damage_dealt", "damage_dealt" in data)
        test("Attack returns damage_taken", "damage_taken" in data)
        
        # Test defend
        response = client.post(f"/arena/battle/{battle_id}/action", json={"action": "defend"})
        test("Defend action works", response.status_code == 200)
        
        # Test special
        response = client.post(f"/arena/battle/{battle_id}/action", json={"action": "special"})
        test("Special action works", response.status_code == 200)
        
        # Test plead
        response = client.post(f"/arena/battle/{battle_id}/action", json={"action": "plead"})
        test("Plead action works", response.status_code == 200)
        data = response.json()
        test("Plead returns escaped", "escaped" in data)
        test("Plead returns spared", "spared" in data)
    
    cleanup(fighter_id)

# Test World Map
print("\n🗺️ TESTING WORLD MAP...")
response = client.get("/worldmap")
test("World map endpoint works", response.status_code == 200)
data = response.json()
test("World map has cities", "cities" in data)
test("World map has Capua", "Capua" in data["cities"])

# Test Shop
print("\n🛒 TESTING SHOP...")
response = client.get("/shop/items")
test("Shop items endpoint works", response.status_code == 200)
data = response.json()
test("Shop has items", len(data) > 0)
item_types = {item["type"] for item in data}
test("Shop has weapons", "weapon" in item_types)
test("Shop has armor", "helmet" in item_types or "chestplate" in item_types)
test("Shop has rarity tiers", len({item["rarity"] for item in data}) > 1)

# Test Equipment
print("\n🛡️ TESTING EQUIPMENT...")
response = client.post("/auth/register", json={
    "name": "EquipmentTester",
    "gender": "male",
    "homeland": "Rome",
    "height": 50, "weight": 50, "chest": 50, "muscles": 50, "arms": 50, "legs": 50
})
if response.status_code == 200:
    eq_id = response.json()["id"]
    
    response = client.get(f"/equipment/{eq_id}")
    test("Equipment endpoint works", response.status_code == 200)
    
    cleanup(eq_id)

# Test Progression
print("\n📈 TESTING PROGRESSION...")
response = client.post("/auth/register", json={
    "name": "ProgressionTester",
    "gender": "male",
    "homeland": "Rome",
    "height": 50, "weight": 50, "chest": 50, "muscles": 50, "arms": 50, "legs": 50
})
if response.status_code == 200:
    prog_id = response.json()["id"]
    
    response = client.get(f"/progression/{prog_id}")
    test("Progression endpoint works", response.status_code == 200)
    data = response.json()
    test("Progression has level", "level" in data)
    test("Progression has experience", "experience" in data)
    test("Progression has skill_points", "skill_points" in data)
    
    cleanup(prog_id)

# Test Pets
print("\n🐾 TESTING PETS...")
response = client.get("/pets")
test("Pets endpoint works", response.status_code == 200)
data = response.json()
test("Pets has 10 pets", len(data) == 10)
rarities = {pet["rarity"] for pet in data}
test("Pets have all rarities", 
     "common" in rarities and "uncommon" in rarities and "rare" in rarities and
     "epic" in rarities and "legendary" in rarities)

# Summary
print("\n" + "="*60)
print("📊 TEST SUMMARY")
print("="*60)
print(f"Tests Run:    {tests_run}")
print(f"Tests Passed: {tests_passed}")
print(f"Tests Failed: {tests_failed}")
print(f"Pass Rate:   {int(tests_passed/tests_run*100)}%")
print("="*60)

if tests_failed == 0:
    print("\n🎉 ALL TESTS PASSED! 🎉\n")
    sys.exit(0)
else:
    print(f"\n⚠️  {tests_failed} TEST(S) FAILED\n")
    sys.exit(1)
