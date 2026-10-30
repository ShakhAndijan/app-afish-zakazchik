import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  FALLBACK_CONSENT_VERSION,
  acceptConsent,
  getAccountDeletion,
  getConsentStatus,
  getLegalDocument,
  getLegalIndex,
} from '../api/legal';
import { useLanguage } from '../context/LanguageContext';

const HOUR = 60 * 60 * 1000;

/** Hujjatlar ro'yxati va amaldagi rozilik versiyasi (ochiq endpoint). */
export function useLegalIndex() {
  return useQuery({
    queryKey: ['legal', 'index'],
    queryFn: getLegalIndex,
    staleTime: HOUR,
  });
}

/** Ro'yxat yuklanmagan/xato bo'lsa ham rozilik yuborilishi uchun zaxira versiya bilan. */
export function useConsentVersion() {
  const { data } = useLegalIndex();
  return data?.consentVersion ?? FALLBACK_CONSENT_VERSION;
}

/**
 * Bitta hujjat ilova tilida. Kesh kaliti `revision` ni o'z ichiga oladi: hujjat yangilansa (ro'yxatdagi
 * `revision` oshsa) eski matn emas, yangisi olinadi.
 */
export function useLegalDocument(key, enabled = true) {
  const { language } = useLanguage();
  const { data: index } = useLegalIndex();
  const revision = index?.documents.find((d) => d.key === key)?.revision ?? 0;
  return useQuery({
    queryKey: ['legal', 'doc', key, language, revision],
    queryFn: () => getLegalDocument(key),
    enabled,
    staleTime: HOUR,
  });
}

/** Hisobni o'chirsa nima bo'lishi va to'siqlar; ekran ochilganda doim yangidan olinadi. */
export function useAccountDeletion() {
  return useQuery({
    queryKey: ['account', 'deletion'],
    queryFn: getAccountDeletion,
    staleTime: 0,
    gcTime: 0,
  });
}

export const CONSENT_KEY = ['consent'];

/** Kirgan foydalanuvchi qayta rozilik berishi kerakmi (`required`). */
export function useConsentStatus(enabled) {
  return useQuery({
    queryKey: CONSENT_KEY,
    queryFn: getConsentStatus,
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAcceptConsent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: acceptConsent,
    onSuccess: (_data, version) => {
      queryClient.setQueryData(CONSENT_KEY, {
        version,
        acceptedAt: new Date().toISOString(),
        required: false,
      });
    },
  });
}
