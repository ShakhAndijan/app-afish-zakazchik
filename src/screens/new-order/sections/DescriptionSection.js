import { Text, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { common } from '../styles';

export default function DescriptionSection({ selectedCategories, description, setDescription }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();

  return (
    <>
      {/* ── Tavsif (xizmat turi tanlangandan keyin chiqadi) ── */}
      {selectedCategories.length > 0 && (
        <>
          <Text style={[common.label, { color: t.text }]}>
            {tr('newOrder.descriptionLabel')}
            <Text style={{ color: t.red }}> *</Text>
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder={tr('newOrder.descriptionPlaceholder')}
            placeholderTextColor={t.faint}
            multiline
            numberOfLines={4}
            style={[s.textarea, { backgroundColor: t.card, borderColor: t.border, color: t.text }]}
          />
        </>
      )}
    </>
  );
}

const s = StyleSheet.create({
  textarea: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
  },
});
