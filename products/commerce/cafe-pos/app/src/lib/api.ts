const STORAGE_KEY = 'berhot_auth';
const IS_PREVIEW = Number(window.location.port) >= 5000;
const LANDING_URL = IS_PREVIEW ? 'http://localhost:5001' : 'http://localhost:3000';

function getStoredAuth(): { accessToken?: string; refreshToken?: string } {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return {};
}

function getToken(): string | null {
  return getStoredAuth().accessToken || null;
}

/** Try to refresh the access token using the stored refresh token */
async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken } = getStoredAuth();
  if (!refreshToken) return null;

  try {
    const res = await fetch('/api/v1/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;

    const data = await res.json();
    // Update stored auth with new tokens
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.accessToken = data.accessToken;
        if (data.refreshToken) parsed.refreshToken = data.refreshToken;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      }
    } catch { /* ignore */ }
    return data.accessToken || null;
  } catch {
    return null;
  }
}

/** Redirect to landing app login when auth is fully expired */
function redirectToLogin() {
  const lang = window.location.pathname.split('/')[1] || 'en';
  localStorage.removeItem(STORAGE_KEY);
  window.location.href = `${LANDING_URL}/${lang}/signin`;
}

let refreshPromise: Promise<string | null> | null = null;

export async function apiFetch<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(path, { ...options, headers });

  // If 401 → try refreshing the token once
  if (res.status === 401 && token) {
    // Deduplicate concurrent refresh requests
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => { refreshPromise = null; });
    }
    const newToken = await refreshPromise;
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      const retry = await fetch(path, { ...options, headers });
      if (!retry.ok) {
        const body = await retry.json().catch(() => ({}));
        throw new Error(body.error || `Request failed: ${retry.status}`);
      }
      return retry.json();
    }
    // Refresh failed → redirect to login
    redirectToLogin();
    throw new Error('Session expired. Redirecting to login...');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

// ── User endpoints ──────────────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  tenantId: string;
}

export async function fetchMyProfile(): Promise<UserProfile> {
  return apiFetch<UserProfile>('/api/v1/users/me');
}

export async function updateMyProfile(data: {
  firstName?: string;
  lastName?: string;
  phone?: string;
}): Promise<{ message: string }> {
  return apiFetch('/api/v1/users/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ── Tenant endpoints ────────────────────────────────────

export interface TenantInfo {
  id: string;
  name: string;
  slug: string;
  status: string;
  plan: string;
  countryCode: string;
  regionId: string;
  cityId: string;
  createdAt: string;
}

export async function fetchMyTenant(): Promise<TenantInfo> {
  return apiFetch<TenantInfo>('/api/v1/tenants/me');
}

export async function updateMyTenant(data: {
  name?: string;
  countryCode?: string;
  regionId?: string;
  cityId?: string;
}): Promise<{ message: string }> {
  return apiFetch('/api/v1/tenants/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function updateMyPlan(plan: string): Promise<{ message: string; plan: string }> {
  return apiFetch('/api/v1/tenants/me/plan', {
    method: 'PUT',
    body: JSON.stringify({ plan }),
  });
}

// ── Location endpoints ──────────────────────────────────

export interface Country {
  id: string;
  code: string;
  name_en: string;
  name_ar: string;
  phone_code: string;
  currency_code: string;
  flag_emoji: string;
  is_active: boolean;
  sort_order: number;
}

export interface Region {
  id: string;
  country_id: string;
  code: string;
  name_en: string;
  name_ar: string;
  is_active: boolean;
  sort_order: number;
}

export interface City {
  id: string;
  region_id: string;
  country_id: string;
  name_en: string;
  name_ar: string;
  is_active: boolean;
  sort_order: number;
}

export async function fetchCountries(): Promise<Country[]> {
  const data = await apiFetch<{ countries: Country[] }>('/api/v1/locations/countries');
  return data.countries;
}

export async function fetchRegions(countryCode: string): Promise<Region[]> {
  const data = await apiFetch<{ regions: Region[] }>(`/api/v1/locations/countries/${countryCode}/regions`);
  return data.regions;
}

export async function fetchCities(regionId: string): Promise<City[]> {
  const data = await apiFetch<{ cities: City[] }>(`/api/v1/locations/regions/${regionId}/cities`);
  return data.cities;
}

// ── Business Location endpoints ────────────────────────

export interface BusinessLocation {
  id: string;
  tenantId?: string;
  name: string;
  businessName: string;
  nickname: string;
  locationType: string;
  description?: string;
  addressLine1: string;
  addressLine2?: string;
  cityName: string;
  postalCode?: string;
  phone: string;
  email: string;
  timezone: string;
  currency: string;
  taxRate?: number;
  preferredLanguage?: string;
  status: string;
  businessHours?: string;
  businessNameChanges?: string;
  createdAt: string;
  updatedAt: string;
}

export async function fetchBusinessLocations(search?: string): Promise<BusinessLocation[]> {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  const data = await apiFetch<{ locations: BusinessLocation[] }>(`/api/v1/business-locations/${query}`);
  return data.locations || [];
}

export async function fetchBusinessLocation(id: string): Promise<BusinessLocation> {
  return apiFetch<BusinessLocation>(`/api/v1/business-locations/${id}`);
}

export async function createBusinessLocation(data: Partial<BusinessLocation>): Promise<BusinessLocation> {
  return apiFetch<BusinessLocation>('/api/v1/business-locations/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateBusinessLocation(id: string, data: Partial<BusinessLocation>): Promise<{ message: string }> {
  return apiFetch(`/api/v1/business-locations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deactivateBusinessLocation(id: string): Promise<{ message: string }> {
  return apiFetch(`/api/v1/business-locations/${id}`, {
    method: 'DELETE',
  });
}
