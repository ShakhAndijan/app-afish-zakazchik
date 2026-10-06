import { useRef, useEffect } from 'react';
import { FlatList } from 'react-native';
import { POPULAR_TILE_W, POPULAR_GAP, POPULAR_SLOT } from '../constants';
import CategoryTile from './CategoryTile';

// Ommabop yo'nalishlar: gorizontal ro'yxat, 3 tadan ko'p bo'lsa o'zi aylanib turadi.
export default function PopularCategories({ categories, onSelect }) {
  const listRef = useRef(null);
  const idxRef = useRef(0);
  const auto = categories.length > 3;

  useEffect(() => {
    if (!auto) return;
    const timer = setInterval(() => {
      idxRef.current = (idxRef.current + 1) % categories.length;
      listRef.current?.scrollToOffset({ offset: idxRef.current * POPULAR_SLOT, animated: true });
    }, 2200);
    return () => clearInterval(timer);
  }, [auto, categories.length]);

  return (
    <FlatList
      ref={listRef}
      data={categories}
      keyExtractor={(c) => String(c.id)}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: POPULAR_GAP }}
      getItemLayout={(_, index) => ({ length: POPULAR_TILE_W, offset: POPULAR_SLOT * index, index })}
      renderItem={({ item }) => (
        <CategoryTile item={item} variant="popular" onPress={() => onSelect(item.id)} />
      )}
    />
  );
}
