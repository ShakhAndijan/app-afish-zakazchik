import { useCallback, useEffect, useState } from 'react';
import {
  AppState,
  Image,
  Linking,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { appAlert } from '../components/AppAlert';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import AppLoader from '../components/AppLoader';
import SectionError from './zakazchi-main/components/SectionError';
import { getIdentityStatus, startIdentityProvider, submitIdentityDocuments } from '../api/account';
import { getErrorMessage } from '../utils/errors';
import useBottomInset from '../hooks/useBottomInset';

const MIN_FILES = 2;
const MAX_FILES = 5;
const MAX_BYTES = 10 * 1024 * 1024;
const TONE = { pending: 'gold', approved: 'green', rejected: 'red', not_submitted: 'muted' };
const STATUS_ICON = {
  approved: 'check-circle-outline',
  rejected: 'alert-circle-outline',
  pending: 'clock-outline',
  not_submitted: 'shield-account-outline',
};

// Shaxsni tasdiqlash (saytdagi "Profilingizni tasdiqlang"): pasport/ID rasmi + hujjat bilan selfie
// administratorga yuboriladi; MyID mavjud bo'lsa tezkor tasdiqlash ham taklif qilinadi.
export default function VerifyIdentityScreen({ onBack }) {
  const bottomInset = useBottomInset();
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const queryClient = useQueryClient();
  const status = useQuery({ queryKey: ['identity', 'status'], queryFn: getIdentityStatus });
  const [files, setFiles] = useState([]);
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [starting, setStarting] = useState(false);

  // MyID brauzerda tugagach ilovaga qaytilganda holat qayta o'qiladi.
  const refetch = status.refetch;
  useEffect(() => {
    const sub = AppState.addEventListener('change', (st) => {
      if (st === 'active') refetch();
    });
    return () => sub.remove();
  }, [refetch]);

  const pick = useCallback(
    async (fromCamera) => {
      const perm = fromCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        appAlert(
          tr('profile.errors.permissionTitle'),
          tr(fromCamera ? 'profile.errors.cameraPermission' : 'profile.errors.galleryPermission')
        );
        return;
      }
      const options = { quality: 0.8 };
      const res = fromCamera
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync({ ...options, mediaTypes: ['images'] });
      if (res.canceled) return;
      const a = res.assets[0];
      if (a.fileSize && a.fileSize > MAX_BYTES) {
        appAlert(tr('common.errorTitle'), tr('account.verify.tooLarge'));
        return;
      }
      setFiles((prev) =>
        [...prev, { uri: a.uri, mimeType: a.mimeType || 'image/jpeg' }].slice(0, MAX_FILES)
      );
    },
    [tr]
  );

  const addFile = () =>
    appAlert(tr('account.verify.addPhoto'), undefined, [
      { text: tr('avatarPicker.camera'), onPress: () => pick(true) },
      { text: tr('avatarPicker.gallery'), onPress: () => pick(false) },
      { text: tr('common.cancel'), style: 'cancel' },
    ]);

  const submit = async () => {
    setSending(true);
    try {
      await submitIdentityDocuments(files);
      setFiles([]);
      setConsent(false);
      await queryClient.invalidateQueries({ queryKey: ['identity', 'status'] });
      appAlert(tr('account.verify.submitted'));
    } catch (e) {
      appAlert(tr('common.errorTitle'), getErrorMessage(e, tr, 'account.verify.sendFailed'));
    } finally {
      setSending(false);
    }
  };

  const startMyId = async () => {
    setStarting(true);
    try {
      const { redirect_url } = await startIdentityProvider('myid');
      await Linking.openURL(redirect_url);
    } catch (e) {
      appAlert(tr('common.errorTitle'), getErrorMessage(e, tr, 'account.verify.sendFailed'));
    } finally {
      setStarting(false);
    }
  };

  const st = status.data?.submission_status ?? 'not_submitted';
  const canSend = st === 'not_submitted' || st === 'rejected';
  const hasMyId = (status.data?.available_providers ?? []).includes('myid');
  const tone = TONE[st] ?? 'muted';
  const toneColor = t[tone] ?? t.muted;
  const ready = files.length >= MIN_FILES && consent && !sending;
  const slotLabel = (i) =>
    i === 0
      ? tr('account.verify.slotDocument')
      : i === 1
        ? tr('account.verify.slotSelfie')
        : tr('account.verify.slotExtra');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top', 'left', 'right']}>
      <StatusBar style={t.isDark ? 'light' : 'dark'} />
      <View style={s.header}>
        <TouchableOpacity
          style={[s.backBtn, { backgroundColor: t.card, borderColor: t.border }]}
          onPress={onBack}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="chevron-left" size={24} color={t.text} />
        </TouchableOpacity>
        <Text style={[s.title, { color: t.text }]} numberOfLines={1}>
          {tr('account.verify.title')}
        </Text>
      </View>

      {status.isPending ? (
        <View style={s.center}>
          <AppLoader size={160} />
        </View>
      ) : status.isError ? (
        <SectionError style={{ marginHorizontal: 20, marginTop: 24 }} onRetry={status.refetch} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 32 + bottomInset,
            gap: 14,
          }}
        >
          <Text style={[s.lead, { color: t.muted }]}>{tr('account.verify.subtitle')}</Text>

          <View
            style={[s.status, { borderColor: toneColor + '66', backgroundColor: toneColor + '14' }]}
          >
            <MaterialCommunityIcons name={STATUS_ICON[st]} size={22} color={toneColor} />
            <View style={{ flex: 1 }}>
              <Text style={[s.statusTitle, { color: t.text }]}>
                {tr(`account.verify.status.${st}`)}
              </Text>
              {st === 'rejected' && !!status.data?.rejected_reason && (
                <Text style={[s.statusText, { color: t.muted }]}>
                  {status.data.rejected_reason}
                </Text>
              )}
            </View>
          </View>

          {canSend && (
            <>
              <View style={[s.card, { backgroundColor: t.card, borderColor: t.border }]}>
                <Text style={[s.cardTitle, { color: t.text }]}>
                  {tr('account.verify.needTitle')}
                </Text>
                <Need
                  icon="card-account-details-outline"
                  title={tr('account.verify.needDoc')}
                  hint={tr('account.verify.needDocHint')}
                  t={t}
                />
                <Need
                  icon="camera-outline"
                  title={tr('account.verify.needSelfie')}
                  hint={tr('account.verify.needSelfieHint')}
                  t={t}
                />
                <View style={s.note}>
                  <MaterialCommunityIcons name="lock-outline" size={15} color={t.muted} />
                  <Text style={[s.noteText, { color: t.muted }]}>
                    {tr('account.verify.privacyNote')}
                  </Text>
                </View>
              </View>

              {hasMyId && (
                <View style={[s.card, { backgroundColor: t.card, borderColor: t.border }]}>
                  <Text style={[s.cardTitle, { color: t.text }]}>
                    {tr('account.verify.autoTitle')}
                  </Text>
                  <Text style={[s.lead, { color: t.muted }]}>{tr('account.verify.autoBody')}</Text>
                  <TouchableOpacity
                    style={[s.primary, { backgroundColor: t.orange, opacity: starting ? 0.6 : 1 }]}
                    activeOpacity={0.85}
                    disabled={starting}
                    onPress={startMyId}
                  >
                    <MaterialCommunityIcons name="flash" size={18} color="#fff" />
                    <Text style={s.primaryText}>{tr('account.verify.autoStart')}</Text>
                  </TouchableOpacity>
                  <Text style={[s.or, { color: t.faint }]}>{tr('account.verify.autoOr')}</Text>
                </View>
              )}

              <View style={s.slots}>
                {files.map((f, i) => (
                  <View key={`${f.uri}-${i}`} style={[s.slot, { borderColor: t.border }]}>
                    <Image source={{ uri: f.uri }} style={s.slotImg} />
                    <View style={s.slotBadge}>
                      <Text style={s.slotBadgeText} numberOfLines={1}>
                        {slotLabel(i)}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={s.slotRemove}
                      onPress={() => setFiles((prev) => prev.filter((_, k) => k !== i))}
                      accessibilityLabel={tr('common.delete')}
                    >
                      <MaterialCommunityIcons name="close" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
                {files.length < MAX_FILES && (
                  <TouchableOpacity
                    style={[s.slot, s.slotEmpty, { borderColor: t.line2, backgroundColor: t.card }]}
                    activeOpacity={0.8}
                    onPress={addFile}
                  >
                    <MaterialCommunityIcons
                      name={
                        files.length === 0
                          ? 'card-account-details-outline'
                          : files.length === 1
                            ? 'camera-outline'
                            : 'plus'
                      }
                      size={28}
                      color={t.muted}
                    />
                    <Text style={[s.slotLabel, { color: t.muted }]}>{slotLabel(files.length)}</Text>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                style={s.consent}
                activeOpacity={0.8}
                onPress={() => setConsent((v) => !v)}
              >
                <MaterialCommunityIcons
                  name={consent ? 'checkbox-marked' : 'checkbox-blank-outline'}
                  size={24}
                  color={consent ? t.orange : t.muted}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[s.consentTitle, { color: t.text }]}>
                    {tr('account.verify.consentTitle')}
                  </Text>
                  <Text style={[s.statusText, { color: t.muted }]}>
                    {tr('account.verify.consentBody')}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[s.primary, { backgroundColor: t.orange, opacity: ready ? 1 : 0.5 }]}
                activeOpacity={0.85}
                disabled={!ready}
                onPress={submit}
              >
                {sending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <MaterialCommunityIcons name="upload" size={18} color="#fff" />
                )}
                <Text style={s.primaryText}>
                  {st === 'rejected' ? tr('account.verify.resend') : tr('account.verify.send')}
                </Text>
              </TouchableOpacity>
              {files.length < MIN_FILES && (
                <Text style={[s.noteText, { color: t.muted, textAlign: 'center' }]}>
                  {tr('account.verify.needMore', { count: MIN_FILES })}
                </Text>
              )}
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function Need({ icon, title, hint, t }) {
  return (
    <View style={s.need}>
      <View style={[s.needIcon, { backgroundColor: t.rowIconBg }]}>
        <MaterialCommunityIcons name={icon} size={20} color={t.muted} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[s.needTitle, { color: t.text }]}>{title}</Text>
        <Text style={[s.noteText, { color: t.muted }]}>{hint}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
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
  title: { flex: 1, fontWeight: '700', fontSize: 20 },
  lead: { fontSize: 13, lineHeight: 19 },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
  },
  statusTitle: { fontSize: 14.5, fontWeight: '800' },
  statusText: { fontSize: 12.5, lineHeight: 18, marginTop: 2 },
  card: { borderRadius: 18, borderWidth: 1, padding: 16, gap: 12 },
  cardTitle: { fontWeight: '800', fontSize: 15.5 },
  need: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  needIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  needTitle: { fontSize: 14, fontWeight: '700' },
  note: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  noteText: { flex: 1, fontSize: 12, lineHeight: 17 },
  primary: {
    height: 50,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  or: { textAlign: 'center', fontSize: 12.5 },
  slots: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  slot: { width: '47.8%', aspectRatio: 1.15, borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  slotEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderStyle: 'dashed',
    borderWidth: 1.5,
  },
  slotLabel: { fontSize: 12.5, fontWeight: '600', textAlign: 'center', paddingHorizontal: 8 },
  slotImg: { width: '100%', height: '100%' },
  slotBadge: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    maxWidth: '80%',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  slotBadgeText: { color: '#fff', fontSize: 11.5, fontWeight: '700' },
  slotRemove: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  consent: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  consentTitle: { fontSize: 13.5, fontWeight: '700' },
});
