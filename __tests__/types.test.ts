import { describe, it, expect } from 'vitest';
import { getWeekId, getWeekDates, getProduceName } from '@/types/index';
import type { Produce } from '@/types/index';

describe('getWeekId', () => {
  it('returns a string in YYYY-WNN format', () => {
    const result = getWeekId(new Date('2024-01-15'));
    expect(result).toMatch(/^\d{4}-W\d{2}$/);
  });

  it('returns the correct ISO week for a known Monday', () => {
    // 2024-01-08 is Monday of week 2 of 2024
    const result = getWeekId(new Date('2024-01-08'));
    expect(result).toBe('2024-W02');
  });

  it('returns the correct ISO week for a known Sunday', () => {
    // 2024-01-14 is Sunday, still belongs to week 2 of 2024
    const result = getWeekId(new Date('2024-01-14'));
    expect(result).toBe('2024-W02');
  });

  it('returns the correct week for the first week of 2026', () => {
    // 2026-01-05 is Monday of week 2 of 2026
    const result = getWeekId(new Date('2026-01-05'));
    expect(result).toBe('2026-W02');
  });

  it('week number is zero-padded to two digits', () => {
    // Week 1 of 2024 starts on 2024-01-01
    const result = getWeekId(new Date('2024-01-01'));
    expect(result).toMatch(/-W\d{2}$/);
    const weekPart = result.split('-W')[1];
    expect(weekPart.length).toBe(2);
  });

  it('uses current date when no argument is provided', () => {
    const result = getWeekId();
    expect(result).toMatch(/^\d{4}-W\d{2}$/);
  });

  it('returns the same week id for dates within the same ISO week', () => {
    // 2024-03-11 (Monday) and 2024-03-17 (Sunday) are in the same week
    const monday = getWeekId(new Date('2024-03-11'));
    const sunday = getWeekId(new Date('2024-03-17'));
    expect(monday).toBe(sunday);
  });
});

describe('getWeekDates', () => {
  it('returns exactly 7 dates', () => {
    const dates = getWeekDates(0);
    expect(dates).toHaveLength(7);
  });

  it('each entry has label, short, date, and isToday fields', () => {
    const dates = getWeekDates(0);
    for (const entry of dates) {
      expect(entry).toHaveProperty('label');
      expect(entry).toHaveProperty('short');
      expect(entry).toHaveProperty('date');
      expect(entry).toHaveProperty('isToday');
    }
  });

  it('date strings are in YYYY-MM-DD format', () => {
    const dates = getWeekDates(0);
    for (const entry of dates) {
      expect(entry.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('labels follow Monday-to-Sunday order', () => {
    const dates = getWeekDates(0);
    const expectedLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const expectedShorts = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    dates.forEach((entry, i) => {
      expect(entry.label).toBe(expectedLabels[i]);
      expect(entry.short).toBe(expectedShorts[i]);
    });
  });

  it('exactly one date has isToday = true (or zero if today is not in range)', () => {
    const dates = getWeekDates(0);
    const todayCount = dates.filter((d) => d.isToday).length;
    // Current week always contains today, so exactly one should be true
    expect(todayCount).toBe(1);
  });

  it('no date has isToday = true for the next week (offset = 1)', () => {
    const dates = getWeekDates(1);
    // The next week does not contain today, so none should match
    // (unless today happens to be in next week, which can't be by definition)
    const todayCount = dates.filter((d) => d.isToday).length;
    expect(todayCount).toBe(0);
  });

  it('dates are consecutive (each day is one day after the previous)', () => {
    const dates = getWeekDates(0);
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1].date).getTime();
      const curr = new Date(dates[i].date).getTime();
      expect(curr - prev).toBe(86400000); // one day in ms
    }
  });

  it('week offset 0 and week offset 1 produce different date sets', () => {
    const thisWeek = getWeekDates(0).map((d) => d.date);
    const nextWeek = getWeekDates(1).map((d) => d.date);
    expect(thisWeek).not.toEqual(nextWeek);
  });
});

describe('getProduceName', () => {
  const produceBilingual: Produce = {
    id: 'tomato',
    name: { en: 'Tomato', fr: 'Tomate' },
    emoji: '🍅',
    type: 'vegetable',
    seasons: ['summer'],
  };

  const produceStringName: Produce = {
    id: 'basil',
    name: 'Basil',
    emoji: '🌿',
    type: 'herb',
    seasons: ['summer'],
  };

  it('returns the English name when locale is "en"', () => {
    expect(getProduceName(produceBilingual, 'en')).toBe('Tomato');
  });

  it('returns the French name when locale is "fr"', () => {
    expect(getProduceName(produceBilingual, 'fr')).toBe('Tomate');
  });

  it('returns the string name directly when name is a plain string', () => {
    expect(getProduceName(produceStringName, 'en')).toBe('Basil');
    expect(getProduceName(produceStringName, 'fr')).toBe('Basil');
  });

  it('falls back to the English name for an unknown locale', () => {
    // The function returns .en for anything that is not 'fr'
    expect(getProduceName(produceBilingual, 'de')).toBe('Tomato');
  });

  it('handles produce with different en/fr names correctly', () => {
    const asparagus: Produce = {
      id: 'asparagus',
      name: { en: 'Asparagus', fr: 'Asperge' },
      emoji: '🌱',
      type: 'vegetable',
      seasons: ['spring'],
    };
    expect(getProduceName(asparagus, 'en')).toBe('Asparagus');
    expect(getProduceName(asparagus, 'fr')).toBe('Asperge');
  });
});
