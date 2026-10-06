import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';

export default function TargetWorkerCard({ orderWorker, setOrderWorker }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();

  return (
    <>
      {!!orderWorker && (
        <View style={[s.targetWorkerCard, { backgroundColor: t.card, borderColor: t.orange }]}>
          <View
            style={[s.targetWorkerAvatar, { backgroundColor: orderWorker.bgColor || t.orange }]}
          >
            <Text style={s.targetWorkerAvatarTxt}>{orderWorker.initial || 'A'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.targetWorkerLabel, { color: t.muted }]}>
              {tr('newOrder.targetWorkerLabel')}
            </Text>
            <Text style={[s.targetWorkerName, { color: t.text }]} numberOfLines={1}>
              {orderWorker.name}
            </Text>
            {!!orderWorker.trade && (
              <Text style={[s.targetWorkerTrade, { color: t.muted }]} numberOfLines={1}>
                {orderWorker.trade}
              </Text>
            )}
          </View>
          <TouchableOpacity
            onPress={() => setOrderWorker(null)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialCommunityIcons name="close" size={16} color={t.muted} />
          </TouchableOpacity>
        </View>
      )}
    </>
  );
}

const s = StyleSheet.create({
  targetWorkerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 12,
    marginBottom: 20,
  },
  targetWorkerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetWorkerAvatarTxt: { color: '#fff', fontSize: 17, fontWeight: '800' },
  targetWorkerLabel: { fontSize: 11, fontWeight: '600' },
  targetWorkerName: { fontSize: 14.5, fontWeight: '700', marginTop: 2 },
  targetWorkerTrade: { fontSize: 12, marginTop: 1 },
});
