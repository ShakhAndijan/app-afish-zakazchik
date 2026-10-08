import { View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';

const STEP_KEYS = [
  'orderDetail.stepSent',
  'orderDetail.stepTalk',
  'orderDetail.stepWork',
  'orderDetail.stepDone',
];
const STEP_OF = { pending: 0, accepted: 1, active: 2, completed: 3 };

// Bosqichlar chizig'i: yuborildi → kelishuv → ish → bajarildi. Joriy bosqich yirik nuqtada.
function Progress({ current, color, t, tr }) {
  return (
    <View style={s.steps}>
      {STEP_KEYS.map((key, i) => {
        const isCurrent = i === current;
        return (
          <View key={key} style={s.step}>
            <View style={s.track}>
              <View
                style={[
                  s.line,
                  { backgroundColor: i <= current ? color : t.border },
                  i === 0 && s.hidden,
                ]}
              />
              <View
                style={[
                  s.dot,
                  isCurrent
                    ? { backgroundColor: color, borderColor: color + '55', borderWidth: 4 }
                    : { backgroundColor: i < current ? color : t.card3 },
                ]}
              />
              <View
                style={[
                  s.line,
                  { backgroundColor: i < current ? color : t.border },
                  i === STEP_KEYS.length - 1 && s.hidden,
                ]}
              />
            </View>
            <Text
              style={[
                s.stepTxt,
                { color: isCurrent ? t.text : t.faint, fontWeight: isCurrent ? '800' : '600' },
              ]}
              numberOfLines={1}
            >
              {tr(key)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// Buyurtma holati: katta belgi, holat nomi, izoh va (bekor qilinmagan bo'lsa) bosqichlar chizig'i.
// `meta` — STATUS_META dagi yozuv.
export default function StatusBanner({ meta, label, subtext, order }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const step = STEP_OF[order?.rawStatus];

  return (
    <View style={[s.banner, { backgroundColor: meta.bg, borderColor: meta.color + '33' }]}>
      <View style={[s.blob, { backgroundColor: meta.color }]} />
      <View style={s.head}>
        <View style={[s.icon, { backgroundColor: meta.color + '26' }]}>
          <MaterialCommunityIcons name={meta.icon} size={26} color={meta.color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[s.label, { color: meta.color }]}>{label}</Text>
          <Text style={[s.sub, { color: t.muted }]}>{subtext}</Text>
        </View>
      </View>
      {step != null && <Progress current={step} color={meta.color} t={t} tr={tr} />}
    </View>
  );
}

const s = StyleSheet.create({
  banner: { borderWidth: 1, borderRadius: 22, padding: 16, overflow: 'hidden' },
  blob: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    top: -70,
    right: -50,
    opacity: 0.1,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  icon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 18, fontWeight: '800', letterSpacing: -0.2 },
  sub: { fontSize: 12.5, fontWeight: '600', marginTop: 3, lineHeight: 17 },
  steps: { flexDirection: 'row', marginTop: 18 },
  step: { flex: 1, alignItems: 'center' },
  track: { flexDirection: 'row', alignItems: 'center', height: 16, alignSelf: 'stretch' },
  line: { flex: 1, height: 3, borderRadius: 2 },
  hidden: { opacity: 0 },
  dot: { width: 16, height: 16, borderRadius: 8 },
  stepTxt: { fontSize: 11, marginTop: 6 },
});
