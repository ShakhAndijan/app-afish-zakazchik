import { useEffect, useMemo, useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useLanguage } from '../../../context/LanguageContext';
import SectionHeader from './SectionHeader';

const H_PAD = 20;
const GAP = 12;
const CARD_W = 232;
const STEP = CARD_W + GAP;
const AUTO_MS = 3200;

// Kuz-qish mavsumi uchun tayyorgarlik ishlari. Matnlar ilovaning o'zida (mahalliy kontent);
// har bir karta `match` ifodasiga mos keladigan kategoriyaga bog'lanadi, mos kategoriya
// bo'lmasa karta ko'rsatilmaydi (va'da bermaymiz).
const JOBS = [
  { key: 'heating', icon: 'radiator', bg: '#b4402b', match: /isitish/i },
  { key: 'windows', icon: 'window-closed-variant', bg: '#2f5fb3', match: /ta.?mirlash/i },
  { key: 'wiring', icon: 'flash', bg: '#a8841a', match: /elektrik/i },
  { key: 'pipes', icon: 'pipe-leak', bg: '#0e7c8f', match: /santexnik/i },
  { key: 'garden', icon: 'flower-outline', bg: '#3f8a3a', match: /bog.?bon/i },
  { key: 'car', icon: 'car-wrench', bg: '#5b4bb0', match: /avtomobil/i },
  { key: 'clean', icon: 'broom', bg: '#1f8f6e', match: /tozalik|tozalash/i },
];

export default function SeasonalJobs({ categories, onPick, style }) {
  const { t: tr } = useLanguage();
  const listRef = useRef(null);
  const index = useRef(0);
  const dragging = useRef(false);

  const items = useMemo(
    () =>
      JOBS.map((job) => ({
        ...job,
        category: (categories ?? []).find((c) => job.match.test(c.name ?? '')),
      })).filter((job) => job.category),
    [categories]
  );

  // Avto-karusel: har bir necha soniyada keyingi kartaga o'tadi (oxirida boshiga qaytadi);
  // foydalanuvchi surayotganda to'xtab turadi.
  useEffect(() => {
    if (items.length < 2) return;
    const id = setInterval(() => {
      if (dragging.current) return;
      index.current = (index.current + 1) % items.length;
      listRef.current?.scrollToOffset({ offset: index.current * STEP, animated: true });
    }, AUTO_MS);
    return () => clearInterval(id);
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <View style={style}>
      <SectionHeader
        title={tr('app.season.title')}
        actionLabel={tr('app.season.subtitle')}
        style={{ paddingHorizontal: H_PAD }}
      />
      <FlatList
        ref={listRef}
        data={items}
        keyExtractor={(item) => item.key}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={STEP}
        onScrollBeginDrag={() => {
          dragging.current = true;
        }}
        onMomentumScrollEnd={(e) => {
          dragging.current = false;
          index.current = Math.round(e.nativeEvent.contentOffset.x / STEP);
        }}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: H_PAD, gap: GAP }}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => onPick?.(item.category.id)}
            accessibilityRole="button"
            accessibilityLabel={tr(`app.season.${item.key}.title`)}
            style={[s.card, { backgroundColor: item.bg }]}
          >
            <View style={s.circle} />
            <MaterialCommunityIcons
              name={item.icon}
              size={64}
              color="rgba(255,255,255,0.9)"
              style={s.art}
            />
            <Text style={s.title} numberOfLines={2}>
              {tr(`app.season.${item.key}.title`)}
            </Text>
            <Text style={s.text} numberOfLines={3}>
              {tr(`app.season.${item.key}.text`)}
            </Text>
            <View style={s.cta}>
              <Text style={[s.ctaText, { color: item.bg }]}>{tr('app.season.cta')}</Text>
              <MaterialCommunityIcons name="arrow-right" size={14} color={item.bg} />
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    width: CARD_W,
    minHeight: 150,
    borderRadius: 22,
    padding: 16,
    overflow: 'hidden',
  },
  circle: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    right: -30,
    top: -40,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  art: { position: 'absolute', right: 12, bottom: 10 },
  title: { color: '#fff', fontSize: 16, fontWeight: '800', lineHeight: 20, width: '62%' },
  text: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 12,
    lineHeight: 16,
    marginTop: 5,
    width: '66%',
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    marginTop: 12,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  ctaText: { fontSize: 12, fontWeight: '700' },
});
