import { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../../constants/colors';
import { useLanguage } from '../../../context/LanguageContext';
import { getCategories } from '../../../api/categories';
import CategoryPills from '../../zakazchi-main/components/ServiceCategories';

// "Taklif xizmatlar": yo'nalishlar rangli kartalarda, ikki qatorda (bosh sahifadagi bilan bir xil).
// Ma'lumot bo'lmasa — chizilmaydi.
export default function ServiceCategories() {
  const { t } = useLanguage();
  const [categories, setCategories] = useState([]);

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
      </View>
      <CategoryPills categories={categories} horizontalPadding={16} />
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
});
