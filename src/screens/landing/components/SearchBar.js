import { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { COLORS } from '../../../constants/colors';
import { useLanguage } from '../../../context/LanguageContext';

// Qidiruv qatori (hozircha faqat ko'rinish — natija chiqarmaydi).
export default function SearchBar() {
  const { t } = useLanguage();
  const [text, setText] = useState('');

  return (
    <View style={styles.row}>
      <View style={styles.inner}>
        <Feather name="search" size={18} color={COLORS.gray} style={{ marginRight: 10 }} />
        <TextInput
          style={styles.input}
          placeholder={t('app.search.placeholder')}
          placeholderTextColor={COLORS.gray}
          value={text}
          onChangeText={setText}
        />
      </View>
      <TouchableOpacity style={styles.filterBtn} activeOpacity={0.8}>
        <Feather name="sliders" size={18} color={COLORS.gray} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 4,
    gap: 10,
  },
  inner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  input: { flex: 1, color: COLORS.white, fontSize: 15, padding: 0 },
  filterBtn: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
