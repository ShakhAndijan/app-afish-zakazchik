import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { formatNumber } from '../../../utils/format';

// Hamyon kartochkasi: balans, "To'ldirish" tugmasi va sodiqlik darajasi.
// Diqqat: sodiqlik bloki (daraja va 70%) hozircha qattiq yozilgan, backendda bunday ma'lumot yo'q.
export default function WalletCard({ balance, onPress }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();

  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
      <TouchableOpacity style={[styles.card, { overflow: 'hidden' }]} activeOpacity={0.9} onPress={onPress}>
        <View style={styles.circle} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={styles.icon}>
            <MaterialCommunityIcons name="wallet" size={22} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.9)' }}>{tr('profile.wallet.title')}</Text>
            <Text style={{ fontWeight: '800', fontSize: 20, color: '#fff', marginTop: 2 }}>
              {formatNumber(balance)}{' '}
              <Text style={{ fontSize: 12, fontWeight: '600', opacity: 0.85 }}>{tr('common.currencySom')}</Text>
            </Text>
          </View>
          <TouchableOpacity style={styles.topupBtn} activeOpacity={0.8} onPress={onPress}>
            <Text style={{ color: t.orangeD, fontWeight: '700', fontSize: 12.5 }}>{tr('profile.wallet.topup')}</Text>
          </TouchableOpacity>
        </View>

        {/* Sodiqlik progressi */}
        <View style={styles.loyalty}>
          <View style={styles.loyaltyHead}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="star" size={14} color="#fff" />
              <Text style={{ fontSize: 12.5, fontWeight: '700', color: '#fff' }}>
                {tr('profile.loyalty.silverCustomer')}
              </Text>
            </View>
            <Text style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.9)' }}>{tr('profile.loyalty.toNextLevel')}</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: '70%' }]} />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: '#e87a45',
    position: 'relative',
  },
  circle: {
    position: 'absolute',
    right: -24,
    top: -24,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topupBtn: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  loyalty: {
    marginTop: 15,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  loyaltyHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTrack: {
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 4, backgroundColor: '#fff' },
});
