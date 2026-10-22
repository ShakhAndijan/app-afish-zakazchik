import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Feather from '@expo/vector-icons/Feather';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';

// Pastki tugma: faol buyurtmada (kutilmoqda / kelishilmoqda / jarayonda) — bekor qilish,
// yakunlangan yoki bekor qilingan buyurtmada — qayta buyurtma berish. Bekor qilingan buyurtmada
// (`onRepost` berilsa) saytdagidek "Qayta e'lon qilish" ham chiqadi: o'sha buyurtmaning o'zi ommaga chiqadi.
export default function OrderActions({ isOpen, onCancel, onReorder, onRepost }) {
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
    <>
      {!!onRepost && (
        <TouchableOpacity
          style={[s.reorder, { backgroundColor: t.orange }]}
          activeOpacity={0.85}
          onPress={onRepost}
          accessibilityRole="button"
        >
          <MaterialCommunityIcons name="bullhorn-outline" size={17} color="#fff" />
          <Text style={s.reorderText}>{tr('orderFlow.stage.repost')}</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={[
          s.reorder,
          onRepost
            ? { backgroundColor: t.card, borderWidth: 1.5, borderColor: t.border, marginTop: 12 }
            : { backgroundColor: t.orange },
        ]}
        activeOpacity={0.85}
        onPress={onReorder}
        accessibilityRole="button"
      >
        <Feather name="repeat" size={15} color={onRepost ? t.text : '#fff'} />
        <Text style={[s.reorderText, onRepost && { color: t.text }]}>
          {tr('orderDetail.reorder')}
        </Text>
      </TouchableOpacity>
    </>
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
