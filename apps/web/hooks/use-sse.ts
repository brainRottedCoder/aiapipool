"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import type { SseEvent } from "@/types/api";
import { ENDPOINTS } from "@/lib/api-endpoints";

export function useSse(userId?: string) {
  const [events, setEvents] = useState<SseEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    if (esRef.current) esRef.current.close();

    const es = new EventSource(ENDPOINTS.user.events, { withCredentials: true });
    esRef.current = es;

    es.onopen = () => setConnected(true);
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        setEvents((prev) => [...prev.slice(-50), data]);
      } catch {
        // ignore non-JSON events (heartbeats are JSON too)
      }
    };
    es.onerror = () => setConnected(false);

    return () => {
      es.close();
      esRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!userId) return;
    const cleanup = connect();
    return cleanup;
  }, [userId, connect]);

  return { events, connected, connect };
}
