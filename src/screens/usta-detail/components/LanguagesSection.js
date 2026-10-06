import { View, Text } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useLanguage } from '../../../context/LanguageContext';
import { useUstaStyles } from '../styles';

// Usta biladigan tillar.
export default function LanguagesSection({ languages }) {
  const { t: tr } = useLanguage();
  const { C, st } = useUstaStyles();
  if (languages.length === 0) return null;

  return (
    <>
      <Text style={st.secTitle}>{tr('ustaDetail.languagesTitle')}</Text>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        {languages.map((lang, i) => (
          <View key={i} style={st.langChip}>
            <View style={st.langIconWrap}>
              <MaterialCommunityIcons name="translate" size={13} color={C.blue} />
            </View>
            <Text style={st.langChipTxt}>{lang}</Text>
          </View>
        ))}
      </View>
    </>
  );
}
