import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { getAvatarUploadUrl, confirmAvatar, deleteAvatar } from '../api/user';
import { uploadImageToPresignedUrl } from '../api/auth';
import ZakazchiHelpScreen from './ZakazchiHelpScreen';
import ZakazchiNotifScreen from './ZakazchiNotifScreen';
import ZakazchiOrdersScreen from './ZakazchiOrdersScreen';
import ZakazchiPromoScreen from './ZakazchiPromoScreen';
import ZakazchiReferralScreen from './ZakazchiReferralScreen';
import ChangePasswordScreen from './ChangePasswordScreen';
import EditProfileScreen from './EditProfileScreen';
import PaymentHistoryScreen from './PaymentHistoryScreen';
import ChangePhoneScreen from './ChangePhoneScreen';
import CertificatesScreen from './CertificatesScreen';
import TilBottomSheet, { LANGS } from '../components/TilBottomSheet';
import AvatarPickerSheet from '../components/AvatarPickerSheet';
import BottomNav from '../components/BottomNav';

const formatPhoneDisplay = (raw = '') => {
  let d = raw.replace(/\D/g, '');
  if (d.startsWith('998') && d.length > 9) d = d.slice(3); // to'liq raqamdan (+998...) mamlakat kodini olib tashlaymiz
  d = d.slice(0, 9);
  let s = '';
  if (d.length > 0) s += d.slice(0, 2);
  if (d.length > 2) s += ' ' + d.slice(2, 5);
  if (d.length > 5) s += ' ' + d.slice(5, 7);
  if (d.length > 7) s += ' ' + d.slice(7, 9);
  return `+998 ${s}`.trim();
};

// Android'dagi Image (Fresco/OkHttp) kodlanmagan "+" belgisini URL'da
// noto'g'ri talqin qilib, rasmni yuklolmasligi mumkin — shu sababli xavfsiz kodlaymiz.
const encodeImageUri = (uri) => (uri ? uri.replace(/\+/g, '%2B') : uri);

function Avatar({ letter = 'J', size = 80, bgColor, uri }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.3,
        backgroundColor: uri ? 'transparent' : bgColor,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {uri ? (
        <Image
          source={{ uri: encodeImageUri(uri) }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
      ) : (
        <Text
          style={{ color: '#fff', fontSize: size * 0.4, fontWeight: '700' }}
        >
          {letter}
        </Text>
      )}
    </View>
  );
}

async function pickFromGallery(onPicked) {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) {
    Alert.alert('Ruxsat kerak', 'Galereyadan foydalanish uchun ruxsat bering.');
    return;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.8,
    allowsEditing: true,
    aspect: [1, 1],
  });
  if (!result.canceled) {
    const asset = result.assets[0];
    onPicked(asset.uri, asset.mimeType || 'image/jpeg');
  }
}

async function pickFromCamera(onPicked) {
  const perm = await ImagePicker.requestCameraPermissionsAsync();
  if (!perm.granted) {
    Alert.alert('Ruxsat kerak', 'Kameradan foydalanish uchun ruxsat bering.');
    return;
  }
  const result = await ImagePicker.launchCameraAsync({
    quality: 0.8,
    allowsEditing: true,
    aspect: [1, 1],
  });
  if (!result.canceled) {
    const asset = result.assets[0];
    onPicked(asset.uri, asset.mimeType || 'image/jpeg');
  }
}

function SettingsRow({ icon, label, value, danger, color, onPress, t }) {
  return (
    <TouchableOpacity style={s.row} activeOpacity={0.7} onPress={onPress}>
      <View
        style={[
          s.rowIcon,
          { backgroundColor: danger ? 'rgba(224,71,58,0.13)' : t.rowIconBg },
        ]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={19}
          color={danger ? t.red : color || t.muted}
        />
      </View>
      <Text style={[s.rowLabel, { color: danger ? t.red : t.text }]}>
        {label}
      </Text>
      {value ? (
        <Text style={[s.rowValue, { color: t.muted }]}>{value}</Text>
      ) : null}
      {!danger && (
        <MaterialCommunityIcons
          name="chevron-right"
          size={18}
          color={t.faint}
        />
      )}
    </TouchableOpacity>
  );
}

export default function ZakazchiProfileScreen({ onTabChange, onLogout }) {
  const { theme: t, toggleTheme } = useTheme();
  const { user, refreshUser } = useUser();
  const [screen, setScreen] = useState('profile');
  const [lang, setLang] = useState('uz');
  const [showTil, setShowTil] = useState(false);
  const [avatarUri, setAvatarUri] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [showAvatarSheet, setShowAvatarSheet] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(null);

  const displayName =
    [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim() ||
    'Jasur Rahimov';
  const displayLetter = (user?.first_name || 'J')[0].toUpperCase();
  const displayPhone =
    phoneNumber ||
    (user?.phone ? formatPhoneDisplay(user.phone) : '+998 90 123 45 67');
  const displayAvatarUri = avatarUri || user?.profile_photo || null;
  const displayLocation = [user?.district, user?.region]
    .filter(Boolean)
    .join(', ');

  const commitAvatar = async (uri, contentType = 'image/jpeg') => {
    setAvatarUri(uri);
    setAvatarUploading(true);
    try {
      const { upload_url, temp_key } = await getAvatarUploadUrl(contentType);
      await uploadImageToPresignedUrl(upload_url, uri, contentType);
      await confirmAvatar(temp_key);
      await refreshUser();
      setAvatarUri(null);
    } catch (e) {
      setAvatarUri(null);
      Alert.alert(
        'Xatolik',
        e.message || "Avatar yuklanmadi, qayta urinib ko'ring"
      );
    } finally {
      setAvatarUploading(false);
    }
  };

  const handlePickCamera = () => {
    setShowAvatarSheet(false);
    pickFromCamera(commitAvatar);
  };

  const handlePickGallery = () => {
    setShowAvatarSheet(false);
    pickFromGallery(commitAvatar);
  };

  const handleRemoveAvatar = async () => {
    setShowAvatarSheet(false);
    setAvatarUri(null);
    setAvatarUploading(true);
    try {
      await deleteAvatar();
      await refreshUser();
    } catch (e) {
      Alert.alert(
        'Xatolik',
        e.message || "Rasmni o'chirib bo'lmadi, qayta urinib ko'ring"
      );
    } finally {
      setAvatarUploading(false);
    }
  };

  if (screen === 'help') {
    return <ZakazchiHelpScreen onBack={() => setScreen('profile')} />;
  }

  if (screen === 'notif') {
    return <ZakazchiNotifScreen onBack={() => setScreen('profile')} />;
  }

  if (screen === 'orders') {
    return <ZakazchiOrdersScreen onBack={() => setScreen('profile')} />;
  }

  if (screen === 'certificates') {
    return <CertificatesScreen onBack={() => setScreen('profile')} />;
  }

  if (screen === 'promo') {
    return <ZakazchiPromoScreen onBack={() => setScreen('profile')} />;
  }

  if (screen === 'referral') {
    return <ZakazchiReferralScreen onBack={() => setScreen('profile')} />;
  }

  if (screen === 'password') {
    return <ChangePasswordScreen onBack={() => setScreen('profile')} />;
  }

  if (screen === 'editProfile') {
    return <EditProfileScreen onBack={() => setScreen('profile')} />;
  }

  if (screen === 'paymentHistory') {
    return <PaymentHistoryScreen onBack={() => setScreen('profile')} />;
  }

  if (screen === 'changePhone') {
    return (
      <ChangePhoneScreen
        currentPhone={displayPhone}
        onBack={() => setScreen('profile')}
        onChanged={(digits) => {
          setPhoneNumber(formatPhoneDisplay(digits));
          setScreen('profile');
        }}
      />
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: t.bg }}
      edges={['top', 'left', 'right']}
    >
      <StatusBar style={t.isDark ? 'light' : 'dark'} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 90 }}
      >
        {/* ── Cover Header ── */}
        <View style={[s.cover, { backgroundColor: t.cover }]}>
          <View
            style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14 }}
          >
            <TouchableOpacity
              style={s.avatarWrap}
              activeOpacity={0.85}
              onPress={() => setShowAvatarSheet(true)}
              disabled={avatarUploading}
            >
              <Avatar
                letter={displayLetter}
                size={72}
                bgColor={t.orange}
                uri={displayAvatarUri}
              />
              {avatarUploading && (
                <View style={[s.avatarOverlay, { borderRadius: 72 * 0.3 }]}>
                  <ActivityIndicator size="small" color="#fff" />
                </View>
              )}
              <View
                style={[
                  s.avatarBadge,
                  { backgroundColor: t.orange, borderColor: t.cover },
                ]}
              >
                <MaterialCommunityIcons name="camera" size={12} color="#fff" />
              </View>
            </TouchableOpacity>

            <View style={{ flex: 1, paddingTop: 2 }}>
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}
              >
                <Text
                  style={{ fontWeight: '700', fontSize: 18, color: t.text }}
                  numberOfLines={1}
                >
                  {displayName}
                </Text>
                <MaterialCommunityIcons
                  name="shield-check"
                  size={15}
                  color={t.green}
                />
              </View>
              <Text style={{ fontSize: 12.5, color: t.muted, marginTop: 3 }}>
                {displayPhone}
              </Text>
              {!!displayLocation && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    marginTop: 3,
                  }}
                >
                  <MaterialCommunityIcons
                    name="map-marker-outline"
                    size={12}
                    color={t.faint}
                  />
                  <Text
                    style={{ fontSize: 11.5, color: t.faint }}
                    numberOfLines={1}
                  >
                    {displayLocation}
                  </Text>
                </View>
              )}
              <TouchableOpacity
                style={[
                  s.editBtn,
                  { borderColor: t.border, backgroundColor: t.card },
                ]}
                activeOpacity={0.8}
                onPress={() => setScreen('editProfile')}
              >
                <MaterialCommunityIcons
                  name="pencil-outline"
                  size={13}
                  color={t.text}
                />
                <Text
                  style={{
                    color: t.text,
                    fontWeight: '700',
                    fontSize: 12,
                    marginLeft: 6,
                  }}
                >
                  Tahrirlash
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                s.themeBtn,
                {
                  backgroundColor: t.isDark
                    ? 'rgba(245,196,81,0.14)'
                    : 'rgba(63,127,212,0.12)',
                  borderColor: t.isDark
                    ? 'rgba(245,196,81,0.28)'
                    : 'rgba(63,127,212,0.24)',
                },
              ]}
              activeOpacity={0.8}
              onPress={toggleTheme}
            >
              <Feather
                name={t.isDark ? 'sun' : 'moon'}
                size={19}
                color={t.isDark ? t.gold : t.blue}
              />
            </TouchableOpacity>
          </View>

          {/* Activity stats */}
          <View style={s.statsRow}>
            {[
              {
                value: '18',
                label: 'Buyurtma',
                icon: 'archive-outline',
                color: t.orange,
              },
              {
                value: '12',
                label: 'Sevimli usta',
                icon: 'heart-outline',
                color: t.red,
              },
              {
                value: '4.8',
                label: 'Bahoyingiz',
                icon: 'star-outline',
                color: t.gold,
              },
            ].map((st, i) => (
              <View
                key={i}
                style={[
                  s.statPill,
                  { backgroundColor: t.card, borderColor: t.border },
                ]}
              >
                <View
                  style={[s.statIcon, { backgroundColor: st.color + '1c' }]}
                >
                  <MaterialCommunityIcons
                    name={st.icon}
                    size={13}
                    color={st.color}
                  />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    style={[s.statVal, { color: t.text }]}
                    numberOfLines={1}
                  >
                    {st.value}
                  </Text>
                  <Text
                    style={[s.statLbl, { color: t.muted }]}
                    numberOfLines={1}
                  >
                    {st.label}
                  </Text>
                </View>
                <View style={[s.statAccent, { backgroundColor: st.color }]} />
              </View>
            ))}
          </View>
        </View>

        {/* ── Hamyon + sodiqlik darajasi ── */}
        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
          <View style={[s.walletCard, { overflow: 'hidden' }]}>
            <View style={s.walletCircle} />
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}
            >
              <View style={s.walletIcon}>
                <MaterialCommunityIcons name="wallet" size={22} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.9)' }}
                >
                  AFISH.uz hamyon
                </Text>
                <Text
                  style={{
                    fontWeight: '800',
                    fontSize: 20,
                    color: '#fff',
                    marginTop: 2,
                  }}
                >
                  120 000{' '}
                  <Text
                    style={{ fontSize: 12, fontWeight: '600', opacity: 0.85 }}
                  >
                    so'm
                  </Text>
                </Text>
              </View>
              <TouchableOpacity style={s.topupBtn} activeOpacity={0.8}>
                <Text
                  style={{
                    color: t.orangeD,
                    fontWeight: '700',
                    fontSize: 12.5,
                  }}
                >
                  To'ldirish
                </Text>
              </TouchableOpacity>
            </View>
            {/* Sodiqlik progress */}
            <View
              style={{
                marginTop: 15,
                paddingTop: 14,
                borderTopWidth: 1,
                borderTopColor: 'rgba(255,255,255,0.2)',
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <View
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
                >
                  <Ionicons name="star" size={14} color="#fff" />
                  <Text
                    style={{ fontSize: 12.5, fontWeight: '700', color: '#fff' }}
                  >
                    Kumush mijoz
                  </Text>
                </View>
                <Text
                  style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.9)' }}
                >
                  Oltingacha 3 buyurtma
                </Text>
              </View>
              <View style={s.progressTrack}>
                <View style={[s.progressFill, { width: '70%' }]} />
              </View>
            </View>
          </View>
        </View>

        {/* ── Promokod / taklif ── */}
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 16,
            flexDirection: 'row',
            gap: 12,
          }}
        >
          <TouchableOpacity
            style={[
              s.miniCard,
              { backgroundColor: t.card, borderColor: t.border },
            ]}
            activeOpacity={0.8}
            onPress={() => setScreen('promo')}
          >
            <View
              style={[
                s.miniIcon,
                { backgroundColor: 'rgba(155,108,209,0.16)' },
              ]}
            >
              <MaterialCommunityIcons name="gift" size={20} color={t.violet} />
            </View>
            <Text
              style={{
                fontWeight: '700',
                fontSize: 13.5,
                color: t.text,
                marginTop: 11,
              }}
            >
              Promokodlarim
            </Text>
            <Text
              style={{
                fontSize: 11.5,
                color: t.green,
                marginTop: 2,
                fontWeight: '600',
              }}
            >
              2 ta faol
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              s.miniCard,
              { backgroundColor: t.card, borderColor: t.border },
            ]}
            activeOpacity={0.8}
            onPress={() => setScreen('referral')}
          >
            <View
              style={[s.miniIcon, { backgroundColor: 'rgba(47,163,122,0.16)' }]}
            >
              <MaterialCommunityIcons
                name="account-plus"
                size={20}
                color={t.green}
              />
            </View>
            <Text
              style={{
                fontWeight: '700',
                fontSize: 13.5,
                color: t.text,
                marginTop: 11,
              }}
            >
              Do'stni taklif et
            </Text>
            <Text style={{ fontSize: 11.5, color: t.muted, marginTop: 2 }}>
              20 000 so'm oling
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Asosiy menyu ── */}
        <View style={{ paddingHorizontal: 20, paddingTop: 22 }}>
          <View
            style={[
              s.menuCard,
              { backgroundColor: t.card, borderColor: t.border },
            ]}
          >
            <SettingsRow
              icon="certificate-outline"
              label="Sertifikatlarim"
              value="4 ta"
              color={t.violet}
              t={t}
              onPress={() => setScreen('certificates')}
            />
            <View style={[s.divider, { backgroundColor: t.border }]} />
            <SettingsRow
              icon="format-list-bulleted"
              label="Buyurtmalar tarixi"
              value="18 ta"
              color={t.blue}
              t={t}
              onPress={() => setScreen('orders')}
            />
            <View style={[s.divider, { backgroundColor: t.border }]} />
            <SettingsRow
              icon="map-marker-outline"
              label="Mening manzillarim"
              value="3 ta"
              color={t.green}
              t={t}
            />
            <View style={[s.divider, { backgroundColor: t.border }]} />
            <SettingsRow
              icon="receipt-text-outline"
              label="To'lov tarixi"
              color={t.blue}
              t={t}
              onPress={() => setScreen('paymentHistory')}
            />
          </View>
        </View>

        {/* ── Sozlamalar ── */}
        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
          <Text style={[s.groupLabel, { color: t.faint }]}>SOZLAMALAR</Text>
          <View
            style={[
              s.menuCard,
              { backgroundColor: t.card, borderColor: t.border },
            ]}
          >
            <SettingsRow
              icon="bell-outline"
              label="Bildirishnomalar"
              t={t}
              onPress={() => setScreen('notif')}
            />
            <View style={[s.divider, { backgroundColor: t.border }]} />
            <SettingsRow
              icon="earth"
              label="Til"
              value={LANGS.find((l) => l.code === lang)?.name}
              t={t}
              onPress={() => setShowTil(true)}
            />
            <View style={[s.divider, { backgroundColor: t.border }]} />
            <SettingsRow
              icon="phone-outline"
              label="Telefon raqamini almashtirish"
              t={t}
              onPress={() => setScreen('changePhone')}
            />
            <View style={[s.divider, { backgroundColor: t.border }]} />
            <SettingsRow
              icon="lock-outline"
              label="Parolni almashtirish"
              t={t}
              onPress={() => setScreen('password')}
            />
            <View style={[s.divider, { backgroundColor: t.border }]} />
            <SettingsRow
              icon="help-circle-outline"
              label="Yordam markazi"
              t={t}
              onPress={() => setScreen('help')}
            />
          </View>
        </View>

        {/* ── Chiqish ── */}
        <View
          style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 }}
        >
          <View
            style={[
              s.menuCard,
              { backgroundColor: t.card, borderColor: t.border },
            ]}
          >
            <SettingsRow
              icon="logout"
              label="Hisobdan chiqish"
              danger
              t={t}
              onPress={onLogout}
            />
          </View>
          <Text
            style={{
              textAlign: 'center',
              fontSize: 11.5,
              color: t.faint,
              marginTop: 16,
            }}
          >
            AFISH.uz · versiya 1.0.1
          </Text>
        </View>
      </ScrollView>

      {/* ── Bottom Nav ── */}
      <BottomNav
        activeTab="profile"
        onTabChange={onTabChange}
        accent={t.orange}
        background={t.navBg}
        border={t.border}
        muted={t.faint}
      />
      <TilBottomSheet
        visible={showTil}
        currentLang={lang}
        onSelect={setLang}
        onClose={() => setShowTil(false)}
      />
      <AvatarPickerSheet
        visible={showAvatarSheet}
        onClose={() => setShowAvatarSheet(false)}
        onPickCamera={handlePickCamera}
        onPickGallery={handlePickGallery}
        onRemove={handleRemoveAvatar}
        hasPhoto={!!displayAvatarUri}
        previewUri={displayAvatarUri}
        previewLetter={displayLetter}
        previewColor={t.orange}
        t={t}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  cover: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 22,
  },
  themeBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarWrap: { position: 'relative' },
  avatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10,19,34,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    width: 27,
    height: 27,
    borderRadius: 14,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 18,
  },
  statPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 10,
    paddingBottom: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  statIcon: {
    width: 26,
    height: 26,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statVal: { fontWeight: '800', fontSize: 14 },
  statLbl: { fontSize: 9.5, marginTop: 1 },
  statAccent: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 0,
    height: 2.5,
    borderRadius: 2,
  },

  walletCard: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: '#e87a45',
    position: 'relative',
  },
  walletCircle: {
    position: 'absolute',
    right: -24,
    top: -24,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  walletIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topupBtn: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  progressTrack: {
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 4, backgroundColor: '#fff' },

  miniCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    padding: 15,
  },
  miniIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  groupLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 8,
    paddingLeft: 4,
  },
  menuCard: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingVertical: 14,
  },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rowLabel: { flex: 1, fontWeight: '600', fontSize: 14 },
  rowValue: { fontSize: 12.5 },
  divider: { height: 1 },
});
