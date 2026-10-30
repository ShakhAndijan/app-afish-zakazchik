import { useMemo } from 'react';
import { View, Text, Linking, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { toCyrillic } from '../../i18n/translit';
import { SITE_URL } from '../../constants/config';
import { parseArticleHtml } from '../../utils/articleHtml';

// Havola ochiladi: to'liq manzil — o'zi, "/yo'l" — saytdagi sahifa. Boshqa (javascript: va h.k.) e'tiborga olinmaydi.
const openLink = (href) => {
  if (!href) return;
  const url = href.startsWith('/') ? `${SITE_URL}${href}` : href;
  if (/^(https?:|mailto:|tel:)/i.test(url)) Linking.openURL(url).catch(() => {});
};

function Runs({ runs, style }) {
  const { theme: t } = useTheme();
  const { language } = useLanguage();
  return (
    <Text style={style}>
      {runs.map((r, i) => (
        <Text
          key={i}
          style={[
            r.bold && s.bold,
            r.italic && s.italic,
            r.href && { color: t.orange, textDecorationLine: 'underline' },
          ]}
          onPress={r.href ? () => openLink(r.href) : undefined}
        >
          {language === 'cr' ? toCyrillic(r.text) : r.text}
        </Text>
      ))}
    </Text>
  );
}

// Maqola matni (saytdagi maqola sahifasi kabi): sarlavhalar, abzaclar, ro'yxatlar va iqtibos kartochkasi.
export default function ArticleBody({ html }) {
  const { theme: t } = useTheme();
  const blocks = useMemo(() => parseArticleHtml(html), [html]);

  const body = [s.p, { color: t.text }];
  return (
    <View style={{ gap: 16 }}>
      {blocks.map((b, i) => {
        if (b.type === 'h2' || b.type === 'h3') {
          return (
            <Runs
              key={i}
              runs={b.runs}
              style={[b.type === 'h2' ? s.h2 : s.h3, { color: t.text, marginTop: 10 }]}
            />
          );
        }
        if (b.type === 'ul' || b.type === 'ol') {
          return (
            <View key={i} style={{ gap: 10 }}>
              {b.items.map((runs, k) => (
                <View key={k} style={s.li}>
                  <Text style={[body, s.marker]}>{b.type === 'ol' ? `${k + 1}.` : '•'}</Text>
                  <Runs runs={runs} style={[body, { flex: 1 }]} />
                </View>
              ))}
            </View>
          );
        }
        if (b.type === 'quote') {
          return (
            <View key={i} style={[s.quote, { backgroundColor: t.card, borderColor: t.border }]}>
              {b.paras.map((runs, k) => (
                <Runs key={k} runs={runs} style={body} />
              ))}
            </View>
          );
        }
        return <Runs key={i} runs={b.runs} style={body} />;
      })}
    </View>
  );
}

const s = StyleSheet.create({
  h2: { fontSize: 21, lineHeight: 28, fontWeight: '800' },
  h3: { fontSize: 18, lineHeight: 25, fontWeight: '800' },
  p: { fontSize: 15.5, lineHeight: 25 },
  bold: { fontWeight: '800' },
  italic: { fontStyle: 'italic' },
  li: { flexDirection: 'row', gap: 10, paddingRight: 4 },
  marker: { minWidth: 20, textAlign: 'right' },
  quote: { borderWidth: 1, borderRadius: 18, paddingHorizontal: 16, paddingVertical: 14, gap: 8 },
});
