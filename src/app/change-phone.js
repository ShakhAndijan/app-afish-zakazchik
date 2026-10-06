import ChangePhoneScreen from '../screens/ChangePhoneScreen';
import { useUser } from '../context/UserContext';
import useGoBack from '../navigation/useGoBack';
import { formatPhoneDisplay } from '../screens/profile/utils';

// Telefon almashgach profil qayta yuklanadi — yangi raqam shu orqali ko'rinadi.
export default function ChangePhoneRoute() {
  const goBack = useGoBack();
  const { user, refreshUser } = useUser();
  return (
    <ChangePhoneScreen
      currentPhone={user?.phone ? formatPhoneDisplay(user.phone) : ''}
      onBack={goBack}
      onChanged={() => {
        refreshUser();
        goBack();
      }}
    />
  );
}
