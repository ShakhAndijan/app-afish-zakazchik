import { Linking, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { registerPushDevice, unregisterPushDevice } from '../api/push';
import { devLog } from './log';

// Android 8+ da bildirishnoma kanalsiz chiqmaydi; kanal id si FCM `android.notification.channel_id`
// bilan bir xil bo'lishi kerak (app.json dagi `defaultChannel` ham shu).
export const PUSH_CHANNEL_ID = 'default';

const REGISTERED_KEY = 'push_registered'; // { token, locale } — backendga oxirgi yuborilgani
const PROMPTED_KEY = 'push_prompted'; // ruxsat so'rovi bir marta o'zi chiqadi, keyin faqat sozlamadan

// Ilova ochiq turganda ham xabar tepada ko'rinadi (aks holda Android ko'rsatmaydi).
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function ensureChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(PUSH_CHANNEL_ID, {
    name: 'harna.uz',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#f97316',
  });
}

/** `status`: 'granted' | 'denied' | 'undetermined'; `canAskAgain`: tizim oynasini yana ko'rsatsa bo'ladimi. */
export async function getPushPermission() {
  const p = await Notifications.getPermissionsAsync();
  return { status: p.status, canAskAgain: p.canAskAgain };
}

/**
 * Ruxsat so'raydi. Android 13+ da so'rov oynasi kanal yaratilgach chiqadi, shuning uchun kanal avval.
 * Foydalanuvchi ikki marta rad etgan bo'lsa tizim oynani ko'rsatmaydi, shu sabab sozlamalar ochiladi.
 */
export async function requestPushPermission() {
  await ensureChannel();
  const current = await getPushPermission();
  if (current.status === 'granted') return true;
  if (current.status === 'denied' && !current.canAskAgain) {
    Linking.openSettings().catch(() => {});
    return false;
  }
  const res = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: true, allowSound: true },
  });
  return res.status === 'granted';
}

async function readRegistered() {
  try {
    return JSON.parse((await AsyncStorage.getItem(REGISTERED_KEY)) ?? 'null');
  } catch {
    return null;
  }
}

/**
 * Qurilma tokenini olib backendga yuboradi. Token va til o'zgarmagan bo'lsa qayta yubormaydi.
 * `ask` — ruxsat hali so'ralmagan bo'lsa, bir marta tizim oynasini ko'rsatadi.
 * Hech qachon xato tashlamaydi: push ishlamasa ham ilova ishlashda davom etadi.
 */
export async function registerPush({ locale, ask = false }) {
  try {
    await ensureChannel();
    let { status } = await getPushPermission();
    if (status !== 'granted' && ask && !(await AsyncStorage.getItem(PROMPTED_KEY))) {
      await AsyncStorage.setItem(PROMPTED_KEY, '1');
      if (await requestPushPermission()) status = 'granted';
    }
    if (status !== 'granted') return false;

    // Android'da bu FCM tokeni (iOS'da APNs). Expo Go'da ishlamaydi: development/production build kerak.
    const { data: token } = await Notifications.getDevicePushTokenAsync();
    if (!token) return false;

    const saved = await readRegistered();
    if (saved?.token === token && saved?.locale === locale) return true;

    await registerPushDevice({
      token,
      platform: Platform.OS,
      locale,
      appVersion: Constants.expoConfig?.version ?? null,
    });
    await AsyncStorage.setItem(REGISTERED_KEY, JSON.stringify({ token, locale }));
    devLog('[push] token backendga yuborildi');
    return true;
  } catch (err) {
    devLog("[push] ro'yxatdan o'tmadi:", err?.message);
    return false;
  }
}

/** Chiqishda tokenni backenddan o'chiradi; so'rov kirgan foydalanuvchi huquqi bilan ketadi, shuning uchun sessiya tugashidan oldin chaqiriladi. */
export async function unregisterPush() {
  const saved = await readRegistered();
  if (!saved?.token) return;
  try {
    await unregisterPushDevice(saved.token);
  } catch (err) {
    devLog("[push] token o'chirilmadi:", err?.message);
  }
  await AsyncStorage.removeItem(REGISTERED_KEY).catch(() => {});
}

/** Hisob o'chirilganda backendga murojaat qilinmaydi (token endi yaroqsiz), faqat mahalliy belgi tozalanadi. */
export async function forgetPush() {
  await AsyncStorage.removeItem(REGISTERED_KEY).catch(() => {});
}

// Push `data` qismini bildirishnoma ro'yxatidagi `payload` ko'rinishiga keltiradi. FCM data qiymatlari
// doim matn bo'lgani uchun `*_id` maydonlari songa o'giriladi.
export function pushData(response) {
  const request = response?.notification?.request;
  // Ilova yopiq paytda tizim ko'rsatgan xabarning data'si trigger ichida keladi.
  const raw = {
    ...(request?.trigger?.remoteMessage?.data ?? {}),
    ...(request?.content?.data ?? {}),
  };
  const out = {};
  for (const [k, v] of Object.entries(raw)) {
    out[k] = /_id$/.test(k) && /^\d+$/.test(String(v)) ? Number(v) : v;
  }
  return out;
}
