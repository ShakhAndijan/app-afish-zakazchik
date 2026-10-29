import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { appAlert } from '../components/AppAlert';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import Avatar from '../components/Avatar';
import AppLoader from '../components/AppLoader';
import SectionError from './zakazchi-main/components/SectionError';
import { getFavoritesPage, unlikeWorker } from '../api/workers';
import { getFavoriteListingsPage } from '../api/listings';
import { listingsRoute, ustaRoute } from '../navigation/params';
import { getErrorMessage } from '../utils/errors';
import useBottomInset from '../hooks/useBottomInset';

const EMPTY = [];

// Sevimlilar (saytdagi "Sevimlilar"): "Mutaxassislar (N)" va "E'lonlar (N)" — e'lonlar tabi
// saqlangan e'lonlar ekranini ochadi.
export default function FavoritesScreen({ onBack }) {
  const bottomInset = useBottomInset();
  const router = useRouter();
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const queryClient = useQueryClient();

  const workers = useQuery({
    queryKey: ['favorites', 'list'],
    queryFn: () => getFavoritesPage({ size: 100 }),
  });
  const listings = useQuery({
    queryKey: ['favorites', 'listings-count'],
    queryFn: () => getFavoriteListingsPage({ size: 1 }),
    staleTime: 30 * 1000,
  });

  const remove = useMutation({
    mutationFn: unlikeWorker,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['workers'] });
    },
    onError: (e) => appAlert(tr('common.errorTitle'), getErrorMessage(e, tr)),
  });

  const confirmRemove = (w) =>
    appAlert(tr('favorites.removeConfirm'), w.name, [
      { text: tr('common.cancel'), style: 'cancel' },
      { text: tr('favorites.remove'), style: 'destructive', onPress: () => remove.mutate(w.id) },
    ]);

  const items = workers.data?.items ?? EMPTY;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top', 'left', 'right']}>
      <StatusBar style={t.isDark ? 'light' : 'dark'} />
      <View style={s.header}>
        <TouchableOpacity
          style={[s.backBtn, { backgroundColor: t.card, borderColor: t.border }]}
          onPress={onBack}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="chevron-left" size={24} color={t.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[s.title, { color: t.text }]}>{tr('favorites.title')}</Text>
          <Text style={[s.subtitle, { color: t.faint }]}>{tr('favorites.subtitle')}</Text>
        </View>
      </View>

      <View style={[s.tabs, { backgroundColor: t.card, borderColor: t.border }]}>
        <View style={[s.tab, { backgroundColor: t.orange }]}>
          <Text style={[s.tabText, { color: '#fff' }]}>
            {tr('favorites.tabWorkers')}
            {workers.data ? ` (${workers.data.total})` : ''}
          </Text>
        </View>
        <TouchableOpacity
          style={s.tab}
          activeOpacity={0.8}
          onPress={() => router.push(listingsRoute({ saved: true }))}
        >
          <Text style={[s.tabText, { color: t.muted }]}>
            {tr('favorites.tabListings')}
            {listings.data ? ` (${listings.data.total})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {workers.isPending ? (
        <View style={s.center}>
          <AppLoader size={140} />
        </View>
      ) : workers.isError ? (
        <SectionError style={{ marginHorizontal: 20, marginTop: 24 }} onRetry={workers.refetch} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(w) => String(w.id)}
          contentContainerStyle={{
            padding: 20,
            paddingBottom: 20 + bottomInset,
            gap: 10,
            flexGrow: 1,
          }}
          refreshing={workers.isRefetching}
          onRefresh={workers.refetch}
          ListEmptyComponent={
            <View style={s.center}>
              <MaterialCommunityIcons name="heart-outline" size={42} color={t.faint} />
              <Text style={[s.empty, { color: t.muted }]}>{tr('favorites.empty')}</Text>
              <TouchableOpacity
                style={[s.browse, { backgroundColor: t.orange }]}
                activeOpacity={0.85}
                onPress={() => router.push('/workers')}
              >
                <Text style={s.browseText}>{tr('favorites.browse')}</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[s.row, { backgroundColor: t.card, borderColor: t.border }]}
              activeOpacity={0.85}
              onPress={() => router.push(ustaRoute(item))}
            >
              <Avatar
                letter={item.initial}
                bgColor={item.color}
                uri={item.profile_photo}
                size={52}
              />
              <View style={{ flex: 1 }}>
                <Text style={[s.name, { color: t.text }]} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={[s.meta, { color: t.muted }]} numberOfLines={1}>
                  {[item.mainCategory || item.profession, item.location]
                    .filter(Boolean)
                    .join(' · ')}
                </Text>
                <View style={s.rating}>
                  <MaterialCommunityIcons name="star" size={14} color={t.gold} />
                  <Text style={[s.ratingText, { color: t.text }]}>{item.rating.toFixed(1)}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={s.heart}
                hitSlop={8}
                disabled={remove.isPending}
                onPress={() => confirmRemove(item)}
                accessibilityLabel={tr('favorites.remove')}
              >
                <MaterialCommunityIcons name="heart" size={22} color={t.red} />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 50 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontWeight: '800', fontSize: 22 },
  subtitle: { fontSize: 12.5, marginTop: 1 },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 20,
    borderWidth: 1,
    borderRadius: 14,
    padding: 4,
  },
  tab: { flex: 1, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  tabText: { fontSize: 13.5, fontWeight: '700' },
  empty: { fontSize: 14 },
  browse: {
    height: 44,
    paddingHorizontal: 22,
    borderRadius: 13,
    justifyContent: 'center',
    marginTop: 6,
  },
  browseText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
  },
  name: { fontSize: 15, fontWeight: '800' },
  meta: { fontSize: 12.5, marginTop: 2 },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  ratingText: { fontSize: 12.5, fontWeight: '700' },
  heart: { padding: 6 },
});
