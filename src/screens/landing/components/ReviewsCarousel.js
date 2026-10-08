import { useState, useEffect } from 'react';
import { View, Text, FlatList } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS } from '../../../constants/colors';
import { getTopComments } from '../../../api/reviews';
import { useLanguage } from '../../../context/LanguageContext';
import useAutoScroll from '../hooks/useAutoScroll';
import SectionHead from './SectionHead';

const CARD_W = 240;
const GAP = 12;
const SLOT = CARD_W + GAP;

// "Mijozlar fikri": sarlavha va eng yaxshi sharhlar karuseli (o'zi aylanadi). Sharhlar bo'lmasa
// sarlavhasi bilan birga butunlay chizilmaydi.
export default function ReviewsCarousel() {
  const { t } = useLanguage();
  const [reviews, setReviews] = useState([]);
  const listRef = useAutoScroll(reviews.length, SLOT, 2500);

  useEffect(() => {
    getTopComments({ limit: 10 })
      .then(setReviews)
      .catch(() => {});
  }, []);

  if (reviews.length === 0) return null;

  return (
    <>
      <SectionHead title={t('app.sectionHead.reviews')} />
      <FlatList
        ref={listRef}
        data={reviews}
        keyExtractor={(_, i) => String(i)}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={SLOT}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 16, gap: GAP, paddingBottom: 4 }}
        style={{ marginBottom: 32 }}
        renderItem={({ item }) => <ReviewCard review={item} />}
      />
    </>
  );
}

function ReviewCard({ review: r }) {
  return (
    <View
      style={{
        width: CARD_W,
        backgroundColor: COLORS.card,
        borderRadius: 18,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
      }}
    >
      <View style={{ flexDirection: 'row', gap: 3, marginBottom: 10 }}>
        {[0, 1, 2, 3, 4].map((j) => (
          <Ionicons key={j} name="star" size={14} color={j < r.stars ? '#f5b81f' : '#2a3a4a'} />
        ))}
      </View>
      <Text style={{ color: '#c4cdd8', fontSize: 13.5, lineHeight: 20, marginBottom: 14 }}>
        {r.text}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            backgroundColor: r.color,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>{r.initial}</Text>
        </View>
        <View>
          <Text style={{ color: COLORS.white, fontWeight: '600', fontSize: 13 }}>{r.name}</Text>
          <Text style={{ color: COLORS.gray, fontSize: 11.5, marginTop: 1 }}>{r.location}</Text>
        </View>
      </View>
    </View>
  );
}
