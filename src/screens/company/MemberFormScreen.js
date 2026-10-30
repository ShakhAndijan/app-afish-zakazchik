import { useState } from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { appAlert } from '../../components/AppAlert';
import PhoneField from '../new-order/components/PhoneField';
import { MEMBER_ROLES } from '../../api/business';
import { useAddMember } from '../../queries/business';
import { getErrorMessage } from '../../utils/errors';
import { Button, Chips, Field, Frame } from './ui';

// Xodim qo'shish: telefon bo'yicha. Hisobi yo'q odam birinchi kirganda kompaniyaga qo'shiladi.
export default function MemberFormScreen({ onBack }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('manager');
  const add = useAddMember();

  const valid = phone.length === 9;

  const submit = () => {
    if (!valid) {
      appAlert(tr('common.errorTitle'), tr('business.members.invalid'));
      return;
    }
    add.mutate(
      { phone: `+998${phone}`, role, name },
      {
        onSuccess: onBack,
        onError: (e) =>
          appAlert(tr('common.errorTitle'), getErrorMessage(e, tr, 'business.form.failed')),
      }
    );
  };

  return (
    <Frame title={tr('business.members.addTitle')} onBack={onBack}>
      <Text style={{ color: t.muted, fontSize: 13.5, lineHeight: 20 }}>
        {tr('business.members.hint')}
      </Text>
      <View style={{ gap: 8 }}>
        <Text style={{ color: t.text, fontSize: 14, fontWeight: '800' }}>
          {tr('business.members.phone')}
        </Text>
        <PhoneField value={phone} onChangeText={setPhone} placeholder="90 123 45 67" t={t} />
      </View>
      <Field
        label={tr('business.members.name')}
        value={name}
        onChangeText={setName}
        maxLength={150}
      />
      <Chips
        label={tr('business.members.role')}
        options={MEMBER_ROLES.map((r) => ({ value: r, label: tr(`business.roles.${r}`) }))}
        value={role}
        onChange={setRole}
      />
      <Button
        label={tr('business.members.submit')}
        onPress={submit}
        busy={add.isPending}
        disabled={!valid}
      />
    </Frame>
  );
}
