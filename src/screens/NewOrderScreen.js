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
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import BottomNav from '../components/BottomNav';
import LocationMapPicker from '../components/LocationMapPicker';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';
import { getCategories } from '../api/categories';
import { getRegions, getDistricts } from '../api/reference';

const WHEN_OPTIONS = ['today', 'tomorrow', 'thisWeek', 'flexible'];

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

function Chip({ label, active, onPress, t }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        s.chip,
        {
          backgroundColor: active ? t.orange : t.card,
          borderColor: active ? t.orange : t.border,
        },
      ]}
    >
      <Text
        style={[s.chipTxt, { color: active ? '#fff' : t.text }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </TouchableOpacity>
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
    if (data.street) {
      skipNextSearchRef.current = true;
      onStreetChange(data.house ? `${data.street}, ${data.house}` : data.street);
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

export default function NewOrderScreen({ onTabChange }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const { user } = useUser();

  const [categories, setCategories] = useState([]);
  const [categoryIds, setCategoryIds] = useState([]);
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
  const [when, setWhen] = useState('today');
  const [phone, setPhone] = useState(user?.phone ?? '');

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
        if (!cancelled) setDistricts(d);
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

  const ready = categoryIds.length > 0 && description.trim().length > 0;

  const handleSubmit = () => {
    const payload = {
      category_ids: categoryIds,
      description: description.trim(),
      address: {
        region_id: regionId,
        district_id: districtId,
        street: street.trim(),
        entrance: entrance.trim(),
        floor: floor.trim(),
        lat: gpsLat,
        lng: gpsLng,
      },
      when,
      phone: phone.trim(),
    };
    console.log('[newOrder] submit (backend hali ulanmagan):', payload);

    Alert.alert(
      tr('newOrder.comingSoon.title'),
      tr('newOrder.comingSoon.subtitle'),
      [
        { text: tr('newOrder.comingSoon.dismiss'), style: 'cancel' },
        {
          text: tr('newOrder.comingSoon.browse'),
          onPress: () => onTabChange?.('services'),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top', 'left', 'right']}>
      <StatusBar style={t.isDark ? 'light' : 'dark'} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 110 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[s.title, { color: t.text }]}>{tr('newOrder.headerTitle')}</Text>
          <Text style={[s.subtitle, { color: t.muted }]}>{tr('newOrder.headerSubtitle')}</Text>

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

          {/* ── Tavsif ── */}
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

          {/* ── Qachon ── */}
          <Text style={[s.label, { color: t.text }]}>{tr('newOrder.whenLabel')}</Text>
          <View style={s.chipRow}>
            {WHEN_OPTIONS.map((key) => (
              <Chip
                key={key}
                label={tr(`newOrder.when.${key}`)}
                active={when === key}
                onPress={() => setWhen(key)}
                t={t}
              />
            ))}
          </View>

          {/* ── Telefon ── */}
          <Text style={[s.label, { color: t.text }]}>{tr('newOrder.phoneLabel')}</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholderTextColor={t.faint}
            style={[
              s.input,
              { backgroundColor: t.card, borderColor: t.border, color: t.text },
            ]}
          />

          <TouchableOpacity
            onPress={ready ? handleSubmit : undefined}
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
        </ScrollView>
      </KeyboardAvoidingView>

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
          setGpsLat(Number(lat));
          setGpsLng(Number(lng));
        }}
        t={t}
        tr={tr}
      />

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
  chip: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
    maxWidth: '100%',
  },
  chipTxt: { fontSize: 13, fontWeight: '600' },

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

  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
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
