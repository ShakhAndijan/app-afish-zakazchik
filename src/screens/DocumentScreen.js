import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { DOCUMENTS } from '../i18n/siteTexts';
import useBottomInset from '../hooks/useBottomInset';

// Hujjat sahifasi (saytdagi /about, /privacy, /terms): "Biz haqimizda", "Maxfiylik siyosati",
// "Foydalanish shartlari" — sayt bilan bir xil matn, tanlangan tilda.
export default function DocumentScreen({ docKey, onBack }) {
  const bottomInset = useBottomInset();
  const { theme: t } = useTheme();
  const { language, t: tr } = useLanguage();
  const doc = (DOCUMENTS[language] ?? DOCUMENTS.uz)[docKey] ?? DOCUMENTS.uz.about;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top', 'left', 'right']}>
      <StatusBar style={t.isDark ? 'light' : 'dark'} />
      <View style={s.header}>
        <TouchableOpacity
          style={[s.backBtn, { backgroundColor: t.card, borderColor: t.border }]}
          onPress={onBack}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="chevron-left" size={24} color={t.text} />
        </TouchableOpacity>
        <Text style={[s.title, { color: t.text }]} numberOfLines={2}>
          {doc.title}
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 48 + bottomInset, gap: 22 }}
      >
        {!!doc.updated && (
          <Text style={{ color: t.faint, fontSize: 12.5 }}>
            {tr('support.updatedLabel')}: {doc.updated}
          </Text>
        )}
        {doc.sections.map((sec) => (
          <View key={sec.h} style={{ gap: 8 }}>
            <Text style={[s.heading, { color: t.text }]}>{sec.h}</Text>
            <Text style={[s.body, { color: t.muted }]}>{sec.p}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontWeight: '800', fontSize: 20, flex: 1 },
  heading: { fontWeight: '800', fontSize: 16 },
  body: { fontSize: 14.5, lineHeight: 22 },
});
