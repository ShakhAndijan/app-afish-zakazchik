// Viloyat/tuman ro'yxatlari va xaritadagi nuqtaga qarab ularni avtomatik tanlash.

import { useState, useEffect, useRef } from 'react';
import { getRegions, getDistricts, getNearestRegion } from '../../../api/reference';

export default function useOrderLocation() {
  const [regions, setRegions] = useState([]);
  const [regionId, setRegionId] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [districtId, setDistrictId] = useState(null);

  // Xaritada nuqta tanlanganda server topgan viloyat o'zgarsa, tumanlar ro'yxati hali
  // yuklanmagan bo'ladi — shu holatda tuman id'sini saqlab, ro'yxat kelgach tanlaymiz.
  const pendingAutoDistrictRef = useRef(null);
  // Eski javob yangisini bosib ketmasligi uchun so'rovlar tartibi.
  const nearestSeqRef = useRef(0);

  // Saqlangan manzilni tahrirlashda: viloyat o'rnatiladi, tumanlar ro'yxati kelgach
  // shu tuman tanlanadi.
  const pendingDistrictIdRef = useRef(null);
  const presetLocation = (presetRegionId, presetDistrictId) => {
    pendingDistrictIdRef.current = presetDistrictId ?? null;
    setRegionId(presetRegionId ?? null);
  };

  // Nuqtaga mos viloyat/tuman serverdan olinadi (GET /regions/nearest); topilmasa tanlov o'zgarmaydi.
  const autoSelectLocation = async (mapLat, mapLng) => {
    if (!Number.isFinite(mapLat) || !Number.isFinite(mapLng)) return;
    const seq = ++nearestSeqRef.current;
    let nearest;
    try {
      nearest = await getNearestRegion(mapLat, mapLng);
    } catch {
      return;
    }
    if (seq !== nearestSeqRef.current || !nearest?.region) return;
    const nextDistrictId = nearest.district?.id ?? null;
    if (nearest.region.id !== regionId) {
      pendingAutoDistrictRef.current = nextDistrictId;
      setRegionId(nearest.region.id);
      return;
    }
    if (nextDistrictId != null && nextDistrictId !== districtId) setDistrictId(nextDistrictId);
  };

  useEffect(() => {
    getRegions()
      .then(setRegions)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!regionId) {
      setDistricts([]);
      setDistrictId(null);
      return;
    }
    let cancelled = false;
    getDistricts(regionId)
      .then((d) => {
        if (cancelled) return;
        setDistricts(d);
        if (pendingDistrictIdRef.current != null) {
          const presetId = pendingDistrictIdRef.current;
          pendingDistrictIdRef.current = null;
          if (d.some((x) => x.id === presetId)) setDistrictId(presetId);
        } else if (pendingAutoDistrictRef.current != null) {
          const autoId = pendingAutoDistrictRef.current;
          pendingAutoDistrictRef.current = null;
          if (d.some((x) => x.id === autoId)) setDistrictId(autoId);
        }
      })
      .catch(() => {});
    setDistrictId(null);
    return () => {
      cancelled = true;
    };
  }, [regionId]);

  return {
    regions,
    regionId,
    setRegionId,
    districts,
    districtId,
    setDistrictId,
    autoSelectLocation,
    presetLocation,
  };
}
