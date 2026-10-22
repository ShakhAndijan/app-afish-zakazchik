import { useMemo } from 'react';
import { useLocalSearchParams } from 'expo-router';
import ListingReelsScreen from '../screens/ListingReelsScreen';
import useGoBack from '../navigation/useGoBack';
import { decodeParam } from '../navigation/params';

export default function ReelsRoute() {
  const { data, filters, saved } = useLocalSearchParams();
  const initial = useMemo(() => decodeParam(data), [data]);
  const feedFilters = useMemo(() => decodeParam(filters), [filters]);
  return (
    <ListingReelsScreen
      initial={initial}
      filters={feedFilters}
      saved={saved === '1'}
      onBack={useGoBack()}
    />
  );
}
