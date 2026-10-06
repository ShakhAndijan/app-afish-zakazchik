// Manzil oynasi: viloyat/tuman tanlanganda xaritani surish va ko'cha nomi
// bilan xarita qidiruvini ikki tomonlama moslashtirish.

import { useState, useEffect, useRef } from 'react';
import { REGION_COORDS } from '../constants';

export default function useAddressMapSync({
  regions,
  regionId,
  selectedRegionName,
  selectedDistrictName,
  street,
  onStreetChange,
}) {
  // Viloyat/tuman tanlanganda faqat xarita ko'rinishi shu tomonga suriladi —
  // pin/joylashuv HECH QACHON o'zgartirilmaydi (onMapChange chaqirilmaydi).
  // Foydalanuvchi xaritaga o'zi bosgandagina yoki "hozirgi joylashuv"ni
  // ishlatgandagina aniq nuqta belgilanadi.
  const selectedRegion = regions.find((r) => r.id === regionId);
  const regionCoords = selectedRegion ? REGION_COORDS[selectedRegion.code] : null;
  const panLat = regionCoords ? regionCoords[0] : null;
  const panLng = regionCoords ? regionCoords[1] : null;
  const panZoom = selectedDistrictName ? 12 : 9;

  // Backend viloyat/tuman uchun koordinata bermaydi — shuning uchun Yandex'ning
  // o'z geokoderidan (ko'rinishni surish uchun, pin qo'ymaydi) foydalanamiz.
  const geocodeQuery = selectedDistrictName
    ? `${selectedDistrictName}, ${selectedRegionName}, O'zbekiston`
    : selectedRegionName
      ? `${selectedRegionName}, O'zbekiston`
      : null;
  const geocodeZoom = selectedDistrictName ? 12 : 9;

  // ── Ikki tomonlama moslashuv: xaritaga bosilsa manzil maydonlariga
  // yoziladi, ko'cha nomi yozilsa esa xaritada shu joy topiladi ──
  const skipNextSearchRef = useRef(false);
  const [searchQuery, setSearchQuery] = useState(null);

  useEffect(() => {
    if (skipNextSearchRef.current) {
      skipNextSearchRef.current = false;
      return;
    }
    if (!street || street.trim().length < 4) {
      setSearchQuery(null);
      return;
    }
    const handle = setTimeout(() => {
      const parts = [street.trim()];
      if (selectedDistrictName) parts.push(selectedDistrictName);
      if (selectedRegionName) parts.push(selectedRegionName);
      parts.push("O'zbekiston");
      setSearchQuery(parts.join(', '));
    }, 900);
    return () => clearTimeout(handle);
  }, [street, selectedDistrictName, selectedRegionName]);

  const handleAddressResolved = (data) => {
    const text = data.street
      ? data.house
        ? `${data.street}, ${data.house}`
        : data.street
      : data.addressLine;
    if (text) {
      skipNextSearchRef.current = true;
      onStreetChange(text);
    }
  };

  return { panLat, panLng, panZoom, geocodeQuery, geocodeZoom, searchQuery, handleAddressResolved };
}
