import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';

// Bo'lim sarlavhasi. `onActionPress` berilsa o'ng tomondagi matn bosiladigan havola
// (to'q sariq) bo'ladi, aks holda oddiy yordamchi yozuv (kulrang).
export default function SectionHeader({ title, actionLabel, onActionPress, style }) {
  const { theme: t } = useTheme();

  return (
    <View style={[s.row, style]}>
      <Text style={[s.title, { color: t.text }]}>{title}</Text>
      {!!actionLabel &&
        (onActionPress ? (
          <TouchableOpacity activeOpacity={0.7} onPress={onActionPress} accessibilityRole="button">
            <Text style={[s.action, { color: t.orange }]}>{actionLabel}</Text>
          </TouchableOpacity>
        ) : (
          <Text style={[s.action, { color: t.muted }]}>{actionLabel}</Text>
        ))}
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 13,
  },
  title: { fontWeight: '700', fontSize: 16.5 },
  action: { fontSize: 12.5, fontWeight: '600' },
});
