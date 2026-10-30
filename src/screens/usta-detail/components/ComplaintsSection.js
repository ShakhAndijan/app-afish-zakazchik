import { View, Text } from 'react-native';
import { useLanguage } from '../../../context/LanguageContext';
import { useWorkerComplaints } from '../../../queries/complaints';
import { useUstaStyles } from '../styles';
import { formatDate } from '../utils';
import SectionTitle from './SectionTitle';

// Admin tasdiqlagan shikoyatlar (saytdagi usta profili kabi): sabab, matn, sana va ustaning javobi.
// Yozgan odamning ismi backenddan umuman kelmaydi. Shikoyat bo'lmasa — chizilmaydi.
export default function ComplaintsSection({ workerId }) {
  const { t: tr } = useLanguage();
  const { C, st } = useUstaStyles();
  const { data } = useWorkerComplaints(workerId);
  if (!data || data.items.length === 0) return null;

  return (
    <>
      <SectionTitle
        icon="flag-outline"
        title={`${tr('complaints.profile.title')} · ${data.total}`}
      />
      <Text style={{ fontSize: 12.5, color: C.dim, marginTop: -4, marginBottom: 12 }}>
        {tr('complaints.profile.hint')}
      </Text>
      <View style={{ gap: 12 }}>
        {data.items.map((c) => (
          <View key={c.id} style={[st.card, { padding: 14, gap: 8 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
              <Text style={{ fontWeight: '800', fontSize: 13.5, color: C.orange, flex: 1 }}>
                {tr(`complaints.reasons.${c.reason}`)}
                {c.category ? ` · ${c.category}` : ''}
              </Text>
              <Text style={{ fontSize: 11, color: C.dim }}>
                {formatDate(c.publishedAt || c.createdAt)}
              </Text>
            </View>
            <Text style={{ fontSize: 13.5, color: C.txt, lineHeight: 20 }}>{c.body}</Text>
            {!!c.reply && (
              <View
                style={{
                  backgroundColor: C.card3,
                  borderRadius: 12,
                  padding: 11,
                  gap: 3,
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '800', color: C.dim }}>
                  {tr('complaints.profile.reply')}
                  {c.repliedAt ? ` · ${formatDate(c.repliedAt)}` : ''}
                </Text>
                <Text style={{ fontSize: 13.5, color: C.txt, lineHeight: 20 }}>{c.reply}</Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </>
  );
}
