import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
  useWindowDimensions,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import ListingPhoto from './ListingPhoto';

const RATIO = 0.75;

// E'lon rasmlari: surish mumkin bo'lgan galereya (bosilsa to'liq ekran ko'rinadi).
export default function ListingGallery({ photos, width }) {
  const { theme: t } = useTheme();
  const [index, setIndex] = useState(0);
  const [viewerAt, setViewerAt] = useState(null);
  const height = Math.round(width * RATIO);

  if (photos.length === 0) {
    return <ListingPhoto uri={null} iconSize={44} style={{ width, height, borderRadius: 24 }} />;
  }

  return (
    <View style={{ width, height }}>
      <FlatList
        data={photos}
        keyExtractor={(uri, i) => `${i}-${uri}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        style={{ borderRadius: 24 }}
        renderItem={({ item, index: i }) => (
          <TouchableWithoutFeedback onPress={() => setViewerAt(i)}>
            <View style={{ width, height }}>
              <ListingPhoto uri={item} style={{ width, height }} iconSize={44} />
            </View>
          </TouchableWithoutFeedback>
        )}
      />

      {photos.length > 1 && (
        <>
          <View style={s.counter}>
            <MaterialCommunityIcons name="image-multiple-outline" size={13} color="#fff" />
            <Text style={s.counterTxt}>
              {index + 1}/{photos.length}
            </Text>
          </View>
          <View style={s.dots} pointerEvents="none">
            {photos.slice(0, 10).map((_, i) => (
              <View
                key={i}
                style={[s.dot, i === index && { width: 18, backgroundColor: t.orange }]}
              />
            ))}
          </View>
        </>
      )}

      <PhotoViewer photos={photos} startAt={viewerAt} onClose={() => setViewerAt(null)} />
    </View>
  );
}

function PhotoViewer({ photos, startAt, onClose }) {
  const open = startAt != null;
  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {open && <ViewerBody photos={photos} startAt={startAt} onClose={onClose} />}
    </Modal>
  );
}

// Oyna ochilganda yangidan yaratiladi, shuning uchun sahifa raqami har safar bosilgan rasmdan boshlanadi.
function ViewerBody({ photos, startAt, onClose }) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [index, setIndex] = useState(startAt);

  return (
    <View style={s.viewer}>
      <FlatList
        data={photos}
        keyExtractor={(uri, i) => `${i}-${uri}`}
        horizontal
        pagingEnabled
        initialScrollIndex={startAt}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableWithoutFeedback onPress={onClose}>
            <View style={{ width, height }}>
              <ListingPhoto
                uri={item}
                resizeMode="contain"
                style={{ width, height, backgroundColor: '#000' }}
              />
            </View>
          </TouchableWithoutFeedback>
        )}
      />
      <TouchableOpacity
        onPress={onClose}
        activeOpacity={0.8}
        accessibilityRole="button"
        style={[s.close, { top: insets.top + 10 }]}
      >
        <MaterialCommunityIcons name="close" size={22} color="#fff" />
      </TouchableOpacity>
      {photos.length > 1 && (
        <Text style={[s.viewerCount, { bottom: insets.bottom + 18 }]}>
          {index + 1} / {photos.length}
        </Text>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  counter: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(12,24,40,0.6)',
  },
  counterTxt: { color: '#fff', fontSize: 12, fontWeight: '700' },
  dots: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.65)' },
  viewer: { flex: 1, backgroundColor: '#000' },
  close: {
    position: 'absolute',
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewerCount: {
    position: 'absolute',
    alignSelf: 'center',
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
});
