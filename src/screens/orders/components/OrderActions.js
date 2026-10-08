import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Feather from '@expo/vector-icons/Feather';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';

// Pastki tugma: faol buyurtmada (kutilmoqda / kelishilmoqda / jarayonda) — bekor qilish,
// yakunlangan yoki bekor qilingan buyurtmada — qayta buyurtma berish.
export default function OrderActions({ isOpen, onCancel, onReorder }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();

  if (isOpen) {
    return (
      <TouchableOpacity
        style={[s.cancel, { borderColor: t.red + '66', backgroundColor: t.red + '10' }]}
        activeOpacity={0.8}
        onPress={onCancel}
        accessibilityRole="button"
      >
        <MaterialCommunityIcons name="close-circle-outline" size={19} color={t.red} />
        <Text style={[s.cancelText, { color: t.red }]}>{tr('requests.cancelOrder')}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[s.reorder, { backgroundColor: t.orange }]}
      activeOpacity={0.85}
      onPress={onReorder}
      accessibilityRole="button"
    >
      <Feather name="repeat" size={15} color="#fff" />
      <Text style={s.reorderText}>{tr('orderDetail.reorder')}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  cancel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  cancelText: { fontWeight: '800', fontSize: 14.5 },
  reorder: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    height: 52,
    borderRadius: 16,
  },
  reorderText: { color: '#fff', fontWeight: '800', fontSize: 14.5 },
});
