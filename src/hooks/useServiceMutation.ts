"use client";

import { useState, useCallback } from "react";

interface UseServiceMutationResult<TInput, TOutput> {
  mutate: (input: TInput) => Promise<TOutput | null>;
  data: TOutput | null;
  loading: boolean;
  error: string | null;
  reset: () => void;
}

/**
 * Hook for POST operations to API routes (purchases, session starts, etc.).
 * Returns a mutate function that triggers the request.
 */
export function useServiceMutation<TInput, TOutput>(
  url: string
): UseServiceMutationResult<TInput, TOutput> {
  const [data, setData] = useState<TOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  const mutate = useCallback(
    async (input: TInput): Promise<TOutput | null> => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });

        const json = await res.json().catch(() => ({}));

        if (!res.ok || json.success === false) {
          const message = json.error?.message || `Request failed (${res.status})`;
          setError(message);
          setData(null);
          return null;
        }

        const result = (json.data ?? json) as TOutput;
        setData(result);
        setError(null);
        return result;
      } catch (e) {
        const message = e instanceof Error ? e.message : "Network error";
        setError(message);
        setData(null);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [url]
  );

  return { mutate, data, loading, error, reset };
}
