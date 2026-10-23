import { useCallback, useEffect } from 'react';
import { AppState, Linking } from 'react-native';
import { appAlert } from '../../../components/AppAlert';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '../../../context/LanguageContext';
import { createTelegramLink, getTelegramStatus, unlinkTelegram } from '../../../api/account';
import { getErrorMessage } from '../../../utils/errors';

// Telegram'ni akkauntga ulash (kodlar va xabarnomalar shu yerga keladi). Bot havolasi brauzerda/Telegram'da
// ochiladi; ilovaga qaytilganda holat qayta o'qiladi. `enabled` false — bu muhitda Telegram o'chiq (qator yashiriladi).
export default function useTelegramLink(active) {
  const { t: tr } = useLanguage();
  const queryClient = useQueryClient();
  const status = useQuery({
    queryKey: ['telegram', 'status'],
    queryFn: getTelegramStatus,
    enabled: active,
    staleTime: 30 * 1000,
  });

  const refetch = status.refetch;
  useEffect(() => {
    const sub = AppState.addEventListener('change', (st) => {
      if (st === 'active' && active) refetch();
    });
    return () => sub.remove();
  }, [active, refetch]);

  const fail = (e) =>
    appAlert(tr('common.errorTitle'), getErrorMessage(e, tr, 'account.telegram.failed'));

  const connect = useCallback(async () => {
    try {
      const { url } = await createTelegramLink();
      await Linking.openURL(url);
    } catch (e) {
      fail(e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tr]);

  const unlink = useCallback(
    () =>
      appAlert(tr('account.telegram.unlinkTitle'), tr('account.telegram.unlinkBody'), [
        { text: tr('common.cancel'), style: 'cancel' },
        {
          text: tr('account.telegram.unlink'),
          style: 'destructive',
          onPress: async () => {
            try {
              await unlinkTelegram();
              await queryClient.invalidateQueries({ queryKey: ['telegram', 'status'] });
            } catch (e) {
              fail(e);
            }
          },
        },
      ]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tr, queryClient]
  );

  return {
    available: status.data?.enabled === true,
    linked: status.data?.linked === true,
    toggle: status.data?.linked ? unlink : connect,
  };
}
