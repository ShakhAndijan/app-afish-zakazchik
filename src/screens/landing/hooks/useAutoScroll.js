import { useRef, useEffect } from 'react';

// Gorizontal FlatList'ni har `interval` ms da bitta elementga suradi (oxirida boshiga qaytadi).
// `slot` — bitta elementning kengligi + oraliq. Qaytgan ref'ni FlatList'ga bering.
export default function useAutoScroll(count, slot, interval) {
  const listRef = useRef(null);
  const idxRef = useRef(0);

  useEffect(() => {
    if (count === 0) return;
    const timer = setInterval(() => {
      const next = (idxRef.current + 1) % count;
      idxRef.current = next;
      listRef.current?.scrollToOffset({ offset: next * slot, animated: true });
    }, interval);
    return () => clearInterval(timer);
  }, [count, slot, interval]);

  return listRef;
}
