import { View, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Avatar from '../../../components/Avatar';
import { useTheme } from '../../../context/ThemeContext';

const SIZE = 72;

// Profil rasmi: bosilsa tanlash oynasi ochiladi; yuklanayotganda aylanuvchi indikator, burchakda kamera belgisi.
export default function ProfileAvatar({ letter, uri, uploading, onPress }) {
  const { theme: t } = useTheme();

  return (
    <TouchableOpacity style={styles.wrap} activeOpacity={0.85} onPress={onPress} disabled={uploading}>
      <Avatar letter={letter} size={SIZE} bgColor={t.orange} uri={uri} />
      {uploading && (
        <View style={[styles.overlay, { borderRadius: SIZE * 0.32 }]}>
          <ActivityIndicator size="small" color="#fff" />
        </View>
      )}
      <View style={[styles.badge, { backgroundColor: t.orange, borderColor: t.cover }]}>
        <MaterialCommunityIcons name="camera" size={12} color="#fff" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'relative' },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(10,19,34,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    width: 27,
    height: 27,
    borderRadius: 14,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
