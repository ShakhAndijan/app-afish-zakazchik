import { useRouter, useIsFocused } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';
import useProfileStats from './profile/hooks/useProfileStats';
import useTelegramLink from './profile/hooks/useTelegramLink';
import { getIdentityStatus } from '../api/account';
import { formatPhoneDisplay } from './profile/utils';
import SubPage from './profile/components/SubPage';
import MenuCard from './profile/components/MenuCard';

// Profil → Xavfsizlik: shaxsni tasdiqlash, telefon, email, parol, Telegram va hisobni o'chirish.
export default function ProfileSecurityScreen({ onBack }) {
  const router = useRouter();
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const { user } = useUser();
  const focused = useIsFocused();
  const stats = useProfileStats(focused);
  const telegram = useTelegramLink(focused);
  const identity = useQuery({
    queryKey: ['identity', 'status'],
    queryFn: getIdentityStatus,
    enabled: focused,
    staleTime: 30 * 1000,
  });
  const identityStatus = identity.data?.submission_status;
  const displayPhone = user?.phone ? formatPhoneDisplay(user.phone) : '';
  const go = (path) => () => router.push(path);

  return (
    <SubPage title={tr('profile.menu.security')} onBack={onBack}>
      <MenuCard
        rows={[
          {
            icon: 'shield-check-outline',
            label: tr('account.verify.title'),
            value: identityStatus ? tr(`account.verify.status.${identityStatus}`) : undefined,
            color: identityStatus === 'approved' ? t.green : undefined,
            onPress: go('/verify-identity'),
          },
          {
            icon: 'phone-outline',
            label: tr('profile.settings.changePhone'),
            value: displayPhone || undefined,
            onPress: go('/change-phone'),
          },
          {
            icon: stats.emailVerified ? 'check-circle-outline' : 'email-outline',
            label: tr('account.email.title'),
            value: stats.email
              ? tr(
                  stats.emailVerified
                    ? 'account.email.statusVerified'
                    : 'account.email.statusUnverified'
                )
              : tr('account.email.statusNone'),
            color: stats.emailVerified ? t.green : undefined,
            onPress: go('/verify-email'),
          },
          {
            icon: 'lock-outline',
            label: tr(
              stats.hasPassword === false
                ? 'account.password.create'
                : 'profile.settings.changePassword'
            ),
            onPress: go('/change-password'),
          },
          ...(telegram.available
            ? [
                {
                  icon: 'send-outline',
                  label: tr('account.telegram.title'),
                  value: telegram.linked
                    ? tr('account.telegram.linked')
                    : tr('account.telegram.connect'),
                  color: telegram.linked ? t.green : undefined,
                  onPress: telegram.toggle,
                },
              ]
            : []),
        ]}
      />

      <MenuCard
        style={{ paddingTop: 16 }}
        rows={[
          {
            icon: 'account-remove-outline',
            label: tr('legal.deleteAccount.menu'),
            danger: true,
            onPress: go('/delete-account'),
          },
        ]}
      />
    </SubPage>
  );
}
