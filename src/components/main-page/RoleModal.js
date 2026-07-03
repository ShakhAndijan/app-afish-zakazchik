import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Animated,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { useRef, useEffect } from 'react';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';

const ROLES = [
  {
    value: 'mijoz',
    label: 'Mijozman',
    desc: 'Menga yaxshi usta kerak',
    icon: 'account-search',
  },
  {
    value: 'usta',
    label: 'Ustaman',
    desc: 'Men ish qidiraman',
    icon: 'briefcase-account',
  },
];

function RoleModal({ onSelect }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.88)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        damping: 18,
        stiffness: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const pick = (value) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => onSelect(value));
  };

  return (
    <Modal visible transparent animationType="none">
      <Animated.View style={[rm.backdrop, { opacity: fadeAnim }]}>
        <Animated.View
          style={[rm.popup, { transform: [{ scale: scaleAnim }] }]}
        >
          <Text style={rm.title}>Kim sifatida kirasiz?</Text>
          <Text style={rm.sub}>Rolni tanlang</Text>

          {ROLES.map((role, i) => (
            <TouchableOpacity
              key={role.value}
              style={[rm.option, i < ROLES.length - 1 && rm.optionBorder]}
              onPress={() => pick(role.value)}
              activeOpacity={0.75}
            >
              <View style={rm.iconBg}>
                <MaterialCommunityIcons
                  name={role.icon}
                  size={24}
                  color={COLORS.orange}
                />
              </View>
              <View style={rm.optBody}>
                <Text style={rm.optLabel}>{role.label}</Text>
                <Text style={rm.optDesc}>{role.desc}</Text>
              </View>
              <Feather name="chevron-right" size={18} color={COLORS.gray} />
            </TouchableOpacity>
          ))}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

export default RoleModal;

const rm = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  popup: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: 22,
    paddingTop: 22,
    paddingBottom: 8,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 20,
  },
  title: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  sub: { color: COLORS.gray, fontSize: 13, marginBottom: 16 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  optionBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.cardAlt,
  },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  optBody: { flex: 1 },
  optLabel: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  optDesc: { color: COLORS.gray, fontSize: 12 },
});
