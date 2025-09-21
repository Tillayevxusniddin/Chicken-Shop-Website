import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updateOrderInList, fetchOrders } from '../store/orderSlice';

// Build WS URL (assumes same host as API but ws scheme)
function buildWebSocketUrl(): string {
  const api = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  // strip protocol
  const url = new URL(api);
  const wsProtocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${wsProtocol}//${url.host}/ws/orders/`;
}

export default function useWebSocketOrders() {
  const dispatch = useAppDispatch();
  const { accessToken, user } = useAppSelector((s) => s.auth);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!accessToken || !user) return; // need auth
    const wsUrl = buildWebSocketUrl();
    const socket = new WebSocket(wsUrl);
    wsRef.current = socket;

    socket.onopen = () => {
      // Optionally refetch to sync
      dispatch(fetchOrders());
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'order_update' || data.type === 'new_order') {
          dispatch(updateOrderInList(data.order));
        }
      } catch (e) {
        console.error('WS parse error', e);
      }
    };

    socket.onclose = () => {
      wsRef.current = null;
    };

    socket.onerror = () => {
      // swallow for now
    };

    return () => {
      socket.close();
    };
  }, [accessToken, user, dispatch]);
}
