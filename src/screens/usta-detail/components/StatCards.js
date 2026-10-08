import { View, Text } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useUstaStyles } from '../styles';

// Statistika (tajriba, qayta chaqiruv, bajarilgan ishlar...): gradient kartaning pastiga
// suzib turuvchi bitta karta, ustunlar ingichka chiziq bilan ajratilgan.
export default function StatCards({ items }) {
  const { C, st } = useUstaStyles();
  if (items.length === 0) return null;

  return (
    <View style={st.statsCard}>
      {items.map((s, i) => (
        <View key={i} style={[st.statCol, i > 0 && st.statColDivider]}>
          <View style={[st.statIcon, { backgroundColor: s.color + '1f' }]}>
            <MaterialCommunityIcons name={s.icon} size={16} color={s.color} />
          </View>
          <Text style={{ fontSize: 17, fontWeight: '800', color: C.txt, marginTop: 6 }}>
            {s.value}
          </Text>
          <Text style={{ fontSize: 11.5, color: C.dim, marginTop: 1, textAlign: 'center' }}>
            {s.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
