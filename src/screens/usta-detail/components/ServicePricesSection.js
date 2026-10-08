import { View, Text } from 'react-native';
import { useLanguage } from '../../../context/LanguageContext';
import { useUstaStyles } from '../styles';
import SectionTitle from './SectionTitle';

// Yo'nalishlar bo'yicha xizmat narxlari ("dan", kelishiladi yoki belgilanmagan).
export default function ServicePricesSection({ categories: allCategories, selectedId, loading }) {
  const { t: tr } = useLanguage();
  const { C, st } = useUstaStyles();
  // Tanlangan mutaxassislik bo'lsa — faqat shu yo'nalish narxi ko'rsatiladi.
  const selected = allCategories.filter((c) => c.id === selectedId);
  const categories = selected.length > 0 ? selected : allCategories;

  return (
    <>
      <SectionTitle icon="cash-multiple" title={tr('ustaDetail.servicesPriceTitle')} />
      {categories.length > 0 ? (
        <View style={st.card}>
          {categories.map((c, i) => (
            <View
              key={c.id}
              style={[
                st.svcRow,
                i < categories.length - 1 && { borderBottomWidth: 1, borderBottomColor: C.line },
              ]}
            >
              <Text
                style={{ fontSize: 14, fontWeight: '600', color: C.txt, flex: 1, marginRight: 8 }}
              >
                {c.name}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 2 }}>
                {c.isNegotiable ? (
                  <Text style={{ fontSize: 13, fontWeight: '700', color: C.dim }}>
                    {tr('ustaDetail.negotiablePrice')}
                  </Text>
                ) : c.minPrice || c.price ? (
                  <Text style={{ fontSize: 14, fontWeight: '800', color: C.txt }}>
                    {tr('ustaDetail.priceFrom', {
                      price: c.minPrice || c.price,
                      currency: c.currency,
                    })}
                  </Text>
                ) : (
                  <Text style={{ fontSize: 12.5, color: C.dim }}>
                    {tr('ustaDetail.noPriceSet')}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={[st.card, { padding: 16, alignItems: 'center' }]}>
          <Text style={{ fontSize: 12.5, color: C.dim }}>
            {loading ? tr('common.loading') : tr('ustaDetail.servicesEmpty')}
          </Text>
        </View>
      )}
    </>
  );
}
