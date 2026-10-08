import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { FEATURES } from '../../../constants/config';

const DEFAULT_H_PAD = 20;
const GAP = 12;
const HEIGHT = 156;
const AUTO_MS = 5000;

// Bosh sahifadagi reklama/tanishtiruv bannerlari. Backendda bannerlar uchun endpoint yo'q, shuning
// uchun ular ilovaning o'z bo'limlariga olib boruvchi doimiy slaydlar; keyinchalik serverdan
// kelsa, faqat shu ro'yxat almashtiriladi.
const SLIDES = [
  {
    key: 'verified',
    bg: '#2f5fb3',
    icon: 'shield-check-outline',
    go: { pathname: '/services', params: { verified: '1' } },
  },
  { key: 'order', bg: '#d8602a', icon: 'hammer-wrench', go: '/new-order' },
  { key: 'wallet', bg: '#1f8f6e', icon: 'wallet-outline', go: '/wallet' },
  { key: 'help', bg: '#6d4bb8', icon: 'lifebuoy', go: '/help' },
];

// Onlayn to'lov (v2) qo'shilguncha hamyon slaydi ko'rsatilmaydi.
const ACTIVE_SLIDES = SLIDES.filter((slide) => slide.key !== 'wallet' || FEATURES.walletBalance);

// `onSlidePress(slide)` berilsa, slayd bosilganda o'sha chaqiriladi (mehmon uchun — kirish oynasi);
// berilmasa slaydning o'z yo'nalishiga o'tiladi.
export default function PromoBanners({ style, hPad = DEFAULT_H_PAD, onSlidePress }) {
  const router = useRouter();
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const { width: screenW } = useWindowDimensions();
  const listRef = useRef(null);
  const [index, setIndex] = useState(0);
  const dragging = useRef(false);

  const itemW = screenW - hPad * 2;
  const step = itemW + GAP;

  // Foydalanuvchi suradigan paytdan tashqari har bir necha soniyada keyingi slaydga o'tadi.
  useEffect(() => {
    const id = setInterval(() => {
      if (dragging.current) return;
      setIndex((i) => {
        const next = (i + 1) % ACTIVE_SLIDES.length;
        listRef.current?.scrollToOffset({ offset: next * step, animated: true });
        return next;
      });
    }, AUTO_MS);
    return () => clearInterval(id);
  }, [step]);

  const onMomentumEnd = useCallback(
    (e) => {
      dragging.current = false;
      setIndex(Math.round(e.nativeEvent.contentOffset.x / step));
    },
    [step]
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => (onSlidePress ? onSlidePress(item) : router.navigate(item.go))}
      accessibilityRole="button"
      accessibilityLabel={tr(`app.homePromo.${item.key}.title`)}
      style={[s.card, { width: itemW, backgroundColor: item.bg }]}
    >
      <View style={[s.circle, s.circleBig]} />
      <View style={[s.circle, s.circleSmall]} />
      <MaterialCommunityIcons
        name={item.icon}
        size={104}
        color="rgba(255,255,255,0.92)"
        style={s.art}
      />

      <View style={s.textCol}>
        <Text style={s.title} numberOfLines={2}>
          {tr(`app.homePromo.${item.key}.title`)}
        </Text>
        <Text style={s.text} numberOfLines={3}>
          {tr(`app.homePromo.${item.key}.text`)}
        </Text>
        <View style={s.cta}>
          <Text style={[s.ctaText, { color: item.bg }]}>{tr(`app.homePromo.${item.key}.cta`)}</Text>
          <MaterialCommunityIcons name="arrow-right" size={15} color={item.bg} />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={style}>
      <FlatList
        ref={listRef}
        data={ACTIVE_SLIDES}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={step}
        snapToAlignment="start"
        onScrollBeginDrag={() => {
          dragging.current = true;
        }}
        onMomentumScrollEnd={onMomentumEnd}
        contentContainerStyle={{ paddingHorizontal: hPad, gap: GAP }}
        getItemLayout={(_, i) => ({ length: itemW, offset: step * i, index: i })}
      />
      <View style={s.dots}>
        {ACTIVE_SLIDES.map((slide, i) => (
          <View
            key={slide.key}
            style={[
              s.dot,
              i === index
                ? { width: 20, backgroundColor: t.orange }
                : { width: 6, backgroundColor: t.line2 },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    height: HEIGHT,
    borderRadius: 26,
    padding: 18,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  circle: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 999 },
  circleBig: { width: 190, height: 190, right: -50, top: -60 },
  circleSmall: { width: 110, height: 110, right: 70, bottom: -50 },
  art: { position: 'absolute', right: 14, bottom: 14 },
  textCol: { width: '66%' },
  title: { color: '#fff', fontSize: 18, fontWeight: '800', lineHeight: 22 },
  text: { color: 'rgba(255,255,255,0.88)', fontSize: 12, lineHeight: 16, marginTop: 5 },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: '#fff',
  },
  ctaText: { fontSize: 12, fontWeight: '700' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 5, marginTop: 10 },
  dot: { height: 6, borderRadius: 3 },
});
