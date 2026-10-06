import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import useAutoCarousel from '../hooks/useAutoCarousel';
import EmptyCard from './EmptyCard';
import WorkPhotoCarousel from './WorkPhotoCarousel';

const WK_CARD_W = 168;
const WK_GAP = 12;
const WK_SLOT = WK_CARD_W + WK_GAP;

// "Eng zo'r ishlar" karuseli.
export default function WorksCarousel({ works, onSelectWork }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const total = works.length;

  const {
    listRef,
    activeIndex,
    onScrollBeginDrag,
    onScrollEndDrag,
    onMomentumScrollEnd,
    hold,
  } = useAutoCarousel({ length: total, step: WK_SLOT, trackActive: true });

  if (total === 0) {
    return (
      <EmptyCard
        icon={<MaterialCommunityIcons name="image-multiple-outline" size={22} color={t.muted} />}
        title={tr('app.engZorIshlar.emptyTitle')}
        subtitle={tr('app.engZorIshlar.emptySubtitle')}
      />
    );
  }

  return (
    <View>
      <FlatList
        ref={listRef}
        data={works}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={WK_SLOT}
        decelerationRate="fast"
        onScrollBeginDrag={onScrollBeginDrag}
        onScrollEndDrag={onScrollEndDrag}
        onMomentumScrollEnd={onMomentumScrollEnd}
        contentContainerStyle={{
          paddingLeft: 20,
          paddingRight: 8,
          gap: WK_GAP,
        }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[s.card, { backgroundColor: t.card, borderColor: t.border }]}
            activeOpacity={0.8}
            onPress={() => onSelectWork(item)}
            accessibilityRole="button"
            accessibilityLabel={item.title}
          >
            <View style={[s.img, { backgroundColor: t.isDark ? '#1d2a3a' : '#e0eaf5' }]}>
              <WorkPhotoCarousel photos={item.photos} t={t} onManualNav={hold} />
              <View style={s.ratingBadge}>
                <Ionicons name="star" size={11} color={t.gold} />
                <Text style={{ fontSize: 11, fontWeight: '700', color: t.gold, marginLeft: 3 }}>
                  {item.rating.toFixed(1)}
                </Text>
              </View>
            </View>
            <View style={{ padding: 13 }}>
              <Text style={{ fontWeight: '700', fontSize: 13.5, color: t.text }} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={{ fontSize: 11, color: t.muted, marginTop: 3 }} numberOfLines={1}>
                {item.worker}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
      <View style={s.dots}>
        {works.map((_, i) => (
          <View
            key={i}
            style={[s.dot, { backgroundColor: i === activeIndex ? '#e87a45' : t.card }]}
          />
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    width: WK_CARD_W,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
  },
  img: {
    height: 104,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  ratingBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10,19,34,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    gap: 5,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
