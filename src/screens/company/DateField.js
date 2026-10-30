import { useState } from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';
import { toISODate } from '../new-order/utils';
import { isoToDate, todayISO } from '../requests/utils';
import { formatDate } from '../../utils/format';

// Kun tanlash ("YYYY-MM-DD"), bugundan boshlab. Doimiy xizmat sanasi uchun (so'rovlardagi
// DayField 30 kun bilan cheklangan, bu yerda esa chorak/yillik rejalar uchun cheklov yo'q).
export default function DateField({ value, onChange, placeholder }) {
  const { theme: t } = useTheme();
  const [iosOpen, setIosOpen] = useState(false);
  const minimumDate = isoToDate(todayISO());

  const open = () => {
    const current = value ? isoToDate(value) : minimumDate;
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: current,
        mode: 'date',
        minimumDate,
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
          {value ? formatDate(value) : placeholder}
        </Text>
      </TouchableOpacity>
      {Platform.OS === 'ios' && iosOpen && (
        <DateTimePicker
          value={value ? isoToDate(value) : minimumDate}
          mode="date"
          display="inline"
          minimumDate={minimumDate}
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
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  text: { fontSize: 14.5, fontWeight: '600' },
});
