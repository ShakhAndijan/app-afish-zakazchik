import { useRef, useEffect, useMemo, useCallback } from 'react';

// Gorizontal FlatList uchun avto-aylanish, joriy surilish holatiga (offset) tayanadi:
//  - har qadamda keyingi "slot"ga suriladi; oxirgi joyga yetgach boshiga qaytadi va davom etadi;
//  - foydalanuvchi qo'lda surganda to'xtaydi va barmoq ko'tarilgach `resumeDelay` o'tib davom etadi.
// Hisoblagich saqlanmaydi, har safar haqiqiy offset o'qiladi — shuning uchun qo'lda surish yoki
// oxiriga yetib qolish uni chalkashtira olmaydi.
// FlatList'ga `ref={listRef}` va `{...listProps}` beriladi.
export default function useOffsetCarousel({ length, step, interval = 2000, resumeDelay = 4000 }) {
  const listRef = useRef(null);
  const offsetRef = useRef(0);
  const contentWidthRef = useRef(0);
  const viewWidthRef = useRef(0);
  const pausedUntilRef = useRef(0);

  useEffect(() => {
    if (length < 2) return;
    const timer = setInterval(() => {
      if (Date.now() < pausedUntilRef.current) return;
      const max = contentWidthRef.current - viewWidthRef.current;
      // Hammasi ekranga sig'sa yoki o'lchamlar hali kelmagan bo'lsa, surish kerak emas.
      if (!(max > 0)) return;
      const current = offsetRef.current;
      const next =
        current >= max - 2 ? 0 : Math.min(max, (Math.floor((current + 2) / step) + 1) * step);
      listRef.current?.scrollToOffset({ offset: next, animated: true });
    }, interval);
    return () => clearInterval(timer);
  }, [length, step, interval]);

  const onScroll = useCallback((e) => {
    offsetRef.current = e.nativeEvent.contentOffset.x;
  }, []);
  const onScrollBeginDrag = useCallback(() => {
    pausedUntilRef.current = Infinity;
  }, []);
  const onScrollEndDrag = useCallback(() => {
    pausedUntilRef.current = Date.now() + resumeDelay;
  }, [resumeDelay]);
  const onContentSizeChange = useCallback((w) => {
    contentWidthRef.current = w;
  }, []);
  const onLayout = useCallback((e) => {
    viewWidthRef.current = e.nativeEvent.layout.width;
  }, []);

  const listProps = useMemo(
    () => ({
      scrollEventThrottle: 16,
      onScroll,
      onScrollBeginDrag,
      onScrollEndDrag,
      onContentSizeChange,
      onLayout,
    }),
    [onScroll, onScrollBeginDrag, onScrollEndDrag, onContentSizeChange, onLayout]
  );

  return { listRef, listProps };
}
