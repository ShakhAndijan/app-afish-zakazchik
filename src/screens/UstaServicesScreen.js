import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Modal, TextInput, KeyboardAvoidingView, Platform, Pressable,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';

// ─── Theme ────────────────────────────────────────────────────────────────────

const DARK = {
  bg: '#0c1828', surface: '#142639', surface2: '#1a2f47',
  border: 'rgba(255,255,255,0.07)', border2: 'rgba(255,255,255,0.12)',
  orange: '#e87a45', green: '#2fa37a', red: '#e0473a', redSoft: 'rgba(224,71,58,0.13)',
  gold: '#E8B84B',
  white: '#fff', muted: '#8da0ba', faint: '#6c7f9a',
  divider: 'rgba(255,255,255,0.07)',
  handleBg: 'rgba(255,255,255,0.2)',
  inputBorder: 'rgba(255,255,255,0.08)',
};

const LIGHT = {
  bg: '#f0f4f8', surface: '#ffffff', surface2: '#e8eef5',
  border: 'rgba(0,0,0,0.09)', border2: 'rgba(0,0,0,0.15)',
  orange: '#e87a45', green: '#1d8c68', red: '#d03025', redSoft: 'rgba(208,48,37,0.1)',
  gold: '#c8880a',
  white: '#0d1b2a', muted: '#5a6e84', faint: '#8a9eb8',
  divider: 'rgba(0,0,0,0.08)',
  handleBg: 'rgba(0,0,0,0.12)',
  inputBorder: 'rgba(0,0,0,0.1)',
};

// ─── Categories ───────────────────────────────────────────────────────────────

const CATS = {
  Mebel:     { color: '#3E8BE8', icon: 'table-furniture' },
  Elektrik:  { color: '#E8B84B', icon: 'lightning-bolt' },
  Santexnik: { color: '#2FB6B0', icon: 'water-pump' },
  Duradgor:  { color: '#34B57C', icon: 'hammer' },
  Tozalash:  { color: '#9B6FE3', icon: 'broom' },
};
const CAT_KEYS = Object.keys(CATS);

// ─── Static data ──────────────────────────────────────────────────────────────

let UID = 100;

const INIT_SERVICES = [
  { id: 1, name: "Oshxona mebeli o'rnatish", cat: 'Mebel',     type: 'fixed', price: 350000, orders: 23, rating: 4.9, active: true  },
  { id: 2, name: "Shkaf yig'ish",            cat: 'Mebel',     type: 'fixed', price: 120000, orders: 31, rating: 4.8, active: true  },
  { id: 3, name: "Rozetka almashtirish",     cat: 'Elektrik',  type: 'fixed', price: 60000,  orders: 18, rating: 5.0, active: true  },
  { id: 4, name: "Lyustra o'rnatish",        cat: 'Elektrik',  type: 'fixed', price: 90000,  orders: 14, rating: 4.7, active: true  },
  { id: 5, name: "Smesitel almashtirish",    cat: 'Santexnik', type: 'fixed', price: 130000, orders: 27, rating: 4.9, active: true  },
  { id: 6, name: "Quvur tiqilishini tozalash", cat: 'Santexnik', type: 'fixed', price: 100000, orders: 12, rating: 4.6, active: false },
  { id: 7, name: "Eshik o'rnatish va sozlash", cat: 'Duradgor', type: 'range', min: 200000, max: 400000, orders: 15, rating: 5.0, active: true },
  { id: 8, name: "Yog'och pol yotqizish",    cat: 'Duradgor',  type: 'unit',  price: 80000, unit: 'm²', orders: 12, rating: 4.9, active: true },
];

function formatMoney(n) {
  return Math.abs(n).toLocaleString('uz-UZ');
}

function priceLabel(s) {
  if (s.type === 'fixed') return `${formatMoney(s.price)} so'm`;
  if (s.type === 'range') return `${formatMoney(s.min)} – ${formatMoney(s.max)} so'm`;
  if (s.type === 'unit')  return `${formatMoney(s.price)} so'm / ${s.unit || 'birlik'}`;
  return 'Kelishilgan holda';
}

// ─── CategoryChip ─────────────────────────────────────────────────────────────

function CategoryChip({ cat }) {
  const c = CATS[cat];
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8, backgroundColor: `${c.color}22` }}>
      <MaterialCommunityIcons name={c.icon} size={13} color={c.color} />
      <Text style={{ fontSize: 11.5, fontWeight: '700', color: c.color }}>{cat}</Text>
    </View>
  );
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ on, onPress, P }) {
  return (
    <TouchableOpacity
      style={{ width: 44, height: 26, borderRadius: 13, backgroundColor: on ? P.green : P.surface2, justifyContent: 'center', flexShrink: 0 }}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <View style={{ position: 'absolute', width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff', left: on ? 21 : 3 }} />
    </TouchableOpacity>
  );
}

// ─── EditSheet (add / edit modal) ─────────────────────────────────────────────

const PRICE_TYPES = [
  ['fixed', 'Aniq narx'],
  ['range', 'Oraliq'],
  ['unit',  'Birlik'],
  ['nego',  'Kelishuv'],
];

const EMPTY_FORM = { cat: 'Mebel', name: '', type: 'fixed', price: '', min: '', max: '', unit: 'm²' };

function EditSheet({ initial, onSave, onDelete, onClose, P, isDark }) {
  const isNew = !initial;
  const [form, setForm] = useState(() =>
    initial
      ? {
          cat:   initial.cat,
          name:  initial.name,
          type:  initial.type,
          price: initial.price  ? String(initial.price)  : '',
          min:   initial.min    ? String(initial.min)    : '',
          max:   initial.max    ? String(initial.max)    : '',
          unit:  initial.unit   || 'm²',
        }
      : EMPTY_FORM
  );

  function set(key, val) { setForm(f => ({ ...f, [key]: val })); }

  const valid =
    form.name.trim() &&
    (form.type === 'nego' ||
      (form.type === 'range' ? (form.min && form.max) : form.price));

  function handleSave() {
    if (!valid) return;
    const base = {
      id: initial ? initial.id : ++UID,
      name: form.name.trim(), cat: form.cat, type: form.type,
      orders: initial ? initial.orders : 0,
      rating: initial ? initial.rating : 0,
      active: initial ? initial.active : true,
    };
    if (form.type === 'fixed' || form.type === 'unit') base.price = Number(form.price) || 0;
    if (form.type === 'unit')  base.unit = form.unit;
    if (form.type === 'range') { base.min = Number(form.min) || 0; base.max = Number(form.max) || 0; }
    onSave(base);
  }

  const inputStyle = {
    backgroundColor: P.bg, borderWidth: 1, borderColor: P.inputBorder,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13,
    color: P.white, fontSize: 15, fontWeight: '600',
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(5,8,12,0.7)' }} onPress={onClose} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ backgroundColor: 'transparent' }}>
        <View style={{ backgroundColor: P.surface, borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 20, paddingBottom: 36, maxHeight: '92%' }}>
          {/* handle */}
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: P.handleBg, alignSelf: 'center', marginBottom: 16 }} />

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* title row */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: P.white, letterSpacing: -0.3, flex: 1 }}>
                {isNew ? 'Yangi xizmat' : 'Xizmatni tahrirlash'}
              </Text>
              <TouchableOpacity
                style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: P.surface2, alignItems: 'center', justifyContent: 'center' }}
                onPress={onClose}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="close" size={18} color={P.muted} />
              </TouchableOpacity>
            </View>

            {/* category */}
            <Text style={{ fontSize: 12.5, fontWeight: '700', color: P.muted, marginBottom: 10 }}>Kategoriya</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
              {CAT_KEYS.map(k => {
                const c = CATS[k]; const on = form.cat === k;
                return (
                  <TouchableOpacity
                    key={k}
                    style={{
                      flexDirection: 'row', alignItems: 'center', gap: 6,
                      paddingHorizontal: 12, paddingVertical: 9, borderRadius: 11,
                      borderWidth: 1.5,
                      borderColor: on ? c.color : P.border2,
                      backgroundColor: on ? `${c.color}22` : 'transparent',
                    }}
                    onPress={() => set('cat', k)}
                    activeOpacity={0.75}
                  >
                    <MaterialCommunityIcons name={c.icon} size={15} color={on ? c.color : P.muted} />
                    <Text style={{ fontSize: 13, fontWeight: '700', color: on ? c.color : P.muted }}>{k}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* name */}
            <Text style={{ fontSize: 12.5, fontWeight: '700', color: P.muted, marginBottom: 8 }}>Xizmat nomi</Text>
            <TextInput
              style={[inputStyle, { marginBottom: 18 }]}
              placeholder="Masalan: Shkaf yig'ish"
              placeholderTextColor={P.faint}
              value={form.name}
              onChangeText={v => set('name', v)}
            />

            {/* price type */}
            <Text style={{ fontSize: 12.5, fontWeight: '700', color: P.muted, marginBottom: 10 }}>Narx turi</Text>
            <View style={{ flexDirection: 'row', gap: 6, marginBottom: 14 }}>
              {PRICE_TYPES.map(([k, l]) => {
                const on = form.type === k;
                return (
                  <TouchableOpacity
                    key={k}
                    style={{ flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', backgroundColor: on ? P.orange : P.surface2 }}
                    onPress={() => set('type', k)}
                    activeOpacity={0.8}
                  >
                    <Text style={{ fontSize: 12.5, fontWeight: '700', color: on ? '#fff' : P.muted }}>{l}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* price inputs */}
            {form.type === 'fixed' && (
              <View style={{ position: 'relative', marginBottom: 8 }}>
                <TextInput
                  style={inputStyle}
                  placeholder="350000"
                  placeholderTextColor={P.faint}
                  keyboardType="numeric"
                  value={form.price}
                  onChangeText={v => set('price', v.replace(/\D/g, ''))}
                />
                <Text style={{ position: 'absolute', right: 14, top: 14, color: P.muted, fontSize: 14, fontWeight: '700' }}>so'm</Text>
              </View>
            )}
            {form.type === 'unit' && (
              <View style={{ flexDirection: 'row', gap: 9, marginBottom: 8 }}>
                <View style={{ flex: 1, position: 'relative' }}>
                  <TextInput
                    style={inputStyle}
                    placeholder="80000"
                    placeholderTextColor={P.faint}
                    keyboardType="numeric"
                    value={form.price}
                    onChangeText={v => set('price', v.replace(/\D/g, ''))}
                  />
                  <Text style={{ position: 'absolute', right: 14, top: 14, color: P.muted, fontSize: 14, fontWeight: '700' }}>so'm</Text>
                </View>
                <TextInput
                  style={[inputStyle, { width: 80, textAlign: 'center' }]}
                  placeholder="m²"
                  placeholderTextColor={P.faint}
                  value={form.unit}
                  onChangeText={v => set('unit', v)}
                />
              </View>
            )}
            {form.type === 'range' && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 8 }}>
                <TextInput
                  style={[inputStyle, { flex: 1 }]}
                  placeholder="200000"
                  placeholderTextColor={P.faint}
                  keyboardType="numeric"
                  value={form.min}
                  onChangeText={v => set('min', v.replace(/\D/g, ''))}
                />
                <Text style={{ color: P.muted, fontWeight: '800', fontSize: 16 }}>–</Text>
                <TextInput
                  style={[inputStyle, { flex: 1 }]}
                  placeholder="400000"
                  placeholderTextColor={P.faint}
                  keyboardType="numeric"
                  value={form.max}
                  onChangeText={v => set('max', v.replace(/\D/g, ''))}
                />
              </View>
            )}
            {form.type === 'nego' && (
              <View style={{ backgroundColor: P.bg, borderWidth: 1, borderStyle: 'dashed', borderColor: P.border2, borderRadius: 12, padding: 14, marginBottom: 8 }}>
                <Text style={{ fontSize: 13.5, color: P.muted, fontWeight: '600' }}>Narx mijoz bilan kelishilgan holda belgilanadi</Text>
              </View>
            )}

            {/* save */}
            <TouchableOpacity
              style={{ marginTop: 16, paddingVertical: 15, borderRadius: 14, alignItems: 'center', backgroundColor: valid ? P.orange : P.surface2, opacity: valid ? 1 : 0.6 }}
              activeOpacity={0.85}
              onPress={handleSave}
              disabled={!valid}
            >
              <Text style={{ fontSize: 15, fontWeight: '800', color: valid ? '#fff' : P.muted }}>
                {isNew ? "Xizmatni qo'shish" : 'Saqlash'}
              </Text>
            </TouchableOpacity>

            {/* delete */}
            {!isNew && (
              <TouchableOpacity
                style={{ marginTop: 10, paddingVertical: 13, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }}
                activeOpacity={0.8}
                onPress={() => onDelete(initial.id)}
              >
                <MaterialCommunityIcons name="trash-can-outline" size={16} color={P.red} />
                <Text style={{ fontSize: 14, fontWeight: '700', color: P.red }}>Xizmatni o'chirish</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── ServiceCard ──────────────────────────────────────────────────────────────

function ServiceCard({ item, onToggle, onEdit, P }) {
  return (
    <View style={[{ backgroundColor: P.surface, borderRadius: 16, padding: 15, borderWidth: 1, borderColor: P.border }, !item.active && { opacity: 0.55 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontSize: 15, fontWeight: '800', color: P.white, letterSpacing: -0.2 }}>{item.name}</Text>
          <View style={{ marginTop: 7 }}>
            <CategoryChip cat={item.cat} />
          </View>
        </View>
        <Toggle on={item.active} onPress={onToggle} P={P} />
      </View>

      <View style={{ height: 1, backgroundColor: P.divider, marginVertical: 13 }} />

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontSize: 16.5, fontWeight: '800', color: P.orange }} numberOfLines={1}>{priceLabel(item)}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 5 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <MaterialCommunityIcons name="briefcase-outline" size={13} color={P.muted} />
              <Text style={{ fontSize: 12, color: P.muted, fontWeight: '600' }}>{item.orders} buyurtma</Text>
            </View>
            {item.rating > 0 && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="star" size={12} color={P.gold} />
                <Text style={{ fontSize: 12, color: P.muted, fontWeight: '600' }}>{item.rating.toFixed(1)}</Text>
              </View>
            )}
            {item.orders === 0 && (
              <Text style={{ fontSize: 12, color: P.green, fontWeight: '700' }}>Yangi</Text>
            )}
          </View>
        </View>
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 13, paddingVertical: 9, borderRadius: 11, backgroundColor: P.surface2 }}
          activeOpacity={0.8}
          onPress={onEdit}
        >
          <MaterialCommunityIcons name="pencil-outline" size={14} color={P.white} />
          <Text style={{ fontSize: 13, fontWeight: '700', color: P.white }}>Tahrirlash</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function UstaServicesScreen({ onBack, isDarkProp }) {
  const [services, setServices] = useState(INIT_SERVICES);
  const [filter, setFilter] = useState('all');
  const [sheet, setSheet] = useState(null); // null | 'new' | service object
  const [isDark] = useState(isDarkProp !== false);

  const P = isDark ? DARK : LIGHT;

  function toggleService(id) {
    setServices(xs => xs.map(s => s.id === id ? { ...s, active: !s.active } : s));
  }

  function handleSave(svc) {
    setServices(xs =>
      xs.some(s => s.id === svc.id) ? xs.map(s => s.id === svc.id ? svc : s) : [svc, ...xs]
    );
    setSheet(null);
  }

  function handleDelete(id) {
    setServices(xs => xs.filter(s => s.id !== id));
    setSheet(null);
  }

  const counts = useMemo(() => {
    const c = { all: services.length };
    CAT_KEYS.forEach(k => { c[k] = services.filter(s => s.cat === k).length; });
    return c;
  }, [services]);

  const visibleChips = ['all', ...CAT_KEYS.filter(k => counts[k] > 0)];

  const list = filter === 'all' ? services : services.filter(s => s.cat === filter);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: P.bg }} edges={['top', 'left', 'right']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* ── Header ── */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 }}>
        <TouchableOpacity
          style={{ padding: 4, marginLeft: -4 }}
          activeOpacity={0.7}
          onPress={onBack}
        >
          <MaterialCommunityIcons name="chevron-left" size={26} color={P.white} />
        </TouchableOpacity>
        <Text style={{ fontSize: 19, fontWeight: '800', color: P.white, letterSpacing: -0.3, flex: 1 }}>Xizmatlarim</Text>
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 13, paddingVertical: 9, borderRadius: 11, backgroundColor: P.orange }}
          activeOpacity={0.85}
          onPress={() => setSheet('new')}
        >
          <MaterialCommunityIcons name="plus" size={17} color="#fff" />
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>Qo'shish</Text>
        </TouchableOpacity>
      </View>

      {/* ── Category filter ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12, gap: 8 }}
        style={{ flexShrink: 0 }}
      >
        {visibleChips.map(k => {
          const on = filter === k;
          const c = k === 'all' ? null : CATS[k];
          return (
            <TouchableOpacity
              key={k}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 6,
                paddingHorizontal: 13, paddingVertical: 9, borderRadius: 11,
                backgroundColor: on ? (c ? c.color : P.orange) : P.surface,
                borderWidth: 1,
                borderColor: on ? 'transparent' : P.border,
              }}
              onPress={() => setFilter(k)}
              activeOpacity={0.8}
            >
              {c && <MaterialCommunityIcons name={c.icon} size={14} color={on ? '#fff' : P.muted} />}
              <Text style={{ fontSize: 13, fontWeight: '700', color: on ? '#fff' : P.muted, whiteSpace: 'nowrap' }}>
                {k === 'all' ? 'Hammasi' : k}
              </Text>
              <Text style={{ fontSize: 11, fontWeight: '800', color: on ? 'rgba(255,255,255,0.8)' : P.faint }}>
                {counts[k]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── List ── */}
      {list.length > 0 ? (
        <FlatList
          data={list}
          keyExtractor={item => String(item.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingTop: 4, gap: 11 }}
          renderItem={({ item }) => (
            <ServiceCard
              item={item}
              onToggle={() => toggleService(item.id)}
              onEdit={() => setSheet(item)}
              P={P}
            />
          )}
        />
      ) : (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 }}>
          <MaterialCommunityIcons name="tools" size={42} color={P.faint} />
          <Text style={{ fontSize: 14, fontWeight: '700', color: P.muted }}>Bu kategoriyada xizmat yo'q</Text>
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, backgroundColor: P.orange }}
            activeOpacity={0.85}
            onPress={() => setSheet('new')}
          >
            <MaterialCommunityIcons name="plus" size={17} color="#fff" />
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>Xizmat qo'shish</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Edit / Add Sheet ── */}
      {sheet !== null && (
        <EditSheet
          initial={sheet === 'new' ? null : sheet}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setSheet(null)}
          P={P}
          isDark={isDark}
        />
      )}
    </SafeAreaView>
  );
}
