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
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLanguage } from '../context/LanguageContext';

const M = {
  bg: '#0c1828',
  headerBg: '#11243c',
  card: '#142639',
  border: 'rgba(255,255,255,0.07)',
  orange: '#e87a45',
  orangeD: '#d8602a',
  gold: '#f5c451',
  green: '#2fa37a',
  blue: '#3f7fd4',
  red: '#e0473a',
  white: '#fff',
  muted: '#8da0ba',
  faint: '#6c7f9a',
};

const WEEK_VALUES = [40, 65, 55, 80, 70, 100, 45];
const MAX_WEEK = Math.max(...WEEK_VALUES);

const STATS_META = [
  { key: 'kln', rawValue: '247', color: M.green, icon: 'checkmark-circle' },
  { key: 'str', rawValue: '4.9', color: M.gold, icon: 'star' },
  { key: 'rsp', rawValue: '12', color: M.blue, icon: 'time' },
];

const JOBS = [
  {
    id: 1,
    name: 'Quvur oqayapti',
    area: 'Yunusobod',
    dist: '1.4 km',
    pay: '120 000',
    urgent: true,
  },
  {
    id: 2,
    name: "Rakovina o'rnatish",
    area: 'Chilonzor',
    dist: '2.2 km',
    pay: '95 000',
    urgent: false,
  },
];

const NAV = [
  { key: 'home', on: 'home', off: 'home-outline' },
  { key: 'orders', on: 'grid', off: 'grid-outline' },
  { key: 'wallet', on: 'wallet', off: 'wallet-outline' },
  { key: 'profile', on: 'person', off: 'person-outline' },
];

function Avatar({ letter = 'A', size = 42, bgColor = M.orange }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.32,
        backgroundColor: bgColor,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: '#fff', fontSize: size * 0.4, fontWeight: '700' }}>
        {letter}
      </Text>
    </View>
  );
}

export default function UstaMainScreen({ onLogout }) {
  const { t: tr } = useLanguage();
  const [online, setOnline] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [screen, setScreen] = useState(null);

  const weekDays = tr('ustaMain.weekDays');
  const WEEK = WEEK_VALUES.map((v, i) => [weekDays[i], v]);
  const STATS = STATS_META.map((st) => ({
    ...st,
    label: tr(`ustaMain.stats.${st.key}.label`),
    value:
      st.key === 'rsp'
        ? tr('ustaMain.stats.rsp.value', { n: st.rawValue })
        : st.rawValue,
  }));

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: M.bg }}
      edges={['top', 'left', 'right']}
    >
      <StatusBar style="light" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 90 }}
      >
        {/* ── Header ── */}
        <View style={s.header}>
          <View style={s.headerRow}>
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}
            >
              <Avatar letter="A" bgColor={M.orange} />
              <View>
                <Text style={{ fontSize: 11.5, color: M.muted }}>
                  {tr('ustaMain.cabinet')}
                </Text>
                <Text
                  style={{ fontWeight: '700', fontSize: 15.5, color: M.white }}
                >
                  Alisher Usmonov
                </Text>
              </View>
            </View>
            <View style={s.bellBtn}>
              <Ionicons
                name="notifications-outline"
                size={20}
                color={M.muted}
              />
              <View style={s.bellDot} />
            </View>
          </View>

          {/* Online toggle */}
          <View
            style={[
              s.onlineRow,
              {
                backgroundColor: online
                  ? 'rgba(47,163,122,0.13)'
                  : 'rgba(255,255,255,0.05)',
                borderColor: online ? 'rgba(47,163,122,0.4)' : M.border,
              },
            ]}
          >
            <View
              style={[
                s.onlineDot,
                { backgroundColor: online ? M.green : M.faint },
              ]}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontWeight: '800',
                  fontSize: 13.5,
                  color: online ? M.green : M.white,
                }}
              >
                {online ? tr('ustaMain.onlineStatus') : tr('ustaMain.offlineStatus')}
              </Text>
              <Text
                style={{
                  fontSize: 11.5,
                  color: M.muted,
                  fontWeight: '600',
                  marginTop: 2,
                }}
              >
                {online
                  ? tr('ustaMain.onlineSub')
                  : tr('ustaMain.offlineSub')}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setOnline((o) => !o)}
              style={[
                s.track,
                { backgroundColor: online ? M.green : '#33425a' },
              ]}
              activeOpacity={0.85}
            >
              <View style={[s.thumb, { left: online ? 21 : 3 }]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Balance card ── */}
        <View style={{ paddingHorizontal: 20, marginTop: 4 }}>
          <View style={s.balanceCard}>
            <View style={s.balanceCircle} />
            <View
              style={{
                position: 'absolute',
                right: 14,
                bottom: 14,
                opacity: 0.16,
              }}
            >
              <MaterialCommunityIcons name="wallet" size={56} color="#fff" />
            </View>
            <Text style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.92)' }}>
              {tr('ustaMain.balanceLabel')}
            </Text>
            <Text style={s.balanceAmt}>
              1 840 000 <Text style={s.balanceCur}>{tr('common.currencySom')}</Text>
            </Text>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <TouchableOpacity style={s.btnWhite} activeOpacity={0.8}>
                <Text
                  style={{ color: M.orangeD, fontWeight: '700', fontSize: 13 }}
                >
                  {tr('ustaMain.withdraw')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.btnOutline} activeOpacity={0.8}>
                <Text
                  style={{ color: M.white, fontWeight: '700', fontSize: 13 }}
                >
                  {tr('ustaMain.history')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── Today / Week ── */}
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: 20,
            marginTop: 16,
            gap: 12,
          }}
        >
          {[
            { label: tr('ustaMain.today'), val: '340 000', sub: tr('ustaMain.todaySub', { n: 4 }) },
            { label: tr('ustaMain.thisWeek'), val: '1.8M', sub: tr('ustaMain.weekSub', { n: 12 }) },
          ].map((item, i) => (
            <View key={i} style={[s.miniCard, { flex: 1 }]}>
              <Text style={{ fontSize: 11.5, color: M.muted }}>
                {item.label}
              </Text>
              <Text
                style={{
                  fontWeight: '800',
                  fontSize: 20,
                  color: M.white,
                  marginTop: 5,
                }}
              >
                {item.val}
              </Text>
              <Text style={{ fontSize: 10.5, color: M.green, marginTop: 2 }}>
                {item.sub}
              </Text>
            </View>
          ))}
        </View>

        {/* ── Stats ── */}
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: 20,
            marginTop: 16,
            gap: 10,
          }}
        >
          {STATS.map((st) => (
            <View
              key={st.key}
              style={[
                s.miniCard,
                {
                  flex: 1,
                  alignItems: 'center',
                  paddingVertical: 14,
                  paddingHorizontal: 8,
                },
              ]}
            >
              <Ionicons name={st.icon} size={19} color={st.color} />
              <Text
                style={{
                  fontWeight: '800',
                  fontSize: 17,
                  color: M.white,
                  marginTop: 8,
                }}
              >
                {st.value}
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  color: M.muted,
                  marginTop: 3,
                  textAlign: 'center',
                }}
              >
                {st.label}
              </Text>
            </View>
          ))}
        </View>

        {/* ── Weekly chart ── */}
        <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
          <View style={s.miniCard}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'baseline',
              }}
            >
              <Text style={{ fontWeight: '700', fontSize: 14, color: M.white }}>
                {tr('ustaMain.weeklyIncome')}
              </Text>
              <Text style={{ fontSize: 11.5, color: M.muted }}>
                {tr('ustaMain.somThousands')}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-end',
                height: 80,
                marginTop: 16,
                gap: 6,
              }}
            >
              {WEEK.map((d, i) => (
                <View
                  key={i}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    height: '100%',
                    justifyContent: 'flex-end',
                  }}
                >
                  <View
                    style={{
                      width: '75%',
                      height: Math.round((d[1] / MAX_WEEK) * 72),
                      borderRadius: 6,
                      backgroundColor:
                        d[1] === MAX_WEEK ? M.orange : 'rgba(232,122,69,0.28)',
                    }}
                  />
                  <Text style={{ fontSize: 9.5, color: M.faint, marginTop: 6 }}>
                    {d[0]}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ── Incoming jobs ── */}
        <View style={{ paddingHorizontal: 20, marginTop: 22 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: 13,
            }}
          >
            <Text style={{ fontWeight: '700', fontSize: 16.5, color: M.white }}>
              {tr('ustaMain.newOrders')}
            </Text>
            <Text
              style={{ color: M.orange, fontSize: 12.5, fontWeight: '600' }}
            >
              {tr('ustaMain.nearbyCount', { n: 3 })}
            </Text>
          </View>
          {JOBS.map((j) => (
            <View
              key={j.id}
              style={[s.jobCard, j.urgent && s.jobUrgent, { marginBottom: 12 }]}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: '700',
                        fontSize: 14.5,
                        color: M.white,
                      }}
                    >
                      {j.name}
                    </Text>
                    {j.urgent && (
                      <View style={s.urgentBadge}>
                        <Text
                          style={{
                            fontSize: 9.5,
                            fontWeight: '700',
                            color: '#fff',
                          }}
                        >
                          {tr('ustaMain.urgent')}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                      marginTop: 5,
                    }}
                  >
                    <MaterialCommunityIcons
                      name="map-marker"
                      size={12}
                      color={M.muted}
                    />
                    <Text style={{ fontSize: 11.5, color: M.muted }}>
                      {j.area} · {j.dist}
                    </Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end', marginLeft: 12 }}>
                  <Text
                    style={{ fontWeight: '800', fontSize: 15, color: M.orange }}
                  >
                    {j.pay}
                  </Text>
                  <Text style={{ fontSize: 10, color: M.muted }}>{tr('common.currencySom')}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
                <TouchableOpacity style={s.jobBtnSec} activeOpacity={0.8}>
                  <Text
                    style={{
                      color: M.muted,
                      fontWeight: '700',
                      fontSize: 12.5,
                    }}
                  >
                    {tr('ustaMain.decline')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.jobBtnPri} activeOpacity={0.8}>
                  <Text
                    style={{ color: '#fff', fontWeight: '700', fontSize: 12.5 }}
                  >
                    {tr('ustaMain.accept')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* ── Bottom nav ── */}
      <View style={s.nav}>
        {NAV.map((item) => {
          const active = item.key === activeTab;
          const color = active ? M.orange : M.faint;
          return (
            <TouchableOpacity
              key={item.key}
              style={s.navTab}
              onPress={() => setActiveTab(item.key)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={active ? item.on : item.off}
                size={23}
                color={color}
              />
              <Text
                style={{ fontSize: 10, fontWeight: '600', color, marginTop: 4 }}
              >
                {tr(`ustaMain.nav.${item.key}`)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 18,
    backgroundColor: '#11243c',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bellBtn: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#142639',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellDot: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e87a45',
    borderWidth: 2,
    borderColor: '#142639',
  },
  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 15,
    padding: 13,
    paddingHorizontal: 15,
    marginTop: 16,
    borderWidth: 1,
  },
  onlineDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  track: { width: 44, height: 26, borderRadius: 999, justifyContent: 'center' },
  thumb: {
    position: 'absolute',
    top: 3,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
  },

  balanceCard: {
    borderRadius: 22,
    padding: 20,
    backgroundColor: '#e87a45',
    overflow: 'hidden',
    position: 'relative',
  },
  balanceCircle: {
    position: 'absolute',
    right: -30,
    top: -30,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  balanceAmt: {
    fontWeight: '800',
    fontSize: 32,
    color: '#fff',
    marginTop: 6,
    letterSpacing: -0.5,
  },
  balanceCur: { fontSize: 16, fontWeight: '600' },
  btnWhite: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 11,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  btnOutline: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 11,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.6)',
    backgroundColor: 'transparent',
    alignItems: 'center',
  },

  miniCard: {
    backgroundColor: '#142639',
    borderRadius: 18,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },

  jobCard: {
    backgroundColor: '#142639',
    borderRadius: 18,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  jobUrgent: { borderColor: 'rgba(232,122,69,0.35)' },
  urgentBadge: {
    backgroundColor: '#e0473a',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  jobBtnSec: {
    flex: 1,
    borderRadius: 11,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  jobBtnPri: {
    flex: 2,
    borderRadius: 11,
    paddingVertical: 10,
    backgroundColor: '#e87a45',
    alignItems: 'center',
  },

  nav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 78,
    backgroundColor: 'rgba(12,22,36,0.96)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.07)',
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 13,
  },
  navTab: { flex: 1, alignItems: 'center' },
});
