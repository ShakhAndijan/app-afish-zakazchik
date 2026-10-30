import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';
import useBottomInset from '../../hooks/useBottomInset';

// Korporativ hisob ekranlari uchun umumiy qismlar: ramka (sarlavha + skroll), maydon, tanlov chiplari, tugma, kartochka.

export function Frame({ title, subtitle, onBack, children, scroll = true }) {
  const { theme: t } = useTheme();
  const bottomInset = useBottomInset();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top', 'left', 'right']}>
      <StatusBar style={t.isDark ? 'light' : 'dark'} />
      <View style={s.header}>
        <TouchableOpacity
          style={[s.backBtn, { backgroundColor: t.card, borderColor: t.border }]}
          onPress={onBack}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="chevron-left" size={24} color={t.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[s.title, { color: t.text }]} numberOfLines={1}>
            {title}
          </Text>
          {!!subtitle && (
            <Text style={{ color: t.muted, fontSize: 13, marginTop: 2 }} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {scroll ? (
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 4,
              paddingBottom: 40 + bottomInset,
              gap: 16,
            }}
          >
            {children}
          </ScrollView>
        ) : (
          children
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function Card({ children, style }) {
  const { theme: t } = useTheme();
  return (
    <View style={[s.card, { backgroundColor: t.card, borderColor: t.border }, style]}>
      {children}
    </View>
  );
}

export function SectionHead({ icon, title, right }) {
  const { theme: t } = useTheme();
  return (
    <View style={s.sectionHead}>
      <MaterialCommunityIcons name={icon} size={19} color={t.orange} />
      <Text style={[s.sectionTitle, { color: t.text }]}>{title}</Text>
      {right}
    </View>
  );
}

export function Field({ label, hint, style, inputStyle, ...input }) {
  const { theme: t } = useTheme();
  return (
    <View style={[{ gap: 8 }, style]}>
      <Text style={[s.label, { color: t.text }]}>{label}</Text>
      <TextInput
        placeholderTextColor={t.faint}
        textAlignVertical={input.multiline ? 'top' : 'center'}
        {...input}
        style={[
          s.input,
          input.multiline && s.inputMulti,
          { backgroundColor: t.inputBg, borderColor: t.border, color: t.text },
          inputStyle,
        ]}
      />
      {!!hint && <Text style={{ color: t.faint, fontSize: 12.5 }}>{hint}</Text>}
    </View>
  );
}

// Bir nechta variantdan birini tanlash (tur, chastota, rol).
export function Chips({ label, options, value, onChange, disabled }) {
  const { theme: t } = useTheme();
  return (
    <View style={{ gap: 8 }}>
      {!!label && <Text style={[s.label, { color: t.text }]}>{label}</Text>}
      <View style={s.chips}>
        {options.map((o) => {
          const on = value === o.value;
          return (
            <TouchableOpacity
              key={o.value}
              activeOpacity={0.8}
              disabled={disabled}
              onPress={() => onChange(o.value)}
              style={[
                s.chip,
                {
                  backgroundColor: on ? t.orange : t.card,
                  borderColor: on ? t.orange : t.border,
                  opacity: disabled ? 0.55 : 1,
                },
              ]}
            >
              <Text style={{ color: on ? '#fff' : t.text, fontSize: 13.5, fontWeight: '700' }}>
                {o.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export function Button({ label, icon, onPress, busy, disabled, danger, outline, style }) {
  const { theme: t } = useTheme();
  const color = danger ? t.red : t.orange;
  const off = disabled || busy;
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={off}
      onPress={onPress}
      style={[
        s.button,
        outline ? { borderWidth: 1.5, borderColor: color } : { backgroundColor: color },
        { opacity: off ? 0.5 : 1 },
        style,
      ]}
    >
      {busy ? (
        <ActivityIndicator color={outline ? color : '#fff'} />
      ) : (
        <>
          {!!icon && (
            <MaterialCommunityIcons name={icon} size={18} color={outline ? color : '#fff'} />
          )}
          <Text style={{ color: outline ? color : '#fff', fontWeight: '800', fontSize: 15 }}>
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

export function Badge({ label, color }) {
  return (
    <View style={[s.badge, { backgroundColor: color + '22' }]}>
      <Text style={{ color, fontSize: 12, fontWeight: '800' }}>{label}</Text>
    </View>
  );
}

// Kichik matnli tugma (karta ichidagi amallar).
export function LinkButton({ label, onPress, danger, disabled }) {
  const { theme: t } = useTheme();
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.7} hitSlop={8}>
      <Text
        style={{
          color: danger ? t.red : t.orange,
          fontWeight: '800',
          fontSize: 13.5,
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export const money = (n) =>
  String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontWeight: '800', fontSize: 20 },
  card: { borderWidth: 1, borderRadius: 16, padding: 14, gap: 10 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  sectionTitle: { flex: 1, fontSize: 16, fontWeight: '800' },
  label: { fontSize: 14, fontWeight: '800' },
  input: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  inputMulti: {
    height: undefined,
    minHeight: 110,
    maxHeight: 240,
    paddingTop: 12,
    paddingBottom: 12,
    lineHeight: 21,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9 },
  button: {
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
});
