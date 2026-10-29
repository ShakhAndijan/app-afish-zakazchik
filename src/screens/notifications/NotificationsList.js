import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import AppLoader from '../../components/AppLoader';
import SectionError from '../zakazchi-main/components/SectionError';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationsFeed,
  useUnreadNotifications,
} from '../../queries/notifications';
import { notificationDate, notificationDetail, notificationHref, notificationText } from './utils';

// Bildirishnomalar ro'yxati (saytdagi qo'ng'iroqcha paneli): o'qilmaganlar ajratib ko'rsatiladi,
// bosilsa o'qilgan bo'ladi va tegishli ekran ochiladi; tepada "Hammasini o'qildi".
export default function NotificationsList() {
  const router = useRouter();
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const feed = useNotificationsFeed();
  const unread = useUnreadNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const open = (n) => {
    if (!n.isRead) markRead.mutate(n.id);
    router.push(notificationHref(n));
  };

  if (feed.loading) {
    return (
      <View style={s.center}>
        <AppLoader size={140} />
      </View>
    );
  }
  if (feed.error && feed.items.length === 0) {
    return <SectionError style={{ marginHorizontal: 20, marginTop: 24 }} onRetry={feed.refetch} />;
  }

  return (
    <FlatList
      data={feed.items}
      keyExtractor={(n) => String(n.id)}
      contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, gap: 8, flexGrow: 1 }}
      onEndReached={feed.fetchMore}
      onEndReachedThreshold={0.4}
      refreshing={feed.refreshing}
      onRefresh={feed.refetch}
      ListHeaderComponent={
        unread > 0 ? (
          <TouchableOpacity
            style={s.markAll}
            activeOpacity={0.7}
            disabled={markAll.isPending}
            onPress={() => markAll.mutate()}
          >
            <MaterialCommunityIcons name="check-all" size={17} color={t.orange} />
            <Text style={[s.markAllText, { color: t.orange }]}>{tr('notifList.markAll')}</Text>
          </TouchableOpacity>
        ) : null
      }
      ListEmptyComponent={
        <View style={s.center}>
          <MaterialCommunityIcons name="bell-outline" size={40} color={t.faint} />
          <Text style={[s.empty, { color: t.muted }]}>{tr('notifList.empty')}</Text>
        </View>
      }
      ListFooterComponent={
        feed.fetchingMore ? (
          <ActivityIndicator color={t.orange} style={{ marginVertical: 14 }} />
        ) : null
      }
      renderItem={({ item }) => {
        const detail = notificationDetail(item);
        return (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => open(item)}
            style={[
              s.row,
              {
                backgroundColor: item.isRead ? t.card : t.orange + '14',
                borderColor: item.isRead ? t.border : t.orange + '55',
              },
            ]}
          >
            {!item.isRead && <View style={[s.dot, { backgroundColor: t.orange }]} />}
            <View style={{ flex: 1 }}>
              <Text style={[s.text, { color: t.text }]}>{notificationText(item, tr)}</Text>
              {!!detail && (
                <Text style={[s.detail, { color: t.muted }]} numberOfLines={1}>
                  {detail}
                </Text>
              )}
              <Text style={[s.date, { color: t.faint }]}>{notificationDate(item.createdAt)}</Text>
            </View>
          </TouchableOpacity>
        );
      }}
    />
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 60 },
  empty: { fontSize: 14 },
  markAll: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 5,
    paddingVertical: 6,
    marginBottom: 4,
  },
  markAllText: { fontSize: 13, fontWeight: '700' },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    padding: 13,
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  text: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  detail: { fontSize: 13, marginTop: 2 },
  date: { fontSize: 12, fontWeight: '600', marginTop: 4 },
});
