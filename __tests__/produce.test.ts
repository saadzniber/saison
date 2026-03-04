import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Firebase before importing produce service
vi.mock('@/lib/firebase', () => ({
  getDb: vi.fn(() => ({})),
  getFirebaseAuth: vi.fn(() => ({})),
  googleProvider: {},
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  getDocs: vi.fn(() => Promise.reject(new Error('Firestore unavailable'))),
  query: vi.fn(),
  where: vi.fn(),
}));

import { PRODUCE_CATALOGUE, fetchProduceBySeason } from '@/services/produce';
import type { Season } from '@/types/index';

describe('PRODUCE_CATALOGUE', () => {
  const allSeasons: Season[] = ['spring', 'summer', 'autumn', 'winter'];

  it('contains items for all 4 seasons', () => {
    for (const season of allSeasons) {
      const items = PRODUCE_CATALOGUE.filter((p) => p.seasons.includes(season));
      expect(items.length).toBeGreaterThan(0);
    }
  });

  it('every item has an id', () => {
    for (const item of PRODUCE_CATALOGUE) {
      expect(typeof item.id).toBe('string');
      expect(item.id.length).toBeGreaterThan(0);
    }
  });

  it('every item has a name with en and fr fields (or is a plain string)', () => {
    for (const item of PRODUCE_CATALOGUE) {
      if (typeof item.name === 'string') {
        expect(item.name.length).toBeGreaterThan(0);
      } else {
        expect(typeof item.name.en).toBe('string');
        expect(typeof item.name.fr).toBe('string');
        expect(item.name.en.length).toBeGreaterThan(0);
        expect(item.name.fr.length).toBeGreaterThan(0);
      }
    }
  });

  it('every item has an emoji', () => {
    for (const item of PRODUCE_CATALOGUE) {
      expect(typeof item.emoji).toBe('string');
      expect(item.emoji.length).toBeGreaterThan(0);
    }
  });

  it('every item has a non-empty seasons array', () => {
    for (const item of PRODUCE_CATALOGUE) {
      expect(Array.isArray(item.seasons)).toBe(true);
      expect(item.seasons.length).toBeGreaterThan(0);
    }
  });

  it('every item has a valid type field', () => {
    const validTypes = ['vegetable', 'fruit', 'herb', 'grain', 'legume', 'nut'];
    for (const item of PRODUCE_CATALOGUE) {
      expect(validTypes).toContain(item.type);
    }
  });

  it('all item ids are unique', () => {
    const ids = PRODUCE_CATALOGUE.map((p) => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('has spring produce including asparagus and peas', () => {
    const springItems = PRODUCE_CATALOGUE.filter((p) => p.seasons.includes('spring'));
    const ids = springItems.map((p) => p.id);
    expect(ids).toContain('asparagus');
    expect(ids).toContain('pea');
  });

  it('has summer produce including tomato and zucchini', () => {
    const summerItems = PRODUCE_CATALOGUE.filter((p) => p.seasons.includes('summer'));
    const ids = summerItems.map((p) => p.id);
    expect(ids).toContain('tomato');
    expect(ids).toContain('zucchini');
  });

  it('has autumn produce including pumpkin and apple', () => {
    const autumnItems = PRODUCE_CATALOGUE.filter((p) => p.seasons.includes('autumn'));
    const ids = autumnItems.map((p) => p.id);
    expect(ids).toContain('pumpkin');
    expect(ids).toContain('apple');
  });

  it('has winter produce including orange and kale', () => {
    const winterItems = PRODUCE_CATALOGUE.filter((p) => p.seasons.includes('winter'));
    const ids = winterItems.map((p) => p.id);
    expect(ids).toContain('orange');
    expect(ids).toContain('kale');
  });
});

describe('fetchProduceBySeason (Firestore fallback)', () => {
  it('falls back to PRODUCE_CATALOGUE for spring when Firestore throws', async () => {
    const result = await fetchProduceBySeason('spring');
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    // Every result must have spring in its seasons
    for (const item of result) {
      expect(item.seasons).toContain('spring');
    }
  });

  it('falls back to PRODUCE_CATALOGUE for summer when Firestore throws', async () => {
    const result = await fetchProduceBySeason('summer');
    expect(result.length).toBeGreaterThan(0);
    for (const item of result) {
      expect(item.seasons).toContain('summer');
    }
  });

  it('falls back to PRODUCE_CATALOGUE for autumn when Firestore throws', async () => {
    const result = await fetchProduceBySeason('autumn');
    expect(result.length).toBeGreaterThan(0);
    for (const item of result) {
      expect(item.seasons).toContain('autumn');
    }
  });

  it('falls back to PRODUCE_CATALOGUE for winter when Firestore throws', async () => {
    const result = await fetchProduceBySeason('winter');
    expect(result.length).toBeGreaterThan(0);
    for (const item of result) {
      expect(item.seasons).toContain('winter');
    }
  });

  it('does not include items from other seasons in the spring result', async () => {
    const result = await fetchProduceBySeason('spring');
    // tomato is summer-only — must not appear
    const tomatoInResult = result.find((p) => p.id === 'tomato');
    expect(tomatoInResult).toBeUndefined();
  });

  it('normalises the season string to lowercase before filtering', async () => {
    // 'Summer' (capital S) should work the same as 'summer'
    const result = await fetchProduceBySeason('Summer');
    expect(result.length).toBeGreaterThan(0);
    for (const item of result) {
      expect(item.seasons).toContain('summer');
    }
  });
});
