import { View, Pressable, TouchableOpacity, StyleSheet } from 'react-native';
import { useKeyboardState } from 'react-native-keyboard-controller';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import CommentsSection from './CommentsSection';

// Reels ustidagi izohlar oynasi. Modal emas, ekran ichidagi qatlam: klaviatura boshqaruvi
// (react-native-keyboard-controller) faqat asosiy oynada ishonchli ishlaydi.
export default function CommentsSheet({
  listingId,
  signedIn,
  onLogin,
  onClose,
  height,
  bottomInset,
}) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const keyboardHeight = useKeyboardState((st) => (st.isVisible ? st.height : 0));

  return (
    <View style={StyleSheet.absoluteFill}>
      <Pressable
        style={s.backdrop}
        onPress={onClose}
        accessibilityLabel={tr('listings.reels.close')}
      />
      <View
        style={[
          s.sheet,
          {
            backgroundColor: t.bg,
            borderColor: t.border,
            // Klaviatura ochiq bo'lsa oyna uning ustiga ko'tariladi va sig'adigan balandlikkacha qisqaradi.
            bottom: keyboardHeight,
            height: keyboardHeight ? Math.min(height, height * 0.9) : height,
            paddingBottom: keyboardHeight ? 12 : bottomInset + 12,
          },
        ]}
      >
        <View style={s.grabRow}>
          <View style={[s.grab, { backgroundColor: t.border }]} />
          <TouchableOpacity
            onPress={onClose}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={tr('listings.reels.close')}
            style={s.close}
          >
            <MaterialCommunityIcons name="close" size={22} color={t.muted} />
          </TouchableOpacity>
        </View>
        <CommentsSection listingId={listingId} signedIn={signedIn} onLogin={onLogin} sheet />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingHorizontal: 18,
  },
  grabRow: { alignItems: 'center', justifyContent: 'center', height: 34, marginBottom: 4 },
  grab: { width: 38, height: 4, borderRadius: 2 },
  close: { position: 'absolute', right: 0, top: 6 },
});
