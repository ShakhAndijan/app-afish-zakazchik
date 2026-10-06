import { useState, useRef, useEffect, useCallback } from 'react';

// Gorizontal FlatList uchun avto-aylanish.
//  - `step`: bitta elementning surilish masofasi (element kengligi + oraliq)
//  - `loop`: ro'yxat 3 marta takrorlangan (o'rta nusxada aylanadi, chetga chiqsa
//    animatsiyasiz o'rtaga qaytariladi)
//  - foydalanuvchi qo'lda surganda avto-aylanish to'xtaydi va `resumeDelay`
//    dan keyin qolgan joyidan davom etadi (hisoblagich qo'lda surilgan
//    joyga moslanadi — ro'yxat orqaga sakramaydi)
//  - `hold()` / `release()`: tashqi sabab bilan doimiy pauza (masalan kategoriya
//    tanlanganda)
export default function useAutoCarousel({
  length,
  step,
  interval = 2000,
  loop = false,
  trackActive = false,
  resumeDelay = 4000,
  startHeld = false,
}) {
  const listRef = useRef(null);
  const idxRef = useRef(loop ? length : 0);
  const heldRef = useRef(startHeld);
  const draggingRef = useRef(false);
  const resumeTimerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollToIndex = useCallback(
    (i, animated) => {
      listRef.current?.scrollToOffset({ offset: i * step, animated });
    },
    [step]
  );

  // Takrorlangan ro'yxat o'rta nusxadan boshlanadi.
  useEffect(() => {
    if (!loop || length === 0) return;
    idxRef.current = length;
    const init = setTimeout(() => scrollToIndex(length, false), 0);
    return () => clearTimeout(init);
  }, [loop, length, scrollToIndex]);

  useEffect(() => {
    if (length === 0) return;
    const timer = setInterval(() => {
      if (heldRef.current || draggingRef.current) return;
      let next = idxRef.current + 1;
      let animated = true;
      if (loop) {
        if (next >= length * 2) {
          next = length;
          animated = false;
        }
      } else {
        next = next % length;
      }
      idxRef.current = next;
      if (trackActive) setActiveIndex(loop ? next - length : next);
      scrollToIndex(next, animated);
    }, interval);
    return () => clearInterval(timer);
  }, [length, interval, loop, trackActive, scrollToIndex]);

  useEffect(() => () => clearTimeout(resumeTimerRef.current), []);

  const onScrollBeginDrag = useCallback(() => {
    draggingRef.current = true;
    clearTimeout(resumeTimerRef.current);
  }, []);

  const scheduleResume = useCallback(() => {
    clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      draggingRef.current = false;
    }, resumeDelay);
  }, [resumeDelay]);

  // Barmoq ko'tarilganda momentum bo'lmasa ham avto-aylanish tiklansin.
  const onScrollEndDrag = scheduleResume;

  // Surish tugagach (foydalanuvchi yoki avto) joriy pozitsiyani hisoblagichga yozamiz.
  const onMomentumScrollEnd = useCallback(
    (e) => {
      let i = Math.round(e.nativeEvent.contentOffset.x / step);
      if (loop) {
        const wrapped = length + ((((i - length) % length) + length) % length);
        if (wrapped !== i) {
          i = wrapped;
          scrollToIndex(i, false);
        }
      } else {
        i = Math.max(0, Math.min(length - 1, i));
      }
      idxRef.current = i;
      if (trackActive) setActiveIndex(loop ? i - length : i);
      scheduleResume();
    },
    [step, loop, length, trackActive, scheduleResume, scrollToIndex]
  );

  const hold = useCallback(() => {
    heldRef.current = true;
  }, []);
  const release = useCallback(() => {
    heldRef.current = false;
  }, []);

  return {
    listRef,
    activeIndex,
    onScrollBeginDrag,
    onScrollEndDrag,
    onMomentumScrollEnd,
    hold,
    release,
  };
}
