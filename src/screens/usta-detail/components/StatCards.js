import { View, Text } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useUstaStyles } from '../styles';

// 2–3 ta statistika katagi (tajriba, qayta chaqiruv, bajarilgan ishlar...).
export default function StatCards({ items }) {
  const { C, st } = useUstaStyles();
  if (items.length === 0) return null;

  return (
    <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
      {items.map((s, i) => (
        <View key={i} style={[st.card, { flex: 1, alignItems: 'center', paddingVertical: 13 }]}>
          <MaterialCommunityIcons name={s.icon} size={17} color={s.color} style={{ marginBottom: 5 }} />
          <Text style={{ fontSize: 17, fontWeight: '800', color: C.txt }}>{s.value}</Text>
          <Text style={{ fontSize: 11.5, color: C.dim, marginTop: 2, textAlign: 'center' }}>
            {s.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
