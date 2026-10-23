import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { KeyboardAvoidingView, KeyboardProvider } from 'react-native-keyboard-controller';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';

// Kelishuv oynalari uchun umumiy qobiq: sarlavha, izoh, ixtiyoriy tarkib (`children`) va
// "Yopish" / tasdiqlash tugmalari. `busy` bo'lganda tugmalar o'chadi.
export default function FlowModal({
  visible,
  title,
  hint,
  confirmLabel,
  destructive = false,
  disabled = false,
  busy = false,
  onSubmit,
  onClose,
  children,
}) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const canSubmit = !disabled && !busy;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      {/* Android'da Modal alohida oyna: klaviatura hodisalari uchun o'z KeyboardProvider'i kerak. */}
      <KeyboardProvider statusBarTranslucent navigationBarTranslucent>
        <KeyboardAvoidingView style={s.backdrop} behavior="padding">
          <View style={[s.card, { backgroundColor: t.card, borderColor: t.border }]}>
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.body}>
              <Text style={[s.title, { color: t.text }]}>{title}</Text>
              {!!hint && <Text style={[s.hint, { color: t.muted }]}>{hint}</Text>}
              {children}
            </ScrollView>
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
                onPress={() => canSubmit && onSubmit()}
                disabled={!canSubmit}
              >
                <Text style={[s.btnText, { color: '#fff' }]}>{confirmLabel}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </KeyboardProvider>
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
  card: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '88%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  body: { gap: 12 },
  title: { fontWeight: '800', fontSize: 17 },
  hint: { fontSize: 13, lineHeight: 19 },
  actions: { flexDirection: 'row', gap: 10 },
  btn: { flex: 1, height: 46, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontWeight: '700', fontSize: 14.5 },
});
