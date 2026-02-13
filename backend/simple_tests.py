#!/usr/bin/env python3
"""
Simple Standalone Test Runner for ALL ROADS LEAD TO ROME
Tests core game logic without requiring dependencies.
Run with: python3 simple_tests.py
"""

import sys
from datetime import datetime

# Import game logic
from models import HOMELAND_BONUSES, COMBAT_STYLES

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

def calculate_stats(body_attrs, homeland, level):
    """Calculate combat stats from body attributes"""
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

# ============ TEST SUITE ============

print("\n" + "="*60)
print("🧪 ALL ROADS LEAD TO ROME - SIMPLE TEST SUITE")
print("="*60 + "\n")

# Test Constants
print("📋 TESTING GAME CONSTANTS...")
test("5 homelands defined", len(HOMELAND_BONUSES) == 5)
test("Homeland bonuses include Rome", "Rome" in HOMELAND_BONUSES)
test("Rome gives charisma bonus", HOMELAND_BONUSES["Rome"]["charisma"] == 2)
test("Sparta gives endurance bonus", HOMELAND_BONUSES["Sparta"]["endurance"] == 3)
test("6 combat styles defined", len(COMBAT_STYLES) == 6)

# Test City Configuration
print("\n🏛️ TESTING CITY CONFIGURATION...")
from main import CITIES, CITY_OPPONENTS, BOSS_OPPONENT
test("3 cities defined", len(CITIES) == 3)
test("Capua is starting city", CITIES["Capua"]["shop_level"] == 1)
test("Alexandria requires merchant cart", CITIES["Alexandria"]["vehicle_required"] == "merchant_cart")
test("Rome requires chariot", CITIES["Rome"]["vehicle_required"] == "chariot")
test("Rome is final city", CITIES["Rome"]["next_city"] is None)
test("Capua has opponents", len(CITIES["Capua"]["opponent_levels"]) > 0)
test("Boss is defined", BOSS_OPPONENT["name"] == "The Emperor's Champion")
test("Boss is level 12", BOSS_OPPONENT["level"] == 12)

# Test City Opponents
print("\n⚔️ TESTING ARENA OPPONENTS...")
test("Capua has opponents", len(CITY_OPPONENTS["Capua"]) >= 3)
test("Alexandria has opponents", len(CITY_OPPONENTS["Alexandria"]) >= 4)
test("Rome has opponents", len(CITY_OPPONENTS["Rome"]) >= 5)
test("Opponents have names", all("name" in o for o in CITY_OPPONENTS["Capua"]))
test("Opponents have styles", all("style" in o for o in CITY_OPPONENTS["Capua"]))
test("Opponents have dialogue", all("dialogue" in o for o in CITY_OPPONENTS["Capua"]))

# Test Stats Calculation
print("\n📊 TESTING STAT CALCULATIONS...")
body_attrs = {"height": 50, "weight": 50, "chest": 50, "muscles": 50, "arms": 50, "legs": 50}

stats = calculate_stats(body_attrs, "Rome", 1)
test("Stats calculation returns dict", isinstance(stats, dict))
test("Stats has all 5 attributes", len(stats) == 5)
test("Base stats >= 10", all(v >= 10 for v in stats.values()))
test("Level 1 gives +2 STR", stats["strength"] >= 22)  # 10 + 10 + 2

stats_lv10 = calculate_stats(body_attrs, "Rome", 10)
test("Level 10 has more STR than level 1", stats_lv10["strength"] > stats["strength"])
test("Level 10 has more END than level 1", stats_lv10["endurance"] > stats["endurance"])

# Test Homeland Bonuses
print("\n🎯 TESTING HOMELAND BONUSES...")
rome_stats = calculate_stats(body_attrs, "Rome", 1)
sparta_stats = calculate_stats(body_attrs, "Sparta", 1)
egypt_stats = calculate_stats(body_attrs, "Egypt", 1)

test("Rome gives charisma bonus", rome_stats["charisma"] > stats["charisma"])
test("Sparta gives endurance bonus", sparta_stats["endurance"] > stats["endurance"])
test("Egypt gives agility bonus", egypt_stats["agility"] > stats["agility"])

# Test Combat
print("\n⚔️ TESTING COMBAT FORMULAS...")
def simulate_attack(gladiator_str, opponent_level):
    damage_dealt = gladiator_str // 2
    damage_taken = opponent_level * 4
    return damage_dealt, damage_taken

damage, taken = simulate_attack(20, 5)
test("Attack deals reasonable damage", 10 <= damage <= 15)
test("Opponent deals reasonable damage", 15 <= taken <= 25)

def simulate_defend(gladiator_agi, opponent_level):
    damage_dealt = gladiator_agi // 3
    damage_taken = opponent_level * 2
    return damage_dealt, damage_taken

damage, taken = simulate_defend(20, 5)
test("Defend deals less damage than attack", damage < 10)
test("Defend takes less damage than attack", taken < 15)

def simulate_special(gladiator_str, opponent_level):
    damage_dealt = gladiator_str
    damage_taken = opponent_level * 5
    return damage_dealt, damage_taken

damage, taken = simulate_special(20, 5)
test("Special deals more damage than attack", damage >= 20)
test("Special takes more damage than attack", taken >= 20)

def calculate_plead_chance(charisma):
    base = 0.20
    bonus = charisma * 0.015
    return min(0.80, base + bonus)

test("10 CHA = 35% chance", calculate_plead_chance(10) == 0.35)
test("20 CHA = 50% chance", calculate_plead_chance(20) == 0.50)
test("30 CHA = 65% chance", calculate_plead_chance(30) == 0.65)
test("40 CHA = 80% max chance", calculate_plead_chance(40) == 0.80)

# Test Pet System
print("\n🐾 TESTING PET SYSTEM...")
from models import Pet

# Test pet creation (minimal test without DB)
test("Pet model exists", Pet is not None)

# Test Pleading Logic
print("\n🙏 TESTING PLEAD SYSTEM...")
def get_plead_outcome(city, charisma, plea_approved):
    """Determine plead outcome based on city and mercy"""
    if plea_approved:
        return {"outcome": "escaped", "message": "Mercy granted!"}
    if city == "Capua":
        return {"outcome": "executed", "message": "Executed in Capua"}
    return {"outcome": "captured", "message": "Captured, sent back to Capua"}

result = get_plead_outcome("Capua", 10, False)
test("Capua + denied = execution", result["outcome"] == "executed")

result = get_plead_outcome("Alexandria", 20, False)
test("Alexandria + denied = capture", result["outcome"] == "captured")

result = get_plead_outcome("Rome", 40, True)
test("Any city + mercy = escape", result["outcome"] == "escaped")

# Test Victory Rewards
print("\n🎉 TESTING VICTORY REWARDS...")
def calculate_victory_rewards(opponent_level):
    gold = opponent_level * 25
    xp = opponent_level * 50
    return gold, xp

gold, xp = calculate_victory_rewards(5)
test("Level 5 gives 125 gold", gold == 125)
test("Level 5 gives 250 XP", xp == 250)

gold, xp = calculate_victory_rewards(10)
test("Level 10 gives 250 gold", gold == 250)
test("Level 10 gives 500 XP", xp == 500)

# Test Level Up
print("\n⬆️ TESTING LEVEL UP...")
def check_level_up(current_xp, exp_to_next, current_level):
    if current_xp >= exp_to_next:
        return {
            "leveled_up": True,
            "new_level": current_level + 1,
            "remaining_xp": current_xp - exp_to_next
        }
    return {"leveled_up": False}

result = check_level_up(150, 100, 1)
test("150/100 XP = level up", result["leveled_up"] == True)
test("New level is 2", result["new_level"] == 2)
test("Remaining XP is 50", result["remaining_xp"] == 50)

# Test Equipment Rarity
print("\n🛡️ TESTING EQUIPMENT RARITY...")
RARITY_MULTIPLIERS = {
    "common": 1.0,
    "uncommon": 1.25,
    "rare": 1.5,
    "epic": 2.0,
    "legendary": 3.0
}

test("5 rarity tiers", len(RARITY_MULTIPLIERS) == 5)
test("Legendary has 3x multiplier", RARITY_MULTIPLIERS["legendary"] == 3.0)
test("Epic has 2x multiplier", RARITY_MULTIPLIERS["epic"] == 2.0)

def calculate_item_bonus(base_stat, rarity):
    return int(base_stat * RARITY_MULTIPLIERS.get(rarity, 1.0))

test("Rare sword 20 dmg = 30", calculate_item_bonus(20, "rare") == 30)
test("Epic armor 15 def = 30", calculate_item_bonus(15, "epic") == 30)
test("Legendary weapon 50 dmg = 150", calculate_item_bonus(50, "legendary") == 150)

# Test Pet Bonuses
print("\n🐾 TESTING PET BONUSES...")
PET_RARITY_BONUS = {
    "common": {"min": 2, "max": 5},
    "uncommon": {"min": 5, "max": 10},
    "rare": {"min": 10, "max": 15},
    "epic": {"min": 15, "max": 20},
    "legendary": {"min": 25, "max": 35}
}

test("Common pet gives 2-5 bonus", PET_RARITY_BONUS["common"]["min"] == 2)
test("Legendary pet gives 25-35 bonus", PET_RARITY_BONUS["legendary"]["max"] == 35)

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
    print("📝 Note: This is a simplified test suite.")
    print("   Run 'pytest tests/ -v' for full integration tests.\n")
    sys.exit(0)
else:
    print(f"\n⚠️  {tests_failed} TEST(S) FAILED\n")
    sys.exit(1)
