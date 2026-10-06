import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
  Image,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function PhotoPreviewModal({ photos, previewIndex, setPreviewIndex }) {
  const { width: screenWidth } = useWindowDimensions();

  return (
    <Modal
      visible={previewIndex !== null}
      transparent
      animationType="fade"
      onRequestClose={() => setPreviewIndex(null)}
    >
      <View style={s.previewBackdrop}>
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
          <View style={s.previewHeader}>
            <Text style={s.previewCounter}>
              {previewIndex !== null ? `${previewIndex + 1}/${photos.length}` : ''}
            </Text>
            <TouchableOpacity
              onPress={() => setPreviewIndex(null)}
              style={s.previewCloseBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialCommunityIcons name="close" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
          {previewIndex !== null && (
            <FlatList
              data={photos}
              keyExtractor={(uri) => uri}
              style={{ flex: 1 }}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              initialScrollIndex={previewIndex}
              getItemLayout={(_, i) => ({
                length: screenWidth,
                offset: screenWidth * i,
                index: i,
              })}
              onMomentumScrollEnd={(e) => {
                const idx = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
                setPreviewIndex(idx);
              }}
              renderItem={({ item }) => (
                <View style={[s.previewPage, { width: screenWidth }]}>
                  <Image source={{ uri: item }} style={s.previewImg} resizeMode="contain" />
                </View>
              )}
            />
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  previewBackdrop: { flex: 1, backgroundColor: '#000' },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  previewCounter: { color: '#fff', fontSize: 14, fontWeight: '600' },
  previewCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewPage: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  previewImg: { width: '100%', height: '100%' },
});
