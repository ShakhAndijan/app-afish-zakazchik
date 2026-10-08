import { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';

// Bir qatorli kiritish oynasi (narx taklifi, bekor qilish sababi). `onSubmit(matn)` — matn
// bo'sh bo'lmasa chaqiriladi; `busy` bo'lganda tugmalar o'chadi.
export default function PromptModal({
  visible,
  title,
  placeholder,
  confirmLabel,
  keyboardType = 'default',
  multiline = false,
  busy = false,
  destructive = false,
  onSubmit,
  onClose,
}) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const [value, setValue] = useState('');

  useEffect(() => {
    if (visible) setValue('');
  }, [visible]);

  const canSubmit = value.trim().length > 0 && !busy;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={s.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[s.card, { backgroundColor: t.card, borderColor: t.border }]}>
          <Text style={[s.title, { color: t.text }]}>{title}</Text>
          <TextInput
            style={[
              s.input,
              { backgroundColor: t.inputBg, color: t.text, borderColor: t.border },
              multiline && { height: 90, textAlignVertical: 'top' },
            ]}
            value={value}
            onChangeText={setValue}
            placeholder={placeholder}
            placeholderTextColor={t.faint}
            keyboardType={keyboardType}
            multiline={multiline}
            autoFocus
            maxLength={multiline ? 300 : 12}
          />
          <View style={s.actions}>
            <TouchableOpacity
              style={[s.btn, { borderColor: t.line2, borderWidth: 1.5 }]}
              activeOpacity={0.8}
              onPress={onClose}
              disabled={busy}
            >
              <Text style={[s.btnText, { color: t.text }]}>{tr('requests.close')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                s.btn,
                { backgroundColor: destructive ? t.red : t.orange, opacity: canSubmit ? 1 : 0.5 },
              ]}
              activeOpacity={0.85}
              onPress={() => canSubmit && onSubmit(value.trim())}
              disabled={!canSubmit}
            >
              <Text style={[s.btnText, { color: '#fff' }]}>{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: { width: '100%', maxWidth: 380, borderRadius: 20, borderWidth: 1, padding: 18, gap: 14 },
  title: { fontWeight: '800', fontSize: 17 },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  actions: { flexDirection: 'row', gap: 10 },
  btn: { flex: 1, height: 46, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontWeight: '700', fontSize: 14.5 },
});
