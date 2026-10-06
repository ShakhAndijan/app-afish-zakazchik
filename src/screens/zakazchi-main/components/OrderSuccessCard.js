import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';

// Buyurtma yuborilgandan keyin bosh sahifada ko'rinadigan tasdiq kartasi.
export default function OrderSuccessCard({ order, onClose }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();

  return (
    <View
      style={[s.card, { backgroundColor: t.card, borderColor: 'rgba(31,163,124,0.35)' }]}
    >
      <View style={[s.iconWrap, { backgroundColor: '#1FA37C' }]}>
        <MaterialCommunityIcons name="check" size={18} color="#fff" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: '700', fontSize: 14, color: t.text }}>
          {tr('zakazchiMain.newOrderSuccess.title')}
        </Text>
        {!!order.category && (
          <Text style={{ fontSize: 12.5, color: t.muted, marginTop: 3 }} numberOfLines={1}>
            {order.category}
          </Text>
        )}
        {!!order.address && (
          <Text style={{ fontSize: 12, color: t.muted, marginTop: 1 }} numberOfLines={1}>
            {order.address}
          </Text>
        )}
      </View>
      <TouchableOpacity
        onPress={onClose}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
      >
        <MaterialCommunityIcons name="close" size={16} color={t.muted} />
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
