import { useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { formatWhenDate } from '../utils';
import { common } from '../styles';
import WhenOption from '../components/WhenOption';

export default function WhenSection({ when, setWhen, whenDate, setWhenDate }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const [showIosDatePicker, setShowIosDatePicker] = useState(false);

  const openWhenDatePicker = () => {
    setWhen('date');
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: whenDate || new Date(),
        mode: 'date',
        minimumDate: new Date(),
        onValueChange: (_e, selectedDate) => {
          DateTimePickerAndroid.open({
            value: whenDate || selectedDate,
            mode: 'time',
            onValueChange: (_e2, selectedTime) => {
              const combined = new Date(selectedDate);
              combined.setHours(selectedTime.getHours(), selectedTime.getMinutes());
              setWhenDate(combined);
            },
          });
        },
      });
    } else {
      setShowIosDatePicker(true);
    }
  };

  return (
    <>
      {/* ── Qachon ── */}
      <Text style={[common.label, { color: t.text }]}>{tr('newOrder.whenLabel')}</Text>
      <View style={s.whenGrid}>
        <WhenOption
          icon="lightning-bolt"
          accent
          title={tr('newOrder.when.urgent')}
          subtitle={tr('newOrder.when.urgentSubtitle')}
          active={when === 'urgent'}
          onPress={() => setWhen('urgent')}
          t={t}
        />
        <WhenOption
          icon="white-balance-sunny"
          title={tr('newOrder.when.today')}
          active={when === 'today'}
          onPress={() => setWhen('today')}
          t={t}
        />
        <WhenOption
          icon="calendar-month-outline"
          title={tr('newOrder.when.date')}
          subtitle={when === 'date' && whenDate ? formatWhenDate(whenDate) : null}
          active={when === 'date'}
          onPress={openWhenDatePicker}
          t={t}
        />
        <WhenOption
          icon="calendar-blank-outline"
          title={tr('newOrder.when.flexible')}
          subtitle={tr('newOrder.when.flexibleSubtitle')}
          active={when === 'flexible'}
          onPress={() => setWhen('flexible')}
          t={t}
        />
      </View>
      {Platform.OS === 'ios' && showIosDatePicker && (
        <DateTimePicker
          value={whenDate || new Date()}
          mode="datetime"
          minimumDate={new Date()}
          onValueChange={(_e, selectedDate) => {
            setWhenDate(selectedDate);
            setShowIosDatePicker(false);
          }}
          onDismiss={() => setShowIosDatePicker(false)}
        />
      )}
    </>
  );
}

const s = StyleSheet.create({
  whenGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
});
