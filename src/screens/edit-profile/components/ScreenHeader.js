import { View, Text, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { s } from '../styles';

// Orqaga tugmasi va sarlavha.
export default function ScreenHeader({ onBack }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();

  return (
    <View style={[s.header, { backgroundColor: t.bg }]}>
      <TouchableOpacity
        style={[s.backBtn, { backgroundColor: t.card, borderColor: t.border }]}
        onPress={onBack}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="chevron-left" size={24} color={t.text} />
      </TouchableOpacity>
      <Text style={[s.headerTitle, { color: t.text }]}>{tr('editProfile.headerTitle')}</Text>
    </View>
  );
}
