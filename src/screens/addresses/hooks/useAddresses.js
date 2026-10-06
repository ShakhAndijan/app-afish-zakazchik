import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCustomerMe, updateCustomerMe } from '../../../api/user';
import { PRIMARY_ID } from '../constants';

const storageKey = (customerId) => `saved_addresses_${customerId ?? 'guest'}`;

const toNumber = (v) => {
  const n = Number(v);
  return v != null && v !== '' && Number.isFinite(n) ? n : null;
};

// /customers/me dagi bitta "asosiy manzil" (viloyat, tuman, manzil, GPS) — shaklini
// qo'shimcha manzillar bilan bir xil qilib beradi. Hech narsa yo'q bo'lsa — null.
export function primaryFromMe(me) {
  if (!me) return null;
  const lat = toNumber(me.default_gps_lat);
  const lng = toNumber(me.default_gps_lng);
  const hasAny = me.region || me.district || me.address || lat != null;
  if (!hasAny) return null;
  return {
    id: PRIMARY_ID,
    label: 'home',
    regionId: me.region?.id ?? null,
    regionName: me.region?.name ?? '',
    districtId: me.district?.id ?? null,
    districtName: me.district?.name ?? '',
    street: me.address ?? '',
    entrance: '',
    floor: '',
    lat,
    lng,
  };
}

async function readExtras(customerId) {
  try {
    const raw = await AsyncStorage.getItem(storageKey(customerId));
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

// "Mening manzillarim": asosiy manzil backenddan (GET/PATCH /customers/me),
// qo'shimcha manzillar esa — backendda ro'yxat endpointi yo'qligi uchun — shu
// qurilmada (AsyncStorage) saqlanadi.
export default function useAddresses() {
  const [me, setMe] = useState(null);
  const [extras, setExtras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const customerIdRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const data = await getCustomerMe();
      customerIdRef.current = data?.id ?? null;
      setMe(data);
      setExtras(await readExtras(customerIdRef.current));
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const persistExtras = (next) => {
    setExtras(next);
    AsyncStorage.setItem(storageKey(customerIdRef.current), JSON.stringify(next)).catch(() => {});
  };

  const saveExtra = (address) => {
    if (address.id && extras.some((a) => a.id === address.id)) {
      persistExtras(extras.map((a) => (a.id === address.id ? address : a)));
    } else {
      persistExtras([...extras, { ...address, id: `a${Date.now()}` }]);
    }
  };

  const removeExtra = (id) => persistExtras(extras.filter((a) => a.id !== id));

  const savePrimary = async (address) => {
    await updateCustomerMe({
      region_id: address.regionId,
      district_id: address.districtId,
      address: address.street.trim() || null,
      default_gps_lat: address.lat,
      default_gps_lng: address.lng,
    });
    setMe(await getCustomerMe());
  };

  return {
    primary: primaryFromMe(me),
    extras,
    loading,
    failed,
    retry: load,
    savePrimary,
    saveExtra,
    removeExtra,
  };
}
