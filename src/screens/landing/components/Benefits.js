import { View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useLanguage } from '../../../context/LanguageContext';
import { BENEFITS } from '../constants';
import InfoRow from './InfoRow';

// "Nega AFISH?": kafolat, tekshirilgan ustalar, tezkor xizmat kartochkalari.
export default function Benefits() {
  const { t } = useLanguage();

  return (
    <View style={{ paddingHorizontal: 16, marginBottom: 32, gap: 12 }}>
      {BENEFITS.map((b) => (
        <InfoRow
          key={b.key}
          card
          accent={b.color}
          badge={<MaterialCommunityIcons name={b.icon} size={24} color={b.color} />}
          title={t(`app.benefits.${b.key}Title`)}
          description={t(`app.benefits.${b.key}Desc`)}
        />
      ))}
    </View>
  );
}
