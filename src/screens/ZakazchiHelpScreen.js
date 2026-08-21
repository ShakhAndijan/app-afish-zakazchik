import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const FAQ_KEYS = ['cancelOrder', 'refundTime', 'masterLate'];

const CONTACTS = [
  {
    key: 'liveChat',
    icon: 'message-text',
    bg: '#e87a45',
    hasBadge: true,
  },
  {
    key: 'call',
    icon: 'phone',
    bg: '#2fa37a',
    sub: '+998 95 023 99 22',
    onPress: () => Linking.openURL('tel:+998950239922'),
  },
  {
    key: 'telegram',
    icon: 'send',
    bg: '#2aabee',
    sub: '@Shakhzodbek_AA',
    onPress: () => Linking.openURL('https://t.me/Shakhzodbek_AA'),
  },
  {
    key: 'email',
    icon: 'email-outline',
    bg: '#3f7fd4',
    sub: 'shakhandijan@gmail.com',
    onPress: () => Linking.openURL('mailto:shakhandijan@gmail.com'),
  },
];

function FaqItem({ faqKey, isOpen, onToggle }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const [liked, setLiked] = useState(null);

  return (
    <View>
      <TouchableOpacity style={s.faqRow} activeOpacity={0.7} onPress={onToggle}>
        <Text style={[s.faqQ, { color: t.text, flex: 1 }]}>{tr(`help.faq.${faqKey}.q`)}</Text>
        <MaterialCommunityIcons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={isOpen ? t.orange : t.faint}
        />
      </TouchableOpacity>
      {isOpen && (
        <View
          style={[s.faqBody, { borderTopWidth: 1, borderTopColor: t.border }]}
        >
          <Text style={[s.faqA, { color: t.muted }]}>{tr(`help.faq.${faqKey}.a`)}</Text>
          <View style={s.feedbackRow}>
            <Text style={{ fontSize: 11.5, color: t.faint, flex: 1 }}>
              {tr('help.wasHelpful')}
            </Text>
            <TouchableOpacity
              style={[
                s.feedbackBtn,
                {
                  backgroundColor:
                    liked === true ? 'rgba(47,163,122,0.2)' : t.inputBg,
                },
              ]}
              onPress={() => setLiked(liked === true ? null : true)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="thumb-up-outline"
                size={14}
                color={liked === true ? '#2fa37a' : t.faint}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                s.feedbackBtn,
                {
                  backgroundColor:
                    liked === false ? 'rgba(224,71,58,0.15)' : t.inputBg,
                },
              ]}
              onPress={() => setLiked(liked === false ? null : false)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="thumb-down-outline"
                size={14}
                color={liked === false ? '#e0473a' : t.faint}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

function FaqAccordion() {
  const { theme: t } = useTheme();
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <View
      style={[s.faqCard, { backgroundColor: t.card, borderColor: t.border }]}
    >
      {FAQ_KEYS.map((faqKey, i) => (
        <View key={faqKey}>
          {i > 0 && <View style={{ height: 1, backgroundColor: t.border }} />}
          <FaqItem
            faqKey={faqKey}
            isOpen={openIdx === i}
            onToggle={() => setOpenIdx(openIdx === i ? -1 : i)}
          />
        </View>
      ))}
    </View>
  );
}

export default function ZakazchiHelpScreen({ onBack }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: t.bg }}
      edges={['top', 'left', 'right']}
    >
      <StatusBar style={t.isDark ? 'light' : 'dark'} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* ── Header ── */}
        <View style={s.header}>
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
              size={22}
              color={t.text}
            />
          </TouchableOpacity>
          <Text style={{ fontWeight: '700', fontSize: 20, color: t.text }}>
            {tr('profile.settings.helpCenter')}
          </Text>
        </View>

        {/* ── Hero card ── */}
        <View style={{ paddingHorizontal: 20 }}>
          <View style={s.hero}>
            <View style={s.heroBg}>
              <MaterialCommunityIcons
                name="message-text"
                size={110}
                color="rgba(255,255,255,0.16)"
              />
            </View>
            <Text style={{ fontWeight: '700', fontSize: 19, color: '#fff' }}>
              {tr('help.heroTitle')}
            </Text>
            <Text
              style={{
                fontSize: 12.5,
                color: 'rgba(255,255,255,0.92)',
                marginTop: 6,
                maxWidth: 220,
              }}
            >
              {tr('help.heroSubtitle')}
            </Text>
          </View>
        </View>

        {/* ── Bog'lanish kanallari ── */}
        <View style={{ paddingHorizontal: 20, marginTop: 18, gap: 11 }}>
          {CONTACTS.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[
                s.contactRow,
                { backgroundColor: t.card, borderColor: t.border },
              ]}
              activeOpacity={0.8}
              onPress={item.onPress}
            >
              <View style={[s.contactIcon, { backgroundColor: item.bg }]}>
                <MaterialCommunityIcons
                  name={item.icon}
                  size={22}
                  color="#fff"
                />
              </View>
              <View style={{ flex: 1, marginLeft: 13 }}>
                <Text
                  style={{ fontWeight: '700', fontSize: 14, color: t.text }}
                >
                  {tr(`help.contacts.${item.key}`)}
                </Text>
                <Text style={{ fontSize: 11.5, color: t.muted, marginTop: 2 }}>
                  {item.sub || tr('help.liveChatSub')}
                </Text>
              </View>
              {item.hasBadge && (
                <View style={s.badge}>
                  <Text style={s.badgeTxt}>{tr('help.onlineBadge')}</Text>
                </View>
              )}
              <MaterialCommunityIcons
                name="chevron-right"
                size={18}
                color={t.faint}
                style={{ marginLeft: 6 }}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Tez-tez so'raladi ── */}
        <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
          <Text
            style={{
              fontWeight: '700',
              fontSize: 15,
              color: t.text,
              marginBottom: 12,
            }}
          >
            {tr('help.faqTitle')}
          </Text>
          <FaqAccordion />
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
    paddingTop: 16,
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

  hero: {
    backgroundColor: '#e87a45',
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  heroBg: {
    position: 'absolute',
    right: -20,
    bottom: -24,
  },

  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    padding: 15,
  },
  contactIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    backgroundColor: 'rgba(47,163,122,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeTxt: { fontSize: 10, fontWeight: '700', color: '#2fa37a' },

  faqCard: { borderWidth: 1, borderRadius: 16, overflow: 'hidden' },
  faqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 15,
    paddingHorizontal: 16,
  },
  faqQ: { fontWeight: '600', fontSize: 13.8 },
  faqBody: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 },
  faqA: { fontSize: 13, lineHeight: 20 },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  feedbackBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
