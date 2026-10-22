import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';

// Ikkala token (access + refresh) bitta SecureStore yozuvida JSON bo'lib saqlanadi.
const SESSION_KEY = 'session_tokens';
const ACTOR_TYPE_KEY = 'actor_type';
// AsyncStorage'dagi belgi: sessiya borligi va u qanday saqlangani. Qiymatni SecureStore'ga
// murojaat qilmay o'qish mumkin.
//  - 'plain'  — oddiy SecureStore (Keystore/Keychain bilan shifrlangan), yozish va o'qish jimgina;
//  - 'bio'    — eski versiya: yozuv biometrikka bog'langan (o'qishda biometrik oynasi chiqadi);
//  - '1'      — undan ham eski versiya: alohida kalitlar.
const HAS_SESSION_KEY = 'has_session';
const MODE_BIOMETRIC = 'bio';
const MODE_PLAIN = 'plain';
const MODE_LEGACY = '1';
const LEGACY_TOKEN_KEY = 'access_token';
const LEGACY_REFRESH_TOKEN_KEY = 'refresh_token';

const UNLOCK_PROMPT = 'Ilovaga kirish uchun barmoq izi yoki Face ID orqali tasdiqlang';

// Ilova ochilganda biometrik (yoki qurilma qulfi) so'raladimi.
// Nega tokenlar biometrikka "bog'lanmaydi": refresh token bir martalik — har yangilanishda yangi
// juftlik yoziladi. Biometrikka bog'langan yozuvga yozish har safar biometrik oynasini chiqarar edi.
// Shuning uchun tokenlar jimgina yoziladi, biometrik esa ilova ochilganda tekshiriladi.
// Biometrik yoki ekran qulfi sozlanmagan qurilmada tekshiruv o'tkazib yuboriladi.
const BIOMETRIC_LOCK = false;

// So'rov boshiga SecureStore'dan o'qish o'rniga, bir marta unlockToken() orqali xotiraga olib,
// shu yerdan tez qaytaramiz.
let cachedToken = null;
let cachedRefreshToken = null;

async function passBiometricLock() {
  if (!BIOMETRIC_LOCK) return true;
  try {
    const [hasHardware, enrolled] = await Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
    ]);
    if (!hasHardware || !enrolled) return true;
    const result = await LocalAuthentication.authenticateAsync({ promptMessage: UNLOCK_PROMPT });
    return result.success;
  } catch {
    // Tekshiruv moduli ishlamasa foydalanuvchi ilovadan qulflanib qolmasin.
    return true;
  }
}

async function clearStoredSession() {
  await SecureStore.deleteItemAsync(SESSION_KEY).catch(() => {});
  await SecureStore.deleteItemAsync(LEGACY_TOKEN_KEY).catch(() => {});
  await SecureStore.deleteItemAsync(LEGACY_REFRESH_TOKEN_KEY).catch(() => {});
  await AsyncStorage.removeItem(HAS_SESSION_KEY);
}

/**
 * Tokenlarni saqlaydi: login'dan keyin ham, tokenlar yangilanganda ham (refresh token bir
 * martalik, shuning uchun yangi juftlik darhol yozilishi shart). Yozish jimgina, biometrik so'ramaydi.
 * Yozib bo'lmasa, tokenlar faqat joriy sessiya uchun xotirada qoladi (keyingi ochilishda qayta login).
 */
export async function saveSession({ accessToken, refreshToken }) {
  cachedToken = accessToken ?? null;
  cachedRefreshToken = refreshToken ?? null;

  try {
    // Eski, biometrikka bog'langan yozuv bo'lsa, avval o'chiriladi (almashtirishda xato bermasin).
    if ((await AsyncStorage.getItem(HAS_SESSION_KEY)) === MODE_BIOMETRIC) {
      await SecureStore.deleteItemAsync(SESSION_KEY).catch(() => {});
    }
    await SecureStore.setItemAsync(
      SESSION_KEY,
      JSON.stringify({ accessToken: accessToken ?? null, refreshToken: refreshToken ?? null })
    );
    await AsyncStorage.setItem(HAS_SESSION_KEY, MODE_PLAIN);
  } catch {
    await clearStoredSession();
  }
}

async function readStoredSession(mode) {
  if (mode === MODE_LEGACY) {
    return {
      accessToken: await SecureStore.getItemAsync(LEGACY_TOKEN_KEY),
      refreshToken: await SecureStore.getItemAsync(LEGACY_REFRESH_TOKEN_KEY),
    };
  }
  const raw = await SecureStore.getItemAsync(SESSION_KEY, {
    requireAuthentication: mode === MODE_BIOMETRIC,
    authenticationPrompt: UNLOCK_PROMPT,
  });
  return raw ? JSON.parse(raw) : null;
}

/**
 * Ilova ochilganda (saqlangan sessiya bo'lsa) bir marta chaqiriladi.
 * Avval biometrik tekshiriladi, so'ng tokenlar xotiraga yuklanadi. Biometrik o'tmasa yoki
 * o'qib bo'lmasa, null qaytadi (qulf ekrani ko'rsatiladi).
 * @returns {Promise<string|null>} muvaffaqiyatli bo'lsa access_token, aks holda null
 */
export async function unlockToken() {
  cachedToken = null;
  cachedRefreshToken = null;
  try {
    const mode = await AsyncStorage.getItem(HAS_SESSION_KEY);
    if (!mode) return null;
    // Eski 'bio' yozuvni o'qishning o'zi biometrik so'raydi; ikkinchi marta so'ralmaydi.
    if (mode !== MODE_BIOMETRIC && !(await passBiometricLock())) return null;
    const session = await readStoredSession(mode);
    cachedToken = session?.accessToken ?? null;
    cachedRefreshToken = session?.refreshToken ?? null;
  } catch {
    cachedToken = null;
    cachedRefreshToken = null;
  }
  return cachedToken;
}

/** Qurilmada saqlangan sessiya bor-yo'qligini biometrikka murojaat qilmay tekshiradi */
export const hasStoredSession = async () => !!(await AsyncStorage.getItem(HAS_SESSION_KEY));

// apiFetch har bir so'rovda shularni chaqiradi — xotiradan qaytaradi, biometrik so'ramaydi.
export const getToken = async () => cachedToken;
export const getRefreshToken = async () => cachedRefreshToken;

export const saveActorType = (actorType) => AsyncStorage.setItem(ACTOR_TYPE_KEY, actorType);
export const getActorType = () => AsyncStorage.getItem(ACTOR_TYPE_KEY);

export async function clearTokens() {
  cachedToken = null;
  cachedRefreshToken = null;
  await clearStoredSession();
  await AsyncStorage.removeItem(ACTOR_TYPE_KEY);
}
