import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import AppLoader from '../../components/AppLoader';
import SectionError from '../zakazchi-main/components/SectionError';
import { useStatement } from '../../queries/business';
import { formatDate } from '../../utils/format';
import { Card, Frame, SectionHead, money } from './ui';

const periodOf = (year, month) => `${year}-${String(month + 1).padStart(2, '0')}`;

// Oylik hisobot: shu oyda bajarilgan ishlar obyekt va yo'nalish bo'yicha, jami summa.
export default function StatementScreen({ onBack }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const now = new Date();
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const isCurrent = cursor.year === now.getFullYear() && cursor.month === now.getMonth();

  const q = useStatement(periodOf(cursor.year, cursor.month));
  const data = q.data;
  const months = tr('business.statement.months');
  const som = tr('common.currencySom');

  const shift = (delta) =>
    setCursor(({ year, month }) => {
      const d = new Date(year, month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });

  const groups = (title, list) =>
    list.length > 0 && (
      <>
        <SectionHead icon="chart-box-outline" title={title} />
        <Card>
          {list.map((g) => (
            <View key={g.name} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: t.text, fontSize: 14.5, fontWeight: '700' }}>{g.name}</Text>
                <Text style={{ color: t.muted, fontSize: 12.5 }}>
                  {tr('business.statement.jobsCount', { n: g.jobs })}
                </Text>
              </View>
              <Text style={{ color: t.text, fontSize: 14.5, fontWeight: '800' }}>
                {money(g.total)} {som}
              </Text>
            </View>
          ))}
        </Card>
      </>
    );

  return (
    <Frame title={tr('business.statement.title')} onBack={onBack}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <TouchableOpacity onPress={() => shift(-1)} hitSlop={10}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={t.text} />
        </TouchableOpacity>
        <Text style={{ color: t.text, fontSize: 17, fontWeight: '800' }}>
          {months[cursor.month]} {cursor.year}
        </Text>
        <TouchableOpacity onPress={() => shift(1)} disabled={isCurrent} hitSlop={10}>
          <MaterialCommunityIcons
            name="chevron-right"
            size={28}
            color={isCurrent ? t.faint : t.text}
          />
        </TouchableOpacity>
      </View>

      {q.isPending && (
        <View style={{ alignItems: 'center', paddingVertical: 30 }}>
          <AppLoader size={100} />
        </View>
      )}
      {q.isError && <SectionError onRetry={q.refetch} />}

      {!!data && (
        <>
          <Card>
            <Text style={{ color: t.muted, fontSize: 13 }}>{tr('business.statement.total')}</Text>
            <Text style={{ color: t.text, fontSize: 26, fontWeight: '800' }}>
              {money(data.total)} {som}
            </Text>
            <Text style={{ color: t.muted, fontSize: 13 }}>
              {tr('business.statement.jobs')}: {data.jobs}
              {data.inProgress > 0
                ? ` · ${tr('business.statement.inProgress', { n: data.inProgress })}`
                : ''}
            </Text>
          </Card>

          {data.rows.length === 0 && (
            <Text style={{ color: t.muted, textAlign: 'center', paddingVertical: 20 }}>
              {tr('business.statement.empty')}
            </Text>
          )}

          {groups(tr('business.statement.bySite'), data.bySite)}
          {groups(tr('business.statement.byCategory'), data.byCategory)}

          {data.rows.length > 0 && (
            <>
              <SectionHead icon="clipboard-list-outline" title={tr('business.statement.rows')} />
              {data.rows.map((r) => (
                <Card key={r.orderId}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                    <Text style={{ color: t.text, fontSize: 14.5, fontWeight: '800', flex: 1 }}>
                      {r.category || r.code}
                    </Text>
                    {r.price != null && (
                      <Text style={{ color: t.text, fontSize: 14.5, fontWeight: '800' }}>
                        {money(r.price)} {som}
                      </Text>
                    )}
                  </View>
                  <Text style={{ color: t.muted, fontSize: 12.5, lineHeight: 18 }}>
                    {[r.code, r.site, r.worker, r.completedAt && formatDate(r.completedAt)]
                      .filter(Boolean)
                      .join(' · ')}
                  </Text>
                  {r.fromPlan && (
                    <Text style={{ color: t.orange, fontSize: 12, fontWeight: '700' }}>
                      {tr('business.statement.fromPlan')}
                    </Text>
                  )}
                </Card>
              ))}
            </>
          )}
        </>
      )}
    </Frame>
  );
}
