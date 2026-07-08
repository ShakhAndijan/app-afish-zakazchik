import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import PhoneInput from '../../components/login/PhoneInput';

export default function ForgotPasswordStep({
  phone,
  onChange,
  onSubmit,
  onBack,
  actorType = 'customer',
  loading = false,
  error = '',
}) {
  const { theme } = useTheme();
  const isDark = theme.isDark !== false;
  const isUsta = actorType === 'worker';
  const isReady = phone.length === 9 && !loading;

  return (
    <KeyboardAvoidingView
      style={[s.flex, { backgroundColor: theme.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={s.topBar}>
          <TouchableOpacity
            style={[s.iconBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={onBack}
            activeOpacity={0.75}
          >
            <Feather name="arrow-left" size={20} color={theme.text} />
          </TouchableOpacity>
        </View>

        <View style={s.body}>
          <View style={s.hero}>
            <View style={[s.orb, isUsta
              ? { backgroundColor: 'rgba(63,127,212,0.16)' }
              : { backgroundColor: 'rgba(240,122,48,0.13)' }
            ]} />
            <Image
              source={require('../../../assets/afish-logo-vertical.png')}
              style={s.logo}
              resizeMode="contain"
            />
            <Text style={[s.h1, { color: theme.text }]}>Parolni tiklash</Text>
            <Text style={[s.sub, { color: theme.muted }]}>
              Telefon raqamingizni kiriting — tasdiqlash kodini yuboramiz va yangi parol o'rnatasiz.
            </Text>
          </View>

          <View style={s.fieldWrap}>
            <Text style={[s.fieldLabel, { color: theme.muted }]}>Telefon raqami</Text>
            <PhoneInput value={phone} onChangeText={onChange} theme={theme} />
          </View>

          {!!error && (
            <View
              style={[
                s.errorBox,
                {
                  backgroundColor: isDark ? 'rgba(224,71,58,0.13)' : 'rgba(224,71,58,0.08)',
                  borderColor: 'rgba(224,71,58,0.32)',
                },
              ]}
            >
              <MaterialCommunityIcons name="alert-circle" size={18} color={theme.red} />
              <Text style={[s.errorTxt, { color: theme.red }]}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[s.cta, !isReady && s.ctaDisabled]}
            onPress={isReady ? onSubmit : undefined}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Text style={[s.ctaTxt, !isReady && s.ctaTxtDisabled]}>Kod yuborish</Text>
                <Feather name="arrow-right" size={18} color={isReady ? '#fff' : '#7a6253'} />
              </>
            )}
          </TouchableOpacity>

          <View style={s.footer}>
            <Text style={[s.terms, { color: theme.muted }]}>
              Kodni oldingiz — hisobingizga kiring va yangi parol o'rnating.
            </Text>
            <View style={s.regRow}>
              <Text style={[s.regHint, { color: theme.muted }]}>Esladingizmi? </Text>
              <TouchableOpacity onPress={onBack} activeOpacity={0.7}>
                <Text style={[s.regLink, { color: theme.orange }]}>Kirish</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1 },

  topBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 4,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  body: {
    flex: 1,
    paddingHorizontal: 22,
    paddingBottom: 32,
    gap: 22,
  },

  hero: {
    position: 'relative',
    alignItems: 'center',
    paddingTop: 16,
    gap: 8,
  },
  orb: {
    position: 'absolute',
    top: -20,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  logo: { width: 220, height: 120 },
  h1: {
    fontSize: 27,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 34,
    textAlign: 'center',
  },
  sub: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    maxWidth: 300,
  },

  fieldWrap: { gap: 8 },
  fieldLabel: { fontSize: 13, fontWeight: '600' },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderWidth: 1,
    borderRadius: 13,
    paddingVertical: 11,
    paddingHorizontal: 13,
  },
  errorTxt: { flex: 1, fontSize: 12.5, fontWeight: '600', lineHeight: 17 },

  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 15,
    gap: 8,
    backgroundColor: '#e87a45',
    shadowColor: '#e87a45',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 9,
  },
  ctaDisabled: {
    backgroundColor: '#3a2a22',
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
  ctaTxtDisabled: { color: '#7a6253' },

  footer: { gap: 12, alignItems: 'center' },
  terms: { fontSize: 12, textAlign: 'center', lineHeight: 18 },
  regRow: { flexDirection: 'row', alignItems: 'center' },
  regHint: { fontSize: 14 },
  regLink: { fontSize: 14, fontWeight: '700' },
});
