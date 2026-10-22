import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getFaq,
  getSupportConversation,
  getSupportItems,
  markSupportConversationRead,
  sendSupportChatMessage,
  sendSupportItem,
} from '../api/support';

const CONVERSATION_KEY = ['support', 'conversation'];

/** Mening murojaatlarim (`kind: 'question'`) yoki takliflarim (`kind: 'suggestion'`). */
export const useSupportItems = (kind) =>
  useQuery({ queryKey: ['support', 'items', kind], queryFn: () => getSupportItems(kind) });

export function useSendSupportItem(kind) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => sendSupportItem({ ...data, kind }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['support', 'items', kind] }),
  });
}

/** Jamoa bilan yozishma; ochiq turganda har 20 soniyada yangilanadi, o'qilmagan javoblar o'qilgan bo'ladi. */
export function useSupportConversation() {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: CONVERSATION_KEY,
    queryFn: async () => {
      const data = await getSupportConversation();
      if (data.unread > 0) {
        markSupportConversationRead()
          .then(() => queryClient.invalidateQueries({ queryKey: ['notifications'] }))
          .catch(() => {});
      }
      return data;
    },
    refetchInterval: 20 * 1000,
  });
}

export function useSendSupportChat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sendSupportChatMessage,
    onSuccess: (data) =>
      queryClient.setQueryData(CONVERSATION_KEY, { messages: data.messages, unread: 0 }),
  });
}

/** FAQ: backenddagi ro'yxat; bo'sh yoki xato bo'lsa `null` (ekran zaxira matnlarni ko'rsatadi). */
export const useFaq = () =>
  useQuery({
    queryKey: ['faq'],
    queryFn: async () => {
      const list = await getFaq();
      return list.length ? list : null;
    },
    staleTime: 10 * 60 * 1000,
  });
