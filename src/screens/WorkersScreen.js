import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  useWindowDimensions,
  StyleSheet,
} from 'react-native';
import { appAlert } from '../components/AppAlert';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AppLoader from '../components/AppLoader';
import ListingCard from '../components/ListingCard';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import LocationMapPicker from '../components/LocationMapPicker';
import { useWorkersFeed } from '../queries/workers';
import { ustaRoute, newOrderRoute } from '../navigation/params';
import EmptyCard from './zakazchi-main/components/EmptyCard';
import SectionError from './zakazchi-main/components/SectionError';
import WorkersFilterSheet from './workers/WorkersFilterSheet';
import WorkersMap from './workers/WorkersMap';
import { toListingCardShape } from './xizmatlar/utils';
import { CATEGORY_ACCENT } from './xizmatlar/constants';

const H_PAD = 20;
const SEARCH_DELAY_MS = 400;
const SORTS = ['rating', 'newest', 'price', 'experience'];
const LIST_PAGE = 20;
// Xaritada bir martada ko'proq usta ko'rinishi uchun sahifa kattaroq.
const MAP_PAGE = 50;
const formatKm = (km) => (km < 10 ? km.toFixed(1) : String(Math.round(km)));
const NO_FILTERS = {
  parentId: null,
  subId: null,
  regionId: null,
  districtId: null,
  minRating: null,
  badge: null,
  isOnline: false,
  verifiedOnly: false,
};

// Barcha ustalar: qidiruv, saralash, "Yaqinimda" (joylashuv bo'yicha eng yaqinlar) va filtrlar
// (viloyat/tuman, reyting, status, onlayn, tasdiqlangan). Natija ro'yxat yoki xarita ko'rinishida.
export default function WorkersScreen({ onBack }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const { signedIn } = useAuth();

  const [queryInput, setQueryInput] = useState('');
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('rating');
  const [filter, setFilter] = useState(NO_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [view, setView] = useState('list');
  const [coords, setCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  // Joylashuvni xaritadan qo'lda tanlash (ruxsat berilmaganda yoki aniqlab bo'lmaganda).
  const [pickerOpen, setPickerOpen] = useState(false);
  const [picked, setPicked] = useState(null);

  // Har harf uchun so'rov yuborilmasligi uchun qidiruv matni biroz kutib qo'llanadi.
  useEffect(() => {
    const id = setTimeout(() => setQ(queryInput.trim()), SEARCH_DELAY_MS);
    return () => clearTimeout(id);
  }, [queryInput]);

  const filters = useMemo(
    () => ({
      q,
      sort,
      ...filter,
      categoryId: filter.subId ?? filter.parentId,
      nearLat: coords?.lat ?? null,
      nearLon: coords?.lon ?? null,
    }),
    [q, sort, filter, coords]
  );
  const mapMode = view === 'map';
  const feed = useWorkersFeed(filters, mapMode ? MAP_PAGE : LIST_PAGE);

  const mapPins = useMemo(
    () =>
      feed.items
        .filter((w) => w.latitude != null && w.longitude != null)
        .map((w) => ({ id: w.id, lat: w.latitude, lon: w.longitude })),
    [feed.items]
  );
  const noLocationCount = feed.items.length - mapPins.length;
  const selected = selectedId != null ? feed.items.find((w) => w.id === selectedId) : null;
  const hasMore = feed.total != null && feed.items.length < feed.total;

  // "Yaqinimda": joylashuvga ruxsat so'raladi, aniqlangach ro'yxat masofa bo'yicha saralanadi.
  // Koordinata saqlanadi — qayta yoqilganda ruxsat qaytadan so'ralmaydi.
  const toggleNearby = async () => {
    if (sort === 'distance') {
      setSort('rating');
      return;
    }
    if (coords) {
      setSort('distance');
      return;
    }
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        appAlert(tr('workersList.nearbyDeniedTitle'), tr('workersList.nearbyDeniedMsg'), [
          { text: tr('common.cancel'), style: 'cancel' },
          { text: tr('workersList.pickOnMap'), onPress: () => setPickerOpen(true) },
        ]);
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      // 4 xona (~10 m) — har bir kichik siljishda so'rov keshi yangilanib ketmasligi uchun.
      setCoords({
        lat: Number(pos.coords.latitude.toFixed(4)),
        lon: Number(pos.coords.longitude.toFixed(4)),
      });
      setSort('distance');
    } catch {
      appAlert(tr('workersList.nearby'), tr('workersList.nearbyError'), [
        { text: tr('common.cancel'), style: 'cancel' },
        { text: tr('workersList.pickOnMap'), onPress: () => setPickerOpen(true) },
      ]);
    } finally {
      setLocating(false);
    }
  };

  const confirmPicked = () => {
    if (picked) {
      setCoords({
        lat: Number(Number(picked.lat).toFixed(4)),
        lon: Number(Number(picked.lng).toFixed(4)),
      });
      setSort('distance');
    }
    setPickerOpen(false);
  };

  // "Bog'lanish": shu ustaga buyurtma berish (kirmagan bo'lsa avval kirish).
  const contact = (w) => {
    if (!signedIn) {
      router.push('/login');
      return;
    }
    router.navigate(
      newOrderRoute({
        id: w.id,
        name: w.name,
        trade: w.mainCategory || w.profession,
        bgColor: w.color,
        initial: w.initial,
        categoryId: w.categoryId,
      })
    );
  };

  // Karta ma'lumotiga masofa (km) qo'shiladi: "2.3 km · Chilonzor, Toshkent".
  const toCard = (w) => {
    const card = {
      ...toListingCardShape(w, tr),
      reviewCount: w.reviewCount,
      tags: w.skills.slice(0, 3),
    };
    if (w.mainCategory) card.title = w.mainCategory;
    if (w.distanceKm != null) {
      card.location = [tr('workersList.distance', { n: formatKm(w.distanceKm) }), card.location]
        .filter(Boolean)
        .join(' · ');
    }
    return card;
  };
  const activeCount =
    (filter.parentId != null ? 1 : 0) +
    (filter.regionId != null ? 1 : 0) +
    (filter.minRating != null ? 1 : 0) +
    (filter.badge != null ? 1 : 0) +
    (filter.isOnline ? 1 : 0) +
    (filter.verifiedOnly ? 1 : 0);

  const cardColors = {
    card: t.card,
    border: t.border,
    text: t.text,
    muted: t.muted,
    gold: t.gold,
  };

  const header = (
    <View style={s.headWrap}>
      <View style={s.searchRow}>
        <View style={[s.search, { backgroundColor: t.card, borderColor: t.border }]}>
          <MaterialCommunityIcons name="magnify" size={20} color={t.muted} />
          <TextInput
            value={queryInput}
            onChangeText={setQueryInput}
            placeholder={tr('workersList.searchPlaceholder')}
            placeholderTextColor={t.faint}
            returnKeyType="search"
            style={[s.searchInput, { color: t.text }]}
          />
          {!!queryInput && (
            <TouchableOpacity onPress={() => setQueryInput('')} hitSlop={10}>
              <MaterialCommunityIcons name="close-circle" size={18} color={t.faint} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          onPress={() => setFilterOpen(true)}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={tr('workersList.filters.title')}
          style={[
            s.filterBtn,
            {
              backgroundColor: activeCount > 0 ? t.orange : t.card,
              borderColor: activeCount > 0 ? t.orange : t.border,
            },
          ]}
        >
          <MaterialCommunityIcons
            name="tune-variant"
            size={22}
            color={activeCount > 0 ? '#fff' : t.text}
          />
          {activeCount > 0 && (
            <View style={[s.badge, { backgroundColor: t.text }]}>
              <Text style={[s.badgeTxt, { color: t.bg }]}>{activeCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={s.sortRow}
      >
        <TouchableOpacity
          onPress={toggleNearby}
          disabled={locating}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityState={{ selected: sort === 'distance', busy: locating }}
          style={[
            s.sortChip,
            s.nearChip,
            {
              backgroundColor: sort === 'distance' ? t.orange : t.card,
              borderColor: sort === 'distance' ? t.orange : t.border,
            },
          ]}
        >
          {locating ? (
            <ActivityIndicator size="small" color={t.orange} />
          ) : (
            <MaterialCommunityIcons
              name="crosshairs-gps"
              size={16}
              color={sort === 'distance' ? '#fff' : t.orange}
            />
          )}
          <Text style={[s.sortTxt, { color: sort === 'distance' ? '#fff' : t.text }]}>
            {tr('workersList.nearby')}
          </Text>
        </TouchableOpacity>
        {SORTS.map((key) => {
          const on = sort === key;
          return (
            <TouchableOpacity
              key={key}
              onPress={() => setSort(key)}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              style={[
                s.sortChip,
                {
                  backgroundColor: on ? t.orange : t.card,
                  borderColor: on ? t.orange : t.border,
                },
              ]}
            >
              <Text style={[s.sortTxt, { color: on ? '#fff' : t.text }]}>
                {tr(`workersList.sort.${key}`)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {!mapMode && !feed.loading && !feed.error && feed.total != null && (
        <Text style={[s.count, { color: t.muted }]}>
          {tr('workersList.count', { n: feed.total })}
        </Text>
      )}
    </View>
  );

  let empty;
  if (feed.loading) {
    empty = (
      <View style={s.center}>
        <AppLoader size={120} />
      </View>
    );
  } else if (feed.error) {
    empty = <SectionError style={{ marginHorizontal: H_PAD }} onRetry={feed.refetch} />;
  } else {
    empty = (
      <EmptyCard
        icon={<MaterialCommunityIcons name="account-search-outline" size={26} color={t.muted} />}
        title={tr('workersList.emptyTitle')}
        subtitle={tr('workersList.emptySub')}
      />
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      {mapMode && (
        <WorkersMap
          style={StyleSheet.absoluteFill}
          pins={mapPins}
          me={coords}
          selectedId={selected ? selected.id : null}
          onSelect={setSelectedId}
          fitKey={JSON.stringify(filters)}
        />
      )}
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']} pointerEvents="box-none">
        <StatusBar style={t.isDark && !mapMode ? 'light' : 'dark'} />

        <View style={s.header}>
          <TouchableOpacity
            style={[s.backBtn, { backgroundColor: t.card, borderColor: t.border }]}
            onPress={onBack}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={tr('common.back')}
          >
            <MaterialCommunityIcons name="chevron-left" size={24} color={t.text} />
          </TouchableOpacity>
          {mapMode ? (
            <View style={{ flex: 1 }} pointerEvents="none" />
          ) : (
            <Text style={[s.title, { color: t.text }]} numberOfLines={1}>
              {tr('workersList.title')}
            </Text>
          )}
          <View style={[s.viewToggle, { backgroundColor: t.card, borderColor: t.border }]}>
            {[
              ['list', 'format-list-bulleted'],
              ['map', 'map-outline'],
            ].map(([key, icon]) => {
              const on = view === key;
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => setView(key)}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel={tr(`workersList.view.${key}`)}
                  accessibilityState={{ selected: on }}
                  style={[s.viewBtn, on && { backgroundColor: t.orange }]}
                >
                  <MaterialCommunityIcons name={icon} size={20} color={on ? '#fff' : t.muted} />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {mapMode ? (
          <>
            {header}
            <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
              {!selected && !feed.error && (feed.loading || noLocationCount > 0 || hasMore) && (
                <View
                  style={[s.mapBottom, { bottom: insets.bottom + 16 }]}
                  pointerEvents="box-none"
                >
                  {feed.loading && (
                    <View style={[s.mapNote, { backgroundColor: t.card, borderColor: t.border }]}>
                      <ActivityIndicator size="small" color={t.orange} />
                    </View>
                  )}
                  {!feed.loading && noLocationCount > 0 && (
                    <View
                      style={[s.mapNote, { backgroundColor: t.card, borderColor: t.border }]}
                      pointerEvents="none"
                    >
                      <Text style={[s.mapNoteTxt, { color: t.muted }]}>
                        {tr('workersList.map.noLocation', { n: noLocationCount })}
                      </Text>
                    </View>
                  )}
                  {hasMore && (
                    <TouchableOpacity
                      onPress={feed.loadMore}
                      disabled={feed.fetchingMore}
                      activeOpacity={0.85}
                      style={[s.moreBtn, { backgroundColor: t.orange }]}
                    >
                      {feed.fetchingMore ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={s.moreTxt}>{tr('workersList.map.more')}</Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              )}
              {!feed.loading && !feed.error && mapPins.length === 0 && (
                <View style={s.mapEmpty} pointerEvents="none">
                  <View style={[s.mapEmptyBox, { backgroundColor: t.card, borderColor: t.border }]}>
                    <Text style={[s.mapNoteTxt, { color: t.text, textAlign: 'center' }]}>
                      {tr('workersList.map.empty')}
                    </Text>
                  </View>
                </View>
              )}
              {feed.error && !feed.loading && (
                <View style={s.mapEmpty} pointerEvents="box-none">
                  <SectionError onRetry={feed.refetch} />
                </View>
              )}
              {selected && (
                <View style={[s.mapCard, { bottom: insets.bottom + 12 }]}>
                  <ListingCard
                    listing={toCard(selected)}
                    accent={CATEGORY_ACCENT}
                    colors={cardColors}
                    onPress={() => router.push(ustaRoute(selected))}
                    onContact={() => contact(selected)}
                  />
                </View>
              )}
            </View>
          </>
        ) : (
          <FlatList
            data={feed.items}
            keyExtractor={(w) => String(w.id)}
            contentContainerStyle={{ paddingBottom: 28 + insets.bottom, flexGrow: 1 }}
            ListHeaderComponent={header}
            ListEmptyComponent={empty}
            ListFooterComponent={
              feed.fetchingMore ? (
                <ActivityIndicator color={t.orange} style={{ marginVertical: 14 }} />
              ) : null
            }
            renderItem={({ item }) => (
              <View style={{ paddingHorizontal: H_PAD, marginBottom: 12 }}>
                <ListingCard
                  listing={toCard(item)}
                  accent={CATEGORY_ACCENT}
                  colors={cardColors}
                  onPress={() => router.push(ustaRoute(item))}
                  onContact={() => contact(item)}
                />
              </View>
            )}
            onEndReached={feed.loadMore}
            onEndReachedThreshold={0.6}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={feed.refreshing}
                onRefresh={feed.refetch}
                tintColor={t.orange}
                colors={[t.orange]}
              />
            }
          />
        )}
      </SafeAreaView>

      {pickerOpen && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: t.bg }]}>
          <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
            <View style={s.header}>
              <TouchableOpacity
                style={[s.backBtn, { backgroundColor: t.card, borderColor: t.border }]}
                onPress={() => setPickerOpen(false)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={tr('common.back')}
              >
                <MaterialCommunityIcons name="close" size={22} color={t.text} />
              </TouchableOpacity>
              <Text style={[s.title, { color: t.text }]} numberOfLines={1}>
                {tr('workersList.pickTitle')}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <LocationMapPicker
                fill
                showExpand={false}
                borderRadius={0}
                lat={picked?.lat}
                lng={picked?.lng}
                onChange={(lat, lng) => setPicked({ lat, lng })}
                showTapHint
                tapHint={tr('workersList.pickHint')}
              />
            </View>
            <View style={[s.pickActions, { paddingBottom: insets.bottom + 12 }]}>
              <TouchableOpacity
                onPress={confirmPicked}
                disabled={!picked}
                activeOpacity={0.85}
                style={[s.pickBtn, { backgroundColor: t.orange, opacity: picked ? 1 : 0.5 }]}
              >
                <Text style={s.moreTxt}>{tr('workersList.pickConfirm')}</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      )}

      {filterOpen && (
        <WorkersFilterSheet
          value={filter}
          onChange={setFilter}
          onReset={() => setFilter(NO_FILTERS)}
          onClose={() => setFilterOpen(false)}
          maxHeight={height * 0.82}
          bottomInset={insets.bottom}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: H_PAD,
    paddingTop: 12,
    paddingBottom: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { flex: 1, fontWeight: '700', fontSize: 20 },
  headWrap: { gap: 12, paddingBottom: 14 },
  searchRow: { flexDirection: 'row', gap: 10, paddingHorizontal: H_PAD },
  search: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  searchInput: { flex: 1, fontSize: 14.5, padding: 0 },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeTxt: { fontSize: 10.5, fontWeight: '800' },
  sortRow: { paddingHorizontal: H_PAD, gap: 8, alignItems: 'center' },
  viewToggle: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 3,
    gap: 2,
  },
  viewBtn: {
    width: 38,
    height: 32,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nearChip: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  mapBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 8,
  },
  mapNote: {
    paddingHorizontal: 12,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'transparent',
    justifyContent: 'center',
  },
  mapNoteTxt: { fontSize: 12.5, fontWeight: '600' },
  mapEmpty: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: H_PAD,
  },
  mapEmptyBox: { borderRadius: 16, borderWidth: 1, padding: 16 },
  moreBtn: {
    height: 42,
    minWidth: 130,
    paddingHorizontal: 20,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickActions: { paddingHorizontal: H_PAD, paddingTop: 12 },
  pickBtn: { height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  moreTxt: { color: '#fff', fontSize: 14, fontWeight: '800' },
  mapCard: { position: 'absolute', left: H_PAD, right: H_PAD },
  sortChip: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
  },
  sortTxt: { fontSize: 13, fontWeight: '700' },
  count: { fontSize: 12.5, fontWeight: '600', paddingHorizontal: H_PAD },
  center: { paddingVertical: 80, alignItems: 'center', justifyContent: 'center' },
});
