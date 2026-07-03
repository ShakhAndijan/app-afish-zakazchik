import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';

const fmt = (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

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
    address: 'Chilonzor, 15-uy',
    price: 180000,
    rating: 5,
    letter: 'D',
    color: '#2fa37a',
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
    address: 'Yunusobod, 12-kvartira',
    price: 250000,
    rating: 4,
    letter: 'A',
    color: '#e87a45',
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
    address: 'Mirzo Ulugbek, 5-dom',
    price: 320000,
    rating: 0,
    letter: 'B',
    color: '#3f7fd4',
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
    address: 'Shayxontohur, 9-kvartira',
    price: 450000,
    rating: 5,
    letter: 'S',
    color: '#9b6cd1',
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
    address: 'Uchtepa, 22-uy',
    price: 200000,
    rating: 4,
    letter: 'J',
    color: '#f5a623',
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
    address: 'Sergeli, 18-dom',
    price: 380000,
    rating: 0,
    letter: 'F',
    color: '#26a69a',
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

const TABS = [
  { key: 'all', label: 'Hammasi' },
  { key: 'done', label: 'Bajarilgan' },
  { key: 'cancelled', label: 'Bekor qilingan' },
];

const COUNTS = {
  all: ORDERS.length,
  done: ORDERS.filter((o) => o.status === 'done').length,
  cancelled: ORDERS.filter((o) => o.status === 'cancelled').length,
};

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

/* ── Detail row ── */
function DetailRow({ label, value, t }) {
  return (
    <View style={s.detailRow}>
      <Text style={[s.detailKey, { color: t.muted }]}>{label}</Text>
      {typeof value === 'string' ? (
        <Text style={[s.detailVal, { color: t.text }]}>{value}</Text>
      ) : (
        value
      )}
    </View>
  );
}

/* ── Stars ── */
function Stars({ rating }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons
          key={i}
          name="star"
          size={13}
          color={i <= rating ? '#e87a45' : '#33425a'}
        />
      ))}
    </View>
  );
}

/* ── Order card ── */
function OrderCard({ order, isOpen, onToggle, t }) {
  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.85}
      style={[
        s.card,
        {
          backgroundColor: t.card,
          borderColor: isOpen ? t.border : 'transparent',
        },
      ]}
    >
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
          <MaterialCommunityIcons
            name="calendar-outline"
            size={13}
            color={t.muted}
          />
          <Text style={[s.metaText, { color: t.muted }]}>
            {order.day}-{order.month}, {order.time}
          </Text>
        </View>
        <View style={[s.metaItem, { flex: 1, minWidth: 0 }]}>
          <MaterialCommunityIcons
            name="map-marker-outline"
            size={13}
            color={t.muted}
            style={{ flexShrink: 0 }}
          />
          <Text style={[s.metaText, { color: t.muted }]} numberOfLines={1}>
            {order.address}
          </Text>
        </View>
      </View>

      {/* Divider */}
      <View style={[s.divider, { backgroundColor: t.border }]} />

      {/* Row 3: price + expand */}
      <View style={s.priceRow}>
        <Text style={[s.price, { color: t.text }]}>
          {fmt(order.price)}{' '}
          <Text style={[s.priceSub, { color: t.muted }]}>so'm</Text>
        </Text>
        <View style={s.ghostBtn}>
          <Text style={[s.ghostBtnText, { color: t.orange }]}>Tafsilotlar</Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={16}
            color={t.orange}
            style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}
          />
        </View>
      </View>

      {/* Expanded detail */}
      {isOpen && (
        <View style={[s.expand, { borderTopColor: t.border }]}>
          <DetailRow label="Buyurtma raqami" value={`#${order.id}`} t={t} />
          <DetailRow label="To'lov" value="Karta · Humo ··42" t={t} />
          {order.status === 'done' && (
            <View style={s.detailRow}>
              <Text style={[s.detailKey, { color: t.muted }]}>Bahoyingiz</Text>
              <Stars rating={order.rating} />
            </View>
          )}
          <View style={s.actionRow}>
            <TouchableOpacity
              style={[s.reorderBtn, { backgroundColor: t.orange }]}
              activeOpacity={0.8}
            >
              <Text style={s.reorderText}>Qayta buyurtma</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.flagBtn, { backgroundColor: 'rgba(224,71,58,0.13)' }]}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="flag-outline"
                size={15}
                color={t.red}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

/* ── Screen ── */
export default function ZakazchiOrdersScreen({ onBack }) {
  const { theme: t } = useTheme();
  const [tab, setTab] = useState('all');
  const [open, setOpen] = useState(null);

  const list = tab === 'all' ? ORDERS : ORDERS.filter((o) => o.status === tab);

  const toggle = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((prev) => (prev === id ? null : id));
  };

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
        <Text style={[s.countLabel, { color: t.muted }]}>{COUNTS.all} ta</Text>
      </View>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.tabsRow}
      >
        {TABS.map((tb) => {
          const active = tb.key === tab;

          return (
            <TouchableOpacity
              key={tb.key}
              onPress={() => {
                setTab(tb.key);
                setOpen(null);
              }}
              activeOpacity={0.8}
              style={[
                s.tabBtn,
                {
                  backgroundColor: active ? t.orange : t.card,
                  borderColor: active ? t.orange : t.border,
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={s.list}
      >
        {list.length === 0 ? (
          <View style={s.empty}>
            <MaterialCommunityIcons
              name="clipboard-text-outline"
              size={48}
              color={t.faint}
            />
            <Text style={[s.emptyText, { color: t.muted }]}>
              Buyurtmalar yo'q
            </Text>
          </View>
        ) : (
          list.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              isOpen={open === order.id}
              onToggle={() => toggle(order.id)}
              t={t}
            />
          ))
        )}
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
  countLabel: { fontSize: 13, fontWeight: '700' },

  tabsRow: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start', // MUHIM
    height: 34, // aniq height
    gap: 7,
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },

  tabLabel: { fontWeight: '700', fontSize: 13 },
  tabBadge: { borderRadius: 10, paddingHorizontal: 7, paddingVertical: 1 },
  tabBadgeText: { fontSize: 11, fontWeight: '700' },

  list: { paddingHorizontal: 16, paddingBottom: 24, gap: 11 },

  card: { borderRadius: 17, padding: 14, borderWidth: 1 },

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

  divider: { height: 1, marginVertical: 12 },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: { fontSize: 16.5, fontWeight: '800' },
  priceSub: { fontSize: 12.5, fontWeight: '700' },
  ghostBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  ghostBtnText: { fontSize: 13, fontWeight: '700' },

  expand: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, gap: 8 },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailKey: { fontSize: 13, fontWeight: '600' },
  detailVal: { fontSize: 13, fontWeight: '700' },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  reorderBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reorderText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  flagBtn: {
    width: 38,
    height: 38,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },

  empty: { alignItems: 'center', paddingTop: 64 },
  emptyText: { fontWeight: '600', marginTop: 12, fontSize: 14 },
});
