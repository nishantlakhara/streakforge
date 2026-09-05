import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getTodayStr, formatDateStr, getWeekNumber, isFutureDate, getMonthDays } from './dateUtils.ts';

describe('dateUtils', () => {
  it('getTodayStr returns date in YYYY-MM-DD format', () => {
    const today = getTodayStr();
    assert.match(today, /^\d{4}-\d{2}-\d{2}$/);
  });

  it('formatDateStr formats arbitrary date to YYYY-MM-DD', () => {
    const d = new Date(2026, 8, 5); // Sept 5, 2026
    const formatted = formatDateStr(d);
    assert.equal(formatted, '2026-09-05');
  });

  it('getWeekNumber maps calendar day of month to week buckets', () => {
    assert.equal(getWeekNumber(new Date(2026, 8, 1)), 1);
    assert.equal(getWeekNumber(new Date(2026, 8, 7)), 1);
    assert.equal(getWeekNumber(new Date(2026, 8, 8)), 2);
    assert.equal(getWeekNumber(new Date(2026, 8, 14)), 2);
    assert.equal(getWeekNumber(new Date(2026, 8, 15)), 3);
    assert.equal(getWeekNumber(new Date(2026, 8, 21)), 3);
    assert.equal(getWeekNumber(new Date(2026, 8, 22)), 4);
    assert.equal(getWeekNumber(new Date(2026, 8, 30)), 4);
  });

  it('isFutureDate correctly determines future dates', () => {
    const past = '2020-01-01';
    const future = '2099-12-31';
    assert.equal(isFutureDate(past), false);
    assert.equal(isFutureDate(future), true);
  });

  it('getMonthDays returns correct number of days for month', () => {
    const feb2024 = new Date(2024, 1, 1); // Leap year Feb 2024
    const daysFeb = getMonthDays(feb2024);
    assert.equal(daysFeb.length, 29);

    const sept2026 = new Date(2026, 8, 1); // Sept 2026 has 30 days
    const daysSept = getMonthDays(sept2026);
    assert.equal(daysSept.length, 30);
  });
});
