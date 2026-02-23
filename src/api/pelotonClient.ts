import type { ArchivedRidesResponse, BrowseCategoriesResponse } from './types';

/**
 * Register the session ID with the Vite dev-server proxy so it can
 * inject it as a Cookie header on every /api request. Browsers block
 * scripts from setting the Cookie header directly (forbidden header),
 * so the proxy handles cookie injection server-side instead.
 */
export async function registerSession(sessionId: string): Promise<void> {
  const res = await fetch('/__session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId }),
  });
  if (!res.ok) throw new Error('Failed to register session with proxy');
}

export async function verifySession(): Promise<boolean> {
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
    joins: 'ride,ride.instructor',
    limit: String(params.limit ?? 48),
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
