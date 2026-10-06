import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { common } from '../styles';
import ToggleSwitch from '../components/ToggleSwitch';

export default function RequirementsSection({ requirePhoto, setRequirePhoto, minRating, setMinRating, ageFrom, setAgeFrom, ageTo, setAgeTo }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();

  return (
    <>
      {/* ── Ishchiga talablar ── */}
      <Text style={[common.label, { color: t.text }]}>{tr('newOrder.requirementsLabel')}</Text>
      <View style={[common.requirementsBox, { backgroundColor: t.card, borderColor: t.border }]}>
        <View style={s.requirementRow}>
          <View style={{ flex: 1 }}>
            <Text style={[common.requirementLabel, { color: t.text }]}>
              {tr('newOrder.requirements.photoRequired')}
            </Text>
            <Text style={[common.requirementSub, { color: t.muted }]}>
              {tr('newOrder.requirements.photoRequiredHint')}
            </Text>
          </View>
          <ToggleSwitch value={requirePhoto} onChange={setRequirePhoto} t={t} />
        </View>

        <View style={[common.requirementDivider, { backgroundColor: t.border }]} />

        <Text style={[common.requirementLabel, { color: t.text, marginBottom: 10 }]}>
          {tr('newOrder.requirements.ratingLabel')}
        </Text>
        <View style={common.chipRow}>
          <TouchableOpacity
            onPress={() => setMinRating(0)}
            activeOpacity={0.85}
            style={[
              s.ratingChip,
              {
                backgroundColor: minRating === 0 ? t.orange : t.inputBg,
                borderColor: minRating === 0 ? t.orange : t.border,
              },
            ]}
          >
            <Text style={[s.ratingChipTxt, { color: minRating === 0 ? '#fff' : t.text }]}>
              {tr('newOrder.requirements.allRatings')}
            </Text>
          </TouchableOpacity>
          {[1, 2, 3, 4, 5].map((n) => {
            const active = minRating === n;
            return (
              <TouchableOpacity
                key={n}
                onPress={() => setMinRating(n)}
                activeOpacity={0.85}
                style={[
                  s.ratingChip,
                  {
                    backgroundColor: active ? t.orange : t.inputBg,
                    borderColor: active ? t.orange : t.border,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="star"
                  size={13}
                  color={active ? '#fff' : '#F5A623'}
                />
                <Text style={[s.ratingChipTxt, { color: active ? '#fff' : t.text }]}>
                  {n}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={[common.requirementDivider, { backgroundColor: t.border }]} />

        <Text style={[common.requirementLabel, { color: t.text, marginBottom: 10 }]}>
          {tr('newOrder.requirements.ageLabel')}
        </Text>
        <View style={s.ageRow}>
          <View style={{ flex: 1 }}>
            <Text style={[s.ageInputLabel, { color: t.muted }]}>
              {tr('newOrder.requirements.ageFrom')}
            </Text>
            <TextInput
              value={ageFrom}
              onChangeText={setAgeFrom}
              keyboardType="number-pad"
              placeholder="18"
              placeholderTextColor={t.faint}
              style={[
                common.input,
                { backgroundColor: t.bg, borderColor: t.border, color: t.text },
              ]}
            />
          </View>
          <Text style={[s.ageDash, { color: t.muted }]}>—</Text>
          <View style={{ flex: 1 }}>
            <Text style={[s.ageInputLabel, { color: t.muted }]}>
              {tr('newOrder.requirements.ageTo')}
            </Text>
            <TextInput
              value={ageTo}
              onChangeText={setAgeTo}
              keyboardType="number-pad"
              placeholder="60"
              placeholderTextColor={t.faint}
              style={[
                common.input,
                { backgroundColor: t.bg, borderColor: t.border, color: t.text },
              ]}
            />
          </View>
        </View>
      </View>
    </>
  );
}

const s = StyleSheet.create({
  requirementRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ratingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  ratingChipTxt: { fontSize: 13, fontWeight: '600' },
  ageRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  ageInputLabel: { fontSize: 12, marginBottom: 6 },
  ageDash: { fontSize: 16, paddingBottom: 14 },
});
