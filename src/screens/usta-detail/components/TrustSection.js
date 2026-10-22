import { View, Text } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useLanguage } from '../../../context/LanguageContext';
import { useUstaStyles } from '../styles';
import SectionTitle from './SectionTitle';
import { formatDuration, ratePercent } from '../utils';

// Ishonch ma'lumotlari (saytdagi o'ng paneldagi kabi): ishlash hududi, platformadagi staj,
// javob tezligi, buyurtma qabul qilish va qayta murojaat ulushi, shaxs tasdig'i.
// Ma'lumoti yo'q qatorlar chiqmaydi; hech biri bo'lmasa bo'lim ham ko'rinmaydi.
export default function TrustSection({ detail }) {
  const { t: tr } = useLanguage();
  const { C, st } = useUstaStyles();
  if (!detail) return null;

  const rows = [];
  if (detail.workAreaMode === 'radius' && detail.workRadiusKm > 0) {
    rows.push([
      'map-marker-radius-outline',
      tr('ustaDetail.trust.radius', { n: detail.workRadiusKm }),
    ]);
  } else if (detail.workDistricts.length > 0) {
    rows.push([
      'map-marker-multiple-outline',
      tr('ustaDetail.trust.districts', { list: detail.workDistricts.join(', ') }),
    ]);
  }
  const sinceYear = detail.registeredAt ? new Date(detail.registeredAt).getFullYear() : null;
  if (sinceYear && !Number.isNaN(sinceYear)) {
    rows.push(['calendar-check-outline', tr('ustaDetail.trust.since', { year: sinceYear })]);
  }
  if (detail.avgResponseMin != null) {
    rows.push([
      'flash-outline',
      tr('ustaDetail.trust.response', { time: formatDuration(tr, detail.avgResponseMin) }),
    ]);
  }
  if (detail.acceptanceRate != null) {
    rows.push([
      'thumb-up-outline',
      tr('ustaDetail.trust.acceptance', { n: ratePercent(detail.acceptanceRate) }),
    ]);
  }
  if (detail.repeatClientRate != null) {
    rows.push([
      'repeat-variant',
      tr('ustaDetail.trust.repeat', { n: ratePercent(detail.repeatClientRate) }),
    ]);
  }
  if (detail.isIdentityVerified) {
    rows.push(['shield-check-outline', tr('ustaDetail.trust.verified')]);
  }
  if (rows.length === 0) return null;

  return (
    <>
      <SectionTitle icon="shield-star-outline" title={tr('ustaDetail.trust.title')} />
      <View style={[st.card2, { padding: 14, gap: 12 }]}>
        {rows.map(([icon, text]) => (
          <View key={icon} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <MaterialCommunityIcons name={icon} size={18} color={C.orange} />
            <Text style={{ flex: 1, fontSize: 13, fontWeight: '600', color: C.txt }}>{text}</Text>
          </View>
        ))}
      </View>
    </>
  );
}
