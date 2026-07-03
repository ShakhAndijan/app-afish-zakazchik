import { useState, useRef, useEffect } from "react";
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
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { COLORS } from "../../constants/colors";
import PhoneInput from "../../components/login/PhoneInput";
import * as Location from "expo-location";
import { WebView } from "react-native-webview";
import { requestRegisterOtp, getRegisterUploadUrl, uploadImageToPresignedUrl } from "../../api/auth";

const REGIONS = {
  "Toshkent shahri": [
    "Chilonzor",
    "Yunusobod",
    "Mirzo Ulug'bek",
    "Yakkasaroy",
    "Shayxontohur",
    "Olmazor",
    "Sergeli",
    "Yashnobod",
    "Mirobod",
    "Uchtepa",
    "Bektemir",
  ],
  "Toshkent viloyati": [
    "Nurafshon",
    "Angren",
    "Bekobod",
    "Chirchiq",
    "Olmaliq",
    "Ohangaron",
    "Yangiyo'l",
  ],
  Samarqand: ["Samarqand sh.", "Kattaqo'rg'on", "Urgut", "Bulung'ur", "Jomboy"],
  Buxoro: ["Buxoro sh.", "Kogon", "G'ijduvon", "Vobkent", "Romitan"],
  Andijon: ["Andijon sh.", "Asaka", "Xonobod", "Shahrixon"],
  "Farg'ona": ["Farg'ona sh.", "Marg'ilon", "Qo'qon", "Quvasoy"],
  Namangan: ["Namangan sh.", "Chust", "Pop", "To'raqo'rg'on"],
  Xorazm: ["Urganch", "Xiva", "Shovot", "Hazorasp"],
  Qashqadaryo: ["Qarshi", "Shahrisabz", "Kitob", "G'uzor"],
  Surxondaryo: ["Termiz", "Denov", "Sho'rchi", "Sariosiyo"],
  Navoiy: ["Navoiy sh.", "Zarafshon", "Nurota", "Konimex"],
  Jizzax: ["Jizzax sh.", "G'allaorol", "Zomin", "Paxtakor"],
  Sirdaryo: ["Guliston", "Sirdaryo", "Yangiyer", "Boyovut"],
  "Qoraqalpog'iston": ["Nukus", "Xo'jayli", "Chimboy", "Beruniy"],
};

const TOTAL_STEPS = 6;

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
  row: { flexDirection: "row", gap: 5, flex: 1 },
  seg: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  done: { backgroundColor: COLORS.success },
  active: { backgroundColor: COLORS.orange },
});

// ─── TopNav ──────────────────────────────────────────────────────────────────
function TopNav({ step, onBack }) {
  return (
    <View style={tn.row}>
      <TouchableOpacity
        style={[tn.backBtn, step === 1 && { opacity: 0.35 }]}
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
    flexDirection: "row",
    alignItems: "center",
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
    alignItems: "center",
    justifyContent: "center",
  },
  counter: {
    fontSize: 12.5,
    color: COLORS.muted,
    fontWeight: "600",
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
            name={checkIcon ? "checkmark" : "arrow-forward"}
            size={18}
            color={disabled ? COLORS.faint : "#fff"}
          />
        </>
      )}
    </TouchableOpacity>
  );
}
const ct = StyleSheet.create({
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
  disabled: { backgroundColor: "#1e2f42", shadowOpacity: 0, elevation: 0 },
  txt: { color: "#fff", fontSize: 15, fontWeight: "700" },
  disabledTxt: { color: COLORS.faint },
});

// ─── Step 1: Phone ────────────────────────────────────────────────────────────
const formatPhone = (raw) => {
  const d = raw.replace(/\D/g, "").slice(0, 9);
  let out = d.slice(0, 2);
  if (d.length > 2) out += " " + d.slice(2, 5);
  if (d.length > 5) out += " " + d.slice(5, 7);
  if (d.length > 7) out += " " + d.slice(7, 9);
  return out;
};

function StepPhone({ data, set, onNext, loading }) {
  const digits = data.phone.replace(/\D/g, "");
  const ok = digits.length === 9;
  return (
    <View style={sh.flex}>
      <ScrollView
        contentContainerStyle={sh.body}
        keyboardShouldPersistTaps="handled"
      >
        <Image
          source={require("../../../assets/afish-logo-vertical.png")}
          style={{ width: 220, height: 120, alignSelf: "center", marginBottom: 20 }}
          resizeMode="contain"
        />
        <Text style={[sh.eyebrow, { textAlign: "center" }]}>1-QADAM</Text>
        <Text style={[sh.h1, { textAlign: "center" }]}>Telefon raqamingiz</Text>
        <Text style={[sh.sub, { textAlign: "center" }]}>
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
        <CtaBtn label="SMS kod yuborish" onPress={onNext} disabled={!ok} loading={loading} />
      </View>
    </View>
  );
}

// ─── Step 2: OTP ─────────────────────────────────────────────────────────────
function StepCode({ data, set, onNext, devCode, onResend, resendLoading }) {
  const LEN = 6;
  const [digits, setDigits] = useState(Array(LEN).fill(""));
  const [secs, setSecs] = useState(59);
  const refs = useRef([]);

  useEffect(() => {
    const t = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const onCh = (i, v) => {
    const val = v.replace(/\D/g, "").slice(-1);
    const nd = [...digits];
    nd[i] = val;
    setDigits(nd);
    set({ code: nd.join("") });
    if (val && i < LEN - 1) refs.current[i + 1]?.focus();
  };
  const onKey = (i, e) => {
    if (e.nativeEvent.key === "Backspace" && !digits[i] && i > 0)
      refs.current[i - 1]?.focus();
  };

  const handleResend = async () => {
    setSecs(59);
    setDigits(Array(LEN).fill(""));
    set({ code: "" });
    await onResend();
  };

  const ok = digits.every((d) => d !== "");
  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");

  return (
    <View style={sh.flex}>
      <ScrollView
        contentContainerStyle={sh.body}
        keyboardShouldPersistTaps="handled"
      >
        <Image
          source={require("../../../assets/afish-logo-vertical.png")}
          style={{ width: 220, height: 120, alignSelf: "center", marginBottom: 20 }}
          resizeMode="contain"
        />
        <Text style={[sh.eyebrow, { textAlign: "center" }]}>2-QADAM</Text>
        <Text style={[sh.h1, { textAlign: "center" }]}>Tasdiqlash kodi</Text>
        <Text style={[sh.sub, { textAlign: "center" }]}>
          <Text style={{ color: COLORS.white, fontWeight: "700" }}>
            +998 {formatPhone(data.phone) || "90 123 45 67"}
          </Text>{" "}
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

        <View style={{ alignItems: "center", marginBottom: 16 }}>
          {secs > 0 ? (
            <Text style={{ color: COLORS.muted, fontSize: 13.5 }}>
              Qayta yuborish{" "}
              <Text style={{ color: COLORS.orange, fontWeight: "700" }}>
                {mm}:{ss}
              </Text>
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResend} disabled={resendLoading}>
              {resendLoading ? (
                <ActivityIndicator size="small" color={COLORS.orange} />
              ) : (
                <Text style={{ color: COLORS.orange, fontSize: 13.5, fontWeight: "600" }}>
                  Qayta yuborish
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {!!devCode && (
          <View style={sh.note}>
            <Ionicons name="information-circle-outline" size={17} color={COLORS.muted} />
            <Text style={sh.noteTxt}>
              Dev kod:{" "}
              <Text style={{ color: COLORS.orange, fontWeight: "700" }}>{devCode}</Text>
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
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    marginBottom: 16,
  },
  box: {
    width: 52,
    height: 60,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.inputBg,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.white,
  },
  boxFilled: {
    borderColor: COLORS.orange,
    backgroundColor: "rgba(232,122,69,0.1)",
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
          {uri && <Image source={{ uri }} style={ul.preview} resizeMode="cover" />}
          <View style={[ul.overlay, !uri && { position: "relative", backgroundColor: "transparent" }]}>
            <ActivityIndicator size="large" color={COLORS.orange} />
            <Text style={{ color: COLORS.white, fontSize: 12, marginTop: 8 }}>
              Yuklanmoqda...
            </Text>
          </View>
        </View>
      ) : uri ? (
        <View style={ul.inner}>
          <Image source={{ uri }} style={ul.preview} resizeMode="cover" />
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 }}>
            <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
            <Text style={[ul.title, { color: COLORS.success }]}>{title} yuklandi</Text>
          </View>
          <Text style={ul.desc}>O'zgartirish uchun bosing</Text>
        </View>
      ) : (
        <View style={ul.inner}>
          <View style={ul.iconBox}>
            <MaterialCommunityIcons name={icon} size={28} color={COLORS.orange} />
          </View>
          <Text style={ul.title}>{title}</Text>
          <Text style={ul.desc}>{desc}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginTop: 4 }}>
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
    borderStyle: "dashed",
    borderColor: COLORS.border,
    padding: 20,
    marginBottom: 12,
    backgroundColor: COLORS.inputBg,
    minHeight: 130,
    alignItems: "center",
    justifyContent: "center",
  },
  cardDone: {
    borderStyle: "solid",
    borderColor: COLORS.success,
    backgroundColor: "rgba(47,163,122,0.08)",
  },
  inner: { alignItems: "center", gap: 7, alignSelf: "stretch" },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 15,
    backgroundColor: "rgba(232,122,69,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 14.5, fontWeight: "700", color: COLORS.white },
  desc: { fontSize: 12, color: COLORS.muted, textAlign: "center" },
  preview: { width: "100%", height: 120, borderRadius: 10 },
  overlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 10,
  },
});

async function pickImage(onPicked) {
  Alert.alert(
    "Rasm tanlang",
    "Qayerdan yuklaysiz?",
    [
      {
        text: "Galereya",
        onPress: async () => {
          const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!perm.granted) {
            Alert.alert("Ruxsat kerak", "Galereya uchun ruxsat bering.");
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            quality: 0.8,
            allowsEditing: true,
            aspect: [4, 3],
          });
          if (!result.canceled) {
            const asset = result.assets[0];
            onPicked(asset.uri, asset.mimeType || "image/jpeg");
          }
        },
      },
      {
        text: "Kamera",
        onPress: async () => {
          const perm = await ImagePicker.requestCameraPermissionsAsync();
          if (!perm.granted) {
            Alert.alert("Ruxsat kerak", "Kamera uchun ruxsat bering.");
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            quality: 0.8,
            allowsEditing: true,
            aspect: [4, 3],
          });
          if (!result.canceled) {
            const asset = result.assets[0];
            onPicked(asset.uri, asset.mimeType || "image/jpeg");
          }
        },
      },
      { text: "Bekor qilish", style: "cancel" },
    ],
    { cancelable: true }
  );
}

function StepPassport({ data, set, onNext }) {
  const [uploading, setUploading] = useState({ passport: false, selfie: false });

  const phone = "+998" + data.phone.replace(/\D/g, "");

  const handlePick = (imageField, keyField, uploadKey) => {
    pickImage(async (uri, mimeType) => {
      const contentType = mimeType || "image/jpeg";
      set({ [imageField]: uri, [keyField]: null });
      setUploading((u) => ({ ...u, [uploadKey]: true }));
      try {
        const { upload_url, temp_key } = await getRegisterUploadUrl(phone, data.code, contentType);
        await uploadImageToPresignedUrl(upload_url, uri, contentType);
        set({ [keyField]: temp_key });
      } catch (e) {
        Alert.alert("Xatolik", e.message || "Rasm yuklanmadi, qayta urinib ko'ring");
        set({ [imageField]: null, [keyField]: null });
      } finally {
        setUploading((u) => ({ ...u, [uploadKey]: false }));
      }
    });
  };

  const ok = !!data.passport_image_key && !!data.passport_selfie_key;

  return (
    <View style={sh.flex}>
      <ScrollView contentContainerStyle={sh.body}>
        <Text style={[sh.eyebrow, { textAlign: "center" }]}>3-QADAM</Text>
        <Text style={[sh.h1, { textAlign: "center" }]}>Shaxsni tasdiqlash</Text>
        <Text style={[sh.sub, { textAlign: "center" }]}>
          Xavfsizlik uchun pasportingiz rasmini va u bilan birga selfi yuklang.
        </Text>

        <UploadCard
          uri={data.passport_image}
          uploading={uploading.passport}
          onPress={() => handlePick("passport_image", "passport_image_key", "passport")}
          icon="card-account-details-outline"
          title="Pasport rasmi"
          desc="Ma'lumotlar sahifasi, aniq va to'liq"
        />
        <UploadCard
          uri={data.passport_selfie}
          uploading={uploading.selfie}
          onPress={() => handlePick("passport_selfie", "passport_selfie_key", "selfie")}
          icon="face-recognition"
          title="Pasport bilan selfi"
          desc="Yuzingiz va pasport bir kadrda"
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
        <CtaBtn label="Davom etish" onPress={onNext} disabled={!ok} />
      </View>
    </View>
  );
}

const formatBirthDate = (raw) => {
  const d = raw.replace(/\D/g, "").slice(0, 8);
  let out = d.slice(0, 2);
  if (d.length > 2) out += "." + d.slice(2, 4);
  if (d.length > 4) out += "." + d.slice(4, 8);
  return out;
};

// ─── Step 4: Personal info ────────────────────────────────────────────────────
function StepInfo({ data, set, onNext }) {
  const ok =
    data.first_name.trim() &&
    data.last_name.trim() &&
    data.birth_date &&
    data.gender;
  return (
    <View style={sh.flex}>
      <ScrollView
        contentContainerStyle={sh.body}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[sh.eyebrow, { textAlign: "center" }]}>4-QADAM</Text>
        <Text style={[sh.h1, { textAlign: "center" }]}>Shaxsiy ma'lumotlar</Text>
        <Text style={[sh.sub, { textAlign: "center" }]}>
          Pasportingizdagi ma'lumotlarga mos ravishda to'ldiring.
        </Text>

        <View style={{ flexDirection: "row", gap: 10, marginBottom: 13 }}>
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

        <Text style={sh.label}>Email</Text>
        <View
          style={[
            sh.control,
            data.email && sh.controlFilled,
            { marginBottom: 13 },
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

        <Text style={sh.label}>
          Jinsi <Text style={sh.req}>*</Text>
        </Text>
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 13 }}>
          {[
            ["male", "Erkak", "man-outline"],
            ["female", "Ayol", "woman-outline"],
          ].map(([val, lbl, ic]) => (
            <TouchableOpacity
              key={val}
              style={[gn.btn, data.gender === val && gn.active]}
              onPress={() => set({ gender: val })}
              activeOpacity={0.8}
            >
              <Ionicons
                name={ic}
                size={18}
                color={data.gender === val ? "#fff" : COLORS.muted}
              />
              <Text style={[gn.txt, data.gender === val && { color: "#fff" }]}>
                {lbl}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={sh.label}>
          Tug'ilgan sana <Text style={sh.req}>*</Text>
        </Text>
        <View style={[sh.control, data.birth_date && sh.controlFilled]}>
          <Ionicons name="calendar-outline" size={19} color={COLORS.faint} />
          <TextInput
            style={sh.input}
            placeholder="KK.OO.YYYY (mas: 15.06.1995)"
            placeholderTextColor={COLORS.faint}
            keyboardType="numeric"
            value={data.birth_date}
            onChangeText={(v) => set({ birth_date: formatBirthDate(v) })}
          />
        </View>
      </ScrollView>
      <View style={sh.footer}>
        <CtaBtn label="Davom etish" onPress={onNext} disabled={!ok} />
      </View>
    </View>
  );
}
const gn = StyleSheet.create({
  btn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  active: { backgroundColor: COLORS.orange, borderColor: COLORS.orange },
  txt: { fontSize: 14, fontWeight: "600", color: COLORS.muted },
});

// ─── Picker modal ─────────────────────────────────────────────────────────────
function PickerModal({ visible, items, onSelect, onClose, title }) {
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
          <FlatList
            data={items}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={pk.item}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
                activeOpacity={0.7}
              >
                <Text style={pk.itemTxt}>{item}</Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={COLORS.faint}
                />
              </TouchableOpacity>
            )}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
const pk = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: COLORS.card,
    maxHeight: "70%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: { color: COLORS.white, fontWeight: "700", fontSize: 16 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  itemTxt: { color: COLORS.white, fontSize: 14.5 },
});

// ─── Step 5: Address ──────────────────────────────────────────────────────────
function StepAddress({ data, set, onNext }) {
  const [showRegion, setShowRegion] = useState(false);
  const [showDistrict, setShowDistrict] = useState(false);
  const districts = data.region ? REGIONS[data.region] || [] : [];
  const ok = data.region && data.district && data.address.trim();

  return (
    <View style={sh.flex}>
      <ScrollView
        contentContainerStyle={sh.body}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[sh.eyebrow, { textAlign: "center" }]}>5-QADAM</Text>
        <Text style={[sh.h1, { textAlign: "center" }]}>Manzilingiz</Text>
        <Text style={[sh.sub, { textAlign: "center" }]}>
          Ustalar xizmat ko'rsatadigan asosiy manzilni kiriting.
        </Text>

        <Text style={sh.label}>
          Viloyat / shahar <Text style={sh.req}>*</Text>
        </Text>
        <TouchableOpacity
          style={[
            sh.control,
            { justifyContent: "space-between" },
            data.region && sh.controlFilled,
            { marginBottom: 13 },
          ]}
          onPress={() => setShowRegion(true)}
          activeOpacity={0.8}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Feather name="map-pin" size={18} color={COLORS.faint} />
            <Text
              style={{
                fontSize: 15,
                color: data.region ? COLORS.white : COLORS.faint,
                fontWeight: data.region ? "500" : "400",
              }}
            >
              {data.region || "Tanlang"}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={18} color={COLORS.faint} />
        </TouchableOpacity>

        <Text style={sh.label}>
          Tuman <Text style={sh.req}>*</Text>
        </Text>
        <TouchableOpacity
          style={[
            sh.control,
            { justifyContent: "space-between", opacity: data.region ? 1 : 0.4 },
            data.district && sh.controlFilled,
            { marginBottom: 13 },
          ]}
          onPress={data.region ? () => setShowDistrict(true) : undefined}
          activeOpacity={0.8}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Feather name="map" size={18} color={COLORS.faint} />
            <Text
              style={{
                fontSize: 15,
                color: data.district ? COLORS.white : COLORS.faint,
                fontWeight: data.district ? "500" : "400",
              }}
            >
              {data.district ||
                (data.region ? "Tuman tanlang" : "Avval viloyat tanlang")}
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
            { height: 80, alignItems: "flex-start", paddingTop: 12 },
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
        items={Object.keys(REGIONS)}
        onSelect={(v) => set({ region: v, district: "" })}
        onClose={() => setShowRegion(false)}
        title="Viloyat tanlang"
      />
      <PickerModal
        visible={showDistrict}
        items={districts}
        onSelect={(v) => set({ district: v })}
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
  ${initLat && initLng ? `
  marker = L.marker([${initLat}, ${initLng}]).addTo(map);
  map.setView([${initLat}, ${initLng}], 15);
  ` : ''}

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
      if (status !== "granted") {
        Alert.alert("Ruxsat kerak", "Joylashuv uchun ruxsat bering.");
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude, longitude } = pos.coords;
      webRef.current?.injectJavaScript(`goTo(${latitude}, ${longitude}); true;`);
    } catch {
      Alert.alert("Xato", "Joylashuvni aniqlab bo'lmadi. Qayta urinib ko'ring.");
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

  const ok = !!data.default_gps_lat;

  return (
    <View style={sh.flex}>
      <ScrollView
        contentContainerStyle={sh.body}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={true}
      >
        <Text style={[sh.eyebrow, { textAlign: "center" }]}>6-QADAM</Text>
        <Text style={[sh.h1, { textAlign: "center" }]}>Joylashuvni belgilang</Text>
        <Text style={[sh.sub, { textAlign: "center" }]}>
          Xaritadan nuqtani bosing yoki joriy joylashuvdan foydalaning.
        </Text>

        <View style={gp.mapWrap}>
          <WebView
            ref={webRef}
            style={gp.map}
            source={{ html: buildMapHtml(data.default_gps_lat, data.default_gps_lng) }}
            onMessage={onMessage}
            javaScriptEnabled
            originWhitelist={["*"]}
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
              {locating ? "Aniqlanmoqda..." : "Joriy joylashuv"}
            </Text>
          </TouchableOpacity>

          {!ok && (
            <View style={gp.hintWrap} pointerEvents="none">
              <Text style={gp.tapHint}>Xaritaga bosib joylashuvni belgilang</Text>
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
        <CtaBtn
          label="Ro'yxatni yakunlash"
          onPress={onNext}
          disabled={!ok}
          checkIcon
        />
      </View>
    </View>
  );
}
const gp = StyleSheet.create({
  mapWrap: {
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 14,
    height: 280,
    position: "relative",
  },
  map: { flex: 1 },
  hintWrap: {
    position: "absolute",
    bottom: 52,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  tapHint: {
    backgroundColor: "rgba(0,0,0,0.5)",
    color: "#fff",
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    overflow: "hidden",
  },
  locateBtn: {
    position: "absolute",
    bottom: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: COLORS.orange,
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 12,
    elevation: 4,
  },
  locateTxt: { color: "#fff", fontSize: 12.5, fontWeight: "600" },
});

// ─── Done ────────────────────────────────────────────────────────────────────
function StepDone({ data, onFinish }) {
  const genderLabel =
    data.gender === "male" ? "Erkak" : data.gender === "female" ? "Ayol" : "—";
  const rows = [
    {
      icon: "person-outline",
      label: "Foydalanuvchi",
      value: `${data.first_name} ${data.last_name} · ${genderLabel}`,
    },
    { icon: "call-outline", label: "Telefon", value: `+998 ${data.phone}` },
    {
      icon: "location-outline",
      label: "Manzil",
      value: `${data.region}, ${data.district}`,
    },
    {
      icon: "shield-checkmark-outline",
      label: "Tasdiqlash",
      value: "Pasport + selfi yuklandi",
    },
  ];
  return (
    <ScrollView contentContainerStyle={[sh.body, { alignItems: "center" }]}>
      <View style={dn.ring}>
        <View style={dn.badge}>
          <Ionicons name="checkmark" size={36} color="#fff" />
        </View>
      </View>
      <Text style={dn.h}>Ro'yxatdan o'tdingiz!</Text>
      <Text style={dn.p}>
        Tabriklaymiz,{" "}
        <Text style={{ color: COLORS.white, fontWeight: "700" }}>
          {data.first_name || "foydalanuvchi"}
        </Text>
        !{"\n"}
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
        style={[ct.btn, { width: "100%", marginHorizontal: 0 }]}
        onPress={onFinish}
        activeOpacity={0.85}
      >
        <Text style={ct.txt}>Ilovaga kirish</Text>
        <Ionicons name="arrow-forward" size={18} color="#fff" />
      </TouchableOpacity>
    </ScrollView>
  );
}
const dn = StyleSheet.create({
  ring: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(47,163,122,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    marginBottom: 16,
  },
  badge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.success,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 18,
    elevation: 10,
  },
  h: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },
  p: {
    color: COLORS.muted,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 24,
  },
  summary: {
    width: "100%",
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "rgba(232,122,69,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  rowLbl: { fontSize: 11.5, color: COLORS.muted, marginBottom: 2 },
  rowVal: { fontSize: 13.5, fontWeight: "600", color: COLORS.white },
});

// ─── Shared styles ────────────────────────────────────────────────────────────
const sh = StyleSheet.create({
  flex: { flex: 1 },
  body: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 },
  eyebrow: {
    fontSize: 11.5,
    fontWeight: "700",
    color: COLORS.orange,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  h1: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.white,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  sub: { fontSize: 14, color: COLORS.muted, lineHeight: 21, marginBottom: 20 },
  label: {
    fontSize: 12.5,
    fontWeight: "600",
    color: COLORS.muted,
    marginBottom: 8,
  },
  req: { color: COLORS.orange },
  control: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingHorizontal: 15,
    gap: 10,
  },
  controlFilled: { borderColor: "rgba(232,122,69,0.5)" },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.white,
    fontWeight: "500",
    padding: 0,
  },
  prefix: { fontSize: 18, fontWeight: "700", color: COLORS.white },
  sep: { width: 1, height: 22, backgroundColor: COLORS.border },
  note: {
    flexDirection: "row",
    alignItems: "flex-start",
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
  const [devCode, setDevCode] = useState("");
  const [data, setData] = useState({
    phone: "",
    code: "",
    passport_image: null,
    passport_image_key: null,
    passport_selfie: null,
    passport_selfie_key: null,
    first_name: "",
    last_name: "",
    email: "",
    gender: "",
    birth_date: "",
    region: "",
    district: "",
    address: "",
    default_gps_lat: "",
    default_gps_lng: "",
    default_landmark: "",
  });
  const set = (patch) => setData((d) => ({ ...d, ...patch }));

  const sendOtp = async () => {
    const phone = "+998" + data.phone.replace(/\D/g, "");
    setLoading(true);
    try {
      const res = await requestRegisterOtp(phone);
      if (res.dev_code) setDevCode(res.dev_code);
      setStep((s) => s + 1);
    } catch (e) {
      Alert.alert("Xatolik", e.message || "OTP yuborishda muammo yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const next = () => setStep((s) => s + 1);
  const back = () => {
    if (step === 1) onBack();
    else setStep((s) => s - 1);
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: COLORS.bg }}
      edges={["top", "left", "right"]}
    >
      {step <= TOTAL_STEPS && <TopNav step={step} onBack={back} />}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        keyboardVerticalOffset={Platform.OS === "android" ? 0 : 0}
      >
        {step === 1 && (
          <StepPhone data={data} set={set} onNext={sendOtp} loading={loading} />
        )}
        {step === 2 && (
          <StepCode
            data={data}
            set={set}
            onNext={next}
            devCode={devCode}
            onResend={sendOtp}
            resendLoading={loading}
          />
        )}
        {step === 3 && <StepPassport data={data} set={set} onNext={next} />}
        {step === 4 && <StepInfo data={data} set={set} onNext={next} />}
        {step === 5 && <StepAddress data={data} set={set} onNext={next} />}
        {step === 6 && <StepGps data={data} set={set} onNext={next} />}
        {step === 7 && <StepDone data={data} onFinish={onDone} />}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
