import { View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../../constants/colors';
import { useLanguage } from '../../../context/LanguageContext';
import { STEPS } from '../constants';

// "Qanday ishlaydi": 3 qadam, chapda raqamli chiziq (timeline), o'ngda kartochka.
export default function HowItWorks() {
  const { t } = useLanguage();

  return (
    <View style={s.wrap}>
      {STEPS.map((step, i) => {
        const last = i === STEPS.length - 1;
        return (
          <View key={step.num} style={s.row}>
            <View style={s.rail}>
              <View style={s.num}>
                <Text style={s.numText}>{step.num}</Text>
              </View>
              {!last && <View style={s.line} />}
            </View>
            <View style={[s.card, !last && { marginBottom: 12 }]}>
              <View style={{ flex: 1 }}>
                <Text style={s.title}>{t(`app.steps.${step.key}Title`)}</Text>
                <Text style={s.desc}>{t(`app.steps.${step.key}Desc`)}</Text>
              </View>
              <View style={s.iconBox}>
                <MaterialCommunityIcons name={step.icon} size={24} color={COLORS.orange} />
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingHorizontal: 16, marginBottom: 8 },
  row: { flexDirection: 'row', gap: 12 },
  rail: { width: 34, alignItems: 'center' },
  num: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  line: {
    flex: 1,
    width: 2,
    marginVertical: 4,
    borderRadius: 1,
    backgroundColor: 'rgba(232,122,69,0.3)',
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 14,
  },
  title: { color: COLORS.white, fontWeight: '700', fontSize: 14.5, marginBottom: 3 },
  desc: { color: COLORS.gray, fontSize: 12.5, lineHeight: 18 },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(232,122,69,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
