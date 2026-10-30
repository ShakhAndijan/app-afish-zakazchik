import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { appAlert, appConfirm } from '../components/AppAlert';
import AppLoader from '../components/AppLoader';
import SectionError from './zakazchi-main/components/SectionError';
import { useMyComplaints, useWithdrawComplaint } from '../queries/complaints';
import { formatDate } from '../utils/format';
import { getErrorMessage } from '../utils/errors';
import useBottomInset from '../hooks/useBottomInset';

// Holat → rang (theme kaliti).
const STATUS_COLOR = { pending: 'orange', approved: 'green', rejected: 'red', withdrawn: 'faint' };

// Kabinet → "Mening shikoyatlarim" (saytdagi "Мои жалобы"): yozilgan shikoyatlar, holati, admin izohi,
// usta javobi va qaytarib olish.
export default function MyComplaintsScreen({ onBack }) {
  const bottomInset = useBottomInset();
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();

  const list = useMyComplaints();
  const withdraw = useWithdrawComplaint();
  const [busyId, setBusyId] = useState(null);

  const confirmWithdraw = (c) =>
    appConfirm({
      title: tr('complaints.mine.withdrawTitle'),
      message: tr('complaints.mine.withdrawText'),
      confirmLabel: tr('complaints.mine.withdraw'),
      destructive: true,
      onConfirm: () => {
        setBusyId(c.id);
        withdraw.mutate(c.id, {
          onError: (e) =>
            appAlert(
              tr('common.errorTitle'),
              getErrorMessage(e, tr, 'complaints.mine.withdrawFailed')
            ),
          onSettled: () => setBusyId(null),
        });
      },
    });

  const items = list.data?.items ?? [];

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
        <Text style={[s.title, { color: t.text }]} numberOfLines={1}>
          {tr('complaints.mine.title')}
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 40 + bottomInset,
          gap: 14,
        }}
      >
        {list.isPending && (
          <View style={s.center}>
            <AppLoader size={100} />
          </View>
        )}
        {list.isError && <SectionError onRetry={list.refetch} />}

        {list.isSuccess && items.length === 0 && (
          <View style={s.center}>
            <MaterialCommunityIcons name="flag-outline" size={38} color={t.faint} />
            <Text style={{ color: t.text, fontSize: 15, fontWeight: '700' }}>
              {tr('complaints.mine.empty')}
            </Text>
            <Text style={{ color: t.muted, fontSize: 13.5, textAlign: 'center', lineHeight: 20 }}>
              {tr('complaints.mine.emptyHint')}
            </Text>
          </View>
        )}

        {items.map((c) => {
          const color = t[STATUS_COLOR[c.status]] ?? t.muted;
          const canWithdraw = c.status === 'pending' || c.status === 'approved';
          return (
            <View key={c.id} style={[s.card, { backgroundColor: t.card, borderColor: t.border }]}>
              <View style={s.topRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[s.worker, { color: t.text }]} numberOfLines={1}>
                    {c.workerName}
                  </Text>
                  <Text style={{ color: t.muted, fontSize: 12.5, marginTop: 2 }}>
                    {[
                      tr('complaints.mine.order', { code: c.orderCode }),
                      formatDate(c.createdAt),
                    ].join(' · ')}
                  </Text>
                </View>
                <View style={[s.badge, { backgroundColor: color + '22' }]}>
                  <Text style={{ color, fontSize: 12, fontWeight: '800' }}>
                    {tr(`complaints.status.${c.status}`)}
                  </Text>
                </View>
              </View>

              <Text style={[s.reason, { color: t.orange }]}>
                {tr(`complaints.reasons.${c.reason}`)}
              </Text>
              <Text style={[s.body, { color: t.text }]}>{c.body}</Text>

              {!!c.adminNote && (
                <View
                  style={[s.note, { backgroundColor: t.red + '14', borderColor: t.red + '44' }]}
                >
                  <Text style={{ color: t.red, fontSize: 12, fontWeight: '800' }}>
                    {tr('complaints.mine.adminNote')}
                  </Text>
                  <Text style={[s.body, { color: t.text }]}>{c.adminNote}</Text>
                </View>
              )}

              {!!c.reply && (
                <View style={[s.note, { backgroundColor: t.card2 ?? t.bg, borderColor: t.border }]}>
                  <Text style={{ color: t.muted, fontSize: 12, fontWeight: '800' }}>
                    {tr('complaints.mine.reply')}
                    {c.repliedAt ? ` · ${formatDate(c.repliedAt)}` : ''}
                  </Text>
                  <Text style={[s.body, { color: t.text }]}>{c.reply}</Text>
                </View>
              )}

              {canWithdraw && (
                <TouchableOpacity
                  style={[s.withdraw, { borderColor: t.red }]}
                  activeOpacity={0.8}
                  disabled={busyId === c.id}
                  onPress={() => confirmWithdraw(c)}
                >
                  {busyId === c.id ? (
                    <ActivityIndicator color={t.red} />
                  ) : (
                    <Text style={{ color: t.red, fontWeight: '800', fontSize: 13.5 }}>
                      {tr('complaints.mine.withdraw')}
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          );
        })}

        <View style={[s.card, { backgroundColor: t.card, borderColor: t.border }]}>
          <Text style={[s.worker, { color: t.text }]}>{tr('complaints.mine.rulesTitle')}</Text>
          {RULE_INDEXES.map((i) => (
            <View key={i} style={s.ruleRow}>
              <Text style={[s.body, { color: t.muted }]}>•</Text>
              <Text style={[s.body, { color: t.muted, flex: 1 }]}>
                {tr(`complaints.mine.rules.${i}`)}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const RULE_INDEXES = [0, 1, 2, 3];

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
  center: { alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 30 },
  card: { borderWidth: 1, borderRadius: 16, padding: 14, gap: 10 },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  worker: { fontSize: 15, fontWeight: '800' },
  badge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  reason: { fontSize: 13, fontWeight: '800' },
  body: { fontSize: 14, lineHeight: 21 },
  note: { borderWidth: 1, borderRadius: 12, padding: 11, gap: 4 },
  withdraw: {
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ruleRow: { flexDirection: 'row', gap: 8 },
});
