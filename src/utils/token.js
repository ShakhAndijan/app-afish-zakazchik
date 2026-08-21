import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';

const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const ACTOR_TYPE_KEY = 'actor_type';
const HAS_SESSION_KEY = 'has_session';

// So'rov boshiga tokenni SecureStore'dan biometrik so'rab o'qish o'rniga,
// bir marta unlockToken() orqali xotiraga olib, shu yerdan tez qaytaramiz.
let cachedToken = null;
let cachedRefreshToken = null;

async function canUseBiometrics() {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  if (!hasHardware) return false;
  return LocalAuthentication.isEnrolledAsync();
}

export async function saveToken(token) {
  cachedToken = token;
  const requireAuthentication = await canUseBiometrics();
  await SecureStore.setItemAsync(TOKEN_KEY, token, { requireAuthentication });
  await AsyncStorage.setItem(HAS_SESSION_KEY, '1');
}

export async function saveRefreshToken(token) {
  cachedRefreshToken = token;
  const requireAuthentication = await canUseBiometrics();
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token, { requireAuthentication });
}

/**
 * Ilova ochilganda (saqlangan sessiya bo'lsa) bir marta chaqiriladi.
 * Qurilmada biometrik autentifikatsiya mavjud bo'lsa, foydalanuvchidan
 * barmoq izi / Face ID so'raydi va tokenni xotiraga yuklaydi.
 * @returns {Promise<string|null>} muvaffaqiyatli bo'lsa access_token, aks holda null
 */
export async function unlockToken() {
  const requireAuthentication = await canUseBiometrics();
  try {
    cachedToken = await SecureStore.getItemAsync(TOKEN_KEY, {
      requireAuthentication,
      authenticationPrompt: "Ilovaga kirish uchun barmoq izi yoki Face ID orqali tasdiqlang",
    });
    cachedRefreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY, {
      requireAuthentication,
    });
  } catch (err) {
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
  await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY).catch(() => {});
  await AsyncStorage.multiRemove([ACTOR_TYPE_KEY, HAS_SESSION_KEY]);
}
