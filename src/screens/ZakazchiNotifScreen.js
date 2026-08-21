import React, { useState, useRef, useEffect } from 'react';
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
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

function Toggle({ on, onPress, accent }) {
  const anim = useRef(new Animated.Value(on ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: on ? 1 : 0,
      duration: 160,
      useNativeDriver: false,
    }).start();
  }, [on]);

  const thumbLeft = anim.interpolate({ inputRange: [0, 1], outputRange: [3, 22] });
  const bg = anim.interpolate({ inputRange: [0, 1], outputRange: ['#33425a', accent] });

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={s.toggleHitbox}>
      <Animated.View style={[s.toggleTrack, { backgroundColor: bg }]}>
        <Animated.View style={[s.toggleThumb, { left: thumbLeft }]} />
      </Animated.View>
    </TouchableOpacity>
  );
}

function GroupTitle({ children, t }) {
  return <Text style={[s.groupTitle, { color: t.faint }]}>{children}</Text>;
}

function ToggleRow({ iconName, iconColor, label, sub, on, onPress, border, t }) {
  return (
    <View style={[s.toggleRow, border && { borderTopWidth: 1, borderTopColor: t.border }]}>
      <View style={[s.rowIcon, { backgroundColor: t.rowIconBg }]}>
        <MaterialCommunityIcons name={iconName} size={19} color={iconColor} />
      </View>
      <View style={s.rowTextBox}>
        <Text style={[s.rowLabel, { color: t.text }]}>{label}</Text>
        {sub ? <Text style={[s.rowSub, { color: t.muted }]}>{sub}</Text> : null}
      </View>
      <Toggle on={on} onPress={onPress} accent={t.orange} />
    </View>
  );
}

export default function ZakazchiNotifScreen({ onBack }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const [master, setMaster] = useState(true);
  const [tog, setTog] = useState({
    order: true,
    chat: true,
    promo: false,
    news: false,
    login: true,
    payment: true,
  });

  const flip = (k) => setTog((p) => ({ ...p, [k]: !p[k] }));

  const masterAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.timing(masterAnim, {
      toValue: master ? t.orange : t.card,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [master]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top', 'left', 'right']}>
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
        <Text style={[s.headerTitle, { color: t.text }]}>{tr('notif.headerTitle')}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Master hero card */}
        <TouchableOpacity
          onPress={() => setMaster((m) => !m)}
          activeOpacity={0.9}
          style={[
            s.masterCard,
            {
              backgroundColor: master ? t.orange : t.card,
              borderWidth: master ? 0 : 1,
              borderColor: t.border,
            },
          ]}
        >
          <View style={[s.masterIconBox, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
            <Ionicons name={master ? 'notifications' : 'notifications-off'} size={24} color="#fff" />
          </View>
          <View style={s.masterTextBox}>
            <Text style={s.masterTitle}>{tr('notif.allNotifications')}</Text>
            <Text style={[s.masterSub, { color: master ? 'rgba(255,255,255,0.9)' : t.muted }]}>
              {master ? tr('notif.enabled') : tr('notif.disabled')}
            </Text>
          </View>
          <Toggle on={master} onPress={() => setMaster((m) => !m)} accent="#1c8c5e" />
        </TouchableOpacity>

        {/* Categories */}
        <View style={{ opacity: master ? 1 : 0.4 }} pointerEvents={master ? 'auto' : 'none'}>

          <GroupTitle t={t}>{tr('notif.groups.orders')}</GroupTitle>
          <View style={[s.card, { backgroundColor: t.card, borderColor: t.border }]}>
            <ToggleRow
              iconName="shopping-outline"
              iconColor={t.orange}
              label={tr('notif.rows.orderStatus.label')}
              sub={tr('notif.rows.orderStatus.sub')}
              on={tog.order}
              onPress={() => flip('order')}
              t={t}
            />
            <ToggleRow
              iconName="chat-processing-outline"
              iconColor={t.blue}
              label={tr('notif.rows.chatMessages.label')}
              sub={tr('notif.rows.chatMessages.sub')}
              on={tog.chat}
              onPress={() => flip('chat')}
              border
              t={t}
            />
          </View>

          <GroupTitle t={t}>{tr('notif.groups.marketing')}</GroupTitle>
          <View style={[s.card, { backgroundColor: t.card, borderColor: t.border }]}>
            <ToggleRow
              iconName="tag-outline"
              iconColor={t.green}
              label={tr('notif.rows.promos.label')}
              sub={tr('notif.rows.promos.sub')}
              on={tog.promo}
              onPress={() => flip('promo')}
              t={t}
            />
            <ToggleRow
              iconName="message-text-outline"
              iconColor={t.violet}
              label={tr('notif.rows.news.label')}
              sub={tr('notif.rows.news.sub')}
              on={tog.news}
              onPress={() => flip('news')}
              border
              t={t}
            />
          </View>

          <GroupTitle t={t}>{tr('notif.groups.accountSecurity')}</GroupTitle>
          <View style={[s.card, { backgroundColor: t.card, borderColor: t.border }]}>
            <ToggleRow
              iconName="shield-check-outline"
              iconColor={t.blue}
              label={tr('notif.rows.loginSecurity.label')}
              sub={tr('notif.rows.loginSecurity.sub')}
              on={tog.login}
              onPress={() => flip('login')}
              t={t}
            />
            <ToggleRow
              iconName="wallet-outline"
              iconColor={t.gold}
              label={tr('notif.rows.paymentAccount.label')}
              sub={tr('notif.rows.paymentAccount.sub')}
              on={tog.payment}
              onPress={() => flip('payment')}
              border
              t={t}
            />
          </View>

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
  headerTitle: {
    fontWeight: '700',
    fontSize: 20,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  masterCard: {
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  masterIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  masterTextBox: { flex: 1 },
  masterTitle: { color: '#fff', fontWeight: '700', fontSize: 15.5 },
  masterSub: { fontSize: 12, marginTop: 2 },

  groupTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 20,
    marginBottom: 9,
    paddingLeft: 4,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rowTextBox: { flex: 1, minWidth: 0 },
  rowLabel: { fontWeight: '600', fontSize: 14 },
  rowSub: { fontSize: 11.5, marginTop: 2 },

  toggleHitbox: { flexShrink: 0 },
  toggleTrack: {
    width: 46,
    height: 27,
    borderRadius: 14,
  },
  toggleThumb: {
    position: 'absolute',
    top: 3,
    width: 21,
    height: 21,
    borderRadius: 11,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
});
