import type { ArchivedRidesResponse, BrowseCategoriesResponse, LoginResponse } from './types';

export async function login(usernameOrEmail: string, password: string): Promise<LoginResponse> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Peloton-Platform': 'web',
    },
    credentials: 'include',
    body: JSON.stringify({ username_or_email: usernameOrEmail, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? 'Login failed');
  }
  return res.json();
}

export async function fetchBrowseCategories(): Promise<BrowseCategoriesResponse> {
  const res = await fetch('/api/browse_categories?library_type=on_demand', {
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`Failed to load categories (${res.status})`);
  return res.json();
}

export async function fetchArchivedRides(params: {
  browseCategory?: string;
  limit?: number;
  page?: number;
  signal?: AbortSignal;
}): Promise<ArchivedRidesResponse> {
  const qs = new URLSearchParams({
    joins: 'ride,ride.instructor',
    limit: String(params.limit ?? 48),
    page: String(params.page ?? 0),
  });
  if (params.browseCategory) {
    qs.set('browse_category', params.browseCategory);
  }
  const res = await fetch(`/api/v2/ride/archived?${qs}`, {
    credentials: 'include',
    signal: params.signal,
  });
  if (!res.ok) throw new Error(`Failed to fetch classes (${res.status})`);
  return res.json();
}
