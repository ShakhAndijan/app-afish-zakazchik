// Faqat dev rejimida chiqadi — release build'da token/OTP/shaxsiy ma'lumot logga tushmaydi.
export const devLog = (...args) => {
  if (__DEV__) console.log(...args);
};
