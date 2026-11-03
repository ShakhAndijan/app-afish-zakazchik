import { View, Text, Modal, Pressable, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  notificationAction,
  notificationDate,
  notificationDetail,
  notificationText,
} from './utils';

// Pastki tizim paneli tugmalarni yopib qo'ymasligi uchun (Modal o'z SafeAreaProvider'ida o'lchanadi).
function BottomPad() {
  return <View style={{ height: useSafeAreaInsets().bottom }} />;
}

// Bildirishnomaning o'zi: to'liq matn, buyurtma kodi/sarlavhasi va sana. Tegishli ekran (buyurtma,
// e'lon, javob) bo'lsa, alohida tugma bilan ochiladi — bildirishnomani bosish endi to'g'ridan-to'g'ri
// buyurtmaga o'tkazmaydi.
export default function NotificationDetailModal({ notification, onClose, onOpenTarget }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const detail = notification ? notificationDetail(notification) : null;
  const action = notification ? notificationAction(notification) : null;

  return (
    <Modal
      visible={!!notification}
      transparent
      animationType="slide"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <SafeAreaProvider style={{ flex: 1 }}>
        <Pressable style={s.backdrop} onPress={onClose} />
        {!!notification && (
          <View style={[s.sheet, { backgroundColor: t.card, borderColor: t.border }]}>
            <View style={[s.handle, { backgroundColor: t.border }]} />
            <Text style={[s.text, { color: t.text }]}>{notificationText(notification, tr)}</Text>
            {!!detail && <Text style={[s.detail, { color: t.muted }]}>{detail}</Text>}
            <Text style={[s.date, { color: t.faint }]}>
              {notificationDate(notification.createdAt)}
            </Text>

            {!!action && (
              <TouchableOpacity
                onPress={() => onOpenTarget(notification)}
                activeOpacity={0.85}
                accessibilityRole="button"
                style={[s.btn, { backgroundColor: t.orange }]}
              >
                <Text style={s.btnTxt}>{tr(action)}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.85}
              accessibilityRole="button"
              style={[s.btn, { borderWidth: 1.5, borderColor: t.border }]}
            >
              <Text style={[s.btnTxt, { color: t.text }]}>{tr('notifList.close')}</Text>
            </TouchableOpacity>
            <BottomPad />
          </View>
        )}
      </SafeAreaProvider>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    gap: 6,
  },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 12 },
  text: { fontSize: 16, fontWeight: '700', lineHeight: 23 },
  detail: { fontSize: 14, lineHeight: 20 },
  date: { fontSize: 12.5, fontWeight: '600', marginBottom: 12 },
  btn: { borderRadius: 14, paddingVertical: 13, alignItems: 'center', marginTop: 4 },
  btnTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
