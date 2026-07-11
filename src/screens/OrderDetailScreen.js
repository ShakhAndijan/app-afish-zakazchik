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
import UstaDetailScreen from './UstaDetailScreen';

const HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 };

const fmt = (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

const STATUS_CFG = {
  done: {
    label: 'Bajarildi',
    color: '#2fa37a',
    bg: 'rgba(47,163,122,0.15)',
    icon: 'check-circle-outline',
    subtext: 'Ish muvaffaqiyatli yakunlandi',
  },
  cancelled: {
    label: 'Bekor qilindi',
    color: '#e0473a',
    bg: 'rgba(224,71,58,0.13)',
    icon: 'close-circle-outline',
    subtext: 'Bu buyurtma bekor qilingan',
  },
  active: {
    label: 'Jarayonda',
    color: '#e87a45',
    bg: 'rgba(232,122,69,0.15)',
    icon: 'clock-outline',
    subtext: 'Usta hozirda ish ustida',
  },
};

const PAYMENT_STATUS_CFG = {
  paid: { label: "To'landi", color: '#2fa37a' },
  refunded: { label: "Mablag' qaytarildi", color: '#3f7fd4' },
  not_charged: { label: 'Hisoblanmagan', color: '#8da0ba' },
};

const CANCEL_BY_LABEL = {
  usta: 'Usta tomonidan',
  mijoz: 'Siz tomoningizdan',
};

function hashOf(str) {
  let h = 0;
  for (let i = 0; i < (str || '').length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

function priceBreakdown(order) {
  const seed = hashOf(order.id);
  const ratio = 0.3 + ((seed % 20) / 100);
  const material = Math.round((order.price * ratio) / 1000) * 1000;
  return { material, labor: order.price - material };
}

// Rasm massivda bo'lishi mumkin: bo'lg'usi backend'dan kelgan uzoq uri
// (string) yoki lokal require() qilingan asset (raqam/obyekt).
function toImgSource(photo) {
  return typeof photo === 'string' ? { uri: photo } : photo;
}

/* ── Photo gallery (main image + thumbnails), used independently for
   "before" and "after" photo sets since each can hold several photos ── */
function PhotoGallery({ photos, index, onIndexChange, t, height = 200 }) {
  const goPrev = () => onIndexChange((index - 1 + photos.length) % photos.length);
  const goNext = () => onIndexChange((index + 1) % photos.length);

  return (
    <View>
      <View style={[styles.galleryImgWrap, { height }]}>
        <Image source={toImgSource(photos[index])} style={styles.galleryImg} resizeMode="cover" />
        {photos.length > 1 && (
          <>
            <TouchableOpacity style={[styles.galleryNavBtn, styles.galleryNavLeft]} onPress={goPrev} hitSlop={HIT_SLOP}>
              <Ionicons name="chevron-back" size={16} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.galleryNavBtn, styles.galleryNavRight]} onPress={goNext} hitSlop={HIT_SLOP}>
              <Ionicons name="chevron-forward" size={16} color="#fff" />
            </TouchableOpacity>
            <View style={styles.galleryCounter}>
              <Text style={styles.galleryCounterText}>
                {index + 1}/{photos.length}
              </Text>
            </View>
          </>
        )}
      </View>
      {photos.length > 1 && (
        <View style={styles.thumbRow}>
          {photos.map((photo, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => onIndexChange(i)}
              activeOpacity={0.85}
              style={[styles.thumbWrap, { borderColor: i === index ? t.orange : 'transparent' }]}
            >
              <Image source={toImgSource(photo)} style={styles.thumb} resizeMode="cover" />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

function InfoRow({ icon, label, value, t, right }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoRowLeft}>
        <Feather name={icon} size={14} color={t.muted} />
        <Text style={[styles.infoLabel, { color: t.muted }]}>{label}</Text>
      </View>
      {right || <Text style={[styles.infoValue, { color: t.text }]}>{value}</Text>}
    </View>
  );
}

function Stars({ rating, t }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons key={i} name="star" size={13} color={i <= rating ? t.gold : t.border} />
      ))}
    </View>
  );
}

export default function OrderDetailScreen({ order, onBack }) {
  const { theme: t } = useTheme();
  const [beforeIndex, setBeforeIndex] = useState(0);
  const [afterIndex, setAfterIndex] = useState(0);
  const [selectedUsta, setSelectedUsta] = useState(null);

  if (!order) return null;

  if (selectedUsta) {
    return (
      <UstaDetailScreen
        usta={selectedUsta}
        onBack={() => setSelectedUsta(null)}
        isLoggedIn
      />
    );
  }

  const cfg = STATUS_CFG[order.status] || STATUS_CFG.active;
  const payCfg = PAYMENT_STATUS_CFG[order.paymentStatus] || PAYMENT_STATUS_CFG.paid;
  const isCancelled = order.status === 'cancelled';
  const { material, labor } = priceBreakdown(order);

  const beforePhotos = order.beforePhotos || [];
  // Bekor qilingan buyurtmada ish bajarilmagani uchun "keyin" rasmlari bo'lmaydi.
  const afterPhotos = isCancelled ? [] : order.afterPhotos || [];

  const share = () => {
    Share.share({
      message: `Buyurtma #${order.id} — ${order.task}. Holati: ${cfg.label}. ${fmt(order.price)} so'm.`,
    }).catch(() => {});
  };

  const openUstaProfile = () => {
    setSelectedUsta({
      initial: order.letter,
      name: order.master,
      trade: order.service,
      rating: order.rating,
      bgColor: order.color,
      location: (order.address || '').split(',')[0],
    });
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
          Buyurtma tafsilotlari
        </Text>
        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: t.card, borderColor: t.border }]}
          onPress={share}
          activeOpacity={0.8}
        >
          <Feather name="share-2" size={18} color={t.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 }}>
        {/* Status banner */}
        <View style={[styles.statusBanner, { backgroundColor: cfg.bg, borderColor: cfg.color + '33' }]}>
          <View style={[styles.statusBannerIcon, { backgroundColor: cfg.color + '22' }]}>
            <MaterialCommunityIcons name={cfg.icon} size={20} color={cfg.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.statusBannerLabel, { color: cfg.color }]}>{cfg.label}</Text>
            <Text style={[styles.statusBannerSub, { color: t.muted }]}>{cfg.subtext}</Text>
          </View>
        </View>

        <Text style={[styles.title, { color: t.text }]}>{order.task}</Text>
        <Text style={[styles.orderNumber, { color: t.muted }]}>Buyurtma #{order.id}</Text>

        <View style={styles.metaRow}>
          <View style={[styles.metaChip, { backgroundColor: t.orange + '18' }]}>
            <Text style={[styles.metaChipText, { color: t.orange }]}>{order.service}</Text>
          </View>
          <View style={styles.metaItem}>
            <Feather name="map-pin" size={13} color={t.muted} />
            <Text style={[styles.metaItemText, { color: t.muted }]} numberOfLines={1}>
              {order.address}
            </Text>
          </View>
        </View>
        <View style={[styles.metaRow, { marginTop: 8 }]}>
          <View style={styles.metaItem}>
            <Feather name="calendar" size={13} color={t.muted} />
            <Text style={[styles.metaItemText, { color: t.muted }]}>
              {order.day}-{order.month}, {order.time}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Feather name="clock" size={13} color={t.muted} />
            <Text style={[styles.metaItemText, { color: t.muted }]}>{order.duration}</Text>
          </View>
        </View>

        {/* Master */}
        <Text style={[styles.sectionLabel, { color: t.text }]}>Tanlangan usta</Text>
        <TouchableOpacity
          style={[styles.masterCard, { backgroundColor: t.card, borderColor: t.border }]}
          onPress={openUstaProfile}
          activeOpacity={0.8}
        >
          <View style={[styles.masterAvatar, { backgroundColor: order.color }]}>
            <Text style={styles.masterAvatarText}>{order.letter}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.masterName, { color: t.text }]} numberOfLines={1}>
              {order.master}
            </Text>
            <Text style={[styles.masterTrade, { color: t.muted }]} numberOfLines={1}>
              {order.service}
            </Text>
          </View>
          {order.rating > 0 && (
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={12} color={t.gold} />
              <Text style={[styles.ratingBadgeText, { color: t.gold }]}>{order.rating}.0</Text>
            </View>
          )}
          <Feather name="chevron-right" size={16} color={t.muted} />
        </TouchableOpacity>

        {/* Order status / payment */}
        <Text style={[styles.sectionLabel, { color: t.text }]}>Buyurtma va to'lov</Text>
        <View style={[styles.infoCard, { backgroundColor: t.card, borderColor: t.border }]}>
          <InfoRow
            icon="info"
            label="Holati"
            t={t}
            right={
              <View style={[styles.smallPill, { backgroundColor: cfg.bg }]}>
                <Text style={[styles.smallPillText, { color: cfg.color }]}>{cfg.label}</Text>
              </View>
            }
          />
          <View style={[styles.infoDivider, { backgroundColor: t.border }]} />
          <InfoRow icon="credit-card" label="To'lov usuli" value={order.paymentMethod} t={t} />
          <View style={[styles.infoDivider, { backgroundColor: t.border }]} />
          <InfoRow
            icon="pocket"
            label="To'lov holati"
            t={t}
            right={
              <View style={[styles.smallPill, { backgroundColor: payCfg.color + '22' }]}>
                <Text style={[styles.smallPillText, { color: payCfg.color }]}>{payCfg.label}</Text>
              </View>
            }
          />
        </View>

        {/* Cancellation */}
        {isCancelled && order.cancelReason && (
          <>
            <Text style={[styles.sectionLabel, { color: t.text }]}>Bekor qilinish sababi</Text>
            <View style={[styles.cancelCard, { backgroundColor: cfg.bg, borderColor: cfg.color + '33' }]}>
              <View style={styles.cancelHeader}>
                <MaterialCommunityIcons name="alert-circle-outline" size={17} color={cfg.color} />
                <Text style={[styles.cancelBy, { color: cfg.color }]}>
                  {CANCEL_BY_LABEL[order.cancelBy] || "Sabab noma'lum"}
                </Text>
              </View>
              <Text style={[styles.cancelText, { color: t.text }]}>{order.cancelReason}</Text>
            </View>
          </>
        )}

        {/* Price */}
        {!isCancelled && (
          <>
            <Text style={[styles.sectionLabel, { color: t.text }]}>Ish narxi</Text>
            <View style={[styles.priceCard, { backgroundColor: t.card, borderColor: t.border }]}>
              <View style={styles.priceHeaderRow}>
                <Text style={[styles.priceTotalLabel, { color: t.muted }]}>Umumiy narx</Text>
                <Text style={[styles.priceTotalValue, { color: t.text }]}>{fmt(order.price)} so'm</Text>
              </View>
              <View style={[styles.priceDivider, { backgroundColor: t.border }]} />
              <InfoRow icon="package" label="Materiallar" value={`${fmt(material)} so'm`} t={t} />
              <InfoRow icon="tool" label="Ish haqi" value={`${fmt(labor)} so'm`} t={t} />
            </View>
          </>
        )}

        {/* Before photos */}
        {beforePhotos.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { color: t.text }]}>
              Ish boshlanishidan oldin ({beforePhotos.length} ta)
            </Text>
            <PhotoGallery
              photos={beforePhotos}
              index={beforeIndex}
              onIndexChange={setBeforeIndex}
              t={t}
              height={200}
            />
          </>
        )}

        {/* After photos — faqat bajarilgan buyurtmalarda mavjud */}
        {afterPhotos.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { color: t.text }]}>
              Yakunlangandan keyin ({afterPhotos.length} ta)
            </Text>
            <PhotoGallery
              photos={afterPhotos}
              index={afterIndex}
              onIndexChange={setAfterIndex}
              t={t}
              height={200}
            />
          </>
        )}

        {/* Master note */}
        {order.masterNote && (
          <>
            <Text style={[styles.sectionLabel, { color: t.text }]}>Usta izohi</Text>
            <View style={[styles.noteCard, { backgroundColor: t.card, borderColor: t.border }]}>
              <TouchableOpacity style={styles.noteHeader} onPress={openUstaProfile} activeOpacity={0.7}>
                <View style={[styles.noteAvatar, { backgroundColor: order.color }]}>
                  <Text style={styles.noteAvatarText}>{order.letter}</Text>
                </View>
                <Text style={[styles.noteName, { color: t.text, flex: 1 }]} numberOfLines={1}>
                  {order.master}
                </Text>
                <Feather name="chevron-right" size={15} color={t.muted} />
              </TouchableOpacity>
              <Text style={[styles.noteText, { color: t.muted }]}>{order.masterNote}</Text>
            </View>
          </>
        )}

        {/* Customer review */}
        {order.customerNote && order.rating > 0 && (
          <>
            <Text style={[styles.sectionLabel, { color: t.text }]}>Sizning sharhingiz</Text>
            <View style={[styles.noteCard, { backgroundColor: t.card, borderColor: t.border }]}>
              <View style={styles.noteHeader}>
                <View style={[styles.noteAvatar, { backgroundColor: t.orange }]}>
                  <MaterialCommunityIcons name="account" size={16} color="#fff" />
                </View>
                <Text style={[styles.noteName, { color: t.text, flex: 1 }]}>Siz</Text>
                <Stars rating={order.rating} t={t} />
              </View>
              <Text style={[styles.noteText, { color: t.muted }]}>{order.customerNote}</Text>
            </View>
          </>
        )}

        {/* Actions */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.reorderBtn, { backgroundColor: t.orange }]} activeOpacity={0.8}>
            <Feather name="repeat" size={14} color="#fff" />
            <Text style={styles.reorderText}>Qayta buyurtma berish</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.flagBtn, { backgroundColor: 'rgba(224,71,58,0.13)' }]}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="flag-outline" size={16} color={t.red} />
          </TouchableOpacity>
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

  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  statusBannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBannerLabel: { fontSize: 14.5, fontWeight: '800' },
  statusBannerSub: { fontSize: 12, fontWeight: '600', marginTop: 2 },

  title: { fontSize: 20, fontWeight: '800', lineHeight: 27, marginTop: 20 },
  orderNumber: { fontSize: 12.5, fontWeight: '600', marginTop: 3 },

  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  metaChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  metaChipText: { fontSize: 11.5, fontWeight: '700' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 1 },
  metaItemText: { fontSize: 12, fontWeight: '600' },

  sectionLabel: { fontSize: 14.5, fontWeight: '800', marginTop: 22, marginBottom: 12 },

  masterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 13,
  },
  masterAvatar: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  masterAvatarText: { color: '#fff', fontWeight: '800', fontSize: 17 },
  masterName: { fontSize: 15, fontWeight: '700' },
  masterTrade: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(245,196,81,0.14)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },
  ratingBadgeText: { fontSize: 12, fontWeight: '700' },

  infoCard: { borderWidth: 1, borderRadius: 16, padding: 14 },
  infoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
  infoRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoLabel: { fontSize: 12.5, fontWeight: '600' },
  infoValue: { fontSize: 12.5, fontWeight: '700' },
  infoDivider: { height: 1, marginVertical: 4 },
  smallPill: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8 },
  smallPillText: { fontSize: 11, fontWeight: '700' },

  cancelCard: { borderWidth: 1, borderRadius: 16, padding: 14 },
  cancelHeader: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 8 },
  cancelBy: { fontSize: 13, fontWeight: '800' },
  cancelText: { fontSize: 13, lineHeight: 19, fontWeight: '500' },

  priceCard: { borderWidth: 1, borderRadius: 16, padding: 14 },
  priceHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  priceTotalLabel: { fontSize: 12.5, fontWeight: '600' },
  priceTotalValue: { fontSize: 17, fontWeight: '800' },
  priceDivider: { height: 1, marginVertical: 10 },

  galleryImgWrap: { width: '100%', borderRadius: 16, overflow: 'hidden', position: 'relative' },
  galleryImg: { width: '100%', height: '100%' },
  galleryNavBtn: {
    position: 'absolute',
    top: '50%',
    marginTop: -15,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(10,19,34,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryNavLeft: { left: 10 },
  galleryNavRight: { right: 10 },
  galleryCounter: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(10,19,34,0.72)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },
  galleryCounterText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  thumbRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  thumbWrap: { width: 62, height: 62, borderRadius: 11, borderWidth: 2, overflow: 'hidden' },
  thumb: { width: '100%', height: '100%' },

  noteCard: { borderWidth: 1, borderRadius: 16, padding: 14 },
  noteHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  noteAvatar: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  noteAvatarText: { color: '#fff', fontWeight: '800', fontSize: 12.5 },
  noteName: { fontSize: 13.5, fontWeight: '700' },
  noteText: { fontSize: 13, lineHeight: 19 },

  actionRow: { flexDirection: 'row', gap: 8, marginTop: 24 },
  reorderBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
    borderRadius: 14,
  },
  reorderText: { color: '#fff', fontWeight: '700', fontSize: 13.5 },
  flagBtn: {
    width: 46,
    height: 46,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
