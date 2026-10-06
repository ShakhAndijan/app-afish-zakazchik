import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { HIT_SLOP } from '../utils';

// Katta rasm: "keyingi/oldingi" tugmalari va nuqtalar bilan; rasm bo'lmasa — bo'sh holat.
function HeroPhotos({ photos, index, onIndexChange }) {
  const { theme: t } = useTheme();

  if (photos.length === 0) {
    return (
      <View
        style={[
          styles.img,
          styles.empty,
          { backgroundColor: t.isDark ? '#1d2a3a' : '#e0eaf5' },
        ]}
      >
        <MaterialCommunityIcons
          name="image-outline"
          size={56}
          color={t.isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.12)'}
        />
      </View>
    );
  }

  const goPrev = () => onIndexChange((index - 1 + photos.length) % photos.length);
  const goNext = () => onIndexChange((index + 1) % photos.length);

  return (
    <View style={styles.wrap}>
      <Image source={{ uri: photos[index] }} style={styles.img} resizeMode="cover" />
      {photos.length > 1 && (
        <>
          <TouchableOpacity style={[styles.navBtn, styles.navBtnLeft]} onPress={goPrev} hitSlop={HIT_SLOP}>
            <Ionicons name="chevron-back" size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.navBtn, styles.navBtnRight]} onPress={goNext} hitSlop={HIT_SLOP}>
            <Ionicons name="chevron-forward" size={18} color="#fff" />
          </TouchableOpacity>
          <View style={styles.dots}>
            {photos.map((_, i) => (
              <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
            ))}
          </View>
        </>
      )}
    </View>
  );
}

// Sahifa tepasidagi rasm bloki: "Bajarildi" belgisi va reyting.
export default function WorkHero({ photos, index, onIndexChange, rating }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();

  return (
    <View style={{ position: 'relative' }}>
      <HeroPhotos photos={photos} index={index} onIndexChange={onIndexChange} />

      <View style={[styles.pill, { left: 16 }]}>
        <Ionicons name="checkmark-circle" size={13} color="#2fa37a" />
        <Text style={styles.doneText}>{tr('workDetail.done')}</Text>
      </View>

      <View style={[styles.pill, { right: 16, gap: 4 }]}>
        <Ionicons name="star" size={13} color={t.gold} />
        <Text style={[styles.ratingText, { color: t.gold }]}>{rating.toFixed(1)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', height: 300 },
  img: { width: '100%', height: '100%' },
  empty: { alignItems: 'center', justifyContent: 'center' },
  navBtn: {
    position: 'absolute',
    top: '50%',
    marginTop: -16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(10,19,34,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnLeft: { left: 14 },
  navBtnRight: { right: 14 },
  dots: {
    position: 'absolute',
    bottom: 14,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive: { width: 16, backgroundColor: '#fff' },

  pill: {
    position: 'absolute',
    top: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(10,19,34,0.72)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  doneText: { color: '#fff', fontSize: 11.5, fontWeight: '700' },
  ratingText: { fontSize: 12.5, fontWeight: '800' },
});
