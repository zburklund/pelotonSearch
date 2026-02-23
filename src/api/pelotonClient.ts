import type { ArchivedRidesResponse, BrowseCategoriesResponse } from './types';

// Session ID is set by the user from their browser cookie and injected
// via the Vite dev server proxy as a Cookie header.
let _sessionId = '';

export function setSessionId(id: string) {
  _sessionId = id;
}

export function getSessionId() {
  return _sessionId;
}

function authHeaders(): HeadersInit {
  return _sessionId
    ? { Cookie: `peloton_session_id=${_sessionId}` }
    : {};
}

export async function verifySession(): Promise<boolean> {
  try {
    const res = await fetch('/api/me', {
      headers: authHeaders(),
      credentials: 'include',
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchBrowseCategories(): Promise<BrowseCategoriesResponse> {
  const res = await fetch('/api/browse_categories?library_type=on_demand', {
    headers: authHeaders(),
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
    headers: authHeaders(),
    credentials: 'include',
    signal: params.signal,
  });
  if (!res.ok) throw new Error(`Failed to fetch classes (${res.status})`);
  return res.json();
}
