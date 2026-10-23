import { useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Stack,
  useRouter,
  useRootNavigationState,
  ThemeProvider as NavigationThemeProvider,
  DarkTheme,
  DefaultTheme,
} from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { queryClient, persistOptions } from '../queries/client';
import AfishLoader from '../components/AfishLoader';
import { AppAlertHost } from '../components/AppAlert';
import BiometricLockScreen from '../screens/BiometricLockScreen';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { LanguageProvider } from '../context/LanguageContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { UserProvider } from '../context/UserContext';
import { WalletProvider } from '../context/WalletContext';

// Ilova ildizi: providerlar va asosiy Stack. Marshrutlar `src/app/` papkasidagi fayllardan olinadi.
//  - mehmon:   index (landing), login
//  - mijoz:    (tabs) va undan ochiladigan ekranlar (hamyon, buyurtmalar, profil sahifalari ...)
//  - hammaga:  usta/[id], work, listings, listing/[id], reels, workers, document
export default function RootLayout() {
  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
      <LanguageProvider>
        <ThemeProvider>
          <SafeAreaProvider>
            <KeyboardProvider>
              <AuthProvider>
                <RootNavigator />
                <AppAlertHost />
              </AuthProvider>
            </KeyboardProvider>
          </SafeAreaProvider>
        </ThemeProvider>
      </LanguageProvider>
    </PersistQueryClientProvider>
  );
}

function RootNavigator() {
  const { checked, locked, unlocking, retryUnlock, abandonSession, signedIn } = useAuth();
  const { theme: t } = useTheme();

  // Navigatsiya fon rangi ilova mavzusi bilan bir xil bo'lishi kerak, aks holda ekran almashganda
  // (ayniqsa "Orqaga" bosilganda) standart oq/kulrang fon bir lahza ko'rinib qoladi.
  const navTheme = useMemo(() => {
    const base = t.isDark ? DarkTheme : DefaultTheme;
    return { ...base, colors: { ...base.colors, background: t.bg, card: t.bg } };
  }, [t]);

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
        <NavigationThemeProvider value={navTheme}>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.bg } }}>
            <Stack.Protected guard={signedIn}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="wallet" />
              <Stack.Screen name="orders" />
              <Stack.Screen name="order/[id]" />
              <Stack.Screen name="order-worker" />
              <Stack.Screen name="addresses" />
              <Stack.Screen name="payment-history" />
              <Stack.Screen name="notifications" />
              <Stack.Screen name="help" />
              <Stack.Screen name="edit-profile" />
              <Stack.Screen name="change-password" />
              <Stack.Screen name="change-phone" />
              <Stack.Screen name="my-rating" />
              <Stack.Screen name="verify-identity" />
              <Stack.Screen name="verify-email" />
              <Stack.Screen name="favorites" />
              <Stack.Screen name="request/[id]" />
              <Stack.Screen name="chat" />
              <Stack.Screen name="support" />
              <Stack.Screen name="support-chat" />
            </Stack.Protected>
            <Stack.Protected guard={!signedIn}>
              <Stack.Screen name="index" />
              <Stack.Screen name="login" />
            </Stack.Protected>
            <Stack.Screen name="usta/[id]" />
            <Stack.Screen name="work" />
            <Stack.Screen name="listings" />
            <Stack.Screen name="listing/[id]" />
            <Stack.Screen name="reels" options={{ animation: 'fade' }} />
            <Stack.Screen name="workers" />
            <Stack.Screen name="document" />
          </Stack>
          <AuthRedirect />
        </NavigationThemeProvider>
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
