import { useCallback } from 'react';
import { appAlert } from '../../../components/AppAlert';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { useToggleListingFavorite } from '../../../queries/listings';
import { getErrorMessage } from '../../../utils/errors';

// E'lonni saqlash/olib tashlash. Mehmon bo'lsa — kirish sahifasiga o'tkaziladi.
export default function useListingFavorite() {
  const router = useRouter();
  const { signedIn } = useAuth();
  const { t: tr } = useLanguage();
  const { mutate } = useToggleListingFavorite();

  return useCallback(
    (listing) => {
      if (!signedIn) {
        router.push('/login');
        return;
      }
      mutate(
        { id: listing.id, next: !listing.isFavorite },
        {
          onError: (err) =>
            appAlert(tr('common.errorTitle'), getErrorMessage(err, tr, 'listings.favoriteError')),
        }
      );
    },
    [signedIn, router, mutate, tr]
  );
}
