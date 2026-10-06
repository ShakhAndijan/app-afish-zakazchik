import { View, Text } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLanguage } from '../../../context/LanguageContext';
import { useUstaStyles } from '../styles';
import { formatDate } from '../utils';

// Ish jadvali: hafta kunlari, ish vaqti va dam olish sanalari.
export default function ScheduleSection({ weekDays, workHours, offDates }) {
  const { t: tr } = useLanguage();
  const { C, st } = useUstaStyles();
  if (weekDays.length === 0) return null;

  const infoRow = { marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12 };

  return (
    <>
      <Text style={st.secTitle}>{tr('ustaDetail.scheduleTitle')}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {weekDays.map((day) => (
          <View
            key={day.id}
            style={[st.chip, { paddingHorizontal: 12 }, day.isWorking ? st.dayChipOn : st.dayChipOff]}
          >
            {day.isWorking && <View style={st.dayDot} />}
            <Text style={[st.dayChipTxt, { color: day.isWorking ? C.green : C.dim }]}>
              {day.name.slice(0, 3)}
            </Text>
          </View>
        ))}
      </View>
      {!!workHours && (
        <View style={[st.card2, infoRow]}>
          <Ionicons name="time-outline" size={16} color={C.dim} />
          <Text style={{ fontSize: 13, color: C.txt, fontWeight: '600' }}>{workHours}</Text>
        </View>
      )}
      {offDates.length > 0 && (
        <View style={[st.card2, infoRow]}>
          <MaterialCommunityIcons name="calendar-remove-outline" size={16} color={C.dim} />
          <Text style={{ fontSize: 12.5, color: C.dim, flex: 1 }}>
            {tr('ustaDetail.daysOff', { dates: offDates.map(formatDate).join(', ') })}
          </Text>
        </View>
      )}
    </>
  );
}
