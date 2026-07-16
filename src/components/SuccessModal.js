import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Animated } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function SuccessModal({
  visible,
  onClose,
  t,
  title = 'Muvaffaqiyatli!',
  message,
  buttonText = 'Davom etish',
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.88)).current;

  useEffect(() => {
    if (!visible) return;
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.88);
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
  }, [visible]);

  const handleClose = () => {
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
    ]).start(() => onClose());
  };

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent onRequestClose={handleClose}>
      <Animated.View style={[s.backdrop, { opacity: fadeAnim }]}>
        <Animated.View
          style={[s.popup, { backgroundColor: t.card, transform: [{ scale: scaleAnim }] }]}
        >
          <View style={[s.iconRing, { backgroundColor: t.green + '1c' }]}>
            <View style={[s.iconCircle, { backgroundColor: t.green }]}>
              <MaterialCommunityIcons name="check" size={30} color="#fff" />
            </View>
          </View>
          <Text style={[s.title, { color: t.text }]}>{title}</Text>
          {!!message && <Text style={[s.sub, { color: t.muted }]}>{message}</Text>}
          <TouchableOpacity
            style={[s.btn, { backgroundColor: t.orange }]}
            activeOpacity={0.85}
            onPress={handleClose}
          >
            <Text style={s.btnText}>{buttonText}</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  popup: {
    width: '100%',
    borderRadius: 22,
    paddingTop: 26,
    paddingBottom: 20,
    paddingHorizontal: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 20,
  },
  iconRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 18, fontWeight: '800', marginBottom: 6 },
  sub: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 22,
    paddingHorizontal: 6,
  },
  btn: {
    width: '100%',
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
