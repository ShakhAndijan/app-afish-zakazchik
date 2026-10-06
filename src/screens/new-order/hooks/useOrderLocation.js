// Viloyat/tuman ro'yxatlari va xaritadagi nuqtaga qarab ularni avtomatik tanlash.

import { useState, useEffect, useRef } from 'react';
import { getRegions, getDistricts } from '../../../api/reference';
import { findNearestByCoords } from '../utils';

export default function useOrderLocation() {
  const [regions, setRegions] = useState([]);
  const [regionId, setRegionId] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [districtId, setDistrictId] = useState(null);

  // Xaritada nuqta tanlanganda topilgan viloyatning tumanlar ro'yxati hali
  // yuklanmagan bo'lishi mumkin — shu holatda maqsad koordinatani shu yerga
  // saqlab, ro'yxat kelgach tuman moslashtiriladi (pastdagi effektga qarang).
  const pendingAutoDistrictRef = useRef(null);

  // Saqlangan manzilni tahrirlashda: viloyat o'rnatiladi, tumanlar ro'yxati kelgach
  // shu tuman tanlanadi.
  const pendingDistrictIdRef = useRef(null);
  const presetLocation = (presetRegionId, presetDistrictId) => {
    pendingDistrictIdRef.current = presetDistrictId ?? null;
    setRegionId(presetRegionId ?? null);
  };

  const autoSelectLocation = (mapLat, mapLng) => {
    if (!Number.isFinite(mapLat) || !Number.isFinite(mapLng) || regions.length === 0) return;
    const nearestRegion = findNearestByCoords(regions, mapLat, mapLng);
    if (!nearestRegion) return;
    if (nearestRegion.id !== regionId) {
      pendingAutoDistrictRef.current = { lat: mapLat, lng: mapLng };
      setRegionId(nearestRegion.id);
      return;
    }
    const nearestDistrict = findNearestByCoords(districts, mapLat, mapLng);
    if (nearestDistrict && nearestDistrict.id !== districtId) {
      setDistrictId(nearestDistrict.id);
    }
  };

  useEffect(() => {
    getRegions().then(setRegions).catch(() => {});
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
        } else if (pendingAutoDistrictRef.current) {
          const { lat: pLat, lng: pLng } = pendingAutoDistrictRef.current;
          pendingAutoDistrictRef.current = null;
          const nearestDistrict = findNearestByCoords(d, pLat, pLng);
          if (nearestDistrict) setDistrictId(nearestDistrict.id);
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
