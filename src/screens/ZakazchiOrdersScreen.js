import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Feather from '@expo/vector-icons/Feather';
import { useTheme } from '../context/ThemeContext';
import OrderDetailScreen from './OrderDetailScreen';

const fmt = (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

// Namunaviy ish rasmlari — lokal assetlar, tarmoqqa bog'liq bo'lmasligi uchun.
const PHOTOS = [
  require('../../assets/mock/photo-01.png'),
  require('../../assets/mock/photo-02.png'),
  require('../../assets/mock/photo-03.png'),
  require('../../assets/mock/photo-04.png'),
  require('../../assets/mock/photo-05.png'),
  require('../../assets/mock/photo-06.png'),
  require('../../assets/mock/photo-07.png'),
  require('../../assets/mock/photo-08.png'),
  require('../../assets/mock/photo-09.png'),
  require('../../assets/mock/photo-10.png'),
];

const ORDERS = [
  {
    id: '1041',
    task: "Santexnika ta'mirlash",
    master: 'Davron M.',
    service: 'Santexnik',
    status: 'done',
    day: 5,
    month: 'Jun',
    time: '10:30',
    duration: '2 soat',
    address: 'Chilonzor tumani, Bunyodkor ko\'chasi, 15-uy',
    price: 180000,
    rating: 5,
    letter: 'D',
    color: '#2fa37a',
    paymentMethod: 'Karta · Humo ··42',
    paymentStatus: 'paid',
    beforePhotos: [PHOTOS[0], PHOTOS[1], PHOTOS[2]],
    afterPhotos: [PHOTOS[3], PHOTOS[4], PHOTOS[5], PHOTOS[6]],
    masterNote:
      "Trubalar almashtirildi, oqish bartaraf etildi. Kafolat — 6 oy.",
    customerNote: "Juda tez va sifatli ishladi, albatta yana murojaat qilamiz!",
  },
  {
    id: '1040',
    task: 'Elektr simlari almashtirish',
    master: 'Alisher U.',
    service: 'Elektrik',
    status: 'done',
    day: 28,
    month: 'May',
    time: '14:00',
    duration: '3 soat',
    address: "Yunusobod tumani, Amir Temur ko'chasi, 12-kvartira",
    price: 250000,
    rating: 4,
    letter: 'A',
    color: '#e87a45',
    paymentMethod: 'Naqd pul',
    paymentStatus: 'paid',
    beforePhotos: [PHOTOS[1]],
    afterPhotos: [PHOTOS[5]],
    masterNote: "Eski simlar almashtirildi, yangi rozetkalar o'rnatildi.",
    customerNote: "Belgilangan vaqtda keldi, ishni toza va puxta bajardi. Rahmat!",
  },
  {
    id: '1039',
    task: "Devor bo'yash",
    master: 'Bobur K.',
    service: "Bo'yoqchi",
    status: 'cancelled',
    day: 20,
    month: 'May',
    time: '09:00',
    duration: '4 soat',
    address: "Mirzo Ulug'bek tumani, Sayram ko'chasi, 5-dom",
    price: 320000,
    rating: 0,
    letter: 'B',
    color: '#3f7fd4',
    paymentMethod: 'Karta · Humo ··42',
    paymentStatus: 'refunded',
    cancelBy: 'usta',
    cancelReason: "Usta belgilangan vaqtda kela olmadi, boshqa buyurtma bilan band bo'lib qoldi.",
    beforePhotos: [PHOTOS[2]],
    afterPhotos: [],
  },
  {
    id: '1038',
    task: 'Parket yotqizish',
    master: 'Sardor T.',
    service: 'Plitachi',
    status: 'done',
    day: 12,
    month: 'May',
    time: '11:00',
    duration: '1 kun',
    address: 'Shayxontohur tumani, Navoiy ko\'chasi, 9-kvartira',
    price: 450000,
    rating: 5,
    letter: 'S',
    color: '#9b6cd1',
    paymentMethod: 'Karta · Uzcard ··18',
    paymentStatus: 'paid',
    beforePhotos: [PHOTOS[0], PHOTOS[3]],
    afterPhotos: [PHOTOS[4], PHOTOS[6], PHOTOS[7], PHOTOS[8], PHOTOS[9]],
    masterNote: "Parket sifatli materiallardan yotqizildi, choki ko'rinmaydi.",
    customerNote: "Narxi mos, sifati a'lo darajada. Tavsiya qilaman.",
  },
  {
    id: '1037',
    task: "Konditsioner o'rnatish",
    master: 'Jahongir R.',
    service: 'Konditsioner',
    status: 'done',
    day: 3,
    month: 'Apr',
    time: '15:30',
    duration: '2 soat',
    address: "Uchtepa tumani, Qo'yliq ko'chasi, 22-uy",
    price: 200000,
    rating: 4,
    letter: 'J',
    color: '#f5a623',
    paymentMethod: 'Naqd pul',
    paymentStatus: 'paid',
    beforePhotos: [PHOTOS[6]],
    afterPhotos: [PHOTOS[9]],
    masterNote: "Konditsioner o'rnatildi va sozlandi, ishlashi tekshirildi.",
    customerNote: "Muloqoti yoqimli, ishiga mas'uliyat bilan yondashadi.",
  },
  {
    id: '1036',
    task: 'Gipsokarton qilish',
    master: 'Farrux N.',
    service: 'Gipschi',
    status: 'cancelled',
    day: 25,
    month: 'Mar',
    time: '13:00',
    duration: '2 kun',
    address: 'Sergeli tumani, Qatortol ko\'chasi, 18-dom',
    price: 380000,
    rating: 0,
    letter: 'F',
    color: '#26a69a',
    paymentMethod: 'Karta · Humo ··42',
    paymentStatus: 'not_charged',
    cancelBy: 'mijoz',
    cancelReason: 'Buyurtma boshlanishidan oldin siz tomoningizdan bekor qilindi.',
    beforePhotos: [],
    afterPhotos: [],
  },
];

const STATUS_CFG = {
  done: {
    label: 'Bajarildi',
    color: '#2fa37a',
    bg: 'rgba(47,163,122,0.15)',
    icon: 'check-circle-outline',
  },
  cancelled: {
    label: 'Bekor qilindi',
    color: '#e0473a',
    bg: 'rgba(224,71,58,0.13)',
    icon: 'close-circle-outline',
  },
  active: {
    label: 'Jarayonda',
    color: '#e87a45',
    bg: 'rgba(232,122,69,0.15)',
    icon: 'clock-outline',
  },
};

const COUNTS = {
  all: ORDERS.length,
  done: ORDERS.filter((o) => o.status === 'done').length,
  cancelled: ORDERS.filter((o) => o.status === 'cancelled').length,
};

const TOTAL_SPENT = ORDERS.filter((o) => o.status === 'done').reduce(
  (sum, o) => sum + o.price,
  0
);

const TABS = (t) => [
  { key: 'all', label: 'Hammasi', color: t.orange },
  { key: 'done', label: 'Bajarilgan', color: STATUS_CFG.done.color },
  { key: 'cancelled', label: 'Bekor qilingan', color: STATUS_CFG.cancelled.color },
];

/* ── Stat tile ── */
function StatTile({ icon, iconColor, iconBg, value, label, t }) {
  return (
    <View style={[s.statTile, { backgroundColor: t.card, borderColor: t.border }]}>
      <View style={[s.statIcon, { backgroundColor: iconBg }]}>
        <Feather name={icon} size={15} color={iconColor} />
      </View>
      <Text style={[s.statValue, { color: t.text }]} numberOfLines={1}>
        {value}
      </Text>
      <Text style={[s.statLabel, { color: t.muted }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

/* ── Avatar ── */
function OrderAvatar({ letter, color }) {
  return (
    <View style={[s.avatar, { backgroundColor: color }]}>
      <Text style={s.avatarLetter}>{letter}</Text>
    </View>
  );
}

/* ── Status pill ── */
function StatusPill({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.active;
  return (
    <View style={[s.pill, { backgroundColor: cfg.bg }]}>
      <MaterialCommunityIcons name={cfg.icon} size={11} color={cfg.color} />
      <Text style={[s.pillText, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

/* ── Order card ── */
function OrderCard({ order, onPress, t }) {
  const cfg = STATUS_CFG[order.status] || STATUS_CFG.active;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[s.card, { backgroundColor: t.card, borderColor: t.border }]}
    >
      <View style={[s.accentBar, { backgroundColor: cfg.color }]} />

      {/* Row 1 */}
      <View style={s.topRow}>
        <OrderAvatar letter={order.letter} color={order.color} />
        <View style={s.nameBox}>
          <Text style={[s.taskName, { color: t.text }]} numberOfLines={1}>
            {order.task}
          </Text>
          <Text style={[s.masterSub, { color: t.muted }]} numberOfLines={1}>
            {order.master} · {order.service}
          </Text>
        </View>
        <StatusPill status={order.status} />
      </View>

      {/* Row 2: date + address */}
      <View style={s.metaRow}>
        <View style={s.metaItem}>
          <Feather name="calendar" size={12.5} color={t.muted} />
          <Text style={[s.metaText, { color: t.muted }]}>
            {order.day}-{order.month}, {order.time}
          </Text>
        </View>
        <View style={[s.metaItem, { flex: 1, minWidth: 0 }]}>
          <Feather
            name="map-pin"
            size={12.5}
            color={t.muted}
            style={{ flexShrink: 0 }}
          />
          <Text style={[s.metaText, { color: t.muted }]} numberOfLines={1}>
            {order.address}
          </Text>
        </View>
      </View>

      {/* Row 3: price + open detail */}
      <View style={[s.priceRow, { borderTopColor: t.border }]}>
        <View>
          <Text style={[s.price, { color: t.text }]}>
            {fmt(order.price)}{' '}
            <Text style={[s.priceSub, { color: t.muted }]}>so'm</Text>
          </Text>
        </View>
        <View style={[s.ghostBtn, { backgroundColor: t.orange + '18' }]}>
          <Text style={[s.ghostBtnText, { color: t.orange }]}>Batafsil</Text>
          <MaterialCommunityIcons name="chevron-right" size={15} color={t.orange} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

/* ── Screen ── */
export default function ZakazchiOrdersScreen({ onBack }) {
  const { theme: t } = useTheme();
  const [tab, setTab] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const tabs = TABS(t);

  const list = tab === 'all' ? ORDERS : ORDERS.filter((o) => o.status === tab);

  if (selectedOrder) {
    return (
      <OrderDetailScreen
        order={selectedOrder}
        onBack={() => setSelectedOrder(null)}
      />
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: t.bg }}
      edges={['top', 'left', 'right']}
    >
      <StatusBar style={t.isDark ? 'light' : 'dark'} />

      {/* Header */}
      <View style={[s.header, { backgroundColor: t.bg }]}>
        <TouchableOpacity
          style={[
            s.backBtn,
            { backgroundColor: t.card, borderColor: t.border },
          ]}
          onPress={onBack}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={24}
            color={t.text}
          />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: t.text }]}>
          Buyurtmalar tarixi
        </Text>
        <View style={{ flex: 1 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Stats */}
        <View style={s.statsRow}>
          <StatTile
            icon="archive"
            iconColor={t.orange}
            iconBg={t.orange + '18'}
            value={`${COUNTS.all} ta`}
            label="Jami buyurtma"
            t={t}
          />
          <StatTile
            icon="check-circle"
            iconColor={STATUS_CFG.done.color}
            iconBg={STATUS_CFG.done.bg}
            value={`${COUNTS.done} ta`}
            label="Bajarilgan"
            t={t}
          />
          <StatTile
            icon="credit-card"
            iconColor={t.gold}
            iconBg="rgba(245,196,81,0.14)"
            value={`${fmt(TOTAL_SPENT / 1000)}k`}
            label="Sarflandi, so'm"
            t={t}
          />
        </View>

        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.tabsRow}
        >
          {tabs.map((tb) => {
            const active = tb.key === tab;

            return (
              <TouchableOpacity
                key={tb.key}
                onPress={() => setTab(tb.key)}
                activeOpacity={0.8}
                style={[
                  s.tabBtn,
                  {
                    backgroundColor: active ? tb.color : t.card,
                    borderColor: active ? tb.color : t.border,
                  },
                ]}
              >
                <Text style={[s.tabLabel, { color: active ? '#fff' : t.muted }]}>
                  {tb.label}
                </Text>

                <View
                  style={[
                    s.tabBadge,
                    {
                      backgroundColor: active
                        ? 'rgba(255,255,255,0.25)'
                        : 'rgba(255,255,255,0.06)',
                    },
                  ]}
                >
                  <Text
                    style={[s.tabBadgeText, { color: active ? '#fff' : t.faint }]}
                  >
                    {COUNTS[tb.key]}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* List */}
        <View style={s.list}>
          {list.length === 0 ? (
            <View style={s.empty}>
              <View style={[s.emptyIcon, { backgroundColor: t.card, borderColor: t.border }]}>
                <MaterialCommunityIcons
                  name="clipboard-text-outline"
                  size={40}
                  color={t.faint}
                />
              </View>
              <Text style={[s.emptyText, { color: t.text }]}>
                Buyurtmalar yo'q
              </Text>
              <Text style={[s.emptySub, { color: t.muted }]}>
                Bu bo'limda hozircha hech narsa ko'rinmayapti
              </Text>
            </View>
          ) : (
            list.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onPress={() => setSelectedOrder(order)}
                t={t}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
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
  headerTitle: { fontWeight: '700', fontSize: 20 },

  statsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  statTile: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 6,
  },
  statIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: { fontSize: 14.5, fontWeight: '800' },
  statLabel: { fontSize: 10.5, fontWeight: '600' },

  tabsRow: { paddingHorizontal: 16, paddingVertical: 14, gap: 8 },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    height: 34,
    gap: 7,
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },

  tabLabel: { fontWeight: '700', fontSize: 13 },
  tabBadge: { borderRadius: 10, paddingHorizontal: 7, paddingVertical: 1 },
  tabBadgeText: { fontSize: 11, fontWeight: '700' },

  list: { paddingHorizontal: 16, gap: 11 },

  card: { position: 'relative', borderRadius: 18, padding: 14, paddingLeft: 18, borderWidth: 1, overflow: 'hidden' },
  accentBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },

  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarLetter: { color: '#fff', fontSize: 18, fontWeight: '700' },
  nameBox: { flex: 1, minWidth: 0 },
  taskName: { fontSize: 14.5, fontWeight: '800', letterSpacing: -0.2 },
  masterSub: { fontSize: 12.5, fontWeight: '600', marginTop: 2 },

  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
    flexShrink: 0,
  },
  pillText: { fontSize: 11, fontWeight: '700' },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 12,
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 12.5, fontWeight: '600' },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  price: { fontSize: 16.5, fontWeight: '800' },
  priceSub: { fontSize: 12.5, fontWeight: '700' },
  ghostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  ghostBtnText: { fontSize: 12.5, fontWeight: '700' },

  empty: { alignItems: 'center', paddingTop: 56, paddingHorizontal: 40 },
  emptyIcon: {
    width: 84,
    height: 84,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyText: { fontWeight: '800', fontSize: 15.5 },
  emptySub: { fontWeight: '600', fontSize: 12.5, marginTop: 6, textAlign: 'center' },
});
