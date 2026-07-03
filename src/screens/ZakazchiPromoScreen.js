import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';

const fmt = (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

const PROMO = [
  {
    id: 'p1', code: 'USTA20', type: 'percent', value: 20, cap: 50000,
    title: 'Birinchi buyurtmaga', desc: 'Har qanday xizmatga 20% chegirma',
    status: 'active', expire: '30-iyun', accent: '#E8743B',
  },
  {
    id: 'p2', code: 'SANTEX50', type: 'amount', value: 50000, cap: null,
    title: 'Santexnika xizmati', desc: 'Santexnik chaqirganda chegirma',
    status: 'active', expire: '15-iyul', accent: '#3E8BE8',
  },
  {
    id: 'p3', code: 'YOZ2026', type: 'percent', value: 15, cap: 40000,
    title: 'Yozgi aksiya', desc: 'Tozalash xizmatlariga 15%',
    status: 'active', expire: '1-avgust', accent: '#34B57C',
  },
  {
    id: 'p4', code: 'WELCOME10', type: 'percent', value: 10, cap: 30000,
    title: 'Xush kelibsiz', desc: 'Ilovaga kirganingiz uchun',
    status: 'used', expire: '12-may', accent: '#9B6FE3',
  },
  {
    id: 'p5', code: 'BAHOR25', type: 'percent', value: 25, cap: 60000,
    title: 'Bahorgi chegirma', desc: "Mebel yig'ishga 25%",
    status: 'expired', expire: '1-aprel', accent: '#E85B9A',
  },
];

const PTABS = [
  { key: 'active', label: 'Faol' },
  { key: 'used', label: 'Ishlatilgan' },
  { key: 'expired', label: "Muddati o'tgan" },
];

const PCOUNTS = {
  active: PROMO.filter((p) => p.status === 'active').length,
  used: PROMO.filter((p) => p.status === 'used').length,
  expired: PROMO.filter((p) => p.status === 'expired').length,
};

function PromoCard({ p, t }) {
  const [copied, setCopied] = useState(false);
  const dim = p.status !== 'active';
  const valueLabel = p.type === 'percent' ? `${p.value}%` : fmt(p.value);
  const valueSub = p.type === 'percent' ? 'chegirma' : "so'm";

  const onCopy = () => {
    if (dim) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <View style={[s.ticketCard, { opacity: dim ? 0.55 : 1 }]}>
      {/* Left colored stub */}
      <View style={[s.stub, { backgroundColor: p.accent }]}>
        <Text style={s.stubValue}>{valueLabel}</Text>
        <Text style={s.stubSub}>{valueSub}</Text>
        {p.cap && p.type === 'percent' && (
          <Text style={s.stubCap}>{fmt(p.cap)} so'm{'\n'}gacha</Text>
        )}
      </View>

      {/* Perforation: zero-width view that stretches full card height */}
      <View style={s.perf}>
        {/* Semicircle bites – clipped by card's overflow:hidden */}
        <View style={[s.circle, { top: -9, backgroundColor: t.bg }]} />
        <View style={[s.dashLine, { borderColor: dim ? t.border : 'rgba(255,255,255,0.25)' }]} />
        <View style={[s.circle, { bottom: -9, backgroundColor: t.bg }]} />
      </View>

      {/* Body */}
      <View style={[s.body, { backgroundColor: t.card }]}>
        {/* Title + badge row */}
        <View style={s.titleRow}>
          <Text style={[s.cardTitle, { color: t.text }]} numberOfLines={1}>
            {p.title}
          </Text>
          {p.status === 'used' && (
            <View style={[s.badge, { backgroundColor: t.rowIconBg }]}>
              <Text style={[s.badgeText, { color: t.muted }]}>Ishlatilgan</Text>
            </View>
          )}
          {p.status === 'expired' && (
            <View style={[s.badge, { backgroundColor: 'rgba(224,71,58,0.13)' }]}>
              <Text style={[s.badgeText, { color: t.red }]}>Muddati o'tgan</Text>
            </View>
          )}
        </View>

        <Text style={[s.cardDesc, { color: t.muted }]} numberOfLines={1}>
          {p.desc}
        </Text>

        {/* Expiry */}
        <View style={s.expiryRow}>
          <MaterialCommunityIcons name="clock-outline" size={12} color={t.faint} />
          <Text style={[s.expiryText, { color: t.faint }]}>
            {p.status === 'active' ? `${p.expire}gacha amal qiladi` : p.expire}
          </Text>
        </View>

        {/* Code + copy */}
        <View style={s.codeRow}>
          <View style={[s.codeBox, { borderColor: t.border }]}>
            <Text style={[s.codeText, { color: dim ? t.muted : t.text }]}>
              {p.code}
            </Text>
          </View>
          <TouchableOpacity
            onPress={onCopy}
            disabled={dim}
            activeOpacity={0.8}
            style={[
              s.copyBtn,
              {
                backgroundColor: copied
                  ? 'rgba(47,163,122,0.15)'
                  : dim
                  ? t.rowIconBg
                  : p.accent,
              },
            ]}
          >
            <MaterialCommunityIcons
              name={copied ? 'check' : 'content-copy'}
              size={13}
              color={copied ? t.green : dim ? t.muted : '#fff'}
            />
            <Text style={[s.copyText, { color: copied ? t.green : dim ? t.muted : '#fff' }]}>
              {copied ? 'Nusxalandi' : 'Nusxa'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function ZakazchiPromoScreen({ onBack }) {
  const { theme: t } = useTheme();
  const [tab, setTab] = useState('active');
  const [field, setField] = useState('');

  const list = PROMO.filter((p) => p.status === tab);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: t.bg }}
      edges={['top', 'left', 'right']}
    >
      <StatusBar style={t.isDark ? 'light' : 'dark'} />

      {/* Header */}
      <View style={[s.header, { backgroundColor: t.bg }]}>
        <TouchableOpacity
          style={[s.backBtn, { backgroundColor: t.card, borderColor: t.border }]}
          onPress={onBack}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="chevron-left" size={24} color={t.text} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: t.text }]}>Promokodlarim</Text>
        <View style={{ flex: 1 }} />
        <View style={s.headerBadge}>
          <MaterialCommunityIcons name="gift-outline" size={17} color={t.orange} />
          <Text style={[s.headerBadgeText, { color: t.orange }]}>{PCOUNTS.active}</Text>
        </View>
      </View>

      {/* Add code field */}
      <View style={s.addRow}>
        <View style={[s.inputWrap, { backgroundColor: t.card, borderColor: t.border }]}>
          <MaterialCommunityIcons name="gift-outline" size={17} color={t.muted} />
          <TextInput
            value={field}
            onChangeText={(v) => setField(v.toUpperCase())}
            placeholder="Promokodni kiriting"
            placeholderTextColor={t.faint}
            autoCapitalize="characters"
            style={[s.textInput, { color: t.text }]}
          />
        </View>
        <TouchableOpacity
          style={[s.addBtn, { backgroundColor: field ? t.orange : t.rowIconBg }]}
          activeOpacity={0.8}
          disabled={!field}
        >
          <MaterialCommunityIcons name="plus" size={18} color={field ? '#fff' : t.muted} />
          <Text style={[s.addBtnText, { color: field ? '#fff' : t.muted }]}>Qo'shish</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={s.tabsRow}>
        {PTABS.map((tb) => {
          const on = tb.key === tab;
          return (
            <TouchableOpacity
              key={tb.key}
              onPress={() => setTab(tb.key)}
              activeOpacity={0.8}
              style={[
                s.tabBtn,
                { backgroundColor: on ? t.orange : t.card, borderColor: on ? t.orange : t.border },
              ]}
            >
              <Text style={[s.tabLabel, { color: on ? '#fff' : t.muted }]}>{tb.label}</Text>
              <View style={[s.tabBadge, { backgroundColor: on ? 'rgba(255,255,255,0.25)' : t.rowIconBg }]}>
                <Text style={[s.tabBadgeText, { color: on ? '#fff' : t.faint }]}>
                  {PCOUNTS[tb.key]}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Promo list */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
      >
        {list.length ? (
          list.map((p) => <PromoCard key={p.id} p={p} t={t} />)
        ) : (
          <View style={s.empty}>
            <View style={[s.emptyIcon, { backgroundColor: t.card }]}>
              <MaterialCommunityIcons name="gift-outline" size={30} color={t.muted} />
            </View>
            <Text style={[s.emptyText, { color: t.muted }]}>Bu yerda promokod yo'q</Text>
          </View>
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
    paddingBottom: 16,
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
  headerBadge: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  headerBadgeText: { fontSize: 14, fontWeight: '700' },

  addRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 13,
    borderWidth: 1,
    paddingHorizontal: 13,
  },
  textInput: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '700',
    letterSpacing: 1,
    paddingVertical: 12,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    borderRadius: 13,
    justifyContent: 'center',
  },
  addBtnText: { fontSize: 13.5, fontWeight: '700' },

  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
    borderRadius: 11,
    borderWidth: 1,
  },
  tabLabel: { fontSize: 12.5, fontWeight: '700' },
  tabBadge: { borderRadius: 8, paddingHorizontal: 6, paddingVertical: 1 },
  tabBadgeText: { fontSize: 11, fontWeight: '800' },

  list: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },

  // ─── Ticket card ────────────────────────────────
  ticketCard: {
    flexDirection: 'row',
    borderRadius: 18,
    overflow: 'hidden',
    minHeight: 120,
  },
  stub: {
    width: 92,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 8,
  },
  stubValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -1,
    lineHeight: 32,
  },
  stubSub: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
    marginTop: 3,
  },
  stubCap: {
    fontSize: 9.5,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 14,
  },

  // zero-width perforation divider; stretches to full card height via alignItems:stretch
  perf: { width: 0 },
  circle: {
    position: 'absolute',
    left: -9,
    width: 18,
    height: 18,
    borderRadius: 9,
    zIndex: 2,
  },
  dashLine: {
    position: 'absolute',
    top: 9,
    bottom: 9,
    left: -1,
    borderLeftWidth: 1.5,
    borderStyle: 'dashed',
  },

  body: {
    flex: 1,
    padding: 13,
    gap: 3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardTitle: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    flexShrink: 0,
  },
  badgeText: { fontSize: 10.5, fontWeight: '700' },
  cardDesc: { fontSize: 12, fontWeight: '600' },
  expiryRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  expiryText: { fontSize: 11.5, fontWeight: '600' },

  codeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 9 },
  codeBox: {
    flex: 1,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 9,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  codeText: { fontSize: 13.5, fontWeight: '700', letterSpacing: 1.5 },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 9,
    flexShrink: 0,
  },
  copyText: { fontSize: 12.5, fontWeight: '700' },

  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: { fontSize: 14, fontWeight: '700' },
});
