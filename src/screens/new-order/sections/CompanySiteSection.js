import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { useBusiness } from '../../../queries/business';
import { common } from '../styles';

// Tasdiqlangan kompaniyasi bor foydalanuvchi (egasi yoki menejer) buyurtmani kompaniya obyekti uchun berishi
// mumkin — buyurtma kompaniyaning oylik hisobotiga tushadi. Kompaniya yo'q bo'lsa — chizilmaydi.
export default function CompanySiteSection({ siteId, onSelect }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const { data } = useBusiness();

  const org = data?.organization;
  const sites = (data?.sites ?? []).filter((s) => s.isActive);
  if (org?.status !== 'approved' || data.role === 'accountant' || sites.length === 0) return null;

  const options = [{ id: null, name: tr('business.orderSite.personal') }, ...sites];

  return (
    <View style={{ marginBottom: 4 }}>
      <Text style={[common.label, { color: t.text }]}>{tr('business.orderSite.label')}</Text>
      <View style={common.chipRow}>
        {options.map((o) => {
          const on = siteId === o.id;
          return (
            <TouchableOpacity
              key={String(o.id)}
              activeOpacity={0.8}
              onPress={() => onSelect(o.id === null ? null : o)}
              style={{
                borderWidth: 1.5,
                borderRadius: 20,
                paddingHorizontal: 14,
                paddingVertical: 9,
                backgroundColor: on ? t.orange : t.card,
                borderColor: on ? t.orange : t.border,
              }}
            >
              <Text style={{ color: on ? '#fff' : t.text, fontSize: 13.5, fontWeight: '700' }}>
                {o.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={[common.hint, { color: t.muted, marginTop: 8 }]}>
        {tr('business.orderSite.hint')}
      </Text>
    </View>
  );
}
