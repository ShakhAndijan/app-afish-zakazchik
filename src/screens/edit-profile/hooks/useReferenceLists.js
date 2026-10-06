import { useState, useEffect } from 'react';
import { getGenders, getRegions, getDistricts } from '../../../api/reference';

// Tanlov ro'yxatlari backenddan: jinslar, viloyatlar va tanlangan viloyat tumanlari.
export default function useReferenceLists(regionId) {
  const [genders, setGenders] = useState([]);
  const [regions, setRegions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [gendersLoading, setGendersLoading] = useState(true);
  const [regionsLoading, setRegionsLoading] = useState(true);
  const [districtsLoading, setDistrictsLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    getGenders()
      .then((list) => {
        if (alive) setGenders(list ?? []);
      })
      .catch(() => {})
      .finally(() => alive && setGendersLoading(false));
    getRegions()
      .then((list) => {
        if (alive) setRegions(list ?? []);
      })
      .catch(() => {})
      .finally(() => alive && setRegionsLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!regionId) {
      setDistricts([]);
      return;
    }
    let alive = true;
    setDistrictsLoading(true);
    getDistricts(regionId)
      .then((list) => {
        if (alive) setDistricts(list ?? []);
      })
      .catch(() => {
        if (alive) setDistricts([]);
      })
      .finally(() => alive && setDistrictsLoading(false));
    return () => {
      alive = false;
    };
  }, [regionId]);

  return { genders, regions, districts, gendersLoading, regionsLoading, districtsLoading };
}
