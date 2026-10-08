import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';

// "Qo'shimcha ma'lumotlar": ixtiyoriy maydonlar (asboblar, talablar, narx va h.k.) yopiq turadi,
// bosilganda ochiladi. `filled` — ichida nechta maydon to'ldirilgani (nishon sifatida ko'rsatiladi).
export default function ExtraSection({ filled = 0, children }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const [open, setOpen] = useState(false);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((v) => !v);
  };

  return (
    <View style={s.wrap}>
      <TouchableOpacity
        onPress={toggle}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={[s.header, { backgroundColor: t.card, borderColor: open ? t.orange : t.border }]}
      >
        <View style={[s.icon, { backgroundColor: t.orange + '1f' }]}>
          <MaterialCommunityIcons name="tune-variant" size={20} color={t.orange} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[s.title, { color: t.text }]}>{tr('newOrder.extraTitle')}</Text>
          <Text style={[s.sub, { color: t.muted }]} numberOfLines={2}>
            {filled > 0 ? tr('newOrder.extraFilled', { n: filled }) : tr('newOrder.extraSubtitle')}
          </Text>
        </View>
        {filled > 0 && (
          <View style={[s.badge, { backgroundColor: t.orange }]}>
            <Text style={s.badgeTxt}>{filled}</Text>
          </View>
        )}
        <MaterialCommunityIcons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={22}
          color={t.faint}
        />
      </TouchableOpacity>

      {open && <View style={s.body}>{children}</View>}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: 24 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 14,
  },
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 14.5, fontWeight: '800' },
  sub: { fontSize: 12, marginTop: 2, lineHeight: 16 },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeTxt: { color: '#fff', fontSize: 12, fontWeight: '800' },
  body: { paddingTop: 2 },
});
