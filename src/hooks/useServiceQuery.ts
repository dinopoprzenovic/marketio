"use client";

import { useState, useEffect, useCallback } from "react";

interface UseServiceQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook for fetching data from API routes.
 * Handles loading, error, and refetch states.
 */
export function useServiceQuery<T>(
  url: string | null,
  options?: { enabled?: boolean }
): UseServiceQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchCount, setFetchCount] = useState(0);

  const enabled = options?.enabled ?? true;

  const refetch = useCallback(() => {
    setFetchCount((c) => c + 1);
  }, []);

  useEffect(() => {
    if (!url || !enabled) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(url)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error?.message || `Request failed (${res.status})`);
        }
        return res.json();
      })
      .then((json) => {
        if (cancelled) return;
        if (json.success === false) {
          setError(json.error?.message || "Unknown error");
          setData(null);
        } else {
          setData(json.data ?? json);
          setError(null);
        }
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e.message || "Network error");
        setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [url, enabled, fetchCount]);

  return { data, loading, error, refetch };
}
