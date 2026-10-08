import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { common } from '../styles';
import PhoneField from '../components/PhoneField';

export default function ContactSection({ phone, setPhone }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();

  return (
    <>
      {/* ── Telefon ── */}
      <Text style={[common.label, { color: t.text }]}>
        {tr('newOrder.phoneLabel')} <Text style={{ color: '#E1523D' }}>*</Text>
      </Text>
      <PhoneField value={phone} onChangeText={setPhone} placeholder="90 123 45 67" t={t} />
      <Text style={[common.hint, { color: t.muted, marginTop: 6 }]}>
        {tr('newOrder.phoneHint')}
      </Text>
    </>
  );
}

// Zaxira telefon raqami (ixtiyoriy): "Qo'shimcha ma'lumotlar" ichida turadi.
export function BackupPhoneSection({ backupPhone, setBackupPhone }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const [showBackupPhone, setShowBackupPhone] = useState(!!backupPhone);

  return (
    <>
      {showBackupPhone ? (
        <>
          <View style={s.backupPhoneHeader}>
            <Text style={[common.label, { color: t.text, marginTop: 14, marginBottom: 0 }]}>
              {tr('newOrder.backupPhoneLabel')}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowBackupPhone(false);
                setBackupPhone('');
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialCommunityIcons name="close" size={16} color={t.muted} />
            </TouchableOpacity>
          </View>
          <PhoneField
            value={backupPhone}
            onChangeText={setBackupPhone}
            placeholder="90 123 45 67"
            t={t}
          />
        </>
      ) : (
        <TouchableOpacity
          onPress={() => setShowBackupPhone(true)}
          activeOpacity={0.8}
          style={[
            common.addChip,
            { borderColor: t.orange, alignSelf: 'flex-start', marginTop: 12 },
          ]}
        >
          <MaterialCommunityIcons name="phone-plus-outline" size={16} color={t.orange} />
          <Text style={[common.addChipTxt, { color: t.orange }]}>
            {tr('newOrder.addBackupPhoneBtn')}
          </Text>
        </TouchableOpacity>
      )}
    </>
  );
}

const s = StyleSheet.create({
  backupPhoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
