# Seed script for shop items

from sqlalchemy.orm import Session
from models import Item

def seed_items(db: Session):
    """Seed the database with initial shop items"""
    
    items = [
        # ========== WEAPONS ==========
        # Capua (Starting City) Weapons
        Item(name="Wooden Sword", type="weapon", rarity="common", damage=5, buy_price=50, description="A simple training sword"),
        Item(name="Iron Gladius", type="weapon", rarity="common", damage=10, buy_price=100, description="Standard legionary sword"),
        Item(name="Rusty Spatha", type="weapon", rarity="common", damage=12, buy_price=150, description="Old but serviceable"),
        
        # Alexandria Weapons
        Item(name="Steel Spatha", type="weapon", rarity="uncommon", damage=15, buy_price=200, description="Longer sword for cavalry"),
        Item(name="Khopesh", type="weapon", rarity="uncommon", damage=18, buy_price=300, description="Egyptian curved sword"),
        Item(name="Trident", type="weapon", rarity="uncommon", damage=12, buy_price=250, description="Retiarius weapon with reach"),
        
        # Rome Weapons
        Item(name="Damascus Blade", type="weapon", rarity="rare", damage=25, buy_price=500, description="Mastercrafted sharp edge"),
        Item(name="Golden Trident", type="weapon", rarity="epic", damage=35, buy_price=1000, description="Royal weapon of champions"),
        Item(name="Champion's Sword", type="weapon", rarity="legendary", damage=50, buy_price=2500, description="Forged in the fires of Rome"),
        
        # ========== HELMETS ==========
        # Capua
        Item(name="Leather Cap", type="helmet", rarity="common", armor=2, buy_price=30, description="Basic head protection"),
        Item(name="Iron Helmet", type="helmet", rarity="common", armor=5, buy_price=75, description="Standard soldier's helmet"),
        
        # Alexandria
        Item(name="Gladiator Helm", type="helmet", rarity="uncommon", armor=8, buy_price=150, description="Decorative face mask"),
        Item(name="Pharaoh's Crown", type="helmet", rarity="rare", armor=12, buy_price=400, description="Golden Egyptian crown"),
        
        # Rome
        Item(name="Spartan Crest", type="helmet", rarity="rare", armor=12, buy_price=350, description="Fearsome crest design"),
        Item(name="Champion's Crown", type="helmet", rarity="legendary", armor=20, buy_price=2000, description="Crown of the arena champion"),
        
        # ========== CHESTPLATES ==========
        # Capua
        Item(name="Leather Tunic", type="chestplate", rarity="common", armor=3, buy_price=40, description="Basic leather protection"),
        Item(name="Chain Mail", type="chestplate", rarity="uncommon", armor=8, buy_price=150, description="Interlocking metal rings"),
        
        # Alexandria
        Item(name="Scale Armor", type="chestplate", rarity="uncommon", armor=10, buy_price=250, description="Egyptian scale pattern"),
        Item(name="Golden Breastplate", type="chestplate", rarity="rare", armor=15, buy_price=500, description="Gleaming golden armor"),
        
        # Rome
        Item(name="Plate Armor", type="chestplate", rarity="rare", armor=15, speed_penalty=5, buy_price=400, description="Full metal protection"),
        Item(name="Champion's Breastplate", type="chestplate", rarity="legendary", armor=25, speed_penalty=2, buy_price=3000, description="Glorious armor of champions"),
        
        # ========== GAUNTLETS ==========
        Item(name="Leather Gloves", type="gauntlets", rarity="common", armor=1, buy_price=20, description="Basic hand protection"),
        Item(name="Iron Gauntlets", type="gauntlets", rarity="uncommon", armor=4, buy_price=80, description="Metal hand guards"),
        Item(name="Steel Vambraces", type="gauntlets", rarity="rare", armor=8, buy_price=250, description="Forearm protection"),
        
        # ========== SHIELDS ==========
        # Capua
        Item(name="Small Shield", type="shield", rarity="common", armor=5, buy_price=60, description="Light buckler"),
        Item(name="Roman Scutum", type="shield", rarity="uncommon", armor=10, buy_price=150, description="Large rectangular shield"),
        
        # Alexandria/Rome
        Item(name="Gladiator Shield", type="shield", rarity="rare", armor=15, buy_price=350, description="Round tournament shield"),
        Item(name="Aegis", type="shield", rarity="legendary", armor=25, buy_price=1500, description="Divine protection"),
        
        # ========== GREAVES ==========
        Item(name="Leather Greaves", type="greaves", rarity="common", armor=2, buy_price=35, description="Basic leg protection"),
        Item(name="Iron Greaves", type="greaves", rarity="uncommon", armor=5, buy_price=100, description="Metal leg guards"),
        Item(name="Champion's Greaves", type="greaves", rarity="rare", armor=10, buy_price=300, description="Ornamental leg armor"),
        
        # ========== CHARISMA-BOOSTING ITEMS ==========
        # Helmets with presence
        Item(name="Lion's Mane Helmet", type="helmet", rarity="uncommon", armor=5, charisma=3, buy_price=300, description="Impressive lion crest demands respect"),
        Item(name="Noble's Tiara", type="helmet", rarity="rare", armor=3, charisma=5, buy_price=500, description="Elegant silver tiara of nobility"),
        Item(name="Emperor's Laurel", type="helmet", rarity="legendary", armor=2, charisma=8, buy_price=1500, description="Golden laurel wreath blessed by emperors"),
        
        # Chestplates with presence
        Item(name="Noble's Tunic", type="chestplate", rarity="uncommon", armor=3, charisma=2, buy_price=200, description="Fine silks that command attention"),
        Item(name="Champion's Cape", type="chestplate", rarity="rare", armor=5, charisma=4, buy_price=600, description="Flowing crimson cape of a champion"),
        Item(name="Royal Robes", type="chestplate", rarity="legendary", armor=3, charisma=6, buy_price=2000, description="Majestic robes of royalty"),
        
        # Gauntlets with presence
        Item(name="Noble's Gloves", type="gauntlets", rarity="uncommon", armor=2, charisma=2, buy_price=150, description="White gloves of refined breeding"),
        Item(name="Champion's Fist", type="gauntlets", rarity="rare", armor=4, charisma=3, buy_price=400, description="Golden gauntlets that gleam"),
        
        # Greaves with presence
        Item(name="Royal Greaves", type="greaves", rarity="rare", armor=4, charisma=3, buy_price=400, description="Ornamented greaves of nobility"),
        
        # ========== CONSUMABLES ==========
        Item(name="Minor Health Potion", type="consumable", rarity="common", buy_price=25, description="Restores 20 HP"),
        Item(name="Health Potion", type="consumable", rarity="uncommon", buy_price=75, description="Restores 50 HP"),
        Item(name="Greater Health Potion", type="consumable", rarity="rare", buy_price=200, description="Restores 100 HP"),
        Item(name="Strength Elixir", type="consumable", rarity="rare", buy_price=150, description="+5 STR for one battle"),
        Item(name="Speed Elixir", type="consumable", rarity="rare", buy_price=150, description="+5 AGI for one battle"),
        
        # ========== VEHICLES (City Gating) ==========
        Item(name="Merchant Cart Ticket", type="vehicle", rarity="common", buy_price=500, description="Travel to Alexandria. If captured, you lose all equipment but keep stats."),
        Item(name="Chariot", type="vehicle", rarity="uncommon", buy_price=1500, description="Travel to Rome (final city). If captured, you lose all equipment but keep stats."),
    ]
    
    for item in items:
        db.add(item)
    
    db.commit()
    print(f"Seeded {len(items)} items to the shop!")

def seed_pets(db: Session):
    """Seed the database with available pets"""
    from models import Pet
    
    pets = [
        # Common Pets
        Pet(name="Street Cat", type="feline", rarity="common", 
            attack_bonus=2, defense_bonus=1, hp_bonus=10,
            buy_price=100, description="A scrappy cat from the streets"),
        
        Pet(name="Raven", type="avian", rarity="common",
            attack_bonus=1, defense_bonus=2, hp_bonus=5,
            buy_price=100, description="A clever bird that brings luck"),
        
        Pet(name="Mangy Dog", type="canine", rarity="common",
            attack_bonus=2, defense_bonus=2, hp_bonus=15,
            buy_price=150, description="A loyal stray that followed you home"),
        
        # Uncommon Pets
        Pet(name="Hunting Hound", type="canine", rarity="uncommon",
            attack_bonus=5, defense_bonus=3, hp_bonus=25,
            ability_name="Pack Attack", ability_description="Deals extra damage when you attack",
            buy_price=400, description="A trained hunting dog"),
        
        Pet(name="Hawkeye Eagle", type=" avian", rarity="uncommon",
            attack_bonus=3, defense_bonus=5, hp_bonus=20,
            ability_name="Sharp Eyes", ability_description="Increases your accuracy",
            buy_price=450, description="A majestic bird of prey"),
        
        # Rare Pets
        Pet(name="Battle Lion", type="feline", rarity="rare",
            attack_bonus=8, defense_bonus=5, hp_bonus=40,
            ability_name="Roar of Courage", ability_description="Boosts your defense for one round",
            buy_price=800, description="A lion trained for the arena"),
        
        Pet(name="Shadow Wolf", type="canine", rarity="rare",
            attack_bonus=7, defense_bonus=7, hp_bonus=35,
            ability_name="Night Vision", ability_description="Dodge chance increased",
            buy_price=850, description="A stealthy wolf that fights alongside you"),
        
        # Epic Pets
        Pet(name="Golden Lioness", type="feline", rarity="epic",
            attack_bonus=12, defense_bonus=8, hp_bonus=60,
            ability_name="Royal Pounce", ability_description="Massive damage on first attack",
            buy_price=1500, description="A legendary golden lioness"),
        
        Pet(name="Phantom Gryphon", type="avian", rarity="epic",
            attack_bonus=10, defense_bonus=10, hp_bonus=55,
            ability_name="Sky Dive", ability_description="Aerial assault deals double damage",
            buy_price=1600, description="A mythical creature of the heavens"),
        
        # Legendary Pet
        Pet(name="Arena Champion Drake", type="feline", rarity="legendary",
            attack_bonus=20, defense_bonus=15, hp_bonus=100,
            ability_name="Dragon's Breath", ability_description="AoE damage to all enemies",
            buy_price=3000, description="A legendary dragon-like creature, the ultimate companion"),
    ]
    
    for pet in pets:
        db.add(pet)
    
    db.commit()
    print(f"Seeded {len(pets)} pets!")

if __name__ == "__main__":
    from main import SessionLocal
    db = SessionLocal()
    seed_items(db)
    seed_pets(db)
    db.close()
