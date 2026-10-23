import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { formatWhenDate } from '../utils';
import { common } from '../styles';
import OptionSheet from '../components/OptionSheet';
import ToggleSwitch from '../components/ToggleSwitch';

// "Qachon kerak?": bitta maydon, odatda "Bugun". Bosilganda boshqa variant tanlanadi
// (sana / erkin), "Shoshilinch" esa shu kartaning ichidagi alohida tugma.
export default function WhenSection({ when, setWhen, whenDate, setWhenDate }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const [showIosDatePicker, setShowIosDatePicker] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Sana faqat tanlab bo'lingach o'rnatiladi: oyna yopilsa, oldingi tanlov saqlanib qoladi.
  const applyDate = (date) => {
    setWhenDate(date);
    setWhen('date');
  };

  const openWhenDatePicker = () => {
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
              applyDate(combined);
            },
          });
        },
      });
    } else {
      setShowIosDatePicker(true);
    }
  };

  const options = [
    { id: 'today', name: tr('newOrder.when.today') },
    { id: 'date', name: tr('newOrder.when.date') },
    {
      id: 'flexible',
      name: `${tr('newOrder.when.flexible')} · ${tr('newOrder.when.flexibleSubtitle')}`,
    },
  ];

  const onSelect = (id) => {
    if (id === 'date') openWhenDatePicker();
    else setWhen(id);
  };

  const urgent = when === 'urgent';
  const valueText =
    when === 'date' && whenDate
      ? formatWhenDate(whenDate)
      : when === 'flexible'
        ? tr('newOrder.when.flexible')
        : tr('newOrder.when.today');
  const subText =
    urgent || when === 'today' || !when
      ? null
      : when === 'flexible'
        ? tr('newOrder.when.flexibleSubtitle')
        : null;

  return (
    <>
      {/* ── Qachon ── */}
      <Text style={[common.label, { color: t.text }]}>
        {tr('newOrder.whenLabel')}
        <Text style={{ color: t.red }}> *</Text>
      </Text>

      <View
        style={[s.card, { backgroundColor: t.card, borderColor: urgent ? t.orange : t.border }]}
      >
        <TouchableOpacity
          onPress={() => setSheetOpen(true)}
          activeOpacity={0.7}
          accessibilityRole="button"
          style={s.field}
        >
          <View style={[s.icon, { backgroundColor: t.orange + '1f' }]}>
            <MaterialCommunityIcons
              name={when === 'date' ? 'calendar-month-outline' : 'white-balance-sunny'}
              size={20}
              color={t.orange}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.value, { color: t.text }]} numberOfLines={1}>
              {valueText}
            </Text>
            {!!subText && (
              <Text style={[s.sub, { color: t.muted }]} numberOfLines={1}>
                {subText}
              </Text>
            )}
          </View>
          <Text style={[s.change, { color: t.orange }]}>{tr('newOrder.when.change')}</Text>
          <MaterialCommunityIcons name="chevron-right" size={18} color={t.faint} />
        </TouchableOpacity>

        <View style={[s.divider, { backgroundColor: t.border }]} />

        <View style={s.urgentRow}>
          <MaterialCommunityIcons name="lightning-bolt" size={20} color={t.orange} />
          <View style={{ flex: 1 }}>
            <Text style={[s.urgentTitle, { color: t.text }]}>{tr('newOrder.when.urgent')}</Text>
            <Text style={[s.sub, { color: t.muted }]} numberOfLines={2}>
              {tr('newOrder.when.urgentSubtitle')}
            </Text>
          </View>
          <ToggleSwitch value={urgent} onChange={(on) => setWhen(on ? 'urgent' : 'today')} t={t} />
        </View>
      </View>

      <OptionSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={tr('newOrder.whenLabel')}
        options={options}
        selectedId={urgent ? null : when}
        onSelect={onSelect}
        t={t}
        tr={tr}
      />

      {Platform.OS === 'ios' && showIosDatePicker && (
        <DateTimePicker
          value={whenDate || new Date()}
          mode="datetime"
          minimumDate={new Date()}
          onValueChange={(_e, selectedDate) => {
            applyDate(selectedDate);
            setShowIosDatePicker(false);
          }}
          onDismiss={() => setShowIosDatePicker(false)}
        />
      )}
    </>
  );
}

const s = StyleSheet.create({
  card: { borderWidth: 1.5, borderRadius: 16, overflow: 'hidden' },
  field: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  value: { fontSize: 15, fontWeight: '800' },
  sub: { fontSize: 12, marginTop: 2, lineHeight: 16 },
  change: { fontSize: 13, fontWeight: '700' },
  divider: { height: 1 },
  urgentRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  urgentTitle: { fontSize: 14, fontWeight: '700' },
});
