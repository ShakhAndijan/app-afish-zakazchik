import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';

// Ism, telefon, manzil va "Tahrirlash" tugmasi. Bo'sh qiymatlar chizilmaydi (zaxira matn yo'q).
export default function ProfileInfo({ name, phone, location, onEdit }) {
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
            <MaterialCommunityIcons name="shield-check" size={15} color={t.green} />
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

const styles = StyleSheet.create({
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
