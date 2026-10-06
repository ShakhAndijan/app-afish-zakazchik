import { View, TouchableOpacity, StyleSheet } from 'react-native';

export default function ToggleSwitch({ value, onChange, t }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onChange(!value)}
      style={[
        s.toggleTrack,
        { backgroundColor: value ? t.orange : t.isDark ? 'rgba(255,255,255,0.14)' : '#E4E6EA' },
      ]}
    >
      <View style={[s.toggleThumb, { transform: [{ translateX: value ? 20 : 2 }] }]} />
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  toggleTrack: { width: 46, height: 26, borderRadius: 13, justifyContent: 'center' },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});
