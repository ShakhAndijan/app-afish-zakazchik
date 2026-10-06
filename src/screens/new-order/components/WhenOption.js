import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { common } from '../styles';

export default function WhenOption({ icon, accent, title, subtitle, active, onPress, t }) {
  const iconBg = accent ? t.orange : t.isDark ? 'rgba(255,255,255,0.08)' : '#F1F2F4';
  const iconColor = accent ? '#fff' : t.text;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        s.whenCard,
        { backgroundColor: t.card, borderColor: active ? t.orange : t.border },
      ]}
    >
      <View style={s.whenTopRow}>
        <View style={[s.whenIconWrap, { backgroundColor: iconBg }]}>
          <MaterialCommunityIcons name={icon} size={18} color={iconColor} />
        </View>
        <View style={[common.radioOuter, { borderColor: active ? t.orange : t.border }]}>
          {active && <View style={[common.radioInner, { backgroundColor: t.orange }]} />}
        </View>
      </View>
      <Text style={[s.whenTitle, { color: t.text }]} numberOfLines={1}>
        {title}
      </Text>
      {!!subtitle && (
        <Text style={[s.whenSubtitle, { color: t.muted }]} numberOfLines={2}>
          {subtitle}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  whenCard: {
    width: '47%',
    flexGrow: 1,
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  whenTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  whenIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  whenTitle: { fontSize: 14, fontWeight: '700' },
  whenSubtitle: { fontSize: 11.5, marginTop: 3, lineHeight: 15 },
});
