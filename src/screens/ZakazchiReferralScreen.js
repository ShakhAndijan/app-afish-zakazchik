import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import QRCode from 'react-native-qrcode-svg';
import { useTheme } from '../context/ThemeContext';

const fmt = (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

const INITIAL_CODE = 'DAVRON500';
const YOU_GET = 50000;
const FRIEND_GETS = 30000;

const INVITED = [
  {
    name: 'Sherzod A.',
    initial: 'S',
    color: '#3E8BE8',
    status: 'earned',
    note: "+50 000 so'm",
  },
  {
    name: 'Madina R.',
    initial: 'M',
    color: '#E85B9A',
    status: 'pending',
    note: 'Buyurtma kutilmoqda',
  },
  {
    name: 'Otabek K.',
    initial: 'O',
    color: '#34B57C',
    status: 'earned',
    note: "+50 000 so'm",
  },
  {
    name: 'Lola T.',
    initial: 'L',
    color: '#9B6FE3',
    status: 'joined',
    note: "Ro'yxatdan o'tdi",
  },
];

const STEPS = [
  { title: 'Kodni ulashing', desc: "Do'stingizga havola yoki kodni yuboring" },
  {
    title: "Do'st ro'yxatdan o'tadi",
    desc: 'Sizning kodingiz bilan ilovaga kiradi',
  },
  {
    title: 'Ikkalangiz bonus olasiz',
    desc: 'U birinchi buyurtma bergach pul keladi',
  },
];

const SHARE_APPS = [
  { icon: 'send', label: 'Telegram', bg: '#2AABEE', fg: '#fff' },
  { icon: 'whatsapp', label: 'WhatsApp', bg: '#25D366', fg: '#fff' },
  { icon: 'message-text-outline', label: 'SMS', bg: null, fg: null },
  { icon: 'link-variant', label: 'Havola', bg: null, fg: null },
];

function genCode() {
  const a = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const d = '0123456789';
  let s = '';
  for (let i = 0; i < 3; i++) s += a[Math.floor(Math.random() * a.length)];
  for (let i = 0; i < 3; i++) s += d[Math.floor(Math.random() * d.length)];
  return 'USTA' + s;
}

function CodeBox({ t }) {
  const [code, setCode] = useState(INITIAL_CODE);
  const [copied, setCopied] = useState(false);
  const spinAnim = useRef(new Animated.Value(0)).current;

  const onCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const onRefresh = () => {
    setCode(genCode());
    setCopied(false);
    Animated.sequence([
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 480,
        useNativeDriver: true,
      }),
      Animated.timing(spinAnim, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View
      style={[s.codeWrap, { backgroundColor: t.card, borderColor: t.border }]}
    >
      {/* QR code */}
      <View style={s.qrSection}>
        <View style={s.qrBox}>
          <QRCode
            value={`https://app-usta.uz/ref/${code}`}
            size={148}
            color="#000"
            backgroundColor="#fff"
          />
        </View>
        <Text style={[s.qrHint, { color: t.muted }]}>
          Do'stingiz skanerlasin yoki kodni yuboring
        </Text>
      </View>

      {/* Code display */}
      <View style={[s.codeDisplay, { borderColor: t.border }]}>
        <Text style={[s.codeMono, { color: t.text }]}>{code}</Text>
        <Text style={[s.codeHint, { color: t.muted }]}>SIZNING KODINGIZ</Text>
      </View>
      {/* Buttons */}
      <View style={s.codeBtns}>
        <TouchableOpacity
          onPress={onCopy}
          activeOpacity={0.8}
          style={[
            s.codeBtn,
            { backgroundColor: copied ? 'rgba(47,163,122,0.15)' : t.orange },
          ]}
        >
          <MaterialCommunityIcons
            name={copied ? 'check' : 'content-copy'}
            size={16}
            color={copied ? t.green : '#fff'}
          />
          <Text style={[s.codeBtnText, { color: copied ? t.green : '#fff' }]}>
            {copied ? 'Nusxalandi' : 'Nusxa olish'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onRefresh}
          activeOpacity={0.8}
          style={[
            s.codeBtn,
            {
              backgroundColor: t.rowIconBg,
              borderWidth: 1.5,
              borderColor: t.border,
            },
          ]}
        >
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <MaterialCommunityIcons name="refresh" size={16} color={t.text} />
          </Animated.View>
          <Text style={[s.codeBtnText, { color: t.text }]}>Kod olish</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ShareRow({ t }) {
  return (
    <View style={s.shareRow}>
      {SHARE_APPS.map((app) => (
        <TouchableOpacity
          key={app.label}
          style={s.shareItem}
          activeOpacity={0.8}
        >
          <View
            style={[
              s.shareIcon,
              {
                backgroundColor: app.bg || t.card,
                borderColor: app.bg ? 'transparent' : t.border,
              },
            ]}
          >
            <MaterialCommunityIcons
              name={app.icon}
              size={22}
              color={app.fg || t.text}
            />
          </View>
          <Text style={[s.shareLabel, { color: t.muted }]}>{app.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function InvitedRow({ item, border, t }) {
  const statusColors = {
    earned: { color: t.green, bg: 'rgba(47,163,122,0.15)' },
    pending: { color: t.orange, bg: 'rgba(232,122,69,0.15)' },
    joined: { color: t.muted, bg: t.rowIconBg },
  };
  const m = statusColors[item.status] || statusColors.joined;

  return (
    <View
      style={[
        s.invRow,
        border && { borderTopWidth: 1, borderTopColor: t.border },
      ]}
    >
      <View style={[s.invAvatar, { backgroundColor: item.color }]}>
        <Text style={s.invInitial}>{item.initial}</Text>
      </View>
      <Text style={[s.invName, { color: t.text }]}>{item.name}</Text>
      <View style={[s.invBadge, { backgroundColor: m.bg }]}>
        <Text style={[s.invBadgeText, { color: m.color }]}>{item.note}</Text>
      </View>
    </View>
  );
}

export default function ZakazchiReferralScreen({ onBack }) {
  const { theme: t } = useTheme();

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
          Do'stni taklif et
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        {/* ── Hero card ── */}
        <View style={[s.hero, { backgroundColor: t.orange }]}>
          <View style={s.heroCircle} />
          <View style={s.heroGiftBox}>
            <MaterialCommunityIcons
              name="gift-outline"
              size={26}
              color="#fff"
            />
          </View>
          <Text style={s.heroTitle}>
            Do'st chaqiring,{'\n'}
            {fmt(YOU_GET)} so'm oling
          </Text>
          <Text style={s.heroSub}>
            Do'stingiz ham {fmt(FRIEND_GETS)} so'mlik chegirma oladi
          </Text>
        </View>

        {/* ── You / Friend split ── */}
        <View style={s.splitRow}>
          {[
            ['Siz olasiz', YOU_GET, t.green],
            ["Do'stingiz oladi", FRIEND_GETS, t.orange],
          ].map(([label, val, col]) => (
            <View
              key={label}
              style={[
                s.splitCard,
                { backgroundColor: t.card, borderColor: t.border },
              ]}
            >
              <Text style={[s.splitLabel, { color: t.muted }]}>{label}</Text>
              <Text style={[s.splitValue, { color: col }]}>{fmt(val)}</Text>
              <Text style={[s.splitSub, { color: t.faint }]}>so'm</Text>
            </View>
          ))}
        </View>

        {/* ── Code box ── */}
        <CodeBox t={t} />

        {/* ── Share row ── */}
        <ShareRow t={t} />

        {/* ── How it works ── */}
        <View>
          <Text style={[s.secTitle, { color: t.text }]}>Qanday ishlaydi</Text>
          <View style={s.stepsCol}>
            {STEPS.map((st, i) => (
              <View key={i} style={s.stepRow}>
                <View style={s.stepNum}>
                  <Text style={[s.stepNumText, { color: t.orange }]}>
                    {i + 1}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.stepTitle, { color: t.text }]}>
                    {st.title}
                  </Text>
                  <Text style={[s.stepDesc, { color: t.muted }]}>
                    {st.desc}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ── Invited list ── */}
        <View
          style={[
            s.invCard,
            { backgroundColor: t.card, borderColor: t.border },
          ]}
        >
          <View style={[s.invHeader, { borderBottomColor: t.border }]}>
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}
            >
              <MaterialCommunityIcons
                name="account-group-outline"
                size={18}
                color={t.orange}
              />
              <Text style={[s.invTitle, { color: t.text }]}>
                Taklif qilinganlar
              </Text>
            </View>
            <Text style={[s.invCount, { color: t.muted }]}>
              {INVITED.length} ta
            </Text>
          </View>
          {INVITED.map((item, i) => (
            <InvitedRow key={item.name} item={item} border={i > 0} t={t} />
          ))}
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

  scroll: { paddingHorizontal: 16, paddingBottom: 40, gap: 16 },

  // ── Hero ──
  hero: {
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
  },
  heroCircle: {
    position: 'absolute',
    right: -20,
    top: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  heroGiftBox: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  heroTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.4,
    lineHeight: 27,
  },
  heroSub: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginTop: 8,
  },

  // ── You / Friend ──
  splitRow: { flexDirection: 'row', gap: 11 },
  splitCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 15,
    alignItems: 'center',
  },
  splitLabel: { fontSize: 12, fontWeight: '700', textAlign: 'center' },
  splitValue: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.6,
    marginTop: 5,
  },
  splitSub: { fontSize: 11, fontWeight: '700', marginTop: 1 },

  // ── QR ──
  qrSection: { alignItems: 'center', gap: 10 },
  qrBox: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
  },
  qrHint: { fontSize: 12, fontWeight: '600', textAlign: 'center' },

  // ── Code box ──
  codeWrap: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    gap: 11,
  },
  codeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 13,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  codeMono: { fontSize: 18, fontWeight: '700', letterSpacing: 2.5 },
  codeHint: { fontSize: 10.5, fontWeight: '700' },
  codeBtns: { flexDirection: 'row', gap: 9 },
  codeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 13,
    borderRadius: 13,
  },
  codeBtnText: { fontSize: 13.5, fontWeight: '700' },

  // ── Share ──
  shareRow: { flexDirection: 'row', gap: 9 },
  shareItem: { flex: 1, alignItems: 'center', gap: 7 },
  shareIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  shareLabel: { fontSize: 11, fontWeight: '600' },

  // ── Steps ──
  secTitle: { fontSize: 13.5, fontWeight: '800', marginBottom: 10 },
  stepsCol: { gap: 12 },
  stepRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: 'rgba(232,122,69,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepNumText: { fontWeight: '800', fontSize: 13 },
  stepTitle: { fontSize: 13.5, fontWeight: '700' },
  stepDesc: { fontSize: 12.5, fontWeight: '600', marginTop: 1 },

  // ── Invited list ──
  invCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  invHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  invTitle: { fontSize: 13.5, fontWeight: '800' },
  invCount: { fontSize: 12, fontWeight: '700' },
  invRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  invAvatar: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  invInitial: { color: '#fff', fontSize: 15, fontWeight: '800' },
  invName: { flex: 1, fontSize: 14, fontWeight: '700' },
  invBadge: {
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
    flexShrink: 0,
  },
  invBadgeText: { fontSize: 12, fontWeight: '700' },
});

// https://www.youtube.com/watch?v=DZteznd47B4&list=RDDZteznd47B4&start_radio=1
