import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';

// Kichik suratlar qatori sarlavha bilan. `selectedIndex` + `onSelect` berilsa — bosiladigan
// (tanlangani to'q sarg'ish hoshiyali); berilmasa — oddiy ko'rinish.
export default function PhotoThumbs({ title, photos, selectedIndex, onSelect }) {
  const { theme: t } = useTheme();
  const selectable = !!onSelect;

  return (
    <>
      <Text style={[styles.label, { color: t.text }]}>{title}</Text>
      <View style={styles.row}>
        {photos.map((uri, i) => {
          const borderColor = selectable && i === selectedIndex ? t.orange : 'transparent';
          const image = <Image source={{ uri }} style={styles.thumb} resizeMode="cover" />;
          return selectable ? (
            <TouchableOpacity
              key={i}
              onPress={() => onSelect(i)}
              activeOpacity={0.85}
              style={[styles.wrap, { borderColor }]}
            >
              {image}
            </TouchableOpacity>
          ) : (
            <View key={i} style={[styles.wrap, { borderColor }]}>
              {image}
            </View>
          );
        })}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14.5, fontWeight: '800', marginTop: 24, marginBottom: 12 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  wrap: { width: 78, height: 78, borderRadius: 12, borderWidth: 2, overflow: 'hidden' },
  thumb: { width: '100%', height: '100%' },
});
