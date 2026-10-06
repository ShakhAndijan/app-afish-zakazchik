import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '../../../context/LanguageContext';
import { useXizmatlarStyles } from '../styles';
import CategoryGlyph from './CategoryGlyph';

// Yo'nalish sahifasining to'q sarg'ish tepa qismi: qidiruv qatori, yo'nalish nomi, ustalar soni.
export default function CategoryHero({ category, mastersCount, searchRow }) {
  const { t: tr } = useLanguage();
  const { styles } = useXizmatlarStyles();

  return (
    <View style={styles.heroShadowWrap}>
      <LinearGradient
        colors={['#f2985f', '#e87a45', '#c9591f']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <Text style={styles.heroWatermark}>{category?.glyph}</Text>

        {searchRow}

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 20 }}>
          <View style={styles.heroIconWrap}>
            <CategoryGlyph glyph={category?.glyph} color="#fff" size={28} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroEyebrow}>{tr('xizmatlar.detail.direction')}</Text>
            <Text style={styles.heroTitle}>{category?.label}</Text>
            <Text style={styles.heroSubtitle}>
              {tr('xizmatlar.detail.activeInDirection', { count: mastersCount })}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}
