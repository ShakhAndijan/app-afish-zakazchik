import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  FlatList,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Feather from '@expo/vector-icons/Feather';
import * as Location from 'expo-location';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { getGenders, getRegions, getDistricts } from '../api/reference';
import { getCustomerMe, updateCustomerMe } from '../api/user';
import SuccessModal from '../components/SuccessModal';
import AfishLoader from '../components/AfishLoader';

// Backend hali javob bermasa ham forma bo'sh qolmasligi uchun mahalliy zaxira
// ro'yxatlar — real API javob bersa, ular ustidan yoziladi.
const FALLBACK_GENDERS = [
  { id: 1, code: 'male', name: 'Erkak' },
  { id: 2, code: 'female', name: 'Ayol' },
];
const FALLBACK_REGIONS = [
  { id: 1, name: 'Toshkent shahri' },
  { id: 2, name: 'Toshkent viloyati' },
  { id: 3, name: 'Samarqand viloyati' },
  { id: 4, name: "Farg'ona viloyati" },
  { id: 5, name: 'Buxoro viloyati' },
];
const FALLBACK_DISTRICTS = [
  { id: 1, name: 'Chilonzor' },
  { id: 2, name: 'Yunusobod' },
  { id: 3, name: "Mirzo Ulug'bek" },
  { id: 4, name: 'Sergeli' },
  { id: 5, name: 'Shayxontohur' },
];
const MONTH_NAMES_UZ = [
  'Yanvar',
  'Fevral',
  'Mart',
  'Aprel',
  'May',
  'Iyun',
  'Iyul',
  'Avgust',
  'Sentyabr',
  'Oktyabr',
  'Noyabr',
  'Dekabr',
];
const pad2 = (n) => String(n).padStart(2, '0');
const daysInMonth = (year, month) => new Date(year, month, 0).getDate();
const parseIsoDate = (str) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str || '');
  if (!m) return null;
  const [, yyyy, mm, dd] = m;
  return { year: Number(yyyy), month: Number(mm), day: Number(dd) };
};
const formatDisplayDate = (iso) => {
  const p = parseIsoDate(iso);
  if (!p) return '';
  return `${pad2(p.day)}.${pad2(p.month)}.${p.year}`;
};

/* ── Text / textarea field ── */
function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  t,
  keyboardType,
  multiline,
  maxLength,
}) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={[s.fieldLabel, { color: t.muted }]}>{label}</Text>
      <View
        style={[
          s.inputWrap,
          multiline && s.inputWrapMultiline,
          { backgroundColor: t.inputBg, borderColor: t.border },
        ]}
      >
        <TextInput
          style={[s.input, multiline && s.inputMultiline, { color: t.text }]}
          placeholder={placeholder}
          placeholderTextColor={t.faint}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType || 'default'}
          multiline={multiline}
          maxLength={maxLength}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
      </View>
      {maxLength ? (
        <Text style={[s.counter, { color: t.faint }]}>
          {(value || '').length}/{maxLength}
        </Text>
      ) : null}
    </View>
  );
}

/* ── Ikkita tugmali jins tanlash ── */
function GenderToggle({ genders, selectedId, onSelect, loading, t }) {
  const iconFor = (code) =>
    code === 'female' ? 'gender-female' : code === 'male' ? 'gender-male' : 'account';

  return (
    <View style={{ gap: 8 }}>
      <Text style={[s.fieldLabel, { color: t.muted }]}>Jinsi</Text>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={t.orange}
          style={{ alignSelf: 'flex-start' }}
        />
      ) : (
        <View style={s.genderRow}>
          {genders.map((g) => {
            const on = g.id === selectedId;
            return (
              <TouchableOpacity
                key={g.id}
                style={[
                  s.genderBtn,
                  {
                    backgroundColor: on ? t.orange : t.inputBg,
                    borderColor: on ? t.orange : t.border,
                  },
                ]}
                activeOpacity={0.8}
                onPress={() => onSelect(g.id)}
              >
                <MaterialCommunityIcons
                  name={iconFor(g.code)}
                  size={17}
                  color={on ? '#fff' : t.muted}
                />
                <Text
                  style={[s.genderBtnText, { color: on ? '#fff' : t.text }]}
                >
                  {g.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

/* ── Tappable field that opens a picker sheet ── */
function SelectField({ label, value, placeholder, onPress, t, disabled }) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={[s.fieldLabel, { color: t.muted }]}>{label}</Text>
      <TouchableOpacity
        style={[
          s.inputWrap,
          {
            backgroundColor: t.inputBg,
            borderColor: t.border,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
        onPress={disabled ? undefined : onPress}
        activeOpacity={0.7}
      >
        <Text
          style={[s.input, { color: value ? t.text : t.faint }]}
          numberOfLines={1}
        >
          {value || placeholder}
        </Text>
        <MaterialCommunityIcons
          name="chevron-right"
          size={18}
          color={t.faint}
        />
      </TouchableOpacity>
    </View>
  );
}

/* ── Generic single-select bottom sheet (gender / region / district) ── */
function OptionSheet({
  visible,
  onClose,
  title,
  options,
  selectedId,
  onSelect,
  t,
  loading,
}) {
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

      <View
        style={[s.sheet, { backgroundColor: t.card, borderColor: t.border }]}
      >
        <View style={s.grabberRow}>
          <View style={[s.grabber, { backgroundColor: t.border }]} />
        </View>
        <View style={s.sheetHeaderRow}>
          <Text style={[s.sheetTitle, { color: t.text }]}>{title}</Text>
          <TouchableOpacity
            style={[s.sheetCloseBtn, { backgroundColor: t.rowIconBg }]}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="close" size={16} color={t.muted} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator
            size="small"
            color={t.orange}
            style={{ marginVertical: 30 }}
          />
        ) : options.length === 0 ? (
          <Text style={[s.sheetEmpty, { color: t.muted }]}>
            Ma'lumot topilmadi
          </Text>
        ) : (
          <FlatList
            data={options}
            keyExtractor={(item) => String(item.id)}
            style={{ maxHeight: 380 }}
            contentContainerStyle={{ paddingBottom: 12 }}
            ItemSeparatorComponent={() => (
              <View style={[s.sheetDivider, { backgroundColor: t.border }]} />
            )}
            renderItem={({ item }) => {
              const on = item.id === selectedId;
              return (
                <TouchableOpacity
                  style={s.sheetRow}
                  activeOpacity={0.7}
                  onPress={() => {
                    onSelect(item);
                    onClose();
                  }}
                >
                  <Text style={[s.sheetRowText, { color: t.text }]}>
                    {item.name}
                  </Text>
                  {on && (
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={19}
                      color={t.orange}
                    />
                  )}
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    </Modal>
  );
}

/* ── Birth date wheel picker ── */
function DateColumn({ values, value, onChange, format, t }) {
  const idx = Math.max(0, values.indexOf(value));
  return (
    <FlatList
      data={values}
      keyExtractor={(v) => String(v)}
      style={{ flex: 1 }}
      showsVerticalScrollIndicator={false}
      initialScrollIndex={idx}
      getItemLayout={(_, i) => ({ length: 40, offset: 40 * i, index: i })}
      renderItem={({ item }) => {
        const selected = item === value;
        return (
          <TouchableOpacity
            style={s.dateCell}
            onPress={() => onChange(item)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                s.dateCellText,
                {
                  color: selected ? t.orange : t.muted,
                  fontWeight: selected ? '700' : '400',
                },
              ]}
            >
              {format ? format(item) : item}
            </Text>
          </TouchableOpacity>
        );
      }}
    />
  );
}

function BirthDateSheet({ visible, onClose, value, onChange, t }) {
  const currentYear = new Date().getFullYear();
  const parsed = parseIsoDate(value);
  const [day, setDay] = useState(parsed?.day ?? 1);
  const [month, setMonth] = useState(parsed?.month ?? 1);
  const [year, setYear] = useState(parsed?.year ?? currentYear - 25);

  useEffect(() => {
    if (visible) {
      const p = parseIsoDate(value);
      setDay(p?.day ?? 1);
      setMonth(p?.month ?? 1);
      setYear(p?.year ?? currentYear - 25);
    }
  }, [visible]);

  const maxDay = daysInMonth(year, month);
  const days = Array.from({ length: maxDay }, (_, i) => i + 1);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from(
    { length: currentYear - 1940 + 1 },
    (_, i) => currentYear - i
  );

  const changeMonth = (m) => {
    setMonth(m);
    if (day > daysInMonth(year, m)) setDay(daysInMonth(year, m));
  };
  const changeYear = (y) => {
    setYear(y);
    if (day > daysInMonth(y, month)) setDay(daysInMonth(y, month));
  };

  const confirm = () => {
    onChange(`${year}-${pad2(month)}-${pad2(day)}`);
    onClose();
  };

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

      <View
        style={[s.sheet, { backgroundColor: t.card, borderColor: t.border }]}
      >
        <View style={s.grabberRow}>
          <View style={[s.grabber, { backgroundColor: t.border }]} />
        </View>
        <View style={s.sheetHeaderRow}>
          <Text style={[s.sheetTitle, { color: t.text }]}>Tug'ilgan sana</Text>
          <TouchableOpacity
            style={[s.sheetCloseBtn, { backgroundColor: t.rowIconBg }]}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="close" size={16} color={t.muted} />
          </TouchableOpacity>
        </View>

        <View style={s.dateWheelWrap}>
          <View
            style={[s.dateHighlight, { backgroundColor: t.rowIconBg }]}
            pointerEvents="none"
          />
          <DateColumn values={days} value={day} onChange={setDay} t={t} />
          <DateColumn
            values={months}
            value={month}
            onChange={changeMonth}
            format={(m) => MONTH_NAMES_UZ[m - 1]}
            t={t}
          />
          <DateColumn values={years} value={year} onChange={changeYear} t={t} />
        </View>

        <View style={{ paddingHorizontal: 20, paddingTop: 6 }}>
          <TouchableOpacity
            style={[s.confirmBtn, { backgroundColor: t.orange }]}
            activeOpacity={0.85}
            onPress={confirm}
          >
            <Text style={s.confirmBtnText}>Tasdiqlash</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

/* ── GPS joylashuvni aniqlash tugmasi ── */
function LocationField({ lat, lng, locating, onLocate, t }) {
  const hasCoords = lat != null && lat !== '' && lng != null && lng !== '';
  return (
    <View style={{ gap: 8 }}>
      <Text style={[s.fieldLabel, { color: t.muted }]}>Joylashuv (GPS)</Text>
      <TouchableOpacity
        style={[
          s.locateBtn,
          { backgroundColor: t.inputBg, borderColor: t.border },
        ]}
        onPress={onLocate}
        activeOpacity={0.7}
        disabled={locating}
      >
        <Feather name="navigation" size={16} color={t.orange} />
        <Text
          style={[s.locateBtnText, { color: t.text }]}
          numberOfLines={1}
        >
          {locating
            ? 'Aniqlanmoqda...'
            : hasCoords
            ? `${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}`
            : 'Joriy joylashuvni aniqlash'}
        </Text>
        {locating && <ActivityIndicator size="small" color={t.orange} />}
      </TouchableOpacity>
    </View>
  );
}

function GroupLabel({ children, t }) {
  return <Text style={[s.groupLabel, { color: t.faint }]}>{children}</Text>;
}

export default function EditProfileScreen({ onBack }) {
  const { theme: t } = useTheme();
  const { refreshUser } = useUser();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [genderId, setGenderId] = useState(null);
  const [birthDate, setBirthDate] = useState('');
  const [regionId, setRegionId] = useState(null);
  const [districtId, setDistrictId] = useState(null);
  const [address, setAddress] = useState('');
  const [gpsLat, setGpsLat] = useState(null);
  const [gpsLng, setGpsLng] = useState(null);
  const [landmark, setLandmark] = useState('');

  const [genders, setGenders] = useState(FALLBACK_GENDERS);
  const [regions, setRegions] = useState(FALLBACK_REGIONS);
  const [districts, setDistricts] = useState([]);
  const [gendersLoading, setGendersLoading] = useState(true);
  const [regionsLoading, setRegionsLoading] = useState(true);
  const [districtsLoading, setDistrictsLoading] = useState(false);

  const [showRegionSheet, setShowRegionSheet] = useState(false);
  const [showDistrictSheet, setShowDistrictSheet] = useState(false);
  const [showDateSheet, setShowDateSheet] = useState(false);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    let alive = true;
    getCustomerMe()
      .then((data) => {
        if (!alive || !data) return;
        setFirstName(data.first_name || '');
        setLastName(data.last_name || '');
        setEmail(data.email || '');
        setGenderId(
          data.gender && typeof data.gender === 'object'
            ? data.gender.id ?? null
            : data.gender ?? null
        );
        setBirthDate(data.birth_date || '');
        setRegionId(
          data.region && typeof data.region === 'object'
            ? data.region.id ?? null
            : data.region ?? null
        );
        setDistrictId(
          data.district && typeof data.district === 'object'
            ? data.district.id ?? null
            : data.district ?? null
        );
        setAddress(data.address || '');
        setGpsLat(
          data.default_gps_lat != null ? Number(data.default_gps_lat) : null
        );
        setGpsLng(
          data.default_gps_lng != null ? Number(data.default_gps_lng) : null
        );
        setLandmark(data.default_landmark || '');
      })
      .catch((e) => {
        Alert.alert(
          'Xatolik',
          e.message || "Profil ma'lumotlarini yuklab bo'lmadi"
        );
      })
      .finally(() => alive && setInitialLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    getGenders()
      .then((list) => {
        if (alive && list?.length) setGenders(list);
      })
      .catch(() => {})
      .finally(() => alive && setGendersLoading(false));
    getRegions()
      .then((list) => {
        if (alive && list?.length) setRegions(list);
      })
      .catch(() => {})
      .finally(() => alive && setRegionsLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!regionId) {
      setDistricts([]);
      return;
    }
    let alive = true;
    setDistrictsLoading(true);
    getDistricts(regionId)
      .then((list) => {
        if (alive) setDistricts(list?.length ? list : FALLBACK_DISTRICTS);
      })
      .catch(() => {
        if (alive) setDistricts(FALLBACK_DISTRICTS);
      })
      .finally(() => alive && setDistrictsLoading(false));
    return () => {
      alive = false;
    };
  }, [regionId]);

  const selectedRegion = regions.find((r) => r.id === regionId);
  const selectedDistrict = districts.find((d) => d.id === districtId);

  const isReady =
    firstName.trim().length > 0 && lastName.trim().length > 0 && !saving;

  const handleLocate = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Ruxsat kerak', 'Joylashuv uchun ruxsat bering.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setGpsLat(pos.coords.latitude);
      setGpsLng(pos.coords.longitude);
    } catch {
      Alert.alert(
        'Xato',
        "Joylashuvni aniqlab bo'lmadi. Qayta urinib ko'ring."
      );
    } finally {
      setLocating(false);
    }
  };

  const handleSave = async () => {
    if (!isReady) return;
    const payload = {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim(),
      gender_id: genderId,
      birth_date: birthDate,
      region_id: regionId,
      district_id: districtId,
      address: address.trim(),
      default_gps_lat: gpsLat,
      default_gps_lng: gpsLng,
      default_landmark: landmark.trim(),
    };
    setSaving(true);
    try {
      await updateCustomerMe(payload);
      await refreshUser();
      setShowSuccess(true);
    } catch (e) {
      Alert.alert(
        'Xatolik',
        e.message || 'Profilni saqlashda xatolik yuz berdi'
      );
    } finally {
      setSaving(false);
    }
  };

  if (initialLoading) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: t.bg }}
        edges={['top', 'left', 'right']}
      >
        <StatusBar style={t.isDark ? 'light' : 'dark'} />
        <View style={[s.header, { backgroundColor: t.bg }]}>
          <TouchableOpacity
            style={[
              s.backBtn,
              { backgroundColor: t.card, borderColor: t.border },
            ]}
            onPress={onBack}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="chevron-left"
              size={24}
              color={t.text}
            />
          </TouchableOpacity>
          <Text style={[s.headerTitle, { color: t.text }]}>
            Profilni tahrirlash
          </Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <AfishLoader size={120} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: t.bg }}
      edges={['top', 'left', 'right']}
    >
      <StatusBar style={t.isDark ? 'light' : 'dark'} />

      <View style={[s.header, { backgroundColor: t.bg }]}>
        <TouchableOpacity
          style={[
            s.backBtn,
            { backgroundColor: t.card, borderColor: t.border },
          ]}
          onPress={onBack}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={24}
            color={t.text}
          />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: t.text }]}>
          Profilni tahrirlash
        </Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <GroupLabel t={t}>SHAXSIY MA'LUMOTLAR</GroupLabel>
          <View
            style={[s.card, { backgroundColor: t.card, borderColor: t.border }]}
          >
            <TextField
              label="Ism"
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Ismingiz"
              t={t}
            />
            <TextField
              label="Familiya"
              value={lastName}
              onChangeText={setLastName}
              placeholder="Familiyangiz"
              t={t}
            />
            <GenderToggle
              genders={genders}
              selectedId={genderId}
              onSelect={setGenderId}
              loading={gendersLoading}
              t={t}
            />
            <SelectField
              label="Tug'ilgan sana"
              value={formatDisplayDate(birthDate)}
              placeholder="Kun.Oy.Yil"
              onPress={() => setShowDateSheet(true)}
              t={t}
            />
          </View>

          <GroupLabel t={t}>ALOQA</GroupLabel>
          <View
            style={[s.card, { backgroundColor: t.card, borderColor: t.border }]}
          >
            <TextField
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="email@example.com"
              t={t}
              keyboardType="email-address"
            />
          </View>

          <GroupLabel t={t}>MANZIL</GroupLabel>
          <View
            style={[s.card, { backgroundColor: t.card, borderColor: t.border }]}
          >
            <SelectField
              label="Viloyat"
              value={selectedRegion?.name}
              placeholder="Viloyatni tanlang"
              onPress={() => setShowRegionSheet(true)}
              t={t}
            />
            <SelectField
              label="Tuman"
              value={selectedDistrict?.name}
              placeholder={
                regionId ? 'Tumanni tanlang' : 'Avval viloyatni tanlang'
              }
              onPress={() => setShowDistrictSheet(true)}
              t={t}
              disabled={!regionId}
            />
            <TextField
              label="To'liq manzil"
              value={address}
              onChangeText={setAddress}
              placeholder="Ko'cha, uy raqami"
              t={t}
            />
            <LocationField
              lat={gpsLat}
              lng={gpsLng}
              locating={locating}
              onLocate={handleLocate}
              t={t}
            />
            <TextField
              label="Mo'ljal"
              value={landmark}
              onChangeText={setLandmark}
              placeholder="Masalan: Mega Planet ro'parasida"
              t={t}
            />
          </View>

          <TouchableOpacity
            style={[
              s.saveBtn,
              { backgroundColor: isReady ? t.orange : t.orange + '55' },
            ]}
            activeOpacity={0.85}
            onPress={handleSave}
            disabled={!isReady}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={s.saveBtnText}>Saqlash</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <OptionSheet
        visible={showRegionSheet}
        onClose={() => setShowRegionSheet(false)}
        title="Viloyatni tanlang"
        options={regions}
        selectedId={regionId}
        onSelect={(item) => setRegionId(item.id)}
        t={t}
        loading={regionsLoading}
      />
      <OptionSheet
        visible={showDistrictSheet}
        onClose={() => setShowDistrictSheet(false)}
        title="Tumanni tanlang"
        options={districts}
        selectedId={districtId}
        onSelect={(item) => setDistrictId(item.id)}
        t={t}
        loading={districtsLoading}
      />
      <BirthDateSheet
        visible={showDateSheet}
        onClose={() => setShowDateSheet(false)}
        value={birthDate}
        onChange={setBirthDate}
        t={t}
      />
      <SuccessModal
        visible={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          onBack();
        }}
        t={t}
        message="Profil ma'lumotlari muvaffaqiyatli yangilandi."
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
    paddingBottom: 16,
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

  scroll: { paddingHorizontal: 20, paddingBottom: 40 },

  groupLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 18,
    marginBottom: 9,
    paddingLeft: 4,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },

  fieldLabel: { fontSize: 13, fontWeight: '600' },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 52,
    borderRadius: 13,
    borderWidth: 1.5,
    paddingHorizontal: 14,
  },
  inputWrapMultiline: {
    height: 96,
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  input: { flex: 1, fontSize: 14.5, fontWeight: '500', padding: 0 },
  inputMultiline: { height: '100%' },
  counter: { fontSize: 11, textAlign: 'right' },

  genderRow: { flexDirection: 'row', gap: 10 },
  genderBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 13,
    borderWidth: 1.5,
  },
  genderBtnText: { fontSize: 14, fontWeight: '700' },

  locateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 52,
    borderRadius: 13,
    borderWidth: 1.5,
    paddingHorizontal: 14,
  },
  locateBtnText: { flex: 1, fontSize: 13.5, fontWeight: '600' },

  saveBtn: {
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 26,
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(4,8,14,0.55)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    paddingBottom: 24,
    maxHeight: '78%',
  },
  grabberRow: { alignItems: 'center', paddingTop: 12, paddingBottom: 4 },
  grabber: { width: 36, height: 4, borderRadius: 2 },
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  sheetTitle: { fontSize: 17, fontWeight: '700' },
  sheetCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetEmpty: { textAlign: 'center', paddingVertical: 30, fontSize: 13 },
  sheetDivider: { height: 1, marginHorizontal: 20 },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  sheetRowText: { fontSize: 15, fontWeight: '600' },

  dateWheelWrap: {
    flexDirection: 'row',
    height: 200,
    paddingHorizontal: 20,
    position: 'relative',
  },
  dateHighlight: {
    position: 'absolute',
    left: 20,
    right: 20,
    top: 80,
    height: 40,
    borderRadius: 10,
  },
  dateCell: { height: 40, alignItems: 'center', justifyContent: 'center' },
  dateCellText: { fontSize: 15 },

  confirmBtn: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
