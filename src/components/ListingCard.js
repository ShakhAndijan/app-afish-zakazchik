import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Feather from '@expo/vector-icons/Feather';

const DEFAULT_COLORS = {
  card: '#142639',
  border: 'rgba(255,255,255,0.07)',
  text: '#ffffff',
  muted: 'rgba(255,255,255,0.45)',
  gold: '#f5c451',
  ratingBg: 'rgba(245,196,81,0.14)',
};

function formatPrice(n) {
  return n.toLocaleString('ru-RU');
}

export default function ListingCard({ listing, accent, onPress, colors }) {
  const c = { ...DEFAULT_COLORS, ...colors };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={[styles.accentBar, { backgroundColor: accent }]} />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View>
            <View style={[styles.avatar, { backgroundColor: listing.color }]}>
              <Text style={styles.avatarText}>{listing.initial}</Text>
            </View>
            {listing.certified && (
              <View style={[styles.verifiedBadge, { borderColor: c.card }]}>
                <Feather name="check" size={9} color="#fff" />
              </View>
            )}
          </View>
          <View>
            <Text style={[styles.name, { color: c.text }]}>{listing.name}</Text>
            <Text style={[styles.meta, { color: c.muted }]}>
              {listing.location} · {listing.postedAgo}
            </Text>
          </View>
        </View>
        <View style={[styles.ratingPill, { backgroundColor: c.ratingBg }]}>
          <Text style={[styles.ratingText, { color: c.gold }]}>★ {listing.rating}</Text>
        </View>
      </View>

      <Text style={[styles.title, { color: c.text }]}>{listing.title}</Text>
      <Text style={[styles.desc, { color: c.muted }]} numberOfLines={2}>
        {listing.desc}
      </Text>

      <View style={[styles.footer, { borderTopColor: c.border }]}>
        <View>
          <Text style={[styles.price, { color: c.text }]}>{formatPrice(listing.price)} so'm</Text>
          <Text style={[styles.priceSub, { color: c.muted }]}>dan boshlab</Text>
        </View>
        <View style={[styles.viewProfileBtn, { backgroundColor: accent }]}>
          <Text style={styles.viewProfileText}>Profilni ko'rish</Text>
          <Feather name="chevron-right" size={13} color="#fff" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    paddingLeft: 20,
    overflow: 'hidden',
  },
  accentBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 13.5 },
  verifiedBadge: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    width: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: '#3f7fd4',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: 14.5, fontWeight: '800' },
  meta: { fontSize: 11, marginTop: 1 },
  ratingPill: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999 },
  ratingText: { fontSize: 12, fontWeight: '700' },
  title: { fontSize: 15, fontWeight: '800', marginTop: 12 },
  desc: { fontSize: 12, marginTop: 4, lineHeight: 17 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  price: { fontSize: 15, fontWeight: '800' },
  priceSub: { fontSize: 10.5, fontWeight: '600', marginTop: 1 },
  viewProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  viewProfileText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
