import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getWardrobe,
  saveWardrobe,
  addWardrobeItem,
  removeWardrobeItem,
  updateWardrobeItem,
  getProfile,
  saveProfile,
  getOutfitPlan,
  saveOutfitPlan,
} from '../../utils/storage.js';

describe('storage utils', () => {
  beforeEach(() => {
    localStorage.clear();
    // Mock crypto.randomUUID
    vi.stubGlobal('crypto', {
      randomUUID: vi.fn(() => 'mock-uuid-1234'),
    });
  });

  describe('getWardrobe / saveWardrobe', () => {
    it('returns empty array when nothing stored', () => {
      expect(getWardrobe()).toEqual([]);
    });

    it('returns parsed items from localStorage', () => {
      const items = [{ id: '1', category: 'top' }, { id: '2', category: 'bottom' }];
      localStorage.setItem('stylesync_wardrobe', JSON.stringify(items));
      expect(getWardrobe()).toEqual(items);
    });

    it('saves and retrieves wardrobe items', () => {
      const items = [{ id: 'a', color: 'red' }];
      saveWardrobe(items);
      expect(getWardrobe()).toEqual(items);
    });

    it('handles corrupted JSON gracefully', () => {
      localStorage.setItem('stylesync_wardrobe', '{corrupted json!!');
      expect(getWardrobe()).toEqual([]);
    });
  });

  describe('addWardrobeItem', () => {
    it('generates UUID and appends item', () => {
      const item = { category: 'top', color: 'navy' };
      const result = addWardrobeItem(item);

      expect(result).toEqual({ ...item, id: 'mock-uuid-1234' });
      expect(getWardrobe()).toHaveLength(1);
      expect(getWardrobe()[0].id).toBe('mock-uuid-1234');
    });

    it('appends to existing items', () => {
      saveWardrobe([{ id: 'existing', category: 'bottom' }]);
      addWardrobeItem({ category: 'top', color: 'red' });

      const wardrobe = getWardrobe();
      expect(wardrobe).toHaveLength(2);
      expect(wardrobe[0].id).toBe('existing');
      expect(wardrobe[1].id).toBe('mock-uuid-1234');
    });
  });

  describe('removeWardrobeItem', () => {
    it('removes item by ID', () => {
      saveWardrobe([
        { id: 'keep', category: 'top' },
        { id: 'remove', category: 'bottom' },
      ]);

      const result = removeWardrobeItem('remove');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('keep');
      expect(getWardrobe()).toHaveLength(1);
    });

    it('returns all items when ID not found', () => {
      saveWardrobe([{ id: '1', category: 'top' }]);
      const result = removeWardrobeItem('nonexistent');
      expect(result).toHaveLength(1);
    });
  });

  describe('updateWardrobeItem', () => {
    it('merges updates into existing item', () => {
      saveWardrobe([{ id: '1', category: 'top', color: 'red' }]);

      const result = updateWardrobeItem('1', { color: 'blue' });
      expect(result).toEqual({ id: '1', category: 'top', color: 'blue' });
      expect(getWardrobe()[0].color).toBe('blue');
    });

    it('returns null when item not found', () => {
      saveWardrobe([{ id: '1', category: 'top' }]);
      const result = updateWardrobeItem('nonexistent', { color: 'blue' });
      expect(result).toBeNull();
    });

    it('preserves other items', () => {
      saveWardrobe([
        { id: '1', color: 'red' },
        { id: '2', color: 'blue' },
      ]);

      updateWardrobeItem('1', { color: 'green' });
      const wardrobe = getWardrobe();
      expect(wardrobe[0].color).toBe('green');
      expect(wardrobe[1].color).toBe('blue');
    });
  });

  describe('getProfile / saveProfile', () => {
    it('returns null when nothing stored', () => {
      expect(getProfile()).toBeNull();
    });

    it('round-trips profile data', () => {
      const profile = { gender: 'male', style: 'casual', location: 'Mumbai' };
      saveProfile(profile);
      expect(getProfile()).toEqual(profile);
    });

    it('handles corrupted profile JSON gracefully', () => {
      localStorage.setItem('stylesync_profile', 'not json');
      expect(getProfile()).toBeNull();
    });
  });

  describe('getOutfitPlan / saveOutfitPlan', () => {
    it('returns null when nothing stored', () => {
      expect(getOutfitPlan()).toBeNull();
    });

    it('round-trips outfit plan data', () => {
      const plan = [
        { outfit_name: 'Monday Look', vibe: 'office_ready' },
      ];
      saveOutfitPlan(plan);
      expect(getOutfitPlan()).toEqual(plan);
    });

    it('handles corrupted outfit JSON gracefully', () => {
      localStorage.setItem('stylesync_outfits', '{bad');
      expect(getOutfitPlan()).toBeNull();
    });
  });
});
