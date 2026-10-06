import { View, Text } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../../constants/colors';
import { useLanguage } from '../../../context/LanguageContext';
import { TRUST_ITEMS } from '../constants';

// Uchta ishonch nishoni: kafolat, tekshirilgan ustalar, 24/7 xizmat.
export default function TrustRow() {
  const { t } = useLanguage();

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 10,
        paddingHorizontal: 16,
      }}
    >
      {TRUST_ITEMS.map((item) => (
        <View
          key={item.key}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: COLORS.card,
            paddingHorizontal: 13,
            paddingVertical: 9,
            borderRadius: 22,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.07)',
          }}
        >
          <MaterialCommunityIcons name={item.icon} size={14} color={item.color} />
          <Text style={{ fontSize: 12, color: COLORS.white, fontWeight: '600' }}>
            {t(`app.trust.${item.key}`)}
          </Text>
        </View>
      ))}
    </View>
  );
}
