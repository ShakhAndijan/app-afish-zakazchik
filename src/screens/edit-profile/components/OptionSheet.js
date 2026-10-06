import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { s } from '../styles';
import BottomSheet from './BottomSheet';

// Bitta variantni tanlash oynasi (viloyat / tuman).
export default function OptionSheet({ visible, onClose, title, options, selectedId, onSelect, loading }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();

  return (
    <BottomSheet visible={visible} onClose={onClose} title={title}>
      {loading ? (
        <ActivityIndicator size="small" color={t.orange} style={{ marginVertical: 30 }} />
      ) : options.length === 0 ? (
        <Text style={[s.sheetEmpty, { color: t.muted }]}>{tr('editProfile.emptyOptions')}</Text>
      ) : (
        <FlatList
          data={options}
          keyExtractor={(item) => String(item.id)}
          style={{ maxHeight: 380 }}
          contentContainerStyle={{ paddingBottom: 12 }}
          ItemSeparatorComponent={() => <View style={[s.sheetDivider, { backgroundColor: t.border }]} />}
          renderItem={({ item }) => {
            const on = item.id === selectedId;
            return (
              <TouchableOpacity
                style={s.sheetRow}
                activeOpacity={0.7}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <Text style={[s.sheetRowText, { color: t.text }]}>{item.name}</Text>
                {on && <MaterialCommunityIcons name="check-circle" size={19} color={t.orange} />}
              </TouchableOpacity>
            );
          }}
        />
      )}
    </BottomSheet>
  );
}
