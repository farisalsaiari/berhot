const API_BASE = import.meta.env.VITE_API_URL || '/api';

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

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data as T;
}

export async function fetchCountries(): Promise<Country[]> {
  const data = await apiFetch<{ countries: Country[] }>('/v1/locations/countries');
  return data.countries;
}

export async function fetchRegions(countryCode: string): Promise<Region[]> {
  const data = await apiFetch<{ regions: Region[] }>(`/v1/locations/countries/${countryCode}/regions`);
  return data.regions;
}

export async function fetchCities(regionId: string): Promise<City[]> {
  const data = await apiFetch<{ cities: City[] }>(`/v1/locations/regions/${regionId}/cities`);
  return data.cities;
}
