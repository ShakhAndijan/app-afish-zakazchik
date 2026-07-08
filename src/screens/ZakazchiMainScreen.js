import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList, useWindowDimensions, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';
import ZakazchiProfileScreen from './ZakazchiProfileScreen';
import UstaDetailScreen from './UstaDetailScreen';
import { useTheme } from '../context/ThemeContext';
import { getCategories } from '../api/categories';

const SVC_GAP = 10;
const SVC_H_PAD = 20;
const SVC_VISIBLE = 4;

const TOP = [
  { initial: 'D', name: 'Davron Mirzayev', trade: 'Duradgor',  rating: '5.0', jobs: '210', bgColor: '#2fa37a', isFirst: true, location: 'Yunusobod',    experience: '9 yil', repeatRate: '99%', startingPrice: '50 000' },
  { initial: 'A', name: 'Alisher Usmonov', trade: 'Santexnik', rating: '4.9', jobs: '184', bgColor: '#e87a45',               location: 'Chilonzor',     experience: '7 yil', repeatRate: '98%', startingPrice: '30 000' },
  { initial: 'B', name: 'Bobur Karimov',   trade: 'Elektrik',  rating: '4.8', jobs: '180', bgColor: '#3f7fd4',               location: "Mirzo Ulug'bek", experience: '5 yil', repeatRate: '96%', startingPrice: '35 000' },
  { initial: 'S', name: 'Sherzod Nazarov', trade: "Bo'yoqchi", rating: '4.8', jobs: '156', bgColor: '#ec4899',               location: 'Shayxontohur',  experience: '6 yil', repeatRate: '95%', startingPrice: '45 000' },
  { initial: 'J', name: 'Jasur Toshmatov', trade: 'Plitachi',  rating: '4.7', jobs: '134', bgColor: '#8b5cf6',               location: 'Uchtepa',       experience: '4 yil', repeatRate: '94%', startingPrice: '48 000' },
];

const WORKS = [
  { title: 'Zamonaviy oshxona',        sub: 'Duradgor · Davron M.',   icon: 'hammer',                 rating: 5.0 },
  { title: "Vannaxona ta'miri",        sub: 'Santexnik · Alisher U.', icon: 'water-pump',             rating: 5.0 },
  { title: 'LED yoritish tizimi',      sub: 'Elektrik · Bobur K.',    icon: 'lightning-bolt',         rating: 4.9 },
  { title: 'Loft dizayn',             sub: 'Elektrik · Bobur K.',    icon: 'lightning-bolt',         rating: 5.0 },
  { title: "Yotoqxona ta'miri",       sub: "Bo'yoqchi · Sherzod N.", icon: 'brush',                  rating: 4.9 },
  { title: 'Ofis plitka',             sub: 'Plitachi · Jasur T.',    icon: 'grid',                   rating: 4.8 },
  { title: 'Metall eshik',            sub: 'Payvandchi · Firdavs A.', icon: 'fire',                  rating: 4.9 },
  { title: "Ko'p qavatli bino",       sub: 'Quruvchi · Nodir R.',    icon: 'domain',                 rating: 4.8 },
  { title: "Bog' obodonlashtirish",   sub: "Bog'bon · Kamol Y.",     icon: 'flower',                 rating: 5.0 },
  { title: 'Smart uy tizimi',         sub: 'Elektrik · Bobur K.',    icon: 'home-automation',        rating: 5.0 },
];

const SAVED = [
  { letter: 'D', name: 'Davron M.',    trade: 'Duradgor',      color: '#2fa37a' },
  { letter: 'A', name: 'Alisher U.',   trade: 'Santexnik',     color: '#e87a45' },
  { letter: 'B', name: 'Bobur K.',     trade: 'Elektrik',      color: '#3f7fd4' },
  { letter: 'S', name: 'Sardor T.',    trade: "Bo'yoqchi",     color: '#9b6cd1' },
  { letter: 'J', name: 'Jahongir R.',  trade: 'Gipschi',       color: '#f5a623' },
  { letter: 'F', name: 'Farrux N.',    trade: 'Plitachi',      color: '#26a69a' },
  { letter: 'M', name: 'Mansur O.',    trade: 'Payvandchi',    color: '#ef5350' },
  { letter: 'Z', name: 'Zafar H.',     trade: 'Konditsioner',  color: '#29b6f6' },
  { letter: 'O', name: 'Otabek S.',    trade: 'Quruvchi',      color: '#66bb6a' },
  { letter: 'K', name: 'Kamol A.',     trade: 'Kranovshchik',  color: '#7e57c2' },
];
const SAVED_CARD_W = 148;
const SAVED_CARD_GAP = 12;

// ── Yangi e'lonlar uchun ma'lumot ──
const LISTINGS = [
  { id: 1, initial: 'D', name: 'Davron Mirzayev', trade: 'Duradgor',   color: '#2fa37a', rating: '5.0', price: '50 000', location: 'Yunusobod',     postedAgo: '2 soat oldin', title: "Yog'och mebel va eshik ustasi",          desc: 'Kvartira va ofis uchun maxsus mebel, eshik tayyorlayman. Tez va sifatli.' },
  { id: 2, initial: 'A', name: 'Alisher Usmonov', trade: 'Santexnik',  color: '#e87a45', rating: '4.9', price: '30 000', location: 'Chilonzor',      postedAgo: '5 soat oldin', title: "Santexnika ta'mirlash va o'rnatish",     desc: "Kran, unitaz, isitish tizimlarini o'rnataman va ta'mirlayman." },
  { id: 3, initial: 'B', name: 'Bobur Karimov',   trade: 'Elektrik',   color: '#3f7fd4', rating: '4.8', price: '35 000', location: "Mirzo Ulug'bek", postedAgo: '1 kun oldin',  title: 'Elektr montaj va LED yoritish',          desc: 'Uy va ofislarda elektr simlari, rozetka, yoritish tizimlari.' },
  { id: 4, initial: 'S', name: 'Sherzod Nazarov', trade: "Bo'yoqchi",  color: '#f5c451', rating: '4.8', price: '45 000', location: 'Shayxontohur',   postedAgo: '3 soat oldin', title: "Devor va shift bo'yash ustasi",          desc: "Zamonaviy bo'yoq texnikalari, tez muddatda sifatli ish." },
];

const NAV = [
  { key: 'home',     label: 'Asosiy',    on: 'home',       off: 'home-outline' },
  { key: 'services', label: 'Xizmatlar', on: 'grid',       off: 'grid-outline' },
  { key: 'chat',     label: 'Xabarlar',  on: 'chatbubble', off: 'chatbubble-outline' },
  { key: 'profile',  label: 'Profil',    on: 'person',     off: 'person-outline' },
];

const SVC_ALL = [
  { key: 'santexnik',    label: 'Santexnik',     color: '#e87a45', icon: 'water-pump',             masters: 320, price: '30 000', rating: 4.8, cat: 'home' },
  { key: 'elektrik',     label: 'Elektrik',      color: '#3f7fd4', icon: 'lightning-bolt',         masters: 280, price: '35 000', rating: 4.9, cat: 'tech' },
  { key: 'duradgor',     label: 'Duradgor',      color: '#2fa37a', icon: 'hammer',                 masters: 190, price: '50 000', rating: 4.7, cat: 'home' },
  { key: 'konditsioner', label: 'Konditsioner',  color: '#9b6cd1', icon: 'snowflake',              masters: 120, price: '40 000', rating: 4.8, cat: 'tech' },
  { key: 'boyoqchi',     label: "Bo'yoqchi",     color: '#f5c451', icon: 'brush',                  masters: 150, price: '45 000', rating: 4.6, cat: 'home' },
  { key: 'tozalash',     label: 'Tozalash',      color: '#2fa37a', icon: 'broom',                  masters: 210, price: '25 000', rating: 4.9, cat: 'home' },
  { key: 'gipschi',      label: 'Gipschi',       color: '#26a69a', icon: 'layers',                 masters: 80,  price: '55 000', rating: 4.8, cat: 'home' },
  { key: 'plitachi',     label: 'Plitachi',      color: '#8d6e63', icon: 'grid',                   masters: 110, price: '48 000', rating: 4.7, cat: 'home' },
  { key: 'payvandchi',   label: 'Payvandchi',    color: '#ef5350', icon: 'fire',                   masters: 75,  price: '65 000', rating: 4.6, cat: 'other' },
  { key: 'quruvchi',     label: 'Quruvchi',      color: '#5c6bc0', icon: 'domain',                 masters: 230, price: '70 000', rating: 4.8, cat: 'home' },
  { key: 'haydovchi',    label: 'Haydovchi',     color: '#42a5f5', icon: 'truck',                  masters: 160, price: '30 000', rating: 4.9, cat: 'other' },
  { key: 'yuktashuvchi', label: 'Yuk tashuvchi', color: '#ff7043', icon: 'package-variant-closed', masters: 140, price: '35 000', rating: 4.7, cat: 'other' },
  { key: 'bogbon',       label: "Bog'bon",       color: '#66bb6a', icon: 'flower',                 masters: 55,  price: '40 000', rating: 4.8, cat: 'other' },
  { key: 'temirchi',     label: 'Temirchi',      color: '#78909c', icon: 'wrench',                 masters: 65,  price: '50 000', rating: 4.5, cat: 'other' },
  { key: 'kranovshchik', label: 'Kranovshchik',  color: '#ab47bc', icon: 'arrow-up-bold-circle',   masters: 30,  price: '80 000', rating: 4.9, cat: 'other' },
];


function ServiceCarousel() {
  const { theme: t } = useTheme();
  const { width: screenW } = useWindowDimensions();
  const [active, setActive] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const listRef = useRef(null);
  const idxRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    getCategories()
      .then((items) => {
        if (!cancelled) setCategories(items);
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const loopLen = categories.length;
  const servicesLoop = useMemo(() => {
    if (loopLen === 0) return [];
    return [
      ...categories.map((c) => ({ ...c, uid: `a-${c.id}` })),
      ...categories.map((c) => ({ ...c, uid: `b-${c.id}` })),
      ...categories.map((c) => ({ ...c, uid: `c-${c.id}` })),
    ];
  }, [categories, loopLen]);

  const itemW = Math.floor((screenW - SVC_H_PAD * 2 - SVC_GAP * (SVC_VISIBLE - 1)) / SVC_VISIBLE);
  const itemStep = itemW + SVC_GAP;

  useEffect(() => {
    if (loopLen === 0) return;
    idxRef.current = loopLen;
    const init = setTimeout(() => {
      listRef.current?.scrollToOffset({ offset: loopLen * itemStep, animated: false });
    }, 0);
    return () => clearTimeout(init);
  }, [itemStep, loopLen]);

  useEffect(() => {
    if (loopLen === 0) return;
    const timer = setInterval(() => {
      idxRef.current += 1;
      if (idxRef.current >= loopLen * 2) {
        idxRef.current = loopLen;
        listRef.current?.scrollToOffset({ offset: loopLen * itemStep, animated: false });
        return;
      }
      listRef.current?.scrollToOffset({ offset: idxRef.current * itemStep, animated: true });
    }, 2000);
    return () => clearInterval(timer);
  }, [itemStep, loopLen]);

  const renderItem = useCallback(
    ({ item }) => {
      const isActive = active === item.id;
      const color = item.color || t.orange;
      return (
        <TouchableOpacity
          style={[s.svcItem, { width: itemW, backgroundColor: t.card, borderColor: isActive ? color : t.border }]}
          onPress={() => setActive(isActive ? null : item.id)}
          activeOpacity={0.8}
        >
          <View style={[s.svcIconBox, { backgroundColor: isActive ? color : t.rowIconBg }]}>
            {item.icon ? (
              <Text style={{ fontSize: 20 }}>{item.icon}</Text>
            ) : (
              <MaterialCommunityIcons name="toolbox-outline" size={22} color={isActive ? '#fff' : color} />
            )}
          </View>
          <Text style={[s.svcLabel, { color: isActive ? color : t.muted }]} numberOfLines={2}>
            {item.name}
          </Text>
        </TouchableOpacity>
      );
    },
    [active, t, itemW],
  );

  if (loading) {
    return (
      <View style={{ height: 92, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={t.orange} />
      </View>
    );
  }

  if (loopLen === 0) return null;

  return (
    <FlatList
      ref={listRef}
      data={servicesLoop}
      keyExtractor={(item) => item.uid}
      renderItem={renderItem}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: SVC_H_PAD, paddingVertical: 4, gap: SVC_GAP }}
      getItemLayout={(_, index) => ({ length: itemW, offset: itemStep * index, index })}
    />
  );
}

const WK_CARD_W = 168;
const WK_GAP = 12;
const WK_SLOT = WK_CARD_W + WK_GAP;
const WK_TOTAL = WORKS.length;

function WorksCarousel() {
  const { theme: t } = useTheme();
  const listRef = useRef(null);
  const idxRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const next = (idxRef.current + 1) % WK_TOTAL;
      idxRef.current = next;
      setActiveIndex(next);
      listRef.current?.scrollToOffset({ offset: next * WK_SLOT, animated: true });
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <View>
      <FlatList
        ref={listRef}
        data={WORKS}
        keyExtractor={(_, i) => String(i)}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={WK_SLOT}
        decelerationRate="fast"
        contentContainerStyle={{ paddingLeft: 20, paddingRight: 8, gap: WK_GAP }}
        renderItem={({ item }) => (
          <TouchableOpacity style={[wk.card, { backgroundColor: t.card, borderColor: t.border }]} activeOpacity={0.8}>
            <View style={[wk.img, { backgroundColor: t.isDark ? '#1d2a3a' : '#e0eaf5' }]}>
              <MaterialCommunityIcons name={item.icon} size={46} color={t.isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.12)'} />
              <View style={wk.ratingBadge}>
                <Ionicons name="star" size={11} color={t.gold} />
                <Text style={{ fontSize: 11, fontWeight: '700', color: t.gold, marginLeft: 3 }}>{item.rating.toFixed(1)}</Text>
              </View>
            </View>
            <View style={{ padding: 13 }}>
              <Text style={{ fontWeight: '700', fontSize: 13.5, color: t.text }}>{item.title}</Text>
              <Text style={{ fontSize: 11, color: t.muted, marginTop: 3 }}>{item.sub}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
      <View style={wk.dots}>
        {WORKS.map((_, i) => (
          <View key={i} style={[wk.dot, { backgroundColor: i === activeIndex ? '#e87a45' : t.card }]} />
        ))}
      </View>
    </View>
  );
}

const wk = StyleSheet.create({
  card: { width: WK_CARD_W, borderRadius: 18, overflow: 'hidden', borderWidth: 1 },
  img: { height: 104, alignItems: 'center', justifyContent: 'center' },
  ratingBadge: {
    position: 'absolute', top: 10, right: 10,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(10,19,34,0.7)',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999,
  },
  dots: { flexDirection: 'row', justifyContent: 'center', marginTop: 10, gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3 },
});

function SevimliUstalar({ onSelectUsta }) {
  const { theme: t } = useTheme();
  const [savedIdx, setSavedIdx] = useState(0);
  const listRef = useRef(null);
  const idxRef = useRef(0);

  useEffect(() => {
    const timer = setInterval(() => {
      idxRef.current = (idxRef.current + 1) % SAVED.length;
      listRef.current?.scrollToOffset({
        offset: idxRef.current * (SAVED_CARD_W + SAVED_CARD_GAP),
        animated: true,
      });
      setSavedIdx(idxRef.current);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={{ paddingTop: 24 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12, paddingHorizontal: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
          <Ionicons name="heart" size={17} color={t.red} />
          <Text style={{ fontWeight: '700', fontSize: 16.5, color: t.text }}>Sevimli ustalar</Text>
        </View>
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={{ color: t.orange, fontSize: 12.5, fontWeight: '600' }}>Barchasi</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        ref={listRef}
        data={SAVED}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={SAVED_CARD_W + SAVED_CARD_GAP}
        snapToAlignment="start"
        decelerationRate="fast"
        contentContainerStyle={{ paddingLeft: 20, paddingRight: 20 }}
        keyExtractor={(_, i) => String(i)}
        onScroll={({ nativeEvent }) => {
          const i = Math.round(nativeEvent.contentOffset.x / (SAVED_CARD_W + SAVED_CARD_GAP));
          idxRef.current = i;
          setSavedIdx(i);
        }}
        scrollEventThrottle={16}
        renderItem={({ item: u, index }) => (
          <TouchableOpacity
            style={[s.savedCard, { backgroundColor: t.card, borderColor: t.border, marginRight: index < SAVED.length - 1 ? SAVED_CARD_GAP : 0 }]}
            activeOpacity={0.8}
            onPress={() => onSelectUsta({ initial: u.letter, name: u.name, trade: u.trade, bgColor: u.color })}
          >
            <View style={{ alignItems: 'center' }}>
              <Avatar letter={u.letter} size={50} bgColor={u.color} />
            </View>
            <Text style={{ fontWeight: '700', fontSize: 13, color: t.text, marginTop: 10, textAlign: 'center' }}>{u.name}</Text>
            <Text style={{ fontSize: 11, color: t.muted, marginTop: 2, textAlign: 'center' }}>{u.trade}</Text>
          </TouchableOpacity>
        )}
      />
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5, marginTop: 12 }}>
        {SAVED.map((_, i) => (
          <View key={i} style={{ width: i === savedIdx ? 18 : 6, height: 6, borderRadius: 3, backgroundColor: i === savedIdx ? t.orange : t.border }} />
        ))}
      </View>
    </View>
  );
}

function ServicesTab({ activeTab, onTabChange }) {
  const { theme: t } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top', 'left', 'right']}>
      <StatusBar style={t.isDark ? 'light' : 'dark'} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 90 }}>

        {/* ── Header ── */}
        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
          <Text style={{ fontWeight: '700', fontSize: 22, color: t.text }}>Nima kerak?</Text>
          <Text style={{ fontSize: 12.5, color: t.muted, marginTop: 3 }}>
            Xizmatni tanlab buyurtma bering
          </Text>
          <View style={[sv.searchBar, { backgroundColor: t.inputBg, borderColor: t.border }]}>
            <Feather name="search" size={16} color={t.faint} />
            <Text style={{ flex: 1, color: t.faint, fontSize: 14, marginLeft: 8 }}>
              Xizmat qidiring...
            </Text>
          </View>
        </View>

        {/* ── Barcha xizmatlar (katta kartalar) ── */}
        <View style={{ paddingHorizontal: 20, marginTop: 20, gap: 13 }}>
          {SVC_ALL.map((svc) => (
            <TouchableOpacity
              key={svc.key}
              activeOpacity={0.87}
              style={[sv.featCard, { backgroundColor: t.card, borderColor: t.border }]}
            >
              <View style={[sv.featTint, { backgroundColor: svc.color }]} />
              <View style={sv.featBgIcon} pointerEvents="none">
                <MaterialCommunityIcons name={svc.icon} size={104} color={svc.color + '35'} />
              </View>
              <Text style={{ fontWeight: '800', fontSize: 19, color: t.text }}>{svc.label}</Text>
              <Text style={{ fontSize: 12, color: t.muted, marginTop: 4 }}>
                {svc.masters} usta · {svc.price} so'm dan
              </Text>
              <View style={[sv.orderBtn, { backgroundColor: svc.color }]}>
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>Buyurtma</Text>
                <MaterialCommunityIcons name="arrow-right" size={14} color="#fff" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>

      {/* ── Bottom nav ── */}
      <View style={[sv.nav, { backgroundColor: t.navBg, borderTopColor: t.border }]}>
        {NAV.map((item) => {
          const active = item.key === activeTab;
          const color = active ? t.orange : t.faint;
          return (
            <TouchableOpacity
              key={item.key}
              style={sv.navTab}
              onPress={() => onTabChange(item.key)}
              activeOpacity={0.7}
            >
              <Ionicons name={active ? item.on : item.off} size={23} color={color} />
              <Text style={{ fontSize: 10, fontWeight: '600', color, marginTop: 4 }}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

function Avatar({ letter = 'J', size = 42, bgColor = '#e87a45' }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.32, backgroundColor: bgColor, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#fff', fontSize: size * 0.4, fontWeight: '700' }}>{letter}</Text>
    </View>
  );
}

export default function ZakazchiMainScreen({ onLogout }) {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedUsta, setSelectedUsta] = useState(null);
  const { theme: t } = useTheme();

  if (selectedUsta) {
    return <UstaDetailScreen usta={selectedUsta} onBack={() => setSelectedUsta(null)} isLoggedIn />;
  }

  if (activeTab === 'profile') {
    return <ZakazchiProfileScreen onTabChange={setActiveTab} onLogout={onLogout} />;
  }

  if (activeTab === 'services') {
    return <ServicesTab activeTab={activeTab} onTabChange={setActiveTab} />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top', 'left', 'right']}>
      <StatusBar style={t.isDark ? 'light' : 'dark'} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 90 }}>

        {/* ── Header ── */}
        <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <MaterialCommunityIcons name="map-marker" size={13} color={t.orange} />
                <Text style={{ fontSize: 12, color: t.muted }}>Toshkent, Chilonzor</Text>
              </View>
              <Text style={{ fontWeight: '700', fontSize: 20, color: t.text, marginTop: 3 }}>Salom, Jasur 👋</Text>
            </View>
            <Avatar letter="J" bgColor={t.orange} />
          </View>

          {/* Search bar */}
          <View style={[s.searchBar, { backgroundColor: t.inputBg, borderColor: t.border }]}>
            <Feather name="search" size={16} color={t.faint} />
            <Text style={{ flex: 1, color: t.faint, fontSize: 14, marginLeft: 8 }}>Qaysi usta kerak?</Text>
            <Feather name="sliders" size={16} color={t.orange} />
          </View>
        </View>

        {/* ── Faol buyurtma banneri (disabled) ── */}
        {false && (
        <View style={{ paddingHorizontal: 20, marginTop: 6 }}>
          <View style={[s.activeCard, { backgroundColor: t.card }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                <View style={s.pulseDot} />
                <Text style={{ fontSize: 11.5, fontWeight: '700', color: t.orange, letterSpacing: 0.3 }}>
                  FAOL BUYURTMA
                </Text>
              </View>
              <Text style={{ fontSize: 11.5, color: t.muted }}>#A-2481</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 13 }}>
              <Avatar letter="A" size={46} bgColor={t.orange} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700', fontSize: 14.5, color: t.text }}>Alisher yo'lda</Text>
                <Text style={{ fontSize: 12, color: t.muted, marginTop: 2 }}>Santexnik · 12 daqiqada keladi</Text>
              </View>
              <TouchableOpacity style={s.callBtn} activeOpacity={0.8}>
                <MaterialCommunityIcons name="phone" size={19} color="#fff" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={s.trackBtn} activeOpacity={0.85}>
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13.5 }}>Buyurtmani kuzatish</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>
        </View>
        )}

        {/* ── Services ── */}
        <View style={{ marginTop: 24 }}>
          <View style={[s.sectionHeader, { paddingHorizontal: 20 }]}>
            <Text style={[s.sectionTitle, { color: t.text }]}>Taklif xizmatlar</Text>
            <Text style={{ color: t.orange, fontSize: 12.5, fontWeight: '600' }}>Barchasi</Text>
          </View>
          <ServiceCarousel />
        </View>

        {/* ── Top ustalar ── */}
        <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
          <View style={s.sectionHeader}>
            <Text style={[s.sectionTitle, { color: t.text }]}>Eng zo'r ustalar</Text>
            <Text style={{ color: t.orange, fontSize: 12.5, fontWeight: '600' }}>Reyting</Text>
          </View>
          {TOP.map((u, i) => (
            <TouchableOpacity key={u.initial + i} style={[s.masterCard, { backgroundColor: t.card, borderColor: t.border, marginBottom: i < TOP.length - 1 ? 11 : 0 }]} activeOpacity={0.8} onPress={() => setSelectedUsta(u)}>
              <View style={{ marginRight: 13 }}>
                <Avatar letter={u.initial} size={48} bgColor={u.bgColor} />
                {u.isFirst && (
                  <View style={s.rankBadge}>
                    <Text style={{ fontSize: 9, fontWeight: '800', color: '#3a2a08' }}>#1</Text>
                  </View>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700', fontSize: 14.5, color: t.text }}>{u.name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  <Text style={{ fontSize: 12, color: t.muted }}>{u.trade}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                    <MaterialCommunityIcons name="shield-check" size={11} color={t.green} />
                    <Text style={{ fontSize: 11.5, color: t.green }}>{u.jobs} ish</Text>
                  </View>
                </View>
              </View>
              <View style={s.ratingBadge}>
                <Ionicons name="star" size={12} color={t.gold} />
                <Text style={{ fontSize: 12.5, fontWeight: '700', color: t.gold, marginLeft: 3 }}>{u.rating}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Best works ── */}
        <View style={{ marginTop: 24 }}>
          <View style={[s.sectionHeader, { paddingHorizontal: 20 }]}>
            <Text style={[s.sectionTitle, { color: t.text }]}>Eng zo'r ishlar</Text>
            <Text style={{ color: t.orange, fontSize: 12.5, fontWeight: '600' }}>Galereya</Text>
          </View>
          <WorksCarousel />
        </View>

        {/* ── Sevimli ustalar ── */}
        <SevimliUstalar onSelectUsta={setSelectedUsta} />

        {/* ── Yangi e'lonlar ── */}
        <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
          <View style={s.sectionHeader}>
            <Text style={[s.sectionTitle, { color: t.text }]}>Yangi e'lonlar</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={{ color: t.orange, fontSize: 12.5, fontWeight: '600' }}>Barchasi</Text>
            </TouchableOpacity>
          </View>
          <View style={{ gap: 12 }}>
            {LISTINGS.map((l) => (
              <View key={l.id} style={[el.card, { backgroundColor: t.card, borderColor: t.border }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Avatar letter={l.initial} size={38} bgColor={l.color} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '700', fontSize: 13.5, color: t.text }}>{l.name}</Text>
                    <Text style={{ fontSize: 11, color: t.muted, marginTop: 1 }}>{l.trade} · {l.location}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                    <Ionicons name="star" size={11} color={t.gold} />
                    <Text style={{ fontSize: 11.5, fontWeight: '700', color: t.gold }}>{l.rating}</Text>
                  </View>
                </View>

                <Text style={{ fontWeight: '800', fontSize: 14, color: t.text, marginTop: 10 }}>{l.title}</Text>
                <Text style={{ fontSize: 12, color: t.muted, marginTop: 3, lineHeight: 17 }} numberOfLines={2}>{l.desc}</Text>

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                  <View>
                    <Text style={{ fontSize: 12.5, fontWeight: '700', color: t.text }}>{l.price} so'm dan</Text>
                    <Text style={{ fontSize: 10.5, color: t.faint, marginTop: 1 }}>{l.postedAgo}</Text>
                  </View>
                  <TouchableOpacity style={el.chatBtn} activeOpacity={0.85}>
                    <Ionicons name="chatbubble-ellipses" size={13} color="#fff" />
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>Yozish</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>

      {/* ── Bottom nav ── */}
      <View style={[s.nav, { backgroundColor: t.navBg, borderTopColor: t.border }]}>
        {NAV.map(item => {
          const active = item.key === activeTab;
          const color = active ? t.orange : t.faint;
          return (
            <TouchableOpacity key={item.key} style={s.navTab} onPress={() => setActiveTab(item.key)} activeOpacity={0.7}>
              <Ionicons name={active ? item.on : item.off} size={23} color={color} />
              <Text style={{ fontSize: 10, fontWeight: '600', color, marginTop: 4 }}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const el = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 18, padding: 14 },
  chatBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#e87a45', paddingVertical: 9, paddingHorizontal: 14, borderRadius: 11,
  },
});

const s = StyleSheet.create({
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderRadius: 16,
    padding: 13, paddingHorizontal: 15, marginTop: 16,
  },

  activeCard: {
    borderWidth: 1, borderColor: 'rgba(232,122,69,0.32)',
    borderRadius: 18, padding: 15,
  },
  pulseDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#e87a45',
    shadowColor: '#e87a45', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6, shadowRadius: 6, elevation: 4,
  },
  callBtn: {
    width: 42, height: 42, borderRadius: 12,
    backgroundColor: '#2fa37a', alignItems: 'center', justifyContent: 'center',
  },
  trackBtn: {
    marginTop: 14, backgroundColor: '#e87a45', borderRadius: 12,
    paddingVertical: 11, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
  },

  ctaCard: {
    borderRadius: 22, padding: 20,
    backgroundColor: '#e87a45', overflow: 'hidden', position: 'relative',
  },
  ctaBtn: {
    marginTop: 16, backgroundColor: '#fff', borderRadius: 12,
    paddingVertical: 12, paddingHorizontal: 20,
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
  },

  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'baseline', marginBottom: 13,
  },
  sectionTitle: { fontWeight: '700', fontSize: 16.5 },

  svcItem: {
    height: 90, borderWidth: 1, borderRadius: 18,
    paddingVertical: 12, paddingHorizontal: 6,
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  svcIconBox: {
    width: 44, height: 44, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
  },
  svcLabel: {
    fontSize: 11, fontWeight: '600', textAlign: 'center', lineHeight: 14,
  },

  masterCard: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderRadius: 18, padding: 12,
  },
  rankBadge: {
    position: 'absolute', top: -7, left: -7,
    backgroundColor: '#f5c451', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 7,
  },
  ratingBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(245,196,81,0.13)',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
  },

  workCard: {
    width: 168, borderRadius: 18, overflow: 'hidden', borderWidth: 1,
  },
  workImg: {
    height: 104, alignItems: 'center', justifyContent: 'center',
  },
  workRatingBadge: {
    position: 'absolute', top: 10, right: 10,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(10,19,34,0.7)',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999,
  },

  savedCard: {
    width: 148, borderWidth: 1, borderRadius: 18, padding: 14,
  },
  nav: {
    position: 'absolute', left: 0, right: 0, bottom: 0, height: 78,
    borderTopWidth: 1,
    flexDirection: 'row', alignItems: 'flex-start', paddingTop: 13,
  },
  navTab: { flex: 1, alignItems: 'center' },
});

const sv = StyleSheet.create({
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderRadius: 16,
    padding: 13, paddingHorizontal: 15, marginTop: 16,
  },

  featCard: {
    height: 120, borderRadius: 20, padding: 18, overflow: 'hidden',
    borderWidth: 1, justifyContent: 'center',
  },
  featTint: {
    position: 'absolute', left: 0, top: 0, bottom: 0, right: 0, opacity: 0.08,
  },
  featBgIcon: {
    position: 'absolute', right: -10, bottom: -14,
  },
  orderBtn: {
    marginTop: 12, alignSelf: 'flex-start',
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 8, paddingHorizontal: 16, borderRadius: 10,
  },


  nav: {
    position: 'absolute', left: 0, right: 0, bottom: 0, height: 78,
    borderTopWidth: 1,
    flexDirection: 'row', alignItems: 'flex-start', paddingTop: 13,
  },
  navTab: { flex: 1, alignItems: 'center' },
});
