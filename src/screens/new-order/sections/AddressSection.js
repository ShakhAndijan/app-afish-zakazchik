import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { common } from '../styles';

export default function AddressSection({
  hasAddress,
  setAddressModalOpen,
  addressTitle,
  addressSubtitle,
  savedAddress,
  onUseSaved,
  onDismissSaved,
}) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();

  return (
    <>
      {/* ── Manzil ── */}
      <Text style={[common.label, { color: t.text }]}>
        {tr('newOrder.locationLabel')}
        <Text style={{ color: t.red }}> *</Text>
      </Text>
      {hasAddress ? (
        <TouchableOpacity
          onPress={() => setAddressModalOpen(true)}
          activeOpacity={0.85}
          style={[s.addressCard, { backgroundColor: t.card, borderColor: t.border }]}
        >
          <MaterialCommunityIcons name="map-marker" size={20} color={t.orange} />
          <View style={{ flex: 1 }}>
            <Text style={[s.addressCardTitle, { color: t.text }]} numberOfLines={1}>
              {addressTitle}
            </Text>
            {!!addressSubtitle && (
              <Text style={[s.addressCardSub, { color: t.muted }]} numberOfLines={1}>
                {addressSubtitle}
              </Text>
            )}
          </View>
          <MaterialCommunityIcons name="chevron-right" size={20} color={t.faint} />
        </TouchableOpacity>
      ) : (
        <>
          {/* Profilda saqlangan manzil bor bo'lsa: shu manzilga berishni so'raydi. */}
          {!!savedAddress && (
            <View style={[s.savedCard, { backgroundColor: t.card, borderColor: t.orange }]}>
              <Text style={[s.savedAsk, { color: t.muted }]}>{tr('newOrder.savedAddressAsk')}</Text>
              <View style={s.savedRow}>
                <MaterialCommunityIcons name="map-marker" size={20} color={t.orange} />
                <View style={{ flex: 1 }}>
                  <Text style={[s.addressCardTitle, { color: t.text }]} numberOfLines={2}>
                    {savedAddress.title}
                  </Text>
                  {!!savedAddress.subtitle && (
                    <Text style={[s.addressCardSub, { color: t.muted }]} numberOfLines={2}>
                      {savedAddress.subtitle}
                    </Text>
                  )}
                </View>
              </View>
              <View style={s.savedBtns}>
                <TouchableOpacity
                  onPress={onUseSaved}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  style={[s.savedBtn, { backgroundColor: t.orange, borderColor: t.orange }]}
                >
                  <Text style={[s.savedBtnTxt, { color: '#fff' }]}>
                    {tr('newOrder.savedAddressYes')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={onDismissSaved}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  style={[s.savedBtn, { borderColor: t.border }]}
                >
                  <Text style={[s.savedBtnTxt, { color: t.text }]}>
                    {tr('newOrder.savedAddressNo')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          {!savedAddress && (
            <TouchableOpacity
              onPress={() => setAddressModalOpen(true)}
              activeOpacity={0.8}
              style={[common.addChip, { borderColor: t.orange, alignSelf: 'flex-start' }]}
            >
              <MaterialCommunityIcons name="map-marker-plus-outline" size={16} color={t.orange} />
              <Text style={[common.addChipTxt, { color: t.orange }]}>
                {tr('newOrder.addressAddBtn')}
              </Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </>
  );
}

const s = StyleSheet.create({
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  savedCard: { borderWidth: 1.5, borderRadius: 14, padding: 14, gap: 10 },
  savedAsk: { fontSize: 12.5, fontWeight: '600' },
  savedRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  savedBtns: { flexDirection: 'row', gap: 10 },
  savedBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  savedBtnTxt: { fontSize: 13.5, fontWeight: '700' },
  addressCardTitle: { fontSize: 14, fontWeight: '700' },
  addressCardSub: { fontSize: 12.5, marginTop: 2 },
});
