import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// Ikkala token (access + refresh) bitta SecureStore yozuvida JSON bo'lib saqlanadi:
// shunda yozishda ham, o'qishda ham biometrik oynasi faqat BIR marta chiqadi.
const SESSION_KEY = 'session_tokens';
const ACTOR_TYPE_KEY = 'actor_type';
// AsyncStorage'dagi belgi: sessiya borligi va u qanday saqlangani (biometrik yoki oddiy).
// Qiymatni biometrikka murojaat qilmay o'qish mumkin.
const HAS_SESSION_KEY = 'has_session';
const MODE_BIOMETRIC = 'bio';
const MODE_PLAIN = 'plain';
// Eski versiya (biometrik o'chiq bo'lgan paytdagi) formati: alohida kalitlar, oddiy saqlash.
const MODE_LEGACY = '1';
const LEGACY_TOKEN_KEY = 'access_token';
const LEGACY_REFRESH_TOKEN_KEY = 'refresh_token';

const UNLOCK_PROMPT = 'Ilovaga kirish uchun barmoq izi yoki Face ID orqali tasdiqlang';

// So'rov boshiga SecureStore'dan (biometrik bilan) o'qish o'rniga, bir marta unlockToken()
// orqali xotiraga olib, shu yerdan tez qaytaramiz.
let cachedToken = null;
let cachedRefreshToken = null;

// Tokenlarni biometrikka bog'lash. Expo Go'da biometrik kalitlar ishlamaydi, shuning uchun
// hozircha o'chiq (tokenlar oddiy SecureStore'da). Production build uchun `true` qiling.
const BIOMETRIC_BINDING = false;

// Qurilma biometrikani qo'llaydimi (barmoq izi/yuz ro'yxatdan o'tgan va yetarlicha xavfsiz).
function canUseBiometrics() {
  if (!BIOMETRIC_BINDING) return false;
  try {
    return SecureStore.canUseBiometricAuthentication();
  } catch {
    return false;
  }
}

async function clearStoredSession() {
  await SecureStore.deleteItemAsync(SESSION_KEY).catch(() => {});
  await SecureStore.deleteItemAsync(LEGACY_TOKEN_KEY).catch(() => {});
  await SecureStore.deleteItemAsync(LEGACY_REFRESH_TOKEN_KEY).catch(() => {});
  await AsyncStorage.removeItem(HAS_SESSION_KEY);
}

/**
 * Login'dan keyin tokenlarni saqlaydi. Qurilmada biometrik bo'lsa, tokenlar shu biometrikka
 * bog'lanadi (keyin o'qish uchun barmoq izi/Face ID kerak bo'ladi).
 * Foydalanuvchi biometrik oynasini bekor qilsa, tokenlar faqat joriy sessiya uchun xotirada
 * qoladi va diskka yozilmaydi (keyingi ochilishda qayta login kerak).
 */
export async function saveSession({ accessToken, refreshToken }) {
  cachedToken = accessToken ?? null;
  cachedRefreshToken = refreshToken ?? null;

  const biometric = canUseBiometrics();
  try {
    await SecureStore.setItemAsync(
      SESSION_KEY,
      JSON.stringify({ accessToken: accessToken ?? null, refreshToken: refreshToken ?? null }),
      { requireAuthentication: biometric, authenticationPrompt: UNLOCK_PROMPT }
    );
    await AsyncStorage.setItem(HAS_SESSION_KEY, biometric ? MODE_BIOMETRIC : MODE_PLAIN);
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
 * Tokenlar biometrikka bog'langan bo'lsa, barmoq izi / Face ID so'raydi va tokenni xotiraga
 * yuklaydi. Biometrik o'tmasa yoki yangi barmoq izi qo'shilib kalit bekor bo'lgan bo'lsa,
 * null qaytadi.
 * @returns {Promise<string|null>} muvaffaqiyatli bo'lsa access_token, aks holda null
 */
export async function unlockToken() {
  cachedToken = null;
  cachedRefreshToken = null;
  try {
    const mode = await AsyncStorage.getItem(HAS_SESSION_KEY);
    if (!mode) return null;
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
