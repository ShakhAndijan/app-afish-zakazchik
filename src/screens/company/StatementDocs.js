import { useState } from 'react';
import { View, Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { appAlert } from '../../components/AppAlert';
import AppLoader from '../../components/AppLoader';
import SectionError from '../zakazchi-main/components/SectionError';
import { getStatementAct, downloadStatementCsv } from '../../api/business';
import { getErrorMessage } from '../../utils/errors';
import { formatDate } from '../../utils/format';
import { Button, Card, SectionHead, money } from './ui';

const esc = (v) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

// PDF uchun dalolatnoma HTML'i (A4, oddiy jadval).
function actHtml(act, tr, som) {
  const title = tr('business.statement.act.title', { number: act.number, period: act.period });
  const rows = act.rows
    .map(
      (r) => `<tr>
        <td>${esc(r.n)}</td>
        <td>${esc([r.category, r.code].filter(Boolean).join(' · '))}</td>
        <td>${esc([r.site, r.worker].filter(Boolean).join(', '))}</td>
        <td>${esc(r.completedAt ? formatDate(r.completedAt) : '')}</td>
        <td style="text-align:right">${r.price != null ? esc(money(r.price)) : ''}</td>
      </tr>`
    )
    .join('');
  return `<html><head><meta charset="utf-8"/><style>
    body{font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#111;padding:24px}
    h1{font-size:18px;text-align:center;margin:0 0 4px}
    .sub{text-align:center;color:#555;margin-bottom:18px}
    .box{margin-bottom:12px;line-height:1.5}
    table{width:100%;border-collapse:collapse;margin-top:10px}
    th,td{border:1px solid #888;padding:5px 6px;text-align:left}
    th{background:#eee}
    .total{margin-top:12px;font-weight:bold}
  </style></head><body>
    <h1>${esc(title)}</h1>
    <div class="sub">${esc(act.issuedOn ? formatDate(act.issuedOn) : '')}</div>
    <div class="box"><b>${esc(tr('business.statement.act.executor'))}:</b> ${esc(act.platformName)} ${esc(act.platformSite)}</div>
    <div class="box"><b>${esc(tr('business.statement.act.customer'))}:</b> ${esc(act.customerName)}
      ${act.customerTin ? `<br/>${esc(tr('business.statement.act.tin'))}: ${esc(act.customerTin)}` : ''}
      ${act.customerAddress ? `<br/>${esc(act.customerAddress)}` : ''}
      ${act.customerContact ? `<br/>${esc(act.customerContact)}` : ''}
    </div>
    <table>
      <tr><th>№</th><th>${esc(tr('business.statement.act.service'))}</th><th>${esc(tr('business.statement.act.object'))}</th><th>${esc(tr('business.statement.act.date'))}</th><th>${esc(som)}</th></tr>
      ${rows}
    </table>
    <div class="total">${esc(tr('business.statement.total'))}: ${esc(money(act.total))} ${esc(som)}</div>
    ${act.totalWords ? `<div>${esc(act.totalWords)}</div>` : ''}
  </body></html>`;
}

async function shareFile(uri, mimeType, dialogTitle) {
  if (!(await Sharing.isAvailableAsync())) throw new Error('sharing_unavailable');
  await Sharing.shareAsync(uri, { mimeType, dialogTitle });
}

// Hisobot ostidagi hujjatlar: dalolatnoma (ko'rish + PDF ulashish) va CSV (buxgalter uchun).
export default function StatementDocs({ period }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const som = tr('common.currencySom');
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(null); // 'pdf' | 'csv'

  const actQuery = useQuery({
    queryKey: ['business', 'statement-act', period],
    queryFn: () => getStatementAct(period),
    enabled: open,
    staleTime: 60 * 1000,
  });
  const act = actQuery.data;

  const run = async (kind, job) => {
    if (busy) return;
    setBusy(kind);
    try {
      await job();
    } catch (e) {
      appAlert(tr('common.errorTitle'), getErrorMessage(e, tr, 'business.statement.act.failed'));
    } finally {
      setBusy(null);
    }
  };

  const sharePdf = () =>
    run('pdf', async () => {
      const data = act ?? (await getStatementAct(period));
      const { uri } = await Print.printToFileAsync({ html: actHtml(data, tr, som) });
      await shareFile(uri, 'application/pdf', tr('business.statement.act.share'));
    });

  const shareCsv = () =>
    run('csv', async () => {
      const uri = await downloadStatementCsv(period);
      await shareFile(uri, 'text/csv', tr('business.statement.csv'));
    });

  const line = (label, value) =>
    !!value && (
      <Text style={{ color: t.muted, fontSize: 13, lineHeight: 19 }}>
        {label}: <Text style={{ color: t.text, fontWeight: '700' }}>{value}</Text>
      </Text>
    );

  return (
    <>
      <SectionHead icon="file-document-outline" title={tr('business.statement.docs')} />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Button
          outline
          icon={open ? 'chevron-up' : 'file-document-outline'}
          label={tr('business.statement.act.button')}
          onPress={() => setOpen((v) => !v)}
          style={{ flex: 1 }}
        />
        <Button
          outline
          icon="file-delimited-outline"
          label={tr('business.statement.csv')}
          busy={busy === 'csv'}
          onPress={shareCsv}
          style={{ flex: 1 }}
        />
      </View>

      {open && actQuery.isPending && (
        <View style={{ alignItems: 'center', paddingVertical: 20 }}>
          <AppLoader size={80} />
        </View>
      )}
      {open && actQuery.isError && <SectionError onRetry={actQuery.refetch} />}

      {open && !!act && (
        <>
          <Card>
            <Text style={{ color: t.text, fontSize: 16, fontWeight: '800' }}>
              {tr('business.statement.act.title', { number: act.number, period: act.period })}
            </Text>
            {line(
              tr('business.statement.act.issued'),
              act.issuedOn ? formatDate(act.issuedOn) : ''
            )}
            {line(
              tr('business.statement.act.executor'),
              [act.platformName, act.platformSite].filter(Boolean).join(' · ')
            )}
            {line(tr('business.statement.act.customer'), act.customerName)}
            {line(tr('business.statement.act.tin'), act.customerTin)}
            {line(tr('business.statement.act.address'), act.customerAddress)}
            {line(tr('business.statement.act.contact'), act.customerContact)}
            {line(tr('business.statement.jobs'), String(act.jobs))}
            {line(tr('business.statement.total'), `${money(act.total)} ${som}`)}
            {line(tr('business.statement.act.inWords'), act.totalWords)}
          </Card>
          <Button
            icon="share-variant-outline"
            label={tr('business.statement.act.share')}
            busy={busy === 'pdf'}
            onPress={sharePdf}
          />
        </>
      )}
    </>
  );
}
