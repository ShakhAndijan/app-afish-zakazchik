import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';

// Bo'lim yuklanmaganda ko'rsatiladigan xabar va "Qayta urinish" tugmasi.
export default function SectionError({ onRetry, style }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();

  return (
    <View style={[s.box, { borderColor: t.border, backgroundColor: t.card }, style]}>
      <MaterialCommunityIcons name="wifi-alert" size={22} color={t.muted} />
      <Text style={[s.text, { color: t.muted }]}>{tr('zakazchiMain.loadError')}</Text>
      {!!onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          activeOpacity={0.85}
          accessibilityRole="button"
          style={[s.btn, { backgroundColor: t.orange }]}
        >
          <MaterialCommunityIcons name="refresh" size={15} color="#fff" />
          <Text style={s.btnTxt}>{tr('common.retry')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  box: {
    paddingVertical: 22,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  text: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    marginTop: 2,
  },
  btnTxt: { color: '#fff', fontWeight: '700', fontSize: 12.5 },
});
