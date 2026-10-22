import { View, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '../../../context/LanguageContext';
import { useHomeListings } from '../../../queries/listings';
import { reelsRoute } from '../../../navigation/params';
import ListingCard from '../../listings/components/ListingCard';
import useOffsetCarousel from '../hooks/useOffsetCarousel';
import SectionHeader from './SectionHeader';
import SectionLoader from './SectionLoader';
import SectionError from './SectionError';

const CARD_W = 176;
const GAP = 12;
const SLOT = CARD_W + GAP;

// "Xizmat e'lonlari" karuseli (bosh sahifa va mehmon sahifasi): o'zi aylanadi, qo'lda surilsa to'xtab
// birozdan keyin davom etadi. `onSeeAll` berilmasa "Barchasi" "E'lonlar" tabiga o'tadi.
// E'lon bo'lmasa bo'lim umuman ko'rinmaydi.
export default function ListingsCarousel({ style, onSeeAll }) {
  const router = useRouter();
  const { t: tr } = useLanguage();
  const { items, loading, error, refetch } = useHomeListings(8);
  const { listRef, listProps } = useOffsetCarousel({ length: items.length, step: SLOT });

  if (!loading && !error && items.length === 0) return null;

  return (
    <View style={style}>
      <SectionHeader
        title={tr('listings.title')}
        actionLabel={tr('common.seeAll')}
        onActionPress={onSeeAll ?? (() => router.navigate('/ads'))}
        style={{ paddingHorizontal: 20 }}
      />
      {loading ? (
        <SectionLoader height={220} />
      ) : error ? (
        <SectionError style={{ marginHorizontal: 20 }} onRetry={refetch} />
      ) : (
        <FlatList
          ref={listRef}
          {...listProps}
          data={items}
          keyExtractor={(item) => String(item.id)}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={SLOT}
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: 20, gap: GAP }}
          renderItem={({ item }) => (
            <ListingCard
              listing={item}
              width={CARD_W}
              onPress={(l) => router.push(reelsRoute(l))}
            />
          )}
        />
      )}
    </View>
  );
}
