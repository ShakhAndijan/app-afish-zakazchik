import { View, Text } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useUstaStyles } from '../styles';

// Bo'lim sarlavhasi: rangli ikonka + matn (+ o'ng tomonda ixtiyoriy element).
export default function SectionTitle({ icon, title, right, style }) {
  const { C, st } = useUstaStyles();

  return (
    <View style={[st.secRow, style]}>
      <View style={st.secIcon}>
        <MaterialCommunityIcons name={icon} size={16} color={C.orange} />
      </View>
      <Text style={st.secTitleTxt}>{title}</Text>
      {right}
    </View>
  );
}
