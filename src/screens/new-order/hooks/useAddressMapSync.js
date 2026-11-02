// Manzil oynasi: viloyat/tuman tanlanganda xaritani surish va ko'cha nomi
// bilan xarita qidiruvini ikki tomonlama moslashtirish.

import { useState, useEffect, useRef } from 'react';
import { REGION_COORDS } from '../constants';

// Foydalanuvchi yozishni to'xtatgandan keyin xarita qidiruvi qancha kutib boshlanadi: yozuv
// tugamagan paytda xarita boshqa joyga sakrab ketmasligi uchun.
const SEARCH_DEBOUNCE_MS = 2000;

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
  // Xaritadan topilgan matn (`lastResolvedRef`) qayta qidirilmaydi: aks holda xarita topilgan manzilni
  // matn bo'yicha qayta izlab, boshqa joyga sakrab ketardi. Viloyat/tuman o'zgarishi ham qidiruvni
  // ishga tushirmaydi (ular avtomatik tanlanadi) — faqat foydalanuvchi ko'cha matnini o'zgartirganda.
  const lastResolvedRef = useRef(null);
  const areaRef = useRef({ district: selectedDistrictName, region: selectedRegionName });
  const [searchQuery, setSearchQuery] = useState(null);

  useEffect(() => {
    areaRef.current = { district: selectedDistrictName, region: selectedRegionName };
  }, [selectedDistrictName, selectedRegionName]);

  useEffect(() => {
    if (street === lastResolvedRef.current) return;
    if (!street || street.trim().length < 4) {
      setSearchQuery(null);
      return;
    }
    const handle = setTimeout(() => {
      const { district, region } = areaRef.current;
      const parts = [street.trim()];
      if (district) parts.push(district);
      if (region) parts.push(region);
      parts.push("O'zbekiston");
      setSearchQuery({ query: parts.join(', '), street: street.trim(), district, region });
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [street]);

  const handleAddressResolved = (data) => {
    const text = data.street
      ? data.house
        ? `${data.street}, ${data.house}`
        : data.street
      : data.addressLine;
    if (text) {
      lastResolvedRef.current = text;
      onStreetChange(text);
    }
  };

  return { panLat, panLng, panZoom, geocodeQuery, geocodeZoom, searchQuery, handleAddressResolved };
}
