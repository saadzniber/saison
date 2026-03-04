/**
 * diversity.test.ts
 *
 * Tests for the getWeekId utility, which is the core of the diversity-tracking
 * feature.  The function is exported from types/index.ts and is used by the
 * weekly diversity service to bucket produce counts into ISO-week slots.
 */
import { describe, it, expect } from 'vitest';
import { getWeekId } from '@/types/index';

describe('getWeekId — diversity week bucketing', () => {
  it('returns the correct week id for a well-known Monday (2024-W02)', () => {
    // 2024-01-08 is the Monday of week 2 in 2024
    expect(getWeekId(new Date('2024-01-08'))).toBe('2024-W02');
  });

  it('returns the correct week id for the same Sunday (2024-W02)', () => {
    // 2024-01-14 is the Sunday of the same week
    expect(getWeekId(new Date('2024-01-14'))).toBe('2024-W02');
  });

  it('returns the correct week id for mid-year (2024-W26)', () => {
    // 2024-06-24 is a Monday in week 26
    expect(getWeekId(new Date('2024-06-24'))).toBe('2024-W26');
  });

  it('returns the correct week id for the last week of 2023 (2023-W52)', () => {
    // 2023-12-25 (Christmas) falls in week 52 of 2023
    expect(getWeekId(new Date('2023-12-25'))).toBe('2023-W52');
  });

  it('returns the correct week id for the first ISO week of 2026 (2026-W01)', () => {
    // 2026-01-01 is a Thursday; ISO week 1 of 2026 starts on 2025-12-29
    // So 2026-01-01 belongs to 2026-W01
    expect(getWeekId(new Date('2026-01-01'))).toBe('2026-W01');
  });

  it('all days within the same ISO week return identical week ids', () => {
    // Week 10 of 2025: Monday 2025-03-03 to Sunday 2025-03-09
    const days = [
      '2025-03-03',
      '2025-03-04',
      '2025-03-05',
      '2025-03-06',
      '2025-03-07',
      '2025-03-08',
      '2025-03-09',
    ];
    const weekIds = days.map((d) => getWeekId(new Date(d)));
    // All 7 should be the same
    const unique = new Set(weekIds);
    expect(unique.size).toBe(1);
    expect(weekIds[0]).toBe('2025-W10');
  });

  it('adjacent weeks produce different week ids', () => {
    const weekA = getWeekId(new Date('2025-03-03')); // W10
    const weekB = getWeekId(new Date('2025-03-10')); // W11
    expect(weekA).not.toBe(weekB);
    expect(weekA).toBe('2025-W10');
    expect(weekB).toBe('2025-W11');
  });

  it('formats single-digit week numbers with a leading zero', () => {
    // 2024-01-01 is in week 1 of 2024
    const result = getWeekId(new Date('2024-01-01'));
    const weekPart = result.split('-W')[1];
    expect(weekPart).toHaveLength(2);
    expect(weekPart).toBe('01');
  });

  it('returns a string that starts with a 4-digit year', () => {
    const result = getWeekId(new Date('2026-03-03'));
    expect(result.slice(0, 4)).toBe('2026');
  });

  it('produces the same result regardless of the time portion of the date', () => {
    const morning = getWeekId(new Date('2025-06-16T08:00:00'));
    const evening = getWeekId(new Date('2025-06-16T22:59:59'));
    expect(morning).toBe(evening);
  });

  it('uses current date when called with no arguments and returns valid format', () => {
    const result = getWeekId();
    expect(result).toMatch(/^\d{4}-W\d{2}$/);
  });
});
