import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Feather from '@expo/vector-icons/Feather';
import { useTheme } from '../context/ThemeContext';
import { setPassword } from '../api/user';
import SuccessModal from '../components/SuccessModal';

const HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 };

const PASSWORD_RULES = [
  { key: 'length', label: 'Kamida 8 ta belgi', test: (pw) => pw.length >= 8 },
  { key: 'upper', label: '1 ta katta harf (A-Z)', test: (pw) => /[A-Z]/.test(pw) },
  { key: 'lower', label: '1 ta kichik harf (a-z)', test: (pw) => /[a-z]/.test(pw) },
  { key: 'digit', label: '1 ta raqam (0-9)', test: (pw) => /\d/.test(pw) },
  { key: 'special', label: '1 ta maxsus belgi (!@#$%)', test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

function PasswordField({ label, value, onChangeText, placeholder, t, error }) {
  const [show, setShow] = useState(false);
  return (
    <View style={{ gap: 8 }}>
      <Text style={[s.fieldLabel, { color: t.muted }]}>{label}</Text>
      <View
        style={[
          s.inputWrap,
          { backgroundColor: t.inputBg, borderColor: error ? t.red : t.border },
        ]}
      >
        <Feather name="lock" size={17} color={t.faint} />
        <TextInput
          style={[s.input, { color: t.text }]}
          placeholder={placeholder}
          placeholderTextColor={t.faint}
          secureTextEntry={!show}
          autoCapitalize="none"
          value={value}
          onChangeText={onChangeText}
        />
        <TouchableOpacity onPress={() => setShow((v) => !v)} hitSlop={HIT_SLOP}>
          <Feather name={show ? 'eye-off' : 'eye'} size={17} color={t.faint} />
        </TouchableOpacity>
      </View>
      {error ? <Text style={[s.errorText, { color: t.red }]}>{error}</Text> : null}
    </View>
  );
}

function PasswordRules({ password, t }) {
  return (
    <View style={s.rulesWrap}>
      {PASSWORD_RULES.map((rule) => {
        const passed = rule.test(password);
        return (
          <View key={rule.key} style={s.ruleItem}>
            <MaterialCommunityIcons
              name={passed ? 'check-circle' : 'circle-outline'}
              size={15}
              color={passed ? t.green : t.faint}
            />
            <Text style={[s.ruleLabel, { color: passed ? t.green : t.muted }]}>
              {rule.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export default function ChangePasswordScreen({ onBack }) {
  const { theme: t } = useTheme();
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPwError, setCurrentPwError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const passwordOk = PASSWORD_RULES.every((r) => r.test(newPw));
  const matchOk = confirmPw.length > 0 && confirmPw === newPw;
  const sameAsOld = newPw.length > 0 && newPw === currentPw;
  const isReady = currentPw.length >= 4 && passwordOk && matchOk && !sameAsOld && !loading;

  const handleSubmit = async () => {
    if (!isReady) return;
    setCurrentPwError('');
    setLoading(true);
    try {
      await setPassword(currentPw, newPw);
      setShowSuccess(true);
    } catch (e) {
      if (e.status === 400 || e.status === 401 || e.status === 403) {
        setCurrentPwError("Joriy parol noto'g'ri");
      } else {
        Alert.alert('Xatolik', e.message || 'Parolni yangilashda xatolik yuz berdi');
      }
    } finally {
      setLoading(false);
    }
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
        <Text style={[s.headerTitle, { color: t.text }]}>Parolni almashtirish</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <View style={[s.hero, { backgroundColor: t.card, borderColor: t.border }]}>
          <View style={[s.heroIcon, { backgroundColor: t.blue + '1c' }]}>
            <MaterialCommunityIcons name="shield-lock-outline" size={24} color={t.blue} />
          </View>
          <Text style={[s.heroText, { color: t.muted }]}>
            Hisobingiz xavfsizligi uchun boshqa joyda ishlatilmagan, kuchli parol tanlang.
          </Text>
        </View>

        <View style={{ gap: 18, marginTop: 20 }}>
          <PasswordField
            label="Joriy parol"
            value={currentPw}
            onChangeText={(v) => {
              setCurrentPw(v);
              if (currentPwError) setCurrentPwError('');
            }}
            placeholder="Joriy parolingizni kiriting"
            t={t}
            error={currentPwError}
          />

          <View style={{ gap: 8 }}>
            <PasswordField
              label="Yangi parol"
              value={newPw}
              onChangeText={setNewPw}
              placeholder="Yangi parol yarating"
              t={t}
              error={sameAsOld ? 'Yangi parol joriy paroldan farq qilishi kerak' : ''}
            />
            <PasswordRules password={newPw} t={t} />
          </View>

          <PasswordField
            label="Yangi parolni tasdiqlang"
            value={confirmPw}
            onChangeText={setConfirmPw}
            placeholder="Yangi parolni qayta kiriting"
            t={t}
            error={confirmPw.length > 0 && !matchOk ? 'Parollar mos kelmadi' : ''}
          />
        </View>

        <TouchableOpacity
          style={[
            s.submitBtn,
            { backgroundColor: isReady ? t.orange : t.orange + '55' },
          ]}
          activeOpacity={0.85}
          onPress={handleSubmit}
          disabled={!isReady}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={s.submitText}>Parolni yangilash</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <SuccessModal
        visible={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          onBack();
        }}
        t={t}
        message="Parolingiz muvaffaqiyatli yangilandi."
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

  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  heroIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  heroText: { flex: 1, fontSize: 12.5, lineHeight: 18, fontWeight: '500' },

  fieldLabel: { fontSize: 13, fontWeight: '600' },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    gap: 10,
  },
  input: { flex: 1, fontSize: 15, fontWeight: '500', padding: 0 },
  errorText: { fontSize: 12, fontWeight: '600', marginTop: 1 },

  rulesWrap: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 2 },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '50%',
    marginBottom: 6,
    paddingRight: 6,
  },
  ruleLabel: { fontSize: 11.5, fontWeight: '500', flexShrink: 1 },

  submitBtn: {
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 26,
  },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
