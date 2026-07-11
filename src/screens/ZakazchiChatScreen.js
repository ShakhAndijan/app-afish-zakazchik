import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import BottomNav from '../components/BottomNav';

export default function ZakazchiChatScreen({ onTabChange }) {
  const { theme: t } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top', 'left', 'right']}>
      <StatusBar style={t.isDark ? 'light' : 'dark'} />

      <View style={s.header}>
        <Text style={[s.headerTitle, { color: t.text }]}>Xabarlar</Text>
      </View>

      <View style={s.content}>
        <View style={[s.iconWrap, { backgroundColor: t.orange + '18' }]}>
          <MaterialCommunityIcons name="chat-processing-outline" size={56} color={t.orange} />
          <View style={[s.badge, { backgroundColor: t.orange, borderColor: t.bg }]}>
            <MaterialCommunityIcons name="wrench" size={14} color="#fff" />
          </View>
        </View>

        <Text style={[s.title, { color: t.text }]}>Bu oyna hali ish jarayonida</Text>
        <Text style={[s.subtitle, { color: t.muted }]}>
          Tez orada shu yerda ustalar bilan yozishmalaringizni ko'rasiz
        </Text>
      </View>

      <BottomNav
        activeTab="chat"
        onTabChange={onTabChange}
        accent={t.orange}
        background={t.navBg}
        border={t.border}
        muted={t.faint}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 6,
  },
  headerTitle: { fontWeight: '700', fontSize: 20 },

  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    marginBottom: 60,
  },
  iconWrap: {
    width: 120,
    height: 120,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  badge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontWeight: '800', fontSize: 17, textAlign: 'center' },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 19,
  },
});
