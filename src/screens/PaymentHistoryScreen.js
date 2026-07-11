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

const fmt = (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

const TYPE_CFG = {
  master_payment: { label: "Ustaga to'lov", icon: 'account-hard-hat', color: '#e87a45' },
  topup: { label: "Hamyon to'ldirish", icon: 'wallet-plus-outline', color: '#2fa37a' },
  refund: { label: 'Qaytarish', icon: 'cash-refund', color: '#3f7fd4' },
};

const STATUS_CFG = {
  success: { label: 'Muvaffaqiyatli', color: '#2fa37a', bg: 'rgba(47,163,122,0.15)' },
  pending: { label: 'Kutilmoqda', color: '#e87a45', bg: 'rgba(232,122,69,0.15)' },
  failed: { label: 'Amalga oshmadi', color: '#e0473a', bg: 'rgba(224,71,58,0.13)' },
};

const TRANSACTIONS = [
  {
    id: 't1',
    type: 'master_payment',
    title: 'Davron M.',
    subtitle: "Santexnik · Santexnika ta'mirlash",
    amount: 180000,
    direction: 'out',
    day: 5,
    month: 'Iyun',
    time: '10:35',
    method: 'Karta · Humo ··42',
    status: 'success',
    letter: 'D',
    color: '#2fa37a',
  },
  {
    id: 't2',
    type: 'master_payment',
    title: 'Alisher U.',
    subtitle: 'Elektrik · Elektr simlari almashtirish',
    amount: 250000,
    direction: 'out',
    day: 28,
    month: 'May',
    time: '14:05',
    method: 'Naqd pul',
    status: 'success',
    letter: 'A',
    color: '#e87a45',
  },
  {
    id: 't3',
    type: 'refund',
    title: 'Bekor qilingan buyurtma uchun qaytarish',
    subtitle: "Bobur K. · Bo'yoqchi",
    amount: 320000,
    direction: 'in',
    day: 20,
    month: 'May',
    time: '09:20',
    method: 'Karta · Humo ··42',
    status: 'success',
  },
  {
    id: 't4',
    type: 'master_payment',
    title: 'Sardor T.',
    subtitle: 'Plitachi · Parket yotqizish',
    amount: 450000,
    direction: 'out',
    day: 12,
    month: 'May',
    time: '11:10',
    method: 'Karta · Uzcard ··18',
    status: 'success',
    letter: 'S',
    color: '#9b6cd1',
  },
  {
    id: 't5',
    type: 'topup',
    title: "Hamyonni to'ldirish",
    subtitle: 'AFISH.uz hamyon',
    amount: 300000,
    direction: 'in',
    day: 8,
    month: 'May',
    time: '19:40',
    method: 'Karta · Humo ··42',
    status: 'success',
  },
  {
    id: 't6',
    type: 'master_payment',
    title: 'Jahongir R.',
    subtitle: "Konditsioner · Konditsioner o'rnatish",
    amount: 200000,
    direction: 'out',
    day: 3,
    month: 'Aprel',
    time: '15:45',
    method: 'Naqd pul',
    status: 'success',
    letter: 'J',
    color: '#f5a623',
  },
  {
    id: 't7',
    type: 'topup',
    title: "Hamyonni to'ldirish",
    subtitle: 'AFISH.uz hamyon',
    amount: 150000,
    direction: 'in',
    day: 26,
    month: 'Mart',
    time: '09:05',
    method: 'Karta · Uzcard ··18',
    status: 'success',
  },
  {
    id: 't8',
    type: 'master_payment',
    title: 'Farrux N.',
    subtitle: 'Gipschi · Gipsokarton qilish',
    amount: 380000,
    direction: 'out',
    day: 25,
    month: 'Mart',
    time: '13:05',
    method: 'Karta · Humo ··42',
    status: 'failed',
    letter: 'F',
    color: '#26a69a',
  },
];

const TABS = [
  { key: 'all', label: 'Hammasi' },
  { key: 'master', label: 'Ustalarga to\'lov' },
  { key: 'wallet', label: 'Hamyon' },
];

const matchesTab = (tx, tab) => {
  if (tab === 'all') return true;
  if (tab === 'master') return tx.type === 'master_payment';
  return tx.type === 'topup' || tx.type === 'refund';
};

const COUNTS = {
  all: TRANSACTIONS.length,
  master: TRANSACTIONS.filter((tx) => tx.type === 'master_payment').length,
  wallet: TRANSACTIONS.filter((tx) => tx.type !== 'master_payment').length,
};

const TOTAL_TO_MASTERS = TRANSACTIONS.filter(
  (tx) => tx.type === 'master_payment' && tx.status === 'success'
).reduce((sum, tx) => sum + tx.amount, 0);

const TOTAL_INCOMING = TRANSACTIONS.filter(
  (tx) => tx.direction === 'in' && tx.status === 'success'
).reduce((sum, tx) => sum + tx.amount, 0);

/* ── Compact stat cell (shared look with profile screen) ── */
function StatCell({ icon, color, value, label, t, border }) {
  return (
    <View style={[s.statCell, border && { borderRightWidth: 1, borderRightColor: t.border }]}>
      <View style={[s.statIcon, { backgroundColor: color + '1c' }]}>
        <MaterialCommunityIcons name={icon} size={12} color={color} />
      </View>
      <Text style={[s.statVal, { color: t.text }]} numberOfLines={1}>
        {value}
      </Text>
      <Text style={[s.statLbl, { color: t.muted }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

/* ── Transaction card ── */
function TransactionCard({ tx, t }) {
  const typeCfg = TYPE_CFG[tx.type];
  const statusCfg = STATUS_CFG[tx.status];
  const isIn = tx.direction === 'in';

  return (
    <View style={[s.card, { backgroundColor: t.card, borderColor: t.border }]}>
      <View style={[s.accentBar, { backgroundColor: typeCfg.color }]} />

      <View style={s.topRow}>
        {tx.letter ? (
          <View style={[s.avatar, { backgroundColor: tx.color }]}>
            <Text style={s.avatarLetter}>{tx.letter}</Text>
          </View>
        ) : (
          <View style={[s.avatar, { backgroundColor: typeCfg.color + '1c' }]}>
            <MaterialCommunityIcons name={typeCfg.icon} size={19} color={typeCfg.color} />
          </View>
        )}
        <View style={s.nameBox}>
          <Text style={[s.title, { color: t.text }]} numberOfLines={1}>
            {tx.title}
          </Text>
          <Text style={[s.subtitle, { color: t.muted }]} numberOfLines={1}>
            {tx.subtitle}
          </Text>
        </View>
        <View style={[s.pill, { backgroundColor: statusCfg.bg }]}>
          <Text style={[s.pillText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
        </View>
      </View>

      <View style={s.metaRow}>
        <View style={[s.typeChip, { backgroundColor: typeCfg.color + '18' }]}>
          <Text style={[s.typeChipText, { color: typeCfg.color }]}>{typeCfg.label}</Text>
        </View>
        <View style={s.metaItem}>
          <Feather name="calendar" size={12} color={t.muted} />
          <Text style={[s.metaText, { color: t.muted }]}>
            {tx.day}-{tx.month}, {tx.time}
          </Text>
        </View>
        <View style={[s.metaItem, { flex: 1, minWidth: 0 }]}>
          <Feather name="credit-card" size={12} color={t.muted} style={{ flexShrink: 0 }} />
          <Text style={[s.metaText, { color: t.muted }]} numberOfLines={1}>
            {tx.method}
          </Text>
        </View>
      </View>

      <View style={[s.amountRow, { borderTopColor: t.border }]}>
        <Text style={[s.amountLabel, { color: t.muted }]}>Summa</Text>
        <Text style={[s.amount, { color: isIn ? '#2fa37a' : t.text }]}>
          {isIn ? '+' : '-'} {fmt(tx.amount)} <Text style={[s.amountSub, { color: t.muted }]}>so'm</Text>
        </Text>
      </View>
    </View>
  );
}

export default function PaymentHistoryScreen({ onBack }) {
  const { theme: t } = useTheme();
  const [tab, setTab] = useState('all');

  const list = TRANSACTIONS.filter((tx) => matchesTab(tx, tab));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top', 'left', 'right']}>
      <StatusBar style={t.isDark ? 'light' : 'dark'} />

      <View style={[s.header, { backgroundColor: t.bg }]}>
        <TouchableOpacity
          style={[s.backBtn, { backgroundColor: t.card, borderColor: t.border }]}
          onPress={onBack}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="chevron-left" size={24} color={t.text} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: t.text }]}>To'lov tarixi</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Stats */}
        <View style={[s.statsRow, { backgroundColor: t.card, borderColor: t.border }]}>
          <StatCell
            icon="receipt-text-outline"
            color={t.orange}
            value={`${COUNTS.all} ta`}
            label="Jami tranzaksiya"
            t={t}
            border
          />
          <StatCell
            icon="account-hard-hat"
            color="#e87a45"
            value={`${fmt(TOTAL_TO_MASTERS / 1000)}k`}
            label="Ustalarga, so'm"
            t={t}
            border
          />
          <StatCell
            icon="wallet-plus-outline"
            color="#2fa37a"
            value={`${fmt(TOTAL_INCOMING / 1000)}k`}
            label="Hamyonga, so'm"
            t={t}
          />
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
                onPress={() => setTab(tb.key)}
                activeOpacity={0.8}
                style={[
                  s.tabBtn,
                  { backgroundColor: active ? t.orange : t.card, borderColor: active ? t.orange : t.border },
                ]}
              >
                <Text style={[s.tabLabel, { color: active ? '#fff' : t.muted }]}>{tb.label}</Text>
                <View
                  style={[
                    s.tabBadge,
                    { backgroundColor: active ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.06)' },
                  ]}
                >
                  <Text style={[s.tabBadgeText, { color: active ? '#fff' : t.faint }]}>
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
                <MaterialCommunityIcons name="receipt-text-outline" size={40} color={t.faint} />
              </View>
              <Text style={[s.emptyText, { color: t.text }]}>Tranzaksiyalar yo'q</Text>
              <Text style={[s.emptySub, { color: t.muted }]}>
                Bu bo'limda hozircha hech narsa ko'rinmayapti
              </Text>
            </View>
          ) : (
            list.map((tx) => <TransactionCard key={tx.id} tx={tx} t={t} />)
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
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  statCell: { flex: 1, alignItems: 'center', paddingVertical: 12, gap: 3 },
  statIcon: {
    width: 22,
    height: 22,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 1,
  },
  statVal: { fontWeight: '800', fontSize: 14 },
  statLbl: { fontSize: 10 },

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
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarLetter: { color: '#fff', fontSize: 17, fontWeight: '700' },
  nameBox: { flex: 1, minWidth: 0 },
  title: { fontSize: 14.5, fontWeight: '800', letterSpacing: -0.2 },
  subtitle: { fontSize: 12, fontWeight: '600', marginTop: 2 },

  pill: {
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
    flexShrink: 0,
  },
  pillText: { fontSize: 10.5, fontWeight: '700' },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  typeChip: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8 },
  typeChipText: { fontSize: 11, fontWeight: '700' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 12, fontWeight: '600' },

  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 13,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  amountLabel: { fontSize: 12, fontWeight: '600' },
  amount: { fontSize: 16, fontWeight: '800' },
  amountSub: { fontSize: 12, fontWeight: '700' },

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
