import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import useAuthGate from '../hooks/useAuthGate';
import { clearTokens } from '../utils/token';
import { clearCachedUser } from './UserContext';

const AuthContext = createContext({
  signedIn: false,
  checked: false,
  locked: false,
  unlocking: false,
  signIn: () => {},
  signOut: async () => {},
  retryUnlock: () => {},
  abandonSession: () => {},
});

// Kirish holati: `signedIn` marshrutlarni himoyalaydi (src/app/_layout.js), `checked`/`locked` —
// ilova ochilganda saqlangan sessiyani (biometrik bilan) tekshirish bosqichi.
export function AuthProvider({ children }) {
  const [signedIn, setSignedIn] = useState(false);
  const gate = useAuthGate({ onUnlocked: () => setSignedIn(true) });

  const signIn = useCallback(() => setSignedIn(true), []);

  const signOut = useCallback(async () => {
    await clearTokens();
    await clearCachedUser();
    setSignedIn(false);
  }, []);

  const value = useMemo(
    () => ({
      signedIn,
      checked: gate.authChecked,
      locked: gate.locked,
      unlocking: gate.unlocking,
      retryUnlock: gate.retryUnlock,
      abandonSession: gate.abandonSession,
      signIn,
      signOut,
    }),
    [signedIn, gate.authChecked, gate.locked, gate.unlocking, gate.retryUnlock, gate.abandonSession, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
