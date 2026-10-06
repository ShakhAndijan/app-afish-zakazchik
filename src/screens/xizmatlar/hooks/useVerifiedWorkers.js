import { useState, useEffect } from 'react';
import { getWorkersPage } from '../../../api/workers';

// Bosh ro'yxatdagi tasdiqlangan ustalar ("Faqat sertifikatlangan" yoqilganda yuklanadi).
export default function useVerifiedWorkers(enabled) {
  const [verified, setVerified] = useState({ items: [], total: null, loading: false });

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    setVerified((prev) => ({ ...prev, loading: true }));
    getWorkersPage({ verifiedOnly: true, page: 1, size: 20 })
      .then(({ items, total }) => {
        if (!cancelled) setVerified({ items, total, loading: false });
      })
      .catch(() => {
        if (!cancelled) setVerified({ items: [], total: null, loading: false });
      });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return verified;
}
