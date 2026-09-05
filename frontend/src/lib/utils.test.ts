import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { cn } from './utils.ts';

describe('cn utility', () => {
  it('combines basic class strings', () => {
    assert.equal(cn('px-4', 'py-2'), 'px-4 py-2');
  });

  it('handles conditional classes', () => {
    const isActive = true;
    const isDisabled = false;
    assert.equal(cn('base', isActive && 'active', isDisabled && 'disabled'), 'base active');
  });

  it('merges tailwind conflicting classes correctly', () => {
    assert.equal(cn('px-2 py-1', 'px-4'), 'py-1 px-4');
    assert.equal(cn('bg-red-500', 'bg-blue-500'), 'bg-blue-500');
  });
});
