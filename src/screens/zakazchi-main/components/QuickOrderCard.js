import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';

// Bosh sahifaning birinchi kartasi: usta tanlay olmagan mijoz uchun buyurtma berishga chaqiruv.
// O'rtacha o'lchamli to'q sariq gradientli karta: yuqorida ikonka, sarlavha va izoh, pastda oq tugma.
export default function QuickOrderCard({ onPress, style }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();

  return (
    <LinearGradient
      colors={[t.orange, '#c4501f']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[s.card, style]}
    >
      <MaterialCommunityIcons name="lightning-bolt" size={120} color="#fff" style={s.bolt} />

      <View style={s.head}>
        <View style={s.badge}>
          <MaterialCommunityIcons name="lightning-bolt" size={22} color="#fff" />
        </View>
        <View style={s.body}>
          <Text style={s.title} numberOfLines={2}>
            {tr('app.quickOrder.title')}
          </Text>
          <Text style={s.text} numberOfLines={2}>
            {tr('app.quickOrder.text')}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={s.btn}
        activeOpacity={0.9}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={tr('app.quickOrder.cta')}
      >
        <Text style={s.btnText}>{tr('app.quickOrder.cta')}</Text>
        <MaterialCommunityIcons name="arrow-right" size={19} color="#c4501f" />
      </TouchableOpacity>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  card: {
    borderRadius: 22,
    padding: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  bolt: { position: 'absolute', top: -16, right: -14, opacity: 0.12 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1 },
  title: { color: '#fff', fontSize: 18, fontWeight: '800', lineHeight: 23, letterSpacing: -0.2 },
  text: {
    color: 'rgba(255,255,255,0.94)',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    marginTop: 2,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#fff',
  },
  btnText: { color: '#c4501f', fontSize: 15, fontWeight: '800' },
});
