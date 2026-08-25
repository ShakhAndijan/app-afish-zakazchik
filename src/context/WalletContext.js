import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY = 'wallet_state';
const INITIAL_BALANCE = 120000;

const INITIAL_TRANSACTIONS = [
  {
    id: 't1',
    type: 'master_payment',
    title: 'Davron M.',
    subtitle: "Santexnik · Santexnika ta'mirlash",
    amount: 180000,
    direction: 'out',
    day: 5,
    month: 'Iyun',
    time: '10:35',
    method: 'Karta · Humo ··42',
    status: 'success',
    letter: 'D',
    color: '#2fa37a',
  },
  {
    id: 't2',
    type: 'master_payment',
    title: 'Alisher U.',
    subtitle: 'Elektrik · Elektr simlari almashtirish',
    amount: 250000,
    direction: 'out',
    day: 28,
    month: 'May',
    time: '14:05',
    method: 'Naqd pul',
    status: 'success',
    letter: 'A',
    color: '#e87a45',
  },
  {
    id: 't3',
    type: 'refund',
    title: 'Bekor qilingan buyurtma uchun qaytarish',
    subtitle: "Bobur K. · Bo'yoqchi",
    amount: 320000,
    direction: 'in',
    day: 20,
    month: 'May',
    time: '09:20',
    method: 'Karta · Humo ··42',
    status: 'success',
  },
  {
    id: 't4',
    type: 'master_payment',
    title: 'Sardor T.',
    subtitle: 'Plitachi · Parket yotqizish',
    amount: 450000,
    direction: 'out',
    day: 12,
    month: 'May',
    time: '11:10',
    method: 'Karta · Uzcard ··18',
    status: 'success',
    letter: 'S',
    color: '#9b6cd1',
  },
  {
    id: 't5',
    type: 'topup',
    title: "Hamyonni to'ldirish",
    subtitle: 'AFISH.uz hamyon',
    amount: 300000,
    direction: 'in',
    day: 8,
    month: 'May',
    time: '19:40',
    method: 'Karta · Humo ··42',
    status: 'success',
  },
  {
    id: 't6',
    type: 'master_payment',
    title: 'Jahongir R.',
    subtitle: "Konditsioner · Konditsioner o'rnatish",
    amount: 200000,
    direction: 'out',
    day: 3,
    month: 'Aprel',
    time: '15:45',
    method: 'Naqd pul',
    status: 'success',
    letter: 'J',
    color: '#f5a623',
  },
  {
    id: 't7',
    type: 'topup',
    title: "Hamyonni to'ldirish",
    subtitle: 'AFISH.uz hamyon',
    amount: 150000,
    direction: 'in',
    day: 26,
    month: 'Mart',
    time: '09:05',
    method: 'Karta · Uzcard ··18',
    status: 'success',
  },
  {
    id: 't8',
    type: 'master_payment',
    title: 'Farrux N.',
    subtitle: 'Gipschi · Gipsokarton qilish',
    amount: 380000,
    direction: 'out',
    day: 25,
    month: 'Mart',
    time: '13:05',
    method: 'Karta · Humo ··42',
    status: 'failed',
    letter: 'F',
    color: '#26a69a',
  },
];

const WalletContext = createContext({
  balance: INITIAL_BALANCE,
  transactions: INITIAL_TRANSACTIONS,
  loading: true,
  topUp: async () => {},
});

const monthLabel = (date) =>
  ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"][date.getMonth()];

export function WalletProvider({ children }) {
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (typeof parsed.balance === 'number') setBalance(parsed.balance);
          if (Array.isArray(parsed.transactions)) setTransactions(parsed.transactions);
        }
      } catch {}
      setLoading(false);
    })();
  }, []);

  const persist = useCallback((nextBalance, nextTransactions) => {
    AsyncStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ balance: nextBalance, transactions: nextTransactions })
    ).catch(() => {});
  }, []);

  // Hamyonni to'ldirish: mablag'ni hisobga qo'shadi va tranzaksiyalar
  // ro'yxatiga yozadi. Haqiqiy to'lov provayderi ulanmaguncha lokal holatda ishlaydi.
  const topUp = useCallback(
    async (amount, methodLabel) => {
      const now = new Date();
      const tx = {
        id: `topup_${now.getTime()}`,
        type: 'topup',
        title: "Hamyonni to'ldirish",
        subtitle: 'AFISH.uz hamyon',
        amount,
        direction: 'in',
        day: now.getDate(),
        month: monthLabel(now),
        time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
        method: methodLabel,
        status: 'success',
      };

      let nextBalance;
      setBalance((prev) => {
        nextBalance = prev + amount;
        return nextBalance;
      });
      setTransactions((prev) => {
        const next = [tx, ...prev];
        persist(nextBalance, next);
        return next;
      });

      return tx;
    },
    [persist]
  );

  return (
    <WalletContext.Provider value={{ balance, transactions, loading, topUp }}>
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => useContext(WalletContext);
