import { useState } from 'react';
import { Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useIsFocused } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';
import TilBottomSheet, { LANGS } from '../components/TilBottomSheet';
import AvatarPickerSheet from '../components/AvatarPickerSheet';
import useProfileStats from './profile/hooks/useProfileStats';
import useAvatarActions from './profile/hooks/useAvatarActions';
import { formatPhoneDisplay } from './profile/utils';
import ProfileCover from './profile/components/ProfileCover';
import IncompleteProfileBanner from './profile/components/IncompleteProfileBanner';
import MenuCard from './profile/components/MenuCard';
import useTabBarSpace from '../navigation/useTabBarSpace';

// Mijoz profili (pastki menyudagi "profile" tabi): tepada rasm/ma'lumot/statistika, so'ng hamyon va
// menyular. Menyudagi sahifalar alohida marshrutlar (src/app/): router.push bilan ochiladi.
export default function ZakazchiProfileScreen() {
  const bottomSpace = useTabBarSpace(90);
  const router = useRouter();
  const { signOut } = useAuth();
  const { theme: t } = useTheme();
  const { language: lang, setLanguage: setLang, t: tr } = useLanguage();
  const { user } = useUser();

  const [showTil, setShowTil] = useState(false);

  // Profil sahifalaridan qaytilganda statistika qayta yuklanadi.
  const stats = useProfileStats(useIsFocused());
  const avatar = useAvatarActions();

  // Ism yoki telefon kelmasa, bo'sh qoldiriladi (zaxira matn yo'q).
  const displayName = [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim();
  const displayLetter = (displayName[0] || '?').toUpperCase();
  const displayPhone = user?.phone ? formatPhoneDisplay(user.phone) : '';
  const displayAvatarUri = avatar.previewUri || user?.profile_photo || null;
  const displayLocation = [user?.district, user?.region].filter(Boolean).join(', ');

  const go = (path) => () => router.push(path);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top', 'left', 'right']}>
      <StatusBar style={t.isDark ? 'light' : 'dark'} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomSpace }}>
        <ProfileCover
          letter={displayLetter}
          avatarUri={displayAvatarUri}
          avatarUploading={avatar.uploading}
          onAvatarPress={avatar.openSheet}
          name={displayName}
          phone={displayPhone}
          location={displayLocation}
          stats={stats}
          onEdit={go('/edit-profile')}
          onOrdersPress={go('/orders')}
        />

        {!displayLocation && <IncompleteProfileBanner onPress={go('/edit-profile')} />}

        <MenuCard
          style={{ paddingTop: 22 }}
          rows={[
            {
              icon: 'format-list-bulleted',
              label: tr('profile.menu.orderHistory'),
              value: stats.orders != null ? tr('profile.menu.itemCount', { n: stats.orders }) : undefined,
              color: t.blue,
              onPress: go('/orders'),
            },
            {
              icon: 'map-marker-outline',
              label: tr('profile.menu.myAddresses'),
              color: t.green,
              onPress: go('/addresses'),
            },
          ]}
        />

        <MenuCard
          style={{ paddingTop: 16 }}
          title={tr('profile.settings.title')}
          rows={[
            { icon: 'bell-outline', label: tr('profile.settings.notifications'), onPress: go('/notifications') },
            {
              icon: 'earth',
              label: tr('profile.settings.language'),
              value: LANGS.find((l) => l.code === lang)?.name,
              onPress: () => setShowTil(true),
            },
            { icon: 'phone-outline', label: tr('profile.settings.changePhone'), onPress: go('/change-phone') },
            { icon: 'lock-outline', label: tr('profile.settings.changePassword'), onPress: go('/change-password') },
            { icon: 'help-circle-outline', label: tr('profile.settings.helpCenter'), onPress: go('/help') },
          ]}
        />

        <MenuCard
          style={{ paddingTop: 16 }}
          rows={[{ icon: 'logout', label: tr('profile.logout'), danger: true, onPress: signOut }]}
        />
        <Text
          style={{
            textAlign: 'center',
            fontSize: 11.5,
            color: t.faint,
            marginTop: 16,
            marginBottom: 24,
          }}
        >
          {tr('profile.footer')}
        </Text>
      </ScrollView>

      <TilBottomSheet
        visible={showTil}
        currentLang={lang}
        onSelect={setLang}
        onClose={() => setShowTil(false)}
      />
      <AvatarPickerSheet
        visible={avatar.sheetOpen}
        onClose={avatar.closeSheet}
        onPickCamera={avatar.pickCamera}
        onPickGallery={avatar.pickGallery}
        onRemove={avatar.remove}
        hasPhoto={!!displayAvatarUri}
        previewUri={displayAvatarUri}
        previewLetter={displayLetter}
        previewColor={t.orange}
        t={t}
      />
    </SafeAreaView>
  );
}
