import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { useLanguage } from '../context/LanguageContext';
import LandingHeader from './landing/components/LandingHeader';
import SearchBar from './landing/components/SearchBar';
import PromoBanner from './landing/components/PromoBanner';
import TrustRow from './landing/components/TrustRow';
import ServiceCategories from './landing/components/ServiceCategories';
import TopWorkers from './landing/components/TopWorkers';
import TopWorks from './landing/components/TopWorks';
import StatsBand from './landing/components/StatsBand';
import SectionHead from './landing/components/SectionHead';
import HowItWorks from './landing/components/HowItWorks';
import ReviewsCarousel from './landing/components/ReviewsCarousel';
import Benefits from './landing/components/Benefits';
import ClosingCta from './landing/components/ClosingCta';

// Kirmagan foydalanuvchi (mehmon) uchun bosh sahifa. Har bir bo'lim `landing/components/` da.
export default function LandingScreen({ onLogin, onSelectUsta }) {
  const { t } = useLanguage();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <LandingHeader onLogin={onLogin} />
        <SearchBar />

        <PromoBanner onPress={onLogin} />
        <TrustRow />

        <ServiceCategories />
        <TopWorkers onSelectUsta={onSelectUsta} />
        <TopWorks />
        <StatsBand />

        <SectionHead title={t('app.sectionHead.howItWorks')} />
        <HowItWorks />

        <SectionHead title={t('app.sectionHead.reviews')} />
        <ReviewsCarousel />

        <SectionHead title={t('app.sectionHead.whyAfish')} />
        <Benefits />

        <ClosingCta onPress={onLogin} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  scrollContent: { paddingBottom: 110 },
});
