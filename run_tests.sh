#!/bin/bash
# Test Runner for ALL ROADS LEAD TO ROME
# This script runs the backend and frontend tests

echo "================================================"
echo "ALL ROADS LEAD TO ROME - Test Suite"
echo "================================================"
echo ""

# Check Python
echo "Checking Python installation..."
if command -v python3 &> /dev/null; then
    echo "✓ Python3 is available"
    python3 --version
else
    echo "✗ Python3 not found"
fi

# Check Node.js
echo ""
echo "Checking Node.js installation..."
if command -v node &> /dev/null; then
    echo "✓ Node.js is available"
    node --version
else
    echo "✗ Node.js not found"
fi

# Backend tests
echo ""
echo "================================================"
echo "Backend Test Suite"
echo "================================================"
echo ""
echo "To run backend tests, execute:"
echo "  cd gladiator/backend"
echo "  pip install pytest httpx"
echo "  pytest tests/ -v"
echo ""

# Frontend tests
echo "================================================"
echo "Frontend Test Suite"
echo "================================================"
echo ""
echo "To run frontend tests, execute:"
echo "  cd gladiator/frontend"
echo "  npm install jest @testing-library/react @testing-library/user-event"
echo "  npm test"
echo ""

# Create pytest.ini
echo "Creating pytest configuration..."
cat > /home/node/.openclaw/workspace/gladiator/backend/tests/pytest.ini << 'EOF'
[pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = -v --tb=short
EOF

echo "✓ pytest.ini created"

# Create package.json for frontend tests
echo ""
echo "Creating frontend test configuration..."
cat > /home/node/.openclaw/workspace/gladiator/frontend/package.json << 'EOF'
{
  "name": "all-roads-lead-to-rome",
  "version": "0.4.0",
  "description": "A roguelike gladiator game",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "jest --coverage",
    "test:watch": "jest --watch"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.1.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/user-event": "^14.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "jest": "^29.7.0",
    "vite": "^5.0.0"
  },
  "jest": {
    "testEnvironment": "jsdom",
    "setupFilesAfterEnv": ["<rootDir>/src/tests/setup.js"],
    "moduleNameMapper": {
      "\\.(css|less|scss|sass)$": "identity-obj-proxy"
    },
    "testMatch": ["<rootDir>/src/**/*.test.js"],
    "collectCoverageFrom": [
      "src/**/*.js",
      "!src/tests/**"
    ]
  }
}
EOF

echo "✓ package.json updated with test dependencies"

# Create Jest setup file
echo ""
echo "Creating Jest setup file..."
cat > /home/node/.openclaw/workspace/gladiator/frontend/src/tests/setup.js << 'EOF'
import '@testing-library/jest-dom';
import { beforeEach, afterEach } from '@testing-library/react';

// Suppress console errors during tests
const originalError = console.error;
beforeEach(() => {
  console.error = jest.fn();
});
afterEach(() => {
  console.error = originalError;
});

// Mock window.location
Object.defineProperty(window, 'location', {
  writable: true,
  value: { href: 'http://localhost:3000' }
});
EOF

echo "✓ Jest setup file created"

# Create API mock file
echo ""
echo "Creating API mock file..."
cat > /home/node/.openclaw/workspace/gladiator/frontend/src/api.js << 'EOF'
// API utility for ALL ROADS LEAD TO ROME

const API_URL = 'http://localhost:8000';

// Auth APIs
export async function createGladiator(data) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return response.json();
}

export async function getGladiator(id) {
  const response = await fetch(`${API_URL}/gladiator/${id}`);
  return response.json();
}

// Shop APIs
export async function getItems() {
  const response = await fetch(`${API_URL}/shop/items`);
  return response.json();
}

export async function buyItem(gladiatorId, itemId) {
  const response = await fetch(
    `${API_URL}/shop/buy?gladiator_id=${gladiatorId}&item_id=${itemId}`,
    { method: 'POST' }
  );
  return response.json();
}

// Arena APIs
export async function startBattle(gladiatorId, battleType = 'arena') {
  const response = await fetch(
    `${API_URL}/arena/start/${gladiatorId}?battle_type=${battleType}`,
    { method: 'POST' }
  );
  return response.json();
}

export async function takeAction(battleId, action) {
  const response = await fetch(
    `${API_URL}/arena/battle/${battleId}/action`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    }
  );
  return response.json();
}

// Progression APIs
export async function getProgression(gladiatorId) {
  const response = await fetch(`${API_URL}/progression/${gladiatorId}`);
  return response.json();
}

export async function trainStat(gladiatorId, stat) {
  const response = await fetch(
    `${API_URL}/progression/train/${gladiatorId}/${stat}`,
    { method: 'POST' }
  );
  return response.json();
}

// Equipment APIs
export async function getEquipment(gladiatorId) {
  const response = await fetch(`${API_URL}/equipment/${gladiatorId}`);
  return response.json();
}

export async function equipItem(gladiatorId, itemId) {
  const response = await fetch(
    `${API_URL}/equipment/${gladiatorId}/equip/${itemId}`,
    { method: 'POST' }
  );
  return response.json();
}

export async function unequipItem(gladiatorId, slot) {
  const response = await fetch(
    `${API_URL}/equipment/${gladiatorId}/unequip/${slot}`,
    { method: 'POST' }
  );
  return response.json();
}

// Loot APIs
export async function getLoot(battleId) {
  const response = await fetch(`${API_URL}/arena/battle/${battleId}/available-loot`);
  return response.json();
}

export async function lootItem(battleId, itemId) {
  const response = await fetch(
    `${API_URL}/arena/battle/${battleId}/loot`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item_id: itemId })
    }
  );
  return response.json();
}

// World Map APIs
export async function getWorldMap(gladiatorId) {
  const response = await fetch(`${API_URL}/worldmap/${gladiatorId}`);
  return response.json();
}

export async function travelToCity(gladiatorId, targetCity) {
  const response = await fetch(
    `${API_URL}/worldmap/${gladiatorId}/travel`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target_city: targetCity })
    }
  );
  return response.json();
}

export async function buyVehicle(gladiatorId, vehicleType) {
  const response = await fetch(
    `${API_URL}/worldmap/${gladiatorId}/buy-vehicle`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vehicle_type: vehicleType })
    }
  );
  return response.json();
}

// Battle History
export async function getBattleHistory(gladiatorId) {
  const response = await fetch(`${API_URL}/arena/history/${gladiatorId}`);
  return response.json();
}

// Health Check
export async function healthCheck() {
  const response = await fetch(`${API_URL}/health`);
  return response.json();
}

export default {
  createGladiator,
  getGladiator,
  getItems,
  buyItem,
  startBattle,
  takeAction,
  getProgression,
  trainStat,
  getEquipment,
  equipItem,
  unequipItem,
  getLoot,
  lootItem,
  getWorldMap,
  travelToCity,
  buyVehicle,
  getBattleHistory,
  healthCheck
};
EOF

echo "✓ API mock file created"

# Create test report template
echo ""
echo "================================================"
echo "Test Report Template"
echo "================================================"
cat > /home/node/.openclaw/workspace/gladiator/TEST_REPORT.md << 'EOF'
# ALL ROADS LEAD TO ROME - Test Report

## Test Execution Date
```
Date: $(date)
Platform: $(uname -s) $(uname -m)
```

## Backend Tests

### Test Coverage
| Module | Tests | Passed | Failed | Coverage |
|--------|-------|--------|--------|----------|
| Auth | 4 | ? | ? | ? |
| Shop | 3 | ? | ? | ? |
| Arena | 6 | ? | ? | ? |
| Progression | 3 | ? | ? | ? |
| Equipment | 1 | ? | ? | ? |
| World Map | 3 | ? | ? | ? |
| Health | 1 | ? | ? | ? |
| **Total** | **21** | **?** | **?** | **?** |

### Test Results

#### Auth Tests
- [ ] test_create_gladiator
- [ ] test_create_gladiator_invalid_homeland
- [ ] test_get_gladiator
- [ ] test_get_nonexistent_gladiator

#### Shop Tests
- [ ] test_get_items
- [ ] test_buy_item_success
- [ ] test_buy_item_insufficient_gold

#### Arena Tests
- [ ] test_start_arena_battle
- [ ] test_battle_attack_action
- [ ] test_battle_defend_action
- [ ] test_battle_special_action
- [ ] test_battle_flee_action

#### Progression Tests
- [ ] test_get_progression
- [ ] test_train_stat
- [ ] test_train_invalid_stat

#### Equipment Tests
- [ ] test_get_equipment

#### World Map Tests
- [ ] test_get_worldmap
- [ ] test_get_gladiator_worldmap
- [ ] test_city_opponents_defined

#### Health Tests
- [ ] test_health_check

## Frontend Tests

### Test Coverage
| Component | Tests | Passed | Failed | Coverage |
|-----------|-------|--------|--------|----------|
| SplashScreen | 5 | ? | ? | ? |
| CharacterCreation | 4 | ? | ? | ? |
| Arena | 6 | ? | ? | ? |
| WorldMap | 8 | ? | ? | ? |
| GameOverScreen | 6 | ? | ? | ? |
| App | 3 | ? | ? | ? |
| Utilities | 3 | ? | ? | ? |
| **Total** | **35** | **?** | **?** | **?** |

## Execution Instructions

### Backend Tests
```bash
cd gladiator/backend
pip install pytest httpx pytest-cov
pytest tests/ -v --tb=short --cov=. --cov-report=html
```

### Frontend Tests
```bash
cd gladiator/frontend
npm install
npm test -- --coverage
```

## Known Issues

## Notes

## Test Maintainers
- Backend: @anorak
- Frontend: @anorak

---
*Report generated by ALL ROADS LEAD TO ROME Test Suite*
EOF

echo "✓ Test report template created"

echo ""
echo "================================================"
echo "Test Setup Complete!"
echo "================================================"
echo ""
echo "To run tests:"
echo ""
echo "1. Backend:"
echo "   cd gladiator/backend"
echo "   pip install pytest httpx"
echo "   pytest tests/ -v"
echo ""
echo "2. Frontend:"
echo "   cd gladiator/frontend"
echo "   npm install"
echo "   npm test"
echo ""
echo "Test Report: gladiator/TEST_REPORT.md"
echo ""
