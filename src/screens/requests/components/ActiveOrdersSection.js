import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '../../../context/LanguageContext';
import { orderRoute } from '../../../navigation/params';
import SectionHeader from '../../zakazchi-main/components/SectionHeader';
import RequestCard from './RequestCard';

// Bosh sahifada hamyon kartasi ostida: backenddagi faol zakazlar (kutilmoqda, kelishilmoqda
// yoki jarayonda). Kartani bossangiz zakaz tafsiloti ochiladi; faol zakaz bo'lmasa blok
// ko'rinmaydi. Ro'yxat javobida faqat `category_id` bor, shuning uchun xizmat nomi
// kategoriyalardan olinadi.
export default function ActiveOrdersSection({ orders = [], categories = [], style }) {
  const router = useRouter();
  const { t: tr } = useLanguage();

  if (orders.length === 0) return null;

  const names = new Map((categories ?? []).map((c) => [c.id, c.name]));
  const titleOf = (order) =>
    order.service ?? names.get(order.categoryId) ?? order.task ?? tr('requests.summaryTitle');

  return (
    <View style={style}>
      <SectionHeader title={tr('requests.sectionTitle')} actionLabel={String(orders.length)} />
      <View style={s.list}>
        {orders.map((order) => (
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
  list: { gap: 10 },
});
