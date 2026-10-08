import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLanguage } from '../../../context/LanguageContext';
import AfishLoader from '../../../components/AfishLoader';
import { useUstaStyles } from '../styles';
import UstaAvatar from './UstaAvatar';

const HERO_GRADIENT = ['#f28d56', '#e87a45', '#c9552a'];

// Profilning yuqori qismi: gradient karta ichida surat, ism, kasb/hudud, reyting, onlayn holat va bio.
// Statistika kartasi (StatCards) shu kartaning pastki chetiga suzib turadi.
export default function ProfileHero({
  initial,
  name,
  trade,
  location,
  rating,
  bgColor,
  photo,
  bio,
  isOnline,
  isIdentityVerified,
  avgResponseMin,
  showLoader,
}) {
  const { t: tr } = useLanguage();
  const { st } = useUstaStyles();

  return (
    <>
      <LinearGradient
        colors={HERO_GRADIENT}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={st.hero}
      >
        <View style={st.heroDecoA} pointerEvents="none" />
        <View style={st.heroDecoB} pointerEvents="none" />

        <View style={st.heroRow}>
          <View style={st.heroAvatarRing}>
            <UstaAvatar initial={initial} size={74} bgColor={bgColor} uri={photo} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={st.heroNameRow}>
              <Text style={st.heroName} numberOfLines={2}>
                {name}
              </Text>
              {isIdentityVerified && (
                <MaterialCommunityIcons name="check-decagram" size={19} color="#fff" />
              )}
            </View>
            {!!trade && (
              <Text style={st.heroTrade} numberOfLines={1}>
                {trade}
              </Text>
            )}
            {!!location && (
              <View style={st.heroLocRow}>
                <Ionicons name="location-outline" size={13} color="rgba(255,255,255,0.85)" />
                <Text style={st.heroLoc} numberOfLines={1}>
                  {location}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={st.heroPills}>
          <View style={st.heroPill}>
            <Ionicons name="star" size={13} color="#ffd25e" />
            <Text style={st.heroPillTxt}>{rating}</Text>
          </View>
          {isOnline && (
            <View style={st.heroPill}>
              <View style={st.onlineDot} />
              <Text style={st.heroPillTxt}>{tr('ustaDetail.online')}</Text>
            </View>
          )}
          {avgResponseMin != null && (
            <View style={st.heroPill}>
              <Ionicons name="flash-outline" size={13} color="#fff" />
              <Text style={st.heroPillTxt}>
                {tr('ustaDetail.avgResponse', { min: avgResponseMin }).replace(/^·\s*/, '')}
              </Text>
            </View>
          )}
        </View>

        {!!bio && <Text style={st.heroBio}>{bio}</Text>}

        {showLoader && <AfishLoader size={56} style={{ alignItems: 'center', marginTop: 12 }} />}
      </LinearGradient>
    </>
  );
}
