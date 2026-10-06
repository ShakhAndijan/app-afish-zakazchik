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
  requirePhoto,
  minRating,
  ageFrom,
  ageTo,
  pricingType,
  hourlyRate,
  estimatedHours,
  fixedPrice,
  paymentMethod,
}) {
  return {
    description: description.trim(),
    category_id: categoryIds[0] ?? null,
    task_category_ids: categoryIds,
    worker_id: orderWorker?.id ?? null,
    contact_phone: `+998${phone.trim()}`,
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
    require_photo: requirePhoto,
    min_rating: minRating || null,
    worker_age_min: ageFrom.trim() ? Number(ageFrom) : null,
    worker_age_max: ageTo.trim() ? Number(ageTo) : null,
    price_mode: pricingType,
    hourly_rate: pricingType === 'hourly' && hourlyRate.trim() ? Number(hourlyRate) : null,
    estimated_hours:
      pricingType === 'hourly' && estimatedHours.trim() ? Number(estimatedHours) : null,
    budget: pricingType === 'fixed' && fixedPrice.trim() ? Number(fixedPrice) : null,
    payment_method: paymentMethod,
  };
}
