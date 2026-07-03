import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';

// ─── Colors ──────────────────────────────────────────────────────────────────

const C = {
  bg:     '#0a1622',
  card:   '#16222f',
  card2:  '#1b2937',
  card3:  '#22303f',
  line:   'rgba(255,255,255,0.06)',
  line2:  'rgba(255,255,255,0.10)',
  orange: '#e87b3e',
  green:  '#27a567',
  blue:   '#3d82d4',
  purple: '#9466cf',
  gold:   '#f0b429',
  txt:    '#ffffff',
  dim:    '#8492a3',
  dim2:   '#5e6e80',
};

// ─── Default Data ─────────────────────────────────────────────────────────────

const DEFAULT_SPECS = [
  "Kran ta'miri", 'Quvur montaji', 'Smesitel',
  "Filtr o'rnatish", 'Avariya', 'Isitish',
];

const DEFAULT_SERVICES = [
  { name: "Kran / smesitel ta'miri", price: '30 000' },
  { name: 'Quvur almashtirish',       price: '60 000' },
  { name: "Unitaz o'rnatish",         price: '120 000' },
  { name: 'Avariya (shoshilinch)',    price: '80 000' },
];

const DEFAULT_TIMES = ['Bugun 14:00', 'Bugun 16:30', 'Ertaga 09:00', 'Ertaga 11:00'];

const DEFAULT_CERTS = [
  { name: 'Santexnika litsenziyasi', year: '2021' },
  { name: 'Gaz xavfsizligi',         year: '2023' },
];

const DEFAULT_BARS = [
  { label: '5★', pct: 92 },
  { label: '4★', pct: 6  },
  { label: '3★', pct: 1  },
  { label: '2★', pct: 1  },
  { label: '1★', pct: 0  },
];

const DEFAULT_REVIEWS = [
  { initial: 'M', name: 'Madina K.',  rating: 5, time: '2 hafta oldin', hasPhoto: true,
    text: "Juda xushmuomala usta, narxi ham arzon. Ishni tez va sifatli bajardi, albatta yana chaqiraman.",
    bgColor: C.green  },
  { initial: 'J', name: 'Jasur R.',   rating: 5, time: '3 hafta oldin', hasPhoto: false,
    text: "Tez keldi, hammasini puxta qildi. Rahmat!",
    bgColor: C.green  },
  { initial: 'O', name: 'Otabek S.',  rating: 4, time: '1 oy oldin',    hasPhoto: false,
    text: "Yaxshi usta, vaqtida keldi. Ishdan mamnunman.",
    bgColor: C.blue   },
  { initial: 'N', name: 'Nilufar A.', rating: 5, time: '1 oy oldin',    hasPhoto: true,
    text: "Zo'r usta! Muammoni tezda hal qildi.",
    bgColor: C.purple },
  { initial: 'B', name: 'Bobur T.',   rating: 5, time: '2 oy oldin',    hasPhoto: false,
    text: "Narxi adolatli, sifat yuqori. Tavsiya qilaman!",
    bgColor: C.orange },
];

// ─── Works Carousel ───────────────────────────────────────────────────────────

const CARD_W  = 148;
const CARD_GAP = 10;
const CARD_SLOT = CARD_W + CARD_GAP;

const DEFAULT_WORKS = [
  { id: 1,  title: "Vannaxona ta'miri",   icon: 'water-pump', color: '#e87b3e', rating: 5.0 },
  { id: 2,  title: 'Quvur almashtirish',  icon: 'pipe',       color: '#3d82d4', rating: 4.9 },
  { id: 3,  title: "Kran o'rnatish",      icon: 'wrench',     color: '#27a567', rating: 5.0 },
  { id: 4,  title: 'Qozon ulanishi',      icon: 'radiator',   color: '#9466cf', rating: 4.8 },
  { id: 5,  title: "Dush o'rnatish",      icon: 'shower',     color: '#f0b429', rating: 4.9 },
  { id: 6,  title: 'Unitaz almashtirish', icon: 'toilet',     color: '#e8533e', rating: 5.0 },
  { id: 7,  title: "Suv o'tkazgich",      icon: 'water',      color: '#42a5f5', rating: 4.8 },
  { id: 8,  title: "Filtr o'rnatish",     icon: 'water-pump', color: '#26a69a', rating: 4.9 },
  { id: 9,  title: 'Isitish tizimi',      icon: 'fire',       color: '#ff7043', rating: 5.0 },
  { id: 10, title: "Sanitariya ta'miri",  icon: 'hammer-wrench', color: '#78909c', rating: 4.7 },
];

function WorksCarousel({ works }) {
  const listRef = useRef(null);
  const idxRef  = useRef(0);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      const next = (idxRef.current + 1) % works.length;
      idxRef.current = next;
      setActive(next);
      listRef.current?.scrollToOffset({ offset: next * CARD_SLOT, animated: true });
    }, 2200);
    return () => clearInterval(t);
  }, [works.length]);

  return (
    <View>
      <FlatList
        ref={listRef}
        data={works}
        keyExtractor={(item) => String(item.id)}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_SLOT}
        decelerationRate="fast"
        contentContainerStyle={{ paddingLeft: 20, paddingRight: 10, gap: CARD_GAP }}
        renderItem={({ item }) => (
          <TouchableOpacity style={st.workCard} activeOpacity={0.85}>
            <View style={[st.workImg, { backgroundColor: item.color + '22' }]}>
              <MaterialCommunityIcons name={item.icon} size={44} color={item.color + 'bb'} />
              <View style={st.workBadge}>
                <Ionicons name="star" size={11} color={C.gold} />
                <Text style={st.workBadgeTxt}>{item.rating.toFixed(1)}</Text>
              </View>
            </View>
            <View style={{ padding: 10 }}>
              <Text style={st.workTitle} numberOfLines={2}>{item.title}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
      <View style={st.dots}>
        {works.map((_, i) => (
          <View key={i} style={[st.dot, i === active && st.dotActive]} />
        ))}
      </View>
    </View>
  );
}

// ─── Rating Bar ───────────────────────────────────────────────────────────────

function RatingBar({ label, pct }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Text style={{ width: 28, color: C.dim, fontSize: 12, fontWeight: '700', textAlign: 'right' }}>
        {label}
      </Text>
      <View style={{ flex: 1, height: 7, borderRadius: 9, backgroundColor: C.card3, overflow: 'hidden' }}>
        {pct > 0 && (
          <View style={{ width: pct + '%', height: 7, borderRadius: 9, backgroundColor: C.gold }} />
        )}
      </View>
      <Text style={{ width: 30, color: C.dim, fontSize: 12, fontWeight: '600', textAlign: 'right' }}>
        {pct}%
      </Text>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function UstaDetailScreen({ usta, onBack, onGoToLogin, isLoggedIn = false }) {
  const insets = useSafeAreaInsets();
  const [reviewFilter, setReviewFilter] = useState('all');

  const initial       = usta?.initial || 'A';
  const name          = usta?.name || 'Alisher Usmonov';
  const trade         = usta?.trade || usta?.profession || 'Santexnik';
  const rawRating     = usta?.rating;
  const rating        = typeof rawRating === 'number' ? rawRating.toFixed(1) : (rawRating || '4.9');
  const jobs          = String(usta?.jobs || '184');
  const bgColor       = usta?.bgColor || usta?.color || C.orange;
  const location      = usta?.location || 'Chilonzor';
  const experience    = usta?.experience || '7 yil';
  const repeatRate    = usta?.repeatRate || '98%';
  const reviewCount   = usta?.reviewCount || jobs;
  const startingPrice = usta?.startingPrice || '30 000';
  const reviews       = usta?.reviews || DEFAULT_REVIEWS;
  const works         = usta?.works || DEFAULT_WORKS;
  const specs         = usta?.specializations || DEFAULT_SPECS;
  const services      = usta?.services || DEFAULT_SERVICES;
  const times         = usta?.availableTimes || DEFAULT_TIMES;
  const certs         = usta?.certificates || DEFAULT_CERTS;
  const bars          = usta?.ratingBars || DEFAULT_BARS;

  const shownReviews = reviewFilter === 'photo' ? reviews.filter(r => r.hasPhoto) : reviews;

  return (
    <SafeAreaView style={st.safe} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />

      {/* ── Header ── */}
      <View style={st.header}>
        <TouchableOpacity onPress={onBack} style={st.iconBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={C.txt} />
        </TouchableOpacity>
        <Text style={st.headerTitle}>Usta profili</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity style={st.iconBtn} activeOpacity={0.7}>
            <Feather name="share-2" size={18} color={C.txt} />
          </TouchableOpacity>
          {isLoggedIn && (
            <TouchableOpacity style={st.iconBtn} activeOpacity={0.7}>
              <Ionicons name="heart" size={20} color={C.orange} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 14) + 76 }}
      >

        {/* ═══ Padded content block 1 ═══ */}
        <View style={st.pad}>

          {/* ── Hero ── */}
          <View style={{ flexDirection: 'row', gap: 14, marginTop: 14, alignItems: 'center' }}>
            <View style={[st.avatar, { backgroundColor: bgColor }]}>
              <Text style={st.avatarTxt}>{initial}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <Text style={{ fontSize: 19, fontWeight: '800', color: C.txt }}>{name}</Text>
                <MaterialCommunityIcons name="shield-check" size={18} color={C.green} />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
                <Ionicons name="location-outline" size={13} color={C.dim} />
                <Text style={{ fontSize: 13, color: C.dim }} numberOfLines={1}>
                  {trade} · {location} · 1.2 km
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 7 }}>
                <View style={st.ratingBadge}>
                  <Ionicons name="star" size={13} color={C.gold} />
                  <Text style={{ color: C.gold, fontSize: 12, fontWeight: '800' }}>{rating}</Text>
                </View>
                <Text style={{ fontSize: 12.5, color: C.dim }}>· {reviewCount} ta sharh</Text>
              </View>
            </View>
          </View>

          {/* ── Online status ── */}
          {isLoggedIn && (
            <View style={[st.card2, { marginTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, paddingHorizontal: 15 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.green }} />
                <Text style={{ fontSize: 13.5, fontWeight: '700', color: C.green }}>Hozir onlayn</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <Ionicons name="time-outline" size={14} color={C.dim} />
                <Text style={{ fontSize: 12.5, color: C.dim }}>~5 daqiqada javob beradi</Text>
              </View>
            </View>
          )}

          {/* ── Stats ── */}
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
            {[[jobs, 'Bajarilgan'], [experience, 'Tajriba'], [repeatRate, 'Qayta chaqiruv']].map(([v, l], i) => (
              <View key={i} style={[st.card, { flex: 1, alignItems: 'center', paddingVertical: 13 }]}>
                <Text style={{ fontSize: 17, fontWeight: '800', color: C.txt }}>{v}</Text>
                <Text style={{ fontSize: 11.5, color: C.dim, marginTop: 2, textAlign: 'center' }}>{l}</Text>
              </View>
            ))}
          </View>

          {/* ── Badges ── */}
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            {[
              { emoji: '🏆', label: 'Top 5%',    bg: 'rgba(240,180,41,0.14)',  color: C.gold  },
              { emoji: '⚡',  label: 'Tezkor',    bg: 'rgba(61,130,212,0.14)',  color: C.blue  },
              { emoji: '🛡',  label: 'Kafolatli', bg: 'rgba(39,165,103,0.14)', color: C.green },
            ].map((b, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: b.bg, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 10 }}>
                <Text style={{ fontSize: 13 }}>{b.emoji}</Text>
                <Text style={{ fontSize: 12.5, fontWeight: '800', color: b.color }}>{b.label}</Text>
              </View>
            ))}
          </View>

          {/* ── Mutaxassislik ── */}
          <Text style={st.secTitle}>Mutaxassislik</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {specs.map((s, i) => (
              <View key={i} style={st.chip}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: C.txt }}>{s}</Text>
              </View>
            ))}
          </View>

          {/* ── Xizmatlar narxi ── */}
          <Text style={st.secTitle}>Xizmatlar narxi</Text>
          <View style={st.card}>
            {services.map((svc, i) => (
              <View key={i} style={[st.svcRow, i < services.length - 1 && { borderBottomWidth: 1, borderBottomColor: C.line }]}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: C.txt, flex: 1, marginRight: 8 }}>{svc.name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 2 }}>
                  <Text style={{ fontSize: 14, fontWeight: '800', color: C.txt }}>{svc.price}</Text>
                  <Text style={{ fontSize: 11.5, color: C.dim }}> so'm dan</Text>
                </View>
              </View>
            ))}
          </View>

          {/* ── Bo'sh vaqtlar ── */}
          {isLoggedIn && (
            <>
              <Text style={st.secTitle}>Bo'sh vaqtlar</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {times.map((tm, i) => (
                  <View key={i} style={[st.chip, i === 0 && st.chipActive]}>
                    <Ionicons name="time-outline" size={14} color={i === 0 ? C.orange : C.dim} />
                    <Text style={{ fontSize: 13, fontWeight: '700', color: i === 0 ? C.orange : C.txt }}>{tm}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* ── Sertifikatlar ── */}
          <Text style={st.secTitle}>Sertifikatlar</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {certs.map((c, i) => (
              <View key={i} style={[st.card, { flex: 1, padding: 13 }]}>
                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                  <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(39,165,103,0.14)', alignItems: 'center', justifyContent: 'center' }}>
                    <MaterialCommunityIcons name="shield-check" size={18} color={C.green} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12.5, fontWeight: '700', color: C.txt, lineHeight: 17 }}>{c.name}</Text>
                    <Text style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>{c.year}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

        </View>

        {/* ── Ishlari (full-width carousel) ── */}
        <Text style={[st.secTitle, { paddingHorizontal: 20, marginTop: 22, marginBottom: 14 }]}>Ishlari</Text>
        <WorksCarousel works={works} />

        {/* ═══ Padded content block 2 ═══ */}
        <View style={st.pad}>

          {/* ── Reyting ── */}
          <Text style={[st.secTitle, { marginTop: 22 }]}>Reyting</Text>
          <View style={st.card}>
            <View style={{ flexDirection: 'row', gap: 18, alignItems: 'center', padding: 16 }}>
              <View style={{ alignItems: 'center', minWidth: 68 }}>
                <Text style={{ fontSize: 38, fontWeight: '800', color: C.txt, lineHeight: 42 }}>{rating}</Text>
                <View style={{ flexDirection: 'row', gap: 2, marginTop: 6 }}>
                  {[...Array(5)].map((_, k) => (
                    <Ionicons key={k} name="star" size={13} color={C.gold} />
                  ))}
                </View>
                <Text style={{ fontSize: 11.5, color: C.dim, marginTop: 5 }}>{reviewCount} sharh</Text>
              </View>
              <View style={{ flex: 1, gap: 7 }}>
                {bars.map((b, i) => <RatingBar key={i} label={b.label} pct={b.pct} />)}
              </View>
            </View>
          </View>

          {/* ── Sharhlar + filter ── */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 22, marginBottom: 12 }}>
            <Text style={{ fontSize: 15, fontWeight: '800', color: C.txt }}>Sharhlar</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {[['all', 'Hammasi'], ['photo', 'Fotosli']].map(([key, label]) => (
                <TouchableOpacity
                  key={key}
                  onPress={() => setReviewFilter(key)}
                  style={[st.filterChip, reviewFilter === key && st.filterChipOn]}
                  activeOpacity={0.75}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color: reviewFilter === key ? C.orange : C.txt }}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ gap: 12 }}>
            {shownReviews.map((r, i) => (
              <View key={i} style={[st.card, { padding: 14 }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                    <View style={[st.revAv, { backgroundColor: r.bgColor }]}>
                      <Text style={st.revAvTxt}>{r.initial}</Text>
                    </View>
                    <View>
                      <Text style={{ fontWeight: '700', fontSize: 14, color: C.txt }}>{r.name}</Text>
                      <Text style={{ fontSize: 11, color: C.dim, marginTop: 1 }}>{r.time}</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 2 }}>
                    {[...Array(r.rating)].map((_, k) => (
                      <Ionicons key={k} name="star" size={13} color={C.gold} />
                    ))}
                  </View>
                </View>
                <Text style={{ fontSize: 13.5, color: '#c4cdd8', marginTop: 10, lineHeight: 20 }}>
                  {r.text}
                </Text>
                {r.hasPhoto && (
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                    {[0, 1].map((_, k) => (
                      <View key={k} style={st.revPhoto}>
                        <MaterialCommunityIcons name="image-outline" size={22} color={C.dim2} />
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>

        </View>
      </ScrollView>

      {/* ── Bottom CTA ── */}
      <View style={[st.bottomBar, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        <TouchableOpacity style={st.chatBtn} activeOpacity={0.8}>
          <Ionicons name="chatbubble-outline" size={22} color={C.txt} />
        </TouchableOpacity>
        <TouchableOpacity style={st.callBtn} activeOpacity={0.85} onPress={isLoggedIn ? undefined : onGoToLogin}>
          <MaterialCommunityIcons name="lightning-bolt" size={18} color="#fff" />
          <Text style={st.callBtnTxt}>Chaqirish · {startingPrice} dan</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  pad:  { paddingHorizontal: 20 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: C.card3, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { color: C.txt, fontSize: 17, fontWeight: '700' },

  avatar: {
    width: 68, height: 68, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  avatarTxt: { color: '#fff', fontSize: 26, fontWeight: '800' },

  ratingBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(240,180,41,0.15)',
    paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8,
  },

  card:  { backgroundColor: C.card,  borderWidth: 1, borderColor: C.line,  borderRadius: 18 },
  card2: { backgroundColor: C.card2, borderWidth: 1, borderColor: C.line,  borderRadius: 16 },

  secTitle: { fontSize: 15, fontWeight: '800', color: C.txt, marginTop: 22, marginBottom: 11 },

  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    height: 36, paddingHorizontal: 14, borderRadius: 12,
    backgroundColor: C.card2, borderWidth: 1, borderColor: C.line,
  },
  chipActive: {
    backgroundColor: 'rgba(232,123,62,0.16)', borderColor: C.orange,
  },

  svcRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 13, paddingHorizontal: 16,
  },

  /* Works */
  workCard: {
    width: CARD_W, backgroundColor: C.card,
    borderRadius: 16, borderWidth: 1, borderColor: C.line, overflow: 'hidden',
  },
  workImg:     { height: 110, alignItems: 'center', justifyContent: 'center' },
  workBadge: {
    position: 'absolute', top: 8, right: 8,
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(10,19,34,0.72)',
    borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3,
  },
  workBadgeTxt: { color: '#fff', fontSize: 11, fontWeight: '700' },
  workTitle:    { color: C.txt, fontSize: 12.5, fontWeight: '600', lineHeight: 17 },

  dots:     { flexDirection: 'row', justifyContent: 'center', marginTop: 12, gap: 5 },
  dot:      { width: 6, height: 6, borderRadius: 3, backgroundColor: C.card3 },
  dotActive:{ width: 18, backgroundColor: C.orange },

  /* Filter */
  filterChip: {
    height: 32, paddingHorizontal: 14, borderRadius: 10,
    backgroundColor: C.card2, borderWidth: 1, borderColor: C.line,
    alignItems: 'center', justifyContent: 'center',
  },
  filterChipOn: {
    backgroundColor: 'rgba(232,123,62,0.16)', borderColor: C.orange,
  },

  /* Reviews */
  revAv:    { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  revAvTxt: { color: '#fff', fontSize: 14, fontWeight: '700' },
  revPhoto: {
    width: 60, height: 60, borderRadius: 11,
    backgroundColor: C.card2, borderWidth: 1, borderColor: C.line,
    alignItems: 'center', justifyContent: 'center',
  },

  /* Bottom CTA */
  bottomBar: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    backgroundColor: C.card,
    borderTopWidth: 1, borderColor: C.line2,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 20, paddingTop: 14,
  },
  chatBtn: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: C.card3, alignItems: 'center', justifyContent: 'center',
  },
  callBtn: {
    flex: 1, height: 52, borderRadius: 14,
    backgroundColor: C.orange,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  callBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
