import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock storage to return a profile (so Welcome screen is skipped)
vi.mock('../../utils/storage', () => ({
  getProfile: () => ({ gender: 'male', location: 'Mumbai', styles: ['minimal'], budget: 'mid-range', schedule: {} }),
  getWardrobe: () => [],
  getWearHistory: () => [],
  getTodayPick: () => null,
}));

// Mock all child components to isolate App's routing logic
vi.mock('../../components/Layout', () => ({
  default: ({ children, activeSection, onNavigate }) => (
    <div data-testid="layout" data-active={activeSection}>
      <button data-testid="nav-today" onClick={() => onNavigate('today')}>Today</button>
      <button data-testid="nav-wardrobe" onClick={() => onNavigate('wardrobe')}>Wardrobe</button>
      <button data-testid="nav-profile" onClick={() => onNavigate('profile')}>Profile</button>
      <button data-testid="nav-ideas" onClick={() => onNavigate('ideas')}>Ideas</button>
      <button data-testid="nav-occasion" onClick={() => onNavigate('occasion')}>Occasion</button>
      <button data-testid="nav-suggestions" onClick={() => onNavigate('suggestions')}>Suggestions</button>
      {children}
    </div>
  ),
}));

vi.mock('../../components/Welcome', () => ({
  default: ({ onComplete }) => <div data-testid="welcome-section">Welcome</div>,
}));

vi.mock('../../components/TodayPick', () => ({
  default: ({ onNavigate }) => <div data-testid="today-section">TodayPick</div>,
}));

vi.mock('../../components/WardrobeManager', () => ({
  default: () => <div data-testid="wardrobe-section">WardrobeManager</div>,
}));

vi.mock('../../components/StyleProfile', () => ({
  default: () => <div data-testid="profile-section">StyleProfile</div>,
}));

vi.mock('../../components/OutfitIdeas', () => ({
  default: ({ onNavigate }) => <div data-testid="ideas-section">OutfitIdeas</div>,
}));

vi.mock('../../components/OccasionStylist', () => ({
  default: ({ onNavigate }) => <div data-testid="occasion-section">OccasionStylist</div>,
}));

vi.mock('../../components/Recommendations', () => ({
  default: ({ onNavigate }) => <div data-testid="suggestions-section">Recommendations</div>,
}));

// Mock CSS import
vi.mock('../../App.css', () => ({}));

import App from '../../App';
import { fireEvent } from '@testing-library/react';

describe('App', () => {
  it('renders TodayPick by default', () => {
    render(<App />);
    expect(screen.getByTestId('today-section')).toBeInTheDocument();
  });

  it('renders Layout wrapper', () => {
    render(<App />);
    expect(screen.getByTestId('layout')).toBeInTheDocument();
  });

  it('navigates to Wardrobe section', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('nav-wardrobe'));
    expect(screen.getByTestId('wardrobe-section')).toBeInTheDocument();
  });

  it('navigates to StyleProfile section', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('nav-profile'));
    expect(screen.getByTestId('profile-section')).toBeInTheDocument();
  });

  it('navigates to OutfitIdeas section', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('nav-ideas'));
    expect(screen.getByTestId('ideas-section')).toBeInTheDocument();
  });

  it('navigates to OccasionStylist section', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('nav-occasion'));
    expect(screen.getByTestId('occasion-section')).toBeInTheDocument();
  });

  it('navigates to Recommendations section', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('nav-suggestions'));
    expect(screen.getByTestId('suggestions-section')).toBeInTheDocument();
  });

  it('navigates back to TodayPick', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('nav-wardrobe'));
    expect(screen.getByTestId('wardrobe-section')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('nav-today'));
    expect(screen.getByTestId('today-section')).toBeInTheDocument();
  });

  it('defaults to TodayPick for unknown sections', () => {
    render(<App />);
    expect(screen.getByTestId('today-section')).toBeInTheDocument();
  });
});
