import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

export default function OrdersTabs({ tabs, active, onChange, counts, t }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.row}
    >
      {tabs.map((tb) => {
        const isActive = tb.key === active;
        return (
          <TouchableOpacity
            key={tb.key}
            onPress={() => onChange(tb.key)}
            activeOpacity={0.8}
            style={[
              s.btn,
              {
                backgroundColor: isActive ? tb.color : t.card,
                borderColor: isActive ? tb.color : t.border,
              },
            ]}
          >
            <Text style={[s.label, { color: isActive ? '#fff' : t.muted }]}>{tb.label}</Text>
            <View
              style={[
                s.badge,
                { backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.06)' },
              ]}
            >
              <Text style={[s.badgeText, { color: isActive ? '#fff' : t.faint }]}>
                {counts[tb.key]}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  row: { paddingHorizontal: 16, paddingVertical: 14, gap: 8 },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    height: 34,
    gap: 7,
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  label: { fontWeight: '700', fontSize: 13 },
  badge: { borderRadius: 10, paddingHorizontal: 7, paddingVertical: 1 },
  badgeText: { fontSize: 11, fontWeight: '700' },
});
