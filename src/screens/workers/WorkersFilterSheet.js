import { useState } from 'react';
import { View, Text, Pressable, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useRegions, useDistricts } from '../../queries/reference';
import { useCategoryTreeQuery } from '../../queries/categories';

const RATINGS = [3, 4, 4.5];
const BADGES = ['gold', 'silver', 'bronze'];
const EMPTY = [];
const FALLBACK_ICON = '\u{1F6E0}\uFE0F';

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

// Yo'nalish kartochkasi: tepada emoji, pastda nomi (gorizontal aylantiriladigan qatorda).
// Tanlangan bo'lsa burchagida "x" belgisi chiqadi — bosilsa tanlov olib tashlanadi.
function CategoryTile({ label, icon, active, onPress }) {
  const { theme: t } = useTheme();
  return (
    <View style={s.tileWrap}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        style={[
          s.tile,
          {
            backgroundColor: active ? `${t.orange}1F` : t.card,
            borderColor: active ? t.orange : t.border,
          },
        ]}
      >
        <Text style={s.tileEmoji} allowFontScaling={false}>
          {icon || FALLBACK_ICON}
        </Text>
        <Text
          style={[s.tileTxt, { color: active ? t.orange : t.text }]}
          numberOfLines={2}
          allowFontScaling={false}
        >
          {label}
        </Text>
      </TouchableOpacity>
      {active && (
        <TouchableOpacity
          onPress={onPress}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`${label}: ×`}
          style={[s.tileX, { backgroundColor: t.orange, borderColor: t.bg }]}
        >
          <MaterialCommunityIcons name="close" size={12} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

// Tanlash maydoni (select): bosilsa ro'yxat ochiladi. Qiymat tanlangan bo'lsa to'q sariq ramka bilan.
function SelectField({ label, icon, value, placeholder, onPress }) {
  const { theme: t } = useTheme();
  const filled = value != null;
  return (
    <View>
      <Text style={[s.label, { color: t.muted }]}>{label}</Text>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${filled ? value : placeholder}`}
        style={[
          s.select,
          {
            backgroundColor: filled ? `${t.orange}14` : t.card,
            borderColor: filled ? t.orange : t.border,
          },
        ]}
      >
        <MaterialCommunityIcons name={icon} size={19} color={filled ? t.orange : t.muted} />
        <Text style={[s.selectTxt, { color: filled ? t.text : t.muted }]} numberOfLines={1}>
          {filled ? value : placeholder}
        </Text>
        <MaterialCommunityIcons name="chevron-down" size={22} color={t.muted} />
      </TouchableOpacity>
    </View>
  );
}

function OptionRow({ label, selected, onPress, multi }) {
  const { theme: t } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[
        s.option,
        { backgroundColor: selected ? `${t.orange}14` : 'transparent', borderColor: t.border },
      ]}
    >
      <Text
        style={[
          s.optionTxt,
          { color: selected ? t.orange : t.text, fontWeight: selected ? '800' : '600' },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
      {multi ? (
        <MaterialCommunityIcons
          name={selected ? 'checkbox-marked' : 'checkbox-blank-outline'}
          size={22}
          color={selected ? t.orange : t.faint}
        />
      ) : (
        selected && <MaterialCommunityIcons name="check" size={20} color={t.orange} />
      )}
    </TouchableOpacity>
  );
}

// Select ro'yxati: filtr oynasi ustida ochiladigan pastki oyna. Birinchi qator — "Hammasi".
// `selectedIds` berilsa — ko'p tanlov (katakchalar, oyna ochiq qoladi, "Qo'llash" bilan yopiladi);
// aks holda bitta tanlov (`selectedId`) va tanlagan zahoti yopiladi.
function OptionPicker({
  title,
  options,
  selectedId,
  selectedIds,
  allLabel,
  applyLabel,
  onSelect,
  onClose,
  maxHeight,
  bottomInset,
}) {
  const { theme: t } = useTheme();
  const multi = selectedIds != null;

  return (
    <View style={StyleSheet.absoluteFill}>
      <Pressable style={s.backdrop} onPress={onClose} accessibilityLabel={title} />
      <View
        style={[
          s.sheet,
          {
            backgroundColor: t.bg,
            borderColor: t.border,
            maxHeight: maxHeight * 0.85,
            paddingBottom: bottomInset + 16,
          },
        ]}
      >
        <View style={s.head}>
          <Text style={[s.title, { color: t.text }]}>{title}</Text>
          <TouchableOpacity onPress={onClose} hitSlop={12} accessibilityRole="button">
            <MaterialCommunityIcons name="close" size={22} color={t.muted} />
          </TouchableOpacity>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
          <OptionRow
            label={allLabel}
            selected={multi ? selectedIds.length === 0 : selectedId == null}
            onPress={() => onSelect(null)}
          />
          {options.map((o) => (
            <OptionRow
              key={o.id}
              label={o.name}
              multi={multi}
              selected={multi ? selectedIds.includes(o.id) : selectedId === o.id}
              onPress={() => onSelect(o.id)}
            />
          ))}
        </ScrollView>
        {multi && (
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.85}
            style={[s.applyBtn, { backgroundColor: t.orange }]}
          >
            <Text style={[s.btnTxt, { color: '#fff' }]}>{applyLabel}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// Ustalar filtri: yo'nalish, viloyat/tuman, minimal reyting, status, onlayn va tasdiqlangan.
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
  const selectedParents = tree.filter((c) => value.parentIds.includes(c.id));
  const [picker, setPicker] = useState(null); // null | 'region' | 'district' | { type: 'subs', id }
  const subsParent = picker?.type === 'subs' ? tree.find((c) => c.id === picker.id) : null;
  const set = (patch) => onChange({ ...value, ...patch });

  // Yo'nalishni qo'shish/olib tashlash; olib tashlanganda uning quyi yo'nalishlari ham tozalanadi.
  const toggleParent = (p) => {
    if (value.parentIds.includes(p.id)) {
      const childIds = (p.children ?? EMPTY).map((c) => c.id);
      set({
        parentIds: value.parentIds.filter((id) => id !== p.id),
        subIds: value.subIds.filter((id) => !childIds.includes(id)),
      });
    } else {
      set({ parentIds: [...value.parentIds, p.id] });
    }
  };
  const toggleSub = (id) =>
    set({
      subIds: value.subIds.includes(id)
        ? value.subIds.filter((x) => x !== id)
        : [...value.subIds, id],
    });
  const clearSubs = (p) => {
    const childIds = (p.children ?? EMPTY).map((c) => c.id);
    set({ subIds: value.subIds.filter((id) => !childIds.includes(id)) });
  };

  const regionName = regions.find((r) => r.id === value.regionId)?.name ?? null;
  const districtName = districts.find((d) => d.id === value.districtId)?.name ?? null;
  const all = tr('workersList.filters.all');

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
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.tiles}
          >
            {tree.map((c) => (
              <CategoryTile
                key={c.id}
                label={c.name}
                icon={c.icon}
                active={value.parentIds.includes(c.id)}
                onPress={() => toggleParent(c)}
              />
            ))}
          </ScrollView>

          {selectedParents
            .filter((p) => (p.children ?? EMPTY).length > 0)
            .map((p) => {
              const names = p.children
                .filter((c) => value.subIds.includes(c.id))
                .map((c) => c.name);
              return (
                <SelectField
                  key={p.id}
                  label={p.name}
                  icon="shape-outline"
                  value={names.length > 0 ? names.join(', ') : null}
                  placeholder={tr('listings.allInDirection')}
                  onPress={() => setPicker({ type: 'subs', id: p.id })}
                />
              );
            })}

          <SelectField
            label={tr('workersList.filters.region')}
            icon="map-marker-outline"
            value={regionName}
            placeholder={all}
            onPress={() => setPicker('region')}
          />

          {value.regionId != null && districts.length > 0 && (
            <SelectField
              label={tr('workersList.filters.district')}
              icon="map-marker-radius-outline"
              value={districtName}
              placeholder={all}
              onPress={() => setPicker('district')}
            />
          )}

          <Text style={[s.label, { color: t.muted }]}>{tr('workersList.filters.rating')}</Text>
          <View style={s.wrap}>
            <Chip
              label={all}
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
            <Chip label={all} active={value.badge == null} onPress={() => set({ badge: null })} />
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
            <MaterialCommunityIcons name="filter-remove-outline" size={19} color={t.text} />
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

      {picker === 'region' && (
        <OptionPicker
          title={tr('workersList.filters.region')}
          options={regions}
          selectedId={value.regionId}
          allLabel={all}
          onSelect={(id) => {
            set({ regionId: id, districtId: null });
            setPicker(null);
          }}
          onClose={() => setPicker(null)}
          maxHeight={maxHeight}
          bottomInset={bottomInset}
        />
      )}
      {subsParent && (
        <OptionPicker
          title={subsParent.name}
          options={subsParent.children ?? EMPTY}
          selectedIds={value.subIds.filter((id) =>
            (subsParent.children ?? EMPTY).some((c) => c.id === id)
          )}
          allLabel={tr('listings.allInDirection')}
          applyLabel={tr('workersList.filters.apply')}
          onSelect={(id) => (id == null ? clearSubs(subsParent) : toggleSub(id))}
          onClose={() => setPicker(null)}
          maxHeight={maxHeight}
          bottomInset={bottomInset}
        />
      )}
      {picker === 'district' && (
        <OptionPicker
          title={tr('workersList.filters.district')}
          options={districts}
          selectedId={value.districtId}
          allLabel={all}
          onSelect={(id) => {
            set({ districtId: id });
            setPicker(null);
          }}
          onClose={() => setPicker(null)}
          maxHeight={maxHeight}
          bottomInset={bottomInset}
        />
      )}
    </View>
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
  tiles: { gap: 2, paddingRight: 4 },
  tileWrap: { paddingTop: 8, paddingRight: 8 },
  tileX: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtn: {
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  tile: {
    width: 84,
    height: 82,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 6,
  },
  tileEmoji: { fontSize: 25, lineHeight: 30 },
  tileTxt: { fontSize: 11.5, fontWeight: '700', textAlign: 'center', lineHeight: 14 },
  chip: {
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 19,
    borderWidth: 1,
    justifyContent: 'center',
  },
  chipTxt: { fontSize: 13, fontWeight: '700' },
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  selectTxt: { flex: 1, fontSize: 14.5, fontWeight: '700' },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
  },
  optionTxt: { flex: 1, fontSize: 14.5 },
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
  btn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnTxt: { fontSize: 14.5, fontWeight: '800' },
});
