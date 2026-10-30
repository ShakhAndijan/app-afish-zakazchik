const fs = require('fs');

// Statik sozlamalar app.json da. Bu fayl faqat Firebase (FCM) kalitini ulaydi: google-services.json
// repoga qo'yilmaydi (.gitignore), EAS da u "file" turidagi GOOGLE_SERVICES_JSON o'zgaruvchisi bo'lib
// beriladi, lokal build'da esa loyiha ildizidagi google-services.json olinadi.
module.exports = ({ config }) => {
  const googleServicesFile =
    process.env.GOOGLE_SERVICES_JSON ||
    (fs.existsSync('./google-services.json') ? './google-services.json' : undefined);

  return {
    ...config,
    android: { ...config.android, ...(googleServicesFile ? { googleServicesFile } : {}) },
  };
};
