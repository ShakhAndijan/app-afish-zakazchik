import { useMemo } from 'react';
import { useLocalSearchParams } from 'expo-router';
import ListingDetailScreen from '../../screens/ListingDetailScreen';
import useGoBack from '../../navigation/useGoBack';
import { decodeParam } from '../../navigation/params';

export default function ListingRoute() {
  const { id, data } = useLocalSearchParams();
  const initial = useMemo(() => decodeParam(data), [data]);
  return <ListingDetailScreen listingId={String(id)} initial={initial} onBack={useGoBack()} />;
}
