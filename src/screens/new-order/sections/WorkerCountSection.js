import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { common } from '../styles';

export default function WorkerCountSection({ workerCount, setWorkerCount }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();

  return (
    <>
      {/* ── Necha kishi kerak ── */}
      <Text style={[common.label, { color: t.text }]}>{tr('newOrder.workerCountLabel')}</Text>
      <View style={[s.workerCountCard, { backgroundColor: t.card, borderColor: t.border }]}>
        <View
          style={[
            s.workerCountIconWrap,
            { backgroundColor: t.isDark ? 'rgba(232,122,69,0.16)' : '#FDECE1' },
          ]}
        >
          <MaterialCommunityIcons name="account-group-outline" size={20} color={t.orange} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[common.requirementLabel, { color: t.text }]}>
            {tr('newOrder.workerCountFieldLabel')}
          </Text>
          <Text style={[common.requirementSub, { color: t.muted }]}>
            {tr('newOrder.workerCountHint')}
          </Text>
        </View>
        <View style={s.stepperRow}>
          <TouchableOpacity
            onPress={() => setWorkerCount((n) => Math.max(1, n - 1))}
            activeOpacity={0.8}
            style={[s.stepperBtn, { backgroundColor: t.bg }]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialCommunityIcons name="minus" size={16} color={t.text} />
          </TouchableOpacity>
          <Text style={[s.stepperValue, { color: t.text }]}>{workerCount}</Text>
          <TouchableOpacity
            onPress={() => setWorkerCount((n) => Math.min(50, n + 1))}
            activeOpacity={0.8}
            style={[s.stepperBtn, { backgroundColor: t.bg }]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialCommunityIcons name="plus" size={16} color={t.text} />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const s = StyleSheet.create({
  workerCountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  workerCountIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepperBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: { fontSize: 16, fontWeight: '800', minWidth: 20, textAlign: 'center' },
});
