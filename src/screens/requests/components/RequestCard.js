import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import Avatar from '../../../components/Avatar';
import { describeOrder, formatPrice } from '../utils';

const STEP_KEYS = ['requests.stepSearch', 'requests.stepTalk', 'requests.stepWork'];
const STEP_OF = { pending: 0, negotiating: 1, offer: 1, active: 2 };

// Buyurtma bosqichlari: qidiruv → kelishuv → ish. Joriy bosqich holat rangida ajratiladi.
function Progress({ current, color, t, tr }) {
  return (
    <View style={s.steps}>
      {STEP_KEYS.map((key, i) => {
        const isCurrent = i === current;
        return (
          <View key={key} style={s.step}>
            <View style={s.track}>
              <View
                style={[
                  s.line,
                  { backgroundColor: i <= current ? color : t.border },
                  i === 0 && s.hidden,
                ]}
              />
              <View
                style={[
                  s.dot,
                  isCurrent
                    ? { backgroundColor: color, borderColor: color + '55', borderWidth: 4 }
                    : { backgroundColor: i < current ? color : t.card3 },
                ]}
              />
              <View
                style={[
                  s.line,
                  { backgroundColor: i < current ? color : t.border },
                  i === STEP_KEYS.length - 1 && s.hidden,
                ]}
              />
            </View>
            <Text
              style={[
                s.stepTxt,
                { color: isCurrent ? t.text : t.faint, fontWeight: isCurrent ? '800' : '600' },
              ]}
              numberOfLines={1}
            >
              {tr(key)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// Bosh sahifadagi faol buyurtma kartasi: xizmat nomi, holat belgisi, bosqichlar chizig'i va pastda
// usta + narx. Usta narx aytib, javobingiz kutilayotgan bo'lsa karta to'q sariq ramkada.
export default function RequestCard({ order, title, onPress }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const info = describeOrder(order, tr);
  const color = t[info.tone] ?? t.orange;
  const needsReply = info.state === 'offer';
  let price = null;
  if (info.state === 'offer') price = order.offerPrice;
  else if (info.state === 'active') price = order.agreedPrice;
  const subtitle = order.task && order.task !== title ? order.task : '';

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      accessibilityRole="button"
      style={[s.card, { backgroundColor: t.card, borderColor: needsReply ? t.orange : t.border }]}
    >
      <View style={s.top}>
        <View style={[s.icon, { backgroundColor: color + '22' }]}>
          <MaterialCommunityIcons name={info.icon} size={22} color={color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[s.title, { color: t.text }]} numberOfLines={1}>
            {title}
          </Text>
          {!!subtitle && (
            <Text style={[s.subtitle, { color: t.muted }]} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
        {needsReply ? (
          <View style={[s.badge, { backgroundColor: t.orange }]} />
        ) : (
          <MaterialCommunityIcons name="chevron-right" size={22} color={t.faint} />
        )}
      </View>

      <View style={[s.status, { backgroundColor: color + '1c' }]}>
        <View style={[s.statusDot, { backgroundColor: color }]} />
        <Text style={[s.statusTxt, { color }]} numberOfLines={1}>
          {info.short}
        </Text>
      </View>

      <Progress current={STEP_OF[info.state] ?? 0} color={color} t={t} tr={tr} />

      <View style={[s.bottom, { borderTopColor: t.border }]}>
        {order.master ? (
          <View style={s.who}>
            <Avatar letter={order.letter} bgColor={order.color} uri={order.masterPhoto} size={26} />
            <Text style={[s.whoTxt, { color: t.subtext }]} numberOfLines={1}>
              {order.master}
            </Text>
          </View>
        ) : (
          <View style={s.who}>
            <MaterialCommunityIcons name="account-search-outline" size={20} color={t.faint} />
            <Text style={[s.whoTxt, { color: t.muted }]} numberOfLines={1}>
              {tr('requests.noWorkerYet')}
            </Text>
          </View>
        )}
        {price != null && (
          <Text style={[s.price, { color: t.text }]}>{formatPrice(tr, price)}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: { borderRadius: 20, borderWidth: 1.5, padding: 14 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  title: { fontWeight: '800', fontSize: 15.5, letterSpacing: -0.2 },
  subtitle: { fontSize: 12, marginTop: 2 },
  badge: { width: 10, height: 10, borderRadius: 5 },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginTop: 12,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 999,
    maxWidth: '100%',
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusTxt: { fontSize: 12, fontWeight: '700', flexShrink: 1 },
  steps: { flexDirection: 'row', marginTop: 14 },
  step: { flex: 1, alignItems: 'center' },
  track: { flexDirection: 'row', alignItems: 'center', height: 16, alignSelf: 'stretch' },
  line: { flex: 1, height: 3, borderRadius: 2 },
  hidden: { opacity: 0 },
  dot: { width: 16, height: 16, borderRadius: 8 },
  stepTxt: { fontSize: 11, marginTop: 6 },
  bottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  who: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  whoTxt: { fontSize: 13, fontWeight: '600', flexShrink: 1 },
  price: { fontSize: 14, fontWeight: '800' },
});
