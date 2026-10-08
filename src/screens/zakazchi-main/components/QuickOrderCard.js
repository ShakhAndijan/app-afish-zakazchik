import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';

const STEPS = [
  { key: 'step1', icon: 'pencil-outline' },
  { key: 'step2', icon: 'message-text-outline' },
  { key: 'step3', icon: 'account-check-outline' },
];

// Bosh sahifaning birinchi kartasi: usta tanlay olmagan mijoz uchun 3 qadamli buyurtma oqimi va tugma.
export default function QuickOrderCard({ onPress, style }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();

  return (
    <View style={[s.card, { backgroundColor: t.card, borderColor: t.border }, style]}>
      <View style={[s.blob, { backgroundColor: t.orange, opacity: t.isDark ? 0.1 : 0.08 }]} />

      <View style={s.head}>
        <View style={[s.badge, { backgroundColor: `${t.orange}26` }]}>
          <MaterialCommunityIcons name="lightning-bolt" size={22} color={t.orange} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[s.title, { color: t.text }]} numberOfLines={2}>
            {tr('app.quickOrder.title')}
          </Text>
          <Text style={[s.text, { color: t.muted }]} numberOfLines={2}>
            {tr('app.quickOrder.text')}
          </Text>
        </View>
      </View>

      <View style={s.steps}>
        {STEPS.map((step, i) => (
          <View key={step.key} style={s.stepWrap}>
            <View style={s.step}>
              <View
                style={[s.stepIcon, { backgroundColor: t.card2, borderColor: `${t.orange}55` }]}
              >
                <MaterialCommunityIcons name={step.icon} size={17} color={t.orange} />
              </View>
              <Text style={[s.stepTxt, { color: t.subtext }]} numberOfLines={2}>
                {tr(`app.quickOrder.${step.key}`)}
              </Text>
            </View>
            {i < STEPS.length - 1 && (
              <MaterialCommunityIcons
                name="chevron-right"
                size={16}
                color={t.faint}
                style={s.chev}
              />
            )}
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[s.btn, { backgroundColor: t.orange }]}
        activeOpacity={0.88}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={tr('app.quickOrder.title')}
      >
        <Text style={s.btnText}>{tr('app.quickOrder.cta')}</Text>
        <MaterialCommunityIcons name="arrow-right" size={18} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    top: -70,
    right: -50,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 16.5, fontWeight: '800', lineHeight: 21, letterSpacing: -0.2 },
  text: { fontSize: 12.5, lineHeight: 17, marginTop: 2 },
  steps: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 16 },
  stepWrap: { flex: 1, flexDirection: 'row', alignItems: 'flex-start' },
  step: { flex: 1, alignItems: 'center', gap: 6 },
  stepIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTxt: { fontSize: 11, fontWeight: '600', textAlign: 'center', lineHeight: 14 },
  chev: { marginTop: 10, marginHorizontal: -4 },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    height: 48,
    borderRadius: 16,
  },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
