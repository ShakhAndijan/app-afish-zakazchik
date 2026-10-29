import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { appAlert } from '../components/AppAlert';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAvoidingView, useKeyboardState } from 'react-native-keyboard-controller';
import useBottomInset from '../hooks/useBottomInset';
import { StatusBar } from 'expo-status-bar';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getOrderChat, sendOrderChat, markOrderChatRead } from '../api/orders';
import Avatar from '../components/Avatar';
import OfferModal from './requests/components/OfferModal';
import usePolling from './requests/hooks/usePolling';
import useLiveOrder from './requests/hooks/useLiveOrder';
import useOrderActions from './requests/hooks/useOrderActions';
import { clockLabel, formatDay, formatPrice, isDayValid, offerDay } from './requests/utils';
import { getErrorMessage } from '../utils/errors';

const CHAT_POLL_MS = 5000;

// Buyurtma chati (backenddan): usta bilan suhbat, narx takliflari chatda alohida qator bo'lib
// ko'rinadi. Tepada joriy taklif va "Qabul qilish" / "Narx taklif qilish" tugmalari turadi.
// `workerId` berilsa (usta tanlanmagan buyurtmada taklif kartasidan "Yozish"), aynan shu usta bilan
// suhbat ochiladi va xabarlar unga yuboriladi.
export default function RequestChatScreen({
  orderId,
  workerId = null,
  workerName = null,
  workerPhoto = null,
  onBack,
}) {
  const { theme: t } = useTheme();
  const bottomInset = useBottomInset();
  const keyboardVisible = useKeyboardState((st) => st.isVisible);
  const { t: tr } = useLanguage();
  const { order, refresh: refreshOrder } = useLiveOrder(orderId);
  const actions = useOrderActions(orderId, refreshOrder);
  const [chat, setChat] = useState(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);
  const scrollRef = useRef(null);

  const loadChat = useCallback(async () => {
    try {
      setChat(await getOrderChat(orderId));
    } catch {
      // Yangilash muvaffaqiyatsiz bo'lsa, avvalgi chat saqlanadi.
    }
  }, [orderId]);

  usePolling(loadChat, CHAT_POLL_MS);

  // Hozirgi usta bilan suhbat (bo'lmasa — eng oxirgisi).
  const thread =
    workerId != null
      ? chat?.threads.find((th) => th.workerId === workerId)
      : (chat?.threads.find((th) => th.isActive) ?? chat?.threads[chat.threads.length - 1]);
  const messages = thread?.messages ?? [];

  useEffect(() => {
    if (chat?.unread) markOrderChatRead(orderId).catch(() => {});
  }, [chat?.unread, orderId]);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages.length]);

  const send = async () => {
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      setChat(await sendOrderChat(orderId, body, workerId));
      setText('');
    } catch (e) {
      appAlert(tr('common.errorTitle'), getErrorMessage(e, tr, 'requests.actionFailed'));
    } finally {
      setSending(false);
    }
  };

  const negotiating = order?.rawStatus === 'accepted';
  const workerOffer = negotiating && order.offerBy !== 'customer' && order.offerPrice != null;
  // Aniq ustaga yozilganda: suhbat bor bo'lsa faqat u faol bo'lganda, hali boshlanmagan bo'lsa — taklif turgani uchun mumkin.
  const canSend = workerId != null ? (thread ? thread.isActive : true) : chat ? chat.canSend : true;
  // Kelishish uchun taklifdagi sana yaroqli bo'lishi kerak (saytdagidek).
  const offerDayValue = negotiating ? offerDay(order) : null;
  const agreeDayOk = isDayValid(offerDayValue);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top', 'left', 'right']}>
      <StatusBar style={t.isDark ? 'light' : 'dark'} />

      <View style={[s.header, { borderBottomColor: t.border }]}>
        <TouchableOpacity
          style={[s.backBtn, { backgroundColor: t.card, borderColor: t.border }]}
          onPress={onBack}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="chevron-left" size={24} color={t.text} />
        </TouchableOpacity>
        <Avatar
          letter={
            (thread?.workerName ?? workerName ?? order?.master ?? '?').trim()[0]?.toUpperCase() ??
            '?'
          }
          bgColor={order?.color}
          uri={thread?.workerPhoto ?? workerPhoto ?? order?.masterPhoto}
          size={40}
        />
        <View style={{ flex: 1 }}>
          <Text style={[s.name, { color: t.text }]} numberOfLines={1}>
            {thread?.workerName ?? workerName ?? order?.master ?? tr('requests.workerSection')}
          </Text>
          <Text style={[s.meta, { color: t.muted }]} numberOfLines={1}>
            {tr('requests.headerTitle', { id: orderId })}
          </Text>
        </View>
      </View>

      {negotiating && (
        <View style={[s.priceBar, { backgroundColor: t.card, borderBottomColor: t.border }]}>
          <MaterialCommunityIcons name="cash-multiple" size={18} color={t.orange} />
          <Text style={[s.priceLabel, { color: t.muted }]} numberOfLines={1}>
            {order.offerPrice == null
              ? tr('requests.noOfferYet')
              : order.offerBy === 'worker'
                ? tr('requests.offerFromWorker')
                : tr('requests.offerFromMe')}
          </Text>
          {order.offerPrice != null && (
            <Text style={[s.priceValue, { color: t.orange }]} numberOfLines={1}>
              {formatPrice(tr, order.offerPrice)}
              {!!offerDayValue && (
                <Text style={[s.priceLabel, { color: t.muted }]}>
                  {`  ·  ${formatDay(tr, offerDayValue)}`}
                </Text>
              )}
            </Text>
          )}
        </View>
      )}

      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={s.messages}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {messages.length === 0 && (
            <Text style={[s.empty, { color: t.faint }]}>{tr('requests.chatEmpty')}</Text>
          )}
          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} t={t} tr={tr} />
          ))}
        </ScrollView>

        {negotiating && !keyboardVisible && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            style={[s.chipsWrap, { borderTopColor: t.border, backgroundColor: t.bg }]}
            contentContainerStyle={s.chips}
          >
            {workerOffer && (
              <TouchableOpacity
                style={[
                  s.chip,
                  { backgroundColor: t.orange, opacity: actions.busy || !agreeDayOk ? 0.5 : 1 },
                ]}
                activeOpacity={0.85}
                disabled={actions.busy || !agreeDayOk}
                onPress={() => actions.confirmAgree(order)}
              >
                <MaterialCommunityIcons name="check" size={16} color="#fff" />
                <Text style={[s.chipText, { color: '#fff' }]}>{tr('orderFlow.stage.agree')}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[s.chip, { backgroundColor: t.orange + '14', borderColor: t.orange + '55' }]}
              activeOpacity={0.8}
              disabled={actions.busy}
              onPress={() => setPriceOpen(true)}
            >
              <MaterialCommunityIcons name="cash-edit" size={16} color={t.orange} />
              <Text style={[s.chipText, { color: t.orange }]}>
                {order.offerPrice != null
                  ? tr('orderFlow.stage.counter')
                  : tr('orderFlow.stage.offer')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.chip, { borderColor: t.red + '66' }]}
              activeOpacity={0.8}
              disabled={actions.busy}
              onPress={() => actions.confirmDecline(loadChat)}
            >
              <MaterialCommunityIcons name="close-circle-outline" size={16} color={t.red} />
              <Text style={[s.chipText, { color: t.red }]}>{tr('orderFlow.stage.decline')}</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {canSend ? (
          <View
            style={[
              s.inputRow,
              { borderTopColor: t.border, backgroundColor: t.bg, paddingBottom: 10 + bottomInset },
            ]}
          >
            <TextInput
              style={[
                s.input,
                { backgroundColor: t.inputBg, color: t.text, borderColor: t.border },
              ]}
              value={text}
              onChangeText={setText}
              placeholder={tr('requests.chatPlaceholder')}
              placeholderTextColor={t.faint}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity
              style={[s.sendBtn, { backgroundColor: text.trim() ? t.orange : t.card3 }]}
              activeOpacity={0.85}
              onPress={send}
              disabled={!text.trim() || sending}
            >
              <MaterialCommunityIcons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <Text
            style={[
              s.closed,
              { color: t.faint, borderTopColor: t.border, paddingBottom: 14 + bottomInset },
            ]}
          >
            {tr('requests.chatClosed')}
          </Text>
        )}
      </KeyboardAvoidingView>

      <OfferModal
        visible={priceOpen}
        order={order}
        busy={actions.busy}
        onClose={() => setPriceOpen(false)}
        onSubmit={async (price, day) => {
          if (await actions.offerPrice(price, day)) {
            setPriceOpen(false);
            loadChat();
          }
        }}
      />
    </SafeAreaView>
  );
}

function MessageBubble({ message: m, t, tr }) {
  if (m.kind === 'system') {
    return <Text style={[s.system, { color: t.faint }]}>{m.body}</Text>;
  }

  const mine = m.from === 'me';

  if (m.kind === 'offer') {
    return (
      <View
        style={[
          s.offer,
          {
            alignSelf: mine ? 'flex-end' : 'flex-start',
            backgroundColor: t.card,
            borderColor: t.orange,
          },
        ]}
      >
        <Text style={[s.offerLabel, { color: t.muted }]}>{tr('requests.offerBubble')}</Text>
        <Text style={[s.offerPrice, { color: t.orange }]}>
          {m.offerPrice != null ? formatPrice(tr, m.offerPrice) : m.body}
        </Text>
        <Text style={[s.bubbleTime, { color: t.faint }]}>{clockLabel(m.at)}</Text>
      </View>
    );
  }

  return (
    <View
      style={[
        s.bubble,
        mine
          ? { alignSelf: 'flex-end', backgroundColor: t.orange, borderBottomRightRadius: 4 }
          : { alignSelf: 'flex-start', backgroundColor: t.card, borderBottomLeftRadius: 4 },
      ]}
    >
      <Text style={[s.bubbleText, { color: mine ? '#fff' : t.text }]}>{m.body}</Text>
      <Text style={[s.bubbleTime, { color: mine ? 'rgba(255,255,255,0.75)' : t.faint }]}>
        {clockLabel(m.at)}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontWeight: '800', fontSize: 15.5 },
  meta: { fontSize: 12, marginTop: 2 },
  priceBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderBottomWidth: 1,
  },
  priceLabel: { fontSize: 12 },
  priceValue: { fontWeight: '800', fontSize: 15 },
  chipsWrap: { flexGrow: 0, borderTopWidth: 1 },
  chips: { gap: 8, paddingHorizontal: 14, paddingVertical: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  chipText: { fontWeight: '700', fontSize: 13 },
  messages: { padding: 16, gap: 8, flexGrow: 1 },
  empty: { textAlign: 'center', marginTop: 40, fontSize: 13 },
  system: { alignSelf: 'center', fontSize: 11.5, textAlign: 'center', marginVertical: 4 },
  bubble: { maxWidth: '82%', borderRadius: 16, paddingHorizontal: 13, paddingVertical: 9, gap: 3 },
  bubbleText: { fontSize: 14.5, lineHeight: 20 },
  bubbleTime: { fontSize: 10, alignSelf: 'flex-end' },
  offer: { borderRadius: 16, borderWidth: 1.5, paddingHorizontal: 14, paddingVertical: 10, gap: 2 },
  offerLabel: { fontSize: 11 },
  offerPrice: { fontWeight: '800', fontSize: 18 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 110,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingTop: 11,
    paddingBottom: 11,
    fontSize: 14.5,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closed: { textAlign: 'center', fontSize: 12.5, paddingVertical: 14, borderTopWidth: 1 },
});
