import { useState } from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { appAlert } from '../../components/AppAlert';
import PhoneField from '../new-order/components/PhoneField';
import SelectField from '../new-order/components/SelectField';
import OptionSheet from '../new-order/components/OptionSheet';
import { stripCountryCode } from '../new-order/utils';
import { useBusiness, useCreateSite, useUpdateSite } from '../../queries/business';
import { useDistricts, useRegions } from '../../queries/reference';
import { getErrorMessage } from '../../utils/errors';
import { Button, Field, Frame } from './ui';

// Obyekt qo'shish/tahrirlash (`siteId` bo'lsa — tahrirlash). Buyurtma va doimiy xizmat shu manzil bo'yicha beriladi.
export default function SiteFormScreen({ siteId, onBack }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const { data } = useBusiness();
  const site = siteId ? data?.sites.find((s) => s.id === siteId) : null;

  const [form, setForm] = useState(() => ({
    name: site?.name ?? '',
    regionId: site?.regionId ?? null,
    districtId: site?.districtId ?? null,
    address: site?.address ?? '',
    landmark: site?.landmark ?? '',
    phone: stripCountryCode(site?.contactPhone),
  }));
  const [sheet, setSheet] = useState(null); // 'region' | 'district' | null
  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const regions = useRegions().data ?? [];
  const districts = useDistricts(form.regionId).data ?? [];
  const create = useCreateSite();
  const update = useUpdateSite();
  const mutation = site ? update : create;

  const valid =
    form.name.trim().length >= 2 &&
    form.address.trim().length >= 3 &&
    (form.phone.length === 0 || form.phone.length === 9);

  const submit = () => {
    if (!valid) {
      appAlert(tr('common.errorTitle'), tr('business.sites.invalid'));
      return;
    }
    const payload = { ...form, contactPhone: form.phone ? `+998${form.phone}` : '' };
    const done = {
      onSuccess: onBack,
      onError: (e) =>
        appAlert(tr('common.errorTitle'), getErrorMessage(e, tr, 'business.form.failed')),
    };
    if (site) update.mutate({ id: site.id, form: payload }, done);
    else create.mutate(payload, done);
  };

  return (
    <Frame
      title={tr(site ? 'business.sites.editTitle' : 'business.sites.addTitle')}
      onBack={onBack}
    >
      <Field
        label={tr('business.sites.name')}
        value={form.name}
        onChangeText={set('name')}
        placeholder={tr('business.sites.namePlaceholder')}
        maxLength={120}
      />
      <SelectField
        label={tr('business.sites.region')}
        value={regions.find((r) => r.id === form.regionId)?.name}
        placeholder={tr('business.sites.choose')}
        onPress={() => setSheet('region')}
        t={t}
        bg={t.inputBg}
      />
      <SelectField
        label={tr('business.sites.district')}
        value={districts.find((d) => d.id === form.districtId)?.name}
        placeholder={tr('business.sites.choose')}
        onPress={() => setSheet('district')}
        disabled={!form.regionId}
        t={t}
        bg={t.inputBg}
      />
      <Field
        label={tr('business.sites.address')}
        value={form.address}
        onChangeText={set('address')}
        maxLength={300}
      />
      <Field
        label={tr('business.sites.landmark')}
        value={form.landmark}
        onChangeText={set('landmark')}
        maxLength={300}
      />
      <View style={{ gap: 8 }}>
        <Text style={{ color: t.text, fontSize: 14, fontWeight: '800' }}>
          {tr('business.sites.contactPhone')}
        </Text>
        <PhoneField
          value={form.phone}
          onChangeText={set('phone')}
          placeholder="90 123 45 67"
          t={t}
        />
      </View>

      <Button
        label={tr('business.form.save')}
        onPress={submit}
        busy={mutation.isPending}
        disabled={!valid}
      />

      <OptionSheet
        visible={sheet === 'region'}
        onClose={() => setSheet(null)}
        title={tr('business.sites.region')}
        options={regions}
        selectedId={form.regionId}
        onSelect={(id) => setForm((f) => ({ ...f, regionId: id, districtId: null }))}
        t={t}
        tr={tr}
      />
      <OptionSheet
        visible={sheet === 'district'}
        onClose={() => setSheet(null)}
        title={tr('business.sites.district')}
        options={districts}
        selectedId={form.districtId}
        onSelect={set('districtId')}
        t={t}
        tr={tr}
      />
    </Frame>
  );
}
