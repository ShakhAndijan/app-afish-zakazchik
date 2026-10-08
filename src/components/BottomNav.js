import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../context/LanguageContext';

const NAV = [
  { key: 'home',     labelKey: 'bottomNav.home',     on: 'home',            off: 'home-outline' },
  { key: 'newOrder', labelKey: 'bottomNav.newOrder', on: 'add-circle',      off: 'add-circle-outline' },
  { key: 'services', labelKey: 'bottomNav.services', on: 'grid',            off: 'grid-outline' },
  { key: 'profile',  labelKey: 'bottomNav.profile',  on: 'person',          off: 'person-outline' },
];

export default function BottomNav({
  activeTab,
  onTabChange,
  accent = '#e87a45',
  background = '#141c2c',
  border = 'rgba(255,255,255,0.08)',
  muted = 'rgba(255,255,255,0.4)',
  ringColor,
}) {
  const { t } = useLanguage();
  const bottomInset = useSafeAreaInsets().bottom;
  const ring = ringColor ?? background;

  return (
    <View
      style={[s.nav, { backgroundColor: background, borderColor: border, bottom: bottomInset + 10 }]}
    >
      {NAV.map((item) => {
        const active = item.key === activeTab;
        return (
          <TouchableOpacity
            key={item.key}
            style={s.tab}
            onPress={() => onTabChange?.(item.key)}
            activeOpacity={0.75}
            accessibilityRole="tab"
            accessibilityLabel={t(item.labelKey)}
            accessibilityState={{ selected: active }}
          >
            {active ? (
              <View style={[s.bubble, { backgroundColor: accent, borderColor: ring, shadowColor: accent }]}>
                <Ionicons name={item.on} size={22} color="#fff" />
              </View>
            ) : (
              <>
                <Ionicons name={item.off} size={21} color={muted} />
                <Text style={[s.label, { color: muted }]}>{t(item.labelKey)}</Text>
              </>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  nav: {
    position: 'absolute', left: 16, right: 16, bottom: 18,
    height: 66, borderRadius: 33,
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22, shadowRadius: 18, elevation: 14,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3 },
  bubble: {
    width: 46, height: 46, borderRadius: 23,
    marginTop: -30,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 4,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45, shadowRadius: 10, elevation: 10,
  },
  label: { fontSize: 10, fontWeight: '600' },
});
