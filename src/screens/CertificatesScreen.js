import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Feather from '@expo/vector-icons/Feather';
import { useTheme } from '../context/ThemeContext';
import AddCertificateScreen from './AddCertificateScreen';

const STATUS_CFG = {
  verified: { label: 'Tasdiqlangan', color: '#2fa37a', bg: 'rgba(47,163,122,0.15)', icon: 'check-decagram' },
  pending: { label: 'Ko\'rib chiqilmoqda', color: '#e87a45', bg: 'rgba(232,122,69,0.15)', icon: 'clock-outline' },
};

// Rasm massivda ikki xil bo'lishi mumkin: backend'dan kelgan uzoq uri (string)
// yoki lokal require() qilingan asset (raqam/obyekt) — mock rasmlar uchun.
const toImgSource = (photo) => (typeof photo === 'string' ? { uri: photo } : photo);

const INITIAL_CERTIFICATES = [
  {
    id: 'c1',
    title: 'Santexnika montaji sertifikati',
    field: 'Santexnika',
    institution: 'Toshkent Kasb-hunar kolleji',
    day: 14,
    month: 'Mart',
    year: 2023,
    expiryDate: null,
    certNumber: 'SF-2023-1187',
    status: 'verified',
    color: '#2fa37a',
    icon: 'wrench',
    image: require('../../assets/mock/photo-02.png'),
  },
  {
    id: 'c2',
    title: 'Elektr xavfsizligi bo\'yicha sertifikat',
    field: 'Elektr montaji',
    institution: 'IEC Standartlashtirish markazi',
    day: 2,
    month: 'Iyun',
    year: 2022,
    expiryDate: { day: 2, month: 'Iyun', year: 2027 },
    certNumber: 'EL-2022-0456',
    status: 'verified',
    color: '#e87a45',
    icon: 'lightning-bolt',
    image: require('../../assets/mock/photo-05.png'),
  },
  {
    id: 'c3',
    title: 'Ichki dizayn asoslari kursi',
    field: 'Dizayn',
    institution: "Namuna o'quv markazi",
    day: 20,
    month: 'Sentabr',
    year: 2024,
    expiryDate: null,
    certNumber: 'ND-2024-0789',
    status: 'pending',
    color: '#9b6cd1',
    icon: 'palette-outline',
    image: require('../../assets/mock/photo-07.png'),
  },
  {
    id: 'c4',
    title: "Konditsioner o'rnatish va servis",
    field: 'Konditsioner',
    institution: 'HVAC Pro Study',
    day: 9,
    month: 'Noyabr',
    year: 2021,
    expiryDate: { day: 9, month: 'Noyabr', year: 2026 },
    certNumber: 'HV-2021-0234',
    status: 'verified',
    color: '#3f7fd4',
    icon: 'air-conditioner',
    image: require('../../assets/mock/photo-09.png'),
  },
];

/* ── Compact stat cell — icon beside the value for a slimmer, single-line row ── */
function StatCell({ icon, color, value, label, t, border }) {
  return (
    <View style={[s.statCell, border && { borderRightWidth: 1, borderRightColor: t.border }]}>
      <View style={[s.statIcon, { backgroundColor: color + '1c' }]}>
        <MaterialCommunityIcons name={icon} size={14} color={color} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[s.statVal, { color: t.text }]} numberOfLines={1}>
          {value}
        </Text>
        <Text style={[s.statLbl, { color: t.muted }]} numberOfLines={1}>
          {label}
        </Text>
      </View>
    </View>
  );
}

function InfoRow({ icon, label, value, t }) {
  return (
    <View style={s.infoRow}>
      <View style={s.infoRowLeft}>
        <Feather name={icon} size={12.5} color={t.muted} />
        <Text style={[s.infoLabel, { color: t.muted }]}>{label}</Text>
      </View>
      <Text style={[s.infoValue, { color: t.text }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

/* ── Certificate card ── */
function CertificateCard({ cert, t, onViewImage, onRequestDelete }) {
  const statusCfg = STATUS_CFG[cert.status];

  return (
    <View style={[s.card, { backgroundColor: t.card, borderColor: t.border }]}>
      <View style={[s.accentBar, { backgroundColor: cert.color }]} />

      <TouchableOpacity
        style={s.imageWrap}
        activeOpacity={0.9}
        onPress={() => onViewImage(cert.image)}
      >
        <Image source={toImgSource(cert.image)} style={s.image} resizeMode="cover" />

        <View style={[s.statusPillAbs, { backgroundColor: statusCfg.bg }]}>
          <MaterialCommunityIcons name={statusCfg.icon} size={11} color={statusCfg.color} />
          <Text style={[s.statusPillText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
        </View>
        <View style={[s.fieldChipAbs, { backgroundColor: cert.color }]}>
          <MaterialCommunityIcons name={cert.icon} size={12} color="#fff" />
          <Text style={s.fieldChipAbsText}>{cert.field}</Text>
        </View>
        <View style={s.zoomBadge}>
          <Feather name="maximize-2" size={13} color="#fff" />
        </View>
      </TouchableOpacity>

      <View style={s.body}>
        <View style={s.titleRow}>
          <Text style={[s.title, { color: t.text, flex: 1 }]} numberOfLines={2}>
            {cert.title}
          </Text>
          <TouchableOpacity
            style={[s.deleteBtn, { backgroundColor: 'rgba(224,71,58,0.13)' }]}
            onPress={() => onRequestDelete(cert)}
            activeOpacity={0.7}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Feather name="trash-2" size={14} color={t.red} />
          </TouchableOpacity>
        </View>

        <View style={[s.infoCard, { borderTopColor: t.border }]}>
          <InfoRow icon="home" label="Muassasa" value={cert.institution} t={t} />
          <InfoRow
            icon="calendar"
            label="Olingan sana"
            value={`${cert.day}-${cert.month}, ${cert.year}`}
            t={t}
          />
          <InfoRow
            icon="shield-off"
            label="Amal qilish muddati"
            value={
              cert.expiryDate
                ? `${cert.expiryDate.day}-${cert.expiryDate.month}, ${cert.expiryDate.year}`
                : 'Muddatsiz'
            }
            t={t}
          />
          <InfoRow icon="hash" label="Sertifikat raqami" value={cert.certNumber} t={t} />
        </View>
      </View>
    </View>
  );
}

/* ── Themed delete-confirmation dialog (replaces the native Alert) ── */
function ConfirmDeleteModal({ cert, onCancel, onConfirm, t }) {
  return (
    <Modal
      visible={!!cert}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={s.confirmOverlay} />
      </TouchableWithoutFeedback>

      <View style={s.confirmWrap} pointerEvents="box-none">
        <View style={[s.confirmCard, { backgroundColor: t.card, borderColor: t.border }]}>
          <View style={[s.confirmIcon, { backgroundColor: 'rgba(224,71,58,0.15)' }]}>
            <MaterialCommunityIcons name="trash-can-outline" size={28} color={t.red} />
          </View>
          <Text style={[s.confirmTitle, { color: t.text }]}>Sertifikatni o'chirish</Text>
          <Text style={[s.confirmMessage, { color: t.muted }]}>
            <Text style={{ color: t.text, fontWeight: '700' }}>"{cert?.title}"</Text>
            {' '}sertifikatini o'chirmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.
          </Text>

          <View style={s.confirmActions}>
            <TouchableOpacity
              style={[s.confirmBtnGhost, { backgroundColor: t.rowIconBg }]}
              activeOpacity={0.8}
              onPress={onCancel}
            >
              <Text style={[s.confirmBtnGhostText, { color: t.text }]}>Bekor qilish</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.confirmBtnDanger, { backgroundColor: t.red }]}
              activeOpacity={0.85}
              onPress={onConfirm}
            >
              <Feather name="trash-2" size={14} color="#fff" />
              <Text style={s.confirmBtnDangerText}>O'chirish</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function CertificatesScreen({ onBack }) {
  const { theme: t } = useTheme();
  const [certificates, setCertificates] = useState(INITIAL_CERTIFICATES);
  const [viewerImage, setViewerImage] = useState(null);
  const [showAddScreen, setShowAddScreen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const verifiedCount = certificates.filter((c) => c.status === 'verified').length;
  const pendingCount = certificates.filter((c) => c.status === 'pending').length;

  const handleSaveNew = (cert) => {
    setCertificates((prev) => [cert, ...prev]);
    setShowAddScreen(false);
  };

  const confirmDelete = () => {
    setCertificates((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  if (showAddScreen) {
    return <AddCertificateScreen onBack={() => setShowAddScreen(false)} onSave={handleSaveNew} />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top', 'left', 'right']}>
      <StatusBar style={t.isDark ? 'light' : 'dark'} />

      <View style={[s.header, { backgroundColor: t.bg }]}>
        <TouchableOpacity
          style={[s.backBtn, { backgroundColor: t.card, borderColor: t.border }]}
          onPress={onBack}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="chevron-left" size={24} color={t.text} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: t.text }]}>Sertifikatlarim</Text>
        <TouchableOpacity
          style={[s.addBtn, { backgroundColor: t.orange }]}
          onPress={() => setShowAddScreen(true)}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Stats */}
        <View style={[s.statsRow, { backgroundColor: t.card, borderColor: t.border }]}>
          <StatCell
            icon="certificate-outline"
            color={t.orange}
            value={`${certificates.length} ta`}
            label="Jami sertifikat"
            t={t}
            border
          />
          <StatCell
            icon="check-decagram"
            color="#2fa37a"
            value={`${verifiedCount} ta`}
            label="Tasdiqlangan"
            t={t}
            border
          />
          <StatCell
            icon="clock-outline"
            color="#e87a45"
            value={`${pendingCount} ta`}
            label="Kutilmoqda"
            t={t}
          />
        </View>

        {/* List */}
        <View style={s.list}>
          {certificates.length === 0 ? (
            <View style={s.empty}>
              <View style={[s.emptyIcon, { backgroundColor: t.card, borderColor: t.border }]}>
                <MaterialCommunityIcons name="certificate-outline" size={40} color={t.faint} />
              </View>
              <Text style={[s.emptyText, { color: t.text }]}>Sertifikatlar yo'q</Text>
              <Text style={[s.emptySub, { color: t.muted }]}>
                Malaka va tajribangizni tasdiqlovchi sertifikatlaringizni qo'shing
              </Text>
              <TouchableOpacity
                style={[s.emptyAddBtn, { backgroundColor: t.orange }]}
                onPress={() => setShowAddScreen(true)}
                activeOpacity={0.85}
              >
                <MaterialCommunityIcons name="plus" size={16} color="#fff" />
                <Text style={s.emptyAddText}>Sertifikat qo'shish</Text>
              </TouchableOpacity>
            </View>
          ) : (
            certificates.map((cert) => (
              <CertificateCard
                key={cert.id}
                cert={cert}
                t={t}
                onViewImage={setViewerImage}
                onRequestDelete={setDeleteTarget}
              />
            ))
          )}
        </View>
      </ScrollView>

      <Modal
        visible={!!viewerImage}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setViewerImage(null)}
      >
        <View style={s.viewerOverlay}>
          <TouchableOpacity
            style={s.viewerCloseBtn}
            onPress={() => setViewerImage(null)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="close" size={20} color="#fff" />
          </TouchableOpacity>
          {viewerImage && (
            <Image source={toImgSource(viewerImage)} style={s.viewerImage} resizeMode="contain" />
          )}
        </View>
      </Modal>

      <ConfirmDeleteModal
        cert={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        t={t}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontWeight: '700', fontSize: 20, flex: 1 },
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  statCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 11,
    paddingHorizontal: 10,
  },
  statIcon: {
    width: 27,
    height: 27,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statVal: { fontWeight: '800', fontSize: 13.5 },
  statLbl: { fontSize: 9.5, marginTop: 1 },

  list: { paddingHorizontal: 16, paddingTop: 16, gap: 12 },

  card: { position: 'relative', borderRadius: 18, borderWidth: 1, overflow: 'hidden' },
  accentBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, zIndex: 1 },

  imageWrap: { width: '100%', height: 130, position: 'relative' },
  image: { width: '100%', height: '100%' },

  statusPillAbs: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  statusPillText: { fontSize: 10, fontWeight: '700' },
  fieldChipAbs: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },
  fieldChipAbsText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  zoomBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(10,19,34,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  body: { padding: 14, paddingLeft: 18 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  title: { fontSize: 14.5, fontWeight: '800', letterSpacing: -0.2, lineHeight: 19 },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  infoCard: { marginTop: 13, paddingTop: 12, borderTopWidth: 1, gap: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  infoRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 7, flexShrink: 0 },
  infoLabel: { fontSize: 12, fontWeight: '600' },
  infoValue: { fontSize: 12.5, fontWeight: '700', flexShrink: 1, textAlign: 'right' },

  empty: { alignItems: 'center', paddingTop: 56, paddingHorizontal: 40 },
  emptyIcon: {
    width: 84,
    height: 84,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyText: { fontWeight: '800', fontSize: 15.5 },
  emptySub: { fontWeight: '600', fontSize: 12.5, marginTop: 6, textAlign: 'center' },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 13,
  },
  emptyAddText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  viewerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(4,8,14,0.94)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewerImage: { width: '100%', height: '70%' },
  viewerCloseBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },

  confirmOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(4,8,14,0.6)',
  },
  confirmWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  confirmCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 22,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  confirmIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  confirmTitle: { fontSize: 17, fontWeight: '800', textAlign: 'center' },
  confirmMessage: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 8,
  },
  confirmActions: { flexDirection: 'row', gap: 10, marginTop: 22, width: '100%' },
  confirmBtnGhost: {
    flex: 1,
    height: 48,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnGhostText: { fontSize: 14, fontWeight: '700' },
  confirmBtnDanger: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 48,
    borderRadius: 13,
  },
  confirmBtnDangerText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
