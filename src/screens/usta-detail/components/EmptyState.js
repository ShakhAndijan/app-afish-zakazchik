import { View, Text } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useUstaStyles } from '../styles';

// Bo'sh bo'lim uchun ikonka + sarlavha + (ixtiyoriy) izoh kartochkasi.
export default function EmptyState({ icon, iconSet: IconSet = MaterialCommunityIcons, title, subtitle }) {
  const { C, st } = useUstaStyles();

  return (
    <View style={[st.card, st.emptyCard]}>
      <View style={st.emptyIconWrap}>
        <IconSet name={icon} size={22} color={C.dim} />
      </View>
      <Text style={st.emptyTitle}>{title}</Text>
      {!!subtitle && <Text style={st.emptyText}>{subtitle}</Text>}
    </View>
  );
}
