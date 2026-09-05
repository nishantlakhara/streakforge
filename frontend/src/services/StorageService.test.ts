import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { StorageService } from './StorageService.ts';
import { UserProfile, DailyRecord } from '../types/index.ts';

// Mock localStorage
const store: Record<string, string> = {};
globalThis.localStorage = {
  getItem: (key: string) => (key in store ? store[key] : null),
  setItem: (key: string, value: string) => {
    store[key] = String(value);
  },
  removeItem: (key: string) => {
    delete store[key];
  },
  clear: () => {
    for (const k in store) delete store[k];
  },
  length: 0,
  key: () => null,
};

describe('StorageService', () => {
  beforeEach(() => {
    globalThis.localStorage.clear();
  });

  it('saves and retrieves user profiles', () => {
    const testProfile: UserProfile = {
      id: 'profile-1',
      name: 'Champion Skater',
      createdAt: '2026-09-05T00:00:00.000Z',
      templates: [],
      schedule: {},
      library: { routines: [], mealPlans: [], drillSets: [] },
    };

    StorageService.saveProfiles([testProfile]);
    const profiles = StorageService.getProfiles();

    assert.equal(profiles.length, 1);
    assert.equal(profiles[0].name, 'Champion Skater');
    assert.equal(profiles[0].id, 'profile-1');
  });

  it('sets and gets active profile id', () => {
    StorageService.setActiveProfileId('profile-99');
    assert.equal(StorageService.getActiveProfileId(), 'profile-99');
  });

  it('saves and retrieves daily records for a profile', async () => {
    const record: DailyRecord = {
      date: '2026-09-05',
      type: 'training',
      tasks: [{ id: 't1', label: 'Stretch', completed: true, category: 'morning' }],
      nutrition: [{ id: 'n1', label: 'Oatmeal', completed: true, category: 'breakfast' }],
      drills: [{ label: 'Laps', completed: false }],
      hydration: { glasses: 8 },
      sleep: { bedTime: '22:00', wakeTime: '06:30', hours: 8.5, score: 'excellent' },
      notes: 'Strong training day',
    };

    await StorageService.saveRecord('profile-1', record);
    const fetched = await StorageService.getRecord('profile-1', '2026-09-05');

    assert.ok(fetched);
    assert.equal(fetched!.date, '2026-09-05');
    assert.equal(fetched!.hydration.glasses, 8);
    assert.equal(fetched!.sleep.score, 'excellent');
    assert.equal(fetched!.tasks[0].completed, true);
  });
});
