/**
 * useLiveDonations Hook
 *
 * Connects to the SSE endpoint for real-time donation notifications.
 * Handles automatic reconnection on disconnect.
 *
 * Adapted for church-admin API structure
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getAuthToken } from '@/lib/api';

export interface LiveDonation {
  id: string;
  amount: number;
  donorName: string;
  isAnonymous: boolean;
  fundName: string;
  churchId: string;
  churchName: string;
  timestamp: string;
  frequency: 'one_time' | 'weekly' | 'monthly' | 'yearly';
}

export interface UseLiveDonationsOptions {
  /** Maximum number of donations to keep in history */
  maxDonations?: number;
  /** Enable/disable the connection */
  enabled?: boolean;
  /** Callback when a new donation is received */
  onDonation?: (donation: LiveDonation) => void;
}

export interface UseLiveDonationsResult {
  /** Array of recent donations (newest first) */
  donations: LiveDonation[];
  /** Whether the SSE connection is active */
  isConnected: boolean;
  /** Connection error if any */
  error: string | null;
  /** Manually reconnect */
  reconnect: () => void;
  /** Clear donation history */
  clearDonations: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://soapboxsuperapp.com/api';

export function useLiveDonations(options: UseLiveDonationsOptions = {}): UseLiveDonationsResult {
  const { maxDonations = 50, enabled = true, onDonation } = options;

  const { churchId, isAuthenticated } = useAuth();

  const [donations, setDonations] = useState<LiveDonation[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 10;
  const baseReconnectDelay = 1000; // 1 second

  // Store onDonation in a ref to avoid reconnection on callback changes
  const onDonationRef = useRef(onDonation);
  useEffect(() => {
    onDonationRef.current = onDonation;
  }, [onDonation]);

  const clearDonations = useCallback(() => {
    setDonations([]);
  }, []);

  const connect = useCallback(() => {
    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    // Clear any pending reconnect
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (!enabled || !isAuthenticated || !churchId) {
      setIsConnected(false);
      return;
    }

    // Build URL with church filter and auth token
    const token = getAuthToken();
    let url = `${API_BASE_URL}/church/${churchId}/donations/live`;
    if (token) {
      url += `?token=${encodeURIComponent(token)}`;
    }

    try {
      const eventSource = new EventSource(url, { withCredentials: true });
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('[LiveDonations] SSE connection opened');
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
      };

      eventSource.addEventListener('connected', (event) => {
        console.log('[LiveDonations] Connection confirmed:', event.data);
      });

      eventSource.addEventListener('donation', (event) => {
        try {
          const donation: LiveDonation = JSON.parse(event.data);
          console.log('[LiveDonations] New donation received:', donation.id);

          setDonations((prev) => {
            // Prevent duplicates
            if (prev.some((d) => d.id === donation.id)) {
              return prev;
            }
            // Add to beginning, limit total
            const updated = [donation, ...prev].slice(0, maxDonations);
            return updated;
          });

          // Call callback if provided
          if (onDonationRef.current) {
            onDonationRef.current(donation);
          }
        } catch (parseError) {
          console.error('[LiveDonations] Failed to parse donation event:', parseError);
        }
      });

      eventSource.addEventListener('heartbeat', () => {
        // Heartbeat received, connection is alive
      });

      eventSource.onerror = () => {
        console.error('[LiveDonations] SSE error');
        setIsConnected(false);

        // Close the errored connection
        eventSource.close();
        eventSourceRef.current = null;

        // Attempt reconnection with exponential backoff
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(
            baseReconnectDelay * Math.pow(2, reconnectAttempts.current),
            30000 // Max 30 seconds
          );
          reconnectAttempts.current += 1;

          console.log(
            `[LiveDonations] Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current})`
          );
          setError('Connection lost. Reconnecting...');

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          setError('Connection lost. Please refresh the page.');
          console.error('[LiveDonations] Max reconnection attempts reached');
        }
      };
    } catch (connectError) {
      console.error('[LiveDonations] Failed to create EventSource:', connectError);
      setError('Failed to connect to donation stream');
      setIsConnected(false);
    }
  }, [enabled, isAuthenticated, churchId, maxDonations]);

  const reconnect = useCallback(() => {
    reconnectAttempts.current = 0;
    connect();
  }, [connect]);

  // Connect on mount and when dependencies change
  useEffect(() => {
    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [connect]);

  return {
    donations,
    isConnected,
    error,
    reconnect,
    clearDonations,
  };
}

export default useLiveDonations;
