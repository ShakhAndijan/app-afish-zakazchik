import { View, ScrollView, Modal, TouchableOpacity, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useXizmatlarStyles } from '../styles';
import FilterPanel from './FilterPanel';

// Filtr panelini qidiruv qatori ostida ochiladigan oyna sifatida ko'rsatadi.
// `inCategory` — hero ichidagi qidiruv qatori biroz balandroq, shuning uchun siljish farq qiladi.
export default function FilterModal({ open, onClose, filters, inCategory }) {
  const { height: windowH } = useWindowDimensions();
  const { styles } = useXizmatlarStyles();

  const topOffset = inCategory ? 68 : 64;
  const maxHeight = windowH - topOffset - 56;

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.filterBackdrop} activeOpacity={1} onPress={onClose}>
        <SafeAreaView edges={['top', 'bottom']} style={{ marginTop: topOffset }}>
          <View style={{ maxHeight }} onStartShouldSetResponder={() => true}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <FilterPanel filters={filters} inCategory={inCategory} />
            </ScrollView>
          </View>
        </SafeAreaView>
      </TouchableOpacity>
    </Modal>
  );
}
