import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import ProfileAvatar from './ProfileAvatar';
import ProfileInfo from './ProfileInfo';
import ThemeToggleButton from './ThemeToggleButton';
import ActivityStats from './ActivityStats';

// Profil ekranining tepa qismi: rasm, ma'lumot, mavzu tugmasi va faollik ko'rsatkichlari.
export default function ProfileCover({
  letter,
  avatarUri,
  avatarUploading,
  onAvatarPress,
  name,
  phone,
  location,
  stats,
  onEdit,
}) {
  const { theme: t } = useTheme();

  return (
    <View style={[styles.cover, { backgroundColor: t.cover }]}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14 }}>
        <ProfileAvatar letter={letter} uri={avatarUri} uploading={avatarUploading} onPress={onAvatarPress} />
        <ProfileInfo name={name} phone={phone} location={location} onEdit={onEdit} />
        <ThemeToggleButton />
      </View>
      <ActivityStats stats={stats} />
    </View>
  );
}

const styles = StyleSheet.create({
  cover: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 22 },
});
