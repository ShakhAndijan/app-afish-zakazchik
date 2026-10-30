import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { appAlert } from '../components/AppAlert';
import AppLoader from '../components/AppLoader';
import SectionError from './zakazchi-main/components/SectionError';
import { COMPLAINT_MAX_LENGTH, COMPLAINT_REASONS } from '../api/complaints';
import { useComplaintOptions, useCreateComplaint } from '../queries/complaints';
import { formatDate } from '../utils/format';
import { getErrorMessage } from '../utils/errors';
import useBottomInset from '../hooks/useBottomInset';

// Usta haqida shikoyat (saytdagi "Пожаловаться"): birga ishlangan buyurtmani tanlaydi, sabab va matn yozadi.
// Shikoyat admin tasdiqlamaguncha hech qayerda ko'rinmaydi; har bir buyurtma bo'yicha bitta.
export default function ComplaintScreen({ workerId, workerName, onBack, onOpenMine }) {
  const bottomInset = useBottomInset();
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();

  const options = useComplaintOptions(workerId, true);
  const create = useCreateComplaint(workerId);

  const [orderId, setOrderId] = useState(null);
  const [reason, setReason] = useState(null);
  const [body, setBody] = useState('');

  const text = body.trim();
  const ready = orderId != null && reason != null && text.length > 0 && !create.isPending;

  const submit = () => {
    if (!ready) return;
    create.mutate(
      { orderId, reason, body: text },
      {
        onSuccess: () => {
          appAlert(tr('complaints.sentTitle'), tr('complaints.sentText'), [
            { text: tr('complaints.mine.menu'), onPress: onOpenMine },
            { text: tr('common.close'), style: 'cancel', onPress: onBack },
          ]);
        },
        onError: (e) => {
          // Bu buyurtma bo'yicha shikoyat allaqachon bor — ro'yxatni yangilaymiz.
          if (e?.code === 'complaint_exists' || e?.code === 'complaint_order_not_eligible') {
            setOrderId(null);
            options.refetch();
          }
          appAlert(tr('common.errorTitle'), getErrorMessage(e, tr, 'complaints.failed'));
        },
      }
    );
  };

  const orders = options.data ?? [];

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
        <View style={{ flex: 1 }}>
          <Text style={[s.title, { color: t.text }]} numberOfLines={1}>
            {tr('complaints.title')}
          </Text>
          {!!workerName && (
            <Text style={{ color: t.muted, fontSize: 13, marginTop: 2 }} numberOfLines={1}>
              {tr('complaints.about', { name: workerName })}
            </Text>
          )}
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 4,
            paddingBottom: 40 + bottomInset,
            gap: 16,
          }}
        >
          <Text style={[s.hint, { color: t.muted }]}>{tr('complaints.intro')}</Text>

          {options.isPending && (
            <View style={s.center}>
              <AppLoader size={100} />
            </View>
          )}
          {options.isError && <SectionError onRetry={options.refetch} />}

          {options.isSuccess && orders.length === 0 && (
            <View style={[s.card, { backgroundColor: t.card, borderColor: t.border }]}>
              <MaterialCommunityIcons name="clipboard-off-outline" size={28} color={t.faint} />
              <Text style={[s.hint, { color: t.muted }]}>{tr('complaints.noOrders')}</Text>
            </View>
          )}

          {options.isSuccess && orders.length > 0 && (
            <>
              <View style={{ gap: 8 }}>
                <Text style={[s.label, { color: t.text }]}>{tr('complaints.order')}</Text>
                {orders.map((o) => {
                  const taken = o.complaintStatus != null;
                  const on = orderId === o.orderId;
                  return (
                    <TouchableOpacity
                      key={o.orderId}
                      disabled={taken}
                      activeOpacity={0.8}
                      onPress={() => setOrderId(o.orderId)}
                      style={[
                        s.option,
                        {
                          backgroundColor: t.card,
                          borderColor: on ? t.orange : t.border,
                          opacity: taken ? 0.55 : 1,
                        },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={on ? 'radiobox-marked' : 'radiobox-blank'}
                        size={22}
                        color={on ? t.orange : t.faint}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={[s.optionTitle, { color: t.text }]} numberOfLines={2}>
                          {o.title || o.code}
                        </Text>
                        <Text style={{ color: t.muted, fontSize: 12.5, marginTop: 2 }}>
                          {[o.code, formatDate(o.createdAt)].filter(Boolean).join(' · ')}
                        </Text>
                        {taken && (
                          <Text style={{ color: t.orange, fontSize: 12.5, marginTop: 4 }}>
                            {tr('complaints.alreadyFiled')}
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={{ gap: 8 }}>
                <Text style={[s.label, { color: t.text }]}>{tr('complaints.reason')}</Text>
                <View style={s.chips}>
                  {COMPLAINT_REASONS.map((r) => {
                    const on = reason === r;
                    return (
                      <TouchableOpacity
                        key={r}
                        activeOpacity={0.8}
                        onPress={() => setReason(r)}
                        style={[
                          s.chip,
                          {
                            backgroundColor: on ? t.orange : t.card,
                            borderColor: on ? t.orange : t.border,
                          },
                        ]}
                      >
                        <Text
                          style={{ color: on ? '#fff' : t.text, fontSize: 13.5, fontWeight: '700' }}
                        >
                          {tr(`complaints.reasons.${r}`)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={{ gap: 8 }}>
                <View style={s.labelRow}>
                  <Text style={[s.label, { color: t.text }]}>{tr('complaints.body')}</Text>
                  <Text style={{ color: t.faint, fontSize: 12, fontWeight: '600' }}>
                    {body.length} / {COMPLAINT_MAX_LENGTH}
                  </Text>
                </View>
                <TextInput
                  style={[
                    s.input,
                    { backgroundColor: t.inputBg, borderColor: t.border, color: t.text },
                  ]}
                  value={body}
                  onChangeText={setBody}
                  placeholder={tr('complaints.bodyPlaceholder')}
                  placeholderTextColor={t.faint}
                  multiline
                  maxLength={COMPLAINT_MAX_LENGTH}
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity
                style={[s.send, { backgroundColor: t.orange, opacity: ready ? 1 : 0.5 }]}
                activeOpacity={0.85}
                disabled={!ready}
                onPress={submit}
              >
                {create.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="flag-outline" size={18} color="#fff" />
                    <Text style={s.sendText}>{tr('complaints.submit')}</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingBottom: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontWeight: '800', fontSize: 20 },
  hint: { fontSize: 13.5, lineHeight: 20 },
  center: { alignItems: 'center', justifyContent: 'center', paddingVertical: 30 },
  card: { borderWidth: 1, borderRadius: 16, padding: 16, gap: 10, alignItems: 'flex-start' },
  label: { fontSize: 14, fontWeight: '800' },
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 13,
  },
  optionTitle: { fontSize: 14.5, fontWeight: '700' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9 },
  input: {
    minHeight: 130,
    maxHeight: 260,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 15,
    lineHeight: 21,
  },
  send: {
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendText: { color: '#fff', fontWeight: '800', fontSize: 15.5 },
});
