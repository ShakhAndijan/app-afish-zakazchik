import { useRef } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export default function OtpInput({ value = '', onChange, length = 5 }) {
  const refs = useRef([]);

  const handleChange = (text, index) => {
    const digit = text.replace(/\D/g, '').slice(-1);
    const chars = Array.from({ length }, (_, i) => value[i] || '');
    chars[index] = digit;
    onChange(chars.join(''));
    if (digit && index < length - 1) refs.current[index + 1]?.focus();
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !value[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.row}>
      {Array.from({ length }).map((_, i) => {
        const filled = !!value[i];
        return (
          <TextInput
            key={i}
            ref={el => (refs.current[i] = el)}
            style={[styles.cell, filled && styles.cellFilled]}
            value={value[i] || ''}
            onChangeText={text => handleChange(text, i)}
            onKeyPress={e => handleKeyPress(e, i)}
            keyboardType="numeric"
            maxLength={1}
            selectTextOnFocus
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  cell: {
    flex: 1,
    height: 62,
    borderRadius: 16,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  cellFilled: {
    backgroundColor: 'rgba(232,122,69,0.12)',
    borderColor: COLORS.orange,
  },
});
