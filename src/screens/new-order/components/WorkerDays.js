import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { getWorkerAvailability } from '../../../api/workers';
import { toISODate } from '../utils';

// Server holati → 'open' | 'full' | 'off' (nomalum qiymat "bo'sh" hisoblanadi).
export function dayKind(status) {
  const v = String(status ?? '').toLowerCase();
  if (v.includes('off') || v.includes('rest') || v.includes('dam')) return 'off';
  if (v.includes('full') || v.includes('busy') || v.includes('book')) return 'full';
  return 'open';
}

// "2026-11-05" + "09:00" → mahalliy Date.
function toDate(day, time) {
  const [y, m, d] = day.split('-').map(Number);
  const [hh, mm] = (time || '09:00').split(':').map(Number);
  return new Date(y, m - 1, d, hh || 0, mm || 0);
}

// Aniq ustaga buyurtma berishda kun tanlash: ustaning keyingi kunlari (bo'sh / to'la / dam) chiplar bilan.
// Faqat bo'sh kunni bosish mumkin; tanlangan kun (`whenDate`) ajratib ko'rsatiladi.
export function useWorkerDays(workerId) {
  const query = useQuery({
    queryKey: ['worker', workerId, 'availability'],
    queryFn: () => getWorkerAvailability(workerId, 21),
    enabled: !!workerId,
    staleTime: 2 * 60 * 1000,
  });
  const days = query.data?.hasSchedule ? query.data.days : [];
  const kindOf = (date) => {
    const iso = toISODate(date);
    const found = days.find((d) => d.day === iso);
    return found ? dayKind(found.status) : 'open';
  };
  return { days, kindOf };
}

export default function WorkerDays({ days, whenDate, onPick }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  if (days.length === 0) return null;

  const weekdays = tr('newOrder.when.weekdays');
  const selectedIso = whenDate ? toISODate(whenDate) : null;

  return (
    <View style={s.wrap}>
      <Text style={[s.title, { color: t.muted }]}>{tr('newOrder.when.workerDays')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.row}>
        {days.map((d) => {
          const kind = dayKind(d.status);
          const date = toDate(d.day, d.start);
          const selected = selectedIso === d.day;
          const open = kind === 'open';
          const color = open ? t.green : kind === 'full' ? t.orange : t.muted;
          return (
            <TouchableOpacity
              key={d.day}
              disabled={!open}
              activeOpacity={0.8}
              onPress={() => onPick(date)}
              accessibilityRole="button"
              style={[
                s.chip,
                {
                  borderColor: selected ? t.orange : t.border,
                  backgroundColor: selected ? t.orange + '1f' : t.card,
                  opacity: open ? 1 : 0.55,
                },
              ]}
            >
              <Text style={[s.wd, { color: t.muted }]}>{weekdays[date.getDay()]}</Text>
              <Text style={[s.num, { color: t.text }]}>{date.getDate()}</Text>
              <Text style={[s.state, { color }]} numberOfLines={1}>
                {open
                  ? d.start || ' '
                  : tr(kind === 'full' ? 'newOrder.when.dayFull' : 'newOrder.when.dayOff')}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: 10, gap: 8 },
  title: { fontSize: 12.5, fontWeight: '700' },
  row: { gap: 8, paddingRight: 4 },
  chip: {
    width: 58,
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 8,
    gap: 1,
  },
  wd: { fontSize: 11, fontWeight: '700' },
  num: { fontSize: 17, fontWeight: '800' },
  state: { fontSize: 10.5, fontWeight: '700' },
});
