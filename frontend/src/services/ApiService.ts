// ApiService.ts — HTTP client for StreakForge backend
// Handles JWT attach, token refresh, and maps API responses to frontend types.

import { DailyRecord, DailyTemplate, UserProfile } from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8080';

// ── Token storage ─────────────────────────────────────────────────────────────
const KEYS = {
  accessToken: 'sf-access-token',
  refreshToken: 'sf-refresh-token',
  expiresAt: 'sf-token-expires-at',
  user: 'sf-user',
};

export interface AuthUser {
  id: string;
  displayName: string;
  email: string;
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(KEYS.user);
  return raw ? JSON.parse(raw) : null;
}

function storeTokens(data: { accessToken: string; refreshToken: string; accessTokenExpiresAt: string; user: AuthUser }) {
  localStorage.setItem(KEYS.accessToken, data.accessToken);
  localStorage.setItem(KEYS.refreshToken, data.refreshToken);
  localStorage.setItem(KEYS.expiresAt, data.accessTokenExpiresAt);
  localStorage.setItem(KEYS.user, JSON.stringify(data.user));
}

export function clearTokens() {
  Object.values(KEYS).forEach(k => localStorage.removeItem(k));
}

function isTokenExpired(): boolean {
  const exp = localStorage.getItem(KEYS.expiresAt);
  if (!exp) return true;
  return new Date(exp).getTime() - Date.now() < 30_000; // 30s buffer
}

// ── Core fetch with auto-refresh ──────────────────────────────────────────────
let refreshPromise: Promise<void> | null = null;

async function refreshAccessToken(): Promise<void> {
  const refreshToken = localStorage.getItem(KEYS.refreshToken);
  if (!refreshToken) throw new Error('No refresh token');

  const res = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    clearTokens();
    throw new Error('Session expired — please log in again');
  }

  const json = await res.json();
  storeTokens(json.data);
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  // Refresh token if expired
  if (isTokenExpired()) {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => { refreshPromise = null; });
    }
    await refreshPromise;
  }

  const accessToken = localStorage.getItem(KEYS.accessToken);
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message || 'Request failed');
  }

  // 204 No Content
  if (response.status === 204) return undefined as T;

  const json = await response.json();
  return json.data as T;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  user: AuthUser;
}

export async function apiRegister(displayName: string, email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ displayName, email, password }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Registration failed');
  storeTokens(json.data);
  return json.data;
}

export async function apiLogin(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Login failed');
  storeTokens(json.data);
  return json.data;
}

// ── Profiles ──────────────────────────────────────────────────────────────────
export interface ApiProfile { id: string; name: string; createdAt: string; }

export const apiListProfiles = () =>
  apiFetch<ApiProfile[]>('/api/v1/planner/profiles');

export const apiCreateProfile = (name: string) =>
  apiFetch<ApiProfile>('/api/v1/planner/profiles', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });

export const apiDeleteProfile = (profileId: string) =>
  apiFetch<void>(`/api/v1/planner/profiles/${profileId}`, { method: 'DELETE' });

function isValidUuid(id?: string): boolean {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

// ── Templates ─────────────────────────────────────────────────────────────────
export const apiListTemplates = (profileId: string) =>
  apiFetch<DailyTemplate[]>(`/api/v1/planner/profiles/${profileId}/templates`);

export const apiSaveTemplate = (profileId: string, template: DailyTemplate) =>
  apiFetch<DailyTemplate>(`/api/v1/planner/profiles/${profileId}/templates`, {
    method: 'POST',
    body: JSON.stringify({
      id: isValidUuid(template.id) ? template.id : undefined,
      name: template.name,
      type: template.type,
      hydrationTarget: template.hydrationTarget,
      tasks: template.tasks,
      nutrition: template.nutrition,
      drills: template.drills,
    }),
  });

export const apiDeleteTemplate = (profileId: string, templateId: string) =>
  apiFetch<void>(`/api/v1/planner/profiles/${profileId}/templates/${templateId}`, { method: 'DELETE' });

// ── Schedule ──────────────────────────────────────────────────────────────────
export const apiGetSchedule = (profileId: string) =>
  apiFetch<Record<string, string>>(`/api/v1/planner/profiles/${profileId}/schedule`);

export const apiAssignSchedule = (profileId: string, dates: string[], templateId: string) =>
  apiFetch<void>(`/api/v1/planner/profiles/${profileId}/schedule`, {
    method: 'PUT',
    body: JSON.stringify({ dates, templateId }),
  });

// ── Daily Records ─────────────────────────────────────────────────────────────
export const apiGetAllRecords = (profileId: string) =>
  apiFetch<Record<string, DailyRecord>>(`/api/v1/planner/profiles/${profileId}/records`);

export const apiSaveRecord = (profileId: string, date: string, record: DailyRecord) =>
  apiFetch<DailyRecord>(`/api/v1/planner/profiles/${profileId}/records/${date}`, {
    method: 'PUT',
    body: JSON.stringify({
      type: record.type,
      templateId: record.templateId,
      tasks: record.tasks,
      nutrition: record.nutrition,
      drills: record.drills,
      hydrationGlasses: record.hydration.glasses,
      sleepBedTime: record.sleep?.bedTime,
      sleepWakeTime: record.sleep?.wakeTime,
      sleepHours: record.sleep?.hours,
      sleepScore: record.sleep?.score,
      notes: record.notes,
    }),
  });

// ── Library ───────────────────────────────────────────────────────────────────
export interface ApiSnippet { id: string; name: string; type: string; data: Record<string, unknown>; createdAt: string; }

export const apiListSnippets = (profileId: string, type: string) =>
  apiFetch<ApiSnippet[]>(`/api/v1/planner/profiles/${profileId}/library/${type}`);

export const apiSaveSnippet = (profileId: string, snippet: { id?: string; name: string; type: string; data: Record<string, unknown> }) =>
  apiFetch<ApiSnippet>(`/api/v1/planner/profiles/${profileId}/library`, {
    method: 'POST',
    body: JSON.stringify({
      id: isValidUuid(snippet.id) ? snippet.id : undefined,
      name: snippet.name,
      type: snippet.type,
      data: snippet.data,
    }),
  });

export const apiDeleteSnippet = (profileId: string, type: string, snippetId: string) =>
  apiFetch<void>(`/api/v1/planner/profiles/${profileId}/library/${type}/${snippetId}`, { method: 'DELETE' });
