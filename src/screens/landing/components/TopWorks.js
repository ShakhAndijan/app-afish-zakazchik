import { useState, useEffect } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS } from '../../../constants/colors';
import { useLanguage } from '../../../context/LanguageContext';
import { getTopOrders } from '../../../api/reviews';
import useAutoScroll from '../hooks/useAutoScroll';

const CARD_W = 160;
const GAP = 12;
const SLOT = CARD_W + GAP;

// "Eng zo'r ishlar": baholangan ishlar karuseli (o'zi aylanadi). Ma'lumot bo'lmasa — chizilmaydi.
export default function TopWorks() {
  const { t } = useLanguage();
  const [works, setWorks] = useState([]);
  const listRef = useAutoScroll(works.length, SLOT, 2000);

  useEffect(() => {
    getTopOrders({ limit: 10 })
      .then(setWorks)
      .catch(() => {});
  }, []);

  if (works.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('app.engZorIshlar.title')}</Text>
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={styles.link}>{t('app.engZorIshlar.gallery')}</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        ref={listRef}
        data={works}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={SLOT}
        decelerationRate="fast"
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <WorkCard item={item} />}
      />
    </View>
  );
}

// Bitta ish: suratlar (chap/o'ng tugmalar bilan almashtiriladi), reyting, nom va usta.
function WorkCard({ item }) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const total = item.photos.length;

  const goPrev = () => setPhotoIndex((i) => (i - 1 + total) % total);
  const goNext = () => setPhotoIndex((i) => (i + 1) % total);

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85}>
      <View style={styles.imgBox}>
        <Image source={{ uri: item.photos[photoIndex] }} style={styles.img} />
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={11} color="#FBBF24" />
          <Text style={styles.ratingBadgeText}>{item.rating.toFixed(1)}</Text>
        </View>
        {total > 1 && (
          <>
            <TouchableOpacity
              style={[styles.navBtn, styles.navBtnLeft]}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              onPress={goPrev}
            >
              <Ionicons name="chevron-back" size={14} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navBtn, styles.navBtnRight]}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              onPress={goNext}
            >
              <Ionicons name="chevron-forward" size={14} color="#fff" />
            </TouchableOpacity>
            <View style={styles.dots}>
              {item.photos.map((_, i) => (
                <View key={i} style={[styles.dot, i === photoIndex && styles.dotActive]} />
              ))}
            </View>
          </>
        )}
      </View>
      <Text style={styles.cardTitle} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={styles.cardSub} numberOfLines={1}>
        {item.worker}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 28, marginBottom: 6 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  link: { color: COLORS.orange, fontSize: 14, fontWeight: '600' },
  list: { paddingHorizontal: 16, gap: GAP },
  card: { width: CARD_W },
  imgBox: {
    width: CARD_W,
    height: 140,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    marginBottom: 8,
    overflow: 'hidden',
  },
  img: {
    width: '100%',
    height: '100%',
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    gap: 3,
  },
  ratingBadgeText: { color: COLORS.white, fontSize: 11, fontWeight: '700' },
  navBtn: {
    position: 'absolute',
    top: '50%',
    marginTop: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnLeft: { left: 6 },
  navBtnRight: { right: 6 },
  dots: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotActive: {
    backgroundColor: COLORS.white,
    width: 12,
  },
  cardTitle: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 3,
  },
  cardSub: { color: COLORS.gray, fontSize: 11 },
});
