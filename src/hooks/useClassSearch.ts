import { useState, useEffect } from 'react';
import { fetchArchivedRides } from '../api/pelotonClient';
import type { PelotonClass } from '../api/types';

export function useClassSearch(query: string, category: string, enabled: boolean) {
  const [classes, setClasses] = useState<PelotonClass[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const controller = new AbortController();
    let debounceTimer: ReturnType<typeof setTimeout>;

    const doFetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchArchivedRides({
          browseCategory: category || undefined,
          limit: 48,
          page: 0,
          signal: controller.signal,
        });

        // Attach instructor data to each class if available
        const instructorMap = response.instructors ?? {};
        const enriched = response.data.map((cls) => ({
          ...cls,
          instructors: cls.instructor_id && instructorMap[cls.instructor_id]
            ? [instructorMap[cls.instructor_id]]
            : cls.instructors ?? [],
        }));

        // Client-side filter by search query
        const filtered = query.trim()
          ? enriched.filter((cls) =>
              cls.title.toLowerCase().includes(query.toLowerCase())
            )
          : enriched;

        setClasses(filtered);
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        setError((err as Error).message ?? 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    debounceTimer = setTimeout(doFetch, 400);

    return () => {
      clearTimeout(debounceTimer);
      controller.abort();
    };
  }, [query, category, enabled]);

  return { classes, loading, error };
}
