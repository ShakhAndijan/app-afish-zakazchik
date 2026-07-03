import {
  View, Text, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import BackBtn from '../../components/login/BackBtn';
import InputField from '../../components/login/InputField';
import PrimaryBtn from '../../components/login/PrimaryBtn';

export default function EmailStep({ onBack, onLogin }) {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');

  const isReady = email.includes('@') && pass.length >= 4;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <BackBtn onPress={onBack} />

          <View style={styles.heading}>
            <Text style={styles.title}>Email orqali kirish</Text>
            <Text style={styles.subtitle}>Email va parolingizni kiriting.</Text>
          </View>

          <View style={styles.form}>
            <InputField
              label="Email manzil"
              placeholder="siz@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoFocus
              icon={<Ionicons name="mail-outline" size={19} color={COLORS.faint} />}
            />
            <InputField
              label="Parol"
              placeholder="••••••••"
              value={pass}
              onChangeText={setPass}
              secureTextEntry
              icon={<Ionicons name="lock-closed-outline" size={19} color={COLORS.faint} />}
            />
            <TouchableOpacity>
              <Text style={styles.forgot}>Parolni unutdingizmi?</Text>
            </TouchableOpacity>
          </View>

          <PrimaryBtn label="Kirish" disabled={!isReady} onPress={onLogin} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 26,
    paddingTop: 18,
    gap: 28,
  },
  heading: { gap: 8, marginTop: 8 },
  title: {
    color: COLORS.white,
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: { color: COLORS.muted, fontSize: 14 },
  form: { gap: 13 },
  forgot: {
    color: COLORS.orange,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
  },
});
