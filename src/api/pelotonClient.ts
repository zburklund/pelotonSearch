import type { ArchivedRidesResponse, BrowseCategoriesResponse } from './types';

/**
 * Register the Auth0 Bearer token with the Vite dev-server proxy so it can
 * inject it as an Authorization header on every /api request.
 */
export async function registerToken(token: string): Promise<void> {
  const res = await fetch('/__session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  if (!res.ok) throw new Error('Failed to register token with proxy');
}

export async function verifyToken(): Promise<boolean> {
  try {
    const res = await fetch('/api/me');
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchBrowseCategories(): Promise<BrowseCategoriesResponse> {
  const res = await fetch('/api/browse_categories?library_type=on_demand');
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
    content_format: 'audio,video',
    sort_by: 'original_air_time',
    desc: 'true',
    limit: String(params.limit ?? 18),
    page: String(params.page ?? 0),
  });
  if (params.browseCategory) {
    qs.set('browse_category', params.browseCategory);
  }
  const res = await fetch(`/api/v2/ride/archived?${qs}`, {
    signal: params.signal,
  });
  if (!res.ok) throw new Error(`Failed to fetch classes (${res.status})`);
  return res.json();
}
