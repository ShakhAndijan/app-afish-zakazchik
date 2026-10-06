import { View, Text } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLanguage } from '../../../context/LanguageContext';
import AfishLoader from '../../../components/AfishLoader';
import { useUstaStyles } from '../styles';
import UstaAvatar from './UstaAvatar';

// Profilning yuqori qismi: surat, ism, kasb/hudud, reyting, o'rtacha javob vaqti va bio.
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
  const { C, st } = useUstaStyles();

  return (
    <>
      <View style={{ flexDirection: 'row', gap: 14, marginTop: 14, alignItems: 'center' }}>
        <UstaAvatar initial={initial} size={68} bgColor={bgColor} uri={photo} />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {isOnline && (
              <View style={st.onlinePill}>
                <View style={st.onlineDot} />
                <Text style={st.onlinePillTxt}>{tr('ustaDetail.online')}</Text>
              </View>
            )}
            <Text style={{ fontSize: 19, fontWeight: '800', color: C.txt }}>{name}</Text>
            {isIdentityVerified && (
              <MaterialCommunityIcons name="shield-check" size={18} color={C.green} />
            )}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
            <Ionicons name="location-outline" size={13} color={C.dim} />
            <Text style={{ fontSize: 13, color: C.dim }} numberOfLines={1}>
              {[trade, location].filter(Boolean).join(' · ')}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 7 }}>
            <View style={st.ratingBadge}>
              <Ionicons name="star" size={13} color={C.gold} />
              <Text style={{ color: C.gold, fontSize: 12, fontWeight: '800' }}>{rating}</Text>
            </View>
            {avgResponseMin != null && (
              <Text style={{ fontSize: 12.5, color: C.dim }}>
                {tr('ustaDetail.avgResponse', { min: avgResponseMin })}
              </Text>
            )}
          </View>
        </View>
      </View>

      {!!bio && (
        <Text style={{ fontSize: 13.5, color: '#c4cdd8', marginTop: 12, lineHeight: 19 }}>{bio}</Text>
      )}

      {showLoader && <AfishLoader size={64} style={{ alignItems: 'center', marginTop: 14 }} />}
    </>
  );
}
