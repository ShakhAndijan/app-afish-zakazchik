import { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack, useRouter, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import AfishLoader from '../components/AfishLoader';
import BiometricLockScreen from '../screens/BiometricLockScreen';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { LanguageProvider } from '../context/LanguageContext';
import { ThemeProvider } from '../context/ThemeContext';
import { UserProvider } from '../context/UserContext';
import { WalletProvider } from '../context/WalletContext';

// Ilova ildizi: providerlar va asosiy Stack. Marshrutlar `src/app/` papkasidagi fayllardan olinadi.
//  - mehmon:   index (landing), login
//  - mijoz:    (tabs) va undan ochiladigan ekranlar (hamyon, buyurtmalar, profil sahifalari ...)
//  - hammaga:  usta/[id], work
export default function RootLayout() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <SafeAreaProvider>
          <AuthProvider>
            <RootNavigator />
          </AuthProvider>
        </SafeAreaProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

function RootNavigator() {
  const { checked, locked, unlocking, retryUnlock, abandonSession, signedIn } = useAuth();

  if (!checked) {
    return (
      <View style={styles.center}>
        <StatusBar style="light" />
        <AfishLoader size={160} />
      </View>
    );
  }

  if (locked) {
    return (
      <>
        <StatusBar style="light" />
        <BiometricLockScreen
          unlocking={unlocking}
          onRetry={retryUnlock}
          onUseOtherAccount={abandonSession}
        />
      </>
    );
  }

  return (
    <UserProvider enabled={signedIn}>
      <WalletProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.bg } }}>
          <Stack.Protected guard={signedIn}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="wallet" />
            <Stack.Screen name="orders" />
            <Stack.Screen name="order/[id]" />
            <Stack.Screen name="addresses" />
            <Stack.Screen name="payment-history" />
            <Stack.Screen name="notifications" />
            <Stack.Screen name="help" />
            <Stack.Screen name="edit-profile" />
            <Stack.Screen name="change-password" />
            <Stack.Screen name="change-phone" />
          </Stack.Protected>
          <Stack.Protected guard={!signedIn}>
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
          </Stack.Protected>
          <Stack.Screen name="usta/[id]" />
          <Stack.Screen name="work" />
        </Stack>
        <AuthRedirect />
      </WalletProvider>
    </UserProvider>
  );
}

// Kirish/chiqish holati o'zgarganda tegishli bosh ekranga o'tkazadi (masalan, mehmon sifatida
// usta sahifasidan login qilgach, usta sahifasi emas, bosh sahifa ochiladi).
function AuthRedirect() {
  const { signedIn } = useAuth();
  const router = useRouter();
  const navState = useRootNavigationState();
  const previous = useRef(null);

  useEffect(() => {
    if (!navState?.key || previous.current === signedIn) return;
    const isFirst = previous.current === null;
    previous.current = signedIn;
    if (signedIn) router.replace('/home');
    else if (!isFirst) router.replace('/');
  }, [signedIn, navState?.key, router]);

  return null;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },
});
