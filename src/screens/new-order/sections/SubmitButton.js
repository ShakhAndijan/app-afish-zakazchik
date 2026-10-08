import { Text, TouchableOpacity, Alert } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { common } from '../styles';

export default function SubmitButton({ ready, missing = [], onPress }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();

  // Majburiy maydonlar to'ldirilmagan bo'lsa, nimalar yetishmayotgani aytiladi.
  const handlePress = () => {
    if (ready) return onPress?.();
    Alert.alert(
      tr('newOrder.requiredTitle'),
      tr('newOrder.requiredMsg', { fields: missing.map((m) => `• ${tr(m)}`).join('\n') })
    );
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.85}
      style={[common.cta, { backgroundColor: t.orange }, !ready && { backgroundColor: t.card }]}
    >
      <Text style={[common.ctaTxt, { color: ready ? '#fff' : t.faint }]}>
        {tr('newOrder.submitCta')}
      </Text>
      <MaterialCommunityIcons name="arrow-right" size={18} color={ready ? '#fff' : t.faint} />
    </TouchableOpacity>
  );
}
