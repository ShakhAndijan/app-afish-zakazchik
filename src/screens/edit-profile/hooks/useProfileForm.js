import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useLanguage } from '../../../context/LanguageContext';
import { useUser } from '../../../context/UserContext';
import { getCustomerMe, updateCustomerMe } from '../../../api/user';
import { EMPTY_PROFILE, profileToForm, formToPayload } from '../utils';

// Profil formasi: joriy ma'lumotni yuklaydi (GET /customers/me), qiymatlarni saqlaydi
// va "Saqlash" da yuboradi (PATCH). `setField('firstName', 'Ali')` bitta maydonni o'zgartiradi.
export default function useProfileForm() {
  const { t: tr } = useLanguage();
  const { refreshUser } = useUser();

  const [values, setValues] = useState(EMPTY_PROFILE);
  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const setField = (key, value) => setValues((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    let alive = true;
    getCustomerMe()
      .then((data) => {
        if (!alive || !data) return;
        setValues(profileToForm(data));
      })
      .catch((e) => {
        Alert.alert(tr('common.errorTitle'), e.message || tr('editProfile.loadError'));
      })
      .finally(() => alive && setInitialLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const isReady = values.firstName.trim().length > 0 && values.lastName.trim().length > 0 && !saving;

  const save = async () => {
    if (!isReady) return;
    setSaving(true);
    try {
      await updateCustomerMe(formToPayload(values));
      await refreshUser();
      setSaved(true);
    } catch (e) {
      Alert.alert(tr('common.errorTitle'), e.message || tr('editProfile.saveError'));
    } finally {
      setSaving(false);
    }
  };

  return {
    values,
    setField,
    initialLoading,
    saving,
    isReady,
    save,
    saved,
    dismissSaved: () => setSaved(false),
  };
}
