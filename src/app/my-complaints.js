import MyComplaintsScreen from '../screens/MyComplaintsScreen';
import useGoBack from '../navigation/useGoBack';

// Profil → "Mening shikoyatlarim" (faqat kirgan foydalanuvchi uchun).
export default function MyComplaintsRoute() {
  return <MyComplaintsScreen onBack={useGoBack()} />;
}
