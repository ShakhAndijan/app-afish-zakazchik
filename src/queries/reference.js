import { useQuery } from '@tanstack/react-query';
import { getGenders, getRegions, getDistricts } from '../api/reference';

// Ma'lumotnomalar (jins, viloyat, tuman) deyarli o'zgarmaydi: bir kun yangi hisoblanadi,
// barcha ekranlar (profil tahrirlash, filtr paneli) bitta keshni ishlatadi.
const STALE_MS = 24 * 60 * 60 * 1000;

export const useGenders = () =>
  useQuery({ queryKey: ['reference', 'genders'], queryFn: getGenders, staleTime: STALE_MS });

export const useRegions = () =>
  useQuery({ queryKey: ['reference', 'regions'], queryFn: getRegions, staleTime: STALE_MS });

export const useDistricts = (regionId) =>
  useQuery({
    queryKey: ['reference', 'districts', regionId],
    queryFn: () => getDistricts(regionId),
    enabled: !!regionId,
    staleTime: STALE_MS,
  });
