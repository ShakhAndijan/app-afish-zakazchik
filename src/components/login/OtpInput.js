import { useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { otpAutofillProps } from '../../utils/otp';

const DEFAULT_COLORS = {
  bg: COLORS.inputBg,
  border: COLORS.border,
  text: COLORS.white,
  accent: COLORS.orange,
  filledBg: 'rgba(232,122,69,0.12)',
};

// OTP kiritish: kataklar faqat ko'rsatish uchun, haqiqiy kiritish bitta TextInput'da.
// Shu sababli SMS avto-to'ldirish, klaviatura tavsiyasi va paste butun kodni bir yo'la yozadi.
export default function OtpInput({
  value = '',
  onChange,
  length = 5,
  colors,
  cellHeight = 62,
  fontSize = 24,
  gap = 10,
}) {
  const inputRef = useRef(null);
  const [focused, setFocused] = useState(false);
  const c = { ...DEFAULT_COLORS, ...colors };

  const handleChange = (text) => onChange(text.replace(/\D/g, '').slice(0, length));

  const activeIndex = Math.min(value.length, length - 1);

  return (
    <Pressable onPress={() => inputRef.current?.focus()} style={[styles.row, { gap }]}>
      {Array.from({ length }).map((_, i) => {
        const filled = !!value[i];
        const active = focused && i === activeIndex;
        return (
          <View
            key={i}
            style={[
              styles.cell,
              {
                height: cellHeight,
                backgroundColor: filled ? c.filledBg : c.bg,
                borderColor: filled || active ? c.accent : c.border,
              },
            ]}
          >
            <Text style={[styles.digit, { color: c.text, fontSize }]}>{value[i] || ''}</Text>
          </View>
        );
      })}

      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        keyboardType="number-pad"
        maxLength={length}
        autoFocus
        caretHidden
        style={styles.hiddenInput}
        {...otpAutofillProps}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cell: {
    flex: 1,
    minWidth: 0,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  digit: {
    fontWeight: '700',
    textAlign: 'center',
  },
  // Kataklar ustini to'liq qoplaydi, ko'rinmaydi, lekin fokus va avto-to'ldirish oladi.
  hiddenInput: {
    ...StyleSheet.absoluteFill,
    opacity: 0.015,
    color: 'transparent',
  },
});
