import CompanyFormScreen from '../screens/company/CompanyFormScreen';
import useGoBack from '../navigation/useGoBack';

// Kompaniya arizasi yoki ma'lumotlarini tahrirlash.
export default function CompanyFormScreenRoute() {
  return <CompanyFormScreen onBack={useGoBack()} />;
}
