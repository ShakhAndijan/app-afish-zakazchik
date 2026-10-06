import { View, Text } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { useUser } from '../../../context/UserContext';
import Avatar from '../../../components/Avatar';

// Bosh sahifa sarlavhasi: manzil, salomlashuv va avatar.
export default function HomeHeader() {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const { user } = useUser();

  const name = user?.first_name || user?.last_name || '';
  const location = [user?.region, user?.district].filter(Boolean).join(', ');

  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flex: 1, marginRight: 12 }}>
          {!!location && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <MaterialCommunityIcons name="map-marker" size={13} color={t.orange} />
              <Text style={{ fontSize: 12, color: t.muted }} numberOfLines={1}>
                {location}
              </Text>
            </View>
          )}
          <Text style={{ fontWeight: '700', fontSize: 20, color: t.text, marginTop: 3 }}>
            {name ? tr('zakazchiMain.greeting', { name }) : tr('zakazchiMain.greetingNoName')}
          </Text>
        </View>
        <Avatar letter={name.charAt(0).toUpperCase()} bgColor={t.orange} uri={user?.profile_photo} />
      </View>
    </View>
  );
}
