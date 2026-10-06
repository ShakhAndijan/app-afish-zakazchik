import { View, Text, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';

// Manzil kiritilmagan bo'lsa, profilni to'ldirishga chaqiruvchi banner.
export default function IncompleteProfileBanner({ onPress }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();

  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: t.card,
          borderWidth: 1,
          borderColor: t.border,
          borderRadius: 16,
          padding: 14,
          gap: 12,
        }}
        activeOpacity={0.8}
        onPress={onPress}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: t.orange + '1c',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialCommunityIcons name="map-marker-alert-outline" size={20} color={t.orange} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: '700', fontSize: 13.5, color: t.text }}>
            {tr('profile.incompleteBanner.title')}
          </Text>
          <Text style={{ fontSize: 12, color: t.muted, marginTop: 2 }}>
            {tr('profile.incompleteBanner.subtitle')}
          </Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color={t.faint} />
      </TouchableOpacity>
    </View>
  );
}
