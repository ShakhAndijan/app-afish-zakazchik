import { useMemo, useCallback, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';

const GAP = 10;
const H_PAD = 20;
const PILL_H = 66;
const HEX = /^#[0-9a-f]{6}$/i;
const AUTO_STEP = 150;
const EDGE = 8;

// Kategoriyalar: rangli "tabletka" kartalar, ikki qatorda; har bir qator alohida gorizontal karusel.
// Nomi chap tepada, emoji-belgisi o'ng pastda. Tanlangan kategoriya ota komponentda saqlanadi
// (`selectedId`), shuning uchun ekran qayta qurilganda ham "faol" belgisi yo'qolmaydi.
// `autoScroll` yoqilgan bo'lsa qatorlar o'zi surilib turadi: yuqorigisi o'ngga, pastkisi chapga
// (turli tezlikda). Foydalanuvchi surayotganda yoki kategoriya tanlanganda to'xtab turadi.
export default function ServiceCategories({
  categories,
  selectedId,
  onSelect,
  horizontalPadding = H_PAD,
  autoScroll = true,
}) {
  const { theme: t } = useTheme();

  // Ikki qatorga navbatma-navbat bo'linadi, shunda qatorlar uzunligi taxminan teng bo'ladi.
  const rows = useMemo(() => {
    const list = categories ?? [];
    if (list.length <= 4) return [list];
    return [list.filter((_, i) => i % 2 === 0), list.filter((_, i) => i % 2 === 1)];
  }, [categories]);

  const renderPill = useCallback(
    (item) => {
      const isActive = selectedId === item.id;
      const color = HEX.test(item.color ?? '') ? item.color : t.orange;
      return (
        <TouchableOpacity
          key={item.id}
          style={[
            s.pill,
            {
              backgroundColor: `${color}${isActive ? '4d' : t.isDark ? '26' : '1f'}`,
              borderColor: isActive ? color : `${color}${t.isDark ? '55' : '40'}`,
              borderWidth: isActive ? 2 : 1,
            },
          ]}
          onPress={() => onSelect?.(isActive ? null : item.id)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={item.name}
          accessibilityState={{ selected: isActive }}
        >
          <Text style={[s.name, { color: t.text }]} numberOfLines={2}>
            {item.name}
          </Text>
          <View style={s.iconWrap} pointerEvents="none">
            {item.icon ? (
              <Text style={s.emoji} allowFontScaling={false}>
                {item.icon}
              </Text>
            ) : (
              <MaterialCommunityIcons name="toolbox-outline" size={30} color={color} />
            )}
          </View>
        </TouchableOpacity>
      );
    },
    [selectedId, t, onSelect]
  );

  if (!categories || categories.length === 0) return null;

  const paused = selectedId != null;

  return (
    <View style={{ gap: GAP, paddingVertical: 4 }}>
      {rows.map((row, i) => (
        <PillRow
          key={i}
          paddingHorizontal={horizontalPadding}
          auto={autoScroll && !paused}
          reverse={i === 1}
          interval={i === 1 ? 2700 : 2200}
        >
          {row.map(renderPill)}
        </PillRow>
      ))}
    </View>
  );
}

// Bitta qator: o'z karuseli. `reverse` — oxiridan boshlanib chapga suriladi.
function PillRow({ children, paddingHorizontal, auto, reverse, interval }) {
  const ref = useRef(null);
  const pos = useRef({ x: 0, content: 0, view: 0, placed: false });
  const touching = useRef(false);

  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => {
      const p = pos.current;
      if (touching.current || p.content <= p.view) return;
      const max = p.content - p.view;
      let next;
      if (reverse) next = p.x <= EDGE ? max : Math.max(0, p.x - AUTO_STEP);
      else next = p.x >= max - EDGE ? 0 : Math.min(max, p.x + AUTO_STEP);
      ref.current?.scrollTo({ x: next, animated: true });
    }, interval);
    return () => clearInterval(id);
  }, [auto, reverse, interval]);

  return (
    <ScrollView
      ref={ref}
      horizontal
      showsHorizontalScrollIndicator={false}
      scrollEventThrottle={16}
      onScroll={(e) => {
        pos.current.x = e.nativeEvent.contentOffset.x;
      }}
      onLayout={(e) => {
        pos.current.view = e.nativeEvent.layout.width;
      }}
      onContentSizeChange={(w) => {
        const p = pos.current;
        p.content = w;
        if (reverse && !p.placed && w > p.view && p.view > 0) {
          p.placed = true;
          ref.current?.scrollTo({ x: w - p.view, animated: false });
        }
      }}
      onScrollBeginDrag={() => {
        touching.current = true;
      }}
      onScrollEndDrag={() => {
        touching.current = false;
      }}
      contentContainerStyle={{ paddingHorizontal, gap: GAP }}
    >
      {children}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  pill: {
    height: PILL_H,
    minWidth: 104,
    maxWidth: 190,
    borderRadius: 20,
    paddingLeft: 14,
    paddingRight: 62,
    paddingTop: 12,
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },
  name: { fontSize: 14, fontWeight: '600', lineHeight: 18 },
  iconWrap: {
    position: 'absolute',
    right: 8,
    bottom: 4,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 38 },
});
