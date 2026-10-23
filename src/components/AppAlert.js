import { useEffect, useState } from 'react';
import { Alert, Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

// Tizim `Alert.alert` o'rniga ilova dizaynidagi oyna. Imzosi bir xil:
//   appAlert(title, message?, [{ text, style: 'cancel' | 'destructive', onPress }])
// Tugmalar berilmasa bitta "OK" chiqadi. `AppAlertHost` ildizda bir marta qo'yiladi; u
// o'rnatilmagan bo'lsa (masalan, ildiz hali yuklanmagan) tizim oynasiga qaytadi.
let enqueue = null;

export function appAlert(title, message, buttons) {
  if (!enqueue) {
    Alert.alert(title, message, buttons);
    return;
  }
  enqueue({ title, message, buttons: buttons?.length ? buttons : [{}] });
}

// Tasdiqlash savoli: "Yopish" + tasdiqlash tugmasi (`destructive` — qizil).
export function appConfirm({ title, message, confirmLabel, destructive = false, onConfirm }) {
  appAlert(title, message, [
    { style: 'cancel' },
    { text: confirmLabel, style: destructive ? 'destructive' : 'default', onPress: onConfirm },
  ]);
}

export function AppAlertHost() {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    enqueue = (item) => setQueue((q) => [...q, item]);
    return () => {
      enqueue = null;
    };
  }, []);

  const current = queue[0];
  const buttons = current?.buttons ?? [];

  const press = (button) => {
    setQueue((q) => q.slice(1));
    button.onPress?.();
  };

  // Android "Orqaga": bekor qilish tugmasi bo'lsa shuni, bo'lmasa oynani yopadi.
  const dismiss = () => press(buttons.find((b) => b.style === 'cancel') ?? {});

  const fill = (b) => (b.style === 'destructive' ? t.red : b.style === 'cancel' ? null : t.orange);

  return (
    <Modal visible={!!current} transparent animationType="fade" onRequestClose={dismiss}>
      <View style={s.backdrop}>
        {!!current && (
          <View style={[s.card, { backgroundColor: t.card, borderColor: t.border }]}>
            <ScrollView contentContainerStyle={s.body}>
              {!!current.title && <Text style={[s.title, { color: t.text }]}>{current.title}</Text>}
              {!!current.message && (
                <Text style={[s.message, { color: t.muted }]}>{current.message}</Text>
              )}
            </ScrollView>
            <View style={buttons.length > 2 ? s.actionsColumn : s.actions}>
              {buttons.map((b, i) => {
                const bg = fill(b);
                return (
                  <TouchableOpacity
                    key={i}
                    style={[
                      s.btn,
                      buttons.length > 2 ? null : s.btnFlex,
                      bg ? { backgroundColor: bg } : { borderColor: t.line2, borderWidth: 1.5 },
                    ]}
                    activeOpacity={0.85}
                    onPress={() => press(b)}
                  >
                    <Text style={[s.btnText, { color: bg ? '#fff' : t.text }]}>
                      {b.text ?? (b.style === 'cancel' ? tr('common.close') : tr('common.ok'))}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </View>
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
  message: { fontSize: 13, lineHeight: 19 },
  actions: { flexDirection: 'row', gap: 10 },
  actionsColumn: { gap: 10 },
  btn: { height: 46, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  btnFlex: { flex: 1 },
  btnText: { fontWeight: '700', fontSize: 14.5 },
});
