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
import { useTheme } from '../context/ThemeContext';
import ZakazchiHelpScreen from './ZakazchiHelpScreen';
import ZakazchiNotifScreen from './ZakazchiNotifScreen';
import ZakazchiOrdersScreen from './ZakazchiOrdersScreen';
import ZakazchiPromoScreen from './ZakazchiPromoScreen';
import ZakazchiReferralScreen from './ZakazchiReferralScreen';
import TilBottomSheet, { LANGS } from '../components/TilBottomSheet';

const NAV = [
  { key: 'home', label: 'Asosiy', on: 'home', off: 'home-outline' },
  { key: 'services', label: 'Xizmatlar', on: 'grid', off: 'grid-outline' },
  {
    key: 'chat',
    label: 'Xabarlar',
    on: 'chatbubble',
    off: 'chatbubble-outline',
  },
  { key: 'profile', label: 'Profil', on: 'person', off: 'person-outline' },
];


function Avatar({ letter = 'J', size = 80, bgColor }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.3,
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

function SettingsRow({ icon, label, value, danger, color, onPress, t }) {
  return (
    <TouchableOpacity style={s.row} activeOpacity={0.7} onPress={onPress}>
      <View
        style={[
          s.rowIcon,
          { backgroundColor: danger ? 'rgba(224,71,58,0.13)' : t.rowIconBg },
        ]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={19}
          color={danger ? t.red : color || t.muted}
        />
      </View>
      <Text style={[s.rowLabel, { color: danger ? t.red : t.text }]}>
        {label}
      </Text>
      {value ? (
        <Text style={[s.rowValue, { color: t.muted }]}>{value}</Text>
      ) : null}
      {!danger && (
        <MaterialCommunityIcons
          name="chevron-right"
          size={18}
          color={t.faint}
        />
      )}
    </TouchableOpacity>
  );
}

export default function ZakazchiProfileScreen({ onTabChange, onLogout }) {
  const { theme: t, toggleTheme } = useTheme();
  const [screen, setScreen] = useState('profile');
  const [lang, setLang] = useState('uz');
  const [showTil, setShowTil] = useState(false);

  if (screen === 'help') {
    return <ZakazchiHelpScreen onBack={() => setScreen('profile')} />;
  }

  if (screen === 'notif') {
    return <ZakazchiNotifScreen onBack={() => setScreen('profile')} />;
  }

  if (screen === 'orders') {
    return <ZakazchiOrdersScreen onBack={() => setScreen('profile')} />;
  }

  if (screen === 'promo') {
    return <ZakazchiPromoScreen onBack={() => setScreen('profile')} />;
  }

  if (screen === 'referral') {
    return <ZakazchiReferralScreen onBack={() => setScreen('profile')} />;
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: t.bg }}
      edges={['top', 'left', 'right']}
    >
      <StatusBar style={t.isDark ? 'light' : 'dark'} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 90 }}
      >
        {/* ── Cover Header ── */}
        <View style={[s.cover, { backgroundColor: t.cover }]}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 18,
            }}
          >
            <Text style={{ fontWeight: '700', fontSize: 17, color: t.text }}>
              Profil
            </Text>
            <TouchableOpacity
              style={[s.iconBtn, { backgroundColor: t.blue }]}
              activeOpacity={0.8}
              onPress={toggleTheme}
            >
              <MaterialCommunityIcons
                name={t.isDark ? 'weather-sunny' : 'weather-night'}
                size={19}
                color="#fff"
              />
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <Avatar letter="J" size={80} bgColor={t.orange} />
            <View style={{ flex: 1 }}>
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}
              >
                <Text
                  style={{ fontWeight: '700', fontSize: 19, color: t.text }}
                >
                  Jasur Rahimov
                </Text>
                <MaterialCommunityIcons
                  name="shield-check"
                  size={16}
                  color={t.green}
                />
              </View>
              <Text style={{ fontSize: 13, color: t.muted, marginTop: 3 }}>
                +998 90 123 45 67
              </Text>
              <TouchableOpacity
                style={[
                  s.editBtn,
                  { borderColor: t.border, backgroundColor: t.card },
                ]}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name="pencil-outline"
                  size={13}
                  color={t.text}
                />
                <Text
                  style={{
                    color: t.text,
                    fontWeight: '700',
                    fontSize: 12,
                    marginLeft: 6,
                  }}
                >
                  Tahrirlash
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Activity stats */}
          <View
            style={[
              s.statsRow,
              { backgroundColor: t.card, borderColor: t.border },
            ]}
          >
            {[
              ['18', 'Buyurtma'],
              ['12', 'Sevimli usta'],
              ['4.8', 'Bahoyingiz'],
            ].map((st, i) => (
              <View
                key={i}
                style={[
                  s.statCell,
                  i < 2 && { borderRightWidth: 1, borderRightColor: t.border },
                ]}
              >
                <Text style={[s.statVal, { color: i === 2 ? t.gold : t.text }]}>
                  {st[0]}
                </Text>
                <Text style={[s.statLbl, { color: t.muted }]}>{st[1]}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Hamyon + sodiqlik darajasi ── */}
        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
          <View style={[s.walletCard, { overflow: 'hidden' }]}>
            <View style={s.walletCircle} />
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}
            >
              <View style={s.walletIcon}>
                <MaterialCommunityIcons name="wallet" size={22} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.9)' }}
                >
                  AFISH.uz hamyon
                </Text>
                <Text
                  style={{
                    fontWeight: '800',
                    fontSize: 20,
                    color: '#fff',
                    marginTop: 2,
                  }}
                >
                  120 000{' '}
                  <Text
                    style={{ fontSize: 12, fontWeight: '600', opacity: 0.85 }}
                  >
                    so'm
                  </Text>
                </Text>
              </View>
              <TouchableOpacity style={s.topupBtn} activeOpacity={0.8}>
                <Text
                  style={{
                    color: t.orangeD,
                    fontWeight: '700',
                    fontSize: 12.5,
                  }}
                >
                  To'ldirish
                </Text>
              </TouchableOpacity>
            </View>
            {/* Sodiqlik progress */}
            <View
              style={{
                marginTop: 15,
                paddingTop: 14,
                borderTopWidth: 1,
                borderTopColor: 'rgba(255,255,255,0.2)',
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <View
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
                >
                  <Ionicons name="star" size={14} color="#fff" />
                  <Text
                    style={{ fontSize: 12.5, fontWeight: '700', color: '#fff' }}
                  >
                    Kumush mijoz
                  </Text>
                </View>
                <Text
                  style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.9)' }}
                >
                  Oltingacha 3 buyurtma
                </Text>
              </View>
              <View style={s.progressTrack}>
                <View style={[s.progressFill, { width: '70%' }]} />
              </View>
            </View>
          </View>
        </View>

        {/* ── Promokod / taklif ── */}
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 16,
            flexDirection: 'row',
            gap: 12,
          }}
        >
          <TouchableOpacity
            style={[
              s.miniCard,
              { backgroundColor: t.card, borderColor: t.border },
            ]}
            activeOpacity={0.8}
            onPress={() => setScreen('promo')}
          >
            <View
              style={[
                s.miniIcon,
                { backgroundColor: 'rgba(155,108,209,0.16)' },
              ]}
            >
              <MaterialCommunityIcons name="gift" size={20} color={t.violet} />
            </View>
            <Text
              style={{
                fontWeight: '700',
                fontSize: 13.5,
                color: t.text,
                marginTop: 11,
              }}
            >
              Promokodlarim
            </Text>
            <Text
              style={{
                fontSize: 11.5,
                color: t.green,
                marginTop: 2,
                fontWeight: '600',
              }}
            >
              2 ta faol
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              s.miniCard,
              { backgroundColor: t.card, borderColor: t.border },
            ]}
            activeOpacity={0.8}
            onPress={() => setScreen('referral')}
          >
            <View
              style={[s.miniIcon, { backgroundColor: 'rgba(47,163,122,0.16)' }]}
            >
              <MaterialCommunityIcons
                name="account-plus"
                size={20}
                color={t.green}
              />
            </View>
            <Text
              style={{
                fontWeight: '700',
                fontSize: 13.5,
                color: t.text,
                marginTop: 11,
              }}
            >
              Do'stni taklif et
            </Text>
            <Text style={{ fontSize: 11.5, color: t.muted, marginTop: 2 }}>
              20 000 so'm oling
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Asosiy menyu ── */}
        <View style={{ paddingHorizontal: 20, paddingTop: 22 }}>
          <View
            style={[
              s.menuCard,
              { backgroundColor: t.card, borderColor: t.border },
            ]}
          >
            <SettingsRow
              icon="format-list-bulleted"
              label="Buyurtmalar tarixi"
              value="18 ta"
              color={t.blue}
              t={t}
              onPress={() => setScreen('orders')}
            />
            <View style={[s.divider, { backgroundColor: t.border }]} />
            <SettingsRow
              icon="map-marker-outline"
              label="Mening manzillarim"
              value="3 ta"
              color={t.green}
              t={t}
            />
            <View style={[s.divider, { backgroundColor: t.border }]} />
            <SettingsRow
              icon="credit-card-outline"
              label="To'lov usullari"
              t={t}
            />
          </View>
        </View>

        {/* ── Sozlamalar ── */}
        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
          <Text style={[s.groupLabel, { color: t.faint }]}>SOZLAMALAR</Text>
          <View
            style={[
              s.menuCard,
              { backgroundColor: t.card, borderColor: t.border },
            ]}
          >
            <SettingsRow icon="bell-outline" label="Bildirishnomalar" t={t} onPress={() => setScreen('notif')} />
            <View style={[s.divider, { backgroundColor: t.border }]} />
            <SettingsRow
              icon="earth"
              label="Til"
              value={LANGS.find((l) => l.code === lang)?.name}
              t={t}
              onPress={() => setShowTil(true)}
            />
            <View style={[s.divider, { backgroundColor: t.border }]} />
            <SettingsRow
              icon="help-circle-outline"
              label="Yordam markazi"
              t={t}
              onPress={() => setScreen('help')}
            />
          </View>
        </View>

        {/* ── Chiqish ── */}
        <View
          style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 }}
        >
          <View
            style={[
              s.menuCard,
              { backgroundColor: t.card, borderColor: t.border },
            ]}
          >
            <SettingsRow
              icon="logout"
              label="Hisobdan chiqish"
              danger
              t={t}
              onPress={onLogout}
            />
          </View>
          <Text
            style={{
              textAlign: 'center',
              fontSize: 11.5,
              color: t.faint,
              marginTop: 16,
            }}
          >
            AFISH.uz · versiya 1.0.1
          </Text>
        </View>
      </ScrollView>

      {/* ── Bottom Nav ── */}
      <View
        style={[s.nav, { backgroundColor: t.navBg, borderTopColor: t.border }]}
      >
        {NAV.map((item) => {
          const active = item.key === 'profile';
          const color = active ? t.orange : t.faint;
          return (
            <TouchableOpacity
              key={item.key}
              style={s.navTab}
              onPress={() => onTabChange?.(item.key)}
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
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <TilBottomSheet
        visible={showTil}
        currentLang={lang}
        onSelect={setLang}
        onClose={() => setShowTil(false)}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  cover: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 22,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 22,
    borderRadius: 18,
    borderWidth: 1,
  },
  statCell: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  statVal: { fontWeight: '800', fontSize: 19 },
  statLbl: { fontSize: 11, marginTop: 3 },

  walletCard: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: '#e87a45',
    position: 'relative',
  },
  walletCircle: {
    position: 'absolute',
    right: -24,
    top: -24,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  walletIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topupBtn: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  progressTrack: {
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 4, backgroundColor: '#fff' },

  miniCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    padding: 15,
  },
  miniIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  groupLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 8,
    paddingLeft: 4,
  },
  menuCard: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingVertical: 14,
  },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rowLabel: { flex: 1, fontWeight: '600', fontSize: 14 },
  rowValue: { fontSize: 12.5 },
  divider: { height: 1 },

  nav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 78,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 13,
  },
  navTab: { flex: 1, alignItems: 'center' },
});
