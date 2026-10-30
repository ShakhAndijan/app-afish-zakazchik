import DeleteAccountScreen from '../screens/DeleteAccountScreen';
import useGoBack from '../navigation/useGoBack';

// Hisobni o'chirish: Profil → Sozlamalar → "Hisobni o'chirish" (faqat kirgan foydalanuvchi uchun).
export default function DeleteAccountRoute() {
  return <DeleteAccountScreen onBack={useGoBack()} />;
}
