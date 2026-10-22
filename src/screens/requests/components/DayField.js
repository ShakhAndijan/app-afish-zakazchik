import { useState } from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { toISODate } from '../../new-order/utils';
import { addDaysISO, formatDay, isoToDate, todayISO, MAX_DAYS_AHEAD } from '../utils';

// Faqat kun tanlanadi ("YYYY-MM-DD"): ish sanasi taklifda va qayta e'lon qilishda.
// Tanlash mumkin: bugundan boshlab MAX_DAYS_AHEAD kun ichida (saytdagidek).
export default function DayField({ value, onChange }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const [iosOpen, setIosOpen] = useState(false);
  const today = todayISO();
  const minimumDate = isoToDate(today);
  const maximumDate = isoToDate(addDaysISO(today, MAX_DAYS_AHEAD));

  const open = () => {
    const current = value ? isoToDate(value) : minimumDate;
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: current,
        mode: 'date',
        minimumDate,
        maximumDate,
        onValueChange: (_e, picked) => onChange(toISODate(picked)),
      });
    } else {
      setIosOpen((v) => !v);
    }
  };

  return (
    <View>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={open}
        accessibilityRole="button"
        style={[s.field, { backgroundColor: t.inputBg, borderColor: t.border }]}
      >
        <MaterialCommunityIcons name="calendar-month-outline" size={20} color={t.muted} />
        <Text style={[s.text, { color: value ? t.text : t.faint }]}>
          {value ? formatDay(tr, value) : tr('orderFlow.order.dayRequired')}
        </Text>
      </TouchableOpacity>
      {Platform.OS === 'ios' && iosOpen && (
        <DateTimePicker
          value={value ? isoToDate(value) : minimumDate}
          mode="date"
          display="inline"
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onValueChange={(_e, picked) => {
            onChange(toISODate(picked));
            setIosOpen(false);
          }}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
  },
  text: { fontSize: 14.5, fontWeight: '600' },
});
