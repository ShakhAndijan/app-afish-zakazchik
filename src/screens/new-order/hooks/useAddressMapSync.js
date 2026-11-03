// Manzil oynasi: viloyat/tuman tanlanganda xaritani surish va ko'cha nomi
// bilan xarita qidiruvini ikki tomonlama moslashtirish.

import { useState, useEffect, useRef } from 'react';
import { REGION_COORDS } from '../constants';
import { areaCenter, searchAddresses } from '../../../utils/addressSearch';

// Foydalanuvchi yozishni to'xtatgandan keyin takliflar qancha kutib qidiriladi (har harfga so'rov
// yuborilmasligi uchun). Xarita o'zi siljimaydi — joy faqat taklif tanlanganda ko'rsatiladi.
const SEARCH_DEBOUNCE_MS = 700;
const MIN_QUERY_LENGTH = 3;

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

  // ── Ko'cha nomi yozilganda mos manzillar taklif qilinadi; xarita faqat taklif tanlanganda siljiydi ──
  // Xaritadan topilgan matn (`lastResolvedRef`) qayta qidirilmaydi.
  const lastResolvedRef = useRef(null);
  const areaRef = useRef({
    district: selectedDistrictName,
    region: selectedRegionName,
    geocodeQuery,
  });
  const seqRef = useRef(0);
  // `street` — qaysi matn uchun qidirilgani: matn o'zgarsa eski natija o'zi yashiriladi.
  const [result, setResult] = useState({ street: null, list: [] });
  const [searching, setSearching] = useState(false);
  // Tanlangan taklif matni: shu matn turganda ro'yxat qayta chiqmaydi.
  const [pickedText, setPickedText] = useState(null);
  const [focusPoint, setFocusPoint] = useState(null);

  useEffect(() => {
    areaRef.current = {
      district: selectedDistrictName,
      region: selectedRegionName,
      geocodeQuery,
    };
  }, [selectedDistrictName, selectedRegionName, geocodeQuery]);

  useEffect(() => {
    const text = street?.trim() || '';
    if (street === lastResolvedRef.current || text.length < MIN_QUERY_LENGTH) return undefined;
    const handle = setTimeout(async () => {
      const seq = ++seqRef.current;
      const { district, region, geocodeQuery: areaQuery } = areaRef.current;
      const parts = [text];
      if (district) parts.push(district);
      if (region) parts.push(region);
      parts.push("O'zbekiston");
      setSearching(true);
      const area = areaQuery ? await areaCenter(areaQuery) : null;
      const list = await searchAddresses(
        { query: parts.join(', '), street: text, district, region },
        area
      );
      if (seq !== seqRef.current) return;
      setSearching(false);
      setResult({ street, list });
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

  // Taklif tanlandi: matn maydonga yoziladi, xarita shu joyga o'tib, pin qo'yiladi.
  const selectSuggestion = (item) => {
    lastResolvedRef.current = item.title;
    setPickedText(item.title);
    onStreetChange(item.title);
    setFocusPoint({ lat: item.lat, lng: item.lng, zoom: 18, key: Date.now() });
  };

  const fresh = result.street === street && pickedText !== street;
  const suggestions = fresh ? result.list : [];
  const noResults = fresh && result.list.length === 0;
  const isSearching = searching && !fresh && (street?.trim().length || 0) >= MIN_QUERY_LENGTH;

  return {
    panLat,
    panLng,
    panZoom,
    geocodeQuery,
    geocodeZoom,
    focusPoint,
    suggestions,
    noResults,
    isSearching,
    selectSuggestion,
    handleAddressResolved,
  };
}
