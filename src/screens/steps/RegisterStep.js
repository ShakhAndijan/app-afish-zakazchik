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
import { useLanguage } from '../../context/LanguageContext';
import PhoneInput from '../../components/login/PhoneInput';
import PasswordInput from '../../components/login/PasswordInput';
import LocationMapPicker from '../../components/LocationMapPicker';
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

function loadInto(setter, fetcher, fallbackError) {
  setter((s) => ({ ...s, loading: true, error: null }));
  fetcher()
    .then((items) => setter({ items, loading: false, error: null }))
    .catch((e) =>
      setter({
        items: [],
        loading: false,
        error: e.message || fallbackError,
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
  const { t } = useLanguage();
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
        <Text style={[sh.eyebrow, { textAlign: 'center' }]}>{t('login.registerStep.stepLabel', { n: PHONE_STEP })}</Text>
        <Text style={[sh.h1, { textAlign: 'center' }]}>{t('login.registerStep.phone.title')}</Text>
        <Text style={[sh.sub, { textAlign: 'center' }]}>
          {t('login.registerStep.phone.subtitle')}
        </Text>

        <Text style={sh.label}>
          {t('login.phoneStep.phoneLabel')} <Text style={sh.req}>*</Text>
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
            {t('login.registerStep.phone.note1')}
          </Text>
        </View>
        <View style={sh.note}>
          <Ionicons name="chatbubble-ellipses-outline" size={17} color={COLORS.orange} />
          <Text style={sh.noteTxt}>
            {t('login.registerStep.phone.note2')}
          </Text>
        </View>
      </ScrollView>
      <View style={sh.footer}>
        <CtaBtn
          label={t('login.registerStep.phone.cta')}
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
  const { t } = useLanguage();
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
        <Text style={[sh.eyebrow, { textAlign: 'center' }]}>{t('login.registerStep.stepLabel', { n: PHONE_STEP + 1 })}</Text>
        <Text style={[sh.h1, { textAlign: 'center' }]}>{t('login.codeStep.title')}</Text>
        <Text style={[sh.sub, { textAlign: 'center' }]}>
          <Text style={{ color: COLORS.white, fontWeight: '700' }}>
            +998 {formatPhone(data.phone) || '90 123 45 67'}
          </Text>{' '}
          {t('login.codeStep.subtitle')}
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
              {t('login.codeStep.resendIn')}{' '}
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
                  {t('login.codeStep.resendNow')}
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
              {t('login.codeStep.devCode')}{' '}
              <Text style={{ color: COLORS.orange, fontWeight: '700' }}>
                {devCode}
              </Text>
            </Text>
          </View>
        )}
      </ScrollView>
      <View style={sh.footer}>
        <CtaBtn label={t('common.confirm')} onPress={onNext} disabled={!ok} checkIcon />
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
  const { t } = useLanguage();
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
              {t('common.loading')}
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
              {t('login.registerStep.upload.uploadedSuffix', { title })}
            </Text>
          </View>
          <Text style={ul.desc}>{t('login.registerStep.upload.changeHint')}</Text>
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
              {t('login.registerStep.upload.pickHint')}
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

async function pickImage(onPicked, t) {
  Alert.alert(
    t('login.registerStep.pickImage.title'),
    t('login.registerStep.pickImage.message'),
    [
      {
        text: t('login.registerStep.pickImage.gallery'),
        onPress: async () => {
          const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!perm.granted) {
            Alert.alert(t('login.registerStep.pickImage.permissionTitle'), t('login.registerStep.pickImage.galleryPermission'));
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
        text: t('login.registerStep.pickImage.camera'),
        onPress: async () => {
          const perm = await ImagePicker.requestCameraPermissionsAsync();
          if (!perm.granted) {
            Alert.alert(t('login.registerStep.pickImage.permissionTitle'), t('login.registerStep.pickImage.cameraPermission'));
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
      { text: t('common.cancel'), style: 'cancel' },
    ],
    { cancelable: true }
  );
}

function StepPassport({ data, set, onNext, onExpire }) {
  const { t } = useLanguage();
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
          t('common.errorTitle'),
          e.message || t('login.registerStep.errors.uploadFailed')
        );
        set({ [imageField]: null, [keyField]: null });
      } finally {
        setUploading((u) => ({ ...u, [uploadKey]: false }));
      }
    }, t);
  };

  const ok = !!data.passport_image_key;
  const mm = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');
  const urgent = secs <= 10;

  return (
    <View style={sh.flex}>
      <ScrollView contentContainerStyle={sh.body}>
        <Text style={[sh.eyebrow, { textAlign: 'center' }]}>{t('login.registerStep.stepLabel', { n: PASSPORT_STEP })}</Text>
        <Text style={[sh.h1, { textAlign: 'center' }]}>{t('login.registerStep.passport.title')}</Text>
        <Text style={[sh.sub, { textAlign: 'center', marginBottom: 12 }]}>
          {t('login.registerStep.passport.subtitle')}
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
            {t('login.registerStep.passport.timerPrefix')}{' '}
            <Text
              style={{
                color: urgent ? '#e03131' : COLORS.orange,
                fontWeight: '700',
              }}
            >
              {mm}:{ss}
            </Text>{' '}
            {t('login.registerStep.passport.timerSuffix')}
          </Text>
        </View>

        <UploadCard
          uri={data.passport_image}
          uploading={uploading.passport}
          onPress={() =>
            handlePick('passport_image', 'passport_image_key', 'passport')
          }
          icon="card-account-details-outline"
          title={t('login.registerStep.passport.uploadTitle')}
          desc={t('login.registerStep.passport.uploadDesc')}
        />

        <View style={sh.note}>
          <MaterialCommunityIcons
            name="shield-check"
            size={17}
            color={COLORS.success}
          />
          <Text style={sh.noteTxt}>
            {t('login.registerStep.passport.note')}
          </Text>
        </View>
      </ScrollView>
      <View style={sh.footer}>
        <CtaBtn label={t('login.registerStep.passport.cta')} onPress={onNext} disabled={!ok} checkIcon />
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
  const { t } = useLanguage();
  const monthNames = t('login.registerStep.birthDate.months');
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
          {value || t('login.registerStep.birthDate.placeholder')}
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
              <Text style={pk.title}>{t('login.registerStep.birthDate.modalTitle')}</Text>
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
                format={(m) => monthNames[m - 1]}
              />
              <DateColumn values={years} value={year} onChange={changeYear} />
            </View>
            <View style={{ padding: 16 }}>
              <CtaBtn label={t('login.registerStep.birthDate.confirm')} onPress={confirm} checkIcon />
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PASSWORD_RULES = [
  { key: 'length', test: (pw) => pw.length >= 8 },
  { key: 'upper', test: (pw) => /[A-Z]/.test(pw) },
  { key: 'lower', test: (pw) => /[a-z]/.test(pw) },
  { key: 'digit', test: (pw) => /\d/.test(pw) },
  { key: 'special', test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

function PasswordRules({ password }) {
  const { t } = useLanguage();
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
              {t(`login.newPasswordStep.rules.${rule.key}`)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// ─── Step 4: Personal info ────────────────────────────────────────────────────
function StepInfo({ data, set, onNext, genders }) {
  const { t } = useLanguage();
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
        <Text style={[sh.eyebrow, { textAlign: 'center' }]}>{t('login.registerStep.stepLabel', { n: INFO_STEP })}</Text>
        <Text style={[sh.h1, { textAlign: 'center' }]}>
          {t('login.registerStep.info.title')}
        </Text>
        <Text style={[sh.sub, { textAlign: 'center' }]}>
          {t('login.registerStep.info.subtitle')}
        </Text>

        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 13 }}>
          <View style={{ flex: 1 }}>
            <Text style={sh.label}>
              {t('login.registerStep.info.firstName')} <Text style={sh.req}>*</Text>
            </Text>
            <View style={[sh.control, data.first_name && sh.controlFilled]}>
              <TextInput
                style={sh.input}
                placeholder={t('login.registerStep.info.firstName')}
                placeholderTextColor={COLORS.faint}
                value={data.first_name}
                onChangeText={(v) => set({ first_name: v })}
              />
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={sh.label}>
              {t('login.registerStep.info.lastName')} <Text style={sh.req}>*</Text>
            </Text>
            <View style={[sh.control, data.last_name && sh.controlFilled]}>
              <TextInput
                style={sh.input}
                placeholder={t('login.registerStep.info.lastName')}
                placeholderTextColor={COLORS.faint}
                value={data.last_name}
                onChangeText={(v) => set({ last_name: v })}
              />
            </View>
          </View>
        </View>

        <Text style={sh.label}>
          {t('login.registerStep.info.email')} <Text style={sh.req}>*</Text>
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
            placeholder={t('login.registerStep.info.emailPlaceholder')}
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
          {t('login.registerStep.info.emailInvalid')}
        </Text>

        <Text style={sh.label}>
          {t('login.registerStep.info.password')} <Text style={sh.req}>*</Text>
        </Text>
        <PasswordInput
          value={data.password}
          onChangeText={(v) => set({ password: v })}
          theme={{ isDark: true }}
          placeholder={t('login.registerStep.info.passwordPlaceholder')}
        />
        <PasswordRules password={data.password} />

        <Text style={sh.label}>
          {t('login.registerStep.info.gender')} {genderRequired && <Text style={sh.req}>*</Text>}
        </Text>
        <GenderRadioGroup
          genders={genders}
          value={data.gender_id}
          onChange={(item) =>
            set({ gender_id: item.id, gender_name: item.name })
          }
        />

        <Text style={sh.label}>
          {t('login.registerStep.info.birthDate')} <Text style={sh.req}>*</Text>
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
            {t('login.registerStep.info.note')}
          </Text>
        </View>
      </ScrollView>

      <View style={sh.footer}>
        <CtaBtn label={t('login.registerStep.info.cta')} onPress={onNext} disabled={!ok} />
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
  const { t } = useLanguage();
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
                  {t('login.registerStep.picker.empty')}
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
  const { t } = useLanguage();
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
          <Text style={ex.title}>{t('login.registerStep.expiredModal.title')}</Text>
          <Text style={ex.desc}>
            {t('login.registerStep.expiredModal.desc')}
          </Text>
          <TouchableOpacity
            style={ex.btn}
            onPress={onClose}
            activeOpacity={0.85}
          >
            <Text style={ex.btnTxt}>{t('login.registerStep.expiredModal.btn')}</Text>
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
  const { t } = useLanguage();
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
          <Text style={oe.title}>{t('login.registerStep.otpErrorModal.title')}</Text>
          <Text style={oe.desc}>{message}</Text>
          <TouchableOpacity
            style={oe.btn}
            onPress={onClose}
            activeOpacity={0.85}
          >
            <Text style={oe.btnTxt}>{t('login.registerStep.otpErrorModal.btn')}</Text>
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
  const { t } = useLanguage();
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
          <Text style={ex.title}>{t('login.registerStep.registerErrorModal.title')}</Text>
          <Text style={ex.desc}>{message}</Text>
          <TouchableOpacity
            style={ex.btn}
            onPress={onClose}
            activeOpacity={0.85}
          >
            <Text style={ex.btnTxt}>{t('login.registerStep.registerErrorModal.btn')}</Text>
            <Ionicons name="refresh" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Step 5: Address ──────────────────────────────────────────────────────────
function StepAddress({ data, set, onNext, regions, districts }) {
  const { t } = useLanguage();
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
        <Text style={[sh.eyebrow, { textAlign: 'center' }]}>{t('login.registerStep.stepLabel', { n: 2 })}</Text>
        <Text style={[sh.h1, { textAlign: 'center' }]}>{t('login.registerStep.address.title')}</Text>
        <Text style={[sh.sub, { textAlign: 'center' }]}>
          {t('login.registerStep.address.subtitle')}
        </Text>

        <Text style={sh.label}>
          {t('login.registerStep.address.region')} {regionRequired && <Text style={sh.req}>*</Text>}
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
              {data.region_name || t('login.registerStep.address.selectPlaceholder')}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={18} color={COLORS.faint} />
        </TouchableOpacity>

        <Text style={sh.label}>
          {t('login.registerStep.address.district')} {districtRequired && <Text style={sh.req}>*</Text>}
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
                (data.region_id
                  ? t('login.registerStep.address.selectDistrict')
                  : t('login.registerStep.address.selectRegionFirst'))}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={18} color={COLORS.faint} />
        </TouchableOpacity>

        <Text style={sh.label}>
          {t('login.registerStep.address.fullAddress')} <Text style={sh.req}>*</Text>
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
            placeholder={t('login.registerStep.address.addressPlaceholder')}
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
        title={t('login.registerStep.address.pickRegionTitle')}
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
        title={t('login.registerStep.address.pickDistrictTitle')}
      />

      <View style={sh.footer}>
        <CtaBtn label={t('login.registerStep.address.cta')} onPress={onNext} disabled={!ok} />
      </View>
    </View>
  );
}

// ─── Step 6: GPS ─────────────────────────────────────────────────────────────
function StepGps({ data, set, onNext }) {
  const { t } = useLanguage();

  return (
    <View style={sh.flex}>
      <ScrollView
        contentContainerStyle={sh.body}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={true}
      >
        <Text style={[sh.eyebrow, { textAlign: 'center' }]}>{t('login.registerStep.stepLabel', { n: 3 })}</Text>
        <Text style={[sh.h1, { textAlign: 'center' }]}>
          {t('login.registerStep.gps.title')}
        </Text>
        <Text style={[sh.sub, { textAlign: 'center' }]}>
          {t('login.registerStep.gps.subtitle')}
        </Text>

        <View style={gp.mapWrap}>
          <LocationMapPicker
            lat={data.default_gps_lat}
            lng={data.default_gps_lng}
            onChange={(lat, lng) => set({ default_gps_lat: lat, default_gps_lng: lng })}
            height={280}
            locateLabel={t('login.registerStep.gps.currentLocation')}
            locatingLabel={t('login.registerStep.gps.locating')}
            tapHint={t('login.registerStep.gps.tapHint')}
            showTapHint
            permissionTitle={t('login.registerStep.pickImage.permissionTitle')}
            permissionMessage={t('login.registerStep.gps.locationPermission')}
            errorTitle={t('common.errorTitle')}
            errorMessage={t('login.registerStep.gps.locationError')}
          />
        </View>

        <Text style={[sh.label, { marginTop: 4 }]}>{t('login.registerStep.gps.landmark')}</Text>
        <View style={[sh.control, data.default_landmark && sh.controlFilled]}>
          <Feather name="flag" size={18} color={COLORS.faint} />
          <TextInput
            style={sh.input}
            placeholder={t('login.registerStep.gps.landmarkPlaceholder')}
            placeholderTextColor={COLORS.faint}
            value={data.default_landmark}
            onChangeText={(v) => set({ default_landmark: v })}
          />
        </View>
      </ScrollView>
      <View style={sh.footer}>
        <CtaBtn label={t('login.registerStep.gps.cta')} onPress={onNext} />
      </View>
    </View>
  );
}
const gp = StyleSheet.create({
  mapWrap: {
    marginBottom: 14,
  },
});

// ─── Done ────────────────────────────────────────────────────────────────────
function StepDone({ data, onFinish, onEdit, submitting }) {
  const { t } = useLanguage();
  const rows = [
    {
      icon: 'person-outline',
      label: t('login.registerStep.done.userLabel'),
      value: `${data.first_name} ${data.last_name}${
        data.gender_name ? ' · ' + data.gender_name : ''
      }`,
    },
    { icon: 'call-outline', label: t('login.registerStep.done.phoneLabel'), value: `+998 ${data.phone}` },
    {
      icon: 'location-outline',
      label: t('login.registerStep.done.addressLabel'),
      value: `${data.region_name || '—'}, ${data.district_name || '—'}`,
    },
    {
      icon: 'shield-checkmark-outline',
      label: t('login.registerStep.done.verificationLabel'),
      value: t('login.registerStep.done.verificationValue'),
    },
  ];
  return (
    <ScrollView contentContainerStyle={[sh.body, { alignItems: 'center' }]}>
      <View style={dn.ring}>
        <View style={dn.badge}>
          <Ionicons name="checkmark" size={36} color="#fff" />
        </View>
      </View>
      <Text style={dn.h}>{t('login.registerStep.done.title')}</Text>
      <Text style={dn.p}>
        {t('login.registerStep.done.congrats')}{' '}
        <Text style={{ color: COLORS.white, fontWeight: '700' }}>
          {data.first_name || t('login.registerStep.done.defaultName')}
        </Text>
        !{'\n'}
        {t('login.registerStep.done.congratsSuffix')}
      </Text>

      <View style={dn.summary}>
        {rows.map(({ icon, label, value }, i) => (
          <View
            key={icon}
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
            <Text style={ct.txt}>{t('login.registerStep.done.cta')}</Text>
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
        <Text style={dn.editTxt}>{t('login.registerStep.done.editBtn')}</Text>
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
  const { t } = useLanguage();
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
    loadInto(setGenders, getGenders, t('login.registerStep.errors.loadFailed'));
    loadInto(setRegions, getRegions, t('login.registerStep.errors.loadFailed'));
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
    loadInto(setDistricts, () => getDistricts(data.region_id), t('login.registerStep.errors.loadFailed'));
  }, [data.region_id]);

  const sendOtp = async () => {
    const phone = '+998' + data.phone.replace(/\D/g, '');
    setLoading(true);
    try {
      const res = await requestRegisterOtp(phone);
      if (res.dev_code) setDevCode(res.dev_code);
      setStep((s) => s + 1);
    } catch (e) {
      setOtpError(e.message || t('login.registerStep.errors.otpSendFailed'));
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
        e.message || t('login.registerStep.errors.finishFailed')
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
