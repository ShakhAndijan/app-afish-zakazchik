import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import Avatar from '../../../components/Avatar';
import useAutoCarousel from '../hooks/useAutoCarousel';
import SectionLoader from './SectionLoader';
import SectionError from './SectionError';
import EmptyCard from './EmptyCard';

const SAVED_CARD_W = 148;
const SAVED_CARD_GAP = 12;
const SAVED_STEP = SAVED_CARD_W + SAVED_CARD_GAP;

// "Sevimli ustalar" bo'limi.
export default function FavoriteWorkers({ state, onSelectUsta, onBrowse, onRetry }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const saved = state.data ?? [];

  const {
    listRef,
    activeIndex,
    onScrollBeginDrag,
    onScrollEndDrag,
    onMomentumScrollEnd,
  } = useAutoCarousel({ length: saved.length, step: SAVED_STEP, interval: 2500, trackActive: true });

  if (state.loading) return <SectionLoader height={150} />;

  return (
    <View style={{ paddingTop: 24 }}>
      <View style={s.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
          <Ionicons name="heart" size={17} color={t.red} />
          <Text style={{ fontWeight: '700', fontSize: 16.5, color: t.text }}>
            {tr('zakazchiMain.favorites.title')}
          </Text>
        </View>
      </View>

      {state.error ? (
        <SectionError onRetry={onRetry} style={{ marginHorizontal: 20 }} />
      ) : saved.length === 0 ? (
        <EmptyCard
          icon={<Ionicons name="heart-outline" size={22} color={t.muted} />}
          title={tr('zakazchiMain.favorites.empty')}
          subtitle={tr('zakazchiMain.favorites.emptySubtitle')}
        >
          {!!onBrowse && (
            <TouchableOpacity
              onPress={onBrowse}
              activeOpacity={0.85}
              accessibilityRole="button"
              style={[s.browseBtn, { backgroundColor: t.orange }]}
            >
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12.5 }}>
                {tr('zakazchiMain.favorites.browseCta')}
              </Text>
              <Ionicons name="arrow-forward" size={14} color="#fff" />
            </TouchableOpacity>
          )}
        </EmptyCard>
      ) : (
        <>
          <FlatList
            ref={listRef}
            data={saved}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={SAVED_STEP}
            snapToAlignment="start"
            decelerationRate="fast"
            contentContainerStyle={{ paddingLeft: 20, paddingRight: 20 }}
            keyExtractor={(u) => String(u.id)}
            onScrollBeginDrag={onScrollBeginDrag}
            onScrollEndDrag={onScrollEndDrag}
            onMomentumScrollEnd={onMomentumScrollEnd}
            renderItem={({ item: u, index }) => (
              <TouchableOpacity
                style={[
                  s.savedCard,
                  {
                    backgroundColor: t.card,
                    borderColor: t.border,
                    marginRight: index < saved.length - 1 ? SAVED_CARD_GAP : 0,
                  },
                ]}
                activeOpacity={0.8}
                onPress={() => onSelectUsta(u)}
                accessibilityRole="button"
                accessibilityLabel={u.name}
              >
                <View style={{ alignItems: 'center' }}>
                  <Avatar letter={u.initial} size={50} bgColor={u.color} uri={u.profile_photo} />
                </View>
                <Text
                  style={{
                    fontWeight: '700',
                    fontSize: 13,
                    color: t.text,
                    marginTop: 10,
                    textAlign: 'center',
                  }}
                  numberOfLines={1}
                >
                  {u.name}
                </Text>
                <Text
                  style={{ fontSize: 11, color: t.muted, marginTop: 2, textAlign: 'center' }}
                  numberOfLines={1}
                >
                  {u.profession || tr('zakazchiMain.defaultProfession')}
                </Text>
              </TouchableOpacity>
            )}
          />
          <View style={s.dots}>
            {saved.map((_, i) => (
              <View
                key={i}
                style={{
                  width: i === activeIndex ? 18 : 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: i === activeIndex ? t.orange : t.border,
                }}
              />
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  browseBtn: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
  },
  savedCard: {
    width: SAVED_CARD_W,
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    marginTop: 12,
  },
});
