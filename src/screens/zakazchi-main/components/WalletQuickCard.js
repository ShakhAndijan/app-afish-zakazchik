import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { formatNumber } from '../../../utils/format';

// Hamyon balansi bilan tezkor kirish kartasi.
export default function WalletQuickCard({ balance, onPress }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();

  return (
    <TouchableOpacity
      style={[s.card, { overflow: 'hidden' }]}
      activeOpacity={0.9}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={tr('wallet.balanceLabel')}
    >
      <View style={s.circle} />
      <View style={s.icon}>
        <MaterialCommunityIcons name="wallet" size={20} color="#fff" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.9)' }}>
          {tr('wallet.balanceLabel')}
        </Text>
        <Text style={{ fontWeight: '800', fontSize: 17, color: '#fff', marginTop: 2 }}>
          {formatNumber(balance)}{' '}
          <Text style={{ fontSize: 11.5, fontWeight: '600', opacity: 0.85 }}>
            {tr('common.currencySom')}
          </Text>
        </Text>
      </View>
      <View style={s.btn}>
        <Text style={{ color: t.orangeD, fontWeight: '700', fontSize: 12 }}>
          {tr('profile.wallet.topup')}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    padding: 14,
    backgroundColor: '#e87a45',
    position: 'relative',
    marginBottom: 16,
  },
  circle: {
    position: 'absolute',
    right: -24,
    top: -24,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btn: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
});
