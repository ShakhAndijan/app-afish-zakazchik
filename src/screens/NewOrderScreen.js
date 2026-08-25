import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  FlatList,
  Modal,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as ImagePicker from 'expo-image-picker';
import * as Crypto from 'expo-crypto';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import BottomNav from '../components/BottomNav';
import LocationMapPicker from '../components/LocationMapPicker';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';
import { getCategories } from '../api/categories';
import { getRegions, getDistricts } from '../api/reference';
import { createOrder } from '../api/orders';

const MAX_PHOTOS = 10;

// Yandex geokoderi hozircha API kalit ruxsati yo'qligi sabab ishlamayapti
// ("scriptError") — shuning uchun viloyat darajasida ishonchli zaxira sifatida
// bu jadval ishlatiladi (`code` maydoni bo'yicha). Tuman darajasi hali ham
// geokoder orqali urinib ko'riladi — kalit tuzatilgach avtomatik ishlay boshlaydi.
const REGION_COORDS = {
  'toshkent-shahri': [41.2995, 69.2401],
  'andijon': [40.7821, 72.3442],
  'buxoro': [39.7747, 64.4286],
  'fargona': [40.3894, 71.7864],
  'jizzax': [40.1158, 67.8422],
  'namangan': [40.9983, 71.6726],
  'navoiy': [40.0844, 65.3792],
  'qashqadaryo': [38.8606, 65.7891],
  'samarqand': [39.6542, 66.9597],
  'sirdaryo': [40.4897, 68.7842],
  'surxondaryo': [37.2242, 67.2783],
  'toshkent-viloyati': [40.9983, 69.3411],
  'xorazm': [41.5506, 60.6317],
  'qoraqalpogiston': [42.4531, 59.6103],
};

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// Kartada bosilgan nuqtaga eng yaqin markazga ega viloyat/tumanni topadi —
// backend har bir viloyat/tuman uchun o'z markaziy koordinatasini beradi,
// shuning uchun bu Yandex geokoderi qaytargan matnli nomga qaraganda
// ishonchliroq (til/imlo farqiga bog'liq emas).
function findNearestByCoords(list, lat, lng) {
  let best = null;
  let bestDist = Infinity;
  for (const item of list) {
    const itemLat = Number(item.latitude);
    const itemLng = Number(item.longitude);
    if (!Number.isFinite(itemLat) || !Number.isFinite(itemLng)) continue;
    const dist = haversineKm(lat, lng, itemLat, itemLng);
    if (dist < bestDist) {
      bestDist = dist;
      best = item;
    }
  }
  return best;
}

function WhenOption({ icon, accent, title, subtitle, active, onPress, t }) {
  const iconBg = accent ? t.orange : t.isDark ? 'rgba(255,255,255,0.08)' : '#F1F2F4';
  const iconColor = accent ? '#fff' : t.text;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        s.whenCard,
        { backgroundColor: t.card, borderColor: active ? t.orange : t.border },
      ]}
    >
      <View style={s.whenTopRow}>
        <View style={[s.whenIconWrap, { backgroundColor: iconBg }]}>
          <MaterialCommunityIcons name={icon} size={18} color={iconColor} />
        </View>
        <View style={[s.radioOuter, { borderColor: active ? t.orange : t.border }]}>
          {active && <View style={[s.radioInner, { backgroundColor: t.orange }]} />}
        </View>
      </View>
      <Text style={[s.whenTitle, { color: t.text }]} numberOfLines={1}>
        {title}
      </Text>
      {!!subtitle && (
        <Text style={[s.whenSubtitle, { color: t.muted }]} numberOfLines={2}>
          {subtitle}
        </Text>
      )}
    </TouchableOpacity>
  );
}

function stripCountryCode(raw) {
  if (!raw) return '';
  return String(raw).replace(/^\+?998/, '').trim();
}

function formatMoney(value) {
  if (!value) return '';
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function formatWhenDate(date) {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mi = String(date.getMinutes()).padStart(2, '0');
  return `${dd}.${mm} ${hh}:${mi}`;
}

function toISODate(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// "Qachon" bo'limidagi tanlov backend'ning `timing_kind` enumiga mos keladi.
const TIMING_KIND_MAP = {
  urgent: 'urgent',
  today: 'today',
  date: 'scheduled',
  flexible: 'flexible',
};

function ToggleSwitch({ value, onChange, t }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onChange(!value)}
      style={[
        s.toggleTrack,
        { backgroundColor: value ? t.orange : t.isDark ? 'rgba(255,255,255,0.14)' : '#E4E6EA' },
      ]}
    >
      <View style={[s.toggleThumb, { transform: [{ translateX: value ? 20 : 2 }] }]} />
    </TouchableOpacity>
  );
}

function PaymentOption({ icon, iconBg, iconColor, title, subtitle, active, onPress, t }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        s.paymentCard,
        {
          backgroundColor: active ? (t.isDark ? 'rgba(232,122,69,0.14)' : '#FDEEE4') : t.card,
          borderColor: active ? t.orange : t.border,
        },
      ]}
    >
      <View style={[s.paymentIconWrap, { backgroundColor: iconBg }]}>
        <MaterialCommunityIcons name={icon} size={19} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[s.paymentTitle, { color: t.text }]}>{title}</Text>
        {!!subtitle && (
          <Text style={[s.paymentSub, { color: t.muted }]} numberOfLines={2}>
            {subtitle}
          </Text>
        )}
      </View>
      <View style={[s.radioOuter, { borderColor: active ? t.orange : t.border }]}>
        {active && <View style={[s.radioInner, { backgroundColor: t.orange }]} />}
      </View>
    </TouchableOpacity>
  );
}

function PhoneField({ value, onChangeText, placeholder, t }) {
  return (
    <View
      style={[s.phoneRow, { backgroundColor: t.card, borderColor: t.border }]}
    >
      <View style={[s.phonePrefix, { borderColor: t.border }]}>
        <Text style={[s.phonePrefixTxt, { color: t.text }]}>+998</Text>
      </View>
      <TextInput
        value={value}
        onChangeText={(v) => onChangeText(v.replace(/[^0-9]/g, ''))}
        keyboardType="phone-pad"
        placeholder={placeholder}
        placeholderTextColor={t.faint}
        maxLength={9}
        style={[s.phoneInput, { color: t.text }]}
      />
    </View>
  );
}

function MoneyInput({ value, onChangeText, placeholder, suffix, style, t }) {
  return (
    <View style={[s.moneyRow, { backgroundColor: t.card, borderColor: t.border }, style]}>
      <TextInput
        value={formatMoney(value)}
        onChangeText={(v) => onChangeText(v.replace(/[^0-9]/g, ''))}
        keyboardType="number-pad"
        placeholder={placeholder}
        placeholderTextColor={t.faint}
        style={[s.moneyInput, { color: t.text }]}
      />
      {!!suffix && <Text style={[s.moneySuffix, { color: t.muted }]}>{suffix}</Text>}
    </View>
  );
}

function CategoryPickerModal({
  visible,
  onClose,
  categories,
  selectedIds,
  onToggle,
  t,
  tr,
}) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => c.name?.toLowerCase().includes(q));
  }, [categories, search]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={s.modalBackdrop}>
        <View style={[s.modalSheet, { backgroundColor: t.bg }]}>
          <View style={s.modalHeader}>
            <Text style={[s.modalTitle, { color: t.text }]}>
              {tr('newOrder.categoryPickerTitle')}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <MaterialCommunityIcons name="close" size={22} color={t.muted} />
            </TouchableOpacity>
          </View>

          <View style={[s.searchBox, { backgroundColor: t.card, borderColor: t.border }]}>
            <MaterialCommunityIcons name="magnify" size={18} color={t.faint} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder={tr('newOrder.categorySearchPlaceholder')}
              placeholderTextColor={t.faint}
              style={[s.searchInput, { color: t.text }]}
            />
          </View>

          <FlatList
            data={filtered}
            keyExtractor={(c) => String(c.id)}
            contentContainerStyle={{ paddingBottom: 12 }}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <Text style={{ color: t.muted, textAlign: 'center', marginTop: 24, fontSize: 13 }}>
                {tr('newOrder.categoryEmpty')}
              </Text>
            }
            renderItem={({ item: c }) => {
              const selected = selectedIds.includes(c.id);
              return (
                <TouchableOpacity
                  onPress={() => onToggle(c.id)}
                  activeOpacity={0.7}
                  style={s.categoryRow}
                >
                  <MaterialCommunityIcons
                    name={selected ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
                    size={22}
                    color={selected ? t.orange : t.faint}
                  />
                  <Text style={[s.categoryRowTxt, { color: t.text }]} numberOfLines={1}>
                    {c.name}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />

          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.85}
            style={[s.modalDoneBtn, { backgroundColor: t.orange }]}
          >
            <Text style={s.modalDoneTxt}>
              {tr('newOrder.categoryDone', { n: selectedIds.length })}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function SelectField({ label, value, placeholder, onPress, t, bg, disabled }) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={[s.label, { color: t.text, marginTop: 0, marginBottom: 0 }]}>{label}</Text>
      <TouchableOpacity
        onPress={disabled ? undefined : onPress}
        activeOpacity={0.7}
        style={[
          s.selectField,
          { backgroundColor: bg, borderColor: t.border, opacity: disabled ? 0.5 : 1 },
        ]}
      >
        <Text style={[s.selectFieldTxt, { color: value ? t.text : t.faint }]} numberOfLines={1}>
          {value || placeholder}
        </Text>
        <MaterialCommunityIcons name="chevron-right" size={18} color={t.faint} />
      </TouchableOpacity>
    </View>
  );
}

function OptionSheet({ visible, onClose, title, options, selectedId, onSelect, t, tr }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={s.overlay} />
      </TouchableWithoutFeedback>

      <View style={[s.optionSheet, { backgroundColor: t.card, borderColor: t.border }]}>
        <View style={[s.sheetHandle, { backgroundColor: t.border, alignSelf: 'center' }]} />
        <View style={s.sheetHeaderRow}>
          <Text style={[s.modalTitle, { color: t.text }]}>{title}</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <MaterialCommunityIcons name="close" size={20} color={t.muted} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={options}
          keyExtractor={(o) => String(o.id)}
          style={{ maxHeight: 360 }}
          contentContainerStyle={{ paddingBottom: 8 }}
          ListEmptyComponent={
            <Text style={{ color: t.muted, textAlign: 'center', marginTop: 20, fontSize: 13 }}>
              {tr('newOrder.categoryEmpty')}
            </Text>
          }
          renderItem={({ item }) => {
            const selected = item.id === selectedId;
            return (
              <TouchableOpacity
                onPress={() => {
                  onSelect(item.id);
                  onClose();
                }}
                activeOpacity={0.7}
                style={s.categoryRow}
              >
                <Text style={[s.categoryRowTxt, { color: t.text }]} numberOfLines={1}>
                  {item.name}
                </Text>
                {selected && (
                  <MaterialCommunityIcons name="check-circle" size={19} color={t.orange} />
                )}
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </Modal>
  );
}

function AddressModal({
  visible,
  onClose,
  regions,
  regionId,
  onSelectRegion,
  districts,
  districtId,
  onSelectDistrict,
  street,
  onStreetChange,
  entrance,
  onEntranceChange,
  floor,
  onFloorChange,
  gpsLat,
  gpsLng,
  onMapChange,
  t,
  tr,
}) {
  const { height: screenH } = useWindowDimensions();
  const [regionSheetOpen, setRegionSheetOpen] = useState(false);
  const [districtSheetOpen, setDistrictSheetOpen] = useState(false);
  const [sheetCollapsed, setSheetCollapsed] = useState(false);

  // Xarita hali ko'rinib tursin deb panel va uning ichidagi maydonlar
  // to'liq xira emas, biroz shaffof — "bilinar-bilinmas" fon.
  const sheetBg = t.isDark ? 'rgba(10,20,34,0.88)' : 'rgba(238,242,247,0.9)';
  const fieldBg = t.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.035)';

  const selectedRegionName = regions.find((r) => r.id === regionId)?.name;
  const selectedDistrictName = districts.find((d) => d.id === districtId)?.name;

  // Viloyat/tuman tanlanganda faqat xarita ko'rinishi shu tomonga suriladi —
  // pin/joylashuv HECH QACHON o'zgartirilmaydi (onMapChange chaqirilmaydi).
  // Foydalanuvchi xaritaga o'zi bosgandagina yoki "hozirgi joylashuv"ni
  // ishlatgandagina aniq nuqta belgilanadi.
  const selectedRegion = regions.find((r) => r.id === regionId);
  const regionCoords = selectedRegion ? REGION_COORDS[selectedRegion.code] : null;
  const panLat = regionCoords ? regionCoords[0] : null;
  const panLng = regionCoords ? regionCoords[1] : null;
  const panZoom = selectedDistrictName ? 12 : 9;

  // Backend viloyat/tuman uchun koordinata bermaydi — shuning uchun Yandex'ning
  // o'z geokoderidan (ko'rinishni surish uchun, pin qo'ymaydi) foydalanamiz.
  const geocodeQuery = selectedDistrictName
    ? `${selectedDistrictName}, ${selectedRegionName}, O'zbekiston`
    : selectedRegionName
      ? `${selectedRegionName}, O'zbekiston`
      : null;
  const geocodeZoom = selectedDistrictName ? 12 : 9;

  // ── Ikki tomonlama moslashuv: xaritaga bosilsa manzil maydonlariga
  // yoziladi, ko'cha nomi yozilsa esa xaritada shu joy topiladi ──
  const skipNextSearchRef = useRef(false);
  const [searchQuery, setSearchQuery] = useState(null);

  useEffect(() => {
    if (skipNextSearchRef.current) {
      skipNextSearchRef.current = false;
      return;
    }
    if (!street || street.trim().length < 4) {
      setSearchQuery(null);
      return;
    }
    const handle = setTimeout(() => {
      const parts = [street.trim()];
      if (selectedDistrictName) parts.push(selectedDistrictName);
      if (selectedRegionName) parts.push(selectedRegionName);
      parts.push("O'zbekiston");
      setSearchQuery(parts.join(', '));
    }, 900);
    return () => clearTimeout(handle);
  }, [street, selectedDistrictName, selectedRegionName]);

  const handleAddressResolved = (data) => {
    const text = data.street
      ? data.house
        ? `${data.street}, ${data.house}`
        : data.street
      : data.addressLine;
    if (text) {
      skipNextSearchRef.current = true;
      onStreetChange(text);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: t.bg }}>
        {/* ── Butun ekranni egallagan xarita ── */}
        <LocationMapPicker
          lat={gpsLat}
          lng={gpsLng}
          onChange={onMapChange}
          fill
          showExpand={false}
          borderRadius={0}
          geocodeQuery={geocodeQuery}
          geocodeZoom={geocodeZoom}
          panLat={panLat}
          panLng={panLng}
          panZoom={panZoom}
          searchQuery={searchQuery}
          onAddressResolved={handleAddressResolved}
          showTapHint
          tapHint={tr('newOrder.mapTapHint')}
          locateLabel={tr('newOrder.mapLocateLabel')}
          locatingLabel={tr('newOrder.mapLocating')}
          permissionTitle={tr('newOrder.locationPermissionTitle')}
          permissionMessage={tr('newOrder.locationPermissionMsg')}
          errorTitle={tr('common.errorTitle')}
          errorMessage={tr('newOrder.locationError')}
        />

        {/* ── Xarita ustida suzuvchi sarlavha ── */}
        <SafeAreaView edges={['top']} style={s.mapTopBar} pointerEvents="box-none">
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.85}
            style={[s.mapBackBtn, { backgroundColor: t.card }]}
          >
            <MaterialCommunityIcons name="arrow-left" size={20} color={t.text} />
          </TouchableOpacity>
          <View style={[s.mapTitlePill, { backgroundColor: t.card }]}>
            <Text style={[s.mapTitlePillTxt, { color: t.text }]}>
              {tr('newOrder.addressModalTitle')}
            </Text>
          </View>
        </SafeAreaView>

        {/* ── Xaritaning pastki qismida suzuvchi maydonlar paneli ── */}
        {sheetCollapsed ? (
          <TouchableOpacity
            onPress={() => setSheetCollapsed(false)}
            activeOpacity={0.85}
            style={[s.reopenFab, { backgroundColor: t.orange }]}
          >
            <MaterialCommunityIcons name="chevron-up" size={15} color="#fff" />
            <Text style={s.reopenFabTxt}>{tr('newOrder.reopenLabel')}</Text>
          </TouchableOpacity>
        ) : (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'position' : 'height'}
            style={s.bottomSheetWrap}
          >
          <View style={[s.bottomSheet, { backgroundColor: sheetBg, borderColor: t.border }]}>
            <View style={s.sheetHandleWrap}>
              <View style={[s.sheetHandle, { backgroundColor: t.border }]} />
            </View>

            <ScrollView
              style={{ maxHeight: screenH * 0.46 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={[s.mapHint, { color: t.faint }]}>{tr('newOrder.mapHint')}</Text>

              <View style={{ gap: 14, marginTop: 10 }}>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <SelectField
                      label={tr('newOrder.regionLabel')}
                      value={selectedRegionName}
                      placeholder={tr('newOrder.regionPlaceholder')}
                      onPress={() => setRegionSheetOpen(true)}
                      t={t}
                      bg={fieldBg}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <SelectField
                      label={tr('newOrder.districtLabel')}
                      value={selectedDistrictName}
                      placeholder={
                        regionId ? tr('newOrder.districtPlaceholder') : tr('newOrder.regionPlaceholder')
                      }
                      onPress={() => setDistrictSheetOpen(true)}
                      t={t}
                      bg={fieldBg}
                      disabled={!regionId}
                    />
                  </View>
                </View>

                <TextInput
                  value={street}
                  onChangeText={onStreetChange}
                  placeholder={tr('newOrder.streetPlaceholder')}
                  placeholderTextColor={t.faint}
                  style={[s.input, { backgroundColor: fieldBg, borderColor: t.border, color: t.text }]}
                />
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TextInput
                    value={entrance}
                    onChangeText={onEntranceChange}
                    placeholder={tr('newOrder.entrancePlaceholder')}
                    placeholderTextColor={t.faint}
                    style={[
                      s.input,
                      { flex: 1, backgroundColor: fieldBg, borderColor: t.border, color: t.text },
                    ]}
                  />
                  <TextInput
                    value={floor}
                    onChangeText={onFloorChange}
                    placeholder={tr('newOrder.floorPlaceholder')}
                    placeholderTextColor={t.faint}
                    style={[
                      s.input,
                      { flex: 1, backgroundColor: fieldBg, borderColor: t.border, color: t.text },
                    ]}
                  />
                </View>

                <View style={[s.noteBox, { backgroundColor: fieldBg, borderColor: t.border }]}>
                  <MaterialCommunityIcons name="shield-check-outline" size={16} color={t.muted} />
                  <Text style={[s.noteTxt, { color: t.muted }]}>
                    {tr('newOrder.addressAccuracyNote')}
                  </Text>
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.85}
              style={[s.modalDoneBtn, { backgroundColor: t.orange, marginTop: 14 }]}
            >
              <Text style={s.modalDoneTxt}>{tr('newOrder.addressSaveBtn')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSheetCollapsed(true)}
              activeOpacity={0.8}
              style={[s.collapseBtn, { backgroundColor: t.card, borderColor: t.border }]}
            >
              <MaterialCommunityIcons name="chevron-down" size={20} color={t.text} />
            </TouchableOpacity>
          </View>
          </KeyboardAvoidingView>
        )}
      </View>

      <OptionSheet
        visible={regionSheetOpen}
        onClose={() => setRegionSheetOpen(false)}
        title={tr('newOrder.regionLabel')}
        options={regions}
        selectedId={regionId}
        onSelect={onSelectRegion}
        t={t}
        tr={tr}
      />
      <OptionSheet
        visible={districtSheetOpen}
        onClose={() => setDistrictSheetOpen(false)}
        title={tr('newOrder.districtLabel')}
        options={districts}
        selectedId={districtId}
        onSelect={onSelectDistrict}
        t={t}
        tr={tr}
      />
    </Modal>
  );
}

function SummaryRow({ icon, label, value, t }) {
  return (
    <View style={s.summaryRow}>
      <View style={s.summaryLabelWrap}>
        <MaterialCommunityIcons name={icon} size={15} color={t.muted} />
        <Text style={[s.summaryLabel, { color: t.muted }]} numberOfLines={1}>
          {label}
        </Text>
      </View>
      <Text style={[s.summaryValue, { color: t.text }]} numberOfLines={3}>
        {value}
      </Text>
    </View>
  );
}

function ReviewModal({
  visible,
  onClose,
  onConfirm,
  submitting,
  t,
  tr,
  orderWorker,
  selectedCategories,
  addressTitle,
  addressSubtitle,
  street,
  entrance,
  floor,
  when,
  whenDate,
  description,
  photos,
  toolsOption,
  workerCount,
  requirePhoto,
  minRating,
  ageFrom,
  ageTo,
  pricingType,
  hourlyRate,
  estimatedHours,
  fixedPrice,
  paymentMethod,
  phone,
  backupPhone,
}) {
  const notSet = tr('newOrder.review.notSet');

  const whenText =
    when === 'urgent'
      ? tr('newOrder.when.urgent')
      : when === 'today'
        ? tr('newOrder.when.today')
        : when === 'date'
          ? whenDate
            ? formatWhenDate(whenDate)
            : tr('newOrder.when.date')
          : when === 'flexible'
            ? tr('newOrder.when.flexible')
            : notSet;

  const toolsText =
    toolsOption === 'has'
      ? tr('newOrder.tools.has')
      : toolsOption === 'needed'
        ? tr('newOrder.tools.needed')
        : notSet;

  const ratingText = minRating === 0 ? tr('newOrder.requirements.allRatings') : `${minRating}+ ★`;

  const ageText =
    ageFrom.trim() || ageTo.trim() ? `${ageFrom.trim() || '…'} – ${ageTo.trim() || '…'}` : notSet;

  const som = tr('common.currencySom');
  const pricingText =
    pricingType === 'hourly'
      ? hourlyRate.trim() || estimatedHours.trim()
        ? `${formatMoney(hourlyRate.trim()) || '—'} ${som} × ${estimatedHours.trim() || '—'} ${tr('newOrder.pricing.hoursPlaceholder').toLowerCase()}`
        : notSet
      : fixedPrice.trim()
        ? `${formatMoney(fixedPrice.trim())} ${som}`
        : notSet;

  const paymentText =
    paymentMethod === 'cash' ? tr('newOrder.payment.cash') : tr('newOrder.payment.cashless');

  const addressDetails = [street, entrance, floor].filter((v) => v && v.trim()).join(', ');
  const addressText =
    [addressTitle, addressSubtitle || addressDetails].filter(Boolean).join(' — ') || notSet;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top', 'left', 'right']}>
        <View style={s.reviewHeader}>
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.85}
            style={[s.mapBackBtn, { backgroundColor: t.card }]}
          >
            <MaterialCommunityIcons name="arrow-left" size={20} color={t.text} />
          </TouchableOpacity>
          <Text style={[s.reviewHeaderTitle, { color: t.text }]}>
            {tr('newOrder.review.title')}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={[s.requirementsBox, { backgroundColor: t.card, borderColor: t.border }]}>
            {!!orderWorker && (
              <>
                <SummaryRow
                  icon="account-star-outline"
                  label={tr('newOrder.targetWorkerLabel')}
                  value={[orderWorker.name, orderWorker.trade].filter(Boolean).join(' — ')}
                  t={t}
                />
                <View style={[s.requirementDivider, { backgroundColor: t.border }]} />
              </>
            )}
            <SummaryRow
              icon="briefcase-outline"
              label={tr('newOrder.categoryLabel')}
              value={selectedCategories.map((c) => c.name).join(', ') || notSet}
              t={t}
            />
            <View style={[s.requirementDivider, { backgroundColor: t.border }]} />
            <SummaryRow
              icon="map-marker-outline"
              label={tr('newOrder.locationLabel')}
              value={addressText}
              t={t}
            />
            <View style={[s.requirementDivider, { backgroundColor: t.border }]} />
            <SummaryRow icon="calendar-clock" label={tr('newOrder.whenLabel')} value={whenText} t={t} />
            <View style={[s.requirementDivider, { backgroundColor: t.border }]} />
            <SummaryRow
              icon="text-long"
              label={tr('newOrder.descriptionLabel')}
              value={description.trim() || notSet}
              t={t}
            />
            <View style={[s.requirementDivider, { backgroundColor: t.border }]} />
            <SummaryRow
              icon="image-multiple-outline"
              label={tr('newOrder.photosLabel')}
              value={tr('newOrder.review.photosCount', { n: photos.length })}
              t={t}
            />
            <View style={[s.requirementDivider, { backgroundColor: t.border }]} />
            <SummaryRow icon="toolbox-outline" label={tr('newOrder.toolsLabel')} value={toolsText} t={t} />
            <View style={[s.requirementDivider, { backgroundColor: t.border }]} />
            <SummaryRow
              icon="account-group-outline"
              label={tr('newOrder.workerCountLabel')}
              value={String(workerCount)}
              t={t}
            />
            <View style={[s.requirementDivider, { backgroundColor: t.border }]} />
            <SummaryRow
              icon="shield-check-outline"
              label={tr('newOrder.requirements.photoRequired')}
              value={requirePhoto ? tr('common.yes') : tr('common.no')}
              t={t}
            />
            <View style={[s.requirementDivider, { backgroundColor: t.border }]} />
            <SummaryRow
              icon="star-outline"
              label={tr('newOrder.requirements.ratingLabel')}
              value={ratingText}
              t={t}
            />
            <View style={[s.requirementDivider, { backgroundColor: t.border }]} />
            <SummaryRow
              icon="account-outline"
              label={tr('newOrder.requirements.ageLabel')}
              value={ageText}
              t={t}
            />
            <View style={[s.requirementDivider, { backgroundColor: t.border }]} />
            <SummaryRow
              icon="cash-multiple"
              label={tr('newOrder.pricingLabel')}
              value={pricingText}
              t={t}
            />
            <View style={[s.requirementDivider, { backgroundColor: t.border }]} />
            <SummaryRow
              icon="credit-card-outline"
              label={tr('newOrder.paymentLabel')}
              value={paymentText}
              t={t}
            />
            <View style={[s.requirementDivider, { backgroundColor: t.border }]} />
            <SummaryRow
              icon="phone-outline"
              label={tr('newOrder.phoneLabel')}
              value={`+998 ${phone}`}
              t={t}
            />
            {!!backupPhone.trim() && (
              <>
                <View style={[s.requirementDivider, { backgroundColor: t.border }]} />
                <SummaryRow
                  icon="phone-plus-outline"
                  label={tr('newOrder.backupPhoneLabel')}
                  value={`+998 ${backupPhone}`}
                  t={t}
                />
              </>
            )}
          </View>
        </ScrollView>

        <View style={[s.reviewFooter, { backgroundColor: t.bg, borderTopColor: t.border }]}>
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.85}
            disabled={submitting}
            style={[
              s.reviewEditBtn,
              { borderColor: t.border, backgroundColor: t.card },
              submitting && { opacity: 0.5 },
            ]}
          >
            <MaterialCommunityIcons name="pencil-outline" size={16} color={t.text} />
            <Text style={[s.reviewEditTxt, { color: t.text }]}>{tr('common.edit')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onConfirm}
            activeOpacity={0.85}
            disabled={submitting}
            style={[s.cta, { backgroundColor: t.orange, flex: 1, marginTop: 0 }]}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Text style={[s.ctaTxt, { color: '#fff' }]}>{tr('common.confirm')}</Text>
                <MaterialCommunityIcons name="check" size={18} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

export default function NewOrderScreen({ onTabChange, onOrderCreated, targetWorker }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const { user } = useUser();
  const { width: screenWidth } = useWindowDimensions();

  const [orderWorker, setOrderWorker] = useState(targetWorker || null);
  const [categories, setCategories] = useState([]);
  const [categoryIds, setCategoryIds] = useState(
    targetWorker?.categoryId ? [targetWorker.categoryId] : []
  );
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [regions, setRegions] = useState([]);
  const [regionId, setRegionId] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [districtId, setDistrictId] = useState(null);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [street, setStreet] = useState('');
  const [entrance, setEntrance] = useState('');
  const [floor, setFloor] = useState('');
  const [gpsLat, setGpsLat] = useState(null);
  const [gpsLng, setGpsLng] = useState(null);
  const [when, setWhen] = useState(null);
  const [whenDate, setWhenDate] = useState(null);
  const [showIosDatePicker, setShowIosDatePicker] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [previewIndex, setPreviewIndex] = useState(null);
  const [toolsOption, setToolsOption] = useState(null);
  const [workerCount, setWorkerCount] = useState(1);
  const [requirePhoto, setRequirePhoto] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [ageFrom, setAgeFrom] = useState('');
  const [ageTo, setAgeTo] = useState('');
  const [pricingType, setPricingType] = useState('hourly');
  const [hourlyRate, setHourlyRate] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [fixedPrice, setFixedPrice] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [phone, setPhone] = useState(stripCountryCode(user?.phone));
  const [showBackupPhone, setShowBackupPhone] = useState(false);
  const [backupPhone, setBackupPhone] = useState('');
  const [reviewOpen, setReviewOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // Bir xil so'rov qayta yuborilsa (masalan tarmoq xatosidan keyin "Tasdiqlash"
  // yana bosilsa) backend buni dublikat sifatida qaytarishi uchun shu bir xil
  // kalit qayta ishlatiladi — forma qayta ochilganda yangisi generatsiya qilinadi.
  const idempotencyKeyRef = useRef(null);

  const pickPhotos = async () => {
    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) return;
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(tr('common.errorTitle'), tr('newOrder.photosPermission'));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.8,
    });
    if (!result.canceled) {
      setPhotos((prev) => [...prev, ...result.assets.map((a) => a.uri)].slice(0, MAX_PHOTOS));
    }
  };

  const removePhoto = (uri) => {
    setPhotos((prev) => prev.filter((p) => p !== uri));
  };

  const openWhenDatePicker = () => {
    setWhen('date');
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: whenDate || new Date(),
        mode: 'date',
        minimumDate: new Date(),
        onValueChange: (_e, selectedDate) => {
          DateTimePickerAndroid.open({
            value: whenDate || selectedDate,
            mode: 'time',
            onValueChange: (_e2, selectedTime) => {
              const combined = new Date(selectedDate);
              combined.setHours(selectedTime.getHours(), selectedTime.getMinutes());
              setWhenDate(combined);
            },
          });
        },
      });
    } else {
      setShowIosDatePicker(true);
    }
  };

  // Xaritada nuqta tanlanganda topilgan viloyatning tumanlar ro'yxati hali
  // yuklanmagan bo'lishi mumkin — shu holatda maqsad koordinatani shu yerga
  // saqlab, ro'yxat kelgach tuman moslashtiriladi (pastdagi effektga qarang).
  const pendingAutoDistrictRef = useRef(null);

  const autoSelectLocation = (mapLat, mapLng) => {
    if (!Number.isFinite(mapLat) || !Number.isFinite(mapLng) || regions.length === 0) return;
    const nearestRegion = findNearestByCoords(regions, mapLat, mapLng);
    if (!nearestRegion) return;
    if (nearestRegion.id !== regionId) {
      pendingAutoDistrictRef.current = { lat: mapLat, lng: mapLng };
      setRegionId(nearestRegion.id);
      return;
    }
    const nearestDistrict = findNearestByCoords(districts, mapLat, mapLng);
    if (nearestDistrict && nearestDistrict.id !== districtId) {
      setDistrictId(nearestDistrict.id);
    }
  };

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
    getRegions().then(setRegions).catch(() => {});
  }, []);

  useEffect(() => {
    if (!regionId) {
      setDistricts([]);
      setDistrictId(null);
      return;
    }
    let cancelled = false;
    getDistricts(regionId)
      .then((d) => {
        if (cancelled) return;
        setDistricts(d);
        if (pendingAutoDistrictRef.current) {
          const { lat: pLat, lng: pLng } = pendingAutoDistrictRef.current;
          pendingAutoDistrictRef.current = null;
          const nearestDistrict = findNearestByCoords(d, pLat, pLng);
          if (nearestDistrict) setDistrictId(nearestDistrict.id);
        }
      })
      .catch(() => {});
    setDistrictId(null);
    return () => {
      cancelled = true;
    };
  }, [regionId]);

  const toggleCategory = (id) => {
    setCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };


  const selectedCategories = categories.filter((c) => categoryIds.includes(c.id));
  const selectedRegion = regions.find((r) => r.id === regionId);
  const selectedDistrict = districts.find((d) => d.id === districtId);
  const hasAddress = !!(districtId || regionId || street.trim() || gpsLat);
  const addressTitle =
    [selectedDistrict?.name, selectedRegion?.name].filter(Boolean).join(', ') ||
    street.trim() ||
    tr('newOrder.addressModalTitle');
  const addressSubtitle = selectedDistrict?.name || selectedRegion?.name ? street.trim() : '';

  const ready =
    categoryIds.length > 0 && description.trim().length > 0 && phone.trim().length > 0;

  const handleSubmit = async () => {
    if (submitting) return;
    const payload = {
      description: description.trim(),
      category_id: categoryIds[0] ?? null,
      task_category_ids: categoryIds,
      worker_id: orderWorker?.id ?? null,
      contact_phone: `+998${phone.trim()}`,
      region_id: regionId,
      district_id: districtId,
      gps_lat: gpsLat,
      gps_lng: gpsLng,
      location_landmark: street.trim() || null,
      entrance: entrance.trim() || null,
      floor: floor.trim() || null,
      timing_kind: when ? TIMING_KIND_MAP[when] : null,
      scheduled_date: when === 'date' && whenDate ? toISODate(whenDate) : null,
      tools_provided_by:
        toolsOption === 'has' ? 'customer' : toolsOption === 'needed' ? 'worker' : null,
      workers_needed: workerCount,
      require_photo: requirePhoto,
      min_rating: minRating || null,
      worker_age_min: ageFrom.trim() ? Number(ageFrom) : null,
      worker_age_max: ageTo.trim() ? Number(ageTo) : null,
      price_mode: pricingType,
      hourly_rate: pricingType === 'hourly' && hourlyRate.trim() ? Number(hourlyRate) : null,
      estimated_hours:
        pricingType === 'hourly' && estimatedHours.trim() ? Number(estimatedHours) : null,
      budget: pricingType === 'fixed' && fixedPrice.trim() ? Number(fixedPrice) : null,
      payment_method: paymentMethod,
    };

    setSubmitting(true);
    try {
      const created = await createOrder(payload, idempotencyKeyRef.current);
      setReviewOpen(false);
      onOrderCreated?.({
        id: created?.id ?? null,
        category: selectedCategories.map((c) => c.name).join(', '),
        address: addressTitle,
        raw: created,
      });
      onTabChange?.('home');
    } catch (err) {
      Alert.alert(
        tr('newOrder.submitErrorTitle'),
        err?.message || tr('common.error')
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top', 'left', 'right']}>
      <StatusBar style={t.isDark ? 'light' : 'dark'} />

      {/* Xarita "manzil" oynasi ochilishidan oldin shu yerda ko'rinmas holda
          oldindan yuklanib turadi — aks holda foydalanuvchi "Manzil"ga
          kirganda WebView noldan ishga tushib, sezilarli kutish bo'lardi. */}
      <View style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }} pointerEvents="none">
        <LocationMapPicker height={1} showExpand={false} />
      </View>

      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        extraScrollHeight={20}
        keyboardOpeningTime={0}
      >
          <Text style={[s.title, { color: t.text }]}>{tr('newOrder.headerTitle')}</Text>
          <Text style={[s.subtitle, { color: t.muted }]}>{tr('newOrder.headerSubtitle')}</Text>

          {!!orderWorker && (
            <View style={[s.targetWorkerCard, { backgroundColor: t.card, borderColor: t.orange }]}>
              <View
                style={[s.targetWorkerAvatar, { backgroundColor: orderWorker.bgColor || t.orange }]}
              >
                <Text style={s.targetWorkerAvatarTxt}>{orderWorker.initial || 'A'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.targetWorkerLabel, { color: t.muted }]}>
                  {tr('newOrder.targetWorkerLabel')}
                </Text>
                <Text style={[s.targetWorkerName, { color: t.text }]} numberOfLines={1}>
                  {orderWorker.name}
                </Text>
                {!!orderWorker.trade && (
                  <Text style={[s.targetWorkerTrade, { color: t.muted }]} numberOfLines={1}>
                    {orderWorker.trade}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() => setOrderWorker(null)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <MaterialCommunityIcons name="close" size={16} color={t.muted} />
              </TouchableOpacity>
            </View>
          )}

          {/* ── Xizmat turi (ko'p tanlovli) ── */}
          <Text style={[s.label, { color: t.text }]}>{tr('newOrder.categoryLabel')}</Text>
          <View style={s.chipRow}>
            {selectedCategories.map((c) => (
              <View key={c.id} style={[s.selectedChip, { backgroundColor: t.orange }]}>
                <Text style={s.selectedChipTxt} numberOfLines={1}>
                  {c.name}
                </Text>
                <TouchableOpacity
                  onPress={() => toggleCategory(c.id)}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <MaterialCommunityIcons name="close" size={14} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity
              onPress={() => setCategoryPickerOpen(true)}
              activeOpacity={0.8}
              style={[s.addChip, { borderColor: t.orange }]}
            >
              <MaterialCommunityIcons name="plus" size={15} color={t.orange} />
              <Text style={[s.addChipTxt, { color: t.orange }]}>
                {tr(selectedCategories.length ? 'newOrder.categoryAddMore' : 'newOrder.categoryAddBtn')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── Tavsif (xizmat turi tanlangandan keyin chiqadi) ── */}
          {selectedCategories.length > 0 && (
            <>
              <Text style={[s.label, { color: t.text }]}>{tr('newOrder.descriptionLabel')}</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder={tr('newOrder.descriptionPlaceholder')}
                placeholderTextColor={t.faint}
                multiline
                numberOfLines={4}
                style={[
                  s.textarea,
                  { backgroundColor: t.card, borderColor: t.border, color: t.text },
                ]}
              />
            </>
          )}

          {/* ── Manzil ── */}
          <Text style={[s.label, { color: t.text }]}>{tr('newOrder.locationLabel')}</Text>
          {hasAddress ? (
            <TouchableOpacity
              onPress={() => setAddressModalOpen(true)}
              activeOpacity={0.85}
              style={[s.addressCard, { backgroundColor: t.card, borderColor: t.border }]}
            >
              <MaterialCommunityIcons name="map-marker" size={20} color={t.orange} />
              <View style={{ flex: 1 }}>
                <Text style={[s.addressCardTitle, { color: t.text }]} numberOfLines={1}>
                  {addressTitle}
                </Text>
                {!!addressSubtitle && (
                  <Text style={[s.addressCardSub, { color: t.muted }]} numberOfLines={1}>
                    {addressSubtitle}
                  </Text>
                )}
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={t.faint} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => setAddressModalOpen(true)}
              activeOpacity={0.8}
              style={[s.addChip, { borderColor: t.orange, alignSelf: 'flex-start' }]}
            >
              <MaterialCommunityIcons name="map-marker-plus-outline" size={16} color={t.orange} />
              <Text style={[s.addChipTxt, { color: t.orange }]}>
                {tr('newOrder.addressAddBtn')}
              </Text>
            </TouchableOpacity>
          )}

          {/* ── Qachon ── */}
          <Text style={[s.label, { color: t.text }]}>{tr('newOrder.whenLabel')}</Text>
          <View style={s.whenGrid}>
            <WhenOption
              icon="lightning-bolt"
              accent
              title={tr('newOrder.when.urgent')}
              subtitle={tr('newOrder.when.urgentSubtitle')}
              active={when === 'urgent'}
              onPress={() => setWhen('urgent')}
              t={t}
            />
            <WhenOption
              icon="white-balance-sunny"
              title={tr('newOrder.when.today')}
              active={when === 'today'}
              onPress={() => setWhen('today')}
              t={t}
            />
            <WhenOption
              icon="calendar-month-outline"
              title={tr('newOrder.when.date')}
              subtitle={when === 'date' && whenDate ? formatWhenDate(whenDate) : null}
              active={when === 'date'}
              onPress={openWhenDatePicker}
              t={t}
            />
            <WhenOption
              icon="calendar-blank-outline"
              title={tr('newOrder.when.flexible')}
              subtitle={tr('newOrder.when.flexibleSubtitle')}
              active={when === 'flexible'}
              onPress={() => setWhen('flexible')}
              t={t}
            />
          </View>
          {Platform.OS === 'ios' && showIosDatePicker && (
            <DateTimePicker
              value={whenDate || new Date()}
              mode="datetime"
              minimumDate={new Date()}
              onValueChange={(_e, selectedDate) => {
                setWhenDate(selectedDate);
                setShowIosDatePicker(false);
              }}
              onDismiss={() => setShowIosDatePicker(false)}
            />
          )}

          {/* ── Rasmlar ── */}
          <Text style={[s.label, { color: t.text }]}>{tr('newOrder.photosLabel')}</Text>
          <Text style={[s.hint, { color: t.muted }]}>{tr('newOrder.photosHint')}</Text>
          <View style={s.photoGrid}>
            {photos.map((uri, index) => (
              <TouchableOpacity
                key={uri}
                style={s.photoTile}
                activeOpacity={0.85}
                onPress={() => setPreviewIndex(index)}
              >
                <Image source={{ uri }} style={s.photoTileImg} />
                <TouchableOpacity
                  onPress={() => removePhoto(uri)}
                  activeOpacity={0.8}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  style={s.photoRemoveBtn}
                >
                  <MaterialCommunityIcons name="close" size={12} color="#fff" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
            {photos.length < MAX_PHOTOS && (
              <TouchableOpacity
                onPress={pickPhotos}
                activeOpacity={0.8}
                style={[s.photoAddTile, { backgroundColor: t.card, borderColor: t.border }]}
              >
                <MaterialCommunityIcons name="camera-plus-outline" size={22} color={t.orange} />
                <Text style={[s.photoAddTxt, { color: t.muted }]}>
                  {photos.length}/{MAX_PHOTOS}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* ── Asboblar ── */}
          <Text style={[s.label, { color: t.text }]}>{tr('newOrder.toolsLabel')}</Text>
          <Text style={[s.hint, { color: t.muted }]}>{tr('newOrder.toolsHint')}</Text>
          <View style={s.toolsRow}>
            <TouchableOpacity
              onPress={() => setToolsOption('has')}
              activeOpacity={0.85}
              style={[
                s.toolsBtn,
                {
                  backgroundColor: toolsOption === 'has' ? t.orange : t.card,
                  borderColor: toolsOption === 'has' ? t.orange : t.border,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="toolbox-outline"
                size={18}
                color={toolsOption === 'has' ? '#fff' : t.text}
              />
              <Text
                style={[s.toolsBtnTxt, { color: toolsOption === 'has' ? '#fff' : t.text }]}
                numberOfLines={2}
              >
                {tr('newOrder.tools.has')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setToolsOption('needed')}
              activeOpacity={0.85}
              style={[
                s.toolsBtn,
                {
                  backgroundColor: toolsOption === 'needed' ? t.orange : t.card,
                  borderColor: toolsOption === 'needed' ? t.orange : t.border,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="account-hard-hat-outline"
                size={18}
                color={toolsOption === 'needed' ? '#fff' : t.text}
              />
              <Text
                style={[s.toolsBtnTxt, { color: toolsOption === 'needed' ? '#fff' : t.text }]}
                numberOfLines={2}
              >
                {tr('newOrder.tools.needed')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── Necha kishi kerak ── */}
          <Text style={[s.label, { color: t.text }]}>{tr('newOrder.workerCountLabel')}</Text>
          <View style={[s.workerCountCard, { backgroundColor: t.card, borderColor: t.border }]}>
            <View
              style={[
                s.workerCountIconWrap,
                { backgroundColor: t.isDark ? 'rgba(232,122,69,0.16)' : '#FDECE1' },
              ]}
            >
              <MaterialCommunityIcons name="account-group-outline" size={20} color={t.orange} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.requirementLabel, { color: t.text }]}>
                {tr('newOrder.workerCountFieldLabel')}
              </Text>
              <Text style={[s.requirementSub, { color: t.muted }]}>
                {tr('newOrder.workerCountHint')}
              </Text>
            </View>
            <View style={s.stepperRow}>
              <TouchableOpacity
                onPress={() => setWorkerCount((n) => Math.max(1, n - 1))}
                activeOpacity={0.8}
                style={[s.stepperBtn, { backgroundColor: t.bg }]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <MaterialCommunityIcons name="minus" size={16} color={t.text} />
              </TouchableOpacity>
              <Text style={[s.stepperValue, { color: t.text }]}>{workerCount}</Text>
              <TouchableOpacity
                onPress={() => setWorkerCount((n) => Math.min(50, n + 1))}
                activeOpacity={0.8}
                style={[s.stepperBtn, { backgroundColor: t.bg }]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <MaterialCommunityIcons name="plus" size={16} color={t.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Ishchiga talablar ── */}
          <Text style={[s.label, { color: t.text }]}>{tr('newOrder.requirementsLabel')}</Text>
          <View style={[s.requirementsBox, { backgroundColor: t.card, borderColor: t.border }]}>
            <View style={s.requirementRow}>
              <View style={{ flex: 1 }}>
                <Text style={[s.requirementLabel, { color: t.text }]}>
                  {tr('newOrder.requirements.photoRequired')}
                </Text>
                <Text style={[s.requirementSub, { color: t.muted }]}>
                  {tr('newOrder.requirements.photoRequiredHint')}
                </Text>
              </View>
              <ToggleSwitch value={requirePhoto} onChange={setRequirePhoto} t={t} />
            </View>

            <View style={[s.requirementDivider, { backgroundColor: t.border }]} />

            <Text style={[s.requirementLabel, { color: t.text, marginBottom: 10 }]}>
              {tr('newOrder.requirements.ratingLabel')}
            </Text>
            <View style={s.chipRow}>
              <TouchableOpacity
                onPress={() => setMinRating(0)}
                activeOpacity={0.85}
                style={[
                  s.ratingChip,
                  {
                    backgroundColor: minRating === 0 ? t.orange : t.inputBg,
                    borderColor: minRating === 0 ? t.orange : t.border,
                  },
                ]}
              >
                <Text style={[s.ratingChipTxt, { color: minRating === 0 ? '#fff' : t.text }]}>
                  {tr('newOrder.requirements.allRatings')}
                </Text>
              </TouchableOpacity>
              {[1, 2, 3, 4, 5].map((n) => {
                const active = minRating === n;
                return (
                  <TouchableOpacity
                    key={n}
                    onPress={() => setMinRating(n)}
                    activeOpacity={0.85}
                    style={[
                      s.ratingChip,
                      {
                        backgroundColor: active ? t.orange : t.inputBg,
                        borderColor: active ? t.orange : t.border,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="star"
                      size={13}
                      color={active ? '#fff' : '#F5A623'}
                    />
                    <Text style={[s.ratingChipTxt, { color: active ? '#fff' : t.text }]}>
                      {n}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={[s.requirementDivider, { backgroundColor: t.border }]} />

            <Text style={[s.requirementLabel, { color: t.text, marginBottom: 10 }]}>
              {tr('newOrder.requirements.ageLabel')}
            </Text>
            <View style={s.ageRow}>
              <View style={{ flex: 1 }}>
                <Text style={[s.ageInputLabel, { color: t.muted }]}>
                  {tr('newOrder.requirements.ageFrom')}
                </Text>
                <TextInput
                  value={ageFrom}
                  onChangeText={setAgeFrom}
                  keyboardType="number-pad"
                  placeholder="18"
                  placeholderTextColor={t.faint}
                  style={[
                    s.input,
                    { backgroundColor: t.bg, borderColor: t.border, color: t.text },
                  ]}
                />
              </View>
              <Text style={[s.ageDash, { color: t.muted }]}>—</Text>
              <View style={{ flex: 1 }}>
                <Text style={[s.ageInputLabel, { color: t.muted }]}>
                  {tr('newOrder.requirements.ageTo')}
                </Text>
                <TextInput
                  value={ageTo}
                  onChangeText={setAgeTo}
                  keyboardType="number-pad"
                  placeholder="60"
                  placeholderTextColor={t.faint}
                  style={[
                    s.input,
                    { backgroundColor: t.bg, borderColor: t.border, color: t.text },
                  ]}
                />
              </View>
            </View>
          </View>

          {/* ── Narx ── */}
          <Text style={[s.label, { color: t.text }]}>{tr('newOrder.pricingLabel')}</Text>
          <View style={s.pricingToggleRow}>
            <TouchableOpacity
              onPress={() => setPricingType('hourly')}
              activeOpacity={0.85}
              style={[
                s.pricingPill,
                {
                  backgroundColor: pricingType === 'hourly' ? t.orange : t.card,
                  borderColor: pricingType === 'hourly' ? t.orange : t.border,
                },
              ]}
            >
              <Text
                style={[
                  s.pricingPillTxt,
                  { color: pricingType === 'hourly' ? '#fff' : t.text },
                ]}
              >
                {tr('newOrder.pricing.hourly')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setPricingType('fixed')}
              activeOpacity={0.85}
              style={[
                s.pricingPill,
                {
                  backgroundColor: pricingType === 'fixed' ? t.orange : t.card,
                  borderColor: pricingType === 'fixed' ? t.orange : t.border,
                },
              ]}
            >
              <Text
                style={[
                  s.pricingPillTxt,
                  { color: pricingType === 'fixed' ? '#fff' : t.text },
                ]}
              >
                {tr('newOrder.pricing.fixed')}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={[s.hint, { color: t.muted, marginTop: 6 }]}>
            {pricingType === 'hourly'
              ? tr('newOrder.pricing.hourlyHint')
              : tr('newOrder.pricing.fixedHint')}
          </Text>
          {pricingType === 'hourly' ? (
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <MoneyInput
                value={hourlyRate}
                onChangeText={setHourlyRate}
                placeholder={tr('newOrder.pricing.ratePlaceholder')}
                suffix={tr('common.currencySom')}
                style={{ flex: 1 }}
                t={t}
              />
              <TextInput
                value={estimatedHours}
                onChangeText={setEstimatedHours}
                keyboardType="number-pad"
                placeholder={tr('newOrder.pricing.hoursPlaceholder')}
                placeholderTextColor={t.faint}
                style={[
                  s.input,
                  { flex: 1, backgroundColor: t.card, borderColor: t.border, color: t.text },
                ]}
              />
            </View>
          ) : (
            <MoneyInput
              value={fixedPrice}
              onChangeText={setFixedPrice}
              placeholder={tr('newOrder.pricing.fixedPricePlaceholder')}
              suffix={tr('common.currencySom')}
              t={t}
            />
          )}

          {/* ── To'lov ── */}
          <Text style={[s.label, { color: t.text }]}>{tr('newOrder.paymentLabel')}</Text>
          <PaymentOption
            icon="cash"
            iconBg={t.isDark ? 'rgba(31,163,124,0.18)' : '#E9F7F1'}
            iconColor="#1FA37C"
            title={tr('newOrder.payment.cash')}
            active={paymentMethod === 'cash'}
            onPress={() => setPaymentMethod('cash')}
            t={t}
          />
          <View style={{ height: 10 }} />
          <PaymentOption
            icon="credit-card-outline"
            iconBg={t.isDark ? 'rgba(47,128,214,0.18)' : '#E5F1FB'}
            iconColor="#2F80D6"
            title={tr('newOrder.payment.cashless')}
            subtitle={tr('newOrder.payment.cashlessHint')}
            active={paymentMethod === 'cashless'}
            onPress={() => setPaymentMethod('cashless')}
            t={t}
          />

          {/* ── Telefon ── */}
          <Text style={[s.label, { color: t.text }]}>
            {tr('newOrder.phoneLabel')} <Text style={{ color: '#E1523D' }}>*</Text>
          </Text>
          <PhoneField
            value={phone}
            onChangeText={setPhone}
            placeholder="90 123 45 67"
            t={t}
          />
          <Text style={[s.hint, { color: t.muted, marginTop: 6 }]}>
            {tr('newOrder.phoneHint')}
          </Text>

          {showBackupPhone ? (
            <>
              <View style={s.backupPhoneHeader}>
                <Text style={[s.label, { color: t.text, marginTop: 14, marginBottom: 0 }]}>
                  {tr('newOrder.backupPhoneLabel')}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowBackupPhone(false);
                    setBackupPhone('');
                  }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <MaterialCommunityIcons name="close" size={16} color={t.muted} />
                </TouchableOpacity>
              </View>
              <PhoneField
                value={backupPhone}
                onChangeText={setBackupPhone}
                placeholder="90 123 45 67"
                t={t}
              />
            </>
          ) : (
            <TouchableOpacity
              onPress={() => setShowBackupPhone(true)}
              activeOpacity={0.8}
              style={[s.addChip, { borderColor: t.orange, alignSelf: 'flex-start', marginTop: 12 }]}
            >
              <MaterialCommunityIcons name="phone-plus-outline" size={16} color={t.orange} />
              <Text style={[s.addChipTxt, { color: t.orange }]}>
                {tr('newOrder.addBackupPhoneBtn')}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={
              ready
                ? () => {
                    idempotencyKeyRef.current = Crypto.randomUUID();
                    setReviewOpen(true);
                  }
                : undefined
            }
            activeOpacity={0.85}
            style={[
              s.cta,
              { backgroundColor: t.orange },
              !ready && { backgroundColor: t.card },
            ]}
          >
            <Text style={[s.ctaTxt, { color: ready ? '#fff' : t.faint }]}>
              {tr('newOrder.submitCta')}
            </Text>
            <MaterialCommunityIcons
              name="arrow-right"
              size={18}
              color={ready ? '#fff' : t.faint}
            />
          </TouchableOpacity>
      </KeyboardAwareScrollView>

      <CategoryPickerModal
        visible={categoryPickerOpen}
        onClose={() => setCategoryPickerOpen(false)}
        categories={categories}
        selectedIds={categoryIds}
        onToggle={toggleCategory}
        t={t}
        tr={tr}
      />

      <AddressModal
        visible={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        regions={regions}
        regionId={regionId}
        onSelectRegion={setRegionId}
        districts={districts}
        districtId={districtId}
        onSelectDistrict={setDistrictId}
        street={street}
        onStreetChange={setStreet}
        entrance={entrance}
        onEntranceChange={setEntrance}
        floor={floor}
        onFloorChange={setFloor}
        gpsLat={gpsLat}
        gpsLng={gpsLng}
        onMapChange={(lat, lng) => {
          const nLat = Number(lat);
          const nLng = Number(lng);
          setGpsLat(nLat);
          setGpsLng(nLng);
          autoSelectLocation(nLat, nLng);
        }}
        t={t}
        tr={tr}
      />

      <ReviewModal
        visible={reviewOpen}
        onClose={() => setReviewOpen(false)}
        onConfirm={handleSubmit}
        submitting={submitting}
        t={t}
        tr={tr}
        orderWorker={orderWorker}
        selectedCategories={selectedCategories}
        addressTitle={addressTitle}
        addressSubtitle={addressSubtitle}
        street={street}
        entrance={entrance}
        floor={floor}
        when={when}
        whenDate={whenDate}
        description={description}
        photos={photos}
        toolsOption={toolsOption}
        workerCount={workerCount}
        requirePhoto={requirePhoto}
        minRating={minRating}
        ageFrom={ageFrom}
        ageTo={ageTo}
        pricingType={pricingType}
        hourlyRate={hourlyRate}
        estimatedHours={estimatedHours}
        fixedPrice={fixedPrice}
        paymentMethod={paymentMethod}
        phone={phone}
        backupPhone={backupPhone}
      />

      <Modal
        visible={previewIndex !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewIndex(null)}
      >
        <View style={s.previewBackdrop}>
          <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
            <View style={s.previewHeader}>
              <Text style={s.previewCounter}>
                {previewIndex !== null ? `${previewIndex + 1}/${photos.length}` : ''}
              </Text>
              <TouchableOpacity
                onPress={() => setPreviewIndex(null)}
                style={s.previewCloseBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialCommunityIcons name="close" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
            {previewIndex !== null && (
              <FlatList
                data={photos}
                keyExtractor={(uri) => uri}
                style={{ flex: 1 }}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                initialScrollIndex={previewIndex}
                getItemLayout={(_, i) => ({
                  length: screenWidth,
                  offset: screenWidth * i,
                  index: i,
                })}
                onMomentumScrollEnd={(e) => {
                  const idx = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
                  setPreviewIndex(idx);
                }}
                renderItem={({ item }) => (
                  <View style={[s.previewPage, { width: screenWidth }]}>
                    <Image source={{ uri: item }} style={s.previewImg} resizeMode="contain" />
                  </View>
                )}
              />
            )}
          </SafeAreaView>
        </View>
      </Modal>

      <BottomNav
        activeTab="newOrder"
        onTabChange={onTabChange}
        accent={t.orange}
        background={t.navBg}
        border={t.border}
        muted={t.faint}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  title: { fontWeight: '800', fontSize: 22, marginTop: 6 },
  subtitle: { fontSize: 13.5, lineHeight: 19, marginTop: 6, marginBottom: 20 },
  label: { fontWeight: '700', fontSize: 14.5, marginBottom: 10, marginTop: 18 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

  targetWorkerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 12,
    marginBottom: 20,
  },
  targetWorkerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetWorkerAvatarTxt: { color: '#fff', fontSize: 17, fontWeight: '800' },
  targetWorkerLabel: { fontSize: 11, fontWeight: '600' },
  targetWorkerName: { fontSize: 14.5, fontWeight: '700', marginTop: 2 },
  targetWorkerTrade: { fontSize: 12, marginTop: 1 },

  whenGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  whenCard: {
    width: '47%',
    flexGrow: 1,
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  whenTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  whenIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  whenTitle: { fontSize: 14, fontWeight: '700' },
  whenSubtitle: { fontSize: 11.5, marginTop: 3, lineHeight: 15 },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: { width: 10, height: 10, borderRadius: 5 },

  hint: { fontSize: 12, marginTop: -6, marginBottom: 12, lineHeight: 16 },

  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  photoTile: { width: '22%', aspectRatio: 1, borderRadius: 12, overflow: 'hidden' },
  photoTileImg: { width: '100%', height: '100%' },
  photoRemoveBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoAddTile: {
    width: '22%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  photoAddTxt: { fontSize: 11, fontWeight: '600' },

  toolsRow: { flexDirection: 'row', gap: 10 },
  toolsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  toolsBtnTxt: { fontSize: 13, fontWeight: '700', flex: 1 },

  workerCountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  workerCountIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepperBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: { fontSize: 16, fontWeight: '800', minWidth: 20, textAlign: 'center' },

  requirementsBox: {
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
  },
  requirementRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  requirementLabel: { fontSize: 14, fontWeight: '700' },
  requirementSub: { fontSize: 12, marginTop: 2 },
  requirementDivider: { height: 1, marginVertical: 14 },

  ratingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  ratingChipTxt: { fontSize: 13, fontWeight: '600' },

  ageRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  ageInputLabel: { fontSize: 12, marginBottom: 6 },
  ageDash: { fontSize: 16, paddingBottom: 14 },

  toggleTrack: { width: 46, height: 26, borderRadius: 13, justifyContent: 'center' },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },

  pricingToggleRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  pricingPill: {
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
  pricingPillTxt: { fontSize: 13, fontWeight: '700' },

  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  paymentIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentTitle: { fontSize: 14, fontWeight: '700' },
  paymentSub: { fontSize: 11.5, marginTop: 2, lineHeight: 15 },

  phoneRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderWidth: 1.5,
    borderRadius: 14,
    height: 50,
    overflow: 'hidden',
  },
  phonePrefix: {
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1.5,
  },
  phonePrefixTxt: { fontSize: 14, fontWeight: '700' },
  phoneInput: { flex: 1, paddingHorizontal: 14, fontSize: 14 },

  moneyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 14,
    height: 50,
    paddingLeft: 14,
    paddingRight: 12,
  },
  moneyInput: { flex: 1, fontSize: 14, height: '100%' },
  moneySuffix: { fontSize: 13, fontWeight: '600', marginLeft: 6 },

  backupPhoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  previewBackdrop: { flex: 1, backgroundColor: '#000' },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  previewCounter: { color: '#fff', fontSize: 14, fontWeight: '600' },
  previewCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewPage: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  previewImg: { width: '100%', height: '100%' },

  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  reviewHeaderTitle: { fontSize: 16, fontWeight: '700' },

  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 12,
  },
  summaryLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
    width: '38%',
  },
  summaryLabel: { fontSize: 12.5, flexShrink: 1 },
  summaryValue: { fontSize: 13.5, fontWeight: '600', flex: 1, textAlign: 'right' },

  reviewFooter: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
  },
  reviewEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderRadius: 15,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  reviewEditTxt: { fontSize: 14, fontWeight: '700' },

  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    maxWidth: '100%',
  },
  selectedChipTxt: { color: '#fff', fontSize: 13, fontWeight: '600', flexShrink: 1 },
  addChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  addChipTxt: { fontSize: 13, fontWeight: '600' },

  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  addressCardTitle: { fontSize: 14, fontWeight: '700' },
  addressCardSub: { fontSize: 12.5, marginTop: 2 },

  textarea: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
    fontSize: 14,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 15,
    gap: 8,
    marginTop: 28,
  },
  ctaTxt: { fontSize: 15, fontWeight: '700' },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    height: '78%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  modalTitle: { fontSize: 17, fontWeight: '700' },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 14, padding: 0 },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  categoryRowTxt: { fontSize: 14.5, fontWeight: '600', flex: 1 },
  modalDoneBtn: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  modalDoneTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },

  mapTopBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  mapBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  mapTitlePill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  mapTitlePillTxt: { fontSize: 14, fontWeight: '700' },

  bottomSheetWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  bottomSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 18,
  },
  sheetHandleWrap: { paddingTop: 4, paddingBottom: 10, alignItems: 'center' },
  collapseBtn: {
    position: 'absolute',
    top: 10,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  reopenFab: {
    position: 'absolute',
    right: 10,
    bottom: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  reopenFabTxt: { color: '#fff', fontSize: 12.5, fontWeight: '600' },
  mapHint: {
    fontSize: 12,
    textAlign: 'center',
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  noteTxt: { flex: 1, fontSize: 12, lineHeight: 17 },

  selectField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
  },
  selectFieldTxt: { fontSize: 14, flex: 1 },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  optionSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 8,
  },
});
