import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';

export const LANGS = [
  { code: 'uz', name: "O'zbek", sub: "O'zbekcha", flag: '🇺🇿' },
  { code: 'ru', name: 'Русский', sub: 'Ruscha', flag: '🇷🇺' },
  { code: 'en', name: 'English', sub: 'Inglizcha', flag: '🇬🇧' },
];

export default function TilBottomSheet({
  visible,
  currentLang,
  onSelect,
  onClose,
}) {
  const { theme: t } = useTheme();
  const [selected, setSelected] = useState(currentLang);

  useEffect(() => {
    if (visible) setSelected(currentLang);
  }, [visible, currentLang]);

  const handleConfirm = () => {
    onSelect(selected);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Dim overlay */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={s.overlay} />
      </TouchableWithoutFeedback>

      {/* Sheet */}
      <View style={[s.sheet, { borderColor: t.border }]}>
        {/* Grabber */}
        <View style={s.grabberRow}>
          <View style={s.grabber} />
        </View>

        {/* Header */}
        <View style={s.headerRow}>
          <Text style={{ fontWeight: '700', fontSize: 19, color: '#fff' }}>
            Tilni tanlang
          </Text>
          <TouchableOpacity
            style={[s.closeBtn, { backgroundColor: t.card }]}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="close" size={17} color={t.muted} />
          </TouchableOpacity>
        </View>
        <Text style={[s.subtitle, { color: t.muted }]}>
          Ilova interfeysi shu tilda ko'rsatiladi
        </Text>

        {/* Options */}
        <View style={s.options}>
          {LANGS.map((l) => {
            const on = selected === l.code;
            return (
              <TouchableOpacity
                key={l.code}
                style={[
                  s.option,
                  {
                    backgroundColor: on ? 'rgba(232,122,69,0.12)' : t.card,
                    borderColor: on ? t.orange : t.border,
                  },
                ]}
                activeOpacity={0.8}
                onPress={() => setSelected(l.code)}
              >
                <Text style={s.flag}>{l.flag}</Text>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{ fontWeight: '700', fontSize: 15, color: '#fff' }}
                  >
                    {l.name}
                  </Text>
                  <Text
                    style={{ fontSize: 11.5, color: t.muted, marginTop: 1 }}
                  >
                    {l.sub}
                  </Text>
                </View>
                <View
                  style={[
                    s.radio,
                    { borderColor: on ? t.orange : 'rgba(255,255,255,0.2)' },
                  ]}
                >
                  {on && (
                    <View style={[s.radioDot, { backgroundColor: t.orange }]} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Confirm */}
        <View
          style={{ paddingHorizontal: 22, paddingTop: 12, paddingBottom: 6 }}
        >
          <TouchableOpacity
            style={s.confirmBtn}
            onPress={handleConfirm}
            activeOpacity={0.85}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
              Tasdiqlash
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(4,8,14,0.65)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#10203a',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -16 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    elevation: 24,
    paddingBottom: 18,
  },

  grabberRow: { paddingTop: 12, alignItems: 'center' },
  grabber: {
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 6,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: 12.5,
    paddingHorizontal: 22,
    paddingBottom: 14,
  },

  options: { paddingHorizontal: 16 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    marginBottom: 6,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  flag: { fontSize: 27, lineHeight: 34 },

  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: { width: 12, height: 12, borderRadius: 6 },

  confirmBtn: {
    backgroundColor: '#e87a45',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: '#e87a45',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 8,
  },
});
