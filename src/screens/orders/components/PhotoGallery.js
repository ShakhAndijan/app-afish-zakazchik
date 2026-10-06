import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

const HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 };

// Android'dagi Image kodlanmagan "+" belgisini URL'da noto'g'ri talqin qilib,
// rasmni yuklolmasligi mumkin — shu sababli xavfsiz kodlaymiz.
const toImgSource = (uri) => ({ uri: uri ? uri.replace(/\+/g, '%2B') : uri });

// Asosiy rasm + kichik rasmlar (thumbnail). "Oldin" va "keyin" to'plamlari uchun alohida ishlatiladi.
export default function PhotoGallery({ photos, index, onIndexChange, t, height = 200 }) {
  const goPrev = () => onIndexChange((index - 1 + photos.length) % photos.length);
  const goNext = () => onIndexChange((index + 1) % photos.length);

  return (
    <View>
      <View style={[s.imgWrap, { height }]}>
        <Image source={toImgSource(photos[index])} style={s.img} resizeMode="cover" />
        {photos.length > 1 && (
          <>
            <TouchableOpacity style={[s.navBtn, s.navLeft]} onPress={goPrev} hitSlop={HIT_SLOP}>
              <Ionicons name="chevron-back" size={16} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={[s.navBtn, s.navRight]} onPress={goNext} hitSlop={HIT_SLOP}>
              <Ionicons name="chevron-forward" size={16} color="#fff" />
            </TouchableOpacity>
            <View style={s.counter}>
              <Text style={s.counterText}>
                {index + 1}/{photos.length}
              </Text>
            </View>
          </>
        )}
      </View>
      {photos.length > 1 && (
        <View style={s.thumbRow}>
          {photos.map((photo, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => onIndexChange(i)}
              activeOpacity={0.85}
              style={[s.thumbWrap, { borderColor: i === index ? t.orange : 'transparent' }]}
            >
              <Image source={toImgSource(photo)} style={s.thumb} resizeMode="cover" />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  imgWrap: { width: '100%', borderRadius: 16, overflow: 'hidden', position: 'relative' },
  img: { width: '100%', height: '100%' },
  navBtn: {
    position: 'absolute',
    top: '50%',
    marginTop: -15,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(10,19,34,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLeft: { left: 10 },
  navRight: { right: 10 },
  counter: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(10,19,34,0.72)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },
  counterText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  thumbRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  thumbWrap: { width: 62, height: 62, borderRadius: 11, borderWidth: 2, overflow: 'hidden' },
  thumb: { width: '100%', height: '100%' },
});
