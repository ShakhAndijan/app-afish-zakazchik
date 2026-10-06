import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as Crypto from 'expo-crypto';
import LocationMapPicker from '../components/LocationMapPicker';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';
import { getCategories } from '../api/categories';
import { createOrder } from '../api/orders';
import { stripCountryCode } from './new-order/utils';
import buildOrderPayload from './new-order/buildOrderPayload';
import CategoryPickerModal from './new-order/components/CategoryPickerModal';
import AddressModal from './new-order/components/AddressModal';
import ReviewModal from './new-order/components/ReviewModal';
import PhotoPreviewModal from './new-order/components/PhotoPreviewModal';
import TargetWorkerCard from './new-order/sections/TargetWorkerCard';
import CategorySection from './new-order/sections/CategorySection';
import DescriptionSection from './new-order/sections/DescriptionSection';
import AddressSection from './new-order/sections/AddressSection';
import WhenSection from './new-order/sections/WhenSection';
import PhotosSection from './new-order/sections/PhotosSection';
import ToolsSection from './new-order/sections/ToolsSection';
import WorkerCountSection from './new-order/sections/WorkerCountSection';
import RequirementsSection from './new-order/sections/RequirementsSection';
import PricingSection from './new-order/sections/PricingSection';
import PaymentSection from './new-order/sections/PaymentSection';
import ContactSection from './new-order/sections/ContactSection';
import SubmitButton from './new-order/sections/SubmitButton';
import useOrderPhotos from './new-order/hooks/useOrderPhotos';
import useOrderLocation from './new-order/hooks/useOrderLocation';

export default function NewOrderScreen({ onOrderCreated, targetWorker }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const { user } = useUser();

  const [orderWorker, setOrderWorker] = useState(targetWorker || null);
  const [categories, setCategories] = useState([]);
  const [categoryIds, setCategoryIds] = useState(
    targetWorker?.categoryId ? [targetWorker.categoryId] : []
  );
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [street, setStreet] = useState('');
  const [entrance, setEntrance] = useState('');
  const [floor, setFloor] = useState('');
  const [gpsLat, setGpsLat] = useState(null);
  const [gpsLng, setGpsLng] = useState(null);
  const [when, setWhen] = useState(null);
  const [whenDate, setWhenDate] = useState(null);
  const [previewIndex, setPreviewIndex] = useState(null);
  const [toolsOption, setToolsOption] = useState(null);
  const [workerCount, setWorkerCount] = useState(1);
  const [requirePhoto, setRequirePhoto] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [ageFrom, setAgeFrom] = useState('');
  const [ageTo, setAgeTo] = useState('');
  const [pricingType, setPricingType] = useState('hourly');
  const [hourlyRate, setHourlyRate] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [fixedPrice, setFixedPrice] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [phone, setPhone] = useState(stripCountryCode(user?.phone));
  const [backupPhone, setBackupPhone] = useState('');
  const [reviewOpen, setReviewOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // Bir xil so'rov qayta yuborilsa (masalan tarmoq xatosidan keyin "Tasdiqlash"
  // yana bosilsa) backend buni dublikat sifatida qaytarishi uchun shu bir xil
  // kalit qayta ishlatiladi — forma qayta ochilganda yangisi generatsiya qilinadi.
  const idempotencyKeyRef = useRef(null);

  const { photos, pickPhotos, removePhoto, uploadAll } = useOrderPhotos();
  const {
    regions,
    regionId,
    setRegionId,
    districts,
    districtId,
    setDistrictId,
    autoSelectLocation,
  } = useOrderLocation();

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  const toggleCategory = (id) => {
    setCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectedCategories = categories.filter((c) => categoryIds.includes(c.id));
  const selectedRegion = regions.find((r) => r.id === regionId);
  const selectedDistrict = districts.find((d) => d.id === districtId);
  const hasAddress = !!(districtId || regionId || street.trim() || gpsLat);
  const addressTitle =
    [selectedDistrict?.name, selectedRegion?.name].filter(Boolean).join(', ') ||
    street.trim() ||
    tr('newOrder.addressModalTitle');
  const addressSubtitle = selectedDistrict?.name || selectedRegion?.name ? street.trim() : '';

  const ready =
    categoryIds.length > 0 && description.trim().length > 0 && phone.trim().length > 0;

  // Payload va tasdiqlash oynasi uchun umumiy forma qiymatlari.
  const form = {
    description,
    categoryIds,
    orderWorker,
    phone,
    backupPhone,
    regionId,
    districtId,
    gpsLat,
    gpsLng,
    street,
    entrance,
    floor,
    when,
    whenDate,
    toolsOption,
    workerCount,
    requirePhoto,
    minRating,
    ageFrom,
    ageTo,
    pricingType,
    hourlyRate,
    estimatedHours,
    fixedPrice,
    paymentMethod,
  };

  const openReview = () => {
    idempotencyKeyRef.current = Crypto.randomUUID();
    setReviewOpen(true);
  };

  const handleMapChange = (lat, lng) => {
    const nLat = Number(lat);
    const nLng = Number(lng);
    setGpsLat(nLat);
    setGpsLng(nLng);
    autoSelectLocation(nLat, nLng);
  };

  const handleSubmit = async () => {
    if (submitting) return;
    const payload = buildOrderPayload(form);

    setSubmitting(true);
    try {
      if (photos.length > 0) {
        try {
          payload.photo_temp_keys = await uploadAll();
        } catch (uploadErr) {
          Alert.alert(
            tr('newOrder.submitErrorTitle'),
            uploadErr?.code === 'UNSUPPORTED_PHOTO_TYPE'
              ? tr('newOrder.photosUnsupported')
              : tr('newOrder.photosUploadFailed')
          );
          return;
        }
      }

      const created = await createOrder(payload, idempotencyKeyRef.current);
      setReviewOpen(false);
      onOrderCreated?.({
        id: created?.id ?? null,
        category: selectedCategories.map((c) => c.name).join(', '),
        address: addressTitle,
        raw: created,
      });
    } catch (err) {
      Alert.alert(
        tr('newOrder.submitErrorTitle'),
        err?.message || tr('common.error')
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top', 'left', 'right']}>
      <StatusBar style={t.isDark ? 'light' : 'dark'} />

      {/* Xarita "manzil" oynasi ochilishidan oldin shu yerda ko'rinmas holda
          oldindan yuklanib turadi — aks holda foydalanuvchi "Manzil"ga
          kirganda WebView noldan ishga tushib, sezilarli kutish bo'lardi. */}
      <View style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }} pointerEvents="none">
        <LocationMapPicker height={1} showExpand={false} />
      </View>

      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        extraScrollHeight={20}
        keyboardOpeningTime={0}
      >
        <Text style={[s.title, { color: t.text }]}>{tr('newOrder.headerTitle')}</Text>
        <Text style={[s.subtitle, { color: t.muted }]}>{tr('newOrder.headerSubtitle')}</Text>

        <TargetWorkerCard orderWorker={orderWorker} setOrderWorker={setOrderWorker} />
        <CategorySection
          selectedCategories={selectedCategories}
          toggleCategory={toggleCategory}
          setCategoryPickerOpen={setCategoryPickerOpen}
        />
        <DescriptionSection
          selectedCategories={selectedCategories}
          description={description}
          setDescription={setDescription}
        />
        <AddressSection
          hasAddress={hasAddress}
          setAddressModalOpen={setAddressModalOpen}
          addressTitle={addressTitle}
          addressSubtitle={addressSubtitle}
        />
        <WhenSection when={when} setWhen={setWhen} whenDate={whenDate} setWhenDate={setWhenDate} />
        <PhotosSection
          photos={photos}
          pickPhotos={pickPhotos}
          removePhoto={removePhoto}
          setPreviewIndex={setPreviewIndex}
        />
        <ToolsSection toolsOption={toolsOption} setToolsOption={setToolsOption} />
        <WorkerCountSection workerCount={workerCount} setWorkerCount={setWorkerCount} />
        <RequirementsSection
          requirePhoto={requirePhoto}
          setRequirePhoto={setRequirePhoto}
          minRating={minRating}
          setMinRating={setMinRating}
          ageFrom={ageFrom}
          setAgeFrom={setAgeFrom}
          ageTo={ageTo}
          setAgeTo={setAgeTo}
        />
        <PricingSection
          pricingType={pricingType}
          setPricingType={setPricingType}
          hourlyRate={hourlyRate}
          setHourlyRate={setHourlyRate}
          estimatedHours={estimatedHours}
          setEstimatedHours={setEstimatedHours}
          fixedPrice={fixedPrice}
          setFixedPrice={setFixedPrice}
        />
        <PaymentSection paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />
        <ContactSection
          phone={phone}
          setPhone={setPhone}
          backupPhone={backupPhone}
          setBackupPhone={setBackupPhone}
        />
        <SubmitButton ready={ready} onPress={openReview} />
      </KeyboardAwareScrollView>

      <CategoryPickerModal
        visible={categoryPickerOpen}
        onClose={() => setCategoryPickerOpen(false)}
        categories={categories}
        selectedIds={categoryIds}
        onToggle={toggleCategory}
        t={t}
        tr={tr}
      />

      <AddressModal
        visible={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        regions={regions}
        regionId={regionId}
        onSelectRegion={setRegionId}
        districts={districts}
        districtId={districtId}
        onSelectDistrict={setDistrictId}
        street={street}
        onStreetChange={setStreet}
        entrance={entrance}
        onEntranceChange={setEntrance}
        floor={floor}
        onFloorChange={setFloor}
        gpsLat={gpsLat}
        gpsLng={gpsLng}
        onMapChange={handleMapChange}
        t={t}
        tr={tr}
      />

      <ReviewModal
        {...form}
        visible={reviewOpen}
        onClose={() => setReviewOpen(false)}
        onConfirm={handleSubmit}
        submitting={submitting}
        t={t}
        tr={tr}
        selectedCategories={selectedCategories}
        addressTitle={addressTitle}
        addressSubtitle={addressSubtitle}
        photos={photos}
      />

      <PhotoPreviewModal
        photos={photos}
        previewIndex={previewIndex}
        setPreviewIndex={setPreviewIndex}
      />

    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  title: { fontWeight: '800', fontSize: 22, marginTop: 6 },
  subtitle: { fontSize: 13.5, lineHeight: 19, marginTop: 6, marginBottom: 20 },
});
