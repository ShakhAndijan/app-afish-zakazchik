import { View, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '../../../context/LanguageContext';
import { useWorkerListings } from '../../../queries/listings';
import { reelsRoute } from '../../../navigation/params';
import ListingCard from '../../listings/components/ListingCard';
import SectionTitle from './SectionTitle';

const CARD_W = 176;

// Usta profilidagi "E'lonlari" bo'limi (butun ekran kengligidagi karusel). E'loni bo'lmasa ko'rinmaydi.
export default function ListingsSection({ workerId }) {
  const router = useRouter();
  const { t: tr } = useLanguage();
  const { items } = useWorkerListings(workerId);

  if (items.length === 0) return null;

  return (
    <View style={{ marginTop: 6, marginBottom: 18 }}>
      <SectionTitle
        icon="storefront-outline"
        title={tr('listings.workerListings')}
        style={{ paddingHorizontal: 20 }}
      />
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
        renderItem={({ item }) => (
          <ListingCard
            listing={item}
            width={CARD_W}
            onPress={(l) => router.push(reelsRoute(l, { filters: { workerId } }))}
          />
        )}
      />
    </View>
  );
}
