import { useState } from 'react';
import { Text, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { common } from '../styles';

const MIN_HEIGHT = 100;
const V_PADDING = 14;
const BORDER = 1.5;

// Tavsif maydoni: boshida 100 px, matn ko'paygan sari balandligi o'sadi (ichida aylantirish yo'q).
export default function DescriptionSection({ description, setDescription }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const [height, setHeight] = useState(MIN_HEIGHT);

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
        onContentSizeChange={(e) =>
          setHeight(
            Math.max(
              MIN_HEIGHT,
              Math.ceil(e.nativeEvent.contentSize.height) + V_PADDING * 2 + BORDER * 2
            )
          )
        }
        style={[
          s.textarea,
          { backgroundColor: t.card, borderColor: t.border, color: t.text, height },
        ]}
      />
    </>
  );
}

const s = StyleSheet.create({
  textarea: {
    borderWidth: BORDER,
    borderRadius: 14,
    padding: V_PADDING,
    fontSize: 14,
    textAlignVertical: 'top',
  },
});
