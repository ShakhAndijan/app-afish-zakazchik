import { useCallback } from 'react';
import { appAlert } from '../../../components/AppAlert';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { useToggleListingLike } from '../../../queries/listings';
import { getErrorMessage } from '../../../utils/errors';

// E'longa layk bosish/olib tashlash. Mehmon bo'lsa — kirish sahifasiga o'tkaziladi.
// Backend o'z e'loniga layk bosishni rad etadi — xabar o'sha xatodan olinadi.
export default function useListingLike() {
  const router = useRouter();
  const { signedIn } = useAuth();
  const { t: tr } = useLanguage();
  const { mutate } = useToggleListingLike();

  return useCallback(
    (listing) => {
      if (!signedIn) {
        router.push('/login');
        return;
      }
      mutate(
        { id: listing.id, next: !listing.isLiked },
        {
          onError: (err) =>
            appAlert(tr('common.errorTitle'), getErrorMessage(err, tr, 'listings.likeError')),
        }
      );
    },
    [signedIn, router, mutate, tr]
  );
}
