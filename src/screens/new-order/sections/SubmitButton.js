import { Text, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { common } from '../styles';

export default function SubmitButton({ ready, onPress }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();

  return (
    <TouchableOpacity
      onPress={ready ? onPress : undefined}
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
