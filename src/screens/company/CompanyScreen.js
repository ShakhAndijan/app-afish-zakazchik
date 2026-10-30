import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { appAlert, appConfirm } from '../../components/AppAlert';
import AppLoader from '../../components/AppLoader';
import SectionError from '../zakazchi-main/components/SectionError';
import {
  useBusiness,
  useDeletePlan,
  useLeaveBusiness,
  useRemoveMember,
  useSetPlanActive,
  useSetSiteActive,
  useUpdateMember,
} from '../../queries/business';
import { MEMBER_ROLES } from '../../api/business';
import { formatDate } from '../../utils/format';
import { getErrorMessage } from '../../utils/errors';
import { Badge, Button, Card, Chips, Frame, LinkButton, SectionHead } from './ui';

// Kabinet → "Kompaniya" (saytdagi "Компания" va /biznes): ariza holati; tasdiqlangach obyektlar,
// doimiy xizmat rejalari, xodimlar va oylik hisobot.
export default function CompanyScreen({ onBack }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const router = useRouter();
  const q = useBusiness();

  const setSite = useSetSiteActive();
  const setPlan = useSetPlanActive();
  const delPlan = useDeletePlan();
  const updMember = useUpdateMember();
  const delMember = useRemoveMember();
  const leave = useLeaveBusiness();

  const data = q.data;
  const org = data?.organization ?? null;
  const approved = org?.status === 'approved';
  const owner = !!data?.isOwner;

  const fail = (e) =>
    appAlert(tr('common.errorTitle'), getErrorMessage(e, tr, 'business.form.failed'));
  const run = (mutation, vars) => mutation.mutate(vars, { onError: fail });

  const statusColor =
    { pending: t.orange, approved: t.green, rejected: t.red }[org?.status] ?? t.muted;
  const siteName = (id) => data?.sites.find((s) => s.id === id)?.name ?? '';

  return (
    <Frame title={tr('business.title')} subtitle={org?.name} onBack={onBack}>
      {q.isPending && (
        <View style={{ alignItems: 'center', paddingVertical: 40 }}>
          <AppLoader size={100} />
        </View>
      )}
      {q.isError && <SectionError onRetry={q.refetch} />}

      {!!data && !org && (
        <Card>
          <Text style={{ color: t.text, fontSize: 15, lineHeight: 22 }}>
            {tr('business.intro')}
          </Text>
          <Button
            label={tr('business.form.submit')}
            icon="domain"
            onPress={() => router.push('/company-form')}
          />
        </Card>
      )}

      {!!org && (
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={{ color: t.text, fontSize: 17, fontWeight: '800', flex: 1 }}>
              {org.name}
            </Text>
            <Badge label={tr(`business.status.${org.status}`)} color={statusColor} />
          </View>
          <Text style={{ color: t.muted, fontSize: 13.5 }}>
            {[tr(`business.kinds.${org.kind}`), org.tin && `${tr('business.form.tin')}: ${org.tin}`]
              .filter(Boolean)
              .join(' · ')}
          </Text>
          <Text style={{ color: t.muted, fontSize: 13.5, lineHeight: 20 }}>
            {[org.contactName, org.contactPhone, org.email].filter(Boolean).join(' · ')}
          </Text>
          {!owner && (
            <Text style={{ color: t.text, fontSize: 13.5, fontWeight: '700' }}>
              {tr('business.youAre')}: {tr(`business.roles.${data.role}`)}
            </Text>
          )}

          {org.status === 'pending' && (
            <Text style={{ color: t.muted, fontSize: 13.5, lineHeight: 20 }}>
              {tr('business.pendingText')}
            </Text>
          )}
          {org.status === 'rejected' && (
            <>
              <Text style={{ color: t.red, fontSize: 13.5, lineHeight: 20 }}>
                {tr('business.rejectedText')}
              </Text>
              {!!org.adminNote && (
                <Text style={{ color: t.text, fontSize: 13.5, lineHeight: 20 }}>
                  {tr('business.adminNote')}: {org.adminNote}
                </Text>
              )}
            </>
          )}

          {owner && org.status !== 'rejected' && (
            <LinkButton label={tr('business.edit')} onPress={() => router.push('/company-form')} />
          )}
          {owner && org.status === 'rejected' && (
            <Button
              label={tr('business.form.resubmit')}
              onPress={() => router.push('/company-form')}
            />
          )}
        </Card>
      )}

      {approved && (
        <>
          <Button
            label={tr('business.statement.open')}
            icon="chart-box-outline"
            outline
            onPress={() => router.push('/company-statement')}
          />

          <SectionHead
            icon="map-marker-outline"
            title={tr('business.sites.title')}
            right={
              owner && (
                <LinkButton
                  label={tr('business.sites.add')}
                  onPress={() => router.push('/company-site')}
                />
              )
            }
          />
          {data.sites.length === 0 && (
            <Text style={{ color: t.muted, fontSize: 13.5, lineHeight: 20 }}>
              {tr('business.sites.empty')}
            </Text>
          )}
          {data.sites.map((s) => (
            <Card key={s.id} style={!s.isActive && { opacity: 0.65 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text style={{ color: t.text, fontSize: 15, fontWeight: '800', flex: 1 }}>
                  {s.name}
                </Text>
                {!s.isActive && <Badge label={tr('business.sites.closed')} color={t.muted} />}
              </View>
              <Text style={{ color: t.muted, fontSize: 13.5, lineHeight: 20 }}>
                {[s.region, s.district, s.address, s.landmark].filter(Boolean).join(', ')}
              </Text>
              {!!s.contactPhone && (
                <Text style={{ color: t.muted, fontSize: 13.5 }}>{s.contactPhone}</Text>
              )}
              {owner && (
                <View style={{ flexDirection: 'row', gap: 20 }}>
                  <LinkButton
                    label={tr('business.edit')}
                    onPress={() =>
                      router.push({ pathname: '/company-site', params: { id: String(s.id) } })
                    }
                  />
                  {s.isActive ? (
                    <LinkButton
                      danger
                      label={tr('business.sites.close')}
                      onPress={() =>
                        appConfirm({
                          title: tr('business.sites.closeTitle'),
                          message: tr('business.sites.closeText'),
                          confirmLabel: tr('business.sites.close'),
                          destructive: true,
                          onConfirm: () => run(setSite, { id: s.id, isActive: false }),
                        })
                      }
                    />
                  ) : (
                    <LinkButton
                      label={tr('business.sites.reopen')}
                      onPress={() => run(setSite, { id: s.id, isActive: true })}
                    />
                  )}
                </View>
              )}
            </Card>
          ))}

          <SectionHead
            icon="calendar-sync-outline"
            title={tr('business.plans.title')}
            right={
              owner &&
              data.sites.some((s) => s.isActive) && (
                <LinkButton
                  label={tr('business.plans.add')}
                  onPress={() => router.push('/company-plan')}
                />
              )
            }
          />
          <Text style={{ color: t.muted, fontSize: 13, marginTop: -8 }}>
            {data.sites.length === 0 ? tr('business.plans.needSite') : tr('business.plans.hint')}
          </Text>
          {data.sites.length > 0 && data.plans.length === 0 && (
            <Text style={{ color: t.muted, fontSize: 13.5 }}>{tr('business.plans.empty')}</Text>
          )}
          {data.plans.map((p) => (
            <Card key={p.id} style={!p.isActive && { opacity: 0.65 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text style={{ color: t.text, fontSize: 15, fontWeight: '800', flex: 1 }}>
                  {p.category}
                </Text>
                {!p.isActive && <Badge label={tr('business.plans.paused')} color={t.muted} />}
              </View>
              <Text style={{ color: t.muted, fontSize: 13.5, lineHeight: 20 }}>
                {[siteName(p.siteId), tr(`business.freq.${p.frequency}`)]
                  .filter(Boolean)
                  .join(' · ')}
              </Text>
              <Text style={{ color: t.text, fontSize: 14, lineHeight: 20 }}>{p.description}</Text>
              <Text style={{ color: t.muted, fontSize: 12.5, lineHeight: 18 }}>
                {tr('business.plans.next', { date: formatDate(p.nextDate) })}
                {'\n'}
                {tr('business.plans.orderOn', { date: formatDate(p.orderOn) })}
                {p.ordersPlaced > 0
                  ? `\n${tr('business.plans.placed', { n: p.ordersPlaced })}`
                  : ''}
              </Text>
              {owner && (
                <View style={{ flexDirection: 'row', gap: 20, flexWrap: 'wrap' }}>
                  <LinkButton
                    label={tr('business.edit')}
                    onPress={() =>
                      router.push({ pathname: '/company-plan', params: { id: String(p.id) } })
                    }
                  />
                  <LinkButton
                    label={tr(p.isActive ? 'business.plans.pause' : 'business.plans.resume')}
                    onPress={() => run(setPlan, { id: p.id, isActive: !p.isActive })}
                  />
                  <LinkButton
                    danger
                    label={tr('business.plans.delete')}
                    onPress={() =>
                      appConfirm({
                        title: tr('business.plans.deleteTitle'),
                        message: tr('business.plans.deleteText'),
                        confirmLabel: tr('business.plans.delete'),
                        destructive: true,
                        onConfirm: () => run(delPlan, p.id),
                      })
                    }
                  />
                </View>
              )}
            </Card>
          ))}

          {owner && (
            <>
              <SectionHead
                icon="account-group-outline"
                title={tr('business.members.title')}
                right={
                  <LinkButton
                    label={tr('business.members.add')}
                    onPress={() => router.push('/company-member')}
                  />
                }
              />
              <Text style={{ color: t.muted, fontSize: 13, marginTop: -8 }}>
                {tr('business.members.hint')}
              </Text>
              {data.members.length === 0 && (
                <Text style={{ color: t.muted, fontSize: 13.5 }}>
                  {tr('business.members.empty')}
                </Text>
              )}
              {data.members.map((m) => (
                <Card key={m.id}>
                  <Text style={{ color: t.text, fontSize: 15, fontWeight: '800' }}>
                    {m.name || m.phone}
                  </Text>
                  <Text style={{ color: t.muted, fontSize: 13.5 }}>
                    {[m.name ? m.phone : null, !m.joined ? tr('business.members.waiting') : null]
                      .filter(Boolean)
                      .join(' · ')}
                  </Text>
                  <Chips
                    options={MEMBER_ROLES.map((r) => ({
                      value: r,
                      label: tr(`business.roles.${r}`),
                    }))}
                    value={m.role}
                    onChange={(role) => role !== m.role && run(updMember, { id: m.id, role })}
                  />
                  <LinkButton
                    danger
                    label={tr('business.members.remove')}
                    onPress={() =>
                      appConfirm({
                        title: tr('business.members.removeTitle'),
                        message: tr('business.members.removeText'),
                        confirmLabel: tr('business.members.remove'),
                        destructive: true,
                        onConfirm: () => run(delMember, m.id),
                      })
                    }
                  />
                </Card>
              ))}
            </>
          )}
        </>
      )}

      {!!org && !owner && (
        <Button
          danger
          outline
          label={tr('business.leave.button')}
          busy={leave.isPending}
          onPress={() =>
            appConfirm({
              title: tr('business.leave.title'),
              message: tr('business.leave.text'),
              confirmLabel: tr('business.leave.button'),
              destructive: true,
              onConfirm: () => run(leave),
            })
          }
        />
      )}
    </Frame>
  );
}
