import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { getTopCategories } from '../../../api/user';

const HEX = /^#[0-9a-f]{6}$/i;

// "Siz ko'p buyurtma qilgan": mijoz oxirgi 90 kunda eng ko'p buyurtma bergan yo'nalishlar (tezkor kirish).
// Buyurtma tarixi bo'lmasa yoki so'rov xato bersa — bo'lim ko'rsatilmaydi.
export default function TopCategoriesRow({ style }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const router = useRouter();
  const { data } = useQuery({
    queryKey: ['customer', 'top-categories'],
    queryFn: () => getTopCategories({ days: 90, limit: 8 }),
    staleTime: 5 * 60 * 1000,
  });

  if (!data || data.length === 0) return null;

  return (
    <View style={style}>
      <Text style={[s.title, { color: t.text }]}>{tr('homeBlocks.topCategoriesTitle')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.row}>
        {data.map((c) => {
          const color = HEX.test(c.color ?? '') ? c.color : t.orange;
          return (
            <TouchableOpacity
              key={c.id}
              style={[
                s.chip,
                { backgroundColor: color + (t.isDark ? '26' : '1f'), borderColor: color + '55' },
              ]}
              activeOpacity={0.8}
              accessibilityRole="button"
              onPress={() =>
                router.navigate({
                  pathname: '/services/category/[id]',
                  params: { id: String(c.id) },
                })
              }
            >
              <Text style={[s.name, { color: t.text }]} numberOfLines={1}>
                {c.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  title: { fontWeight: '700', fontSize: 14.5, paddingHorizontal: 20, marginBottom: 10 },
  row: { paddingHorizontal: 20, gap: 8 },
  chip: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 9 },
  name: { fontSize: 13, fontWeight: '700' },
});
