import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Feather from '@expo/vector-icons/Feather';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';

// Yuqori panel: orqaga, sarlavha va ulashish.
export default function WorkDetailHeader({ onBack, onShare }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();

  return (
    <View style={[styles.header, { backgroundColor: t.bg }]}>
      <TouchableOpacity
        style={[styles.iconBtn, { backgroundColor: t.card, borderColor: t.border }]}
        onPress={onBack}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="chevron-left" size={24} color={t.text} />
      </TouchableOpacity>
      <Text style={[styles.title, { color: t.text }]} numberOfLines={1}>
        {tr('workDetail.headerTitle')}
      </Text>
      <TouchableOpacity
        style={[styles.iconBtn, { backgroundColor: t.card, borderColor: t.border }]}
        onPress={onShare}
        activeOpacity={0.8}
      >
        <Feather name="share-2" size={18} color={t.text} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', marginHorizontal: 8 },
});
