import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '../../../context/LanguageContext';
import { orderRoute } from '../../../navigation/params';
import SectionHeader from '../../zakazchi-main/components/SectionHeader';
import RequestCard from './RequestCard';

const MAX_SHOWN = 3;

// Bosh sahifada: mijozning o'z faol buyurtmalari (kutilmoqda, kelishilmoqda yoki jarayonda).
// Ro'yxat `/orders/me/customer` dan keladi — faqat shu mijozniki. Eng ko'pi bilan MAX_SHOWN ta
// karta ko'rsatiladi, qolganlari "Barchasi" orqali. Faol buyurtma bo'lmasa blok ko'rinmaydi.
// Ro'yxat javobida faqat `category_id` bor, shuning uchun xizmat nomi kategoriyalardan olinadi.
export default function ActiveOrdersSection({ orders = [], categories = [], style }) {
  const router = useRouter();
  const { t: tr } = useLanguage();

  if (orders.length === 0) return null;

  const names = new Map((categories ?? []).map((c) => [c.id, c.name]));
  const titleOf = (order) =>
    order.service ?? names.get(order.categoryId) ?? order.task ?? tr('requests.summaryTitle');

  return (
    <View style={style}>
      <SectionHeader
        title={`${tr('requests.sectionTitle')} · ${orders.length}`}
        actionLabel={tr('common.seeAll')}
        onActionPress={() => router.push('/orders')}
      />
      <View style={s.list}>
        {orders.slice(0, MAX_SHOWN).map((order) => (
          <RequestCard
            key={order.id}
            order={order}
            title={titleOf(order)}
            onPress={() => router.push(orderRoute(order))}
          />
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  list: { gap: 12 },
});
