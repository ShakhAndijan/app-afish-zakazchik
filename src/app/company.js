import CompanyScreen from '../screens/company/CompanyScreen';
import useGoBack from '../navigation/useGoBack';

// Profil → Kompaniya (korporativ hisob): ariza holati, obyektlar, doimiy xizmat, xodimlar.
export default function CompanyScreenRoute() {
  return <CompanyScreen onBack={useGoBack()} />;
}
