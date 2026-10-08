import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { useLanguage } from '../context/LanguageContext';
import { DarkScope } from '../context/ThemeContext';
import LandingHeader from './landing/components/LandingHeader';
import PromoBanner from './landing/components/PromoBanner';
import TrustRow from './landing/components/TrustRow';
import ServiceCategories from './landing/components/ServiceCategories';
import SeasonalSection from './landing/components/SeasonalSection';
import TopWorkers from './landing/components/TopWorkers';
import TopWorks from './landing/components/TopWorks';
import SectionHead from './landing/components/SectionHead';
import HowItWorks from './landing/components/HowItWorks';
import ReviewsCarousel from './landing/components/ReviewsCarousel';
import Benefits from './landing/components/Benefits';
import ClosingCta from './landing/components/ClosingCta';
import PromoBanners from './zakazchi-main/components/PromoBanners';
import useTabBarSpace from '../navigation/useTabBarSpace';

// Kirmagan foydalanuvchi (mehmon) uchun bosh sahifa. Har bir bo'lim `landing/components/` da.
export default function LandingScreen({ onLogin, onSelectUsta }) {
  const bottomSpace = useTabBarSpace(110);
  const { t } = useLanguage();

  return (
    <DarkScope>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: bottomSpace }}
        >
          <LandingHeader onLogin={onLogin} />

          <PromoBanner onPress={onLogin} />
          <TrustRow />

          <ServiceCategories />
          <SeasonalSection onLogin={onLogin} />

          <SectionHead title={t('app.sectionHead.howItWorks')} />
          <HowItWorks />

          <TopWorkers onSelectUsta={onSelectUsta} />
          <TopWorks />

          {/* Mehmon uchun hamma slayd kirish oynasiga olib boradi */}
          <PromoBanners style={{ marginTop: 28 }} hPad={16} onSlidePress={onLogin} />

          <ReviewsCarousel />

          <SectionHead title={t('app.sectionHead.whyAfish')} />
          <Benefits />

          <ClosingCta onPress={onLogin} />
        </ScrollView>
      </SafeAreaView>
    </DarkScope>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
});
