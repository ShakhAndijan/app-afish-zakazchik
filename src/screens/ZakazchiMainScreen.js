import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import ZakazchiProfileScreen from './ZakazchiProfileScreen';
import UstaDetailScreen from './UstaDetailScreen';
import XizmatlarScreen from './XizmatlarScreen';
import WorkDetailScreen from './WorkDetailScreen';
import NewOrderScreen from './NewOrderScreen';
import WalletScreen from './WalletScreen';
import BottomNav from '../components/BottomNav';
import AfishLoader from '../components/AfishLoader';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';
import { useWallet } from '../context/WalletContext';
import { getCategories } from '../api/categories';
import { getWorkers, getFavorites } from '../api/workers';
import { getTopOrders, getTopComments } from '../api/reviews';
import { getSystemStats } from '../api/stats';
import { getToken } from '../utils/token';

const fmt = (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

const SVC_GAP = 10;
const SVC_H_PAD = 20;
const SVC_VISIBLE = 4;

const SAVED_CARD_W = 148;
const SAVED_CARD_GAP = 12;

const BENEFITS = [
  { icon: 'shield-check', color: '#2ecc71', key: 'guaranteed' },
  { icon: 'check-decagram', color: '#3b82f6', key: 'verified' },
  { icon: 'lightning-bolt', color: '#f5b81f', key: 'fast' },
];

const ServiceCarousel = forwardRef(function ServiceCarousel(
  { categories, onSelectCategory },
  ref
) {
  const { theme: t } = useTheme();
  const { width: screenW } = useWindowDimensions();
  const [active, setActive] = useState(null);
  const listRef = useRef(null);
  const idxRef = useRef(0);
  const pausedRef = useRef(false);

  useImperativeHandle(ref, () => ({
    resume: () => {
      pausedRef.current = false;
      setActive(null);
      onSelectCategory?.(null);
    },
  }));

  const loopLen = categories.length;
  const servicesLoop = useMemo(() => {
    if (loopLen === 0) return [];
    return [
      ...categories.map((c) => ({ ...c, uid: `a-${c.id}` })),
      ...categories.map((c) => ({ ...c, uid: `b-${c.id}` })),
      ...categories.map((c) => ({ ...c, uid: `c-${c.id}` })),
    ];
  }, [categories, loopLen]);

  const itemW = Math.floor(
    (screenW - SVC_H_PAD * 2 - SVC_GAP * (SVC_VISIBLE - 1)) / SVC_VISIBLE
  );
  const itemStep = itemW + SVC_GAP;

  useEffect(() => {
    if (loopLen === 0) return;
    idxRef.current = loopLen;
    const init = setTimeout(() => {
      listRef.current?.scrollToOffset({
        offset: loopLen * itemStep,
        animated: false,
      });
    }, 0);
    return () => clearTimeout(init);
  }, [itemStep, loopLen]);

  useEffect(() => {
    if (loopLen === 0) return;
    const timer = setInterval(() => {
      if (pausedRef.current) return;
      idxRef.current += 1;
      if (idxRef.current >= loopLen * 2) {
        idxRef.current = loopLen;
        listRef.current?.scrollToOffset({
          offset: loopLen * itemStep,
          animated: false,
        });
        return;
      }
      listRef.current?.scrollToOffset({
        offset: idxRef.current * itemStep,
        animated: true,
      });
    }, 2000);
    return () => clearInterval(timer);
  }, [itemStep, loopLen]);

  const renderItem = useCallback(
    ({ item }) => {
      const isActive = active === item.id;
      const color = item.color || t.orange;
      return (
        <TouchableOpacity
          style={[
            s.svcItem,
            {
              width: itemW,
              backgroundColor: t.card,
              borderColor: isActive ? color : t.border,
            },
          ]}
          onPress={() => {
            pausedRef.current = true;
            const next = isActive ? null : item.id;
            setActive(next);
            onSelectCategory?.(next);
          }}
          activeOpacity={0.8}
        >
          <View
            style={[
              s.svcIconBox,
              { backgroundColor: isActive ? color : t.rowIconBg },
            ]}
          >
            {item.icon ? (
              <Text style={{ fontSize: 20 }}>{item.icon}</Text>
            ) : (
              <MaterialCommunityIcons
                name="toolbox-outline"
                size={22}
                color={isActive ? '#fff' : color}
              />
            )}
          </View>
          <Text
            style={[s.svcLabel, { color: isActive ? color : t.muted }]}
            numberOfLines={2}
          >
            {item.name}
          </Text>
        </TouchableOpacity>
      );
    },
    [active, t, itemW, onSelectCategory]
  );

  if (loopLen === 0) return null;

  return (
    <FlatList
      ref={listRef}
      data={servicesLoop}
      keyExtractor={(item) => item.uid}
      renderItem={renderItem}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: SVC_H_PAD,
        paddingVertical: 4,
        gap: SVC_GAP,
      }}
      getItemLayout={(_, index) => ({
        length: itemW,
        offset: itemStep * index,
        index,
      })}
    />
  );
});

const WK_CARD_W = 168;
const WK_GAP = 12;
const WK_SLOT = WK_CARD_W + WK_GAP;

function WorkPhotoCarousel({ photos, t, onManualNav }) {
  const [index, setIndex] = useState(0);

  if (photos.length === 0) {
    return (
      <MaterialCommunityIcons
        name="image-outline"
        size={46}
        color={t.isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.12)'}
      />
    );
  }

  const goPrev = () => {
    onManualNav?.();
    setIndex((i) => (i - 1 + photos.length) % photos.length);
  };
  const goNext = () => {
    onManualNav?.();
    setIndex((i) => (i + 1) % photos.length);
  };

  return (
    <>
      <Image
        source={{ uri: photos[index] }}
        style={wk.photo}
        resizeMode="cover"
      />
      {photos.length > 1 && (
        <>
          <TouchableOpacity
            style={[wk.navBtn, wk.navBtnLeft]}
            onPress={goPrev}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-back" size={14} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[wk.navBtn, wk.navBtnRight]}
            onPress={goNext}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-forward" size={14} color="#fff" />
          </TouchableOpacity>
          <View style={wk.photoDots}>
            {photos.map((_, i) => (
              <View
                key={i}
                style={[
                  wk.photoDot,
                  {
                    backgroundColor:
                      i === index ? '#fff' : 'rgba(255,255,255,0.45)',
                  },
                ]}
              />
            ))}
          </View>
        </>
      )}
    </>
  );
}

function WorksCarousel({ works, onSelectWork }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const listRef = useRef(null);
  const idxRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const pausedRef = useRef(false);

  const total = works.length;

  useEffect(() => {
    if (total === 0) return;
    const timer = setInterval(() => {
      if (pausedRef.current) return;
      const next = (idxRef.current + 1) % total;
      idxRef.current = next;
      setActiveIndex(next);
      listRef.current?.scrollToOffset({
        offset: next * WK_SLOT,
        animated: true,
      });
    }, 2000);
    return () => clearInterval(timer);
  }, [total]);

  if (total === 0) {
    return (
      <View
        style={{
          marginHorizontal: 20,
          paddingVertical: 22,
          paddingHorizontal: 18,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: t.border,
          backgroundColor: t.card,
          alignItems: 'center',
          gap: 6,
        }}
      >
        <MaterialCommunityIcons name="image-multiple-outline" size={22} color={t.muted} />
        <Text style={{ fontSize: 13, fontWeight: '600', color: t.muted, textAlign: 'center' }}>
          {tr('app.engZorIshlar.emptyTitle')}
        </Text>
        <Text style={{ fontSize: 12, color: t.faint, textAlign: 'center', lineHeight: 17 }}>
          {tr('app.engZorIshlar.emptySubtitle')}
        </Text>
      </View>
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
        contentContainerStyle={{
          paddingLeft: 20,
          paddingRight: 8,
          gap: WK_GAP,
        }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              wk.card,
              { backgroundColor: t.card, borderColor: t.border },
            ]}
            activeOpacity={0.8}
            onPress={() => onSelectWork(item)}
          >
            <View
              style={[
                wk.img,
                { backgroundColor: t.isDark ? '#1d2a3a' : '#e0eaf5' },
              ]}
            >
              <WorkPhotoCarousel
                photos={item.photos}
                t={t}
                onManualNav={() => {
                  pausedRef.current = true;
                }}
              />
              <View style={wk.ratingBadge}>
                <Ionicons name="star" size={11} color={t.gold} />
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '700',
                    color: t.gold,
                    marginLeft: 3,
                  }}
                >
                  {item.rating.toFixed(1)}
                </Text>
              </View>
            </View>
            <View style={{ padding: 13 }}>
              <Text
                style={{ fontWeight: '700', fontSize: 13.5, color: t.text }}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              <Text
                style={{ fontSize: 11, color: t.muted, marginTop: 3 }}
                numberOfLines={1}
              >
                {item.worker}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
      <View style={wk.dots}>
        {works.map((_, i) => (
          <View
            key={i}
            style={[
              wk.dot,
              { backgroundColor: i === activeIndex ? '#e87a45' : t.card },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const wk = StyleSheet.create({
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
  photo: { width: '100%', height: '100%' },
  navBtn: {
    position: 'absolute',
    top: '50%',
    marginTop: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(10,19,34,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnLeft: { left: 6 },
  navBtnRight: { right: 6 },
  photoDots: {
    position: 'absolute',
    bottom: 6,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  photoDot: { width: 4, height: 4, borderRadius: 2 },
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

function TopUstalar({ onSelectUsta, categoryId, initialWorkers }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const [workers, setWorkers] = useState(initialWorkers);
  const [loading, setLoading] = useState(false);
  const isFirstRun = useRef(true);

  useEffect(() => {
    // Boshlang'ich ma'lumot allaqachon umumiy loader orqali kelgan
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    let cancelled = false;
    setLoading(true);
    getWorkers({ page: 1, size: 5, categoryId })
      .then((items) => {
        // console.log('workers:', items);
        if (!cancelled) {
          setWorkers(items);
          setLoading(false);
        }
      })
      .catch(() => {
        // Backenddan ma'lumot kelmasa, loading holatida qoldiramiz
      });
    return () => {
      cancelled = true;
    };
  }, [categoryId]);

  if (loading) {
    return (
      <View
        style={{ height: 176, alignItems: 'center', justifyContent: 'center' }}
      >
        <AfishLoader size={90} />
      </View>
    );
  }

  if (workers.length === 0) return null;

  return (
    <>
      {workers.map((u, i) => (
        <TouchableOpacity
          key={u.id}
          style={[
            s.masterCard,
            {
              backgroundColor: t.card,
              borderColor: t.border,
              marginBottom: i < workers.length - 1 ? 11 : 0,
            },
          ]}
          activeOpacity={0.8}
          onPress={() => onSelectUsta(u)}
        >
          <View style={{ marginRight: 13 }}>
            <Avatar letter={u.initial} size={48} bgColor={u.color} />
            {i === 0 && (
              <View style={s.rankBadge}>
                <Text
                  style={{
                    fontSize: 9,
                    fontWeight: '800',
                    color: '#3a2a08',
                  }}
                >
                  #1
                </Text>
              </View>
            )}
            {u.is_online && (
              <View style={[s.onlineDot, { borderColor: t.card }]} />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '700', fontSize: 14.5, color: t.text }}>
              {u.name}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                marginTop: 2,
              }}
            >
              <Text
                style={{ fontSize: 12, color: t.muted, flexShrink: 1 }}
                numberOfLines={1}
              >
                {u.profession || tr('zakazchiMain.defaultProfession')}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                <MaterialCommunityIcons
                  name="shield-check"
                  size={11}
                  color={t.green}
                />
                <Text
                  style={{ fontSize: 11.5, color: t.green }}
                  numberOfLines={1}
                >
                  {u.location}
                </Text>
              </View>
            </View>
          </View>
          <View style={s.ratingBadge}>
            <Ionicons name="star" size={12} color={t.gold} />
            <Text
              style={{
                fontSize: 12.5,
                fontWeight: '700',
                color: t.gold,
                marginLeft: 3,
              }}
            >
              {u.rating.toFixed(1)}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </>
  );
}

function SevimliUstalar({ onSelectUsta, saved, onBrowse }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const [savedIdx, setSavedIdx] = useState(0);
  const listRef = useRef(null);
  const idxRef = useRef(0);

  useEffect(() => {
    if (saved.length === 0) return;
    const timer = setInterval(() => {
      idxRef.current = (idxRef.current + 1) % saved.length;
      listRef.current?.scrollToOffset({
        offset: idxRef.current * (SAVED_CARD_W + SAVED_CARD_GAP),
        animated: true,
      });
      setSavedIdx(idxRef.current);
    }, 2500);
    return () => clearInterval(timer);
  }, [saved.length]);

  return (
    <View style={{ paddingTop: 24 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 12,
          paddingHorizontal: 20,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
          <Ionicons name="heart" size={17} color={t.red} />
          <Text style={{ fontWeight: '700', fontSize: 16.5, color: t.text }}>
            {tr('zakazchiMain.favorites.title')}
          </Text>
        </View>
        {saved.length > 0 && (
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={{ color: t.orange, fontSize: 12.5, fontWeight: '600' }}>
              {tr('common.seeAll')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {saved.length === 0 ? (
        <View
          style={{
            marginHorizontal: 20,
            paddingVertical: 22,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: t.border,
            backgroundColor: t.card,
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Ionicons name="heart-outline" size={22} color={t.muted} />
          <Text style={{ fontSize: 13, fontWeight: '600', color: t.muted, textAlign: 'center' }}>
            {tr('zakazchiMain.favorites.empty')}
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: t.faint,
              textAlign: 'center',
              lineHeight: 17,
              marginTop: -2,
            }}
          >
            {tr('zakazchiMain.favorites.emptySubtitle')}
          </Text>
          {!!onBrowse && (
            <TouchableOpacity
              onPress={onBrowse}
              activeOpacity={0.85}
              style={{
                marginTop: 6,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                backgroundColor: t.orange,
                paddingHorizontal: 16,
                paddingVertical: 9,
                borderRadius: 10,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12.5 }}>
                {tr('zakazchiMain.favorites.browseCta')}
              </Text>
              <Ionicons name="arrow-forward" size={14} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <>
          <FlatList
            ref={listRef}
            data={saved}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={SAVED_CARD_W + SAVED_CARD_GAP}
            snapToAlignment="start"
            decelerationRate="fast"
            contentContainerStyle={{ paddingLeft: 20, paddingRight: 20 }}
            keyExtractor={(u) => String(u.id)}
            onScroll={({ nativeEvent }) => {
              const i = Math.round(
                nativeEvent.contentOffset.x / (SAVED_CARD_W + SAVED_CARD_GAP)
              );
              idxRef.current = i;
              setSavedIdx(i);
            }}
            scrollEventThrottle={16}
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
              >
                <View style={{ alignItems: 'center' }}>
                  <Avatar
                    letter={u.initial}
                    size={50}
                    bgColor={u.color}
                    uri={u.profile_photo}
                  />
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
                  style={{
                    fontSize: 11,
                    color: t.muted,
                    marginTop: 2,
                    textAlign: 'center',
                  }}
                  numberOfLines={1}
                >
                  {u.profession || tr('zakazchiMain.defaultProfession')}
                </Text>
              </TouchableOpacity>
            )}
          />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 5,
              marginTop: 12,
            }}
          >
            {saved.map((_, i) => (
              <View
                key={i}
                style={{
                  width: i === savedIdx ? 18 : 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: i === savedIdx ? t.orange : t.border,
                }}
              />
            ))}
          </View>
        </>
      )}
    </View>
  );
}

// Android'dagi Image (Fresco/OkHttp) kodlanmagan "+" belgisini URL'da
// noto'g'ri talqin qilib, rasmni yuklolmasligi mumkin — shu sababli xavfsiz kodlaymiz.
const encodeImageUri = (uri) => (uri ? uri.replace(/\+/g, '%2B') : uri);

function Avatar({ letter = 'J', size = 42, bgColor = '#e87a45', uri }) {
  const [failed, setFailed] = useState(false);
  const showImage = uri && !failed;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.32,
        backgroundColor: showImage ? 'transparent' : bgColor,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {showImage ? (
        <Image
          source={{ uri: encodeImageUri(uri) }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
          onError={(e) => {
            console.log('[Avatar] rasm yuklanmadi:', uri, e.nativeEvent?.error);
            setFailed(true);
          }}
        />
      ) : (
        <Text
          style={{ color: '#fff', fontSize: size * 0.4, fontWeight: '700' }}
        >
          {letter}
        </Text>
      )}
    </View>
  );
}

function SectionLoader({ height = 140 }) {
  return (
    <View style={{ height, alignItems: 'center', justifyContent: 'center' }}>
      <AfishLoader size={80} />
    </View>
  );
}

export default function ZakazchiMainScreen({ onLogout }) {
  const [activeTab, setActiveTab] = useState('home');
  const [justCreatedOrder, setJustCreatedOrder] = useState(null);
  const [orderTargetWorker, setOrderTargetWorker] = useState(null);
  const [selectedUsta, setSelectedUsta] = useState(null);
  const [selectedWork, setSelectedWork] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [showWallet, setShowWallet] = useState(false);
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const { user } = useUser();
  const { balance } = useWallet();
  const serviceCarouselRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [works, setWorks] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [stats, setStats] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [workersLoading, setWorkersLoading] = useState(true);
  const [worksLoading, setWorksLoading] = useState(true);
  const [favoritesLoading, setFavoritesLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const initialLoading =
    categoriesLoading &&
    workersLoading &&
    worksLoading &&
    favoritesLoading &&
    statsLoading &&
    reviewsLoading;
  const [refreshing, setRefreshing] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    getToken().then((token) => {
      // console.log('access_token:', token);
    });
  }, []);

  const loadHomeData = useCallback(() => {
    // Har bir so'rov mustaqil ishlaydi: biri xato bersa, qolganlari
    // baribir o'z holatini yangilaydi (faqat xato bergan bo'lim loading holatida qoladi).
    return Promise.allSettled([
      getCategories()
        .then((cats) => {
          if (mountedRef.current) {
            setCategories(cats);
            setCategoriesLoading(false);
          }
        })
        .catch((err) => console.log('[loadHomeData] categories error:', err?.message ?? err)),
      getWorkers({ page: 1, size: 5, categoryId: null })
        .then((wkrs) => {
          if (mountedRef.current) {
            setWorkers(wkrs);
            setWorkersLoading(false);
          }
        })
        .catch((err) => console.log('[loadHomeData] workers error:', err?.message ?? err)),
      getTopOrders({ limit: 10 })
        .then((wrks) => {
          if (mountedRef.current) {
            setWorks(wrks);
            setWorksLoading(false);
          }
        })
        .catch((err) => console.log('[loadHomeData] topOrders error:', err?.message ?? err)),
      getFavorites({ page: 1, size: 10 })
        .then((favs) => {
          if (mountedRef.current) {
            setFavorites(favs);
            setFavoritesLoading(false);
          }
        })
        .catch((err) => console.log('[loadHomeData] favorites error:', err?.message ?? err)),
      getSystemStats()
        .then((data) => {
          if (mountedRef.current) {
            setStats(data);
            setStatsLoading(false);
          }
        })
        .catch((err) => console.log('[loadHomeData] stats error:', err?.message ?? err)),
      getTopComments({ limit: 10 })
        .then((cmts) => {
          if (mountedRef.current) {
            setReviews(cmts);
            setReviewsLoading(false);
          }
        })
        .catch((err) => console.log('[loadHomeData] reviews error:', err?.message ?? err)),
    ]);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    loadHomeData();
    return () => {
      mountedRef.current = false;
    };
  }, [loadHomeData]);

  const onRefresh = useCallback(() => {
    console.log('[onRefresh] pastga tortish aniqlandi, yangilanmoqda...');
    setRefreshing(true);
    loadHomeData().finally(() => setRefreshing(false));
  }, [loadHomeData]);

  if (showWallet) {
    return <WalletScreen onBack={() => setShowWallet(false)} />;
  }

  if (selectedUsta) {
    return (
      <UstaDetailScreen
        usta={selectedUsta}
        onBack={() => setSelectedUsta(null)}
        onOrderWorker={(worker) => {
          setOrderTargetWorker(worker);
          setSelectedUsta(null);
          setActiveTab('newOrder');
        }}
        isLoggedIn
      />
    );
  }

  if (selectedWork) {
    return (
      <WorkDetailScreen
        work={selectedWork}
        onBack={() => setSelectedWork(null)}
        onSelectUsta={setSelectedUsta}
      />
    );
  }

  if (activeTab === 'profile') {
    return (
      <ZakazchiProfileScreen onTabChange={setActiveTab} onLogout={onLogout} />
    );
  }

  if (activeTab === 'services') {
    return (
      <XizmatlarScreen
        activeTab={activeTab}
        onTabChange={(tab) => {
          setOrderTargetWorker(null);
          setActiveTab(tab);
        }}
        onOrderWorker={(worker) => {
          setOrderTargetWorker(worker);
          setActiveTab('newOrder');
        }}
      />
    );
  }

  if (activeTab === 'newOrder') {
    return (
      <NewOrderScreen
        onTabChange={(tab) => {
          setOrderTargetWorker(null);
          setActiveTab(tab);
        }}
        onOrderCreated={setJustCreatedOrder}
        targetWorker={orderTargetWorker}
      />
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: t.bg }}
      edges={['top', 'left', 'right']}
    >
      <StatusBar style={t.isDark ? 'light' : 'dark'} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 90 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={t.orange}
            colors={[t.orange]}
          />
        }
      >
        {/* ── Header ── */}
        <View
          style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <View>
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
              >
                <MaterialCommunityIcons
                  name="map-marker"
                  size={13}
                  color={t.orange}
                />
                <Text style={{ fontSize: 12, color: t.muted }}>
                  {[user?.region, user?.district].filter(Boolean).join(', ')}
                </Text>
              </View>
              <Text
                style={{
                  fontWeight: '700',
                  fontSize: 20,
                  color: t.text,
                  marginTop: 3,
                }}
              >
                {tr('zakazchiMain.greeting', { name: user?.last_name })}
              </Text>
            </View>
            <Avatar
              letter={(user?.last_name ?? '').charAt(0).toUpperCase()}
              bgColor={t.orange}
              uri={user?.profile_photo}
            />
          </View>
        </View>

        {/* ── Hamyon tezkor kirish ── */}
        <View style={{ paddingHorizontal: 20 }}>
          <TouchableOpacity
            style={[s.walletQuickCard, { overflow: 'hidden' }]}
            activeOpacity={0.9}
            onPress={() => setShowWallet(true)}
          >
            <View style={s.walletQuickCircle} />
            <View style={s.walletQuickIcon}>
              <MaterialCommunityIcons name="wallet" size={20} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.9)' }}>
                {tr('wallet.balanceLabel')}
              </Text>
              <Text
                style={{
                  fontWeight: '800',
                  fontSize: 17,
                  color: '#fff',
                  marginTop: 2,
                }}
              >
                {fmt(balance)}{' '}
                <Text style={{ fontSize: 11.5, fontWeight: '600', opacity: 0.85 }}>
                  {tr('common.currencySom')}
                </Text>
              </Text>
            </View>
            <View style={s.walletQuickBtn}>
              <Text style={{ color: t.orangeD, fontWeight: '700', fontSize: 12 }}>
                {tr('profile.wallet.topup')}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ── Faol buyurtma banneri (disabled) ── */}
        {false && (
          <View style={{ paddingHorizontal: 20, marginTop: 6 }}>
            <View style={[s.activeCard, { backgroundColor: t.card }]}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 12,
                }}
              >
                <View
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}
                >
                  <View style={s.pulseDot} />
                  <Text
                    style={{
                      fontSize: 11.5,
                      fontWeight: '700',
                      color: t.orange,
                      letterSpacing: 0.3,
                    }}
                  >
                    {tr('zakazchiMain.activeOrder.badge')}
                  </Text>
                </View>
                <Text style={{ fontSize: 11.5, color: t.muted }}>#A-2481</Text>
              </View>
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 13 }}
              >
                <Avatar letter="A" size={46} bgColor={t.orange} />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{ fontWeight: '700', fontSize: 14.5, color: t.text }}
                  >
                    {tr('zakazchiMain.activeOrder.workerStatus')}
                  </Text>
                  <Text style={{ fontSize: 12, color: t.muted, marginTop: 2 }}>
                    {tr('zakazchiMain.activeOrder.eta')}
                  </Text>
                </View>
                <TouchableOpacity style={s.callBtn} activeOpacity={0.8}>
                  <MaterialCommunityIcons name="phone" size={19} color="#fff" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={s.trackBtn} activeOpacity={0.85}>
                <Text
                  style={{ color: '#fff', fontWeight: '700', fontSize: 13.5 }}
                >
                  {tr('zakazchiMain.activeOrder.track')}
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={16}
                  color="#fff"
                  style={{ marginLeft: 8 }}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {!!justCreatedOrder && (
          <View style={{ paddingHorizontal: 20, marginTop: 6 }}>
            <View
              style={[
                s.successCard,
                { backgroundColor: t.card, borderColor: 'rgba(31,163,124,0.35)' },
              ]}
            >
              <View style={[s.successIconWrap, { backgroundColor: '#1FA37C' }]}>
                <MaterialCommunityIcons name="check" size={18} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700', fontSize: 14, color: t.text }}>
                  {tr('zakazchiMain.newOrderSuccess.title')}
                </Text>
                {!!justCreatedOrder.category && (
                  <Text
                    style={{ fontSize: 12.5, color: t.muted, marginTop: 3 }}
                    numberOfLines={1}
                  >
                    {justCreatedOrder.category}
                  </Text>
                )}
                {!!justCreatedOrder.address && (
                  <Text
                    style={{ fontSize: 12, color: t.muted, marginTop: 1 }}
                    numberOfLines={1}
                  >
                    {justCreatedOrder.address}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() => setJustCreatedOrder(null)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <MaterialCommunityIcons name="close" size={16} color={t.muted} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {initialLoading ? (
          <View
            style={{
              paddingVertical: 140,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AfishLoader size={180} />
          </View>
        ) : (
          <>
            {/* ── Services ── */}
            <View style={{ marginTop: 24 }}>
              <View style={[s.sectionHeader, { paddingHorizontal: 20 }]}>
                <Text style={[s.sectionTitle, { color: t.text }]}>
                  {tr('app.taklifXizmatlar.title')}
                </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => serviceCarouselRef.current?.resume()}
                >
                  <Text
                    style={{
                      color: t.orange,
                      fontSize: 12.5,
                      fontWeight: '600',
                    }}
                  >
                    {tr('common.seeAll')}
                  </Text>
                </TouchableOpacity>
              </View>
              {categoriesLoading ? (
                <SectionLoader height={110} />
              ) : (
                <ServiceCarousel
                  ref={serviceCarouselRef}
                  categories={categories}
                  onSelectCategory={setSelectedCategoryId}
                />
              )}
            </View>

            {/* ── Top ustalar ── */}
            <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
              <View style={s.sectionHeader}>
                <Text style={[s.sectionTitle, { color: t.text }]}>
                  {tr('app.engZorUstalar.title')}
                </Text>
                <Text
                  style={{ color: t.orange, fontSize: 12.5, fontWeight: '600' }}
                >
                  {tr('app.engZorUstalar.rating')}
                </Text>
              </View>
              {workersLoading ? (
                <SectionLoader height={176} />
              ) : (
                <TopUstalar
                  onSelectUsta={setSelectedUsta}
                  categoryId={selectedCategoryId}
                  initialWorkers={workers}
                />
              )}
            </View>

            {/* ── Best works ── */}
            <View style={{ marginTop: 24 }}>
              <View style={[s.sectionHeader, { paddingHorizontal: 20 }]}>
                <Text style={[s.sectionTitle, { color: t.text }]}>
                  {tr('app.engZorIshlar.title')}
                </Text>
                <Text
                  style={{ color: t.orange, fontSize: 12.5, fontWeight: '600' }}
                >
                  {tr('app.engZorIshlar.gallery')}
                </Text>
              </View>
              {worksLoading ? (
                <SectionLoader height={150} />
              ) : (
                <WorksCarousel works={works} onSelectWork={setSelectedWork} />
              )}
            </View>

            {/* ── Sevimli ustalar ── */}
            {favoritesLoading ? (
              <SectionLoader height={150} />
            ) : (
              <SevimliUstalar
                onSelectUsta={setSelectedUsta}
                saved={favorites}
                onBrowse={() => setActiveTab('services')}
              />
            )}

            {/* ── Statistika ── */}
            <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
              {statsLoading ? (
                <SectionLoader height={90} />
              ) : (
                <View
                  style={[
                    s.statsBand,
                    { backgroundColor: t.card, borderColor: t.border },
                  ]}
                >
                  {[
                    {
                      value: stats?.worker_count != null ? `${stats.worker_count}+` : '—',
                      key: 'workers',
                    },
                    {
                      value: stats?.order_count != null ? `${stats.order_count}+` : '—',
                      key: 'completedJobs',
                    },
                    {
                      value:
                        stats?.average_rating != null
                          ? `${stats.average_rating.toFixed(1)}★`
                          : '—',
                      key: 'avgRating',
                    },
                  ].map((item, i) => (
                    <View
                      key={item.key}
                      style={[
                        s.statsBandItem,
                        { borderRightColor: t.border, borderRightWidth: i < 2 ? 1 : 0 },
                      ]}
                    >
                      <Text style={{ fontSize: 19, fontWeight: '800', color: t.text }}>
                        {item.value}
                      </Text>
                      <Text
                        style={{
                          fontSize: 11,
                          color: t.muted,
                          marginTop: 3,
                          textAlign: 'center',
                        }}
                      >
                        {tr(`app.stats.${item.key}`)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* ── Nega AFISH? ── */}
            <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
              <Text style={[s.sectionTitle, { color: t.text, marginBottom: 13 }]}>
                {tr('app.sectionHead.whyAfish')}
              </Text>
              <View style={{ gap: 12 }}>
                {BENEFITS.map((b) => (
                  <View
                    key={b.key}
                    style={[
                      s.benefitCard,
                      { backgroundColor: t.card, borderColor: t.border },
                    ]}
                  >
                    <View style={[s.benefitIcon, { backgroundColor: b.color + '22' }]}>
                      <MaterialCommunityIcons name={b.icon} size={22} color={b.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontWeight: '700',
                          fontSize: 14,
                          color: t.text,
                          marginBottom: 3,
                        }}
                      >
                        {tr(`app.benefits.${b.key}Title`)}
                      </Text>
                      <Text style={{ fontSize: 12.5, color: t.muted, lineHeight: 18 }}>
                        {tr(`app.benefits.${b.key}Desc`)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* ── Mijozlar fikri ── */}
            {reviewsLoading ? (
              <View style={{ marginTop: 24 }}>
                <SectionLoader height={150} />
              </View>
            ) : (
              reviews.length > 0 && (
                <View style={{ marginTop: 24 }}>
                  <Text
                    style={[
                      s.sectionTitle,
                      { color: t.text, paddingHorizontal: 20, marginBottom: 13 },
                    ]}
                  >
                    {tr('app.sectionHead.reviews')}
                  </Text>
                  <FlatList
                    data={reviews}
                    keyExtractor={(_, i) => String(i)}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
                    renderItem={({ item: r }) => (
                      <View
                        style={[
                          s.reviewCard,
                          { backgroundColor: t.card, borderColor: t.border },
                        ]}
                      >
                        <View style={{ flexDirection: 'row', gap: 3, marginBottom: 10 }}>
                          {[0, 1, 2, 3, 4].map((j) => (
                            <Ionicons
                              key={j}
                              name="star"
                              size={13}
                              color={j < r.stars ? t.gold : t.border}
                            />
                          ))}
                        </View>
                        <Text
                          style={{ color: t.muted, fontSize: 13, lineHeight: 19, marginBottom: 14 }}
                          numberOfLines={4}
                        >
                          {r.text}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                          <Avatar letter={r.initial} size={34} bgColor={r.color} />
                          <View>
                            <Text style={{ color: t.text, fontWeight: '600', fontSize: 13 }}>
                              {r.name}
                            </Text>
                            <Text style={{ color: t.faint, fontSize: 11, marginTop: 1 }}>
                              {r.location}
                            </Text>
                          </View>
                        </View>
                      </View>
                    )}
                  />
                </View>
              )
            )}
          </>
        )}
      </ScrollView>

      {/* ── Bottom nav ── */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        accent={t.orange}
        background={t.navBg}
        border={t.border}
        muted={t.faint}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  walletQuickCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    padding: 14,
    backgroundColor: '#e87a45',
    position: 'relative',
    marginBottom: 16,
  },
  walletQuickCircle: {
    position: 'absolute',
    right: -24,
    top: -24,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  walletQuickIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletQuickBtn: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  activeCard: {
    borderWidth: 1,
    borderColor: 'rgba(232,122,69,0.32)',
    borderRadius: 18,
    padding: 15,
  },
  successCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  successIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e87a45',
    shadowColor: '#e87a45',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 4,
  },
  callBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#2fa37a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackBtn: {
    marginTop: 14,
    backgroundColor: '#e87a45',
    borderRadius: 12,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  ctaCard: {
    borderRadius: 22,
    padding: 20,
    backgroundColor: '#e87a45',
    overflow: 'hidden',
    position: 'relative',
  },
  ctaBtn: {
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 13,
  },
  sectionTitle: { fontWeight: '700', fontSize: 16.5 },

  statsBand: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 18,
  },
  statsBandItem: { flex: 1, alignItems: 'center' },

  benefitCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
  },
  benefitIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  reviewCard: {
    width: 240,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
  },

  svcItem: {
    height: 90,
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  svcIconBox: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svcLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 14,
  },

  masterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 18,
    padding: 12,
  },
  rankBadge: {
    position: 'absolute',
    top: -7,
    left: -7,
    backgroundColor: '#f5c451',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 7,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#22C55E',
    borderWidth: 2,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245,196,81,0.13)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  workCard: {
    width: 168,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
  },
  workImg: {
    height: 104,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workRatingBadge: {
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

  savedCard: {
    width: 148,
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
  },
});
