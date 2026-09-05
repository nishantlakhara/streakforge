import { DailyRecord, UserProfile } from '../types';

const PROFILES_KEY = 'parth-skating-planner-profiles-v2';
const ACTIVE_PROFILE_KEY = 'parth-skating-planner-active-id-v2';
const LEGACY_DATA_KEY = 'parth-skating-planner-v1';

export class StorageService {
  // Profiles Management
  static getProfiles(): UserProfile[] {
    const data = localStorage.getItem(PROFILES_KEY);
    if (!data) {
        // If no profiles, check if legacy data exists to create "Parth"
        const legacyData = localStorage.getItem(LEGACY_DATA_KEY);
        if (legacyData) {
            const parth: UserProfile = { 
                id: 'parth-legacy', 
                name: 'Parth', 
                createdAt: new Date().toISOString(),
                templates: [],
                schedule: {},
                library: { routines: [], mealPlans: [], drillSets: [] }
            };
            this.saveProfiles([parth]);
            // Migrate legacy data to new key
            localStorage.setItem(`skate-data-parth-legacy`, legacyData);
            return [parth];
        }
        return [];
    }
    const profiles: UserProfile[] = JSON.parse(data);
    // Ensure new fields exist for backward compatibility
    return profiles.map(p => ({
        ...p,
        templates: p.templates || [],
        schedule: p.schedule || {},
        library: p.library || { routines: [], mealPlans: [], drillSets: [] }
    }));
  }

  static saveProfiles(profiles: UserProfile[]): void {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  }

  static getActiveProfileId(): string | null {
    return localStorage.getItem(ACTIVE_PROFILE_KEY);
  }

  static setActiveProfileId(id: string): void {
    localStorage.setItem(ACTIVE_PROFILE_KEY, id);
  }

  // Data Management per Profile
  private static getStoredData(profileId: string): Record<string, DailyRecord> {
    const data = localStorage.getItem(`skate-data-${profileId}`);
    if (!data) return {};
    try {
      const records: Record<string, DailyRecord> = JSON.parse(data);
      // Ensure all records have a 'type' and 'drills' for backward compatibility
      Object.keys(records).forEach(date => {
        if (records[date]) {
          if (!records[date].type) {
            records[date].type = 'training';
          }
          if (!records[date].drills) {
            records[date].drills = [];
          }
        }
      });
      return records;
    } catch (e) {
      return {};
    }
  }

  static async getRecord(profileId: string, date: string): Promise<DailyRecord | null> {
    const data = this.getStoredData(profileId);
    return data[date] || null;
  }

  static async saveRecord(profileId: string, record: DailyRecord): Promise<void> {
    const data = this.getStoredData(profileId);
    data[record.date] = record;
    localStorage.setItem(`skate-data-${profileId}`, JSON.stringify(data));
  }

  static async getAllRecords(profileId: string): Promise<Record<string, DailyRecord>> {
    return this.getStoredData(profileId);
  }

  static async exportData(profileId: string): Promise<string> {
    return JSON.stringify(this.getStoredData(profileId), null, 2);
  }

  static async importData(profileId: string, json: string): Promise<void> {
    try {
      const data = JSON.parse(json);
      localStorage.setItem(`skate-data-${profileId}`, JSON.stringify(data));
    } catch (e) {
      throw new Error('Invalid JSON format');
    }
  }
}
