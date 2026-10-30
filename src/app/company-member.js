import MemberFormScreen from '../screens/company/MemberFormScreen';
import useGoBack from '../navigation/useGoBack';

// Kompaniyaga xodim qo'shish.
export default function MemberFormScreenRoute() {
  return <MemberFormScreen onBack={useGoBack()} />;
}
