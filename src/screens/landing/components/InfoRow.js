import { View, Text } from 'react-native';
import { COLORS } from '../../../constants/colors';

// Sarlavha + tavsifli qator; chap tomonda `badge` (raqam yoki ikonka) joylashadi.
// "Qanday ishlaydi" va "Nega AFISH?" bo'limlari shu qatorni ishlatadi.
export default function InfoRow({ badge, accent, title, description, card = false }) {
  return (
    <View
      style={[
        { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
        card && {
          backgroundColor: COLORS.card,
          borderRadius: 18,
          padding: 16,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.06)',
        },
      ]}
    >
      <View
        style={{
          width: card ? 46 : 36,
          height: card ? 46 : 36,
          borderRadius: card ? 13 : 11,
          backgroundColor: accent + '22',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {badge}
      </View>
      <View style={{ flex: 1, paddingTop: 2 }}>
        <Text style={{ color: COLORS.white, fontWeight: '700', fontSize: 14.5, marginBottom: 4 }}>
          {title}
        </Text>
        <Text style={{ color: COLORS.gray, fontSize: 13, lineHeight: 19 }}>{description}</Text>
      </View>
    </View>
  );
}
