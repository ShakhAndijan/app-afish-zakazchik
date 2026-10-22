import { View, Text, Pressable, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useRegions, useDistricts } from '../../queries/reference';
import { useCategoryTreeQuery } from '../../queries/categories';

const RATINGS = [3, 4, 4.5];
const BADGES = ['gold', 'silver', 'bronze'];
const EMPTY = [];

function Chip({ label, active, onPress }) {
  const { theme: t } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[
        s.chip,
        { backgroundColor: active ? t.orange : t.card, borderColor: active ? t.orange : t.border },
      ]}
    >
      <Text style={[s.chipTxt, { color: active ? '#fff' : t.text }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function Toggle({ label, icon, value, onChange }) {
  const { theme: t } = useTheme();
  return (
    <TouchableOpacity
      onPress={() => onChange(!value)}
      activeOpacity={0.85}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      style={[
        s.toggle,
        {
          backgroundColor: value ? 'rgba(232,122,69,0.12)' : t.card,
          borderColor: value ? t.orange : t.border,
        },
      ]}
    >
      <MaterialCommunityIcons name={icon} size={18} color={value ? t.orange : t.muted} />
      <Text style={[s.toggleTxt, { color: t.text }]}>{label}</Text>
      <MaterialCommunityIcons
        name={value ? 'check-circle' : 'circle-outline'}
        size={20}
        color={value ? t.orange : t.faint}
      />
    </TouchableOpacity>
  );
}

// Ustalar filtri: viloyat/tuman, minimal reyting, status, onlayn va tasdiqlangan.
// Tanlov darrov qo'llanadi (`value` ekran holati, `onChange` uni yangilaydi).
export default function WorkersFilterSheet({
  value,
  onChange,
  onReset,
  onClose,
  maxHeight,
  bottomInset,
}) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const regions = useRegions().data ?? EMPTY;
  const districts = useDistricts(value.regionId).data ?? EMPTY;
  const { tree } = useCategoryTreeQuery();
  const subCategories = tree.find((c) => c.id === value.parentId)?.children ?? EMPTY;
  const set = (patch) => onChange({ ...value, ...patch });

  return (
    <View style={StyleSheet.absoluteFill}>
      <Pressable
        style={s.backdrop}
        onPress={onClose}
        accessibilityLabel={tr('workersList.filters.apply')}
      />
      <View
        style={[
          s.sheet,
          {
            backgroundColor: t.bg,
            borderColor: t.border,
            maxHeight,
            paddingBottom: bottomInset + 16,
          },
        ]}
      >
        <View style={s.head}>
          <Text style={[s.title, { color: t.text }]}>{tr('workersList.filters.title')}</Text>
          <TouchableOpacity onPress={onClose} hitSlop={12} accessibilityRole="button">
            <MaterialCommunityIcons name="close" size={22} color={t.muted} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={[s.label, { color: t.muted, marginTop: 8 }]}>
            {tr('workersList.filters.category')}
          </Text>
          <View style={s.wrap}>
            <Chip
              label={tr('workersList.filters.all')}
              active={value.parentId == null}
              onPress={() => set({ parentId: null, subId: null })}
            />
            {tree.map((c) => (
              <Chip
                key={c.id}
                label={c.icon ? `${c.icon} ${c.name}` : c.name}
                active={value.parentId === c.id}
                onPress={() => set({ parentId: c.id, subId: null })}
              />
            ))}
          </View>

          {subCategories.length > 0 && (
            <View style={[s.wrap, { marginTop: 12 }]}>
              <Chip
                label={tr('listings.allInDirection')}
                active={value.subId == null}
                onPress={() => set({ subId: null })}
              />
              {subCategories.map((c) => (
                <Chip
                  key={c.id}
                  label={c.name}
                  active={value.subId === c.id}
                  onPress={() => set({ subId: c.id })}
                />
              ))}
            </View>
          )}

          <Text style={[s.label, { color: t.muted }]}>{tr('workersList.filters.region')}</Text>
          <View style={s.wrap}>
            <Chip
              label={tr('workersList.filters.all')}
              active={value.regionId == null}
              onPress={() => set({ regionId: null, districtId: null })}
            />
            {regions.map((r) => (
              <Chip
                key={r.id}
                label={r.name}
                active={value.regionId === r.id}
                onPress={() => set({ regionId: r.id, districtId: null })}
              />
            ))}
          </View>

          {value.regionId != null && districts.length > 0 && (
            <>
              <Text style={[s.label, { color: t.muted }]}>
                {tr('workersList.filters.district')}
              </Text>
              <View style={s.wrap}>
                <Chip
                  label={tr('workersList.filters.all')}
                  active={value.districtId == null}
                  onPress={() => set({ districtId: null })}
                />
                {districts.map((d) => (
                  <Chip
                    key={d.id}
                    label={d.name}
                    active={value.districtId === d.id}
                    onPress={() => set({ districtId: d.id })}
                  />
                ))}
              </View>
            </>
          )}

          <Text style={[s.label, { color: t.muted }]}>{tr('workersList.filters.rating')}</Text>
          <View style={s.wrap}>
            <Chip
              label={tr('workersList.filters.all')}
              active={value.minRating == null}
              onPress={() => set({ minRating: null })}
            />
            {RATINGS.map((r) => (
              <Chip
                key={r}
                label={`★ ${r}+`}
                active={value.minRating === r}
                onPress={() => set({ minRating: r })}
              />
            ))}
          </View>

          <Text style={[s.label, { color: t.muted }]}>{tr('workersList.filters.status')}</Text>
          <View style={s.wrap}>
            <Chip
              label={tr('workersList.filters.all')}
              active={value.badge == null}
              onPress={() => set({ badge: null })}
            />
            {BADGES.map((b) => (
              <Chip
                key={b}
                label={tr(`listings.badge.${b}`)}
                active={value.badge === b}
                onPress={() => set({ badge: b })}
              />
            ))}
          </View>

          <View style={{ gap: 10, marginTop: 20 }}>
            <Toggle
              icon="circle-slice-8"
              label={tr('workersList.filters.online')}
              value={value.isOnline}
              onChange={(v) => set({ isOnline: v })}
            />
            <Toggle
              icon="check-decagram-outline"
              label={tr('workersList.filters.verified')}
              value={value.verifiedOnly}
              onChange={(v) => set({ verifiedOnly: v })}
            />
          </View>
        </ScrollView>

        <View style={s.actions}>
          <TouchableOpacity
            onPress={onReset}
            activeOpacity={0.85}
            style={[s.btn, { backgroundColor: t.card, borderColor: t.border, borderWidth: 1 }]}
          >
            <Text style={[s.btnTxt, { color: t.text }]}>{tr('workersList.filters.reset')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.85}
            style={[s.btn, { backgroundColor: t.orange, flex: 1.4 }]}
          >
            <Text style={[s.btnTxt, { color: '#fff' }]}>{tr('workersList.filters.apply')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    borderBottomWidth: 0,
    padding: 18,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  title: { fontSize: 18, fontWeight: '800' },
  label: {
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginTop: 16,
    marginBottom: 10,
  },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 19,
    borderWidth: 1,
    justifyContent: 'center',
  },
  chipTxt: { fontSize: 13, fontWeight: '700' },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 50,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  toggleTxt: { flex: 1, fontSize: 14.5, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  btn: { flex: 1, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  btnTxt: { fontSize: 14.5, fontWeight: '800' },
});
