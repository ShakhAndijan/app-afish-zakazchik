import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import AfishLoader from '../components/AfishLoader';
import SectionError from './zakazchi-main/components/SectionError';
import useAddresses from './addresses/hooks/useAddresses';
import AddressCard from './addresses/components/AddressCard';
import AddressEditor from './addresses/components/AddressEditor';

export default function ZakazchiAddressesScreen({ onBack }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const { primary, extras, loading, failed, retry, savePrimary, saveExtra, removeExtra } =
    useAddresses();
  // { mode: 'primary' | 'extra', initial } — ochiq tahrirlash oynasi.
  const [editing, setEditing] = useState(null);

  const closeEditor = () => setEditing(null);

  const handleSave = async (data) => {
    if (editing.mode === 'primary') {
      await savePrimary(data);
    } else {
      saveExtra(data);
    }
    closeEditor();
  };

  const confirmDelete = (address) => {
    Alert.alert(tr('addresses.deleteTitle'), tr('addresses.deleteMessage'), [
      { text: tr('addresses.cancel'), style: 'cancel' },
      { text: tr('addresses.delete'), style: 'destructive', onPress: () => removeExtra(address.id) },
    ]);
  };

  // Asosiy manzil yo'q bo'lsa, birinchi qo'shilgan manzil asosiy bo'ladi.
  const addNew = () => setEditing({ mode: primary ? 'extra' : 'primary', initial: null });

  const isEmpty = !primary && extras.length === 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top', 'left', 'right']}>
      <StatusBar style={t.isDark ? 'light' : 'dark'} />

      <View style={s.header}>
        <TouchableOpacity
          style={[s.backBtn, { backgroundColor: t.card, borderColor: t.border }]}
          onPress={onBack}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="chevron-left" size={24} color={t.text} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: t.text }]}>{tr('addresses.headerTitle')}</Text>
      </View>

      {loading ? (
        <View style={s.center}>
          <AfishLoader size={180} />
        </View>
      ) : failed ? (
        <SectionError style={{ marginHorizontal: 20, marginTop: 24 }} onRetry={retry} />
      ) : isEmpty ? (
        <View style={s.center}>
          <View style={[s.emptyIcon, { backgroundColor: t.orange + '18' }]}>
            <MaterialCommunityIcons name="map-marker-plus-outline" size={38} color={t.orange} />
          </View>
          <Text style={[s.emptyTitle, { color: t.text }]}>{tr('addresses.emptyTitle')}</Text>
          <Text style={[s.emptySub, { color: t.muted }]}>{tr('addresses.emptySub')}</Text>
          <TouchableOpacity
            onPress={addNew}
            activeOpacity={0.85}
            style={[s.primaryBtn, { backgroundColor: t.orange }]}
          >
            <MaterialCommunityIcons name="plus" size={18} color="#fff" />
            <Text style={s.primaryBtnTxt}>{tr('addresses.addPrimary')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
        >
          {!!primary && (
            <>
              <Text style={[s.sectionTitle, { color: t.text }]}>
                {tr('addresses.primaryTitle')}
              </Text>
              <AddressCard
                address={primary}
                primary
                t={t}
                onPress={() => setEditing({ mode: 'primary', initial: primary })}
              />
            </>
          )}

          <Text style={[s.sectionTitle, { color: t.text }]}>{tr('addresses.extraTitle')}</Text>
          <View style={[s.note, { backgroundColor: t.card, borderColor: t.border }]}>
            <MaterialCommunityIcons name="cellphone-lock" size={16} color={t.muted} />
            <Text style={[s.noteTxt, { color: t.muted }]}>{tr('addresses.localNote')}</Text>
          </View>

          <View style={{ gap: 11, marginTop: 12 }}>
            {extras.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                t={t}
                onPress={() => setEditing({ mode: 'extra', initial: address })}
                onDelete={() => confirmDelete(address)}
              />
            ))}
          </View>

          <TouchableOpacity
            onPress={addNew}
            activeOpacity={0.8}
            style={[s.addBtn, { borderColor: t.orange }]}
          >
            <MaterialCommunityIcons name="plus-circle-outline" size={19} color={t.orange} />
            <Text style={[s.addBtnTxt, { color: t.orange }]}>{tr('addresses.addNew')}</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {!!editing && (
        <AddressEditor
          mode={editing.mode}
          initial={editing.initial}
          onClose={closeEditor}
          onSave={handleSave}
          t={t}
          tr={tr}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontWeight: '700', fontSize: 20 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },

  sectionTitle: { fontSize: 14.5, fontWeight: '800', marginTop: 20, marginBottom: 12 },
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  noteTxt: { flex: 1, fontSize: 12, lineHeight: 17 },

  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 14,
  },
  addBtnTxt: { fontSize: 14, fontWeight: '700' },

  emptyIcon: {
    width: 84,
    height: 84,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  emptyTitle: { fontSize: 18, fontWeight: '800' },
  emptySub: { fontSize: 13.5, lineHeight: 20, textAlign: 'center', marginTop: 8 },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 22,
    marginTop: 22,
  },
  primaryBtnTxt: { color: '#fff', fontSize: 14.5, fontWeight: '700' },
});
