import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { ustaRoute } from '../navigation/params';
import Avatar from '../components/Avatar';
import AfishLoader from '../components/AfishLoader';
import SectionError from './zakazchi-main/components/SectionError';
import StatusBanner from './requests/components/StatusBanner';
import PromptModal from './requests/components/PromptModal';
import useLiveOrder from './requests/hooks/useLiveOrder';
import useOrderActions, { parsePrice } from './requests/hooks/useOrderActions';
import { describeOrder, formatPrice, isOpenOrder, timeLabel } from './requests/utils';

// Buyurtma kuzatuv ekrani (backenddan jonli): holat banneri, xulosa, usta va narx kelishuvi.
// Usta buyurtmani qabul qilgach (ACCEPTED) chat ochiladi, narx taklif/qabul qilinadi (ACTIVE).
export default function RequestScreen({ orderId, onBack }) {
  const router = useRouter();
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const { order, loading, failed, refresh } = useLiveOrder(orderId);
  const actions = useOrderActions(orderId, refresh);
  const [priceOpen, setPriceOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const header = (
    <View style={s.header}>
      <TouchableOpacity
        style={[s.backBtn, { backgroundColor: t.card, borderColor: t.border }]}
        onPress={onBack}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="chevron-left" size={24} color={t.text} />
      </TouchableOpacity>
      <Text style={[s.title, { color: t.text }]}>{tr('requests.headerTitle', { id: orderId })}</Text>
    </View>
  );

  if (!order) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top', 'left', 'right']}>
        <StatusBar style={t.isDark ? 'light' : 'dark'} />
        {header}
        {loading ? (
          <View style={s.center}>
            <AfishLoader size={160} />
          </View>
        ) : failed ? (
          <SectionError style={{ marginHorizontal: 20, marginTop: 24 }} onRetry={refresh} />
        ) : null}
      </SafeAreaView>
    );
  }

  const info = describeOrder(order, tr);
  const negotiating = order.rawStatus === 'accepted';
  const hasWorker = !!order.master && order.rawStatus !== 'pending';
  const canChat = order.rawStatus === 'accepted' || order.rawStatus === 'active';
  const openChat = () => router.push({ pathname: '/chat', params: { orderId: String(order.id) } });
  const openProfile = () =>
    router.push(
      ustaRoute({
        id: order.workerId,
        name: order.master,
        initial: order.letter,
        bgColor: order.color,
        trade: order.service,
      })
    );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top', 'left', 'right']}>
      <StatusBar style={t.isDark ? 'light' : 'dark'} />
      {header}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32, gap: 16 }}
      >
        <StatusBanner info={info} pulsing={order.rawStatus === 'pending' || negotiating} />

        <View style={[s.card, { backgroundColor: t.card, borderColor: t.border }]}>
          <SummaryRow icon="wrench-outline" label={tr('requests.summaryTitle')} value={order.service ?? order.task} t={t} />
          <SummaryRow icon="map-marker-outline" label={tr('requests.summaryAddress')} value={order.address} t={t} />
          <SummaryRow
            icon="clock-outline"
            label={tr('requests.summaryCreated')}
            value={order.createdAt ? timeLabel(tr, order.createdAt) : ''}
            t={t}
            last
          />
        </View>

        {hasWorker && (
          <>
            <Text style={[s.sectionTitle, { color: t.text }]}>{tr('requests.workerSection')}</Text>
            <TouchableOpacity
              style={[s.worker, { backgroundColor: t.card, borderColor: t.border }]}
              activeOpacity={0.85}
              onPress={order.workerId ? openProfile : undefined}
            >
              <Avatar letter={order.letter} bgColor={order.color} uri={order.masterPhoto} size={48} />
              <View style={{ flex: 1 }}>
                <Text style={[s.workerName, { color: t.text }]} numberOfLines={1}>
                  {order.master}
                </Text>
                {!!order.workerId && (
                  <Text style={[s.workerLink, { color: t.orange }]}>{tr('requests.viewProfile')}</Text>
                )}
              </View>
              <MaterialCommunityIcons name="chevron-right" size={22} color={t.faint} />
            </TouchableOpacity>

            <Text style={[s.sectionTitle, { color: t.text }]}>{tr('requests.priceSection')}</Text>
            <View style={[s.priceCard, { backgroundColor: t.card, borderColor: t.border }]}>
              {order.rawStatus === 'accepted' ? (
                order.offerPrice != null ? (
                  <>
                    <Text style={[s.priceLabel, { color: t.muted }]}>
                      {order.offerBy === 'worker'
                        ? tr('requests.offerFromWorker')
                        : tr('requests.offerFromMe')}
                    </Text>
                    <Text style={[s.priceValue, { color: t.orange }]}>
                      {formatPrice(tr, order.offerPrice)}
                    </Text>
                  </>
                ) : (
                  <Text style={[s.priceLabel, { color: t.muted }]}>{tr('requests.noOfferYet')}</Text>
                )
              ) : (
                <>
                  <Text style={[s.priceLabel, { color: t.muted }]}>{tr('requests.agreedLabel')}</Text>
                  <Text style={[s.priceValue, { color: t.green }]}>
                    {order.agreedPrice != null ? formatPrice(tr, order.agreedPrice) : '—'}
                  </Text>
                </>
              )}

              {negotiating && (
                <View style={s.actions}>
                  {info.state === 'offer' && (
                    <TouchableOpacity
                      style={[s.btn, { backgroundColor: t.orange, opacity: actions.busy ? 0.6 : 1 }]}
                      activeOpacity={0.85}
                      disabled={actions.busy}
                      onPress={() => actions.confirmAgree(order)}
                    >
                      <MaterialCommunityIcons name="check" size={18} color="#fff" />
                      <Text style={[s.btnText, { color: '#fff' }]}>{tr('requests.agree')}</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[s.btn, { borderColor: t.line2, borderWidth: 1.5 }]}
                    activeOpacity={0.8}
                    disabled={actions.busy}
                    onPress={() => setPriceOpen(true)}
                  >
                    <MaterialCommunityIcons name="cash-edit" size={18} color={t.text} />
                    <Text style={[s.btnText, { color: t.text }]}>{tr('requests.counter')}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </>
        )}

        {canChat && (
          <TouchableOpacity
            style={[s.chatBtn, { backgroundColor: t.blue }]}
            activeOpacity={0.85}
            onPress={openChat}
          >
            <MaterialCommunityIcons name="chat-processing-outline" size={20} color="#fff" />
            <Text style={s.chatBtnText}>{tr('requests.chat')}</Text>
          </TouchableOpacity>
        )}

        {isOpenOrder(order) && (
          <TouchableOpacity
            style={[s.cancel, { borderColor: t.red + '66' }]}
            activeOpacity={0.8}
            onPress={() => setCancelOpen(true)}
          >
            <Text style={[s.cancelText, { color: t.red }]}>{tr('requests.cancelOrder')}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <PromptModal
        visible={priceOpen}
        title={tr('requests.priceTitle')}
        placeholder={tr('requests.pricePlaceholder', { currency: tr('common.currencySom') })}
        confirmLabel={tr('requests.send')}
        keyboardType="number-pad"
        busy={actions.busy}
        onClose={() => setPriceOpen(false)}
        onSubmit={async (text) => {
          const price = parsePrice(text);
          if (price && (await actions.offerPrice(price))) setPriceOpen(false);
        }}
      />
      <PromptModal
        visible={cancelOpen}
        title={tr('requests.cancelTitle')}
        placeholder={tr('requests.cancelReasonPlaceholder')}
        confirmLabel={tr('requests.cancelConfirm')}
        multiline
        destructive
        busy={actions.busy}
        onClose={() => setCancelOpen(false)}
        onSubmit={async (reason) => {
          if (await actions.cancel(reason)) setCancelOpen(false);
        }}
      />
    </SafeAreaView>
  );
}

function SummaryRow({ icon, label, value, t, last }) {
  return (
    <View style={[s.row, !last && { borderBottomWidth: 1, borderBottomColor: t.border }]}>
      <MaterialCommunityIcons name={icon} size={20} color={t.muted} />
      <Text style={[s.rowLabel, { color: t.muted }]}>{label}</Text>
      <Text style={[s.rowValue, { color: t.text }]} numberOfLines={2}>
        {value || '—'}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontWeight: '700', fontSize: 20 },
  card: { borderRadius: 18, borderWidth: 1, paddingHorizontal: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 13 },
  rowLabel: { fontSize: 12.5, width: 74 },
  rowValue: { flex: 1, fontSize: 13.5, fontWeight: '600', textAlign: 'right' },
  sectionTitle: { fontWeight: '800', fontSize: 17, marginTop: 4 },
  worker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
  },
  workerName: { fontWeight: '800', fontSize: 15.5 },
  workerLink: { fontSize: 12.5, fontWeight: '600', marginTop: 3 },
  priceCard: { borderRadius: 18, borderWidth: 1, padding: 16, gap: 6 },
  priceLabel: { fontSize: 12.5 },
  priceValue: { fontWeight: '800', fontSize: 24 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 10 },
  btn: {
    flex: 1,
    height: 46,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  btnText: { fontWeight: '700', fontSize: 14 },
  chatBtn: {
    height: 52,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  chatBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  cancel: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: { fontWeight: '700', fontSize: 14.5 },
});
