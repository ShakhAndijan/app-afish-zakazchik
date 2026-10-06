import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
  Modal,
  StyleSheet,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { common } from '../styles';

export default function OptionSheet({ visible, onClose, title, options, selectedId, onSelect, t, tr }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={s.overlay} />
      </TouchableWithoutFeedback>

      <View style={[s.optionSheet, { backgroundColor: t.card, borderColor: t.border }]}>
        <View style={[common.sheetHandle, { backgroundColor: t.border, alignSelf: 'center' }]} />
        <View style={s.sheetHeaderRow}>
          <Text style={[common.modalTitle, { color: t.text }]}>{title}</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <MaterialCommunityIcons name="close" size={20} color={t.muted} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={options}
          keyExtractor={(o) => String(o.id)}
          style={{ maxHeight: 360 }}
          contentContainerStyle={{ paddingBottom: 8 }}
          ListEmptyComponent={
            <Text style={{ color: t.muted, textAlign: 'center', marginTop: 20, fontSize: 13 }}>
              {tr('newOrder.categoryEmpty')}
            </Text>
          }
          renderItem={({ item }) => {
            const selected = item.id === selectedId;
            return (
              <TouchableOpacity
                onPress={() => {
                  onSelect(item.id);
                  onClose();
                }}
                activeOpacity={0.7}
                style={common.categoryRow}
              >
                <Text style={[common.categoryRowTxt, { color: t.text }]} numberOfLines={1}>
                  {item.name}
                </Text>
                {selected && (
                  <MaterialCommunityIcons name="check-circle" size={19} color={t.orange} />
                )}
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  optionSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 8,
  },
});
