import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useLanguage } from '../../../context/LanguageContext';
import { formatNumber } from '../../../utils/format';

const STATE_ICON = {
  waiting: 'circle-outline',
  done: 'progress-check',
  confirmed: 'check-circle',
};

// Ish bosqichlari: usta "bajardi" deb belgilagan bosqichni mijoz shu yerda tasdiqlaydi.
export default function StagesCard({ stages, confirmingId, onConfirm, t }) {
  const { t: tr } = useLanguage();
  const som = tr('common.currencySom');
  const color = (state) =>
    state === 'confirmed' ? t.green : state === 'done' ? t.orange : t.muted;

  return (
    <View style={[s.card, { backgroundColor: t.card, borderColor: t.border }]}>
      {stages.map((stage, i) => (
        <View
          key={stage.id}
          style={[s.row, i > 0 && { borderTopWidth: 1, borderTopColor: t.border }]}
        >
          <MaterialCommunityIcons
            name={STATE_ICON[stage.state]}
            size={22}
            color={color(stage.state)}
          />
          <View style={s.body}>
            <Text style={[s.title, { color: t.text }]}>{stage.title}</Text>
            {!!stage.note && <Text style={[s.note, { color: t.muted }]}>{stage.note}</Text>}
            <View style={s.meta}>
              <Text style={[s.state, { color: color(stage.state) }]}>
                {tr(
                  stage.state === 'confirmed'
                    ? 'orderDetail.stageConfirmed'
                    : stage.state === 'done'
                      ? 'orderDetail.stageDone'
                      : 'orderDetail.stageWaiting'
                )}
              </Text>
              {stage.amount != null && (
                <Text style={[s.amount, { color: t.text }]}>
                  {formatNumber(Math.round(stage.amount))} {som}
                </Text>
              )}
            </View>
          </View>
          {stage.state === 'done' && (
            <TouchableOpacity
              style={[s.confirm, { backgroundColor: t.green }]}
              activeOpacity={0.85}
              disabled={confirmingId != null}
              onPress={() => onConfirm(stage)}
              accessibilityRole="button"
            >
              {confirmingId === stage.id ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={s.confirmText}>{tr('orderDetail.stageConfirm')}</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  body: { flex: 1 },
  title: { fontSize: 14, fontWeight: '700' },
  note: { fontSize: 12.5, lineHeight: 18, marginTop: 2 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  state: { fontSize: 11.5, fontWeight: '700' },
  amount: { fontSize: 12, fontWeight: '700' },
  confirm: {
    minWidth: 92,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  confirmText: { color: '#fff', fontSize: 12.5, fontWeight: '800' },
});
