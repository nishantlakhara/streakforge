import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
    DailyRecord, UserProfile, DailyTemplate,
    RoutineSnippet, MealPlanSnippet, DrillSetSnippet
} from '../types';
import {
    apiListProfiles, apiCreateProfile, apiDeleteProfile,
    apiListTemplates, apiSaveTemplate, apiDeleteTemplate,
    apiGetSchedule, apiAssignSchedule,
    apiGetAllRecords, apiSaveRecord,
    apiListSnippets, apiSaveSnippet, apiDeleteSnippet,
    ApiSnippet,
} from '../services/ApiService';
import { DEFAULT_TASKS, DEFAULT_NUTRITION } from '../constants';
import { isFutureDate } from '../utils/dateUtils';

const ACTIVE_PROFILE_KEY = 'sf-active-profile-id';

interface PlannerContextType {
  records: Record<string, DailyRecord>;
  profiles: UserProfile[];
  activeProfile: UserProfile | null;
  loading: boolean;
  getRecord: (date: string) => DailyRecord;
  updateRecord: (record: DailyRecord) => Promise<void>;
  toggleItem: (date: string, category: 'tasks' | 'nutrition', id: string) => void;
  toggleDrill: (date: string, index: number) => void;
  updateHydration: (date: string, glasses: number) => void;
  updateSleep: (date: string, field: string, value: any) => void;
  calculateRecordCompletion: (record: DailyRecord) => number;
  getStats: () => {
    currentStreak: number;
    longestStreak: number;
    monthlyCompletion: number;
    perfectDays: number;
  };
  exportData: () => Promise<string>;
  importData: (json: string) => Promise<void>;
  addProfile: (name: string) => void;
  switchProfile: (id: string) => void;
  deleteProfile: (id: string) => void;
  saveTemplate: (template: DailyTemplate) => void;
  deleteTemplate: (id: string) => void;
  assignTemplateToDates: (templateId: string, dates: string[]) => void;
  saveToLibrary: (type: 'routines' | 'mealPlans' | 'drillSets', snippet: any) => void;
  deleteFromLibrary: (type: 'routines' | 'mealPlans' | 'drillSets', id: string) => void;
}

const PlannerContext = createContext<PlannerContextType | undefined>(undefined);

// ── Helpers to map API snippet data back to typed snippet objects ─────────────
function snippetToRoutine(s: ApiSnippet): RoutineSnippet {
    return { id: s.id, name: s.name, tasks: (s.data as any).tasks || [] };
}
function snippetToMealPlan(s: ApiSnippet): MealPlanSnippet {
    return { id: s.id, name: s.name, nutrition: (s.data as any).nutrition || [] };
}
function snippetToDrillSet(s: ApiSnippet): DrillSetSnippet {
    return { id: s.id, name: s.name, drills: (s.data as any).drills || [] };
}

export const PlannerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [profiles, setProfiles] = useState<UserProfile[]>([]);
    const [activeProfile, setActiveProfile] = useState<UserProfile | null>(null);
    const [records, setRecords] = useState<Record<string, DailyRecord>>({});
    const [loading, setLoading] = useState(true);

    const calculateRecordCompletion = useCallback((record: DailyRecord) => {
        const tasks = record.tasks || [];
        const nutrition = record.nutrition || [];
        const drills = record.drills || [];
        const totalItems = tasks.length + nutrition.length + drills.length;
        if (totalItems === 0) {
            return (record.type === 'sick' || record.type === 'rest') ? 100 : 0;
        }
        const completedItems =
            tasks.filter(t => t.completed).length +
            nutrition.filter(n => n.completed).length +
            drills.filter(d => d.completed).length;
        return (completedItems / totalItems) * 100;
    }, []);

    const formatDate = useCallback((date: Date) => {
        const d = new Date(date);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        return d.toISOString().split('T')[0];
    }, []);

    // ── Load all data for a profile from the API ──────────────────────────────
    const loadProfileData = useCallback(async (profileId: string): Promise<Partial<UserProfile>> => {
        const [templates, schedule, routines, mealPlans, drillSets] = await Promise.all([
            apiListTemplates(profileId),
            apiGetSchedule(profileId),
            apiListSnippets(profileId, 'routines'),
            apiListSnippets(profileId, 'mealPlans'),
            apiListSnippets(profileId, 'drillSets'),
        ]);
        return {
            templates: templates as unknown as DailyTemplate[],
            schedule,
            library: {
                routines: routines.map(snippetToRoutine),
                mealPlans: mealPlans.map(snippetToMealPlan),
                drillSets: drillSets.map(snippetToDrillSet),
            },
        };
    }, []);

    const loadRecords = useCallback(async (profileId: string) => {
        const data = await apiGetAllRecords(profileId);
        setRecords(data || {});
    }, []);

    // ── Initial load ──────────────────────────────────────────────────────────
    useEffect(() => {
        const init = async () => {
            setLoading(true);
            try {
                const apiProfiles = await apiListProfiles();
                if (apiProfiles.length === 0) {
                    setLoading(false);
                    return;
                }

                const savedActiveId = localStorage.getItem(ACTIVE_PROFILE_KEY);
                const activeApiProfile = apiProfiles.find(p => p.id === savedActiveId) || apiProfiles[0];

                // Load full data for the active profile
                const profileData = await loadProfileData(activeApiProfile.id);
                const fullProfile: UserProfile = {
                    id: activeApiProfile.id,
                    name: activeApiProfile.name,
                    createdAt: activeApiProfile.createdAt,
                    templates: profileData.templates || [],
                    schedule: profileData.schedule || {},
                    library: profileData.library || { routines: [], mealPlans: [], drillSets: [] },
                };

                // Build stub profiles for non-active ones (load full data on switch)
                const allProfiles = apiProfiles.map(p =>
                    p.id === fullProfile.id ? fullProfile : {
                        id: p.id,
                        name: p.name,
                        createdAt: p.createdAt,
                        templates: [],
                        schedule: {},
                        library: { routines: [], mealPlans: [], drillSets: [] },
                    }
                );

                setProfiles(allProfiles);
                setActiveProfile(fullProfile);
                localStorage.setItem(ACTIVE_PROFILE_KEY, fullProfile.id);
                await loadRecords(fullProfile.id);
            } catch (e) {
                console.error('Failed to load planner data:', e);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [loadProfileData, loadRecords]);

    // ── Profile operations ────────────────────────────────────────────────────
    const addProfile = useCallback(async (name: string) => {
        const created = await apiCreateProfile(name);
        const newProfile: UserProfile = {
            id: created.id,
            name: created.name,
            createdAt: created.createdAt,
            templates: [],
            schedule: {},
            library: { routines: [], mealPlans: [], drillSets: [] },
        };
        setProfiles(prev => [...prev, newProfile]);
        setActiveProfile(newProfile);
        localStorage.setItem(ACTIVE_PROFILE_KEY, newProfile.id);
        setRecords({});
    }, []);

    const switchProfile = useCallback(async (id: string) => {
        const stub = profiles.find(p => p.id === id);
        if (!stub) return;
        setLoading(true);
        try {
            const profileData = await loadProfileData(id);
            const fullProfile: UserProfile = {
                ...stub,
                templates: profileData.templates || [],
                schedule: profileData.schedule || {},
                library: profileData.library || { routines: [], mealPlans: [], drillSets: [] },
            };
            setProfiles(prev => prev.map(p => p.id === id ? fullProfile : p));
            setActiveProfile(fullProfile);
            localStorage.setItem(ACTIVE_PROFILE_KEY, id);
            await loadRecords(id);
        } finally {
            setLoading(false);
        }
    }, [profiles, loadProfileData, loadRecords]);

    const deleteProfile = useCallback(async (id: string) => {
        await apiDeleteProfile(id);
        setProfiles(prev => prev.filter(p => p.id !== id));
        setActiveProfile(current => (current?.id === id ? null : current));
        if (activeProfile?.id === id) setRecords({});
    }, [activeProfile]);

    // ── Template operations ───────────────────────────────────────────────────
    const saveTemplate = useCallback(async (template: DailyTemplate) => {
        if (!activeProfile) return;
        const saved = await apiSaveTemplate(activeProfile.id, template) as unknown as DailyTemplate;
        setActiveProfile(prev => {
            if (!prev) return prev;
            const templates = prev.templates.some(t => t.id === saved.id)
                ? prev.templates.map(t => t.id === saved.id ? saved : t)
                : [...prev.templates, saved];
            const updated = { ...prev, templates };
            setProfiles(ps => ps.map(p => p.id === prev.id ? updated : p));
            return updated;
        });
    }, [activeProfile]);

    const deleteTemplate = useCallback(async (id: string) => {
        if (!activeProfile) return;
        await apiDeleteTemplate(activeProfile.id, id);
        setActiveProfile(prev => {
            if (!prev) return prev;
            const templates = prev.templates.filter(t => t.id !== id);
            const schedule = { ...prev.schedule };
            Object.keys(schedule).forEach(date => { if (schedule[date] === id) delete schedule[date]; });
            const updated = { ...prev, templates, schedule };
            setProfiles(ps => ps.map(p => p.id === prev.id ? updated : p));
            return updated;
        });
    }, [activeProfile]);

    // ── Schedule operations ───────────────────────────────────────────────────
    const assignTemplateToDates = useCallback(async (templateId: string, dates: string[]) => {
        if (!activeProfile) return;
        await apiAssignSchedule(activeProfile.id, dates, templateId);
        
        const template = templateId ? activeProfile.templates.find(t => t.id === templateId) : null;

        setActiveProfile(prev => {
            if (!prev) return prev;
            const schedule = { ...prev.schedule };
            dates.forEach(date => {
                if (!date) return;
                if (templateId === '' || !templateId) delete schedule[date];
                else schedule[date] = templateId;
            });
            const updated = { ...prev, schedule };
            setProfiles(ps => ps.map(p => p.id === prev.id ? updated : p));
            return updated;
        });

        // Regenerate and update daily records for those dates with the newly applied template
        setRecords(prev => {
            const updatedRecords = { ...prev };
            dates.forEach(date => {
                if (!date) return;
                let newRecord: DailyRecord;
                if (template) {
                    newRecord = {
                        date,
                        type: template.type,
                        templateId: template.id,
                        tasks: (template.tasks || []).map((t, i) => ({ ...t, id: `task-${i}`, completed: false })),
                        nutrition: (template.nutrition || []).map((n, i) => ({ ...n, id: `nut-${i}`, completed: false })),
                        drills: (template.drills || []).map(label => ({ label, completed: false })),
                        hydration: { glasses: 0 },
                        sleep: { bedTime: '', wakeTime: '', hours: 0, score: 'needs-improvement' },
                    };
                } else {
                    newRecord = {
                        date,
                        type: 'training',
                        tasks: DEFAULT_TASKS.map((t, i) => ({ ...t, id: `task-${i}`, completed: false })),
                        nutrition: DEFAULT_NUTRITION.map((n, i) => ({ ...n, id: `nut-${i}`, completed: false })),
                        drills: [],
                        hydration: { glasses: 0 },
                        sleep: { bedTime: '', wakeTime: '', hours: 0, score: 'needs-improvement' },
                    };
                }
                updatedRecords[date] = newRecord;
                apiSaveRecord(activeProfile.id, date, newRecord).catch(e =>
                    console.error('Failed to save updated template record:', e)
                );
            });
            return updatedRecords;
        });
    }, [activeProfile]);

    // ── Record operations (optimistic local update + async API save) ──────────
    const createDefaultRecord = useCallback((date: string): DailyRecord => {
        const templateId = activeProfile?.schedule?.[date];
        const template = activeProfile?.templates?.find(t => t.id === templateId);
        if (template) {
            return {
                date, type: template.type, templateId: template.id,
                tasks: (template.tasks || []).map((t, i) => ({ ...t, id: `task-${i}`, completed: false })),
                nutrition: (template.nutrition || []).map((n, i) => ({ ...n, id: `nut-${i}`, completed: false })),
                drills: (template.drills || []).map(label => ({ label, completed: false })),
                hydration: { glasses: 0 },
                sleep: { bedTime: '', wakeTime: '', hours: 0, score: 'needs-improvement' },
            };
        }
        return {
            date, type: 'training',
            tasks: DEFAULT_TASKS.map((t, i) => ({ ...t, id: `task-${i}`, completed: false })),
            nutrition: DEFAULT_NUTRITION.map((n, i) => ({ ...n, id: `nut-${i}`, completed: false })),
            drills: [],
            hydration: { glasses: 0 },
            sleep: { bedTime: '', wakeTime: '', hours: 0, score: 'needs-improvement' },
        };
    }, [activeProfile]);

    const getRecord = useCallback((date: string): DailyRecord => {
        return records[date] || createDefaultRecord(date);
    }, [records, createDefaultRecord]);

    const persistRecord = useCallback((record: DailyRecord) => {
        if (!activeProfile) return;
        apiSaveRecord(activeProfile.id, record.date, record).catch(e =>
            console.error('Failed to save record:', e)
        );
    }, [activeProfile]);

    const updateRecord = useCallback(async (record: DailyRecord) => {
        if (!activeProfile) return;
        await apiSaveRecord(activeProfile.id, record.date, record);
        setRecords(prev => ({ ...prev, [record.date]: { ...record } }));
    }, [activeProfile]);

    const toggleItem = useCallback((date: string, category: 'tasks' | 'nutrition', id: string) => {
        if (!activeProfile || isFutureDate(date)) return;
        setRecords(prev => {
            const current = prev[date] || createDefaultRecord(date);
            const updatedItems = current[category].map(item =>
                item.id === id ? { ...item, completed: !item.completed } : item
            );
            const updated = { ...current, [category]: updatedItems };
            persistRecord(updated);
            return { ...prev, [date]: updated };
        });
    }, [activeProfile, createDefaultRecord, persistRecord]);

    const toggleDrill = useCallback((date: string, index: number) => {
        if (!activeProfile || isFutureDate(date)) return;
        setRecords(prev => {
            const current = prev[date] || createDefaultRecord(date);
            const updatedDrills = (current.drills || []).map((d, i) =>
                i === index ? { ...d, completed: !d.completed } : d
            );
            const updated = { ...current, drills: updatedDrills };
            persistRecord(updated);
            return { ...prev, [date]: updated };
        });
    }, [activeProfile, createDefaultRecord, persistRecord]);

    const updateHydration = useCallback((date: string, glasses: number) => {
        if (!activeProfile || isFutureDate(date)) return;
        setRecords(prev => {
            const current = prev[date] || createDefaultRecord(date);
            const updated = { ...current, hydration: { glasses } };
            persistRecord(updated);
            return { ...prev, [date]: updated };
        });
    }, [activeProfile, createDefaultRecord, persistRecord]);

    const updateSleep = useCallback((date: string, field: string, value: any) => {
        if (!activeProfile || isFutureDate(date)) return;
        setRecords(prev => {
            const current = prev[date] || createDefaultRecord(date);
            const updated = { ...current, sleep: { ...current.sleep, [field]: value } };
            persistRecord(updated);
            return { ...prev, [date]: updated };
        });
    }, [activeProfile, createDefaultRecord, persistRecord]);

    // ── Library operations ────────────────────────────────────────────────────
    const saveToLibrary = useCallback(async (type: 'routines' | 'mealPlans' | 'drillSets', snippet: any) => {
        if (!activeProfile) return;
        const dataKey = type === 'routines' ? 'tasks' : type === 'mealPlans' ? 'nutrition' : 'drills';
        const saved = await apiSaveSnippet(activeProfile.id, {
            id: snippet.id,
            name: snippet.name,
            type,
            data: { [dataKey]: snippet[dataKey] },
        });
        setActiveProfile(prev => {
            if (!prev) return prev;
            const list = prev.library[type] as any[];
            const mapped = type === 'routines'
                ? snippetToRoutine(saved)
                : type === 'mealPlans'
                    ? snippetToMealPlan(saved)
                    : snippetToDrillSet(saved);
            const updated_list = list.some((s: any) => s.id === saved.id)
                ? list.map((s: any) => s.id === saved.id ? mapped : s)
                : [...list, mapped];
            const updated = { ...prev, library: { ...prev.library, [type]: updated_list } };
            setProfiles(ps => ps.map(p => p.id === prev.id ? updated : p));
            return updated;
        });
    }, [activeProfile]);

    const deleteFromLibrary = useCallback(async (type: 'routines' | 'mealPlans' | 'drillSets', id: string) => {
        if (!activeProfile) return;
        await apiDeleteSnippet(activeProfile.id, type, id);
        setActiveProfile(prev => {
            if (!prev) return prev;
            const updated = {
                ...prev,
                library: { ...prev.library, [type]: (prev.library[type] as any[]).filter((s: any) => s.id !== id) },
            };
            setProfiles(ps => ps.map(p => p.id === prev.id ? updated : p));
            return updated;
        });
    }, [activeProfile]);

    // ── Stats ─────────────────────────────────────────────────────────────────
    const getStats = useCallback(() => {
        const activeDates = Object.entries(records)
            .filter(([date, record]) => !isFutureDate(date) && calculateRecordCompletion(record) >= 90)
            .map(([date]) => date)
            .sort();

        let tempStreak = 0, longestStreak = 0;
        let prevDate: Date | null = null;
        activeDates.forEach(dateStr => {
            const currentDate = new Date(dateStr);
            if (prevDate) {
                const diff = (currentDate.getTime() - prevDate.getTime()) / (1000 * 3600 * 24);
                if (Math.round(diff) === 1) tempStreak++;
                else tempStreak = 1;
            } else {
                tempStreak = 1;
            }
            longestStreak = Math.max(longestStreak, tempStreak);
            prevDate = currentDate;
        });

        let currentStreak = 0;
        let checkDate = new Date();
        while (calculateRecordCompletion(getRecord(formatDate(checkDate))) >= 90) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
            if (currentStreak > 1000) break;
        }
        if (currentStreak === 0) {
            checkDate = new Date();
            checkDate.setDate(checkDate.getDate() - 1);
            while (calculateRecordCompletion(getRecord(formatDate(checkDate))) >= 90) {
                currentStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
                if (currentStreak > 1000) break;
            }
        }

        const validPastRecords = Object.entries(records).filter(([date]) => !isFutureDate(date)).map(([_, r]) => r);
        const perfectDays = validPastRecords.filter(r => calculateRecordCompletion(r) === 100).length;
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const monthlyPoints = validPastRecords
            .filter(r => { const d = new Date(r.date); return d.getMonth() === currentMonth && d.getFullYear() === currentYear; })
            .reduce((acc, r) => acc + calculateRecordCompletion(r), 0);
        const monthlyCompletion = monthlyPoints / daysInMonth;

        return { currentStreak, longestStreak, monthlyCompletion, perfectDays };
    }, [records, calculateRecordCompletion, getRecord, formatDate]);

    // ── Export / Import (JSON download of current in-memory data) ────────────
    const exportData = useCallback(async () => JSON.stringify(records, null, 2), [records]);

    const importData = useCallback(async (json: string) => {
        if (!activeProfile) return;
        const data = JSON.parse(json) as Record<string, DailyRecord>;
        for (const [date, record] of Object.entries(data)) {
            await apiSaveRecord(activeProfile.id, date, record);
        }
        setRecords(data);
    }, [activeProfile]);

    const value = useMemo(() => ({
        records, profiles, activeProfile, loading,
        getRecord, updateRecord, toggleItem, toggleDrill, updateHydration, updateSleep,
        calculateRecordCompletion, getStats, exportData, importData,
        addProfile, switchProfile, deleteProfile,
        saveTemplate, deleteTemplate, assignTemplateToDates,
        saveToLibrary, deleteFromLibrary,
    }), [
        records, profiles, activeProfile, loading,
        getRecord, updateRecord, toggleItem, toggleDrill, updateHydration, updateSleep,
        calculateRecordCompletion, getStats, exportData, importData,
        addProfile, switchProfile, deleteProfile,
        saveTemplate, deleteTemplate, assignTemplateToDates,
        saveToLibrary, deleteFromLibrary,
    ]);

    return <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>;
};

export const usePlanner = () => {
    const context = useContext(PlannerContext);
    if (!context) throw new Error('usePlanner must be used within a PlannerProvider');
    return context;
};
