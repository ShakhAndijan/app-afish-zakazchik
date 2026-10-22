import { View, Text, Pressable, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';

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

// Reels uchun yo'nalish filtri: tepadagi bitta tugma bosilganda ochiladi, tanlov darrov qo'llanadi.
export default function ReelFilterSheet({
  tree,
  parentId,
  subId,
  onPickParent,
  onPickSub,
  onReset,
  onClose,
  maxHeight,
  bottomInset,
}) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const children = tree.find((c) => c.id === parentId)?.children ?? [];

  return (
    <View style={StyleSheet.absoluteFill}>
      <Pressable
        style={s.backdrop}
        onPress={onClose}
        accessibilityLabel={tr('listings.reels.close')}
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
          <Text style={[s.title, { color: t.text }]}>{tr('listings.reels.filterTitle')}</Text>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={tr('listings.reels.close')}
          >
            <MaterialCommunityIcons name="close" size={22} color={t.muted} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={s.wrap}>
            <Chip
              label={tr('listings.all')}
              active={parentId == null}
              onPress={() => onPickParent(null)}
            />
            {tree.map((c) => (
              <Chip
                key={c.id}
                label={c.icon ? `${c.icon} ${c.name}` : c.name}
                active={parentId === c.id}
                onPress={() => onPickParent(c.id)}
              />
            ))}
          </View>

          {children.length > 0 && (
            <View style={[s.wrap, { marginTop: 18 }]}>
              <Chip
                label={tr('listings.allInDirection')}
                active={subId == null}
                onPress={() => onPickSub(null)}
              />
              {children.map((c) => (
                <Chip
                  key={c.id}
                  label={c.name}
                  active={subId === c.id}
                  onPress={() => onPickSub(c.id)}
                />
              ))}
            </View>
          )}
        </ScrollView>

        <View style={s.actions}>
          <TouchableOpacity
            onPress={onReset}
            activeOpacity={0.85}
            style={[s.btn, { backgroundColor: t.card, borderColor: t.border, borderWidth: 1 }]}
          >
            <Text style={[s.btnTxt, { color: t.text }]}>{tr('listings.filters.reset')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.85}
            style={[s.btn, { backgroundColor: t.orange, flex: 1.4 }]}
          >
            <Text style={[s.btnTxt, { color: '#fff' }]}>{tr('listings.filters.apply')}</Text>
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
    marginBottom: 16,
  },
  title: { fontSize: 18, fontWeight: '800' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 19,
    borderWidth: 1,
    justifyContent: 'center',
  },
  chipTxt: { fontSize: 13, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  btn: { flex: 1, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  btnTxt: { fontSize: 14.5, fontWeight: '800' },
});
