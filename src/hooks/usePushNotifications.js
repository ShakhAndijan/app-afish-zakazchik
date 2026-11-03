import { PUSH_ENABLED } from '../constants/config';

// PUSH_ENABLED o'chiq bo'lsa expo-notifications umuman yuklanmaydi (Expo Go va native moduli yo'q
// build'larda import o'zi xato beradi), shuning uchun haqiqiy hook faqat kerak bo'lganda require qilinadi.
const usePushImpl = PUSH_ENABLED ? require('./usePushNotificationsImpl').default : () => {};

export default function usePushNotifications() {
  usePushImpl();
}
