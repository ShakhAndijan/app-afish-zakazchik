import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import PhoneInput from '../../components/login/PhoneInput';

const SERVICES = [
  { name: 'Santexnik', color: '#22b8cf', icon: 'wrench',          lib: 'MaterialCommunityIcons' },
  { name: 'Elektrik',  color: '#ffd43b', icon: 'lightning-bolt',  lib: 'MaterialCommunityIcons' },
  { name: "Bo'yoqchi", color: '#ff7ab8', icon: 'brush',           lib: 'MaterialCommunityIcons' },
  { name: 'Duradgor',  color: '#9775fa', icon: 'hammer',          lib: 'MaterialCommunityIcons' },
];

function ServiceIcon({ icon, color }) {
  return <MaterialCommunityIcons name={icon} size={15} color={color} />;
}

export default function PhoneStep({
  phone,
  onChange,
  onSms,
  onGoogle,
  googleLoading,
  onEmail,
  onRegister,
  onBack,
}) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme.isDark !== false;
  const isReady = phone.length === 9;

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
        {/* ── Top bar ── */}
        <View style={s.topBar}>
          <TouchableOpacity
            style={[s.iconBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={onBack}
            activeOpacity={0.75}
          >
            <Feather name="arrow-left" size={20} color={theme.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.iconBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={toggleTheme}
            activeOpacity={0.75}
          >
            <MaterialCommunityIcons
              name="cog-outline"
              size={20}
              color={isDark ? theme.muted : theme.orange}
            />
          </TouchableOpacity>
        </View>

        <View style={s.body}>
          {/* ── Hero ── */}
          <View style={s.hero}>
            <View style={[s.orb, isDark
              ? { backgroundColor: 'rgba(240,122,48,0.13)' }
              : { backgroundColor: 'rgba(240,122,48,0.08)' }
            ]} />
            <Image
              source={require('../../../assets/afish-logo-vertical.png')}
              style={s.logo}
              resizeMode="contain"
            />
            <Text style={[s.h1, { color: theme.text }]}>Xush kelibsiz!</Text>
            <Text style={[s.sub, { color: theme.muted }]}>
              Hisobingizga kiring va ishonchli ustalarga buyurtma bering.
            </Text>
          </View>

          {/* ── Xizmat chips ── */}
          <View style={s.chipRow}>
            {SERVICES.map((sv) => (
              <View
                key={sv.name}
                style={[s.chip, { backgroundColor: theme.card, borderColor: theme.border }]}
              >
                <ServiceIcon icon={sv.icon} color={sv.color} />
                <Text style={[s.chipTxt, { color: theme.muted }]}>{sv.name}</Text>
              </View>
            ))}
          </View>

          {/* ── Phone field ── */}
          <View style={s.fieldWrap}>
            <Text style={[s.fieldLabel, { color: theme.muted }]}>Telefon raqami</Text>
            <PhoneInput value={phone} onChangeText={onChange} theme={theme} />
          </View>

          {/* ── CTA ── */}
          <TouchableOpacity
            style={[s.cta, !isReady && s.ctaDisabled]}
            onPress={isReady ? onSms : undefined}
            activeOpacity={0.85}
          >
            <Text style={[s.ctaTxt, !isReady && s.ctaTxtDisabled]}>SMS kod yuborish</Text>
            <Feather name="arrow-right" size={18} color={isReady ? '#fff' : '#7a6253'} />
          </TouchableOpacity>

          {/* ── Social ── */}
          <View style={s.orWrap}>
            <View style={[s.line, { backgroundColor: theme.border }]} />
            <Text style={[s.orTxt, { color: theme.muted }]}>yoki</Text>
            <View style={[s.line, { backgroundColor: theme.border }]} />
          </View>

          <View style={s.socialRow}>
            <TouchableOpacity
              style={[s.socBtn, { borderColor: theme.border, backgroundColor: isDark ? theme.card : '#fff' }]}
              onPress={googleLoading ? undefined : onGoogle}
              activeOpacity={0.85}
            >
              {googleLoading
                ? <ActivityIndicator size="small" color="#4285F4" />
                : <MaterialCommunityIcons name="google" size={20} color="#4285F4" />
              }
              <Text style={[s.socTxt, { color: isDark ? theme.text : '#1f2937' }]}>Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.socBtn, { borderColor: theme.border, backgroundColor: theme.card }]}
              onPress={onEmail}
              activeOpacity={0.85}
            >
              <Ionicons name="mail-outline" size={20} color={theme.text} />
              <Text style={[s.socTxt, { color: theme.text }]}>Email</Text>
            </TouchableOpacity>
          </View>

          {/* ── Footer ── */}
          <View style={s.footer}>
            <Text style={[s.terms, { color: theme.muted }]}>
              Davom etish orqali{' '}
              <Text style={{ color: theme.text, fontWeight: '700' }}>Shartlar</Text>
              {' va '}
              <Text style={{ color: theme.text, fontWeight: '700' }}>Maxfiylik siyosati</Text>
              ga rozilik bildirasiz.
            </Text>
            <View style={s.regRow}>
              <Text style={[s.regHint, { color: theme.muted }]}>Hisobingiz yo'qmi? </Text>
              <TouchableOpacity onPress={onRegister} activeOpacity={0.7}>
                <Text style={[s.regLink, { color: theme.orange }]}>Ro'yxatdan o'tish</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
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

  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipTxt: { fontSize: 12.5, fontWeight: '600' },

  fieldWrap: { gap: 8 },
  fieldLabel: { fontSize: 13, fontWeight: '600' },

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

  orWrap: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  line: { flex: 1, height: 1 },
  orTxt: { fontSize: 13 },

  socialRow: { flexDirection: 'row', gap: 12 },
  socBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 8,
  },
  socTxt: { fontSize: 14, fontWeight: '700' },

  footer: { gap: 12, alignItems: 'center' },
  terms: { fontSize: 12, textAlign: 'center', lineHeight: 18 },
  regRow: { flexDirection: 'row', alignItems: 'center' },
  regHint: { fontSize: 14 },
  regLink: { fontSize: 14, fontWeight: '700' },
});
