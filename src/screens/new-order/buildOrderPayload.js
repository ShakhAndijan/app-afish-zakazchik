// Forma holatidan POST /api/v1/orders uchun payload yig'adi.
// (rasmlar alohida yuklanadi va `photo_temp_keys` sifatida keyin qo'shiladi)

import { TIMING_KIND_MAP } from './constants';
import { toISODate } from './utils';

export default function buildOrderPayload({
  description,
  categoryIds,
  orderWorker,
  phone,
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
  backupPhone,
  requirePhoto,
  requireVerified,
  minRating,
  minExperience,
  extraRequirements,
  ageFrom,
  ageTo,
  pricingType,
  hourlyRate,
  estimatedHours,
  fixedPrice,
  paymentMethod,
}) {
  // Aniq ustaga buyurtma berilganda ishchiga talablar yuborilmaydi (faqat "boshqa talablar" matni).
  const targeted = orderWorker?.id != null;
  return {
    description: description.trim(),
    category_id: categoryIds[0] ?? null,
    task_category_ids: categoryIds,
    worker_id: orderWorker?.id ?? null,
    // E'londan "Shu xizmatni buyurtma qilish" orqali kelgan bo'lsa, buyurtma shu e'longa bog'lanadi.
    listing_id: orderWorker?.listingId ?? null,
    contact_phone: `+998${phone.trim()}`,
    backup_phone: backupPhone?.trim() ? `+998${backupPhone.trim()}` : null,
    region_id: regionId,
    district_id: districtId,
    gps_lat: gpsLat,
    gps_lng: gpsLng,
    location_landmark: street.trim() || null,
    entrance: entrance.trim() || null,
    floor: floor.trim() || null,
    timing_kind: when ? TIMING_KIND_MAP[when] : null,
    scheduled_date: when === 'date' && whenDate ? toISODate(whenDate) : null,
    tools_provided_by:
      toolsOption === 'has' ? 'customer' : toolsOption === 'needed' ? 'worker' : null,
    workers_needed: workerCount,
    require_photo: targeted ? null : requirePhoto,
    require_verified: targeted ? null : requireVerified || null,
    min_rating: targeted ? null : minRating || null,
    min_experience_years: targeted ? null : minExperience || null,
    extra_requirements: extraRequirements?.trim() || null,
    worker_age_min: !targeted && ageFrom.trim() ? Number(ageFrom) : null,
    worker_age_max: !targeted && ageTo.trim() ? Number(ageTo) : null,
    price_mode: pricingType,
    hourly_rate: pricingType === 'hourly' && hourlyRate.trim() ? Number(hourlyRate) : null,
    estimated_hours:
      pricingType === 'hourly' && estimatedHours.trim() ? Number(estimatedHours) : null,
    budget: pricingType === 'fixed' && fixedPrice.trim() ? Number(fixedPrice) : null,
    payment_method: paymentMethod,
  };
}
