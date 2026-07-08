import { useState, useRef, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';
import { COLORS } from './src/constants/colors';
import { ENDPOINTS } from './src/constants/config';
import LoginScreen from './src/screens/LoginScreen';
import UstaMainScreen from './src/screens/UstaMainScreen';
import ZakazchiMainScreen from './src/screens/ZakazchiMainScreen';
import UstaDetailScreen from './src/screens/UstaDetailScreen';
import { ThemeProvider } from './src/context/ThemeContext';
import { getCategories } from './src/api/categories';
import { getWorkers } from './src/api/workers';
import { getTopComments, getTopOrders } from './src/api/reviews';
import { getToken, getActorType, clearTokens } from './src/utils/token';

// ─── Data ─────────────────────────────────────────────────────────────────────

const STEPS = [
  {
    num: 1,
    title: 'Xizmatni tanlang',
    desc: 'Kerakli usta turini toping yoki qidiruvdan foydalaning.',
  },
  {
    num: 2,
    title: 'Buyurtma bering',
    desc: "Vaqt va manzilni belgilab, ustaga so'rov yuboring.",
  },
  {
    num: 3,
    title: 'Baholang',
    desc: 'Ish tugagach reyting va sharh qoldiring.',
  },
];

const BENEFITS_DATA = [
  {
    icon: 'shield-check',
    color: '#2ecc71',
    title: 'Kafolatlangan ish',
    desc: 'Har bir buyurtma himoyalangan, sifat kafolati bilan.',
  },
  {
    icon: 'check-decagram',
    color: '#3b82f6',
    title: 'Tekshirilgan ustalar',
    desc: 'Hujjatlari va tajribasi tasdiqlangan mutaxassislar.',
  },
  {
    icon: 'lightning-bolt',
    color: '#f5b81f',
    title: 'Tezkor javob',
    desc: "O'rtacha 15 daqiqada usta sizga bog'lanadi.",
  },
];

// ─── TaklifXizmatlar ──────────────────────────────────────────────────────────

const ITEM_SLOT = 76;

function TaklifXizmatlar() {
  const [categories, setCategories] = useState([]);
  const flatListRef = useRef(null);
  const activeIndexRef = useRef(0);

  useEffect(() => {
    getCategories()
      .then((data) => {
        setCategories(data);
      })
      .catch((error) => {});
  }, []);

  useEffect(() => {
    if (categories.length === 0) return;
    const timer = setInterval(() => {
      const next = (activeIndexRef.current + 1) % categories.length;
      activeIndexRef.current = next;
      flatListRef.current?.scrollToOffset({
        offset: next * ITEM_SLOT,
        animated: true,
      });
    }, 1800);
    return () => clearInterval(timer);
  }, [categories.length]);

  if (categories.length === 0) return null;

  return (
    <View style={tx.container}>
      <View style={tx.header}>
        <Text style={tx.title}>Taklif xizmatlar</Text>
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={tx.link}>Barchasi</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        ref={flatListRef}
        data={categories}
        keyExtractor={(item) => String(item.id)}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={tx.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={tx.item} activeOpacity={0.8}>
            <View style={[tx.iconBox, { backgroundColor: item.color + '18' }]}>
              {item.icon ? (
                <Text style={tx.emoji}>{item.icon}</Text>
              ) : (
                <MaterialCommunityIcons
                  name="briefcase-outline"
                  size={24}
                  color={item.color}
                />
              )}
            </View>
            <Text style={tx.label} numberOfLines={2}>
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const tx = StyleSheet.create({
  container: { marginTop: 26, marginBottom: 6 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  title: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  link: { color: COLORS.orange, fontSize: 14, fontWeight: '600' },
  list: { paddingHorizontal: 16, gap: 10 },
  item: { width: 66, alignItems: 'center' },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  label: {
    color: COLORS.gray,
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  emoji: { fontSize: 24 },
});

// ─── EngZorUstalar ────────────────────────────────────────────────────────────

function EngZorUstalar({ onSelectUsta }) {
  const [workers, setWorkers] = useState([]);

  useEffect(() => {
    getWorkers({ limit: 5 })
      .then(setWorkers)
      .catch(() => {});
  }, []);

  if (workers.length === 0) return null;

  return (
    <View style={eu.container}>
      <View style={eu.header}>
        <Text style={eu.title}>Eng zo'r ustalar</Text>
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={eu.link}>Reyting</Text>
        </TouchableOpacity>
      </View>
      {workers.map((worker, i) => (
        <TouchableOpacity
          key={worker.id}
          style={[eu.card, i < workers.length - 1 && { marginBottom: 11 }]}
          activeOpacity={0.8}
          onPress={() => onSelectUsta?.(worker)}
        >
          {/* Avatar + rank badge + online dot */}
          <View style={{ marginRight: 13 }}>
            <View style={[eu.avatar, { backgroundColor: worker.color }]}>
              <Text style={eu.avatarText}>{worker.initial}</Text>
            </View>
            {i === 0 && (
              <View style={eu.rankBadge}>
                <Text style={eu.rankText}>#1</Text>
              </View>
            )}
            {worker.is_online && <View style={eu.onlineDot} />}
          </View>

          {/* Info */}
          <View style={eu.info}>
            <Text style={eu.name}>{worker.name}</Text>
            <View style={eu.metaRow}>
              <Text style={eu.prof} numberOfLines={1}>
                {worker.profession}
              </Text>
              <MaterialCommunityIcons
                name="shield-check"
                size={12}
                color="#22C55E"
              />
              <Text style={eu.loc}>{worker.location}</Text>
            </View>
            <Text style={eu.price}>
              Narx:{' '}
              <Text style={eu.priceBold}>{worker.startingPrice} so'm</Text> dan
            </Text>
          </View>

          {/* Rating */}
          <View style={{ alignItems: 'flex-end', gap: 6 }}>
            <View style={eu.ratingBox}>
              <Ionicons name="star" size={13} color="#FBBF24" />
              <Text style={eu.ratingText}>{worker.rating.toFixed(1)}</Text>
            </View>
            <Text style={eu.exp}>{worker.experience}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const eu = StyleSheet.create({
  container: { marginTop: 28 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 13,
  },
  title: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  link: { color: COLORS.orange, fontSize: 14, fontWeight: '600' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    borderRadius: 18,
    padding: 13,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
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
  rankText: { fontSize: 9, fontWeight: '800', color: '#3a2a08' },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: COLORS.card,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: COLORS.white, fontSize: 19, fontWeight: '700' },
  info: { flex: 1 },
  name: {
    color: COLORS.white,
    fontSize: 14.5,
    fontWeight: '700',
    marginBottom: 3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 3,
  },
  prof: { color: COLORS.gray, fontSize: 12 },
  loc: { color: COLORS.gray, fontSize: 11.5 },
  price: { fontSize: 12, color: COLORS.gray },
  priceBold: { color: COLORS.white, fontWeight: '800' },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245,196,81,0.13)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 3,
  },
  ratingText: { color: '#FBBF24', fontSize: 12.5, fontWeight: '700' },
  exp: { fontSize: 12, color: COLORS.gray },
});

// ─── EngZorIshlar ─────────────────────────────────────────────────────────────

const EI_CARD_W = 160;
const EI_GAP = 12;
const EI_SLOT = EI_CARD_W + EI_GAP;

function EngZorIshlar() {
  const [works, setWorks] = useState([]);
  const flatListRef = useRef(null);
  const indexRef = useRef(0);

  useEffect(() => {
    getTopOrders({ limit: 10 })
      .then((data) => {
        setWorks(data);
      })
      .catch((error) => {});
  }, []);

  useEffect(() => {
    if (works.length === 0) return;
    const timer = setInterval(() => {
      const next = (indexRef.current + 1) % works.length;
      indexRef.current = next;
      flatListRef.current?.scrollToOffset({
        offset: next * EI_SLOT,
        animated: true,
      });
    }, 2000);
    return () => clearInterval(timer);
  }, [works.length]);

  if (works.length === 0) return null;

  return (
    <View style={ei.container}>
      <View style={ei.header}>
        <Text style={ei.title}>Eng zo'r ishlar</Text>
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={ei.link}>Galereya</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        ref={flatListRef}
        data={works}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={EI_SLOT}
        decelerationRate="fast"
        contentContainerStyle={ei.list}
        renderItem={({ item }) => <WorkCard item={item} />}
      />
    </View>
  );
}

function WorkCard({ item }) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const total = item.photos.length;

  const goPrev = () => setPhotoIndex((i) => (i - 1 + total) % total);
  const goNext = () => setPhotoIndex((i) => (i + 1) % total);

  return (
    <TouchableOpacity style={ei.card} activeOpacity={0.85}>
      <View style={ei.imgBox}>
        <Image source={{ uri: item.photos[photoIndex] }} style={ei.img} />
        <View style={ei.ratingBadge}>
          <Ionicons name="star" size={11} color="#FBBF24" />
          <Text style={ei.ratingBadgeText}>{item.rating.toFixed(1)}</Text>
        </View>
        {total > 1 && (
          <>
            <TouchableOpacity
              style={[ei.navBtn, ei.navBtnLeft]}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              onPress={goPrev}
            >
              <Ionicons name="chevron-back" size={14} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[ei.navBtn, ei.navBtnRight]}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              onPress={goNext}
            >
              <Ionicons name="chevron-forward" size={14} color="#fff" />
            </TouchableOpacity>
            <View style={ei.dots}>
              {item.photos.map((_, i) => (
                <View
                  key={i}
                  style={[ei.dot, i === photoIndex && ei.dotActive]}
                />
              ))}
            </View>
          </>
        )}
      </View>
      <Text style={ei.cardTitle} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={ei.cardSub} numberOfLines={1}>
        {item.worker}
      </Text>
    </TouchableOpacity>
  );
}

const ei = StyleSheet.create({
  container: { marginTop: 28, marginBottom: 6 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  link: { color: COLORS.orange, fontSize: 14, fontWeight: '600' },
  list: { paddingHorizontal: 16, gap: EI_GAP },
  card: { width: EI_CARD_W },
  imgBox: {
    width: EI_CARD_W,
    height: 140,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    marginBottom: 8,
    overflow: 'hidden',
  },
  img: {
    width: '100%',
    height: '100%',
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    gap: 3,
  },
  ratingBadgeText: { color: COLORS.white, fontSize: 11, fontWeight: '700' },
  navBtn: {
    position: 'absolute',
    top: '50%',
    marginTop: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnLeft: { left: 6 },
  navBtnRight: { right: 6 },
  dots: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotActive: {
    backgroundColor: COLORS.white,
    width: 12,
  },
  cardTitle: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 3,
  },
  cardSub: { color: COLORS.gray, fontSize: 11 },
});

// ─── PromoBanner ──────────────────────────────────────────────────────────────

function PromoBanner({ onPress }) {
  return (
    <View style={pb.wrap}>
      <View style={pb.glow} />
      <View style={pb.iconBg}>
        <MaterialCommunityIcons
          name="shield-check"
          size={140}
          color="#fff"
          style={{ opacity: 0.12 }}
        />
      </View>
      <Text style={pb.heading}>Ustangizni 2 daqiqada{'\n'}toping</Text>
      <Text style={pb.sub}>
        1 200+ tekshirilgan mutaxassis —{'\n'}kafolat bilan ishlaydi.
      </Text>
      <TouchableOpacity style={pb.cta} activeOpacity={0.85} onPress={onPress}>
        <Text style={pb.ctaTxt}>Boshlash</Text>
        <Ionicons name="arrow-forward" size={16} color={COLORS.orange} />
      </TouchableOpacity>
    </View>
  );
}

const pb = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 16,
    borderRadius: 22,
    backgroundColor: COLORS.orange,
    padding: 22,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: -60,
    right: -50,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  iconBg: { position: 'absolute', right: -12, bottom: -20 },
  heading: {
    fontSize: 21,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 28,
    marginBottom: 8,
  },
  sub: {
    fontSize: 13.5,
    color: 'rgba(255,255,255,0.92)',
    lineHeight: 20,
    marginBottom: 18,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  ctaTxt: { color: COLORS.orange, fontWeight: '700', fontSize: 14 },
});

// ─── TrustRow ─────────────────────────────────────────────────────────────────

const TRUST_ITEMS = [
  { icon: 'shield-check', color: '#2ecc71', label: 'Kafolat' },
  { icon: 'check-decagram', color: '#3b82f6', label: 'Tekshirilgan' },
  { icon: 'lightning-bolt', color: '#f5b81f', label: '24/7 xizmat' },
];

function TrustRow() {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 10,
        paddingHorizontal: 16,
      }}
    >
      {TRUST_ITEMS.map((item, i) => (
        <View
          key={i}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: COLORS.card,
            paddingHorizontal: 13,
            paddingVertical: 9,
            borderRadius: 22,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.07)',
          }}
        >
          <MaterialCommunityIcons
            name={item.icon}
            size={14}
            color={item.color}
          />
          <Text
            style={{ fontSize: 12, color: COLORS.white, fontWeight: '600' }}
          >
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

// ─── StatsBand ────────────────────────────────────────────────────────────────

const DEFAULT_STATS = [
  ['1 200+', 'Usta'],
  ['8 500+', 'Bajarilgan ish'],
  ['4.8★', "O'rtacha reyting"],
];

function StatsBand() {
  const [stats, setStats] = useState(DEFAULT_STATS);

  useEffect(() => {
    fetch(ENDPOINTS.SYSTEM_STATS)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.response_data) {
          const { worker_count, order_count, average_rating } =
            data.response_data;
          setStats([
            [`${worker_count}+`, 'Usta'],
            [`${order_count}+`, 'Bajarilgan ish'],
            [`${average_rating.toFixed(1)}★`, "O'rtacha reyting"],
          ]);
        }
      })
      .catch((err) => {});
  }, []);

  return (
    <View
      style={{
        marginHorizontal: 16,
        marginTop: 32,
        marginBottom: 28,
        backgroundColor: COLORS.card,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        borderRadius: 18,
        paddingVertical: 18,
        flexDirection: 'row',
      }}
    >
      {stats.map(([v, l], i) => (
        <View
          key={i}
          style={{
            flex: 1,
            alignItems: 'center',
            borderRightWidth: i < 2 ? 1 : 0,
            borderRightColor: 'rgba(255,255,255,0.06)',
          }}
        >
          <Text
            style={{ fontSize: 19, fontWeight: '800', color: COLORS.white }}
          >
            {v}
          </Text>
          <Text
            style={{
              fontSize: 11,
              color: COLORS.gray,
              marginTop: 3,
              textAlign: 'center',
              paddingHorizontal: 4,
            }}
          >
            {l}
          </Text>
        </View>
      ))}
    </View>
  );
}

// ─── HowItWorks ───────────────────────────────────────────────────────────────

function HowItWorks() {
  return (
    <View style={{ paddingHorizontal: 16, marginBottom: 32, gap: 16 }}>
      {STEPS.map((s) => (
        <View
          key={s.num}
          style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14 }}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 11,
              backgroundColor: COLORS.orange + '22',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Text
              style={{ color: COLORS.orange, fontWeight: '800', fontSize: 15 }}
            >
              {s.num}
            </Text>
          </View>
          <View style={{ flex: 1, paddingTop: 2 }}>
            <Text
              style={{
                color: COLORS.white,
                fontWeight: '700',
                fontSize: 14.5,
                marginBottom: 4,
              }}
            >
              {s.title}
            </Text>
            <Text style={{ color: COLORS.gray, fontSize: 13, lineHeight: 19 }}>
              {s.desc}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

// ─── ReviewsSection ───────────────────────────────────────────────────────────

const REVIEW_CARD_W = 240;
const REVIEW_CARD_GAP = 12;
const REVIEW_SLOT = REVIEW_CARD_W + REVIEW_CARD_GAP;

function ReviewsSection() {
  const [reviews, setReviews] = useState([]);
  const listRef = useRef(null);
  const idxRef = useRef(0);

  useEffect(() => {
    getTopComments({ limit: 10 })
      .then((data) => {
        setReviews(data);
      })
      .catch((error) => {});
  }, []);

  useEffect(() => {
    if (reviews.length === 0) return;
    const timer = setInterval(() => {
      const next = (idxRef.current + 1) % reviews.length;
      idxRef.current = next;
      listRef.current?.scrollToOffset({
        offset: next * REVIEW_SLOT,
        animated: true,
      });
    }, 2500);
    return () => clearInterval(timer);
  }, [reviews.length]);

  if (reviews.length === 0) return null;

  return (
    <FlatList
      ref={listRef}
      data={reviews}
      keyExtractor={(_, i) => String(i)}
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={REVIEW_SLOT}
      decelerationRate="fast"
      contentContainerStyle={{
        paddingHorizontal: 16,
        gap: 12,
        paddingBottom: 4,
      }}
      style={{ marginBottom: 32 }}
      renderItem={({ item: r }) => (
        <View
          style={{
            width: 240,
            backgroundColor: COLORS.card,
            borderRadius: 18,
            padding: 16,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.06)',
          }}
        >
          <View style={{ flexDirection: 'row', gap: 3, marginBottom: 10 }}>
            {[0, 1, 2, 3, 4].map((j) => (
              <Ionicons
                key={j}
                name="star"
                size={14}
                color={j < r.stars ? '#f5b81f' : '#2a3a4a'}
              />
            ))}
          </View>
          <Text
            style={{
              color: '#c4cdd8',
              fontSize: 13.5,
              lineHeight: 20,
              marginBottom: 14,
            }}
          >
            {r.text}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                backgroundColor: r.color,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>
                {r.initial}
              </Text>
            </View>
            <View>
              <Text
                style={{ color: COLORS.white, fontWeight: '600', fontSize: 13 }}
              >
                {r.name}
              </Text>
              <Text
                style={{ color: COLORS.gray, fontSize: 11.5, marginTop: 1 }}
              >
                {r.location}
              </Text>
            </View>
          </View>
        </View>
      )}
    />
  );
}

// ─── BenefitsSection ──────────────────────────────────────────────────────────

function BenefitsSection() {
  return (
    <View style={{ paddingHorizontal: 16, marginBottom: 32, gap: 12 }}>
      {BENEFITS_DATA.map((b, i) => (
        <View
          key={i}
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 14,
            backgroundColor: COLORS.card,
            borderRadius: 18,
            padding: 16,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.06)',
          }}
        >
          <View
            style={{
              width: 46,
              height: 46,
              borderRadius: 13,
              backgroundColor: b.color + '22',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <MaterialCommunityIcons name={b.icon} size={24} color={b.color} />
          </View>
          <View style={{ flex: 1, paddingTop: 2 }}>
            <Text
              style={{
                color: COLORS.white,
                fontWeight: '700',
                fontSize: 14.5,
                marginBottom: 4,
              }}
            >
              {b.title}
            </Text>
            <Text style={{ color: COLORS.gray, fontSize: 13, lineHeight: 19 }}>
              {b.desc}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

// ─── ClosingCTA ───────────────────────────────────────────────────────────────

function ClosingCTA({ onPress }) {
  return (
    <View
      style={{
        marginHorizontal: 16,
        marginBottom: 24,
        backgroundColor: COLORS.card,
        borderRadius: 22,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          position: 'absolute',
          width: 220,
          height: 180,
          backgroundColor: 'rgba(232,122,69,0.10)',
          borderRadius: 110,
        }}
      />
      <Text
        style={{
          color: COLORS.white,
          fontWeight: '800',
          fontSize: 20,
          marginBottom: 8,
          textAlign: 'center',
          lineHeight: 27,
        }}
      >
        Birinchi buyurtmangizni bering
      </Text>
      <Text
        style={{
          color: COLORS.gray,
          fontSize: 13.5,
          textAlign: 'center',
          marginBottom: 20,
          lineHeight: 20,
        }}
      >
        Ro'yxatdan o'ting va ishonchli ustalardan foydalaning.
      </Text>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: COLORS.orange,
          borderRadius: 14,
          paddingVertical: 14,
          gap: 8,
          width: '100%',
        }}
      >
        <Feather name="log-in" size={18} color="#fff" />
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
          Kirish / Ro'yxatdan o'tish
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── SectionHead ──────────────────────────────────────────────────────────────

function SectionHead({ title, link }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 14,
        marginTop: 28,
      }}
    >
      <Text style={{ color: COLORS.white, fontSize: 18, fontWeight: '700' }}>
        {title}
      </Text>
      {link && (
        <Text style={{ color: COLORS.orange, fontSize: 14, fontWeight: '600' }}>
          {link}
        </Text>
      )}
    </View>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [searchText, setSearchText] = useState('');
  const [screen, setScreen] = useState('home');
  const [selectedUsta, setSelectedUsta] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (token) {
        const actorType = await getActorType();
        setScreen(
          actorType === 'worker' ? 'usta-dashboard' : 'zakazchi-dashboard'
        );
      }
      setAuthChecked(true);
    })();
  }, []);

  if (!authChecked) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <View
          style={[
            styles.safeArea,
            { alignItems: 'center', justifyContent: 'center' },
          ]}
        >
          <ActivityIndicator size="large" color={COLORS.orange} />
        </View>
      </SafeAreaProvider>
    );
  }

  if (selectedUsta) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <UstaDetailScreen
          usta={selectedUsta}
          onBack={() => setSelectedUsta(null)}
          onGoToLogin={() => {
            setSelectedUsta(null);
            setScreen('login');
          }}
        />
      </SafeAreaProvider>
    );
  }

  if (screen === 'login') {
    return (
      <ThemeProvider>
        <SafeAreaProvider>
          <StatusBar style="light" />
          <LoginScreen
            onBack={() => setScreen('home')}
            onLoginSuccess={(actorType) =>
              setScreen(
                actorType === 'worker' ? 'usta-dashboard' : 'zakazchi-dashboard'
              )
            }
          />
        </SafeAreaProvider>
      </ThemeProvider>
    );
  }

  const handleLogout = async () => {
    await clearTokens();
    setScreen('home');
  };

  if (screen === 'usta-dashboard') {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <UstaMainScreen onLogout={handleLogout} />
      </SafeAreaProvider>
    );
  }

  if (screen === 'zakazchi-dashboard') {
    return (
      <ThemeProvider>
        <SafeAreaProvider>
          <ZakazchiMainScreen onLogout={handleLogout} />
        </SafeAreaProvider>
      </ThemeProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* ── Header ── */}
          <View style={styles.header}>
            <Image
              source={require('./assets/afish-logo-horizontal.png')}
              style={styles.logoImg}
              resizeMode="contain"
            />
            <TouchableOpacity
              style={styles.loginBtn}
              activeOpacity={0.8}
              onPress={() => setScreen('login')}
            >
              <Feather
                name="log-in"
                size={16}
                color={COLORS.white}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.loginBtnTxt}>Kirish</Text>
            </TouchableOpacity>
          </View>

          {/* ── Search ── */}
          <View style={styles.searchRow}>
            <View style={styles.searchInner}>
              <Feather
                name="search"
                size={18}
                color={COLORS.gray}
                style={{ marginRight: 10 }}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Qaysi usta kerak?"
                placeholderTextColor={COLORS.gray}
                value={searchText}
                onChangeText={setSearchText}
              />
            </View>
            <TouchableOpacity style={styles.filterBtn} activeOpacity={0.8}>
              <Feather name="sliders" size={18} color={COLORS.gray} />
            </TouchableOpacity>
          </View>

          {/* ── Promo + Trust ── */}
          <PromoBanner onPress={() => setScreen('login')} />
          <TrustRow />

          {/* ── Taklif xizmatlar ── */}
          <TaklifXizmatlar />

          {/* ── Eng zo'r ustalar ── */}
          <EngZorUstalar onSelectUsta={setSelectedUsta} />

          {/* ── Eng zo'r ishlar ── */}
          <EngZorIshlar />

          {/* ── Statistika ── */}
          <StatsBand />

          {/* ── Qanday ishlaydi ── */}
          <SectionHead title="Qanday ishlaydi" />
          <HowItWorks />

          {/* ── Mijozlar fikri ── */}
          <SectionHead title="Mijozlar fikri" />
          <ReviewsSection />

          {/* ── Nega AFISH? ── */}
          <SectionHead title="Nega AFISH?" />
          <BenefitsSection />

          {/* ── Closing CTA ── */}
          <ClosingCTA onPress={() => setScreen('login')} />
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  scrollContent: { paddingBottom: 110 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  logoImg: { width: 130, height: 36 },

  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.orange,
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 24,
  },
  loginBtnTxt: { color: COLORS.white, fontWeight: '600', fontSize: 14 },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 4,
    gap: 10,
  },
  searchInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  searchInput: { flex: 1, color: COLORS.white, fontSize: 15, padding: 0 },
  filterBtn: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
