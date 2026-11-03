import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { REQUIRED_FIELDS } from '../constants';

// Saytdagi "Ваш заказ — 0/2 обязательных" xulosasining mobil ko'rinishi: majburiy maydonlar
// to'ldirilgani sari real vaqtda yangilanadi. `missing` — hali to'ldirilmagan maydonlar kalitlari.
// `onItemPress(key)` berilsa, har bir band havola: bosilsa shu maydonni to'ldiradigan joyga o'tiladi.
export default function OrderProgressCard({ missing, fields = REQUIRED_FIELDS, onItemPress }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const total = fields.length;
  const done = total - fields.filter((k) => missing.includes(k)).length;
  const complete = done === total;

  return (
    <View style={[s.card, { backgroundColor: t.card, borderColor: complete ? t.green : t.border }]}>
      <View style={s.head}>
        <Text style={[s.title, { color: t.text }]}>{tr('newOrder.progress.title')}</Text>
        <Text style={[s.count, { color: complete ? t.green : t.orange }]}>
          {tr('newOrder.progress.count', { done, total })}
        </Text>
      </View>
      <View style={[s.track, { backgroundColor: t.border }]}>
        <View
          style={[
            s.fill,
            { width: `${(done / total) * 100}%`, backgroundColor: complete ? t.green : t.orange },
          ]}
        />
      </View>
      <View style={s.items}>
        {fields.map((key) => {
          const ok = !missing.includes(key);
          return (
            <TouchableOpacity
              key={key}
              style={s.item}
              activeOpacity={0.6}
              disabled={!onItemPress}
              hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
              accessibilityRole="link"
              onPress={() => onItemPress?.(key)}
            >
              <MaterialCommunityIcons
                name={ok ? 'check-circle' : 'circle-outline'}
                size={16}
                color={ok ? t.green : t.faint}
              />
              <Text
                style={[
                  s.itemTxt,
                  { color: ok ? t.text : t.orange },
                  !ok && !!onItemPress && s.itemLink,
                ]}
                numberOfLines={1}
              >
                {tr(key).replace(/\?$/, '')}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: { borderWidth: 1.5, borderRadius: 16, padding: 14, marginTop: 22, marginBottom: 4 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 14.5, fontWeight: '800' },
  count: { fontSize: 12.5, fontWeight: '800' },
  track: { height: 5, borderRadius: 3, marginTop: 10, overflow: 'hidden' },
  fill: { height: 5, borderRadius: 3 },
  items: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 14, rowGap: 8, marginTop: 12 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 5, maxWidth: '48%' },
  itemTxt: { fontSize: 12.5, fontWeight: '600', flexShrink: 1 },
  itemLink: { textDecorationLine: 'underline' },
});
