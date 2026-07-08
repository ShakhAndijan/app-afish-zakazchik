import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  FlatList,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import PhoneInput from '../../components/login/PhoneInput';
import PasswordInput from '../../components/login/PasswordInput';
import * as Location from 'expo-location';
import { WebView } from 'react-native-webview';
import {
  requestRegisterOtp,
  getRegisterUploadUrl,
  uploadImageToPresignedUrl,
  verifyRegisterOtp,
} from '../../api/auth';
import { getGenders, getRegions, getDistricts } from '../../api/reference';

const TOTAL_STEPS = 6;

// Step render order: index+1 = step number shown to the user (progress bar, "N-QADAM").
const STEP_ORDER = ['info', 'address', 'gps', 'phone', 'code', 'passport'];
const INFO_STEP = STEP_ORDER.indexOf('info') + 1; // 1
const PHONE_STEP = STEP_ORDER.indexOf('phone') + 1; // 4
const PASSPORT_STEP = STEP_ORDER.indexOf('passport') + 1; // 6
const DONE_STEP = TOTAL_STEPS + 1; // 7

function loadInto(setter, fetcher) {
  setter((s) => ({ ...s, loading: true, error: null }));
  fetcher()
    .then((items) => setter({ items, loading: false, error: null }))
    .catch((e) =>
      setter({
        items: [],
        loading: false,
        error: e.message || "Ma'lumotlarni yuklab bo'lmadi",
      })
    );
}

// ─── ProgressBar ─────────────────────────────────────────────────────────────
function ProgressBar({ step }) {
  return (
    <View style={pr.row}>
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <View
          key={i}
          style={[pr.seg, i + 1 < step && pr.done, i + 1 === step && pr.active]}
        />
      ))}
    </View>
  );
}
const pr = StyleSheet.create({
  row: { flexDirection: 'row', gap: 5, flex: 1 },
  seg: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  done: { backgroundColor: COLORS.success },
  active: { backgroundColor: COLORS.orange },
});

// ─── TopNav ──────────────────────────────────────────────────────────────────
function TopNav({ step, onBack, dimBack }) {
  return (
    <View style={tn.row}>
      <TouchableOpacity
        style={[tn.backBtn, dimBack && { opacity: 0.35 }]}
        onPress={onBack}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={20} color={COLORS.white} />
      </TouchableOpacity>
      <ProgressBar step={step} />
      <Text style={tn.counter}>
        {step}/{TOTAL_STEPS}
      </Text>
    </View>
  );
}
const tn = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counter: {
    fontSize: 12.5,
    color: COLORS.muted,
    fontWeight: '600',
    minWidth: 28,
  },
});

// ─── CtaBtn ──────────────────────────────────────────────────────────────────
function CtaBtn({ label, onPress, disabled, checkIcon, loading }) {
  const blocked = disabled || loading;
  return (
    <TouchableOpacity
      style={[ct.btn, blocked && ct.disabled]}
      onPress={blocked ? undefined : onPress}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <>
          <Text style={[ct.txt, disabled && ct.disabledTxt]}>{label}</Text>
          <Ionicons
            name={checkIcon ? 'checkmark' : 'arrow-forward'}
            size={18}
            color={disabled ? COLORS.faint : '#fff'}
          />
        </>
      )}
    </TouchableOpacity>
  );
}
const ct = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 56,
    borderRadius: 16,
    marginHorizontal: 20,
    backgroundColor: COLORS.orange,
    shadowColor: COLORS.orange,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  disabled: { backgroundColor: '#1e2f42', shadowOpacity: 0, elevation: 0 },
  txt: { color: '#fff', fontSize: 15, fontWeight: '700' },
  disabledTxt: { color: COLORS.faint },
});

// ─── Step 1: Phone ────────────────────────────────────────────────────────────
const formatPhone = (raw) => {
  const d = raw.replace(/\D/g, '').slice(0, 9);
  let out = d.slice(0, 2);
  if (d.length > 2) out += ' ' + d.slice(2, 5);
  if (d.length > 5) out += ' ' + d.slice(5, 7);
  if (d.length > 7) out += ' ' + d.slice(7, 9);
  return out;
};

function StepPhone({ data, set, onNext, loading }) {
  const digits = data.phone.replace(/\D/g, '');
  const ok = digits.length === 9;
  return (
    <View style={sh.flex}>
      <ScrollView
        contentContainerStyle={sh.body}
        keyboardShouldPersistTaps="handled"
      >
        <Image
          source={require('../../../assets/afish-logo-vertical.png')}
          style={{
            width: 220,
            height: 120,
            alignSelf: 'center',
            marginBottom: 20,
          }}
          resizeMode="contain"
        />
        <Text style={[sh.eyebrow, { textAlign: 'center' }]}>4-QADAM</Text>
        <Text style={[sh.h1, { textAlign: 'center' }]}>Telefon raqamingiz</Text>
        <Text style={[sh.sub, { textAlign: 'center' }]}>
          Ro'yxatdan o'tish uchun raqam kiriting. Tasdiqlash kodi yuboriladi.
        </Text>

        <Text style={sh.label}>
          Telefon raqami <Text style={sh.req}>*</Text>
        </Text>
        <PhoneInput
          value={data.phone}
          onChangeText={(v) => set({ phone: v })}
          theme={{ isDark: true }}
          autoFocus
        />

        <View style={sh.note}>
          <MaterialCommunityIcons name="shield-check" size={17} color={COLORS.success} />
          <Text style={sh.noteTxt}>
            Raqamingiz faqat shaxsingizni tasdiqlash uchun ishlatiladi va boshqa maqsadlarda
            ishlatilmaydi.
          </Text>
        </View>
        <View style={sh.note}>
          <Ionicons name="chatbubble-ellipses-outline" size={17} color={COLORS.orange} />
          <Text style={sh.noteTxt}>
            Tasdiqlash kodi SMS orqali bir necha soniya ichida yetib boradi.
          </Text>
        </View>
      </ScrollView>
      <View style={sh.footer}>
        <CtaBtn
          label="SMS kod yuborish"
          onPress={onNext}
          disabled={!ok}
          loading={loading}
        />
      </View>
    </View>
  );
}

// ─── Step 2: OTP ─────────────────────────────────────────────────────────────
function StepCode({ data, set, onNext, devCode, onResend, resendLoading }) {
  const LEN = 6;
  const [digits, setDigits] = useState(Array(LEN).fill(''));
  const [secs, setSecs] = useState(59);
  const refs = useRef([]);

  useEffect(() => {
    const t = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const onCh = (i, v) => {
    const val = v.replace(/\D/g, '').slice(-1);
    const nd = [...digits];
    nd[i] = val;
    setDigits(nd);
    set({ code: nd.join('') });
    if (val && i < LEN - 1) refs.current[i + 1]?.focus();
  };
  const onKey = (i, e) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[i] && i > 0)
      refs.current[i - 1]?.focus();
  };

  const handleResend = async () => {
    setSecs(59);
    setDigits(Array(LEN).fill(''));
    set({ code: '' });
    await onResend();
  };

  const ok = digits.every((d) => d !== '');
  const mm = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');

  return (
    <View style={sh.flex}>
      <ScrollView
        contentContainerStyle={sh.body}
        keyboardShouldPersistTaps="handled"
      >
        <Image
          source={require('../../../assets/afish-logo-vertical.png')}
          style={{
            width: 220,
            height: 120,
            alignSelf: 'center',
            marginBottom: 20,
          }}
          resizeMode="contain"
        />
        <Text style={[sh.eyebrow, { textAlign: 'center' }]}>5-QADAM</Text>
        <Text style={[sh.h1, { textAlign: 'center' }]}>Tasdiqlash kodi</Text>
        <Text style={[sh.sub, { textAlign: 'center' }]}>
          <Text style={{ color: COLORS.white, fontWeight: '700' }}>
            +998 {formatPhone(data.phone) || '90 123 45 67'}
          </Text>{' '}
          raqamiga yuborilgan 6 xonali kodni kiriting.
        </Text>

        <View style={ot.row}>
          {digits.map((d, i) => (
            <TextInput
              key={i}
              ref={(el) => (refs.current[i] = el)}
              style={[ot.box, d && ot.boxFilled]}
              keyboardType="numeric"
              maxLength={1}
              value={d}
              onChangeText={(v) => onCh(i, v)}
              onKeyPress={(e) => onKey(i, e)}
              autoFocus={i === 0}
            />
          ))}
        </View>

        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          {secs > 0 ? (
            <Text style={{ color: COLORS.muted, fontSize: 13.5 }}>
              Qayta yuborish{' '}
              <Text style={{ color: COLORS.orange, fontWeight: '700' }}>
                {mm}:{ss}
              </Text>
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResend} disabled={resendLoading}>
              {resendLoading ? (
                <ActivityIndicator size="small" color={COLORS.orange} />
              ) : (
                <Text
                  style={{
                    color: COLORS.orange,
                    fontSize: 13.5,
                    fontWeight: '600',
                  }}
                >
                  Qayta yuborish
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {!!devCode && (
          <View style={sh.note}>
            <Ionicons
              name="information-circle-outline"
              size={17}
              color={COLORS.muted}
            />
            <Text style={sh.noteTxt}>
              Dev kod:{' '}
              <Text style={{ color: COLORS.orange, fontWeight: '700' }}>
                {devCode}
              </Text>
            </Text>
          </View>
        )}
      </ScrollView>
      <View style={sh.footer}>
        <CtaBtn label="Tasdiqlash" onPress={onNext} disabled={!ok} checkIcon />
      </View>
    </View>
  );
}
const ot = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    marginBottom: 16,
  },
  box: {
    width: 52,
    height: 60,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.inputBg,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.white,
  },
  boxFilled: {
    borderColor: COLORS.orange,
    backgroundColor: 'rgba(232,122,69,0.1)',
  },
});

// ─── Step 3: Passport ─────────────────────────────────────────────────────────
function UploadCard({ uri, onPress, icon, title, desc, uploading }) {
  return (
    <TouchableOpacity
      style={[ul.card, uri && !uploading && ul.cardDone]}
      onPress={uploading ? undefined : onPress}
      activeOpacity={uploading ? 1 : 0.8}
    >
      {uploading ? (
        <View style={ul.inner}>
          {uri && (
            <Image source={{ uri }} style={ul.preview} resizeMode="cover" />
          )}
          <View
            style={[
              ul.overlay,
              !uri && { position: 'relative', backgroundColor: 'transparent' },
            ]}
          >
            <ActivityIndicator size="large" color={COLORS.orange} />
            <Text style={{ color: COLORS.white, fontSize: 12, marginTop: 8 }}>
              Yuklanmoqda...
            </Text>
          </View>
        </View>
      ) : uri ? (
        <View style={ul.inner}>
          <Image source={{ uri }} style={ul.preview} resizeMode="cover" />
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              marginTop: 8,
            }}
          >
            <Ionicons
              name="checkmark-circle"
              size={18}
              color={COLORS.success}
            />
            <Text style={[ul.title, { color: COLORS.success }]}>
              {title} yuklandi
            </Text>
          </View>
          <Text style={ul.desc}>O'zgartirish uchun bosing</Text>
        </View>
      ) : (
        <View style={ul.inner}>
          <View style={ul.iconBox}>
            <MaterialCommunityIcons
              name={icon}
              size={28}
              color={COLORS.orange}
            />
          </View>
          <Text style={ul.title}>{title}</Text>
          <Text style={ul.desc}>{desc}</Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
              marginTop: 4,
            }}
          >
            <Ionicons name="camera-outline" size={13} color={COLORS.faint} />
            <Text style={{ fontSize: 12, color: COLORS.faint }}>
              Rasmga olish yoki yuklash
            </Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}
const ul = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
    padding: 20,
    marginBottom: 12,
    backgroundColor: COLORS.inputBg,
    minHeight: 130,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardDone: {
    borderStyle: 'solid',
    borderColor: COLORS.success,
    backgroundColor: 'rgba(47,163,122,0.08)',
  },
  inner: { alignItems: 'center', gap: 7, alignSelf: 'stretch' },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 15,
    backgroundColor: 'rgba(232,122,69,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 14.5, fontWeight: '700', color: COLORS.white },
  desc: { fontSize: 12, color: COLORS.muted, textAlign: 'center' },
  preview: { width: '100%', height: 120, borderRadius: 10 },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 10,
  },
});

async function pickImage(onPicked) {
  Alert.alert(
    'Rasm tanlang',
    'Qayerdan yuklaysiz?',
    [
      {
        text: 'Galereya',
        onPress: async () => {
          const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!perm.granted) {
            Alert.alert('Ruxsat kerak', 'Galereya uchun ruxsat bering.');
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.8,
            allowsEditing: true,
            aspect: [4, 3],
          });
          if (!result.canceled) {
            const asset = result.assets[0];
            onPicked(asset.uri, asset.mimeType || 'image/jpeg');
          }
        },
      },
      {
        text: 'Kamera',
        onPress: async () => {
          const perm = await ImagePicker.requestCameraPermissionsAsync();
          if (!perm.granted) {
            Alert.alert('Ruxsat kerak', 'Kamera uchun ruxsat bering.');
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            quality: 0.8,
            allowsEditing: true,
            aspect: [4, 3],
          });
          if (!result.canceled) {
            const asset = result.assets[0];
            onPicked(asset.uri, asset.mimeType || 'image/jpeg');
          }
        },
      },
      { text: 'Bekor qilish', style: 'cancel' },
    ],
    { cancelable: true }
  );
}

function StepPassport({ data, set, onNext, onExpire }) {
  const [uploading, setUploading] = useState({ passport: false });
  const [secs, setSecs] = useState(30);

  useEffect(() => {
    const t = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (secs === 0) onExpire();
  }, [secs]);

  const phone = '+998' + data.phone.replace(/\D/g, '');

  const handlePick = (imageField, keyField, uploadKey) => {
    pickImage(async (uri, mimeType) => {
      const contentType = mimeType || 'image/jpeg';
      set({ [imageField]: uri, [keyField]: null });
      setUploading((u) => ({ ...u, [uploadKey]: true }));
      try {
        const { upload_url, temp_key } = await getRegisterUploadUrl(
          phone,
          data.code,
          contentType
        );
        await uploadImageToPresignedUrl(upload_url, uri, contentType);
        set({ [keyField]: temp_key });
      } catch (e) {
        Alert.alert(
          'Xatolik',
          e.message || "Rasm yuklanmadi, qayta urinib ko'ring"
        );
        set({ [imageField]: null, [keyField]: null });
      } finally {
        setUploading((u) => ({ ...u, [uploadKey]: false }));
      }
    });
  };

  const ok = !!data.passport_image_key;
  const mm = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');
  const urgent = secs <= 10;

  return (
    <View style={sh.flex}>
      <ScrollView contentContainerStyle={sh.body}>
        <Text style={[sh.eyebrow, { textAlign: 'center' }]}>6-QADAM</Text>
        <Text style={[sh.h1, { textAlign: 'center' }]}>Shaxsni tasdiqlash</Text>
        <Text style={[sh.sub, { textAlign: 'center', marginBottom: 12 }]}>
          Xavfsizlik uchun pasportingiz rasmini yuklang.
        </Text>

        <View
          style={[
            sh.note,
            { marginTop: 0, marginBottom: 16 },
            urgent && { borderColor: '#e03131' },
          ]}
        >
          <Ionicons
            name="time-outline"
            size={17}
            color={urgent ? '#e03131' : COLORS.orange}
          />
          <Text style={sh.noteTxt}>
            Rasmlarni yuklash uchun{' '}
            <Text
              style={{
                color: urgent ? '#e03131' : COLORS.orange,
                fontWeight: '700',
              }}
            >
              {mm}:{ss}
            </Text>{' '}
            vaqtingiz bor. Vaqt tugasa, ro'yxatdan o'tishni qaytadan
            boshlashingiz kerak bo'ladi.
          </Text>
        </View>

        <UploadCard
          uri={data.passport_image}
          uploading={uploading.passport}
          onPress={() =>
            handlePick('passport_image', 'passport_image_key', 'passport')
          }
          icon="card-account-details-outline"
          title="Pasport rasmi"
          desc="Ma'lumotlar sahifasi, aniq va to'liq"
        />

        <View style={sh.note}>
          <MaterialCommunityIcons
            name="shield-check"
            size={17}
            color={COLORS.success}
          />
          <Text style={sh.noteTxt}>
            Hujjatlar faqat shaxsingizni tasdiqlash uchun ishlatiladi va
            shifrlangan holda saqlanadi.
          </Text>
        </View>
      </ScrollView>
      <View style={sh.footer}>
        <CtaBtn label="Yakunlash" onPress={onNext} disabled={!ok} checkIcon />
      </View>
    </View>
  );
}

const pad2 = (n) => String(n).padStart(2, '0');

const parseBirthDate = (str) => {
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(str || '');
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  const day = Number(dd);
  const month = Number(mm);
  const year = Number(yyyy);
  if (month < 1 || month > 12) return null;
  const d = new Date(year, month - 1, day);
  return Number.isNaN(d.getTime()) ? null : { day, month, year };
};

const daysInMonth = (year, month) => new Date(year, month, 0).getDate();

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

const DATE_ROW_H = 42;

// ─── Birth date field ─────────────────────────────────────────────────────────
function DateColumn({ values, value, onChange, format }) {
  const idx = Math.max(0, values.indexOf(value));
  return (
    <FlatList
      data={values}
      keyExtractor={(v) => String(v)}
      style={{ flex: 1 }}
      showsVerticalScrollIndicator={false}
      initialScrollIndex={idx}
      getItemLayout={(_, i) => ({
        length: DATE_ROW_H,
        offset: DATE_ROW_H * i,
        index: i,
      })}
      renderItem={({ item }) => {
        const selected = item === value;
        return (
          <TouchableOpacity
            style={{
              height: DATE_ROW_H,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={() => onChange(item)}
            activeOpacity={0.7}
          >
            <Text
              style={{
                fontSize: 14.5,
                fontWeight: selected ? '700' : '400',
                color: selected ? COLORS.orange : COLORS.muted,
              }}
            >
              {format ? format(item) : item}
            </Text>
          </TouchableOpacity>
        );
      }}
    />
  );
}

function BirthDateField({ value, onChange }) {
  const [show, setShow] = useState(false);
  const currentYear = new Date().getFullYear();
  const parsed = parseBirthDate(value);
  const [day, setDay] = useState(parsed?.day ?? 1);
  const [month, setMonth] = useState(parsed?.month ?? 1);
  const [year, setYear] = useState(parsed?.year ?? currentYear - 18);

  const maxDay = daysInMonth(year, month);
  const days = Array.from({ length: maxDay }, (_, i) => i + 1);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from(
    { length: currentYear - 1940 + 1 },
    (_, i) => currentYear - i
  );

  const open = () => {
    const p = parseBirthDate(value);
    setDay(p?.day ?? 1);
    setMonth(p?.month ?? 1);
    setYear(p?.year ?? currentYear - 18);
    setShow(true);
  };

  const changeMonth = (m) => {
    setMonth(m);
    if (day > daysInMonth(year, m)) setDay(daysInMonth(year, m));
  };
  const changeYear = (y) => {
    setYear(y);
    if (day > daysInMonth(y, month)) setDay(daysInMonth(y, month));
  };

  const confirm = () => {
    onChange(`${pad2(day)}.${pad2(month)}.${year}`);
    setShow(false);
  };

  return (
    <>
      <TouchableOpacity
        style={[sh.control, value && sh.controlFilled]}
        onPress={open}
        activeOpacity={0.8}
      >
        <Ionicons name="calendar-outline" size={19} color={COLORS.faint} />
        <Text
          style={{
            fontSize: 15,
            color: value ? COLORS.white : COLORS.faint,
            fontWeight: value ? '500' : '400',
          }}
        >
          {value || 'KK.OO.YYYY'}
        </Text>
      </TouchableOpacity>

      <Modal
        transparent
        visible={show}
        animationType="slide"
        onRequestClose={() => setShow(false)}
      >
        <TouchableOpacity
          style={pk.overlay}
          activeOpacity={1}
          onPress={() => setShow(false)}
        >
          <TouchableOpacity style={pk.sheet} activeOpacity={1}>
            <View style={pk.header}>
              <Text style={pk.title}>Tug'ilgan sanani tanlang</Text>
              <TouchableOpacity
                onPress={() => setShow(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={22} color={COLORS.muted} />
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', height: DATE_ROW_H * 5 }}>
              <DateColumn
                values={days}
                value={day}
                onChange={setDay}
                format={pad2}
              />
              <DateColumn
                values={months}
                value={month}
                onChange={changeMonth}
                format={(m) => MONTH_NAMES_UZ[m - 1]}
              />
              <DateColumn values={years} value={year} onChange={changeYear} />
            </View>
            <View style={{ padding: 16 }}>
              <CtaBtn label="Tayyor" onPress={confirm} checkIcon />
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PASSWORD_RULES = [
  { key: 'length', label: 'Kamida 8 ta belgi', test: (pw) => pw.length >= 8 },
  {
    key: 'upper',
    label: '1 ta katta harf (A-Z)',
    test: (pw) => /[A-Z]/.test(pw),
  },
  {
    key: 'lower',
    label: '1 ta kichik harf (a-z)',
    test: (pw) => /[a-z]/.test(pw),
  },
  { key: 'digit', label: '1 ta raqam (0-9)', test: (pw) => /\d/.test(pw) },
  {
    key: 'special',
    label: '1 ta maxsus belgi (!@#$%)',
    test: (pw) => /[^A-Za-z0-9]/.test(pw),
  },
];

function PasswordRules({ password }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
        marginBottom: 13,
      }}
    >
      {PASSWORD_RULES.map((rule) => {
        const passed = rule.test(password);
        return (
          <View
            key={rule.key}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 7,
              width: '50%',
              marginBottom: 6,
              paddingRight: 6,
            }}
          >
            <Ionicons
              name={passed ? 'checkmark-circle' : 'ellipse-outline'}
              size={15}
              color={passed ? COLORS.success : COLORS.faint}
            />
            <Text
              style={{
                fontSize: 12,
                color: passed ? COLORS.success : COLORS.muted,
                fontWeight: passed ? '600' : '400',
                flexShrink: 1,
              }}
            >
              {rule.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// ─── Step 4: Personal info ────────────────────────────────────────────────────
function StepInfo({ data, set, onNext, genders }) {
  const genderRequired = !genders.error && genders.items.length > 0;
  const passwordOk = PASSWORD_RULES.every((rule) => rule.test(data.password));
  const emailOk = EMAIL_REGEX.test(data.email.trim());
  const ok =
    data.first_name.trim() &&
    data.last_name.trim() &&
    emailOk &&
    data.birth_date &&
    passwordOk &&
    (!genderRequired || data.gender_id);
  return (
    <View style={sh.flex}>
      <ScrollView
        contentContainerStyle={sh.body}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[sh.eyebrow, { textAlign: 'center' }]}>1-QADAM</Text>
        <Text style={[sh.h1, { textAlign: 'center' }]}>
          Shaxsiy ma'lumotlar
        </Text>
        <Text style={[sh.sub, { textAlign: 'center' }]}>
          Pasportingizdagi ma'lumotlarga mos ravishda to'ldiring.
        </Text>

        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 13 }}>
          <View style={{ flex: 1 }}>
            <Text style={sh.label}>
              Ism <Text style={sh.req}>*</Text>
            </Text>
            <View style={[sh.control, data.first_name && sh.controlFilled]}>
              <TextInput
                style={sh.input}
                placeholder="Ism"
                placeholderTextColor={COLORS.faint}
                value={data.first_name}
                onChangeText={(v) => set({ first_name: v })}
              />
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={sh.label}>
              Familiya <Text style={sh.req}>*</Text>
            </Text>
            <View style={[sh.control, data.last_name && sh.controlFilled]}>
              <TextInput
                style={sh.input}
                placeholder="Familiya"
                placeholderTextColor={COLORS.faint}
                value={data.last_name}
                onChangeText={(v) => set({ last_name: v })}
              />
            </View>
          </View>
        </View>

        <Text style={sh.label}>
          Email <Text style={sh.req}>*</Text>
        </Text>
        <View
          style={[
            sh.control,
            data.email && sh.controlFilled,
            data.email && !emailOk && { borderColor: '#e0473a' },
          ]}
        >
          <Ionicons name="mail-outline" size={19} color={COLORS.faint} />
          <TextInput
            style={sh.input}
            placeholder="email@misol.uz"
            placeholderTextColor={COLORS.faint}
            keyboardType="email-address"
            autoCapitalize="none"
            value={data.email}
            onChangeText={(v) => set({ email: v })}
          />
        </View>
        <Text
          style={{
            fontSize: 11.5,
            marginTop: 6,
            color: '#e0473a',
            opacity: data.email.length > 0 && !emailOk ? 1 : 0,
          }}
        >
          Email manzili noto'g'ri, masalan: email@misol.uz
        </Text>

        <Text style={sh.label}>
          Parol <Text style={sh.req}>*</Text>
        </Text>
        <PasswordInput
          value={data.password}
          onChangeText={(v) => set({ password: v })}
          theme={{ isDark: true }}
          placeholder="Parol yarating"
        />
        <PasswordRules password={data.password} />

        <Text style={sh.label}>
          Jinsi {genderRequired && <Text style={sh.req}>*</Text>}
        </Text>
        <GenderRadioGroup
          genders={genders}
          value={data.gender_id}
          onChange={(item) =>
            set({ gender_id: item.id, gender_name: item.name })
          }
        />

        <Text style={sh.label}>
          Tug'ilgan sana <Text style={sh.req}>*</Text>
        </Text>
        <BirthDateField
          value={data.birth_date}
          onChange={(v) => set({ birth_date: v })}
        />

        <View style={sh.note}>
          <MaterialCommunityIcons
            name="shield-check"
            size={17}
            color={COLORS.success}
          />
          <Text style={sh.noteTxt}>
            Ma'lumotlaringiz xavfsiz saqlanadi va uchinchi shaxslarga
            berilmaydi.
          </Text>
        </View>
      </ScrollView>

      <View style={sh.footer}>
        <CtaBtn label="Davom etish" onPress={onNext} disabled={!ok} />
      </View>
    </View>
  );
}

// ─── Gender radio group ───────────────────────────────────────────────────────
function GenderRadioGroup({ genders, value, onChange }) {
  if (genders.loading) {
    return (
      <View style={[gr.wrap, { justifyContent: 'center' }]}>
        <ActivityIndicator size="small" color={COLORS.orange} />
      </View>
    );
  }
  if (genders.error || genders.items.length === 0) {
    return null;
  }
  return (
    <View style={gr.wrap}>
      {genders.items.map((item) => {
        const selected = value === item.id;
        return (
          <TouchableOpacity
            key={item.id}
            style={[gr.option, selected && gr.optionSelected]}
            onPress={() => onChange(item)}
            activeOpacity={0.8}
          >
            <Text style={[gr.optionTxt, selected && gr.optionTxtSelected]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
const gr = StyleSheet.create({
  wrap: { flexDirection: 'row', gap: 10, marginBottom: 13 },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingHorizontal: 15,
  },
  optionSelected: {
    borderColor: COLORS.orange,
    backgroundColor: 'rgba(232,122,69,0.28)',
  },
  optionTxt: { fontSize: 14.5, fontWeight: '500', color: COLORS.faint },
  optionTxtSelected: { color: COLORS.white, fontWeight: '700' },
});

// ─── Picker modal ─────────────────────────────────────────────────────────────
function PickerModal({
  visible,
  items,
  onSelect,
  onClose,
  title,
  loading,
  error,
}) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={pk.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={pk.sheet} activeOpacity={1}>
          <View style={pk.header}>
            <Text style={pk.title}>{title}</Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={22} color={COLORS.muted} />
            </TouchableOpacity>
          </View>
          {loading ? (
            <View style={{ padding: 30, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={COLORS.orange} />
            </View>
          ) : error ? (
            <View style={{ padding: 24, alignItems: 'center' }}>
              <Text
                style={{
                  color: COLORS.muted,
                  fontSize: 13,
                  textAlign: 'center',
                }}
              >
                {error}
              </Text>
            </View>
          ) : (
            <FlatList
              data={items}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={pk.item}
                  onPress={() => {
                    onSelect(item);
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={pk.itemTxt}>{item.name}</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={COLORS.faint}
                  />
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text
                  style={{
                    color: COLORS.muted,
                    textAlign: 'center',
                    padding: 24,
                  }}
                >
                  Ma'lumot topilmadi
                </Text>
              }
            />
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
const pk = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.card,
    maxHeight: '70%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: { color: COLORS.white, fontWeight: '700', fontSize: 16 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  itemTxt: { color: COLORS.white, fontSize: 14.5 },
});

// ─── Expired modal ─────────────────────────────────────────────────────────────
function ExpiredModal({ visible, onClose }) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={ex.overlay}>
        <View style={ex.card}>
          <View style={ex.ring}>
            <View style={ex.badge}>
              <Ionicons name="alarm-outline" size={30} color="#fff" />
            </View>
          </View>
          <Text style={ex.title}>Vaqt tugadi</Text>
          <Text style={ex.desc}>
            Rasm yuklash uchun berilgan tasdiqlash kodi vaqti tugadi.{'\n'}
            Ro'yxatdan o'tishni qaytadan boshlang.
          </Text>
          <TouchableOpacity
            style={ex.btn}
            onPress={onClose}
            activeOpacity={0.85}
          >
            <Text style={ex.btnTxt}>Qaytadan boshlash</Text>
            <Ionicons name="refresh" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
const ex = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: COLORS.card,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingTop: 28,
    paddingBottom: 22,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
  },
  ring: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(224,49,49,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  badge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e03131',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#e03131',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  desc: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    alignSelf: 'stretch',
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.orange,
    shadowColor: COLORS.orange,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  btnTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
});

// ─── OTP error modal ─────────────────────────────────────────────────────────
function OtpErrorModal({ message, onClose }) {
  return (
    <Modal
      transparent
      visible={!!message}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={oe.overlay}>
        <View style={oe.card}>
          <View style={oe.ring}>
            <View style={oe.badge}>
              <Ionicons name="hourglass-outline" size={30} color="#fff" />
            </View>
          </View>
          <Text style={oe.title}>Biroz kuting</Text>
          <Text style={oe.desc}>{message}</Text>
          <TouchableOpacity
            style={oe.btn}
            onPress={onClose}
            activeOpacity={0.85}
          >
            <Text style={oe.btnTxt}>Tushunarli</Text>
            <Ionicons name="checkmark" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
const oe = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: COLORS.card,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingTop: 28,
    paddingBottom: 22,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
  },
  ring: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(232,122,69,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  badge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.orange,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.orange,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  desc: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    alignSelf: 'stretch',
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.orange,
    shadowColor: COLORS.orange,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  btnTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
});

// ─── Register error modal ────────────────────────────────────────────────────
function RegisterErrorModal({ message, onClose }) {
  return (
    <Modal
      transparent
      visible={!!message}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={ex.overlay}>
        <View style={ex.card}>
          <View style={ex.ring}>
            <View style={ex.badge}>
              <Ionicons name="alert-circle-outline" size={30} color="#fff" />
            </View>
          </View>
          <Text style={ex.title}>Xatolik yuz berdi</Text>
          <Text style={ex.desc}>{message}</Text>
          <TouchableOpacity
            style={ex.btn}
            onPress={onClose}
            activeOpacity={0.85}
          >
            <Text style={ex.btnTxt}>Qayta urinib ko'rish</Text>
            <Ionicons name="refresh" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Step 5: Address ──────────────────────────────────────────────────────────
function StepAddress({ data, set, onNext, regions, districts }) {
  const [showRegion, setShowRegion] = useState(false);
  const [showDistrict, setShowDistrict] = useState(false);
  const regionRequired = !regions.error && regions.items.length > 0;
  const districtRequired =
    !!data.region_id && !districts.error && districts.items.length > 0;
  const ok =
    (!regionRequired || data.region_id) &&
    (!districtRequired || data.district_id) &&
    data.address.trim();

  return (
    <View style={sh.flex}>
      <ScrollView
        contentContainerStyle={sh.body}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[sh.eyebrow, { textAlign: 'center' }]}>2-QADAM</Text>
        <Text style={[sh.h1, { textAlign: 'center' }]}>Manzilingiz</Text>
        <Text style={[sh.sub, { textAlign: 'center' }]}>
          Ustalar xizmat ko'rsatadigan asosiy manzilni kiriting.
        </Text>

        <Text style={sh.label}>
          Viloyat / shahar {regionRequired && <Text style={sh.req}>*</Text>}
        </Text>
        <TouchableOpacity
          style={[
            sh.control,
            { justifyContent: 'space-between' },
            data.region_id && sh.controlFilled,
            { marginBottom: 13 },
          ]}
          onPress={() => setShowRegion(true)}
          activeOpacity={0.8}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Feather name="map-pin" size={18} color={COLORS.faint} />
            <Text
              style={{
                fontSize: 15,
                color: data.region_name ? COLORS.white : COLORS.faint,
                fontWeight: data.region_name ? '500' : '400',
              }}
            >
              {data.region_name || 'Tanlang'}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={18} color={COLORS.faint} />
        </TouchableOpacity>

        <Text style={sh.label}>
          Tuman {districtRequired && <Text style={sh.req}>*</Text>}
        </Text>
        <TouchableOpacity
          style={[
            sh.control,
            {
              justifyContent: 'space-between',
              opacity: data.region_id ? 1 : 0.4,
            },
            data.district_id && sh.controlFilled,
            { marginBottom: 13 },
          ]}
          onPress={data.region_id ? () => setShowDistrict(true) : undefined}
          activeOpacity={0.8}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Feather name="map" size={18} color={COLORS.faint} />
            <Text
              style={{
                fontSize: 15,
                color: data.district_name ? COLORS.white : COLORS.faint,
                fontWeight: data.district_name ? '500' : '400',
              }}
            >
              {data.district_name ||
                (data.region_id ? 'Tuman tanlang' : 'Avval viloyat tanlang')}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={18} color={COLORS.faint} />
        </TouchableOpacity>

        <Text style={sh.label}>
          To'liq manzil <Text style={sh.req}>*</Text>
        </Text>
        <View
          style={[
            sh.control,
            { height: 80, alignItems: 'flex-start', paddingTop: 12 },
            data.address && sh.controlFilled,
          ]}
        >
          <TextInput
            style={[sh.input, { flex: 1 }]}
            placeholder="Ko'cha, uy, kvartira raqami"
            placeholderTextColor={COLORS.faint}
            multiline
            value={data.address}
            onChangeText={(v) => set({ address: v })}
          />
        </View>
      </ScrollView>

      <PickerModal
        visible={showRegion}
        items={regions.items}
        loading={regions.loading}
        error={regions.error}
        onSelect={(item) =>
          set({
            region_id: item.id,
            region_name: item.name,
            district_id: null,
            district_name: '',
          })
        }
        onClose={() => setShowRegion(false)}
        title="Viloyat tanlang"
      />
      <PickerModal
        visible={showDistrict}
        items={districts.items}
        loading={districts.loading}
        error={districts.error}
        onSelect={(item) =>
          set({ district_id: item.id, district_name: item.name })
        }
        onClose={() => setShowDistrict(false)}
        title="Tuman tanlang"
      />

      <View style={sh.footer}>
        <CtaBtn label="Davom etish" onPress={onNext} disabled={!ok} />
      </View>
    </View>
  );
}

const buildMapHtml = (initLat, initLng) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    #map { width:100vw; height:100vh; }
  </style>
</head>
<body>
<div id="map"></div>
<script>
  var map = L.map('map', { zoomControl:true }).setView([41.2995, 69.2401], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
  }).addTo(map);

  var marker = null;
  ${
    initLat && initLng
      ? `
  marker = L.marker([${initLat}, ${initLng}]).addTo(map);
  map.setView([${initLat}, ${initLng}], 15);
  `
      : ''
  }

  map.on('click', function(e) {
    if (marker) { marker.setLatLng(e.latlng); }
    else { marker = L.marker(e.latlng).addTo(map); }
    window.ReactNativeWebView.postMessage(JSON.stringify({
      lat: e.latlng.lat.toFixed(6),
      lng: e.latlng.lng.toFixed(6)
    }));
  });

  function goTo(lat, lng) {
    var ll = L.latLng(lat, lng);
    if (marker) { marker.setLatLng(ll); }
    else { marker = L.marker(ll).addTo(map); }
    map.setView(ll, 16);
    window.ReactNativeWebView.postMessage(JSON.stringify({
      lat: lat.toFixed(6), lng: lng.toFixed(6)
    }));
  }
</script>
</body>
</html>`;

// ─── Step 6: GPS ─────────────────────────────────────────────────────────────
function StepGps({ data, set, onNext }) {
  const webRef = useRef(null);
  const [locating, setLocating] = useState(false);

  const locate = async () => {
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
      const { latitude, longitude } = pos.coords;
      webRef.current?.injectJavaScript(
        `goTo(${latitude}, ${longitude}); true;`
      );
    } catch {
      Alert.alert(
        'Xato',
        "Joylashuvni aniqlab bo'lmadi. Qayta urinib ko'ring."
      );
    } finally {
      setLocating(false);
    }
  };

  const onMessage = (e) => {
    try {
      const { lat, lng } = JSON.parse(e.nativeEvent.data);
      set({ default_gps_lat: lat, default_gps_lng: lng });
    } catch {}
  };

  return (
    <View style={sh.flex}>
      <ScrollView
        contentContainerStyle={sh.body}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={true}
      >
        <Text style={[sh.eyebrow, { textAlign: 'center' }]}>3-QADAM</Text>
        <Text style={[sh.h1, { textAlign: 'center' }]}>
          Joylashuvni belgilang
        </Text>
        <Text style={[sh.sub, { textAlign: 'center' }]}>
          Xaritadan nuqtani bosing yoki joriy joylashuvdan foydalaning.
        </Text>

        <View style={gp.mapWrap}>
          <WebView
            ref={webRef}
            style={gp.map}
            source={{
              html: buildMapHtml(data.default_gps_lat, data.default_gps_lng),
            }}
            onMessage={onMessage}
            javaScriptEnabled
            originWhitelist={['*']}
            scrollEnabled={false}
          />

          <TouchableOpacity
            style={gp.locateBtn}
            onPress={locate}
            activeOpacity={0.85}
            disabled={locating}
          >
            {locating ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="navigate" size={15} color="#fff" />
            )}
            <Text style={gp.locateTxt}>
              {locating ? 'Aniqlanmoqda...' : 'Joriy joylashuv'}
            </Text>
          </TouchableOpacity>

          {!data.default_gps_lat && (
            <View style={gp.hintWrap} pointerEvents="none">
              <Text style={gp.tapHint}>
                Xaritaga bosib joylashuvni belgilang
              </Text>
            </View>
          )}
        </View>

        <Text style={[sh.label, { marginTop: 4 }]}>Mo'ljal</Text>
        <View style={[sh.control, data.default_landmark && sh.controlFilled]}>
          <Feather name="flag" size={18} color={COLORS.faint} />
          <TextInput
            style={sh.input}
            placeholder="Masalan: Mega Planet ro'parasida"
            placeholderTextColor={COLORS.faint}
            value={data.default_landmark}
            onChangeText={(v) => set({ default_landmark: v })}
          />
        </View>
      </ScrollView>
      <View style={sh.footer}>
        <CtaBtn label="Davom etish" onPress={onNext} />
      </View>
    </View>
  );
}
const gp = StyleSheet.create({
  mapWrap: {
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 14,
    height: 280,
    position: 'relative',
  },
  map: { flex: 1 },
  hintWrap: {
    position: 'absolute',
    bottom: 52,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  tapHint: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    color: '#fff',
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    overflow: 'hidden',
  },
  locateBtn: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.orange,
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 12,
    elevation: 4,
  },
  locateTxt: { color: '#fff', fontSize: 12.5, fontWeight: '600' },
});

// ─── Done ────────────────────────────────────────────────────────────────────
function StepDone({ data, onFinish, onEdit, submitting }) {
  const rows = [
    {
      icon: 'person-outline',
      label: 'Foydalanuvchi',
      value: `${data.first_name} ${data.last_name}${
        data.gender_name ? ' · ' + data.gender_name : ''
      }`,
    },
    { icon: 'call-outline', label: 'Telefon', value: `+998 ${data.phone}` },
    {
      icon: 'location-outline',
      label: 'Manzil',
      value: `${data.region_name || '—'}, ${data.district_name || '—'}`,
    },
    {
      icon: 'shield-checkmark-outline',
      label: 'Tasdiqlash',
      value: 'Pasport rasmi yuklandi',
    },
  ];
  return (
    <ScrollView contentContainerStyle={[sh.body, { alignItems: 'center' }]}>
      <View style={dn.ring}>
        <View style={dn.badge}>
          <Ionicons name="checkmark" size={36} color="#fff" />
        </View>
      </View>
      <Text style={dn.h}>Ro'yxatdan o'tdingiz!</Text>
      <Text style={dn.p}>
        Tabriklaymiz,{' '}
        <Text style={{ color: COLORS.white, fontWeight: '700' }}>
          {data.first_name || 'foydalanuvchi'}
        </Text>
        !{'\n'}
        Hisobingiz tekshiruvga yuborildi va tez orada faollashtiriladi.
      </Text>

      <View style={dn.summary}>
        {rows.map(({ icon, label, value }, i) => (
          <View
            key={label}
            style={[dn.row, i === rows.length - 1 && { borderBottomWidth: 0 }]}
          >
            <View style={dn.iconBox}>
              <Ionicons name={icon} size={19} color={COLORS.orange} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={dn.rowLbl}>{label}</Text>
              <Text style={dn.rowVal}>{value}</Text>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[
          ct.btn,
          { width: '100%', marginHorizontal: 0 },
          submitting && ct.disabled,
        ]}
        onPress={submitting ? undefined : onFinish}
        activeOpacity={0.85}
      >
        {submitting ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Text style={ct.txt}>Ilovaga kirish</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={dn.editBtn}
        onPress={submitting ? undefined : onEdit}
        activeOpacity={0.7}
        disabled={submitting}
      >
        <Ionicons name="create-outline" size={17} color={COLORS.orange} />
        <Text style={dn.editTxt}>Ma'lumotlarni tahrirlash</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
const dn = StyleSheet.create({
  ring: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(47,163,122,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  badge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 18,
    elevation: 10,
  },
  h: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  p: {
    color: COLORS.muted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
  },
  summary: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: 'rgba(232,122,69,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLbl: { fontSize: 11.5, color: COLORS.muted, marginBottom: 2 },
  rowVal: { fontSize: 13.5, fontWeight: '600', color: COLORS.white },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginTop: 14,
    paddingVertical: 10,
  },
  editTxt: { color: COLORS.orange, fontSize: 13.5, fontWeight: '600' },
});

// ─── Shared styles ────────────────────────────────────────────────────────────
const sh = StyleSheet.create({
  flex: { flex: 1 },
  body: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 },
  eyebrow: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.orange,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  h1: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  sub: { fontSize: 14, color: COLORS.muted, lineHeight: 21, marginBottom: 20 },
  label: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.muted,
    marginBottom: 6,
  },
  req: { color: COLORS.orange },
  control: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingHorizontal: 15,
    gap: 10,
  },
  controlFilled: { borderColor: 'rgba(232,122,69,0.5)' },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.white,
    fontWeight: '500',
    padding: 0,
  },
  prefix: { fontSize: 18, fontWeight: '700', color: COLORS.white },
  sep: { width: 1, height: 22, backgroundColor: COLORS.border },
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 16,
    backgroundColor: COLORS.card,
    padding: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  noteTxt: { fontSize: 12.5, color: COLORS.muted, flex: 1, lineHeight: 18 },
  footer: { paddingBottom: 16, paddingTop: 8 },
});

// ─── Main component ───────────────────────────────────────────────────────────
export default function RegisterStep({ onBack, onDone }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [devCode, setDevCode] = useState('');
  const [showExpired, setShowExpired] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [finishError, setFinishError] = useState('');
  const [editing, setEditing] = useState(false);

  const [genders, setGenders] = useState({
    items: [],
    loading: true,
    error: null,
  });
  const [regions, setRegions] = useState({
    items: [],
    loading: true,
    error: null,
  });
  const [districts, setDistricts] = useState({
    items: [],
    loading: false,
    error: null,
  });

  useEffect(() => {
    loadInto(setGenders, getGenders);
    loadInto(setRegions, getRegions);
  }, []);

  const [data, setData] = useState({
    phone: '',
    code: '',
    passport_image: null,
    passport_image_key: null,
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    gender_id: null,
    gender_name: '',
    birth_date: '',
    region_id: null,
    region_name: '',
    district_id: null,
    district_name: '',
    address: '',
    default_gps_lat: '',
    default_gps_lng: '',
    default_landmark: '',
  });
  const set = (patch) => setData((d) => ({ ...d, ...patch }));

  useEffect(() => {
    if (!data.region_id) {
      setDistricts({ items: [], loading: false, error: null });
      return;
    }
    loadInto(setDistricts, () => getDistricts(data.region_id));
  }, [data.region_id]);

  const sendOtp = async () => {
    const phone = '+998' + data.phone.replace(/\D/g, '');
    setLoading(true);
    try {
      const res = await requestRegisterOtp(phone);
      if (res.dev_code) setDevCode(res.dev_code);
      setStep((s) => s + 1);
    } catch (e) {
      setOtpError(e.message || 'OTP yuborishda muammo yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const next = () => setStep((s) => s + 1);
  const back = () => {
    if (step === 1) {
      if (editing) {
        setEditing(false);
        setStep(DONE_STEP);
      } else {
        onBack();
      }
    } else if (step === PASSPORT_STEP) {
      setStep(PHONE_STEP);
    } else {
      setStep((s) => s - 1);
    }
  };
  const editFromDone = () => {
    setEditing(true);
    setStep(INFO_STEP);
  };
  const afterGps = () => {
    if (editing) {
      setEditing(false);
      setStep(DONE_STEP);
    } else {
      next();
    }
  };

  const handlePassportExpire = () => {
    set({
      code: '',
      passport_image: null,
      passport_image_key: null,
    });
    setDevCode('');
    setStep(PHONE_STEP);
    setShowExpired(true);
  };

  const finish = async () => {
    const phone = '+998' + data.phone.replace(/\D/g, '');
    const [day, month, year] = data.birth_date.split('.');
    setLoading(true);
    try {
      await verifyRegisterOtp({
        phone,
        code: data.code,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        birth_date: `${year}-${month}-${day}`,
        address: data.address,
        verification_temp_key: data.passport_image_key,
        gender_id: data.gender_id,
        region_id: data.region_id,
        district_id: data.district_id,
        password: data.password,
        default_gps_lat: data.default_gps_lat
          ? parseFloat(data.default_gps_lat)
          : 0,
        default_gps_lng: data.default_gps_lng
          ? parseFloat(data.default_gps_lng)
          : 0,
        default_landmark: data.default_landmark,
      });
      onDone();
    } catch (e) {
      setFinishError(
        e.message || "Ro'yxatdan o'tishni yakunlashda muammo yuz berdi"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: COLORS.bg }}
      edges={['top', 'left', 'right']}
    >
      {step <= TOTAL_STEPS && (
        <TopNav step={step} onBack={back} dimBack={step === 1 && !editing} />
      )}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        keyboardVerticalOffset={Platform.OS === 'android' ? 0 : 0}
      >
        {step === INFO_STEP && (
          <StepInfo data={data} set={set} onNext={next} genders={genders} />
        )}
        {STEP_ORDER[step - 1] === 'address' && (
          <StepAddress
            data={data}
            set={set}
            onNext={next}
            regions={regions}
            districts={districts}
          />
        )}
        {STEP_ORDER[step - 1] === 'gps' && (
          <StepGps data={data} set={set} onNext={afterGps} />
        )}
        {step === PHONE_STEP && (
          <StepPhone data={data} set={set} onNext={sendOtp} loading={loading} />
        )}
        {STEP_ORDER[step - 1] === 'code' && (
          <StepCode
            data={data}
            set={set}
            onNext={next}
            devCode={devCode}
            onResend={sendOtp}
            resendLoading={loading}
          />
        )}
        {step === PASSPORT_STEP && (
          <StepPassport
            data={data}
            set={set}
            onNext={next}
            onExpire={handlePassportExpire}
          />
        )}
        {step === DONE_STEP && (
          <StepDone
            data={data}
            onFinish={finish}
            onEdit={editFromDone}
            submitting={loading}
          />
        )}
      </KeyboardAvoidingView>
      <ExpiredModal
        visible={showExpired}
        onClose={() => setShowExpired(false)}
      />
      <OtpErrorModal message={otpError} onClose={() => setOtpError('')} />
      <RegisterErrorModal
        message={finishError}
        onClose={() => setFinishError('')}
      />
    </SafeAreaView>
  );
}
