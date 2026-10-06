import { Text } from 'react-native';
import { useLanguage } from '../../../context/LanguageContext';
import { useUstaStyles } from '../styles';
import WorksCarousel from './WorksCarousel';

// "Ishlari" bo'limi: butun ekran kengligidagi karusel yoki bo'sh holat matni.
export default function WorksSection({ portfolio, loading, onSelectWork }) {
  const { t: tr } = useLanguage();
  const { C, st } = useUstaStyles();

  return (
    <>
      <Text style={[st.secTitle, { paddingHorizontal: 20, marginTop: 22, marginBottom: 14 }]}>
        {tr('ustaDetail.worksTitle')}
      </Text>
      {portfolio.length > 0 ? (
        <WorksCarousel works={portfolio} onSelectWork={onSelectWork} />
      ) : (
        <Text style={{ fontSize: 12.5, color: C.dim, paddingHorizontal: 20 }}>
          {loading ? tr('common.loading') : tr('ustaDetail.worksEmpty')}
        </Text>
      )}
    </>
  );
}
