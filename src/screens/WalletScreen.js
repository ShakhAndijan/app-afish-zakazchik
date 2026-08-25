import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Feather from '@expo/vector-icons/Feather';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useWallet } from '../context/WalletContext';
import SuccessModal from '../components/SuccessModal';

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000];

const fmt = (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

function MethodOption({ icon, label, active, color, onPress, t }) {
  return (
    <TouchableOpacity
      style={[
        s.methodBtn,
        {
          borderColor: active ? color : t.border,
          backgroundColor: active ? color + '14' : t.card,
        },
      ]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <View style={[s.methodIcon, { backgroundColor: color + '1c' }]}>
        <MaterialCommunityIcons name={icon} size={18} color={color} />
      </View>
      <Text style={[s.methodLabel, { color: t.text }]} numberOfLines={1}>
        {label}
      </Text>
      <View style={[s.radio, { borderColor: active ? color : t.faint }]}>
        {active && <View style={[s.radioDot, { backgroundColor: color }]} />}
      </View>
    </TouchableOpacity>
  );
}

export default function WalletScreen({ onBack }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const { balance, transactions, topUp } = useWallet();

  const [selectedAmount, setSelectedAmount] = useState(QUICK_AMOUNTS[1]);
  const [customAmount, setCustomAmount] = useState('');
  const [method, setMethod] = useState('card');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(null);

  const amount = customAmount ? parseInt(customAmount.replace(/\D/g, ''), 10) || 0 : selectedAmount;
  const isValid = amount >= 10000;

  const methods = [
    { key: 'card', icon: 'credit-card-outline', label: tr('wallet.methods.card'), color: t.blue },
    { key: 'cash', icon: 'cash', label: tr('wallet.methods.cash'), color: t.green },
  ];
  const methodLabel = methods.find((m) => m.key === method)?.label ?? '';

  const recentTx = useMemo(
    () => transactions.filter((tx) => tx.type === 'topup' || tx.type === 'refund').slice(0, 4),
    [transactions]
  );

  const handleConfirm = async () => {
    if (!isValid || processing) return;
    setProcessing(true);
    setTimeout(async () => {
      await topUp(amount, methodLabel);
      setProcessing(false);
      setSuccess(amount);
    }, 700);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top', 'left', 'right']}>
      <StatusBar style={t.isDark ? 'light' : 'dark'} />

      <View style={[s.header, { backgroundColor: t.bg }]}>
        <TouchableOpacity
          style={[s.backBtn, { backgroundColor: t.card, borderColor: t.border }]}
          onPress={onBack}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="chevron-left" size={24} color={t.text} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: t.text }]}>{tr('wallet.headerTitle')}</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={12}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Balans hero ── */}
          <View style={{ paddingHorizontal: 20 }}>
            <View style={[s.balanceCard, { overflow: 'hidden' }]}>
              <View style={s.balanceCircle} />
              <View style={s.balanceIcon}>
                <MaterialCommunityIcons name="wallet" size={22} color="#fff" />
              </View>
              <Text style={s.balanceLabel}>{tr('wallet.balanceLabel')}</Text>
              <Text style={s.balanceValue}>
                {fmt(balance)}{' '}
                <Text style={s.balanceCurrency}>{tr('common.currencySom')}</Text>
              </Text>
              <View style={s.infoRow}>
                <Feather name="info" size={13} color="rgba(255,255,255,0.85)" />
                <Text style={s.infoText}>{tr('wallet.infoNote')}</Text>
              </View>
            </View>
          </View>

          {/* ── To'ldirish formasi ── */}
          <View style={{ paddingHorizontal: 20, paddingTop: 22 }}>
            <Text style={[s.sectionTitle, { color: t.text }]}>{tr('wallet.topupTitle')}</Text>

            <Text style={[s.groupLabel, { color: t.faint }]}>{tr('wallet.quickAmounts')}</Text>
            <View style={s.amountGrid}>
              {QUICK_AMOUNTS.map((a) => {
                const active = !customAmount && a === selectedAmount;
                return (
                  <TouchableOpacity
                    key={a}
                    style={[
                      s.amountChip,
                      {
                        borderColor: active ? t.orange : t.border,
                        backgroundColor: active ? t.orange + '14' : t.card,
                      },
                    ]}
                    activeOpacity={0.8}
                    onPress={() => {
                      setSelectedAmount(a);
                      setCustomAmount('');
                    }}
                  >
                    <Text
                      style={[
                        s.amountChipText,
                        { color: active ? t.orange : t.text },
                      ]}
                    >
                      {fmt(a)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[s.groupLabel, { color: t.faint, marginTop: 16 }]}>
              {tr('wallet.customAmount')}
            </Text>
            <View
              style={[
                s.customInputWrap,
                { borderColor: customAmount ? t.orange : t.border, backgroundColor: t.card },
              ]}
            >
              <TextInput
                style={[s.customInput, { color: t.text }]}
                placeholder={tr('wallet.amountPlaceholder')}
                placeholderTextColor={t.faint}
                keyboardType="number-pad"
                value={customAmount ? fmt(customAmount.replace(/\D/g, '')) : ''}
                onChangeText={(v) => setCustomAmount(v.replace(/\D/g, ''))}
              />
              <Text style={[s.customInputSuffix, { color: t.muted }]}>
                {tr('common.currencySom')}
              </Text>
            </View>

            <Text style={[s.groupLabel, { color: t.faint, marginTop: 18 }]}>
              {tr('wallet.methodTitle')}
            </Text>
            <View style={{ gap: 10 }}>
              {methods.map((m) => (
                <MethodOption
                  key={m.key}
                  icon={m.icon}
                  label={m.label}
                  color={m.color}
                  active={method === m.key}
                  onPress={() => setMethod(m.key)}
                  t={t}
                />
              ))}
            </View>

            <TouchableOpacity
              style={[
                s.confirmBtn,
                { backgroundColor: t.orange, opacity: isValid && !processing ? 1 : 0.5 },
              ]}
              activeOpacity={0.85}
              disabled={!isValid || processing}
              onPress={handleConfirm}
            >
              {processing ? (
                <>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={s.confirmBtnText}>{tr('wallet.processing')}</Text>
                </>
              ) : (
                <Text style={s.confirmBtnText}>
                  {tr('wallet.confirmBtn')} · {fmt(amount)} {tr('common.currencySom')}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* ── So'nggi tranzaksiyalar ── */}
          <View style={{ paddingHorizontal: 20, paddingTop: 26 }}>
            <Text style={[s.sectionTitle, { color: t.text }]}>{tr('wallet.recentTitle')}</Text>
            {recentTx.length === 0 ? (
              <Text style={{ color: t.muted, fontSize: 13, marginTop: 10 }}>
                {tr('wallet.emptyTitle')}
              </Text>
            ) : (
              <View style={{ marginTop: 10, gap: 10 }}>
                {recentTx.map((tx) => (
                  <View
                    key={tx.id}
                    style={[s.txRow, { backgroundColor: t.card, borderColor: t.border }]}
                  >
                    <View style={[s.txIcon, { backgroundColor: '#2fa37a1c' }]}>
                      <MaterialCommunityIcons name="wallet-plus-outline" size={17} color="#2fa37a" />
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={[s.txTitle, { color: t.text }]} numberOfLines={1}>
                        {tx.title}
                      </Text>
                      <Text style={[s.txSub, { color: t.muted }]} numberOfLines={1}>
                        {tx.day}-{tx.month} · {tx.method}
                      </Text>
                    </View>
                    <Text style={[s.txAmount, { color: '#2fa37a' }]}>+{fmt(tx.amount)}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <SuccessModal
        visible={!!success}
        onClose={() => {
          setSuccess(null);
          setCustomAmount('');
        }}
        t={t}
        title={tr('wallet.successTitle')}
        message={tr('wallet.successMessage', { amount: fmt(success || 0) })}
        buttonText={tr('wallet.successBtn')}
      />
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
  headerTitle: { fontWeight: '700', fontSize: 20 },

  balanceCard: {
    borderRadius: 20,
    padding: 20,
    backgroundColor: '#e87a45',
    position: 'relative',
  },
  balanceCircle: {
    position: 'absolute',
    right: -30,
    top: -30,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  balanceIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  balanceLabel: { fontSize: 12.5, color: 'rgba(255,255,255,0.9)' },
  balanceValue: { fontWeight: '800', fontSize: 28, color: '#fff', marginTop: 4 },
  balanceCurrency: { fontSize: 13, fontWeight: '600', opacity: 0.85 },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  infoText: { flex: 1, fontSize: 11.5, color: 'rgba(255,255,255,0.9)', lineHeight: 16 },

  sectionTitle: { fontWeight: '700', fontSize: 16 },
  groupLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.3, marginTop: 14, marginBottom: 9 },

  amountGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  amountChip: {
    borderWidth: 1.5,
    borderRadius: 13,
    paddingVertical: 11,
    paddingHorizontal: 14,
    minWidth: '46%',
    alignItems: 'center',
  },
  amountChipText: { fontWeight: '700', fontSize: 14 },

  customInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 13,
    paddingHorizontal: 14,
    height: 50,
  },
  customInput: { flex: 1, fontSize: 15, fontWeight: '600' },
  customInputSuffix: { fontSize: 12.5, fontWeight: '600' },

  methodBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 12,
  },
  methodIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodLabel: { flex: 1, fontWeight: '600', fontSize: 13.5 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: { width: 10, height: 10, borderRadius: 5 },

  confirmBtn: {
    flexDirection: 'row',
    gap: 8,
    height: 52,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
  },
  confirmBtnText: { color: '#fff', fontWeight: '700', fontSize: 14.5 },

  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
  },
  txIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txTitle: { fontWeight: '700', fontSize: 13.5 },
  txSub: { fontSize: 11.5, marginTop: 2 },
  txAmount: { fontWeight: '800', fontSize: 13.5 },
});
