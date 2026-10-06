import { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Modal, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { common } from '../styles';

export default function CategoryPickerModal({
  visible,
  onClose,
  categories,
  selectedIds,
  onToggle,
  t,
  tr,
}) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => c.name?.toLowerCase().includes(q));
  }, [categories, search]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={s.modalBackdrop}>
        <View style={[s.modalSheet, { backgroundColor: t.bg }]}>
          <View style={s.modalHeader}>
            <Text style={[common.modalTitle, { color: t.text }]}>
              {tr('newOrder.categoryPickerTitle')}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <MaterialCommunityIcons name="close" size={22} color={t.muted} />
            </TouchableOpacity>
          </View>

          <View style={[s.searchBox, { backgroundColor: t.card, borderColor: t.border }]}>
            <MaterialCommunityIcons name="magnify" size={18} color={t.faint} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder={tr('newOrder.categorySearchPlaceholder')}
              placeholderTextColor={t.faint}
              style={[s.searchInput, { color: t.text }]}
            />
          </View>

          <FlatList
            data={filtered}
            keyExtractor={(c) => String(c.id)}
            contentContainerStyle={{ paddingBottom: 12 }}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <Text style={{ color: t.muted, textAlign: 'center', marginTop: 24, fontSize: 13 }}>
                {tr('newOrder.categoryEmpty')}
              </Text>
            }
            renderItem={({ item: c }) => {
              const selected = selectedIds.includes(c.id);
              return (
                <TouchableOpacity
                  onPress={() => onToggle(c.id)}
                  activeOpacity={0.7}
                  style={common.categoryRow}
                >
                  <MaterialCommunityIcons
                    name={selected ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
                    size={22}
                    color={selected ? t.orange : t.faint}
                  />
                  <Text style={[common.categoryRowTxt, { color: t.text }]} numberOfLines={1}>
                    {c.name}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />

          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.85}
            style={[common.modalDoneBtn, { backgroundColor: t.orange }]}
          >
            <Text style={common.modalDoneTxt}>
              {tr('newOrder.categoryDone', { n: selectedIds.length })}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    height: '78%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 14, padding: 0 },
});
