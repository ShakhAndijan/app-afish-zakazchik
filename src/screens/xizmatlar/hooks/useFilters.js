import { useState, useEffect } from 'react';
import { getRegions, getDistricts } from '../../../api/reference';

// Filtr paneli holati: narx/tajriba/reyting/viloyat/tuman/tasdiqlangan.
// Viloyat va tuman ro'yxatlari backenddan (GET /regions, /regions/{id}/districts);
// `region` va `district` — id'lar.
export default function useFilters(initialCertifiedOnly = false) {
  const [sort, setSort] = useState(null);
  const [minExp, setMinExp] = useState(null);
  const [certifiedOnly, setCertifiedOnly] = useState(initialCertifiedOnly);
  const [minRating, setMinRating] = useState(null);
  const [region, setRegion] = useState(null);
  const [district, setDistrict] = useState(null);
  // Viloyat/tuman tanlash oynasi: 'region' | 'district' | null.
  const [pickerFor, setPickerFor] = useState(null);
  const [regions, setRegions] = useState([]);
  const [districts, setDistricts] = useState([]);

  useEffect(() => {
    let cancelled = false;
    getRegions()
      .then((data) => {
        if (!cancelled) setRegions(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!region) {
      setDistricts([]);
      return;
    }
    let cancelled = false;
    getDistricts(region)
      .then((data) => {
        if (!cancelled) setDistricts(data);
      })
      .catch(() => {
        if (!cancelled) setDistricts([]);
      });
    return () => {
      cancelled = true;
    };
  }, [region]);

  const hasActive = !!(
    sort || minExp || certifiedOnly || minRating || region || district
  );

  const reset = () => {
    setSort(null);
    setMinExp(null);
    setCertifiedOnly(false);
    setMinRating(null);
    setRegion(null);
    setDistrict(null);
  };

  const pickRegion = (r) => {
    setRegion(r.id);
    setDistrict(null);
    setPickerFor(null);
  };

  const pickDistrict = (d) => {
    setDistrict(d.id);
    setPickerFor(null);
  };

  return {
    sort,
    setSort,
    minExp,
    setMinExp,
    certifiedOnly,
    setCertifiedOnly,
    minRating,
    setMinRating,
    region,
    district,
    regions,
    districts,
    selectedRegion: regions.find((r) => r.id === region),
    selectedDistrict: districts.find((d) => d.id === district),
    pickerFor,
    setPickerFor,
    pickRegion,
    pickDistrict,
    hasActive,
    reset,
  };
}
