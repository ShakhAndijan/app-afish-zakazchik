import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { MAX_PHOTOS } from '../constants';
import { common } from '../styles';

export default function PhotosSection({ photos, pickPhotos, removePhoto, setPreviewIndex }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();

  return (
    <>
      {/* ── Rasmlar ── */}
      <Text style={[common.label, { color: t.text }]}>{tr('newOrder.photosLabel')}</Text>
      <Text style={[common.hint, { color: t.muted }]}>{tr('newOrder.photosHint')}</Text>
      <View style={s.photoGrid}>
        {photos.map((uri, index) => (
          <TouchableOpacity
            key={uri}
            style={s.photoTile}
            activeOpacity={0.85}
            onPress={() => setPreviewIndex(index)}
          >
            <Image source={{ uri }} style={s.photoTileImg} />
            <TouchableOpacity
              onPress={() => removePhoto(uri)}
              activeOpacity={0.8}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              style={s.photoRemoveBtn}
            >
              <MaterialCommunityIcons name="close" size={12} color="#fff" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
        {photos.length < MAX_PHOTOS && (
          <TouchableOpacity
            onPress={pickPhotos}
            activeOpacity={0.8}
            style={[s.photoAddTile, { backgroundColor: t.card, borderColor: t.border }]}
          >
            <MaterialCommunityIcons name="camera-plus-outline" size={22} color={t.orange} />
            <Text style={[s.photoAddTxt, { color: t.muted }]}>
              {photos.length}/{MAX_PHOTOS}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </>
  );
}

const s = StyleSheet.create({
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  photoTile: { width: '22%', aspectRatio: 1, borderRadius: 12, overflow: 'hidden' },
  photoTileImg: { width: '100%', height: '100%' },
  photoRemoveBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoAddTile: {
    width: '22%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  photoAddTxt: { fontSize: 11, fontWeight: '600' },
});
