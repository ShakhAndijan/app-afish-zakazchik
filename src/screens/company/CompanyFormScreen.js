import { useState } from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { appAlert } from '../../components/AppAlert';
import PhoneField from '../new-order/components/PhoneField';
import { stripCountryCode } from '../new-order/utils';
import { ORG_KINDS } from '../../api/business';
import { useApplyBusiness, useBusiness, useUpdateBusiness } from '../../queries/business';
import { getErrorMessage } from '../../utils/errors';
import { Button, Chips, Field, Frame } from './ui';

const EMAIL = /^\S+@\S+\.\S+$/;

// Kompaniya arizasi (yangi yoki rad etilgandan keyin qayta) va ma'lumotlarni tahrirlash.
// Nom, tur va STIR faqat ariza ko'rib chiqilayotganda o'zgaradi (backend qoidasi).
export default function CompanyFormScreen({ onBack }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const { data } = useBusiness();
  const org = data?.organization ?? null;

  // Faqat tasdiqlangan yoki ko'rib chiqilayotgan kompaniya tahrirlanadi; rad etilgan — qayta ariza.
  const editing = org?.status === 'pending' || org?.status === 'approved';
  const locked = org?.status === 'approved';

  const [form, setForm] = useState(() => ({
    name: org?.name ?? '',
    kind: org?.kind ?? 'office',
    tin: org?.tin ?? '',
    legalAddress: org?.legalAddress ?? '',
    contactName: org?.contactName ?? '',
    phone: stripCountryCode(org?.contactPhone),
    email: org?.email ?? '',
    needs: org?.needs ?? '',
  }));
  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const apply = useApplyBusiness();
  const update = useUpdateBusiness();
  const mutation = editing ? update : apply;

  const valid =
    form.name.trim().length >= 2 &&
    form.contactName.trim().length >= 2 &&
    form.phone.length === 9 &&
    (!form.tin.trim() || /^\d{9}$/.test(form.tin.trim())) &&
    (!form.email.trim() || EMAIL.test(form.email.trim()));

  const submit = () => {
    if (!valid) {
      appAlert(tr('common.errorTitle'), tr('business.form.invalid'));
      return;
    }
    mutation.mutate(
      { ...form, contactPhone: `+998${form.phone}` },
      {
        onSuccess: () => {
          appAlert(
            tr(editing ? 'business.form.savedTitle' : 'business.form.sentTitle'),
            editing ? undefined : tr('business.form.sentText'),
            [{ onPress: onBack }]
          );
        },
        onError: (e) =>
          appAlert(tr('common.errorTitle'), getErrorMessage(e, tr, 'business.form.failed')),
      }
    );
  };

  const submitLabel = editing
    ? tr('business.form.save')
    : tr(org ? 'business.form.resubmit' : 'business.form.submit');

  return (
    <Frame
      title={tr(editing ? 'business.form.editTitle' : 'business.form.applyTitle')}
      onBack={onBack}
    >
      {locked && (
        <Text style={{ color: t.muted, fontSize: 13, lineHeight: 19 }}>
          {tr('business.form.lockedHint')}
        </Text>
      )}

      <Field
        label={tr('business.form.name')}
        value={form.name}
        onChangeText={set('name')}
        maxLength={200}
        editable={!locked}
        inputStyle={locked && { opacity: 0.55 }}
      />
      <Chips
        label={tr('business.form.kind')}
        options={ORG_KINDS.map((k) => ({ value: k, label: tr(`business.kinds.${k}`) }))}
        value={form.kind}
        onChange={set('kind')}
        disabled={locked}
      />
      <Field
        label={tr('business.form.tin')}
        hint={tr('business.form.tinHint')}
        value={form.tin}
        onChangeText={(v) => set('tin')(v.replace(/\D/g, '').slice(0, 9))}
        keyboardType="number-pad"
        editable={!locked}
        inputStyle={locked && { opacity: 0.55 }}
      />
      <Field
        label={tr('business.form.legalAddress')}
        value={form.legalAddress}
        onChangeText={set('legalAddress')}
        maxLength={300}
      />
      <Field
        label={tr('business.form.contactName')}
        value={form.contactName}
        onChangeText={set('contactName')}
        maxLength={150}
      />
      <View style={{ gap: 8 }}>
        <Text style={{ color: t.text, fontSize: 14, fontWeight: '800' }}>
          {tr('business.form.contactPhone')}
        </Text>
        <PhoneField
          value={form.phone}
          onChangeText={set('phone')}
          placeholder="90 123 45 67"
          t={t}
        />
      </View>
      <Field
        label={tr('business.form.email')}
        value={form.email}
        onChangeText={set('email')}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Field
        label={tr('business.form.needs')}
        value={form.needs}
        onChangeText={set('needs')}
        placeholder={tr('business.form.needsPlaceholder')}
        multiline
        maxLength={2000}
      />

      <Button label={submitLabel} onPress={submit} busy={mutation.isPending} disabled={!valid} />
    </Frame>
  );
}
