import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';
import { useTheme } from '../context/ThemeContext';

const HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 };
const AVATAR_COLORS = ['#2fa37a', '#e87a45', '#3f7fd4', '#9b6cd1', '#f5c451', '#ec4899'];

function colorForName(name) {
  const code = name ? name.charCodeAt(0) : 0;
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
}

// ─── Vaqtinchalik namunaviy ma'lumot ────────────────────────────
// Backend hali sana/lokatsiya/narx/sharhlarni qaytarmagani uchun,
// har bir ish uchun barqaror (id'ga bog'liq) namunaviy qiymatlar hosil qilamiz.

const CATEGORY_TAGS = ['Santexnika', 'Elektrik', 'Duradgorlik', "Bo'yash", 'Tozalash', 'Konditsioner'];
const LOCATIONS = ['Chilonzor', 'Yunusobod', "Mirzo Ulug'bek", 'Sergeli', 'Yakkasaroy', 'Shayxontohur'];
const DURATIONS = ['2 soat', '3 soat', '4 soat', '1 kun', '2 kun'];
const POSTED_AGO = ['2 kun oldin', '5 kun oldin', '1 hafta oldin', '2 hafta oldin', '3 hafta oldin', '1 oy oldin'];

const MASTER_NOTES = [
  "Ish belgilangan muddatda, sifatli materiallar bilan bajarildi. Mijoz talablariga to'liq javob berdik.",
  'Barcha ishlar xavfsizlik qoidalariga rioya qilingan holda, puxta yakunlandi.',
  "Mijoz bilan kelishilgan rejaga asosan, qo'shimcha kechikishlarsiz ishni topshirdik.",
  "Sifatli jihozlar va zamonaviy uslublardan foydalanib, natijani mijozga ko'rsatdik.",
];

const CUSTOMER_REVIEWERS = [
  { name: 'Dilnoza R.', initial: 'D', color: '#ec4899' },
  { name: 'Sardor M.', initial: 'S', color: '#3f7fd4' },
  { name: 'Gulnora T.', initial: 'G', color: '#9b6cd1' },
  { name: 'Aziz K.', initial: 'A', color: '#2fa37a' },
  { name: 'Malika B.', initial: 'M', color: '#f5c451' },
];

const CUSTOMER_NOTES = [
  'Juda tez va sifatli ishladi, albatta yana murojaat qilamiz!',
  'Belgilangan vaqtda keldi, ishni toza va puxta bajardi. Rahmat!',
  "Narxi mos, sifati a'lo darajada. Tavsiya qilaman.",
  'Muloqoti yoqimli, ishiga mas\'uliyat bilan yondashadi.',
];

function hashOf(str) {
  let h = 0;
  for (let i = 0; i < (str || '').length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

function mockWorkDetails(work) {
  const seed = hashOf(work?.id != null ? String(work.id) : work?.title || '');
  const total = 120000 + (seed % 12) * 25000;
  const materialRatio = 0.3 + ((seed % 20) / 100);
  const material = Math.round((total * materialRatio) / 1000) * 1000;
  const reviewer = CUSTOMER_REVIEWERS[seed % CUSTOMER_REVIEWERS.length];

  return {
    category: CATEGORY_TAGS[seed % CATEGORY_TAGS.length],
    location: LOCATIONS[(seed >> 2) % LOCATIONS.length],
    postedAgo: POSTED_AGO[(seed >> 4) % POSTED_AGO.length],
    duration: DURATIONS[(seed >> 3) % DURATIONS.length],
    price: total,
    priceMaterial: material,
    priceLabor: total - material,
    masterNote: MASTER_NOTES[(seed >> 1) % MASTER_NOTES.length],
    customerReview: {
      ...reviewer,
      rating: work?.rating || 5,
      text: CUSTOMER_NOTES[(seed >> 5) % CUSTOMER_NOTES.length],
    },
  };
}

function formatPrice(n) {
  return n.toLocaleString('ru-RU');
}

function HeroPhotos({ photos, index, onIndexChange, t }) {
  if (photos.length === 0) {
    return (
      <View style={[styles.heroImg, styles.heroEmpty, { backgroundColor: t.isDark ? '#1d2a3a' : '#e0eaf5' }]}>
        <MaterialCommunityIcons
          name="image-outline"
          size={56}
          color={t.isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.12)'}
        />
      </View>
    );
  }

  const goPrev = () => onIndexChange((index - 1 + photos.length) % photos.length);
  const goNext = () => onIndexChange((index + 1) % photos.length);

  return (
    <View style={styles.heroWrap}>
      <Image source={{ uri: photos[index] }} style={styles.heroImg} resizeMode="cover" />
      {photos.length > 1 && (
        <>
          <TouchableOpacity style={[styles.navBtn, styles.navBtnLeft]} onPress={goPrev} hitSlop={HIT_SLOP}>
            <Ionicons name="chevron-back" size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.navBtn, styles.navBtnRight]} onPress={goNext} hitSlop={HIT_SLOP}>
            <Ionicons name="chevron-forward" size={18} color="#fff" />
          </TouchableOpacity>
          <View style={styles.heroDots}>
            {photos.map((_, i) => (
              <View key={i} style={[styles.heroDot, i === index && styles.heroDotActive]} />
            ))}
          </View>
        </>
      )}
    </View>
  );
}

export default function WorkDetailScreen({ work, onBack, onSelectUsta }) {
  const { theme: t } = useTheme();
  const [photoIndex, setPhotoIndex] = useState(0);

  const title = work?.title || "Ish tafsilotlari";
  const worker = work?.worker || '';
  const rating = typeof work?.rating === 'number' ? work.rating : 0;
  const photos = work?.photos || [];
  const workerInitial = worker ? worker[0].toUpperCase() : '?';
  const workerColor = colorForName(worker);
  const details = mockWorkDetails(work);

  const openUstaProfile = () => {
    onSelectUsta?.({
      initial: workerInitial,
      name: worker || "Noma'lum usta",
      trade: details.category,
      rating,
      bgColor: workerColor,
      location: details.location,
    });
  };

  const share = () => {
    Share.share({
      message: `"${title}" — ${worker ? `${worker} tomonidan bajarilgan, ` : ''}reyting ${rating.toFixed(1)} ★. Ilovada ko'ring!`,
    }).catch(() => {});
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top', 'left', 'right']}>
      <StatusBar style={t.isDark ? 'light' : 'dark'} />

      <View style={[styles.header, { backgroundColor: t.bg }]}>
        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: t.card, borderColor: t.border }]}
          onPress={onBack}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="chevron-left" size={24} color={t.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: t.text }]} numberOfLines={1}>
          Ish tafsilotlari
        </Text>
        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: t.card, borderColor: t.border }]}
          onPress={share}
          activeOpacity={0.8}
        >
          <Feather name="share-2" size={18} color={t.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.heroOuter}>
          <HeroPhotos photos={photos} index={photoIndex} onIndexChange={setPhotoIndex} t={t} />

          <View style={styles.donePill}>
            <Ionicons name="checkmark-circle" size={13} color="#2fa37a" />
            <Text style={styles.donePillText}>Yakunlangan</Text>
          </View>

          <View style={styles.ratingPill}>
            <Ionicons name="star" size={13} color={t.gold} />
            <Text style={[styles.ratingPillText, { color: t.gold }]}>{rating.toFixed(1)}</Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, paddingTop: 18 }}>
          <Text style={[styles.title, { color: t.text }]}>{title}</Text>

          <View style={styles.metaRow}>
            <View style={[styles.metaChip, { backgroundColor: t.orange + '18' }]}>
              <Text style={[styles.metaChipText, { color: t.orange }]}>{details.category}</Text>
            </View>
            <View style={styles.metaItem}>
              <Feather name="map-pin" size={13} color={t.muted} />
              <Text style={[styles.metaItemText, { color: t.muted }]}>{details.location}</Text>
            </View>
            <View style={styles.metaItem}>
              <Feather name="calendar" size={13} color={t.muted} />
              <Text style={[styles.metaItemText, { color: t.muted }]}>{details.postedAgo}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.workerCard,
              { backgroundColor: t.card, borderColor: t.border, marginTop: 14 },
            ]}
            onPress={openUstaProfile}
            activeOpacity={0.8}
          >
            <View style={[styles.workerAvatar, { backgroundColor: workerColor }]}>
              <Text style={styles.workerAvatarText}>{workerInitial}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.workerLabel, { color: t.muted }]}>Ijrochi usta</Text>
              <Text style={[styles.workerName, { color: t.text }]} numberOfLines={1}>
                {worker || "Noma'lum usta"}
              </Text>
            </View>
            <View style={styles.workerRatingBadge}>
              <Ionicons name="star" size={12} color={t.gold} />
              <Text style={[styles.workerRatingText, { color: t.gold }]}>{rating.toFixed(1)}</Text>
            </View>
            <Feather name="chevron-right" size={16} color={t.muted} />
          </TouchableOpacity>

          <Text style={[styles.sectionLabel, { color: t.text }]}>Ish narxi</Text>
          <View style={[styles.priceCard, { backgroundColor: t.card, borderColor: t.border }]}>
            <View style={styles.priceHeaderRow}>
              <Text style={[styles.priceTotalLabel, { color: t.muted }]}>Umumiy narx</Text>
              <Text style={[styles.priceTotalValue, { color: t.text }]}>
                {formatPrice(details.price)} so'm
              </Text>
            </View>
            <View style={[styles.priceDivider, { backgroundColor: t.border }]} />
            <View style={styles.priceRow}>
              <View style={styles.priceRowLeft}>
                <Feather name="package" size={14} color={t.muted} />
                <Text style={[styles.priceRowLabel, { color: t.muted }]}>Materiallar</Text>
              </View>
              <Text style={[styles.priceRowValue, { color: t.text }]}>
                {formatPrice(details.priceMaterial)} so'm
              </Text>
            </View>
            <View style={styles.priceRow}>
              <View style={styles.priceRowLeft}>
                <Feather name="tool" size={14} color={t.muted} />
                <Text style={[styles.priceRowLabel, { color: t.muted }]}>Ish haqi</Text>
              </View>
              <Text style={[styles.priceRowValue, { color: t.text }]}>
                {formatPrice(details.priceLabor)} so'm
              </Text>
            </View>
            <View style={styles.priceRow}>
              <View style={styles.priceRowLeft}>
                <Feather name="clock" size={14} color={t.muted} />
                <Text style={[styles.priceRowLabel, { color: t.muted }]}>Davomiyligi</Text>
              </View>
              <Text style={[styles.priceRowValue, { color: t.text }]}>{details.duration}</Text>
            </View>
          </View>

          <Text style={[styles.sectionLabel, { color: t.text }]}>Usta izohi</Text>
          <View style={[styles.noteCard, { backgroundColor: t.card, borderColor: t.border }]}>
            <TouchableOpacity style={styles.noteHeader} onPress={openUstaProfile} activeOpacity={0.7}>
              <View style={[styles.noteAvatar, { backgroundColor: workerColor }]}>
                <Text style={styles.noteAvatarText}>{workerInitial}</Text>
              </View>
              <Text style={[styles.noteName, { color: t.text, flex: 1 }]} numberOfLines={1}>
                {worker || "Noma'lum usta"}
              </Text>
              <Feather name="chevron-right" size={15} color={t.muted} />
            </TouchableOpacity>
            <Text style={[styles.noteText, { color: t.muted }]}>{details.masterNote}</Text>
          </View>

          <Text style={[styles.sectionLabel, { color: t.text }]}>Zakazchik sharhi</Text>
          <View style={[styles.noteCard, { backgroundColor: t.card, borderColor: t.border }]}>
            <View style={styles.noteHeader}>
              <View style={[styles.noteAvatar, { backgroundColor: details.customerReview.color }]}>
                <Text style={styles.noteAvatarText}>{details.customerReview.initial}</Text>
              </View>
              <Text style={[styles.noteName, { color: t.text, flex: 1 }]} numberOfLines={1}>
                {details.customerReview.name}
              </Text>
              <View style={styles.workerRatingBadge}>
                <Ionicons name="star" size={11} color={t.gold} />
                <Text style={[styles.workerRatingText, { color: t.gold }]}>
                  {Number(details.customerReview.rating).toFixed(1)}
                </Text>
              </View>
            </View>
            <Text style={[styles.noteText, { color: t.muted }]}>{details.customerReview.text}</Text>
          </View>

          {photos.length > 1 && (
            <>
              <Text style={[styles.sectionLabel, { color: t.text }]}>
                Barcha suratlar ({photos.length})
              </Text>
              <View style={styles.thumbRow}>
                {photos.map((uri, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setPhotoIndex(i)}
                    activeOpacity={0.85}
                    style={[
                      styles.thumbWrap,
                      { borderColor: i === photoIndex ? t.orange : 'transparent' },
                    ]}
                  >
                    <Image source={{ uri }} style={styles.thumb} resizeMode="cover" />
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', marginHorizontal: 8 },

  heroOuter: { position: 'relative' },
  heroWrap: { width: '100%', height: 300 },
  heroImg: { width: '100%', height: '100%' },
  heroEmpty: { alignItems: 'center', justifyContent: 'center' },
  navBtn: {
    position: 'absolute',
    top: '50%',
    marginTop: -16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(10,19,34,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnLeft: { left: 14 },
  navBtnRight: { right: 14 },
  heroDots: {
    position: 'absolute',
    bottom: 14,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
  },
  heroDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  heroDotActive: { width: 16, backgroundColor: '#fff' },

  donePill: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(10,19,34,0.72)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  donePillText: { color: '#fff', fontSize: 11.5, fontWeight: '700' },
  ratingPill: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(10,19,34,0.72)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  ratingPillText: { fontSize: 12.5, fontWeight: '800' },

  title: { fontSize: 20, fontWeight: '800', lineHeight: 27 },

  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginTop: 10 },
  metaChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  metaChipText: { fontSize: 11.5, fontWeight: '700' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaItemText: { fontSize: 12, fontWeight: '600' },

  workerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 13,
  },
  workerAvatar: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  workerAvatarText: { color: '#fff', fontWeight: '800', fontSize: 17 },
  workerLabel: { fontSize: 11, fontWeight: '600' },
  workerName: { fontSize: 15, fontWeight: '700', marginTop: 2 },
  workerRatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(245,196,81,0.14)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },
  workerRatingText: { fontSize: 12, fontWeight: '700' },

  priceCard: { borderWidth: 1, borderRadius: 16, padding: 14 },
  priceHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  priceTotalLabel: { fontSize: 12.5, fontWeight: '600' },
  priceTotalValue: { fontSize: 17, fontWeight: '800' },
  priceDivider: { height: 1, marginVertical: 12 },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  priceRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  priceRowLabel: { fontSize: 12.5, fontWeight: '600' },
  priceRowValue: { fontSize: 12.5, fontWeight: '700' },

  noteCard: { borderWidth: 1, borderRadius: 16, padding: 14 },
  noteHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  noteAvatar: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  noteAvatarText: { color: '#fff', fontWeight: '800', fontSize: 12.5 },
  noteName: { fontSize: 13.5, fontWeight: '700' },
  noteText: { fontSize: 13, lineHeight: 19 },

  sectionLabel: { fontSize: 14.5, fontWeight: '800', marginTop: 24, marginBottom: 12 },
  thumbRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  thumbWrap: { width: 78, height: 78, borderRadius: 12, borderWidth: 2, overflow: 'hidden' },
  thumb: { width: '100%', height: '100%' },
});
