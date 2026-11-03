import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import TilBottomSheet, { LANGS } from '../components/TilBottomSheet';
import { useUnreadNotifications } from '../queries/notifications';
import SubPage from './profile/components/SubPage';
import MenuCard from './profile/components/MenuCard';

// Profil → Sozlamalar: bildirishnomalar va til.
export default function ProfileSettingsScreen({ onBack }) {
  const router = useRouter();
  const { theme: t } = useTheme();
  const { language: lang, setLanguage: setLang, t: tr } = useLanguage();
  const unreadNotifs = useUnreadNotifications();
  const [showTil, setShowTil] = useState(false);

  return (
    <SubPage title={tr('profile.menu.settings')} onBack={onBack}>
      <MenuCard
        rows={[
          {
            icon: 'bell-outline',
            label: tr('profile.settings.notifications'),
            value: unreadNotifs > 0 ? String(unreadNotifs) : undefined,
            color: unreadNotifs > 0 ? t.orange : undefined,
            onPress: () => router.push('/notifications'),
          },
          {
            icon: 'earth',
            label: tr('profile.settings.language'),
            value: LANGS.find((l) => l.code === lang)?.name,
            onPress: () => setShowTil(true),
          },
        ]}
      />

      <TilBottomSheet
        visible={showTil}
        currentLang={lang}
        onSelect={setLang}
        onClose={() => setShowTil(false)}
      />
    </SubPage>
  );
}
