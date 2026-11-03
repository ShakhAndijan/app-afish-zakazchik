import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { workerPresence, formatBusyUntil } from '../utils/presence';

// Ustaning holati belgisi: "Onlayn" (yashil), "Band · 14:30 gacha" (to'q sariq), "Dam olishda" (kulrang).
// `onDark` — rangli fon (profil boshi) ustida oq matn bilan chiqadi.
export default function PresenceBadge({ worker, onDark = false, style }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const { status, busyUntil } = workerPresence(worker);
  if (!status) return null;

  const color = status === 'online' ? t.green : status === 'busy' ? t.orange : t.muted;
  const until = status === 'busy' ? formatBusyUntil(busyUntil) : '';
  const label =
    status === 'busy' && until
      ? tr('presence.busyUntil', { time: until })
      : tr(`presence.${status}`);

  return (
    <View
      style={[s.pill, { backgroundColor: onDark ? 'rgba(255,255,255,0.18)' : color + '1f' }, style]}
    >
      <View style={[s.dot, { backgroundColor: color }]} />
      <Text style={[s.text, { color: onDark ? '#fff' : color }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
  text: { fontSize: 11.5, fontWeight: '700' },
});
