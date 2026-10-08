import { useState, useCallback, useRef, useEffect } from 'react';
import { getOrderDetail } from '../../../api/orders';
import usePolling from './usePolling';
import { isOpenOrder } from '../utils';

const POLL_MS = 8000;

// Buyurtmaning joriy holati backenddan: yuklanadi va u yakunlanmaguncha ekran ochiq turganda
// vaqti-vaqti bilan yangilanadi (usta qabul qilsa yoki narx aytsa shu yerda ko'rinadi).
export default function useLiveOrder(orderId) {
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    try {
      const fresh = await getOrderDetail(orderId);
      if (!mounted.current) return;
      setOrder(fresh);
      setError(false);
    } catch {
      // Yangilash muvaffaqiyatsiz bo'lsa, avval yuklangan buyurtma saqlanadi.
      if (mounted.current) setError(true);
    }
  }, [orderId]);

  usePolling(refresh, POLL_MS, !order || isOpenOrder(order));

  return { order, loading: order === null && !error, failed: order === null && error, refresh };
}
