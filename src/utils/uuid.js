// Buyurtma uchun takrorlanmas kalit (idempotency). expo-crypto native moduli bo'lmasa (masalan Expo Go
// yoki eski dev build) ilova yiqilmasligi uchun import kerak bo'lganda qilinadi, bo'lmasa oddiy UUID v4.
export function randomUUID() {
  try {
    return require('expo-crypto').randomUUID();
  } catch {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.floor(Math.random() * 16);
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  }
}
