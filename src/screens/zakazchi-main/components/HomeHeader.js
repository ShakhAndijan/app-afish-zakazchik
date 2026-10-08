import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { useUser } from '../../../context/UserContext';
import Avatar from '../../../components/Avatar';

const AVATAR = 46;
const RING = 2;
const GRADIENT = ['#f28d56', '#e87a45', '#c9552a'];

// Kun vaqtiga qarab salomlashuv kaliti.
function greetingKey(hour) {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'day';
  if (hour >= 18 && hour < 23) return 'evening';
  return 'night';
}

// Bosh sahifa sarlavhasi: brend gradientli ixcham karta — avatar, salomlashuv, ism, manzil va qidiruv.
export default function HomeHeader() {
  const router = useRouter();
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const { user } = useUser();

  const name = user?.first_name || user?.last_name || '';
  const location = user?.district || user?.region || '';
  const hello = tr(`zakazchiMain.header.${greetingKey(new Date().getHours())}`);

  return (
    <View style={s.wrap}>
      <LinearGradient
        colors={GRADIENT}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[s.card, { shadowColor: t.orange }]}
      >
        {/* Bezak doiralar */}
        <View style={[s.blob, s.blobA]} />
        <View style={[s.blob, s.blobB]} />

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.navigate('/profile')}
          accessibilityRole="button"
          accessibilityLabel={tr('zakazchiMain.header.openProfile')}
          style={s.ring}
        >
          <Avatar
            size={AVATAR}
            letter={name.charAt(0).toUpperCase()}
            bgColor="#c9552a"
            uri={user?.profile_photo}
          />
        </TouchableOpacity>

        <View style={s.texts}>
          <Text style={s.hello} numberOfLines={1}>
            {hello} 👋
          </Text>
          {!!name && (
            <Text style={s.name} numberOfLines={1}>
              {name}
            </Text>
          )}
          {!!location && (
            <View style={s.chip}>
              <MaterialCommunityIcons name="map-marker" size={12} color="#fff" />
              <Text style={s.chipTxt} numberOfLines={1}>
                {location}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.navigate('/services')}
          accessibilityRole="button"
          accessibilityLabel={tr('zakazchiMain.header.search')}
          style={s.iconBtn}
        >
          <Feather name="search" size={19} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 14,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 6,
  },
  blob: { position: 'absolute', backgroundColor: '#fff', borderRadius: 999 },
  blobA: { width: 120, height: 120, top: -55, right: -25, opacity: 0.12 },
  blobB: { width: 70, height: 70, bottom: -35, right: 70, opacity: 0.08 },
  ring: {
    padding: RING,
    borderRadius: AVATAR * 0.32 + RING + 1,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.75)',
  },
  texts: { flex: 1 },
  hello: { fontSize: 12.5, fontWeight: '600', color: 'rgba(255,255,255,0.82)' },
  name: { fontSize: 19, fontWeight: '800', letterSpacing: -0.3, color: '#fff', marginTop: 1 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 3,
    marginTop: 6,
    paddingVertical: 3,
    paddingLeft: 6,
    paddingRight: 9,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.2)',
    maxWidth: '100%',
  },
  chipTxt: { fontSize: 11.5, fontWeight: '700', color: '#fff', flexShrink: 1 },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
