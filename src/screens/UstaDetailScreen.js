import { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLanguage } from '../context/LanguageContext';
import { UstaStyleProvider, useUstaStyles } from './usta-detail/styles';
import useUstaDetail from './usta-detail/hooks/useUstaDetail';
import { pickProfile, buildBadges, buildStatItems, buildSchedule } from './usta-detail/derive';
import DetailHeader from './usta-detail/components/DetailHeader';
import ProfileHero from './usta-detail/components/ProfileHero';
import StatCards from './usta-detail/components/StatCards';
import BadgeRow from './usta-detail/components/BadgeRow';
import LanguagesSection from './usta-detail/components/LanguagesSection';
import SpecializationSection from './usta-detail/components/SpecializationSection';
import ServicePricesSection from './usta-detail/components/ServicePricesSection';
import ScheduleSection from './usta-detail/components/ScheduleSection';
import CertificatesSection from './usta-detail/components/CertificatesSection';
import WorksSection from './usta-detail/components/WorksSection';
import RatingSection from './usta-detail/components/RatingSection';
import ReviewsSection from './usta-detail/components/ReviewsSection';
import BottomCta from './usta-detail/components/BottomCta';

// Usta profili ekrani. Har bir bo'lim `usta-detail/components/` ichida alohida komponent;
// ma'lumot `hooks/useUstaDetail`, hisob-kitoblar `derive.js` da.
export default function UstaDetailScreen(props) {
  return (
    <UstaStyleProvider>
      <UstaDetailContent {...props} />
    </UstaStyleProvider>
  );
}

function UstaDetailContent({ usta, onBack, onGoToLogin, onOrderWorker, onSelectWork, isLoggedIn = false }) {
  const insets = useSafeAreaInsets();
  const { t: tr } = useLanguage();
  const { C, st } = useUstaStyles();

  const [reviewFilter, setReviewFilter] = useState('all');

  const {
    detail,
    loadingDetail,
    certificates,
    loadingCertificates,
    selectedCategoryId,
    setSelectedCategoryId,
    liked,
    toggleLike,
  } = useUstaDetail(usta);

  const profile = pickProfile({ detail, usta, C, tr });
  const { d, initial, name, trade, rating, rawRating, bgColor, location, experience, bio } = profile;

  const categories = detail?.categories || [];
  const portfolio = detail?.portfolio || [];
  const reviewItems = portfolio.filter((p) => p.comment || p.rating != null);
  const { weekDays, workHours, offDates } = buildSchedule(detail?.schedule || null);

  const handleOrderThisWorker = () => {
    const workerId = usta?.id ?? detail?.id;
    if (!workerId) return;
    onOrderWorker?.({
      id: workerId,
      name,
      trade,
      bgColor,
      initial,
      categoryId: detail?.mainCategoryId ?? null,
    });
  };

  return (
    <SafeAreaView style={st.safe} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />

      <DetailHeader
        onBack={onBack}
        shareInfo={{ name, trade, rating }}
        isLoggedIn={isLoggedIn}
        liked={liked}
        onToggleLike={toggleLike}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 14) + 76 }}
      >
        <View style={st.pad}>
          <ProfileHero
            initial={initial}
            name={name}
            trade={trade}
            location={location}
            rating={rating}
            bgColor={bgColor}
            photo={d.profile_photo}
            bio={bio}
            isOnline={profile.isOnline}
            isIdentityVerified={!!detail?.isIdentityVerified}
            avgResponseMin={detail?.avgResponseMin}
            showLoader={loadingDetail && !detail}
          />
          <StatCards items={buildStatItems({ d, experience, detail, portfolio, tr, C })} />
          <BadgeRow badges={buildBadges(d, tr, C)} />
          <LanguagesSection languages={profile.languages} />
          <SpecializationSection
            categories={categories}
            selectedId={selectedCategoryId}
            onSelect={setSelectedCategoryId}
            loading={loadingDetail}
          />
          <ServicePricesSection categories={categories} loading={loadingDetail} />
          {isLoggedIn && (
            <ScheduleSection weekDays={weekDays} workHours={workHours} offDates={offDates} />
          )}
          <CertificatesSection certificates={certificates} loading={loadingCertificates} />
        </View>

        <WorksSection portfolio={portfolio} loading={loadingDetail} onSelectWork={(work) => onSelectWork?.({ ...work, worker: name })} />

        <View style={st.pad}>
          <RatingSection
            rating={rating}
            rawRating={rawRating}
            reviewCount={detail?.reviewCount ?? 0}
            reviewItemsCount={reviewItems.length}
            ratingBreakdown={detail?.ratingBreakdown ?? null}
          />
          <ReviewsSection
            reviewItems={reviewItems}
            filter={reviewFilter}
            onFilterChange={setReviewFilter}
          />
        </View>
      </ScrollView>

      <BottomCta
        price={profile.startingPrice}
        onPress={isLoggedIn ? handleOrderThisWorker : onGoToLogin}
      />
    </SafeAreaView>
  );
}
