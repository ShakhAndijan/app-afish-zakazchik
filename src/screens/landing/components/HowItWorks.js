import { View, Text } from 'react-native';
import { COLORS } from '../../../constants/colors';
import { useLanguage } from '../../../context/LanguageContext';
import { STEPS } from '../constants';
import InfoRow from './InfoRow';

// "Qanday ishlaydi": 3 qadam.
export default function HowItWorks() {
  const { t } = useLanguage();

  return (
    <View style={{ paddingHorizontal: 16, marginBottom: 32, gap: 16 }}>
      {STEPS.map((s) => (
        <InfoRow
          key={s.num}
          accent={COLORS.orange}
          badge={<Text style={{ color: COLORS.orange, fontWeight: '800', fontSize: 15 }}>{s.num}</Text>}
          title={t(`app.steps.${s.key}Title`)}
          description={t(`app.steps.${s.key}Desc`)}
        />
      ))}
    </View>
  );
}
