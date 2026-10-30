import { useState } from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { appAlert } from '../../components/AppAlert';
import SelectField from '../new-order/components/SelectField';
import OptionSheet from '../new-order/components/OptionSheet';
import { PLAN_FREQUENCIES } from '../../api/business';
import { useCreatePlan, useBusiness, useUpdatePlan } from '../../queries/business';
import { useAllCategoriesQuery } from '../../queries/categories';
import { getErrorMessage } from '../../utils/errors';
import DateField from './DateField';
import { Button, Chips, Field, Frame } from './ui';

// Doimiy xizmat rejasi qo'shish/tahrirlash (`planId` bo'lsa — tahrirlash): obyekt, yo'nalish, ish, chastota, sana.
export default function PlanFormScreen({ planId, onBack }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const { data } = useBusiness();
  const plan = planId ? data?.plans.find((p) => p.id === planId) : null;
  const sites = (data?.sites ?? []).filter((s) => s.isActive || s.id === plan?.siteId);
  const { categories } = useAllCategoriesQuery();

  const [form, setForm] = useState(() => ({
    siteId: plan?.siteId ?? (sites.length === 1 ? sites[0].id : null),
    categoryId: plan?.categoryId ?? null,
    description: plan?.description ?? '',
    frequency: plan?.frequency ?? 'monthly',
    nextDate: plan?.nextDate ?? '',
  }));
  const [sheet, setSheet] = useState(null); // 'site' | 'category' | null
  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const create = useCreatePlan();
  const update = useUpdatePlan();
  const mutation = plan ? update : create;

  const valid =
    form.siteId != null &&
    form.categoryId != null &&
    !!form.nextDate &&
    form.description.trim().length >= 5;

  const submit = () => {
    if (!valid) {
      appAlert(tr('common.errorTitle'), tr('business.plans.invalid'));
      return;
    }
    const done = {
      onSuccess: onBack,
      onError: (e) =>
        appAlert(tr('common.errorTitle'), getErrorMessage(e, tr, 'business.form.failed')),
    };
    if (plan) update.mutate({ id: plan.id, form }, done);
    else create.mutate(form, done);
  };

  return (
    <Frame
      title={tr(plan ? 'business.plans.editTitle' : 'business.plans.addTitle')}
      onBack={onBack}
    >
      <SelectField
        label={tr('business.plans.site')}
        value={sites.find((s) => s.id === form.siteId)?.name}
        placeholder={tr('business.sites.choose')}
        onPress={() => setSheet('site')}
        t={t}
        bg={t.inputBg}
      />
      <SelectField
        label={tr('business.plans.category')}
        value={categories.find((c) => c.id === form.categoryId)?.name}
        placeholder={tr('business.sites.choose')}
        onPress={() => setSheet('category')}
        t={t}
        bg={t.inputBg}
      />
      <Field
        label={tr('business.plans.description')}
        value={form.description}
        onChangeText={set('description')}
        placeholder={tr('business.plans.descriptionPlaceholder')}
        multiline
        maxLength={2000}
      />
      <Chips
        label={tr('business.plans.frequency')}
        options={PLAN_FREQUENCIES.map((f) => ({ value: f, label: tr(`business.freq.${f}`) }))}
        value={form.frequency}
        onChange={set('frequency')}
      />
      <View style={{ gap: 8 }}>
        <Text style={{ color: t.text, fontSize: 14, fontWeight: '800' }}>
          {tr('business.plans.date')}
        </Text>
        <DateField
          value={form.nextDate}
          onChange={set('nextDate')}
          placeholder={tr('business.plans.pickDate')}
        />
      </View>

      <Button
        label={tr('business.form.save')}
        onPress={submit}
        busy={mutation.isPending}
        disabled={!valid}
      />

      <OptionSheet
        visible={sheet === 'site'}
        onClose={() => setSheet(null)}
        title={tr('business.plans.site')}
        options={sites}
        selectedId={form.siteId}
        onSelect={set('siteId')}
        t={t}
        tr={tr}
      />
      <OptionSheet
        visible={sheet === 'category'}
        onClose={() => setSheet(null)}
        title={tr('business.plans.category')}
        options={categories}
        selectedId={form.categoryId}
        onSelect={set('categoryId')}
        t={t}
        tr={tr}
      />
    </Frame>
  );
}
