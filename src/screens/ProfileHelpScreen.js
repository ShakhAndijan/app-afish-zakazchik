import { useRouter } from 'expo-router';
import { useLanguage } from '../context/LanguageContext';
import { supportRoute } from '../navigation/params';
import SubPage from './profile/components/SubPage';
import MenuCard from './profile/components/MenuCard';

// Profil → Yordam: yordam markazi, savollar, takliflar va shikoyatlar.
export default function ProfileHelpScreen({ onBack }) {
  const router = useRouter();
  const { t: tr } = useLanguage();

  return (
    <SubPage title={tr('profile.menu.help')} onBack={onBack}>
      <MenuCard
        rows={[
          {
            icon: 'help-circle-outline',
            label: tr('profile.settings.helpCenter'),
            onPress: () => router.push('/help'),
          },
          {
            icon: 'message-text-outline',
            label: tr('support.mineQuestions'),
            onPress: () => router.push(supportRoute('question')),
          },
          {
            icon: 'lightbulb-outline',
            label: tr('support.mineSuggestions'),
            onPress: () => router.push(supportRoute('suggestion')),
          },
          {
            icon: 'flag-outline',
            label: tr('complaints.mine.menu'),
            onPress: () => router.push('/my-complaints'),
          },
        ]}
      />
    </SubPage>
  );
}
