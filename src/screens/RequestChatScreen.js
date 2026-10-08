import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getOrderChat, sendOrderChat, markOrderChatRead } from '../api/orders';
import Avatar from '../components/Avatar';
import PromptModal from './requests/components/PromptModal';
import usePolling from './requests/hooks/usePolling';
import useLiveOrder from './requests/hooks/useLiveOrder';
import useOrderActions, { parsePrice } from './requests/hooks/useOrderActions';
import { clockLabel, formatPrice } from './requests/utils';

const CHAT_POLL_MS = 5000;

// Zakaz chati (backenddan): usta bilan suhbat, narx takliflari chatda alohida qator bo'lib
// ko'rinadi. Tepada joriy taklif va "Qabul qilish" / "Narx taklif qilish" tugmalari turadi.
export default function RequestChatScreen({ orderId, onBack }) {
  const { theme: t } = useTheme();
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
  const thread = chat?.threads.find((th) => th.isActive) ?? chat?.threads[chat.threads.length - 1];
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
      setChat(await sendOrderChat(orderId, body));
      setText('');
    } catch (e) {
      Alert.alert(tr('common.errorTitle'), e?.message || tr('requests.actionFailed'));
    } finally {
      setSending(false);
    }
  };

  const negotiating = order?.rawStatus === 'accepted';
  const workerOffer = negotiating && order.offerBy === 'worker' && order.offerPrice != null;
  const canSend = chat ? chat.canSend : true;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top', 'left', 'right', 'bottom']}>
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
          letter={(thread?.workerName ?? order?.master ?? '?').trim()[0]?.toUpperCase() ?? '?'}
          bgColor={order?.color}
          uri={thread?.workerPhoto ?? order?.masterPhoto}
          size={40}
        />
        <View style={{ flex: 1 }}>
          <Text style={[s.name, { color: t.text }]} numberOfLines={1}>
            {thread?.workerName ?? order?.master ?? tr('requests.workerSection')}
          </Text>
          <Text style={[s.meta, { color: t.muted }]} numberOfLines={1}>
            {tr('requests.headerTitle', { id: orderId })}
          </Text>
        </View>
      </View>

      {negotiating && (
        <View style={[s.priceBar, { backgroundColor: t.card, borderBottomColor: t.border }]}>
          <View style={{ flex: 1 }}>
            <Text style={[s.priceLabel, { color: t.muted }]}>
              {order.offerPrice == null
                ? tr('requests.noOfferYet')
                : order.offerBy === 'worker'
                  ? tr('requests.offerFromWorker')
                  : tr('requests.offerFromMe')}
            </Text>
            {order.offerPrice != null && (
              <Text style={[s.priceValue, { color: t.orange }]}>{formatPrice(tr, order.offerPrice)}</Text>
            )}
          </View>
          <TouchableOpacity
            style={[s.smallBtn, { borderColor: t.line2, borderWidth: 1.5 }]}
            activeOpacity={0.8}
            disabled={actions.busy}
            onPress={() => setPriceOpen(true)}
          >
            <Text style={[s.smallBtnText, { color: t.text }]}>{tr('requests.counter')}</Text>
          </TouchableOpacity>
          {workerOffer && (
            <TouchableOpacity
              style={[s.smallBtn, { backgroundColor: t.orange, opacity: actions.busy ? 0.6 : 1 }]}
              activeOpacity={0.85}
              disabled={actions.busy}
              onPress={() => actions.confirmAgree(order)}
            >
              <Text style={[s.smallBtnText, { color: '#fff' }]}>{tr('requests.agree')}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
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

        {canSend ? (
          <View style={[s.inputRow, { borderTopColor: t.border, backgroundColor: t.bg }]}>
            <TextInput
              style={[s.input, { backgroundColor: t.inputBg, color: t.text, borderColor: t.border }]}
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
          <Text style={[s.closed, { color: t.faint, borderTopColor: t.border }]}>
            {tr('requests.chatClosed')}
          </Text>
        )}
      </KeyboardAvoidingView>

      <PromptModal
        visible={priceOpen}
        title={tr('requests.priceTitle')}
        placeholder={tr('requests.pricePlaceholder', { currency: tr('common.currencySom') })}
        confirmLabel={tr('requests.send')}
        keyboardType="number-pad"
        busy={actions.busy}
        onClose={() => setPriceOpen(false)}
        onSubmit={async (value) => {
          const price = parsePrice(value);
          if (price && (await actions.offerPrice(price))) {
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
          { alignSelf: mine ? 'flex-end' : 'flex-start', backgroundColor: t.card, borderColor: t.orange },
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
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  priceLabel: { fontSize: 11.5 },
  priceValue: { fontWeight: '800', fontSize: 16, marginTop: 1 },
  smallBtn: { borderRadius: 10, paddingHorizontal: 12, height: 36, justifyContent: 'center' },
  smallBtnText: { fontWeight: '700', fontSize: 12.5 },
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
  sendBtn: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  closed: { textAlign: 'center', fontSize: 12.5, paddingVertical: 14, borderTopWidth: 1 },
});
