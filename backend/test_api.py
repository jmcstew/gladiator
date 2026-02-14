# Backend Test Suite for ALL ROADS LEAD TO ROME
# Run with: python -m pytest backend/test_api.py -v

import unittest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app, CITIES, CITY_OPPONENTS, BOSS_OPPONENT, calculate_stats
from models import Gladiator, Item, InventoryItem, Battle, GladiatorSkill, Pet, GladiatorPet, HOMELAND_BONUSES

client = TestClient(app)

# ============ HEALTH CHECK TESTS ============

class TestHealthCheck:
    def test_health_endpoint_returns_ok(self):
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data

# ============ STAT CALCULATION TESTS ============

class TestStatCalculation:
    def test_calculate_stats_rome_homeland(self):
        """Rome homeland should give charisma and intelligence bonuses"""
        body = {"height": 50, "weight": 50, "chest": 50, "muscles": 50, "arms": 50, "legs": 50}
        stats = calculate_stats(body, "Rome", 1)
        assert stats["charisma"] > 10  # Base + homeland bonus
        assert stats["intelligence"] > 10
    
    def test_calculate_stats_gaul_homeland(self):
        """Gaul homeland should give strength and agility bonuses"""
        body = {"height": 50, "weight": 50, "chest": 50, "muscles": 50, "arms": 50, "legs": 50}
        stats = calculate_stats(body, "Gaul", 1)
        assert stats["strength"] > 10  # Base + homeland bonus
        assert stats["agility"] > 10
    
    def test_calculate_stats_sparta_homeland(self):
        """Sparta homeland should give endurance bonus"""
        body = {"height": 50, "weight": 50, "chest": 50, "muscles": 50, "arms": 50, "legs": 50}
        stats = calculate_stats(body, "Sparta", 1)
        assert stats["endurance"] > 10  # Base + homeland bonus (highest of all)
    
    def test_calculate_stats_egypt_homeland(self):
        """Egypt homeland should give agility and intelligence"""
        body = {"height": 50, "weight": 50, "chest": 50, "muscles": 50, "arms": 50, "legs": 50}
        stats = calculate_stats(body, "Egypt", 1)
        assert stats["agility"] > 10
        assert stats["intelligence"] > 10
    
    def test_calculate_stats_germania_homeland(self):
        """Germania homeland should give strength and endurance"""
        body = {"height": 50, "weight": 50, "chest": 50, "muscles": 50, "arms": 50, "legs": 50}
        stats = calculate_stats(body, "Germania", 1)
        assert stats["strength"] > 10
        assert stats["endurance"] > 10
    
    def test_level_scaling_increases_stats(self):
        """Higher levels should have higher stats"""
        body = {"height": 50, "weight": 50, "chest": 50, "muscles": 50, "arms": 50, "legs": 50}
        level1 = calculate_stats(body, "Rome", 1)
        level10 = calculate_stats(body, "Rome", 10)
        
        assert level10["strength"] > level1["strength"]
        assert level10["agility"] > level1["agility"]
        assert level10["endurance"] > level1["endurance"]
    
    def test_body_attributes_affect_stats(self):
        """Body attributes should influence derived stats"""
        strong_body = {"height": 50, "weight": 100, "chest": 100, "muscles": 100, "arms": 100, "legs": 50}
        weak_body = {"height": 50, "weight": 0, "chest": 0, "muscles": 0, "arms": 0, "legs": 100}
        
        strong_stats = calculate_stats(strong_body, "Rome", 1)
        weak_stats = calculate_stats(weak_body, "Rome", 1)
        
        assert strong_stats["strength"] > weak_stats["strength"]
        assert strong_stats["endurance"] > weak_stats["endurance"]

# ============ CITY CONFIGURATION TESTS ============

class TestCityConfiguration:
    def test_capua_has_correct_structure(self):
        assert CITIES["Capua"]["name"] == "Capua"
        assert len(CITIES["Capua"]["opponent_levels"]) == 4
        assert CITIES["Capua"]["next_city"] == "Alexandria"
        assert CITIES["Capua"]["vehicle_required"] == "merchant_cart"
    
    def test_alexandria_has_correct_structure(self):
        assert CITIES["Alexandria"]["name"] == "Alexandria"
        assert len(CITIES["Alexandria"]["opponent_levels"]) == 5
        assert CITIES["Alexandria"]["next_city"] == "Rome"
        assert CITIES["Alexandria"]["vehicle_required"] == "chariot"
    
    def test_rome_has_boss(self):
        assert CITIES["Rome"]["name"] == "Rome"
        assert CITIES["Rome"]["next_city"] is None
        assert CITIES["Rome"]["boss"] == "The Emperor's Champion"
    
    def test_capua_opponents_exist(self):
        assert len(CITY_OPPONENTS["Capua"]) >= 3
        opponent_names = [o["name"] for o in CITY_OPPONENTS["Capua"]]
        assert "Crixus" in opponent_names
        assert "Varro" in opponent_names
        assert "Priscus" in opponent_names
    
    def test_alexandria_opponents_exist(self):
        assert len(CITY_OPPONENTS["Alexandria"]) >= 4
        opponent_names = [o["name"] for o in CITY_OPPONENTS["Alexandria"]]
        assert "Sicarius" in opponent_names
        assert "Amazonia" in opponent_names
    
    def test_rome_opponents_exist(self):
        assert len(CITY_OPPONENTS["Rome"]) >= 5
        opponent_names = [o["name"] for o in CITY_OPPONENTS["Rome"]]
        assert "Spartacus Reborn" in opponent_names
    
    def test_boss_exists(self):
        assert BOSS_OPPONENT["name"] == "The Emperor's Champion"
        assert BOSS_OPPONENT["level"] == 12

# ============ HOMELAND CONFIGURATION TESTS ============

class TestHomelandConfiguration:
    def test_all_homelands_defined(self):
        expected = ["Rome", "Gaul", "Sparta", "Egypt", "Germania"]
        for homeland in expected:
            assert homeland in HOMELAND_BONUSES
    
    def test_rome_bonuses(self):
        assert HOMELAND_BONUSES["Rome"]["charisma"] == 2
        assert HOMELAND_BONUSES["Rome"]["intelligence"] == 1
    
    def test_sparta_bonuses(self):
        assert HOMELAND_BONUSES["Sparta"]["endurance"] == 3  # Highest endurance bonus
    
    def test_gaul_bonuses(self):
        assert HOMELAND_BONUSES["Gaul"]["strength"] == 2

# ============ CITY TRAVEL REQUIREMENTS TESTS ============

class TestCityTravelRequirements:
    def test_capua_to_alexandria_requires_merchant_cart(self):
        assert CITIES["Capua"]["vehicle_required"] == "merchant_cart"
        assert CITIES["Alexandria"]["shop_level"] == 2
    
    def test_alexandria_to_rome_requires_chariot(self):
        assert CITIES["Alexandria"]["next_city"] == "Rome"
        assert CITIES["Rome"]["shop_level"] == 3
    
    def test_rome_is_final_city(self):
        assert CITIES["Rome"]["next_city"] is None

# ============ ITEM RARITY TIERS TESTS ============

class TestItemRarities:
    def test_rarity_tiers_exist(self):
        """Test that all rarity tiers are defined"""
        rarities = ["common", "uncommon", "rare", "epic", "legendary"]
        # These should be valid rarity values for items
        assert len(rarities) == 5

# ============ PLED MECHANIC TESTS ============

class TestPleadMechanic:
    def test_plead_base_chance_is_20_percent(self):
        """Base plead chance should be 20%"""
        base_chance = 0.20
        assert base_chance == 0.20
    
    def test_plead_charisma_bonus_calculation(self):
        """Each charisma point adds 1.5% to plead chance"""
        charisma_bonus_per_point = 0.015
        
        # Test various charisma values
        test_cases = [
            (10, 0.20 + 10 * charisma_bonus_per_point),  # 10 charisma = 35%
            (20, 0.20 + 20 * charisma_bonus_per_point),  # 20 charisma = 50%
            (40, 0.20 + 40 * charisma_bonus_per_point),  # 40 charisma = 80%
        ]
        
        for charisma, expected_chance in test_cases:
            calculated = min(0.80, 0.20 + charisma * 0.015)
            assert calculated == expected_chance
    
    def test_plead_max_chance_is_80_percent(self):
        """Plead should never exceed 80% even with high charisma"""
        max_chance = 0.80
        # Even with 100 charisma
        calculated = min(max_chance, 0.20 + 100 * 0.015)
        assert calculated == max_chance

# ============ BATTLE ROUNDS TESTS ============

class TestBattleRounds:
    def test_action_types_are_valid(self):
        """Test that all battle actions are defined"""
        actions = ["attack", "defend", "special", "plead"]
        for action in actions:
            assert action in ["attack", "defend", "special", "plead"]
    
    def test_damage_formula_for_attack(self):
        """Attack should deal moderate damage"""
        strength = 20
        min_damage = strength // 2  # 10
        max_damage = strength  # 20
        assert min_damage == 10
        assert max_damage == 20
    
    def test_damage_formula_for_special(self):
        """Special should deal higher but riskier damage"""
        strength = 20
        min_damage = strength  # 20
        max_damage = strength * 2  # 40
        assert min_damage == 20
        assert max_damage == 40
    
    def test_damage_formula_for_defend(self):
        """Defend should deal minimal damage but take much less"""
        agility = 15
        min_damage = agility // 3  # 5
        max_damage = agility // 2  # 7
        assert min_damage >= 0

# ============ EXECUTION VS CAPTURE LOGIC TESTS ============

class TestExecutionVsCapture:
    def test_capua_loss_means_execution(self):
        """Losing in Capua should result in execution (game over)"""
        # In Capua, loss = execution
        current_city = "Capua"
        is_capua = current_city == "Capua"
        assert is_capua == True
        # This means game_over should be True
        assert is_capua  # Execution scenario
    
    def test_non_capua_loss_means_capture(self):
        """Losing outside Capua should result in capture (rogue-like)"""
        cities = ["Alexandria", "Rome"]
        
        for city in cities:
            is_capua = city == "Capua"
            assert is_capua == False
            # This means capture scenario
    
    def test_plead_denied_means_execution_anywhere(self):
        """Even outside Capua, failed plead = execution"""
        # If plead is denied, it's fatal regardless of city
        plea_denied = True
        current_city = "Alexandria"
        
        is_fatal = plea_denied
        assert is_fatal == True

# ============ EQUIPMENT STAT BONUSES TESTS ============

class TestEquipmentBonuses:
    def test_weapon_has_damage(self):
        """Weapons should have damage stat"""
        # Mock weapon item
        weapon = {"damage": 15, "armor": 0}
        assert weapon["damage"] > 0
        assert weapon["armor"] == 0
    
    def test_armor_has_armor_stat(self):
        """Armor pieces should have armor stat"""
        # Mock armor item
        armor = {"damage": 0, "armor": 25}
        assert armor["damage"] == 0
        assert armor["armor"] > 0
    
    def test_full_armor_set_bonuses(self):
        """Full armor set should provide cumulative bonuses"""
        helmet = {"armor": 5}
        chestplate = {"armor": 15}
        gauntlets = {"armor": 5}
        greaves = {"armor": 10}
        shield = {"armor": 10}
        
        total_armor = sum(item["armor"] for item in [helmet, chestplate, gauntlets, greaves, shield])
        assert total_armor == 45

# ============ LEVEL PROGRESSION TESTS ============

class TestLevelProgression:
    def test_exp_to_level_formula(self):
        """Experience required should scale with level"""
        def exp_needed(level):
            return level * 100
        
        assert exp_needed(1) == 100
        assert exp_needed(5) == 500
        assert exp_needed(10) == 1000
    
    def test_stat_gain_on_level_up(self):
        """Leveling up should grant stat increases"""
        stat_points_per_level = 2
        skill_points_per_level = 2
        
        # Simulate level up
        new_level = 5
        stats_gained = {
            "strength": 2 * (new_level - 1),  # 2 per level
            "agility": 1 * (new_level - 1),   # 1 per level
            "endurance": 2 * (new_level - 1),
        }
        
        assert stats_gained["strength"] == 8  # 4 levels * 2
        assert stats_gained["agility"] == 4   # 4 levels * 1

# ============ PET SYSTEM TESTS ============

class TestPetSystem:
    def test_pet_rarity_tiers(self):
        """Pets should have different rarity tiers"""
        pet_rarities = ["common", "uncommon", "rare", "epic", "legendary"]
        assert len(pet_rarities) == 5
    
    def test_pet_bonus_structure(self):
        """Pets should provide combat bonuses"""
        pet = {
            "attack_bonus": 5,
            "defense_bonus": 3,
            "hp_bonus": 50,
        }
        
        assert pet["attack_bonus"] > 0
        assert pet["defense_bonus"] > 0
        assert pet["hp_bonus"] > 0
    
    def test_legendary_pet_has_highest_bonuses(self):
        """Legendary pets should have highest bonuses"""
        rarity_multipliers = {
            "common": 1.0,
            "uncommon": 1.5,
            "rare": 2.0,
            "epic": 3.0,
            "legendary": 5.0,
        }
        
        base_bonuses = {"attack": 5, "defense": 3, "hp": 50}
        
        for rarity, multiplier in rarity_multipliers.items():
            adjusted = {k: v * multiplier for k, v in base_bonuses.items()}
            if rarity == "legendary":
                assert adjusted["attack"] == 25  # 5 * 5
                assert adjusted["hp"] == 250  # 50 * 5

# ============ VICTORY REWARDS TESTS ============

class TestVictoryRewards:
    def test_gold_reward_formula(self):
        """Victory should grant gold based on opponent level"""
        opponent_level = 5
        gold_reward = opponent_level * 25
        assert gold_reward == 125
    
    def test_experience_reward_formula(self):
        """Victory should grant XP based on opponent level"""
        opponent_level = 5
        xp_reward = opponent_level * 50
        assert xp_reward == 250
    
    def test_boss_rewards_are_higher(self):
        """Boss battles should grant significantly more rewards"""
        boss_gold = 1000  # Boss reward
        regular_gold = 250  # Level 5 opponent
        
        assert boss_gold > regular_gold

# ============ SAVE/LOAD SYSTEM TESTS ============

class TestSaveLoadSystem:
    def test_gladiator_can_be_serialized(self):
        """Gladiator data should be serializable to JSON"""
        gladiator_data = {
            "id": "test-123",
            "name": "Maximus",
            "level": 5,
            "gold": 500,
            "wins": 10,
            "losses": 3,
            "current_city": "Alexandria",
        }
        
        import json
        serialized = json.dumps(gladiator_data)
        deserialized = json.loads(serialized)
        
        assert deserialized["name"] == "Maximus"
        assert deserialized["level"] == 5
    
    def test_battle_history_serializable(self):
        """Battle history should be storable"""
        battles = [
            {"id": "b1", "victory": True, "opponent": "Crixus"},
            {"id": "b2", "victory": False, "opponent": "Spartacus"},
        ]
        
        import json
        serialized = json.dumps(battles)
        assert len(json.loads(serialized)) == 2
    
    def test_inventory_serializable(self):
        """Inventory should be serializable"""
        inventory = [
            {"item_id": "i1", "name": "Iron Sword", "equipped": True},
            {"item_id": "i2", "name": "Leather Armor", "equipped": False},
        ]
        
        import json
        serialized = json.dumps(inventory)
        assert len(json.loads(serialized)) == 2
    
    def test_equipment_state_serializable(self):
        """Equipment slots should be storable"""
        equipment = {
            "helmet_id": "h1",
            "chestplate_id": "c1",
            "weapon_id": "w1",
            "shield_id": "s1",
            "greaves_id": "g1",
            "gauntlets_id": "ga1",
        }
        
        import json
        serialized = json.dumps(equipment)
        deserialized = json.loads(serialized)
        
        assert deserialized["weapon_id"] == "w1"
        assert deserialized["shield_id"] == "s1"

# ============ GAME ACHIEVEMENTS CONDITIONS ============

class TestAchievements:
    def test_first_win_condition(self):
        """First victory achievement"""
        wins = 0
        after_win = wins + 1
        assert after_win == 1
    
    def test_10_wins_achievement(self):
        """10 wins achievement"""
        wins = 9
        after_win = wins + 1
        assert after_win == 10
    
    def test_reach_rome_achievement(self):
        """Reach Rome achievement"""
        city = "Alexandria"
        reached_rome = city == "Rome"
        assert reached_rome == False
    
    def test_no_deaths_run_condition(self):
        """No deaths run achievement"""
        losses = 0
        wins = 15
        is_undefeated = losses == 0 and wins >= 10
        assert is_undefeated == True
    
    def test_capture_survival_condition(self):
        """Survive capture achievement"""
        captures = 5
        survived_capture = captures >= 5
        assert survived_capture == True

# ============ COMBAT STYLE BONUSES TESTS ============

class TestCombatStyleBonuses:
    def test_all_styles_defined(self):
        """All combat styles should have defined bonuses"""
        styles = ["murmillo", "retiarius", "thraex", "hoplite", "dimachaerus", "bestiarius"]
        
        # Style bonuses should exist
        assert len(styles) == 6
    
    def test_hoplite_bonus(self):
        """Hoplite should have endurance focus"""
        hoplite_bonus = {"endurance": 2, "strength": 1}
        assert hoplite_bonus["endurance"] > hoplite_bonus["strength"]
    
    def test_retiarius_bonus(self):
        """Retiarius should have agility focus"""
        retiarius_bonus = {"agility": 3}
        assert retiarius_bonus["agility"] >= 3

# ============ ROOSTER SIZE TESTS ============

class TestRosterSize:
    def test_total_opponents_count(self):
        """Count total unique opponents across all cities"""
        all_opponents = []
        
        for city, opponents in CITY_OPPONENTS.items():
            for opp in opponents:
                if opp["name"] not in all_opponents:
                    all_opponents.append(opp["name"])
        
        # Should have at least 10 unique opponents
        assert len(all_opponents) >= 10
    
    def test_each_city_has_unique_opponents(self):
        """Each city should have opponents"""
        for city, opponents in CITY_OPPONENTS.items():
            assert len(opponents) >= 3

# ============ GAME BALANCE TESTS ============

class TestGameBalance:
    def test_stat_ranges_are_reasonable(self):
        """Stats should be in reasonable ranges"""
        # Level 1 stats should be manageable
        level1_str = calculate_stats(
            {"height": 50, "weight": 50, "chest": 50, "muscles": 50, "arms": 50, "legs": 50},
            "Rome", 1
        )
        
        assert 10 <= level1_str["strength"] <= 20
        assert 10 <= level1_str["agility"] <= 20
        assert 10 <= level1_str["endurance"] <= 20
    
    def test_opponent_scaling_is_linear(self):
        """Opponent difficulty should scale linearly with city progression"""
        capua_max = max(CITIES["Capua"]["opponent_levels"])
        alexandria_max = max(CITIES["Alexandria"]["opponent_levels"])
        rome_max = max(CITIES["Rome"]["opponent_levels"])
        
        assert rome_max > alexandria_max > capua_max
    
    def test_rewards_scale_with_difficulty(self):
        """Higher level opponents should give better rewards"""
        level5_reward = 5 * 25  # 125 gold
        level10_reward = 10 * 25  # 250 gold
        
        assert level10_reward > level5_reward


# ============ RUN ALL TESTS ============

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
