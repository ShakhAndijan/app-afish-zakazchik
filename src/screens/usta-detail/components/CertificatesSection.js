import { View, Text } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useLanguage } from '../../../context/LanguageContext';
import { useUstaStyles } from '../styles';
import SectionTitle from './SectionTitle';
import { formatDate } from '../utils';
import EmptyState from './EmptyState';

// Tanlangan yo'nalish bo'yicha ustaning sertifikatlari.
export default function CertificatesSection({ certificates, loading }) {
  const { t: tr } = useLanguage();
  const { C, st } = useUstaStyles();

  return (
    <>
      <SectionTitle icon="certificate-outline" title={tr('ustaDetail.certificatesTitle')} />
      {certificates.length > 0 ? (
        <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
          {certificates.map((c) => (
            <View key={c.id} style={[st.card, { flexBasis: '48%', flexGrow: 1, padding: 13 }]}>
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <View style={st.certIconWrap}>
                  <MaterialCommunityIcons name="shield-check" size={18} color={C.green} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={st.certTitle} numberOfLines={2}>
                    {c.title}
                  </Text>
                  <Text style={st.certMeta}>
                    {[c.issuedBy, formatDate(c.issuedAt)].filter(Boolean).join(' · ')}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <EmptyState
          icon="certificate-outline"
          title={loading ? tr('common.loading') : tr('ustaDetail.certificatesEmptyTitle')}
          subtitle={loading ? undefined : tr('ustaDetail.certificatesEmptySubtitle')}
        />
      )}
    </>
  );
}
