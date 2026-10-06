import { View, Text } from 'react-native';

// Ishonchlilik va VIP nishonlari qatori.
export default function BadgeRow({ badges }) {
  if (badges.length === 0) return null;

  return (
    <View style={{ flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
      {badges.map((b, i) => (
        <View
          key={i}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            backgroundColor: b.bg,
            paddingHorizontal: 11,
            paddingVertical: 7,
            borderRadius: 10,
          }}
        >
          <Text style={{ fontSize: 13 }}>{b.emoji}</Text>
          <Text style={{ fontSize: 12.5, fontWeight: '800', color: b.color }}>{b.label}</Text>
        </View>
      ))}
    </View>
  );
}
