import { useMemo, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, useWindowDimensions } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import useAutoCarousel from '../hooks/useAutoCarousel';

const SVC_GAP = 10;
const SVC_H_PAD = 20;
const SVC_VISIBLE = 4;

// Xizmat turlari karuseli (cheksiz, avto-aylanadi). Tanlangan kategoriya ota
// komponentda saqlanadi (`selectedId`), shuning uchun ekran qayta qurilganda ham
// "faol" belgisi yo'qolmaydi.
export default function ServiceCarousel({ categories, selectedId, onSelect }) {
  const { theme: t } = useTheme();
  const { width: screenW } = useWindowDimensions();

  const loopLen = categories.length;
  const servicesLoop = useMemo(() => {
    if (loopLen === 0) return [];
    return [
      ...categories.map((c) => ({ ...c, uid: `a-${c.id}` })),
      ...categories.map((c) => ({ ...c, uid: `b-${c.id}` })),
      ...categories.map((c) => ({ ...c, uid: `c-${c.id}` })),
    ];
  }, [categories, loopLen]);

  const itemW = Math.floor((screenW - SVC_H_PAD * 2 - SVC_GAP * (SVC_VISIBLE - 1)) / SVC_VISIBLE);
  const itemStep = itemW + SVC_GAP;

  const { listRef, onScrollBeginDrag, onScrollEndDrag, onMomentumScrollEnd, hold, release } =
    useAutoCarousel({
      length: loopLen,
      step: itemStep,
      loop: true,
      startHeld: selectedId != null,
    });

  // Kategoriya tanlangan paytda karusel to'xtab turadi, tanlov bekor bo'lsa davom etadi.
  useEffect(() => {
    if (selectedId != null) hold();
    else release();
  }, [selectedId, hold, release]);

  const renderItem = useCallback(
    ({ item }) => {
      const isActive = selectedId === item.id;
      const color = item.color || t.orange;
      return (
        <TouchableOpacity
          style={[
            s.svcItem,
            {
              width: itemW,
              backgroundColor: t.card,
              borderColor: isActive ? color : t.border,
            },
          ]}
          onPress={() => onSelect(isActive ? null : item.id)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={item.name}
          accessibilityState={{ selected: isActive }}
        >
          <View style={[s.svcIconBox, { backgroundColor: isActive ? color : t.rowIconBg }]}>
            {item.icon ? (
              <Text style={{ fontSize: 20 }}>{item.icon}</Text>
            ) : (
              <MaterialCommunityIcons
                name="toolbox-outline"
                size={22}
                color={isActive ? '#fff' : color}
              />
            )}
          </View>
          <Text style={[s.svcLabel, { color: isActive ? color : t.muted }]} numberOfLines={2}>
            {item.name}
          </Text>
        </TouchableOpacity>
      );
    },
    [selectedId, t, itemW, onSelect]
  );

  if (loopLen === 0) return null;

  return (
    <FlatList
      ref={listRef}
      data={servicesLoop}
      keyExtractor={(item) => item.uid}
      renderItem={renderItem}
      horizontal
      showsHorizontalScrollIndicator={false}
      onScrollBeginDrag={onScrollBeginDrag}
      onScrollEndDrag={onScrollEndDrag}
      onMomentumScrollEnd={onMomentumScrollEnd}
      contentContainerStyle={{
        paddingHorizontal: SVC_H_PAD,
        paddingVertical: 4,
        gap: SVC_GAP,
      }}
      getItemLayout={(_, index) => ({
        length: itemW,
        offset: itemStep * index,
        index,
      })}
    />
  );
}

const s = StyleSheet.create({
  svcItem: {
    height: 90,
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  svcIconBox: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svcLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 14,
  },
});
