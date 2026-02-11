import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ItemCard from '../../components/ItemCard';

const mockItem = {
  id: 'item-1',
  category: 'top',
  subcategory: 'crew-neck t-shirt',
  color: 'navy blue',
  pattern: 'solid',
  fabric_guess: 'pure cotton',
  formality: 'casual',
  season: 'all_season',
  weather_suitability: 'Good for AC offices',
  occasion_tags: ['daily_wear', 'college', 'casual_outing'],
  description: 'Navy blue cotton crew-neck tee',
  care_tip: 'Machine wash cold',
  versatility: 4,
  image: 'data:image/png;base64,fakeimage',
};

describe('ItemCard', () => {
  describe('full mode (default)', () => {
    it('renders item subcategory and category', () => {
      render(<ItemCard item={mockItem} />);
      expect(screen.getByText('crew-neck t-shirt')).toBeInTheDocument();
      expect(screen.getByText('Top')).toBeInTheDocument();
    });

    it('renders color and pattern badges', () => {
      render(<ItemCard item={mockItem} />);
      expect(screen.getByText('navy blue')).toBeInTheDocument();
      expect(screen.getByText('solid')).toBeInTheDocument();
    });

    it('renders fabric badge', () => {
      render(<ItemCard item={mockItem} />);
      expect(screen.getByText('pure cotton')).toBeInTheDocument();
    });

    it('renders formality badge', () => {
      render(<ItemCard item={mockItem} />);
      expect(screen.getByText('casual')).toBeInTheDocument();
    });

    it('renders weather suitability', () => {
      render(<ItemCard item={mockItem} />);
      expect(screen.getByText('Good for AC offices')).toBeInTheDocument();
    });

    it('renders occasion tags (max 4)', () => {
      render(<ItemCard item={mockItem} />);
      expect(screen.getByText('daily wear')).toBeInTheDocument();
      expect(screen.getByText('college')).toBeInTheDocument();
      expect(screen.getByText('casual outing')).toBeInTheDocument();
    });

    it('renders description', () => {
      render(<ItemCard item={mockItem} />);
      expect(screen.getByText('Navy blue cotton crew-neck tee')).toBeInTheDocument();
    });

    it('renders care tip', () => {
      render(<ItemCard item={mockItem} />);
      expect(screen.getByText('Machine wash cold')).toBeInTheDocument();
    });

    it('renders versatility dots', () => {
      render(<ItemCard item={mockItem} />);
      expect(screen.getByText('Versatility:')).toBeInTheDocument();
    });

    it('renders image with correct alt text', () => {
      render(<ItemCard item={mockItem} />);
      const img = screen.getByAltText('Navy blue cotton crew-neck tee');
      expect(img).toBeInTheDocument();
      expect(img.src).toContain('fakeimage');
    });

    it('renders season icon', () => {
      render(<ItemCard item={mockItem} />);
      // all_season maps to 🌍
      expect(screen.getByText('🌍')).toBeInTheDocument();
    });
  });

  describe('compact mode', () => {
    it('renders compact view with subcategory and color', () => {
      render(<ItemCard item={mockItem} compact />);
      expect(screen.getByText('crew-neck t-shirt')).toBeInTheDocument();
      expect(screen.getByText('navy blue')).toBeInTheDocument();
    });

    it('does not render full card details in compact mode', () => {
      render(<ItemCard item={mockItem} compact />);
      expect(screen.queryByText('Versatility:')).not.toBeInTheDocument();
      expect(screen.queryByText('Good for AC offices')).not.toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('calls onDelete with item ID when delete clicked', () => {
      const onDelete = vi.fn();
      render(<ItemCard item={mockItem} onDelete={onDelete} />);

      fireEvent.click(screen.getByText('Delete'));
      expect(onDelete).toHaveBeenCalledWith('item-1');
    });

    it('calls onEdit with item when edit clicked', () => {
      const onEdit = vi.fn();
      render(<ItemCard item={mockItem} onEdit={onEdit} />);

      fireEvent.click(screen.getByText('Edit'));
      expect(onEdit).toHaveBeenCalledWith(mockItem);
    });

    it('does not render edit button when onEdit not provided', () => {
      render(<ItemCard item={mockItem} />);
      expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    });

    it('does not render delete button when onDelete not provided', () => {
      render(<ItemCard item={mockItem} />);
      expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('renders without image', () => {
      const itemNoImage = { ...mockItem, image: undefined };
      render(<ItemCard item={itemNoImage} />);
      expect(screen.getByText('crew-neck t-shirt')).toBeInTheDocument();
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('falls back to category when subcategory is missing', () => {
      const itemNoSub = { ...mockItem, subcategory: undefined };
      render(<ItemCard item={itemNoSub} />);
      expect(screen.getByText('top')).toBeInTheDocument();
    });

    it('shows +N for more than 4 occasion tags', () => {
      const itemManyTags = {
        ...mockItem,
        occasion_tags: ['daily_wear', 'office', 'college', 'date_night', 'party', 'wedding_guest'],
      };
      render(<ItemCard item={itemManyTags} />);
      expect(screen.getByText('+2')).toBeInTheDocument();
    });

    it('renders without occasion tags', () => {
      const itemNoTags = { ...mockItem, occasion_tags: undefined };
      render(<ItemCard item={itemNoTags} />);
      expect(screen.getByText('crew-neck t-shirt')).toBeInTheDocument();
    });
  });
});
