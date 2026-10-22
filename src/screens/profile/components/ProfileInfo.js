import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';

// Ism, telefon, manzil va "Tahrirlash" tugmasi. Bo'sh qiymatlar chizilmaydi (zaxira matn yo'q).
export default function ProfileInfo({
  name,
  phone,
  location,
  onEdit,
  identityStatus,
  rating,
  onIdentityPress,
  onRatingPress,
}) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();

  return (
    <View style={{ flex: 1, paddingTop: 2 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
        {!!name && (
          <>
            <Text style={{ fontWeight: '700', fontSize: 18, color: t.text }} numberOfLines={1}>
              {name}
            </Text>
            {identityStatus === 'approved' && (
              <MaterialCommunityIcons name="shield-check" size={15} color={t.green} />
            )}
          </>
        )}
      </View>
      {!!phone && <Text style={{ fontSize: 12.5, color: t.muted, marginTop: 3 }}>{phone}</Text>}
      {!!location && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
          <MaterialCommunityIcons name="map-marker-outline" size={12} color={t.faint} />
          <Text style={{ fontSize: 11.5, color: t.faint }} numberOfLines={1}>
            {location}
          </Text>
        </View>
      )}
      <View style={styles.chips}>
        {identityStatus === 'approved' ? (
          <Chip icon="shield-check" color={t.green} label={tr('account.identityApproved')} />
        ) : identityStatus ? (
          <Chip
            icon="shield-account-outline"
            color={identityStatus === 'rejected' ? t.red : t.gold}
            label={`${tr('account.identity')}: ${tr(`account.verify.status.${identityStatus}`)}`}
            onPress={onIdentityPress}
          />
        ) : null}
        <Chip
          icon="star"
          color={t.gold}
          label={rating ? rating.toFixed(1) : tr('account.noRatingYet')}
          onPress={onRatingPress}
        />
      </View>
      <TouchableOpacity
        style={[styles.editBtn, { borderColor: t.border, backgroundColor: t.card }]}
        activeOpacity={0.8}
        onPress={onEdit}
      >
        <MaterialCommunityIcons name="pencil-outline" size={13} color={t.text} />
        <Text style={{ color: t.text, fontWeight: '700', fontSize: 12, marginLeft: 6 }}>
          {tr('common.edit')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function Chip({ icon, color, label, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.chip, { backgroundColor: color + '26' }]}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
      onPress={onPress}
    >
      <MaterialCommunityIcons name={icon} size={12} color={color} />
      <Text style={{ color, fontWeight: '700', fontSize: 11.5 }} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
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
});
