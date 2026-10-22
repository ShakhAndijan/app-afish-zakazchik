import { useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import { encodeImageUri } from '../utils';

// E'lon surati; rasm yo'q yoki yuklanmasa — kulrang fonda belgi.
export default function ListingPhoto({
  uri,
  style,
  iconSize = 28,
  resizeMode = 'cover',
  children,
}) {
  const { theme: t } = useTheme();
  const [failedUri, setFailedUri] = useState(null);
  const show = !!uri && failedUri !== uri;

  return (
    <View style={[s.box, { backgroundColor: t.card3 }, style]}>
      {show ? (
        <Image
          source={{ uri: encodeImageUri(uri) }}
          style={StyleSheet.absoluteFill}
          resizeMode={resizeMode}
          onError={() => setFailedUri(uri)}
        />
      ) : (
        <MaterialCommunityIcons name="image-outline" size={iconSize} color={t.faint} />
      )}
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  box: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
});
