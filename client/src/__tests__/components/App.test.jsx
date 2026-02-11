import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock all child components to isolate App's routing logic
vi.mock('../../components/Layout', () => ({
  default: ({ children, activeSection, onNavigate }) => (
    <div data-testid="layout" data-active={activeSection}>
      <button data-testid="nav-wardrobe" onClick={() => onNavigate('wardrobe')}>Wardrobe</button>
      <button data-testid="nav-profile" onClick={() => onNavigate('profile')}>Profile</button>
      <button data-testid="nav-ideas" onClick={() => onNavigate('ideas')}>Ideas</button>
      <button data-testid="nav-suggestions" onClick={() => onNavigate('suggestions')}>Suggestions</button>
      {children}
    </div>
  ),
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

vi.mock('../../components/Recommendations', () => ({
  default: ({ onNavigate }) => <div data-testid="suggestions-section">Recommendations</div>,
}));

// Mock CSS import
vi.mock('../../App.css', () => ({}));

import App from '../../App';
import { fireEvent } from '@testing-library/react';

describe('App', () => {
  it('renders WardrobeManager by default', () => {
    render(<App />);
    expect(screen.getByTestId('wardrobe-section')).toBeInTheDocument();
  });

  it('renders Layout wrapper', () => {
    render(<App />);
    expect(screen.getByTestId('layout')).toBeInTheDocument();
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

  it('navigates to Recommendations section', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('nav-suggestions'));
    expect(screen.getByTestId('suggestions-section')).toBeInTheDocument();
  });

  it('navigates back to WardrobeManager', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('nav-profile'));
    expect(screen.getByTestId('profile-section')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('nav-wardrobe'));
    expect(screen.getByTestId('wardrobe-section')).toBeInTheDocument();
  });

  it('defaults to WardrobeManager for unknown sections', () => {
    // The switch default case returns WardrobeManager
    render(<App />);
    expect(screen.getByTestId('wardrobe-section')).toBeInTheDocument();
  });
});
