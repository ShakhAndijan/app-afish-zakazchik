import { useState } from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';

// Bitta ish kartochkasi ichidagi rasmlar (oldingi/keyingi tugmalari va nuqtalar bilan).
export default function WorkPhotoCarousel({ photos, t, onManualNav }) {
  const [index, setIndex] = useState(0);

  if (photos.length === 0) {
    return (
      <MaterialCommunityIcons
        name="image-outline"
        size={46}
        color={t.isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.12)'}
      />
    );
  }

  const goPrev = () => {
    onManualNav?.();
    setIndex((i) => (i - 1 + photos.length) % photos.length);
  };
  const goNext = () => {
    onManualNav?.();
    setIndex((i) => (i + 1) % photos.length);
  };

  return (
    <>
      <Image source={{ uri: photos[index] }} style={s.photo} resizeMode="cover" />
      {photos.length > 1 && (
        <>
          <TouchableOpacity
            style={[s.navBtn, s.navBtnLeft]}
            onPress={goPrev}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-back" size={14} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.navBtn, s.navBtnRight]}
            onPress={goNext}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-forward" size={14} color="#fff" />
          </TouchableOpacity>
          <View style={s.photoDots}>
            {photos.map((_, i) => (
              <View
                key={i}
                style={[
                  s.photoDot,
                  { backgroundColor: i === index ? '#fff' : 'rgba(255,255,255,0.45)' },
                ]}
              />
            ))}
          </View>
        </>
      )}
    </>
  );
}

const s = StyleSheet.create({
  photo: { width: '100%', height: '100%' },
  navBtn: {
    position: 'absolute',
    top: '50%',
    marginTop: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(10,19,34,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnLeft: { left: 6 },
  navBtnRight: { right: 6 },
  photoDots: {
    position: 'absolute',
    bottom: 6,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  photoDot: { width: 4, height: 4, borderRadius: 2 },
});
