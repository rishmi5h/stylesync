import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extractJSON, buildWardrobeSummary } from '../../services/groq.js';

describe('extractJSON', () => {
  it('parses a clean JSON object', () => {
    const input = '{"name": "outfit"}';
    expect(extractJSON(input)).toEqual({ name: 'outfit' });
  });

  it('parses a clean JSON array', () => {
    const input = '[{"id": 1}, {"id": 2}]';
    expect(extractJSON(input)).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it('strips markdown code fences and parses', () => {
    const input = '```json\n{"key": "value"}\n```';
    expect(extractJSON(input)).toEqual({ key: 'value' });
  });

  it('handles text before JSON', () => {
    const input = 'Here is the result:\n{"color": "red"}';
    expect(extractJSON(input)).toEqual({ color: 'red' });
  });

  it('handles nested brackets correctly', () => {
    const input = '{"items": [{"nested": {"deep": true}}]}';
    expect(extractJSON(input)).toEqual({ items: [{ nested: { deep: true } }] });
  });

  it('handles array with nested objects', () => {
    const input = '[{"outfit": {"top": "shirt"}, "items": [1, 2]}]';
    expect(extractJSON(input)).toEqual([{ outfit: { top: 'shirt' }, items: [1, 2] }]);
  });

  it('throws on text with no JSON', () => {
    expect(() => extractJSON('no json here')).toThrow('No JSON found in response');
  });

  it('throws on empty string', () => {
    expect(() => extractJSON('')).toThrow('No JSON found in response');
  });

  it('handles strings with escaped characters inside JSON', () => {
    const input = '{"desc": "a \\"red\\" shirt"}';
    expect(extractJSON(input)).toEqual({ desc: 'a "red" shirt' });
  });

  it('picks the first JSON when array comes before object', () => {
    const input = '[1, 2] and then {"extra": true}';
    expect(extractJSON(input)).toEqual([1, 2]);
  });

  it('picks the first JSON when object comes before array', () => {
    const input = '{"first": true} then [1, 2]';
    expect(extractJSON(input)).toEqual({ first: true });
  });
});

describe('buildWardrobeSummary', () => {
  const mockWardrobe = [
    {
      id: 'item-1',
      category: 'top',
      subcategory: 'crew-neck t-shirt',
      color: 'navy blue',
      pattern: 'solid',
      fabric_guess: 'cotton',
      formality: 'casual',
      season: 'all_season',
      weather_suitability: 'Good for AC offices',
      occasion_tags: ['daily_wear', 'college'],
      description: 'Navy cotton crew-neck tee',
      image: 'data:image/jpeg;base64,HUGELONG_BASE64_STRING',
      someExtraField: 'should be stripped',
    },
  ];

  it('strips image and base64 fields from items', () => {
    const summary = buildWardrobeSummary(mockWardrobe);
    expect(summary[0]).not.toHaveProperty('image');
    expect(summary[0]).not.toHaveProperty('someExtraField');
  });

  it('keeps all classification fields', () => {
    const summary = buildWardrobeSummary(mockWardrobe);
    expect(summary[0]).toEqual({
      id: 'item-1',
      category: 'top',
      subcategory: 'crew-neck t-shirt',
      color: 'navy blue',
      pattern: 'solid',
      fabric_guess: 'cotton',
      formality: 'casual',
      season: 'all_season',
      weather_suitability: 'Good for AC offices',
      occasion_tags: ['daily_wear', 'college'],
      description: 'Navy cotton crew-neck tee',
    });
  });

  it('handles empty wardrobe', () => {
    expect(buildWardrobeSummary([])).toEqual([]);
  });

  it('handles multiple items', () => {
    const wardrobe = [
      { id: '1', category: 'top', color: 'red', image: 'base64...' },
      { id: '2', category: 'bottom', color: 'blue', image: 'base64...' },
    ];
    const summary = buildWardrobeSummary(wardrobe);
    expect(summary).toHaveLength(2);
    expect(summary[0].id).toBe('1');
    expect(summary[1].id).toBe('2');
    expect(summary[0]).not.toHaveProperty('image');
    expect(summary[1]).not.toHaveProperty('image');
  });
});

describe('generateOutfitIdeas', () => {
  it('is exported as an async function', async () => {
    const { generateOutfitIdeas } = await import('../../services/groq.js');
    expect(typeof generateOutfitIdeas).toBe('function');
  });
});

describe('generateRecommendations', () => {
  it('is exported as an async function', async () => {
    const { generateRecommendations } = await import('../../services/groq.js');
    expect(typeof generateRecommendations).toBe('function');
  });
});
