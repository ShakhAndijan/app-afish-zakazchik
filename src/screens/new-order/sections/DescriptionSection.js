import { Text, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { common } from '../styles';

const MIN_HEIGHT = 84;

// Tavsif maydoni: boshida ixcham, matn ko'paygan sari balandligi o'zi o'sadi (ichida aylantirish yo'q).
// Balandlik qo'lda hisoblanmaydi: Android'da `contentSize` maydonning o'z balandligidan kichik bo'lmagani
// uchun qo'lda qo'shilgan padding har yangilanishda maydonni cheksiz kattalashtirib yuborardi.
export default function DescriptionSection({ description, setDescription }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();

  return (
    <>
      {/* ── Tavsif ── */}
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
        scrollEnabled={false}
        style={[s.textarea, { backgroundColor: t.card, borderColor: t.border, color: t.text }]}
      />
    </>
  );
}

const s = StyleSheet.create({
  textarea: {
    minHeight: MIN_HEIGHT,
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    fontSize: 14,
    textAlignVertical: 'top',
  },
});
