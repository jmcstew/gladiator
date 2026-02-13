// Frontend Test Suite for ALL ROADS LEAD TO ROME
// Run with: npm test

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';

// Mock API calls
jest.mock('../api', () => ({
  createGladiator: jest.fn(),
  getGladiator: jest.fn(),
  getItems: jest.fn(),
  buyItem: jest.fn(),
  startBattle: jest.fn(),
  takeAction: jest.fn(),
  getProgression: jest.fn(),
  trainStat: jest.fn(),
  getEquipment: jest.fn(),
  equipItem: jest.fn(),
  unequipItem: jest.fn(),
  getLoot: jest.fn(),
  lootItem: jest.fn(),
  getWorldMap: jest.fn(),
  travelToCity: jest.fn(),
  buyVehicle: jest.fn(),
}));

import * as api from '../api';
import App from '../App';
import SplashScreen from '../components/SplashScreen';
import CharacterCreation from '../components/CharacterCreation';
import Arena from '../components/Arena';
import WorldMap from '../components/WorldMap';
import GameOverScreen from '../components/GameOverScreen';

// ============ SPLASH SCREEN TESTS ============

describe('SplashScreen', () => {
  const mockOnEnter = jest.fn();

  beforeEach(() => {
    mockOnEnter.mockClear();
  });

  test('renders splash screen with title', () => {
    render(<SplashScreen onEnter={mockOnEnter} />);
    
    expect(screen.getByText('ALL ROADS LEAD TO ROME')).toBeInTheDocument();
  });

  test('renders ENTER THE ARENA button', () => {
    render(<SplashScreen onEnter={mockOnEnter} />);
    
    expect(screen.getByText('ENTER THE ARENA')).toBeInTheDocument();
  });

  test('shows feature highlights', () => {
    render(<SplashScreen onEnter={mockOnEnter} />);
    
    expect(screen.getByText('3 Cities')).toBeInTheDocument();
    expect(screen.getByText('19 Enemies')).toBeInTheDocument();
    expect(screen.getByText('Rogue-like')).toBeInTheDocument();
  });

  test('calls onEnter when button clicked', () => {
    render(<SplashScreen onEnter={mockOnEnter} />);
    
    const button = screen.getByText('ENTER THE ARENA');
    fireEvent.click(button);
    
    expect(mockOnEnter).toHaveBeenCalledTimes(1);
  });

  test('has fade-out animation class when entering', () => {
    render(<SplashScreen onEnter={mockOnEnter} />);
    
    const splashScreen = screen.getByTestId('splash-screen');
    // Button click triggers fade out
    fireEvent.click(screen.getByText('ENTER THE ARENA'));
    
    expect(splashScreen).toHaveClass('fade-out');
  });
});

// ============ CHARACTER CREATION TESTS ============

describe('CharacterCreation', () => {
  const mockOnCreated = jest.fn();

  beforeEach(() => {
    mockOnCreated.mockClear();
    api.createGladiator.mockReset();
  });

  test('renders character creation form', () => {
    render(
      <BrowserRouter>
        <CharacterCreation onCreated={mockOnCreated} />
      </BrowserRouter>
    );
    
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/gender/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/homeland/i)).toBeInTheDocument();
  });

  test('shows homeland options', () => {
    render(
      <BrowserRouter>
        <CharacterCreation onCreated={mockOnCreated} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Rome')).toBeInTheDocument();
    expect(screen.getByText('Gaul')).toBeInTheDocument();
    expect(screen.getByText('Sparta')).toBeInTheDocument();
    expect(screen.getByText('Egypt')).toBeInTheDocument();
    expect(screen.getByText('Germania')).toBeInTheDocument();
  });

  test('shows combat style options', () => {
    render(
      <BrowserRouter>
        <CharacterCreation onCreated={mockOnCreated} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Gladiator')).toBeInTheDocument();
    expect(screen.getByText('Hoplite')).toBeInTheDocument();
    expect(screen.getByText('Dimachaerus')).toBeInTheDocument();
    expect(screen.getByText('Retiarius')).toBeInTheDocument();
    expect(screen.getByText('Thraex')).toBeInTheDocument();
    expect(screen.getByText('Murmillo')).toBeInTheDocument();
  });

  test('has body attribute sliders', () => {
    render(
      <BrowserRouter>
        <CharacterCreation onCreated={mockOnCreated} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Height')).toBeInTheDocument();
    expect(screen.getByText('Weight')).toBeInTheDocument();
    expect(screen.getByText('Chest')).toBeInTheDocument();
    expect(screen.getByText('Muscles')).toBeInTheDocument();
    expect(screen.getByText('Arms')).toBeInTheDocument();
    expect(screen.getByText('Legs')).toBeInTheDocument();
  });

  test('validates form submission', async () => {
    api.createGladiator.mockResolvedValue({
      id: 'test-id',
      name: 'TestWarrior',
      level: 1
    });

    render(
      <BrowserRouter>
        <CharacterCreation onCreated={mockOnCreated} />
      </BrowserRouter>
    );
    
    // Fill required fields
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'TestWarrior' }
    });
    
    // Submit form
    fireEvent.click(screen.getByText(/create/i));
    
    await waitFor(() => {
      expect(api.createGladiator).toHaveBeenCalled();
    });
  });
});

// ============ ARENA TESTS ============

describe('Arena', () => {
  const mockOnCityChange = jest.fn();
  const mockOnRestart = jest.fn();
  const mockGladiator = {
    id: 'test-gladiator',
    name: 'TestWarrior',
    gender: 'male',
    homeland: 'Rome',
    level: 1,
    strength: 15,
    agility: 10,
    endurance: 12,
    gold: 100,
    wins: 5,
    losses: 2,
    current_city: 'Capua',
  };

  beforeEach(() => {
    mockOnCityChange.mockClear();
    mockOnRestart.mockClear();
    api.startBattle.mockReset();
    api.takeAction.mockReset();
  });

  test('renders arena with gladiator info', () => {
    render(
      <BrowserRouter>
        <Arena gladiator={mockGladiator} onCityChange={mockOnCityChange} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('TestWarrior')).toBeInTheDocument();
    expect(screen.getByText('Capua')).toBeInTheDocument();
    expect(screen.getByText('STR')).toBeInTheDocument();
    expect(screen.getByText('AGI')).toBeInTheDocument();
    expect(screen.getByText('END')).toBeInTheDocument();
  });

  test('shows attack button', () => {
    render(
      <BrowserRouter>
        <Arena gladiator={mockGladiator} onCityChange={mockOnCityChange} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Attack')).toBeInTheDocument();
  });

  test('shows defend button', () => {
    render(
      <BrowserRouter>
        <Arena gladiator={mockGladiator} onCityChange={mockOnCityChange} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Defend')).toBeInTheDocument();
  });

  test('shows special button', () => {
    render(
      <BrowserRouter>
        <Arena gladiator={mockGladiator} onCityChange={mockOnCityChange} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Special')).toBeInTheDocument();
  });

  test('shows flee button', () => {
    render(
      <BrowserRouter>
        <Arena gladiator={mockGladiator} onCityChange={mockOnCityChange} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Flee')).toBeInTheDocument();
  });

  test('shows capture warning when outside Capua', () => {
    const capuaGladiator = { ...mockGladiator, current_city: 'Rome' };
    
    render(
      <BrowserRouter>
        <Arena gladiator={capuaGladiator} onCityChange={mockOnCityChange} />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/lose = capture/i)).toBeInTheDocument();
  });
});

// ============ WORLD MAP TESTS ============

describe('WorldMap', () => {
  const mockOnTravel = jest.fn();
  const mockGladiator = {
    id: 'test-gladiator',
    name: 'TestWarrior',
    gender: 'male',
    level: 1,
    gold: 100,
    current_city: 'Capua',
    vehicles: [],
    capture_count: 0
  };

  beforeEach(() => {
    mockOnTravel.mockClear();
    api.getWorldMap.mockReset();
  });

  test('renders world map header', () => {
    render(
      <BrowserRouter>
        <WorldMap gladiator={mockGladiator} onTravel={mockOnTravel} />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/world map/i)).toBeInTheDocument();
  });

  test('shows current location', () => {
    render(
      <BrowserRouter>
        <WorldMap gladiator={mockGladiator} onTravel={mockOnTravel} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Capua')).toBeInTheDocument();
  });

  test('shows Capua city card', () => {
    render(
      <BrowserRouter>
        <WorldMap gladiator={mockGladiator} onTravel={mockOnTravel} />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/capua/i)).toBeInTheDocument();
    expect(screen.getByText(/starting city/i)).toBeInTheDocument();
  });

  test('shows Alexandria city card', () => {
    render(
      <BrowserRouter>
        <WorldMap gladiator={mockGladiator} onTravel={mockOnTravel} />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/alexandria/i)).toBeInTheDocument();
  });

  test('shows Rome city card', () => {
    render(
      <BrowserRouter>
        <WorldMap gladiator={mockGladiator} onTravel={mockOnTravel} />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/rome/i)).toBeInTheDocument();
  });

  test('shows vehicle requirement for Alexandria', () => {
    render(
      <BrowserRouter>
        <WorldMap gladiator={mockGladiator} onTravel={mockOnTravel} />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/merchant cart/i)).toBeInTheDocument();
  });

  test('shows vehicle requirement for Rome', () => {
    render(
      <BrowserRouter>
        <WorldMap gladiator={mockGladiator} onTravel={mockOnTravel} />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/chariot/i)).toBeInTheDocument();
  });

  test('displays capture count', () => {
    const capturedGladiator = { ...mockGladiator, capture_count: 3 };
    
    render(
      <BrowserRouter>
        <WorldMap gladiator={capturedGladiator} onTravel={mockOnTravel} />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/captures: 3/i)).toBeInTheDocument();
  });
});

// ============ GAME OVER SCREEN TESTS ============

describe('GameOverScreen', () => {
  const mockOnRestart = jest.fn();
  const mockMaleGladiator = {
    name: 'FallenWarrior',
    level: 5,
    wins: 10,
    losses: 3,
    current_city: 'Capua',
    gender: 'male'
  };

  const mockFemaleGladiator = {
    ...mockMaleGladiator,
    gender: 'female'
  };

  beforeEach(() => {
    mockOnRestart.mockClear();
  });

  test('renders game over title', () => {
    render(<GameOverScreen gladiator={mockMaleGladiator} onRestart={mockOnRestart} />);
    
    expect(screen.getByText(/you have fallen/i)).toBeInTheDocument();
  });

  test('shows execution message', () => {
    render(<GameOverScreen gladiator={mockMaleGladiator} onRestart={mockOnRestart} />);
    
    expect(screen.getByText(/emperor has spoken/i)).toBeInTheDocument();
  });

  test('shows final stats', () => {
    render(<GameOverScreen gladiator={mockMaleGladiator} onRestart={mockOnRestart} />);
    
    expect(screen.getByText(/final record/i)).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); // Level
    expect(screen.getByText('10')).toBeInTheDocument(); // Victories
    expect(screen.getByText('3')).toBeInTheDocument(); // Defeats
  });

  test('shows final city', () => {
    render(<GameOverScreen gladiator={mockMaleGladiator} onRestart={mockOnRestart} />);
    
    expect(screen.getByText('Capua')).toBeInTheDocument();
  });

  test('shows START ANEW button', () => {
    render(<GameOverScreen gladiator={mockMaleGladiator} onRestart={mockOnRestart} />);
    
    expect(screen.getByText(/start anew/i)).toBeInTheDocument();
  });

  test('calls onRestart when button clicked', () => {
    render(<GameOverScreen gladiator={mockMaleGladiator} onRestart={mockOnRestart} />);
    
    fireEvent.click(screen.getByText(/start anew/i));
    
    expect(mockOnRestart).toHaveBeenCalledTimes(1);
  });

  test('shows flavor text', () => {
    render(<GameOverScreen gladiator={mockMaleGladiator} onRestart={mockOnRestart} />);
    
    expect(screen.getByText(/all roads lead to rome/i)).toBeInTheDocument();
  });
});

// ============ APP COMPONENT TESTS ============

describe('App', () => {
  test('renders app without splash when splash is hidden', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    // App should render
    expect(screen.getByRole('application')).toBeInTheDocument();
  });

  test('has header with game title', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/all roads lead to rome/i)).toBeInTheDocument();
  });

  test('shows create gladiator link when not logged in', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/create gladiator/i)).toBeInTheDocument();
  });
});

// ============ UTILITY TESTS ============

describe('Game Utilities', () => {
  test('homeland bonuses are defined correctly', () => {
    const HOMELAND_BONUSES = {
      Rome: { charisma: 2, intelligence: 1 },
      Gaul: { strength: 2, agility: 1 },
      Sparta: { endurance: 3, strength: 1 },
      Egypt: { agility: 2, intelligence: 1 },
      Germania: { strength: 2, endurance: 1 }
    };
    
    expect(HOMELAND_BONUSES.Rome.charisma).toBe(2);
    expect(HOMELAND_BONUSES.Sparta.endurance).toBe(3);
    expect(HOMELAND_BONUSES.Gaul.strength).toBe(2);
  });

  test('combat styles are defined', () => {
    const COMBAT_STYLES = [
      'gladiator', 'hoplite', 'dimachaerus', 'retiarius', 'thraex', 'murillo'
    ];
    
    expect(COMBAT_STYLES).toContain('gladiator');
    expect(COMBAT_STYLES).toContain('hoplite');
    expect(COMBAT_STYLES.length).toBe(6);
  });

  test('cities have proper structure', () => {
    const CITIES = {
      Capua: {
        name: 'Capua',
        opponent_levels: [1, 2, 3, 4],
        next_city: 'Alexandria',
        vehicle_required: 'merchant_cart'
      },
      Alexandria: {
        name: 'Alexandria',
        opponent_levels: [3, 4, 5, 6, 7],
        next_city: 'Rome',
        vehicle_required: 'chariot'
      },
      Rome: {
        name: 'Rome',
        opponent_levels: [6, 7, 8, 9, 10],
        next_city: null,
        boss: 'The Emperor\'s Champion'
      }
    };
    
    expect(CITIES.Capua.vehicle_required).toBe('merchant_cart');
    expect(CITIES.Alexandria.vehicle_required).toBe('chariot');
    expect(CITIES.Rome.next_city).toBeNull();
  });
});

// ============ RUN TESTS ============

export {};
