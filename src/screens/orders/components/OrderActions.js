import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Feather from '@expo/vector-icons/Feather';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';

// Pastki tugmalar: "Qayta buyurtma" va shikoyat. Hozircha ikkalasi ham hech narsa qilmaydi.
export default function OrderActions() {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();

  return (
    <View style={s.row}>
      <TouchableOpacity style={[s.reorder, { backgroundColor: t.orange }]} activeOpacity={0.8}>
        <Feather name="repeat" size={14} color="#fff" />
        <Text style={s.reorderText}>{tr('orderDetail.reorder')}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[s.flag, { backgroundColor: 'rgba(224,71,58,0.13)' }]} activeOpacity={0.8}>
        <MaterialCommunityIcons name="flag-outline" size={16} color={t.red} />
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, marginTop: 24 },
  reorder: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
    borderRadius: 14,
  },
  reorderText: { color: '#fff', fontWeight: '700', fontSize: 13.5 },
  flag: {
    width: 46,
    height: 46,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
