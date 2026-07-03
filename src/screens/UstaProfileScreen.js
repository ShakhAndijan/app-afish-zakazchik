import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Modal, TextInput, KeyboardAvoidingView, Platform, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';

// ─── Theme Palettes ───────────────────────────────────────────────────────────

const DARK = {
  bg: '#0c1828', cover: '#11243c', card: '#142639',
  border: 'rgba(255,255,255,0.07)',
  orange: '#e87a45', orangeD: '#d8602a', gold: '#f5c451',
  green: '#2fa37a', greenSoft: 'rgba(47,163,122,0.14)',
  blue: '#3f7fd4', red: '#e0473a', redSoft: 'rgba(224,71,58,0.13)',
  white: '#fff', muted: '#8da0ba', faint: '#6c7f9a',
  rowIconBg: 'rgba(255,255,255,0.05)',
  handleBg: 'rgba(255,255,255,0.2)',
  navBg: 'rgba(12,22,36,0.96)',
  inputBorder: 'rgba(255,255,255,0.08)',
  divider: 'rgba(255,255,255,0.07)',
};

const LIGHT = {
  bg: '#f0f4f8', cover: '#e4ecf5', card: '#ffffff',
  border: 'rgba(0,0,0,0.09)',
  orange: '#e87a45', orangeD: '#d8602a', gold: '#c8880a',
  green: '#1d8c68', greenSoft: 'rgba(29,140,104,0.12)',
  blue: '#3070c0', red: '#d03025', redSoft: 'rgba(208,48,37,0.1)',
  white: '#0d1b2a', muted: '#5a6e84', faint: '#8a9eb8',
  rowIconBg: 'rgba(0,0,0,0.04)',
  handleBg: 'rgba(0,0,0,0.12)',
  navBg: 'rgba(240,244,248,0.97)',
  inputBorder: 'rgba(0,0,0,0.1)',
  divider: 'rgba(0,0,0,0.08)',
};

// ─── Static data ──────────────────────────────────────────────────────────────

const NAV = [
  { key: 'home',    label: 'Asosiy',      on: 'home',            off: 'home-outline' },
  { key: 'orders',  label: 'Buyurtmalar', on: 'grid',            off: 'grid-outline',        badge: 3 },
  { key: 'chat',    label: 'Xabarlar',    on: 'chatbubble',      off: 'chatbubble-outline' },
  { key: 'profile', label: 'Profil',      on: 'person',          off: 'person-outline' },
];

const STATS = [['247', 'Bajarilgan'], ['4.9', 'Reyting'], ['186', 'Sharhlar']];
const SKILLS = ['Santexnik', 'Quvur montaji', 'Kanalizatsiya', 'Suv hisoblagich'];

const ACCOUNT = {
  balance: 4_250_000,
  earned_total: 48_700_000,
  earned_month: 3_200_000,
  pending: 450_000,
};

const REVIEWS = [
  { name: 'Nodira S.',  initial: 'N', bgColor: '#E85B9A', rating: 5, task: 'Oshxona shkafi', text: 'Juda tez va sifatli ishladi, rahmat!',                 day: '2 kun oldin'  },
  { name: 'Alisher U.', initial: 'A', bgColor: '#E8743B', rating: 5, task: 'Eshik petlasi',  text: 'Professional usta, albatta tavsiya qilaman.',          day: '5 kun oldin'  },
  { name: 'Kamola R.',  initial: 'K', bgColor: '#3E8BE8', rating: 4, task: "Mebel yig'ish",  text: "Yaxshi bajardi, biroz kechikdi xolos.",                day: '1 hafta oldin' },
];

function formatMoney(n) {
  return Math.abs(n).toLocaleString('uz-UZ') + " so'm";
}

const PORTFOLIO_DEFAULT = [
  { id: 1, bg: '#1e2d1a', icon: 'hammer',         title: '', draft: false },
  { id: 2, bg: '#2d1e1a', icon: 'water-pump',     title: '', draft: false },
  { id: 3, bg: '#1a1e2d', icon: 'lightning-bolt', title: '', draft: false },
  { id: 4, bg: '#1e1a2d', icon: 'brush',          title: '', draft: false },
];

const ICON_OPTIONS = [
  { key: 'hammer',         label: 'Qurilish'  },
  { key: 'water-pump',     label: 'Santexnik' },
  { key: 'lightning-bolt', label: 'Elektr'    },
  { key: 'brush',          label: "Bo'yoq"    },
  { key: 'wrench',         label: 'Tamir'     },
  { key: 'layers',         label: 'Gips'      },
  { key: 'grid',           label: 'Plita'     },
  { key: 'domain',         label: 'Quruv'     },
];

const ICON_BG = {
  hammer: '#1e2d1a', 'water-pump': '#2d1e1a', 'lightning-bolt': '#1a1e2d',
  brush: '#1e1a2d', wrench: '#2d2a1a', layers: '#1a2d2b', grid: '#1d1a2d', domain: '#2d1a1e',
};

const EMPTY_FORM = { title: '', desc: '', icon: 'hammer' };

// ─── AddPortfolioModal ────────────────────────────────────────────────────────

function AddPortfolioModal({ visible, onClose, onSave, P, m }) {
  const [form, setForm] = useState(EMPTY_FORM);

  function handleSave(asDraft) {
    if (!form.title.trim()) return;
    onSave({ ...form, draft: asDraft });
    setForm(EMPTY_FORM);
  }

  function handleClose() {
    setForm(EMPTY_FORM);
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable style={m.backdrop} onPress={handleClose} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={m.sheetWrapper}>
        <View style={m.sheet}>
          <View style={m.handle} />
          <Text style={m.title}>Yangi ish qo'shish</Text>
          <Text style={m.subtitle}>Portfelingizga bajargan ishingizni qo'shing</Text>

          <Text style={m.label}>Ish nomi *</Text>
          <TextInput
            style={m.input}
            placeholder="Masalan: Vannaxona ta'miri"
            placeholderTextColor={P.faint}
            value={form.title}
            onChangeText={v => setForm(f => ({ ...f, title: v }))}
          />

          <Text style={m.label}>Tavsif</Text>
          <TextInput
            style={[m.input, m.textArea]}
            placeholder="Ish haqida qisqacha..."
            placeholderTextColor={P.faint}
            value={form.desc}
            onChangeText={v => setForm(f => ({ ...f, desc: v }))}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <Text style={m.label}>Kategoriya belgisi</Text>
          <View style={m.iconGrid}>
            {ICON_OPTIONS.map(opt => {
              const active = form.icon === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[m.iconCell, active && m.iconCellActive]}
                  onPress={() => setForm(f => ({ ...f, icon: opt.key }))}
                  activeOpacity={0.75}
                >
                  <MaterialCommunityIcons name={opt.key} size={22} color={active ? P.orange : P.muted} />
                  <Text style={[m.iconLabel, active && { color: P.orange }]}>{opt.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={[m.preview, { backgroundColor: ICON_BG[form.icon] || P.card }]}>
            <MaterialCommunityIcons name={form.icon} size={36} color="rgba(255,255,255,0.3)" />
            {form.title ? <Text style={m.previewTitle} numberOfLines={1}>{form.title}</Text> : null}
            <View style={m.draftBadge}>
              <Text style={m.draftBadgeTxt}>XOMAKI</Text>
            </View>
          </View>

          <View style={m.btnRow}>
            <TouchableOpacity style={[m.btn, m.btnDraft]} activeOpacity={0.8} onPress={() => handleSave(true)}>
              <MaterialCommunityIcons name="file-edit-outline" size={16} color={P.orange} />
              <Text style={[m.btnTxt, { color: P.orange }]}>Xomaki saqlash</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[m.btn, m.btnPub, !form.title.trim() && m.btnDisabled]}
              activeOpacity={0.8}
              onPress={() => handleSave(false)}
            >
              <MaterialCommunityIcons name="check" size={16} color="#fff" />
              <Text style={[m.btnTxt, { color: '#fff' }]}>Nashr etish</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── MoneyActionModal ─────────────────────────────────────────────────────────

function MoneyActionModal({ visible, type, onClose, onConfirm, P, m }) {
  const [amount, setAmount] = useState('');
  const isTopup = type === 'topup';

  function handleConfirm() {
    const num = parseInt(amount.replace(/\D/g, ''), 10);
    if (!num || num < 1000) return;
    onConfirm(num);
    setAmount('');
  }

  function handleClose() {
    setAmount('');
    onClose();
  }

  const QUICK = isTopup ? [50_000, 100_000, 200_000, 500_000] : [100_000, 200_000, 500_000, 1_000_000];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable style={m.backdrop} onPress={handleClose} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={m.sheetWrapper}>
        <View style={m.sheet}>
          <View style={m.handle} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 6 }}>
            <View style={[m.actionIcon, { backgroundColor: isTopup ? 'rgba(47,163,122,0.15)' : 'rgba(232,122,69,0.15)' }]}>
              <MaterialCommunityIcons
                name={isTopup ? 'bank-transfer-in' : 'bank-transfer-out'}
                size={22}
                color={isTopup ? P.green : P.orange}
              />
            </View>
            <View>
              <Text style={m.title}>{isTopup ? "Hisobni to'ldirish" : 'Pul yechish'}</Text>
              <Text style={m.subtitle}>Joriy balans: {formatMoney(ACCOUNT.balance)}</Text>
            </View>
          </View>

          <Text style={m.label}>Summa (so'm)</Text>
          <TextInput
            style={m.input}
            placeholder="0"
            placeholderTextColor={P.faint}
            value={amount}
            keyboardType="numeric"
            onChangeText={v => setAmount(v.replace(/\D/g, ''))}
          />

          <View style={m.quickRow}>
            {QUICK.map(q => (
              <TouchableOpacity
                key={q}
                style={[m.quickBtn, amount === String(q) && m.quickBtnActive]}
                activeOpacity={0.7}
                onPress={() => setAmount(String(q))}
              >
                <Text style={[m.quickTxt, amount === String(q) && { color: P.orange }]}>
                  {(q / 1000).toFixed(0)}K
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[m.btn, m.btnPub, { marginTop: 20 }, (!amount || parseInt(amount) < 1000) && m.btnDisabled]}
            activeOpacity={0.8}
            onPress={handleConfirm}
          >
            <MaterialCommunityIcons name="check" size={16} color="#fff" />
            <Text style={[m.btnTxt, { color: '#fff' }]}>{isTopup ? "To'ldirish" : 'Yechish'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── EditNameModal ────────────────────────────────────────────────────────────

function EditNameModal({ visible, currentName, onClose, onSave, P, m }) {
  const parts = currentName.split(' ');
  const [firstName, setFirstName] = useState(parts[0] || '');
  const [lastName, setLastName] = useState(parts.slice(1).join(' ') || '');

  React.useEffect(() => {
    if (visible) {
      const p = currentName.split(' ');
      setFirstName(p[0] || '');
      setLastName(p.slice(1).join(' ') || '');
    }
  }, [visible, currentName]);

  function handleSave() {
    const full = [firstName.trim(), lastName.trim()].filter(Boolean).join(' ');
    if (!full) return;
    onSave(full);
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={m.backdrop} onPress={onClose} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={m.sheetWrapper}>
        <View style={m.sheet}>
          <View style={m.handle} />
          <Text style={m.title}>Ismni tahrirlash</Text>
          <Text style={m.subtitle}>Ism va familiyangizni yangilang</Text>

          <Text style={m.label}>Ism *</Text>
          <TextInput
            style={m.input}
            placeholder="Ismingiz"
            placeholderTextColor={P.faint}
            value={firstName}
            onChangeText={setFirstName}
          />

          <Text style={m.label}>Familiya</Text>
          <TextInput
            style={m.input}
            placeholder="Familiyangiz"
            placeholderTextColor={P.faint}
            value={lastName}
            onChangeText={setLastName}
          />

          <View style={m.btnRow}>
            <TouchableOpacity style={[m.btn, m.btnDraft]} activeOpacity={0.8} onPress={onClose}>
              <Text style={[m.btnTxt, { color: P.orange }]}>Bekor qilish</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[m.btn, m.btnPub, !firstName.trim() && m.btnDisabled]}
              activeOpacity={0.8}
              onPress={handleSave}
            >
              <MaterialCommunityIcons name="check" size={16} color="#fff" />
              <Text style={[m.btnTxt, { color: '#fff' }]}>Saqlash</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Avatar({ letter = 'A', size = 72, bgColor }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.29, backgroundColor: bgColor, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#fff', fontSize: size * 0.44, fontWeight: '800' }}>{letter}</Text>
    </View>
  );
}

function Stars({ n, size = 12 }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Ionicons key={i} name="star" size={size} color={i <= n ? '#E8B84B' : 'rgba(255,255,255,0.15)'} />
      ))}
    </View>
  );
}

function ActionCard({ icon, iconBg, iconCol, title, sub, subCol, P, onPress }) {
  return (
    <TouchableOpacity
      style={{ flex: 1, backgroundColor: P.card, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: P.border }}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={{ width: 42, height: 42, borderRadius: 13, backgroundColor: iconBg, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
        <MaterialCommunityIcons name={icon} size={21} color={iconCol} />
      </View>
      <Text style={{ fontSize: 14, fontWeight: '800', color: P.white, letterSpacing: -0.2 }}>{title}</Text>
      <Text style={{ fontSize: 11.5, color: subCol, fontWeight: '700', marginTop: 3 }}>{sub}</Text>
    </TouchableOpacity>
  );
}

function MenuRow({ icon, label, meta, danger, last, onPress, P, s }) {
  return (
    <TouchableOpacity style={[s.row, last && { borderBottomWidth: 0 }]} activeOpacity={0.7} onPress={onPress}>
      <View style={[s.rowIcon, danger && s.rowIconDanger]}>
        <MaterialCommunityIcons name={icon} size={19} color={danger ? P.red : P.muted} />
      </View>
      <Text style={[s.rowLabel, danger && { color: P.red }]}>{label}</Text>
      {meta ? <Text style={s.rowValue}>{meta}</Text> : null}
      {!danger && <MaterialCommunityIcons name="chevron-right" size={18} color={P.faint} />}
    </TouchableOpacity>
  );
}

// ─── Style factories ──────────────────────────────────────────────────────────

function makeStyles(P) {
  return StyleSheet.create({
    header: {
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12,
    },
    iconBtn: {
      width: 40, height: 40, borderRadius: 12,
      backgroundColor: P.orange,
      alignItems: 'center', justifyContent: 'center',
    },
    identityCard: {
      flexDirection: 'row', alignItems: 'center', gap: 15,
      paddingHorizontal: 16,
    },
    editBtn: {
      flexDirection: 'row', alignItems: 'center', gap: 6,
      marginTop: 9, paddingHorizontal: 14, paddingVertical: 7,
      borderRadius: 10, borderWidth: 1, borderColor: P.border,
    },
    statsRow: {
      flexDirection: 'row', marginHorizontal: 16,
      backgroundColor: P.card, borderRadius: 16,
      borderWidth: 1, borderColor: P.border,
    },
    statCell: { flex: 1, alignItems: 'center', paddingVertical: 14 },
    statBorder: { borderRightWidth: 1, borderRightColor: P.border },
    statVal: { fontWeight: '800', fontSize: 20, color: P.white },
    statLbl: { fontSize: 11, color: P.muted, marginTop: 3, fontWeight: '600' },

    walletCard: {
      marginHorizontal: 16, borderRadius: 20, padding: 18, overflow: 'hidden',
      backgroundColor: P.orange,
    },
    walletCircle: {
      position: 'absolute', width: 130, height: 130, borderRadius: 65,
      backgroundColor: 'rgba(255,255,255,0.12)', top: -30, right: -30,
    },
    walletLabel: { fontSize: 12.5, color: 'rgba(255,255,255,0.88)', fontWeight: '600' },
    walletAmount: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: -0.6, marginTop: 2 },
    withdrawBtn: {
      paddingHorizontal: 14, paddingVertical: 9,
      borderRadius: 11, backgroundColor: '#fff',
      alignItems: 'center', justifyContent: 'center',
    },
    levelBar: {
      height: 7, borderRadius: 4, overflow: 'hidden',
      backgroundColor: 'rgba(255,255,255,0.25)', marginTop: 8,
    },
    levelFill: { height: '100%', borderRadius: 4, backgroundColor: '#fff', width: '68%' },

    actionRow: { flexDirection: 'row', gap: 12, marginHorizontal: 16 },

    section: { paddingHorizontal: 16, paddingTop: 20 },
    sectionTitle: { fontWeight: '800', fontSize: 16, color: P.white, letterSpacing: -0.2 },
    sectionLink: { fontSize: 13, color: P.orange, fontWeight: '700' },

    chip: {
      backgroundColor: P.card, borderWidth: 1, borderColor: P.border,
      paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
    },
    addBtn: {
      flexDirection: 'row', alignItems: 'center', gap: 4,
      backgroundColor: 'rgba(232,122,69,0.12)',
      paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999,
      borderWidth: 1, borderColor: 'rgba(232,122,69,0.25)',
    },
    portfolioCell: {
      flex: 1, height: 96, borderRadius: 16,
      alignItems: 'center', justifyContent: 'center',
      borderWidth: 1, borderColor: P.border, overflow: 'hidden',
    },
    portfolioTitle: {
      position: 'absolute', bottom: 8, left: 8, right: 8,
      fontSize: 10.5, fontWeight: '600', color: 'rgba(255,255,255,0.7)', textAlign: 'center',
    },
    draftTag: {
      position: 'absolute', top: 7, right: 7,
      backgroundColor: 'rgba(232,122,69,0.85)',
      paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5,
    },
    draftTagTxt: { fontSize: 8, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },

    reviewCard: {
      backgroundColor: P.card, borderWidth: 1, borderColor: P.border,
      borderRadius: 15, padding: 14,
    },
    reviewText: { fontSize: 13, color: P.muted, marginTop: 10, lineHeight: 19, fontWeight: '600' },

    menuCard: {
      backgroundColor: P.card, borderWidth: 1, borderColor: P.border,
      borderRadius: 18, paddingHorizontal: 15, paddingVertical: 2,
    },
    row: {
      flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 13,
      borderBottomWidth: 1, borderBottomColor: P.border,
    },
    rowIcon: {
      width: 38, height: 38, borderRadius: 11,
      backgroundColor: P.rowIconBg,
      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    },
    rowIconDanger: { backgroundColor: P.redSoft },
    rowLabel: { flex: 1, fontWeight: '700', fontSize: 14.5, color: P.white },
    rowValue: { fontSize: 13, color: P.muted, fontWeight: '600' },

    sectionLabel: {
      fontSize: 11.5, fontWeight: '800', letterSpacing: 1.4,
      color: P.muted, marginHorizontal: 16, marginBottom: 8,
    },

    nav: {
      position: 'absolute', left: 0, right: 0, bottom: 0, height: 78,
      backgroundColor: P.navBg,
      borderTopWidth: 1, borderTopColor: P.border,
      flexDirection: 'row', alignItems: 'flex-start', paddingTop: 13,
    },
    navTab: { flex: 1, alignItems: 'center' },
  });
}

function makeModalStyles(P) {
  return StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
    sheetWrapper: { backgroundColor: 'transparent' },
    sheet: {
      backgroundColor: P.cover,
      borderTopLeftRadius: 26, borderTopRightRadius: 26,
      padding: 20, paddingBottom: 36,
    },
    handle: {
      width: 40, height: 4, borderRadius: 2,
      backgroundColor: P.handleBg,
      alignSelf: 'center', marginBottom: 18,
    },
    title: { fontWeight: '700', fontSize: 17, color: P.white, marginBottom: 4 },
    subtitle: { fontSize: 12.5, color: P.muted, marginBottom: 18 },
    label: { fontSize: 12, fontWeight: '600', color: P.muted, marginBottom: 7, marginTop: 14 },
    input: {
      backgroundColor: P.card, borderRadius: 13,
      borderWidth: 1, borderColor: P.inputBorder,
      paddingHorizontal: 14, paddingVertical: 12,
      color: P.white, fontSize: 14,
    },
    textArea: { height: 76, paddingTop: 12 },
    iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 2 },
    iconCell: {
      width: '22%', paddingVertical: 10, borderRadius: 13,
      backgroundColor: P.card, borderWidth: 1, borderColor: P.border,
      alignItems: 'center', gap: 5,
    },
    iconCellActive: {
      borderColor: 'rgba(232,122,69,0.5)',
      backgroundColor: 'rgba(232,122,69,0.08)',
    },
    iconLabel: { fontSize: 9.5, color: P.muted, fontWeight: '600' },
    preview: {
      height: 86, borderRadius: 16, marginTop: 16,
      alignItems: 'center', justifyContent: 'center',
      borderWidth: 1, borderColor: P.border, overflow: 'hidden',
    },
    previewTitle: {
      position: 'absolute', bottom: 8, left: 10, right: 10,
      fontSize: 10.5, fontWeight: '600', color: 'rgba(255,255,255,0.7)', textAlign: 'center',
    },
    draftBadge: {
      position: 'absolute', top: 8, right: 8,
      backgroundColor: 'rgba(232,122,69,0.85)',
      paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6,
    },
    draftBadgeTxt: { fontSize: 8.5, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
    btnRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
    btn: {
      flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      gap: 7, paddingVertical: 13, borderRadius: 14,
    },
    btnDraft: {
      borderWidth: 1.5, borderColor: 'rgba(232,122,69,0.4)',
      backgroundColor: 'rgba(232,122,69,0.08)',
    },
    btnPub: { backgroundColor: '#e87a45' },
    btnDisabled: { opacity: 0.4 },
    btnTxt: { fontWeight: '700', fontSize: 13.5 },
    actionIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    quickRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
    quickBtn: {
      flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 11,
      backgroundColor: P.card, borderWidth: 1, borderColor: P.border,
    },
    quickBtnActive: {
      borderColor: 'rgba(232,122,69,0.45)',
      backgroundColor: 'rgba(232,122,69,0.1)',
    },
    quickTxt: { fontSize: 12.5, fontWeight: '700', color: P.muted },
  });
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function UstaProfileScreen({ onTabChange, onLogout, onNavigate }) {
  const [portfolio, setPortfolio] = useState(PORTFOLIO_DEFAULT);
  const [modalVisible, setModalVisible] = useState(false);
  const [moneyModal, setMoneyModal] = useState(null);
  const [fullName, setFullName] = useState('Davron Mahmudov');
  const [editNameVisible, setEditNameVisible] = useState(false);
  const [isDark, setIsDark] = useState(true);

  const P = isDark ? DARK : LIGHT;
  const s = useMemo(() => makeStyles(P), [isDark]);
  const m = useMemo(() => makeModalStyles(P), [isDark]);

  function handleAddItem(item) {
    setPortfolio(prev => [
      ...prev,
      { id: Date.now(), bg: ICON_BG[item.icon] || P.card, icon: item.icon, title: item.title, draft: item.draft },
    ]);
    setModalVisible(false);
  }

  const rows = [];
  for (let i = 0; i < portfolio.length; i += 2) rows.push(portfolio.slice(i, i + 2));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: P.bg }} edges={['top', 'left', 'right']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <AddPortfolioModal visible={modalVisible} onClose={() => setModalVisible(false)} onSave={handleAddItem} P={P} m={m} />
      <MoneyActionModal visible={moneyModal !== null} type={moneyModal} onClose={() => setMoneyModal(null)} onConfirm={() => setMoneyModal(null)} P={P} m={m} />
      <EditNameModal visible={editNameVisible} currentName={fullName} onClose={() => setEditNameVisible(false)} onSave={name => { setFullName(name); setEditNameVisible(false); }} P={P} m={m} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 90, gap: 14 }}>

        {/* ── Header ── */}
        <View style={s.header}>
          <Text style={{ fontSize: 21, fontWeight: '800', letterSpacing: -0.4, color: P.white, flex: 1 }}>Profil</Text>
          <TouchableOpacity style={s.iconBtn} activeOpacity={0.8} onPress={() => setIsDark(d => !d)}>
            <MaterialCommunityIcons name={isDark ? 'weather-sunny' : 'weather-night'} size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* ── Identity ── */}
        <View style={s.identityCard}>
          <Avatar letter={fullName[0] || 'D'} size={72} bgColor={P.green} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
              <Text style={{ fontSize: 17.5, fontWeight: '800', color: P.white, letterSpacing: -0.3 }}>{fullName}</Text>
              <MaterialCommunityIcons name="shield-check" size={18} color={P.green} />
            </View>
            <Text style={{ fontSize: 13.5, color: P.orange, fontWeight: '700', marginTop: 2 }}>Duradgor · Mebel ustasi</Text>
            <Text style={{ fontSize: 13, color: P.muted, fontWeight: '600', marginTop: 1 }}>+998 90 123 45 67</Text>
            <TouchableOpacity style={s.editBtn} activeOpacity={0.8} onPress={() => setEditNameVisible(true)}>
              <MaterialCommunityIcons name="pencil-outline" size={14} color={P.white} />
              <Text style={{ fontSize: 13, fontWeight: '700', color: P.white }}>Tahrirlash</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Stats ── */}
        <View style={s.statsRow}>
          {STATS.map((st, i) => (
            <View key={i} style={[s.statCell, i < 2 && s.statBorder]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                <Text style={[s.statVal, i === 1 && { color: P.gold }]}>{st[0]}</Text>
                {i === 1 && <Ionicons name="star" size={16} color={P.gold} />}
              </View>
              <Text style={s.statLbl}>{st[1]}</Text>
            </View>
          ))}
        </View>

        {/* ── Earnings wallet ── */}
        <View style={s.walletCard}>
          <View style={s.walletCircle} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <MaterialCommunityIcons name="wallet-outline" size={22} color="#fff" />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={s.walletLabel}>AFISH.uz hamyon · balans</Text>
              <Text style={s.walletAmount} numberOfLines={1}>{formatMoney(ACCOUNT.balance)}</Text>
            </View>
            <TouchableOpacity style={s.withdrawBtn} activeOpacity={0.8} onPress={() => setMoneyModal('withdraw')}>
              <Text style={{ color: P.orange, fontWeight: '800', fontSize: 12.5 }}>Yechib olish</Text>
            </TouchableOpacity>
          </View>
          <View style={{ marginTop: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <Ionicons name="star" size={13} color="rgba(255,255,255,0.9)" />
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>Kumush usta</Text>
              </View>
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.88)', fontWeight: '600' }}>Oltin ustagacha 8 buyurtma</Text>
            </View>
            <View style={s.levelBar}>
              <View style={s.levelFill} />
            </View>
          </View>
        </View>

        {/* ── Action cards ── */}
        <View style={s.actionRow}>
          <ActionCard
            icon="tools"
            iconBg="rgba(232,122,69,0.16)"
            iconCol={P.orange}
            title="Xizmatlarim"
            sub="5 ta xizmat · narxlar"
            subCol={P.green}
            P={P}
            onPress={() => onNavigate?.('services')}
          />
          <ActionCard
            icon="rocket-launch-outline"
            iconBg="rgba(63,127,212,0.16)"
            iconCol={P.blue}
            title="Profilni TOP qilish"
            sub="Ko'proq buyurtma oling"
            subCol={P.muted}
            P={P}
          />
        </View>

        {/* ── Skills ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Mutaxassisliklar</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            {SKILLS.map(sk => (
              <View key={sk} style={s.chip}>
                <Text style={{ color: P.muted, fontSize: 12.5, fontWeight: '600' }}>{sk}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Portfolio ── */}
        <View style={s.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={s.sectionTitle}>
              Ishlarim galereyasi{' '}
              <Text style={{ fontSize: 12, color: P.faint, fontWeight: '400' }}>({portfolio.length})</Text>
            </Text>
            <TouchableOpacity style={s.addBtn} activeOpacity={0.7} onPress={() => setModalVisible(true)}>
              <MaterialCommunityIcons name="plus" size={15} color={P.orange} />
              <Text style={{ color: P.orange, fontSize: 12.5, fontWeight: '600' }}>Qo'shish</Text>
            </TouchableOpacity>
          </View>
          {rows.map((pair, ri) => (
            <View key={ri} style={{ flexDirection: 'row', gap: 10, marginBottom: ri < rows.length - 1 ? 10 : 0 }}>
              {pair.map(item => (
                <View key={item.id} style={[s.portfolioCell, { backgroundColor: item.bg }]}>
                  <MaterialCommunityIcons name={item.icon} size={38} color="rgba(255,255,255,0.25)" />
                  {item.title ? <Text style={s.portfolioTitle} numberOfLines={1}>{item.title}</Text> : null}
                  {item.draft ? (
                    <View style={s.draftTag}><Text style={s.draftTagTxt}>XOMAKI</Text></View>
                  ) : null}
                </View>
              ))}
              {pair.length === 1 && <View style={{ flex: 1 }} />}
            </View>
          ))}
        </View>

        {/* ── Reviews ── */}
        <View style={s.section}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Ionicons name="star" size={18} color={P.gold} style={{ marginRight: 7 }} />
            <Text style={[s.sectionTitle, { flex: 1 }]}>Mijozlar sharhlari</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={s.sectionLink}>Barchasi</Text>
            </TouchableOpacity>
          </View>
          <View style={{ gap: 10 }}>
            {REVIEWS.map(r => (
              <View key={r.name} style={s.reviewCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}>
                  <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: r.bgColor, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>{r.initial}</Text>
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: P.white }}>{r.name}</Text>
                    <Text style={{ fontSize: 11.5, color: P.muted, fontWeight: '600', marginTop: 1 }}>{r.task} · {r.day}</Text>
                  </View>
                  <Stars n={r.rating} />
                </View>
                <Text style={s.reviewText}>{r.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Work menu ── */}
        <View style={[s.section, { paddingTop: 6 }]}>
          <View style={s.menuCard}>
            <MenuRow icon="format-list-bulleted" label="Buyurtmalar tarixi" meta="247 ta" P={P} s={s} />
            <MenuRow icon="map-marker-outline" label="Ish hududlari" meta="Chilonzor +2" P={P} s={s} />
            <MenuRow icon="cash-multiple" label="Daromad va to'lovlar" last P={P} s={s} />
          </View>
        </View>

        {/* ── Settings ── */}
        <View style={{ paddingTop: 6 }}>
          <Text style={s.sectionLabel}>SOZLAMALAR</Text>
          <View style={[s.menuCard, { marginHorizontal: 16 }]}>
            <MenuRow icon="bell-outline" label="Bildirishnomalar" P={P} s={s} />
            <MenuRow icon="translate" label="Til" meta="O'zbek" P={P} s={s} />
            <MenuRow icon="help-circle-outline" label="Yordam markazi" last P={P} s={s} />
          </View>
        </View>

        {/* ── Logout ── */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 4 }}>
          <View style={s.menuCard}>
            <MenuRow icon="logout" label="Hisobdan chiqish" danger last onPress={onLogout} P={P} s={s} />
          </View>
        </View>

      </ScrollView>

      {/* ── Bottom Nav ── */}
      <View style={s.nav}>
        {NAV.map(item => {
          const active = item.key === 'profile';
          const color = active ? P.orange : P.faint;
          return (
            <TouchableOpacity key={item.key} style={s.navTab} onPress={() => onTabChange?.(item.key)} activeOpacity={0.7}>
              <View style={{ position: 'relative' }}>
                <Ionicons name={active ? item.on : item.off} size={23} color={color} />
                {item.badge ? (
                  <View style={{ position: 'absolute', top: -4, right: -8, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: P.orange, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 }}>
                    <Text style={{ color: '#fff', fontSize: 9.5, fontWeight: '800' }}>{item.badge}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={{ fontSize: 10, fontWeight: '600', color, marginTop: 4 }}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}
