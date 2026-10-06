import { Text, FlatList, Modal, TouchableOpacity, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { useLanguage } from '../../../context/LanguageContext';
import { useXizmatlarStyles } from '../styles';

// Pastdan chiqadigan viloyat/tuman tanlash oynasi (`filters.pickerFor` = 'region' | 'district').
export default function RegionPickerSheet({ filters }) {
  const { t: tr } = useLanguage();
  const { t, styles } = useXizmatlarStyles();
  const { pickerFor, setPickerFor, regions, districts, region, district, pickRegion, pickDistrict } = filters;
  const isRegion = pickerFor === 'region';
  const close = () => setPickerFor(null);

  return (
    <Modal visible={!!pickerFor} transparent animationType="slide" onRequestClose={close}>
      <TouchableOpacity style={styles.sheetOverlay} activeOpacity={1} onPress={close}>
        <View style={styles.sheet} onStartShouldSetResponder={() => true}>
          <Text style={styles.sheetTitle}>
            {isRegion ? tr('xizmatlar.filters.regionSelect') : tr('xizmatlar.filters.district')}
          </Text>
          <FlatList
            data={isRegion ? regions : districts}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => {
              const active = isRegion ? region === item.id : district === item.id;
              return (
                <TouchableOpacity
                  style={styles.sheetRow}
                  onPress={() => (isRegion ? pickRegion(item) : pickDistrict(item))}
                >
                  <Text style={[styles.sheetRowText, active && styles.sheetRowTextActive]}>{item.name}</Text>
                  {active && <Feather name="check" size={16} color={t.orange} />}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
