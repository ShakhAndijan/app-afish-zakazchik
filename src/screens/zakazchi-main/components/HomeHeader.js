import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { useUser } from '../../../context/UserContext';
import Avatar from '../../../components/Avatar';
import { useUnreadNotifications } from '../../../queries/notifications';

const BTN = 42;

// Bosh sahifa sarlavhasi: manzil, bildirishnoma, avatar va qidiruv paneli.
export default function HomeHeader() {
  const router = useRouter();
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const { user } = useUser();
  const unread = useUnreadNotifications();

  const name = user?.first_name || user?.last_name || '';
  const location = user?.district || user?.region || tr('zakazchiMain.header.noLocation');
  const openSearch = () => router.navigate('/services');

  return (
    <View style={s.wrap}>
      <View style={s.top}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.navigate('/profile')}
          accessibilityRole="button"
          accessibilityLabel={location}
          style={s.location}
        >
          <Feather name="map-pin" size={20} color={t.muted} />
          <Text style={[s.locationTxt, { color: t.text }]} numberOfLines={1}>
            {location}
          </Text>
          <Feather name="chevron-down" size={18} color={t.muted} />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/notifications')}
          accessibilityRole="button"
          accessibilityLabel={tr('notifList.title')}
          style={[s.circle, { backgroundColor: t.card, borderColor: t.border }]}
        >
          <Feather name="bell" size={20} color={t.muted} />
          {unread > 0 && (
            <View style={[s.badge, { backgroundColor: t.orange, borderColor: t.bg }]}>
              <Text style={s.badgeTxt}>{unread > 99 ? '99+' : unread}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.navigate('/profile')}
          accessibilityRole="button"
          accessibilityLabel={tr('zakazchiMain.header.openProfile')}
          style={[s.avatarRing, { borderColor: t.border }]}
        >
          <Avatar
            size={BTN}
            letter={name.charAt(0).toUpperCase()}
            bgColor="#2d3d58"
            uri={user?.profile_photo}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={openSearch}
        accessibilityRole="search"
        accessibilityLabel={tr('zakazchiMain.header.search')}
        style={[s.search, { backgroundColor: t.card, borderColor: t.border }]}
      >
        <Feather name="search" size={20} color={t.muted} />
        <Text style={[s.placeholder, { color: t.muted }]} numberOfLines={1}>
          {tr('zakazchiMain.header.searchPlaceholder')}
        </Text>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={openSearch}
          accessibilityRole="button"
          accessibilityLabel={tr('zakazchiMain.header.voiceSearch')}
          style={[s.mic, { backgroundColor: t.border }]}
        >
          <Feather name="mic" size={19} color={t.muted} />
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16, gap: 14 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  location: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 9 },
  locationTxt: { flexShrink: 1, fontSize: 18, fontWeight: '700', letterSpacing: -0.2 },
  circle: {
    width: BTN,
    height: BTN,
    borderRadius: BTN / 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeTxt: { color: '#fff', fontSize: 11, fontWeight: '800' },
  avatarRing: {
    width: BTN + 4,
    height: BTN + 4,
    borderRadius: (BTN + 4) / 2,
    borderWidth: 2,
    overflow: 'hidden',
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    paddingLeft: 16,
    paddingRight: 8,
  },
  placeholder: { flex: 1, fontSize: 16 },
  mic: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
