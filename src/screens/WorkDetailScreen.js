import { useState } from 'react';
import { View, ScrollView, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import useWorkDetails from './work-detail/hooks/useWorkDetails';
import { colorForName } from './work-detail/utils';
import WorkDetailHeader from './work-detail/components/WorkDetailHeader';
import WorkHero from './work-detail/components/WorkHero';
import WorkMeta from './work-detail/components/WorkMeta';
import WorkerCard from './work-detail/components/WorkerCard';
import PriceSection from './work-detail/components/PriceSection';
import { MasterNoteSection, CustomerReviewSection } from './work-detail/components/NoteSections';
import PhotoThumbs from './work-detail/components/PhotoThumbs';

// Bajarilgan ish tafsiloti. Backenddan kelmagan maydonlar namuna ma'lumot bilan to'ldiriladi
// (`work-detail/mock.js`) va "Namuna ma'lumot" belgisi bilan ko'rsatiladi.
export default function WorkDetailScreen({ work, onBack, onSelectUsta }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const [photoIndex, setPhotoIndex] = useState(0);
  const { details, isMock, beforePhotos } = useWorkDetails(work);

  const title = work?.title || tr('workDetail.headerTitle');
  const worker = work?.worker || '';
  const rating = typeof work?.rating === 'number' ? work.rating : 0;
  const photos = work?.photos || [];
  const workerInitial = worker ? worker[0].toUpperCase() : '?';
  const workerColor = colorForName(worker);
  const workerName = worker || tr('workDetail.unknownMaster');

  const openUstaProfile = () => {
    onSelectUsta?.({
      id: work?.workerId ?? undefined,
      initial: workerInitial,
      name: workerName,
      trade: details.category,
      rating,
      bgColor: workerColor,
      location: details.location,
    });
  };

  const share = () => {
    Share.share({
      message: tr('workDetail.shareMessage', {
        title,
        byline: worker ? tr('workDetail.shareByline', { worker }) : '',
        rating: rating.toFixed(1),
      }),
    }).catch(() => {});
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top', 'left', 'right']}>
      <StatusBar style={t.isDark ? 'light' : 'dark'} />
      <WorkDetailHeader onBack={onBack} onShare={share} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <WorkHero photos={photos} index={photoIndex} onIndexChange={setPhotoIndex} rating={rating} />

        <View style={{ paddingHorizontal: 20, paddingTop: 18 }}>
          <WorkMeta
            title={title}
            category={details.category}
            location={details.location}
            postedAgo={details.postedAgo}
            mock={isMock.meta}
          />

          <WorkerCard
            name={workerName}
            initial={workerInitial}
            color={workerColor}
            rating={rating}
            onPress={openUstaProfile}
          />

          <PriceSection details={details} mock={isMock.priceSection} showSplit={isMock.priceSplit} />

          <MasterNoteSection
            name={workerName}
            initial={workerInitial}
            color={workerColor}
            text={details.masterNote}
            mock={isMock.masterNote}
            onPressMaster={openUstaProfile}
          />

          <CustomerReviewSection review={details.customerReview} mock={isMock.review} />

          {photos.length > 1 && (
            <PhotoThumbs
              title={tr('workDetail.allPhotos', { count: photos.length })}
              photos={photos}
              selectedIndex={photoIndex}
              onSelect={setPhotoIndex}
            />
          )}

          {beforePhotos.length > 0 && (
            <PhotoThumbs
              title={tr('workDetail.beforePhotos', { count: beforePhotos.length })}
              photos={beforePhotos}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
