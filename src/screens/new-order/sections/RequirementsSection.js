import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { common } from '../styles';
import ToggleSwitch from '../components/ToggleSwitch';
import { RATING_OPTIONS, EXPERIENCE_OPTIONS, EXTRA_REQUIREMENTS_MAX } from '../constants';

function Chip({ active, onPress, children }) {
  const { theme: t } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[
        s.ratingChip,
        {
          backgroundColor: active ? t.orange : t.inputBg,
          borderColor: active ? t.orange : t.border,
        },
      ]}
    >
      {children}
    </TouchableOpacity>
  );
}

// Ishchiga talablar (sayt bilan bir xil): rasmli profil, tasdiqlangan usta, reyting, tajriba, yosh va boshqa talablar.
// Aniq ustaga buyurtma berilganda faqat "boshqa talablar" matni qoladi (saytdagidek).
export default function RequirementsSection({
  targeted = false,
  requirePhoto,
  setRequirePhoto,
  requireVerified,
  setRequireVerified,
  minRating,
  setMinRating,
  minExperience,
  setMinExperience,
  ageFrom,
  setAgeFrom,
  ageTo,
  setAgeTo,
  extraRequirements,
  setExtraRequirements,
}) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();

  const otherField = (
    <>
      <Text style={[common.requirementLabel, { color: t.text, marginBottom: 10 }]}>
        {tr('newOrder.requirements.otherLabel')}
      </Text>
      <TextInput
        value={extraRequirements}
        onChangeText={setExtraRequirements}
        maxLength={EXTRA_REQUIREMENTS_MAX}
        multiline
        placeholder={tr('newOrder.requirements.otherPlaceholder')}
        placeholderTextColor={t.faint}
        style={[s.other, { backgroundColor: t.bg, borderColor: t.border, color: t.text }]}
      />
    </>
  );

  return (
    <>
      {/* ── Ishchiga talablar ── */}
      <Text style={[common.label, { color: t.text }]}>{tr('newOrder.requirementsLabel')}</Text>
      <View style={[common.requirementsBox, { backgroundColor: t.card, borderColor: t.border }]}>
        {!targeted && (
          <>
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

            <View style={s.requirementRow}>
              <View style={{ flex: 1 }}>
                <Text style={[common.requirementLabel, { color: t.text }]}>
                  {tr('newOrder.requirements.verifiedRequired')}
                </Text>
                <Text style={[common.requirementSub, { color: t.muted }]}>
                  {tr('newOrder.requirements.verifiedRequiredHint')}
                </Text>
              </View>
              <ToggleSwitch value={requireVerified} onChange={setRequireVerified} t={t} />
            </View>

            <View style={[common.requirementDivider, { backgroundColor: t.border }]} />

            <Text style={[common.requirementLabel, { color: t.text, marginBottom: 10 }]}>
              {tr('newOrder.requirements.ratingLabel')}
            </Text>
            <View style={common.chipRow}>
              {RATING_OPTIONS.map((n) => {
                const active = minRating === n;
                return (
                  <Chip key={n} active={active} onPress={() => setMinRating(n)}>
                    {n > 0 && (
                      <MaterialCommunityIcons
                        name="star"
                        size={13}
                        color={active ? '#fff' : '#F5A623'}
                      />
                    )}
                    <Text style={[s.ratingChipTxt, { color: active ? '#fff' : t.text }]}>
                      {n === 0 ? tr('newOrder.requirements.allRatings') : `${n}+`}
                    </Text>
                  </Chip>
                );
              })}
            </View>

            <View style={[common.requirementDivider, { backgroundColor: t.border }]} />

            <Text style={[common.requirementLabel, { color: t.text, marginBottom: 10 }]}>
              {tr('newOrder.requirements.experienceLabel')}
            </Text>
            <View style={common.chipRow}>
              {EXPERIENCE_OPTIONS.map((n) => {
                const active = minExperience === n;
                return (
                  <Chip key={n} active={active} onPress={() => setMinExperience(n)}>
                    <Text style={[s.ratingChipTxt, { color: active ? '#fff' : t.text }]}>
                      {n === 0
                        ? tr('newOrder.requirements.allRatings')
                        : tr('newOrder.requirements.experienceYears', { n })}
                    </Text>
                  </Chip>
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

            <View style={[common.requirementDivider, { backgroundColor: t.border }]} />
          </>
        )}

        {otherField}
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
  other: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 12,
    fontSize: 14,
    minHeight: 76,
    textAlignVertical: 'top',
  },
});
