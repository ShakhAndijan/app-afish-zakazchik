import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { s } from '../styles';
import { pad2, daysInMonth, parseIsoDate } from '../utils';
import BottomSheet from './BottomSheet';

// G'ildirakning bitta ustuni (kun / oy / yil).
function DateColumn({ values, value, onChange, format }) {
  const { theme: t } = useTheme();
  const idx = Math.max(0, values.indexOf(value));

  return (
    <FlatList
      data={values}
      keyExtractor={(v) => String(v)}
      style={{ flex: 1 }}
      showsVerticalScrollIndicator={false}
      initialScrollIndex={idx}
      getItemLayout={(_, i) => ({ length: 40, offset: 40 * i, index: i })}
      renderItem={({ item }) => {
        const selected = item === value;
        return (
          <TouchableOpacity style={s.dateCell} onPress={() => onChange(item)} activeOpacity={0.7}>
            <Text
              style={[
                s.dateCellText,
                { color: selected ? t.orange : t.muted, fontWeight: selected ? '700' : '400' },
              ]}
            >
              {format ? format(item) : item}
            </Text>
          </TouchableOpacity>
        );
      }}
    />
  );
}

// Tug'ilgan sana tanlash oynasi. `value`/`onChange` — "YYYY-MM-DD" ko'rinishida.
export default function BirthDateSheet({ visible, onClose, value, onChange }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const monthNames = tr('login.registerStep.birthDate.months');
  const currentYear = new Date().getFullYear();
  const parsed = parseIsoDate(value);
  const [day, setDay] = useState(parsed?.day ?? 1);
  const [month, setMonth] = useState(parsed?.month ?? 1);
  const [year, setYear] = useState(parsed?.year ?? currentYear - 25);

  // Oyna har ochilganda joriy qiymatdan boshlanadi.
  useEffect(() => {
    if (visible) {
      const p = parseIsoDate(value);
      setDay(p?.day ?? 1);
      setMonth(p?.month ?? 1);
      setYear(p?.year ?? currentYear - 25);
    }
  }, [visible]);

  const days = Array.from({ length: daysInMonth(year, month) }, (_, i) => i + 1);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from({ length: currentYear - 1940 + 1 }, (_, i) => currentYear - i);

  // Oy/yil o'zgarganda kun oyning oxirgi kunidan oshib ketmasligi kerak (31 → 28/30).
  const changeMonth = (m) => {
    setMonth(m);
    if (day > daysInMonth(year, m)) setDay(daysInMonth(year, m));
  };
  const changeYear = (y) => {
    setYear(y);
    if (day > daysInMonth(y, month)) setDay(daysInMonth(y, month));
  };

  const confirm = () => {
    onChange(`${year}-${pad2(month)}-${pad2(day)}`);
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title={tr('editProfile.birthDateLabel')}>
      <View style={s.dateWheelWrap}>
        <View style={[s.dateHighlight, { backgroundColor: t.rowIconBg }]} pointerEvents="none" />
        <DateColumn values={days} value={day} onChange={setDay} />
        <DateColumn values={months} value={month} onChange={changeMonth} format={(m) => monthNames[m - 1]} />
        <DateColumn values={years} value={year} onChange={changeYear} />
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 6 }}>
        <TouchableOpacity
          style={[s.confirmBtn, { backgroundColor: t.orange }]}
          activeOpacity={0.85}
          onPress={confirm}
        >
          <Text style={s.confirmBtnText}>{tr('common.confirm')}</Text>
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
}
