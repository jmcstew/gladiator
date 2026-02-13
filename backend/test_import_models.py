
try:
    from models import COMBAT_STYLES
    print("Successfully imported COMBAT_STYLES")
    for style, data in COMBAT_STYLES.items():
        print(f"- {style}: {data['name']}")
except ImportError as e:
    print(f"Import failed: {e}")
except Exception as e:
    print(f"An error occurred: {e}")
