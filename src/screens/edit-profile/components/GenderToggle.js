import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { s } from '../styles';

const iconFor = (code) =>
  code === 'female' ? 'gender-female' : code === 'male' ? 'gender-male' : 'account';

// Jinsni tugmalar qatoridan tanlash (variantlar backenddan).
export default function GenderToggle({ genders, selectedId, onSelect, loading }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();

  return (
    <View style={{ gap: 8 }}>
      <Text style={[s.fieldLabel, { color: t.muted }]}>{tr('editProfile.genderLabel')}</Text>
      {loading ? (
        <ActivityIndicator size="small" color={t.orange} style={{ alignSelf: 'flex-start' }} />
      ) : (
        <View style={s.genderRow}>
          {genders.map((g) => {
            const on = g.id === selectedId;
            return (
              <TouchableOpacity
                key={g.id}
                style={[
                  s.genderBtn,
                  {
                    backgroundColor: on ? t.orange : t.inputBg,
                    borderColor: on ? t.orange : t.border,
                  },
                ]}
                activeOpacity={0.8}
                onPress={() => onSelect(g.id)}
              >
                <MaterialCommunityIcons name={iconFor(g.code)} size={17} color={on ? '#fff' : t.muted} />
                <Text style={[s.genderBtnText, { color: on ? '#fff' : t.text }]}>{g.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}
