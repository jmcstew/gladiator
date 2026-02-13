# 🏛️ ALL ROADS LEAD TO ROME

A web-based gladiator battle game with React frontend and Python FastAPI backend. Fight opponents from across the ancient world, collect legendary equipment, and become the champion of the arena!

## 🎮 Quick Start

### Prerequisites

- **Python 3.9+** (for backend)
- **Node.js 18+** (for frontend)
- **Git** (to clone the repository)

### Option 1: Run Everything Locally

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd gladiator
```

#### 2. Set Up the Backend

```bash
# Navigate to backend directory
cd gladiator/backend

# Create virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Seed the database with initial items
python seed.py

# Start the backend server
uvicorn main:app --reload
```

The backend will run at: **http://localhost:8000**

#### 3. Set Up the Frontend

Open a new terminal:

```bash
# Navigate to frontend directory
cd gladiator/frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will run at: **http://localhost:5173**

#### 4. Play the Game!

Open your browser and navigate to:
```
http://localhost:5173
```

---

## 🛠️ Development Setup

### Project Structure

```
gladiator/
├── backend/
│   ├── main.py              # FastAPI application entry point
│   ├── models.py            # SQLAlchemy database models
│   ├── seed.py              # Database seeding script
│   ├── requirements.txt     # Python dependencies
│   └── README.md            # Backend documentation
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Main React application
│   │   ├── main.jsx         # React entry point
│   │   ├── index.css        # Global styles
│   │   └── components/
│   │       ├── CharacterCreation.jsx  # Character creation screen
│   │       ├── Arena.jsx              # Combat arena
│   │       ├── Shop.jsx               # Equipment shop
│   │       ├── Equipment.jsx          # Equipment management
│   │       └── Progression.jsx        # Stats and training
│   ├── public/
│   │   └── assets/          # Images and game assets
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── opponents.md              # Arena opponent designs
└── README.md                # This file
```

### Backend Commands

```bash
# Run with auto-reload
uvicorn main:app --reload

# Run on specific port
uvicorn main:app --reload --port 8000

# View API documentation
# Open http://localhost:8000/docs in your browser
```

### Frontend Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🎯 Game Features

### Character Creation
- Choose your **homeland** (affects starting stats):
  - **Rome** → +2 Charisma, +1 Intelligence
  - **Gaul** → +2 Strength, +1 Agility
  - **Sparta** → +3 Endurance, +1 Strength
  - **Egypt** → +2 Agility, +1 Intelligence
  - **Germania** → +2 Strength, +1 Endurance

- Customize body attributes (0-100):
  - Height, Weight, Chest, Muscles, Arms, Legs

- Select combat style:
  - Gladiator, Hoplite, Dimachaerus, Retiarius, Thraex, Murmillo

### Combat System
- Turn-based tactical battles
- Actions: **Attack**, **Defend**, **Special**, **Flee**
- Damage calculated from stats with randomization
- HP and round tracking
- **Combat animations** with damage numbers and shake effects

### Arena Opponents
Face 10 unique opponents, each with backstory and dialogue:

1. **Valerius "The Blooded"** - Disgraced Roman Centurion (Level 3)
2. **Boudicca's Daughter** - Celtic Warrior (Level 4)
3. **Sicarius** - Egyptian Assassin (Level 5)
4. **Kriemhild** - Germanic Shield Maiden (Level 4)
5. **Xylon the Broken** - Thracian Gladiator (Level 6)
6. **Amazonia** - Egyptian Amazon (Level 5)
7. **Spartacus Reborn** - Spartan Hoplite (Level 7)
8. **Lycus the Beast** - Roman Bestiarius (Level 6)
9. **Cassia the Scarlet** - Retiarius Priestess (Level 5)
10. **Grimhild** - One-Eyed Wolf (Level 7)

### Progression System
- Earn **Experience** from battles
- Gain **Skill Points** on level up
- Train: Strength, Agility, Endurance, Intelligence, Charisma

### Shop & Equipment
- Weapons, armor, helmets, shields, gauntlets, greaves
- **Rarity tiers**: Common → Uncommon → Rare → Epic → Legendary
- Equip items to boost combat stats

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Create new gladiator |
| POST | `/auth/login` | Authenticate gladiator |
| GET | `/gladiator/{id}` | Get gladiator details |
| POST | `/arena/battle/{gladiator_id}` | Start new battle |
| POST | `/arena/battle/{battle_id}/action` | Execute combat action |
| GET | `/shop/items` | List all shop items |
| POST | `/shop/buy` | Purchase item |
| GET | `/progression/{id}` | Get gladiator stats |
| POST | `/progression/train/{id}/{stat}` | Train attribute |

### API Documentation
Interactive API docs available at: **http://localhost:8000/docs**

---

## 🐛 Troubleshooting

### Backend Issues

**"Module not found" errors**
```bash
# Ensure virtual environment is activated
source venv/bin/activate
pip install -r requirements.txt
```

**"Database locked" error**
```bash
# Delete the database file and re-seed
rm gladiator.db
python seed.py
```

**Port 8000 already in use**
```bash
# Find and kill the process
lsof -i :8000
kill <PID>
# Or run on different port
uvicorn main:app --reload --port 8001
```

### Frontend Issues

**"Cannot find module" errors**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Port 5173 already in use**
```bash
# Find and kill the process
lsof -i :5173
kill <PID>
```

**CORS errors**
- Ensure backend is running before frontend
- Check that ports match in API_URL constant

### General Issues

**Changes not reflected**
- Backend: Ensure `--reload` flag is active
- Frontend: Hard refresh (Ctrl+F5 / Cmd+Shift+R)

**Game not loading**
- Check browser console for errors
- Verify both servers are running
- Clear browser cache

---

## 🚀 Deployment

### Deploy to AWS (EC2)

```bash
# On EC2 instance
sudo apt update
sudo apt install python3-pip git nodejs npm

# Clone and setup
git clone <repo>
cd gladiator/backend
pip install -r requirements.txt

# Setup system service for backend
sudo nano /etc/systemd/system/gladiator.service
```

Create service file:
```ini
[Unit]
Description=Gladiator Game Backend
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/gladiator/backend
ExecStart=/usr/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable gladiator
sudo systemctl start gladiator

# Build frontend
cd ../frontend
npm install
npm run build

# Serve with nginx or pm2
```

### Environment Variables

Create `.env` file in backend directory:
```env
DATABASE_URL=sqlite:///./gladiator.db
SECRET_KEY=your-secret-key-here
```

---

## 🎨 Image Generation

Opponent portraits were generated using **ComfyUI** with the Zimage Turbo workflow.

### Generating New Images

```bash
python3 /home/node/.openclaw/workspace/skills/comfyui/scripts/generate.py \
  --prompt "your image description" \
  --output "path/to/output.png" \
  --width 1024 \
  --height 1024
```

Images are saved to: `gladiator/frontend/public/assets/`

---

## 📝 Scripts

### Seed Database
```bash
cd backend
python seed.py
```
Populates the shop with initial weapons, armor, and items.

### Reset Database
```bash
rm backend/gladiator.db
python seed.py
```
Deletes and recreates the database with fresh data.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

### Adding New Opponents

1. Add opponent details to `opponents.md`
2. Generate portrait image via ComfyUI
3. Add to `backend/seed.py` or create migration
4. Update frontend Arena component if needed

### Adding New Equipment

1. Add item to `backend/seed.py`
2. Define stats, rarity, and prices
3. Update frontend Shop component if new types needed

---

## 📄 License

This project is open source. Feel free to modify and distribute.

---

## 🙏 Credits

- **ComfyUI** for image generation
- **FastAPI** for the backend framework
- **React + Vite** for the frontend
- **SQLAlchemy** for database ORM

---

*Rise, Gladiator. The arena awaits your glory.*
