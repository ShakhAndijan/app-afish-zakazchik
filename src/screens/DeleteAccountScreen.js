import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { appAlert, appConfirm } from '../components/AppAlert';
import { deleteAccount } from '../api/legal';
import { useAccountDeletion } from '../queries/legal';
import { documentRoute, requestRoute } from '../navigation/params';
import { formatDate, formatNumber } from '../utils/format';
import { getErrorMessage } from '../utils/errors';
import useBottomInset from '../hooks/useBottomInset';

// Hisobni o'chirish (do'kon qoidalari va maxfiylik siyosati talab qiladi). Avval GET /auth/account/deletion
// nima bo'lishini va to'siqlarni aytadi; to'siq bo'lmasa tasdiqdan keyin POST /auth/account/delete hisobni
// darhol yopadi (30 kun ichida qo'llab-quvvatlash tiklay oladi).
export default function DeleteAccountScreen({ onBack }) {
  const bottomInset = useBottomInset();
  const router = useRouter();
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const { accountDeleted } = useAuth();
  const info = useAccountDeletion();
  const [deleting, setDeleting] = useState(false);

  const data = info.data;
  const canDelete = !!data?.canDelete && !deleting;

  const blockerText = (b) => {
    const amount = b.amount != null ? formatNumber(Math.round(Math.abs(Number(b.amount)))) : '';
    let text;
    switch (b.kind) {
      case 'active_order':
        text = b.orderCode
          ? tr('legal.deleteAccount.blockers.active_order', { code: b.orderCode })
          : tr('legal.deleteAccount.blockers.active_order_plain');
        break;
      case 'wallet_balance':
        text = tr(
          Number(b.amount) < 0
            ? 'legal.deleteAccount.blockers.wallet_debt'
            : 'legal.deleteAccount.blockers.wallet_balance',
          { amount }
        );
        break;
      case 'held_money':
      case 'pending_withdrawal':
        text = tr(`legal.deleteAccount.blockers.${b.kind}`, { amount });
        break;
      default:
        text = tr(`legal.deleteAccount.blockers.${b.kind}`);
    }
    if (b.until) {
      text += ` ${tr('legal.deleteAccount.blockers.until', { date: formatDate(b.until) })}`;
    }
    return text;
  };

  const performDelete = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
      await accountDeleted(); // sessiya yopiladi, AuthRedirect kirish ekraniga o'tkazadi
    } catch (e) {
      setDeleting(false);
      if (e?.code === 'account_deleted') {
        await accountDeleted();
        return;
      }
      if (e?.code === 'account_deletion_blocked') {
        info.refetch();
        appAlert(tr('common.errorTitle'), tr('legal.deleteAccount.blocked'));
        return;
      }
      appAlert(tr('common.errorTitle'), getErrorMessage(e, tr, 'legal.deleteAccount.failed'));
    }
  };

  const confirmDelete = () =>
    appConfirm({
      title: tr('legal.deleteAccount.confirmTitle'),
      message: tr('legal.deleteAccount.confirmText', { n: data?.restoreDays ?? 30 }),
      confirmLabel: tr('legal.deleteAccount.confirmButton'),
      destructive: true,
      onConfirm: performDelete,
    });

  const effects = data
    ? [
        tr('legal.deleteAccount.closed'),
        ...(data.cancelsOrders > 0
          ? [tr('legal.deleteAccount.cancels', { n: data.cancelsOrders })]
          : []),
        tr('legal.deleteAccount.restore', { n: data.restoreDays }),
        tr('legal.deleteAccount.kept'),
      ]
    : [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top', 'left', 'right']}>
      <StatusBar style={t.isDark ? 'light' : 'dark'} />
      <View style={s.header}>
        <TouchableOpacity
          style={[s.backBtn, { backgroundColor: t.card, borderColor: t.border }]}
          onPress={onBack}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="chevron-left" size={24} color={t.text} />
        </TouchableOpacity>
        <Text style={[s.title, { color: t.text }]} numberOfLines={2}>
          {tr('legal.deleteAccount.title')}
        </Text>
      </View>

      {info.isPending && (
        <View style={s.center}>
          <ActivityIndicator color={t.orange} />
        </View>
      )}

      {info.isError && (
        <View style={s.center}>
          <Text style={{ color: t.muted, fontSize: 14, textAlign: 'center' }}>
            {getErrorMessage(info.error, tr, 'legal.deleteAccount.loadFailed')}
          </Text>
          <TouchableOpacity
            style={[s.retry, { backgroundColor: t.orange }]}
            onPress={() => info.refetch()}
            activeOpacity={0.85}
          >
            <Text style={s.retryTxt}>{tr('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {!!data && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 40 + bottomInset,
            gap: 18,
          }}
        >
          <Text style={[s.body, { color: t.muted }]}>{tr('legal.deleteAccount.intro')}</Text>

          {data.blockers.length > 0 && (
            <View style={[s.card, { backgroundColor: t.card, borderColor: t.red }]}>
              <Text style={[s.cardTitle, { color: t.red }]}>
                {tr('legal.deleteAccount.blockersTitle')}
              </Text>
              {data.blockers.map((b, i) => {
                const openable = b.kind === 'active_order' && b.orderId != null;
                return (
                  <TouchableOpacity
                    key={`${b.kind}-${i}`}
                    style={s.bulletRow}
                    disabled={!openable}
                    activeOpacity={0.7}
                    onPress={() => router.push(requestRoute({ id: b.orderId }))}
                  >
                    <MaterialCommunityIcons name="alert-circle-outline" size={18} color={t.red} />
                    <Text style={[s.body, { color: t.text, flex: 1 }]}>{blockerText(b)}</Text>
                    {openable && (
                      <MaterialCommunityIcons name="chevron-right" size={18} color={t.faint} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <View style={[s.card, { backgroundColor: t.card, borderColor: t.border }]}>
            <Text style={[s.cardTitle, { color: t.text }]}>
              {tr('legal.deleteAccount.whatHappens')}
            </Text>
            {effects.map((line) => (
              <View key={line} style={s.bulletRow}>
                <Text style={[s.body, { color: t.muted }]}>•</Text>
                <Text style={[s.body, { color: t.muted, flex: 1 }]}>{line}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push(documentRoute('delete-account'))}
          >
            <Text style={[s.link, { color: t.orange }]}>{tr('legal.deleteAccount.readMore')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.deleteBtn, { backgroundColor: t.red }, !canDelete && { opacity: 0.4 }]}
            disabled={!canDelete}
            activeOpacity={0.85}
            onPress={confirmDelete}
          >
            {deleting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={s.deleteTxt}>{tr('legal.deleteAccount.button')}</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontWeight: '800', fontSize: 20, flex: 1 },
  body: { fontSize: 14.5, lineHeight: 22 },
  card: { borderWidth: 1, borderRadius: 16, padding: 16, gap: 10 },
  cardTitle: { fontWeight: '800', fontSize: 15 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  link: { fontWeight: '700', fontSize: 14, textDecorationLine: 'underline' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24 },
  retry: { paddingHorizontal: 22, paddingVertical: 11, borderRadius: 12 },
  retryTxt: { color: '#fff', fontWeight: '800', fontSize: 14 },
  deleteBtn: { height: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  deleteTxt: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
