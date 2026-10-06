import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../../constants/colors';
import { useLanguage } from '../../../context/LanguageContext';
import { getCategories } from '../../../api/categories';
import useAutoScroll from '../hooks/useAutoScroll';

const ITEM_SLOT = 76;

// "Taklif xizmatlar": yo'nalishlar gorizontal ro'yxati (o'zi aylanadi). Ma'lumot bo'lmasa — chizilmaydi.
export default function ServiceCategories() {
  const { t } = useLanguage();
  const [categories, setCategories] = useState([]);
  const listRef = useAutoScroll(categories.length, ITEM_SLOT, 1800);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  if (categories.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('app.taklifXizmatlar.title')}</Text>
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={styles.link}>{t('app.taklifXizmatlar.all')}</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        ref={listRef}
        data={categories}
        keyExtractor={(item) => String(item.id)}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} activeOpacity={0.8}>
            <View style={[styles.iconBox, { backgroundColor: item.color + '18' }]}>
              {item.icon ? (
                <Text style={styles.emoji}>{item.icon}</Text>
              ) : (
                <MaterialCommunityIcons name="briefcase-outline" size={24} color={item.color} />
              )}
            </View>
            <Text style={styles.label} numberOfLines={2}>
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 26, marginBottom: 6 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  title: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  link: { color: COLORS.orange, fontSize: 14, fontWeight: '600' },
  list: { paddingHorizontal: 16, gap: 10 },
  item: { width: 66, alignItems: 'center' },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  label: {
    color: COLORS.gray,
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  emoji: { fontSize: 24 },
});
