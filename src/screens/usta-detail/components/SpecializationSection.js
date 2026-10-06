import { View, Text, TouchableOpacity } from 'react-native';
import { useLanguage } from '../../../context/LanguageContext';
import { useUstaStyles } from '../styles';

// Mutaxassislik yo'nalishlari; tanlangan yo'nalish sertifikatlarni filtrlaydi.
export default function SpecializationSection({ categories, selectedId, onSelect, loading }) {
  const { t: tr } = useLanguage();
  const { C, st } = useUstaStyles();

  return (
    <>
      <Text style={st.secTitle}>{tr('ustaDetail.specializationTitle')}</Text>
      {categories.length > 0 ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {categories.map((c) => {
            const active = c.id === selectedId;
            return (
              <TouchableOpacity
                key={c.id}
                activeOpacity={0.8}
                onPress={() => onSelect(c.id)}
                style={[st.chip, active && st.chipActive]}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: active ? C.orange : C.txt }}>
                  {c.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        <View style={[st.card, { padding: 16, alignItems: 'center' }]}>
          <Text style={{ fontSize: 12.5, color: C.dim }}>
            {loading ? tr('common.loading') : tr('ustaDetail.specializationEmpty')}
          </Text>
        </View>
      )}
    </>
  );
}
