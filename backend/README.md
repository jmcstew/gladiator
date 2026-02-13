# Gladiator Game - Backend

FastAPI + SQLAlchemy backend for local play

## Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

## API Endpoints

### Auth
- POST /auth/register - Create new gladiator
- POST /auth/login - Login
- POST /auth/logout - Logout

### Gladiator
- GET /gladiator/{id} - Get gladiator details
- PUT /gladiator/{id} - Update gladiator
- GET /gladiator/{id}/stats - Get stats
- PUT /gladiator/{id}/equip - Equip item

### Shop
- GET /shop/items - List items
- POST /shop/buy - Buy item

### Arena
- POST /arena/battle - Start battle
- GET /arena/battles/{id} - Get battle result
- GET /arena/history - Battle history

### Progression
- GET /progression/level - Current level
- POST /progression/train - Train skill
