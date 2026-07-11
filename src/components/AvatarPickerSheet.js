import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

function Row({ icon, label, color, onPress }) {
  return (
    <TouchableOpacity style={s.row} activeOpacity={0.6} onPress={onPress}>
      <MaterialCommunityIcons name={icon} size={19} color={color} style={{ marginRight: 9 }} />
      <Text style={[s.rowText, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function Divider({ t }) {
  return <View style={[s.divider, { backgroundColor: t.border }]} />;
}

export default function AvatarPickerSheet({
  visible,
  onClose,
  onPickCamera,
  onPickGallery,
  onRemove,
  hasPhoto,
  previewUri,
  previewLetter = 'J',
  previewColor,
  t,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={s.overlay} />
      </TouchableWithoutFeedback>

      <View style={s.sheet}>
        <View style={s.grabberRow}>
          <View style={[s.grabber, { backgroundColor: '#ffffff55' }]} />
        </View>

        <View style={s.previewRow}>
          <View style={[s.previewRing, { borderColor: t.border }]}>
            <View
              style={[
                s.previewCircle,
                { backgroundColor: previewUri ? 'transparent' : previewColor },
              ]}
            >
              {previewUri ? (
                <Image source={{ uri: previewUri }} style={s.previewImg} resizeMode="cover" />
              ) : (
                <Text style={s.previewLetter}>{previewLetter}</Text>
              )}
            </View>
          </View>
        </View>

        <View style={[s.group, { backgroundColor: t.card, borderColor: t.border }]}>
          <Text style={[s.groupTitle, { color: t.muted }]}>Profil rasmini o'zgartirish</Text>
          <Divider t={t} />
          <Row icon="camera-outline" label="Kamera" color={t.text} onPress={onPickCamera} />
          <Divider t={t} />
          <Row icon="image-multiple-outline" label="Galereya" color={t.text} onPress={onPickGallery} />
          {hasPhoto && (
            <>
              <Divider t={t} />
              <Row icon="trash-can-outline" label="Rasmni o'chirish" color={t.red} onPress={onRemove} />
            </>
          )}
        </View>

        <TouchableOpacity
          style={[s.cancelGroup, { backgroundColor: t.card, borderColor: t.border }]}
          activeOpacity={0.6}
          onPress={onClose}
        >
          <Text style={[s.cancelText, { color: t.text }]}>Bekor qilish</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(4,8,14,0.55)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingBottom: 20,
  },

  grabberRow: { alignItems: 'center', paddingBottom: 10 },
  grabber: { width: 36, height: 4, borderRadius: 2 },

  previewRow: { alignItems: 'center', marginBottom: 16 },
  previewRing: {
    width: 84,
    height: 84,
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImg: { width: '100%', height: '100%' },
  previewLetter: { color: '#fff', fontSize: 27, fontWeight: '700' },

  group: {
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  groupTitle: {
    textAlign: 'center',
    fontSize: 12.5,
    fontWeight: '600',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  divider: { height: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  rowText: { fontSize: 16, fontWeight: '500' },

  cancelGroup: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  cancelText: { fontSize: 16, fontWeight: '700' },
});
