import { useState, useEffect, useMemo } from 'react';
import { getOrderDetail } from '../../../api/orders';
import { getMockOrderExtras } from '../mockExtras';

// Buyurtma tafsiloti: ro'yxatdagi ma'lumot darhol ko'rsatiladi, to'liq tafsilot va to'lov holati
// orqada yuklanib, ustiga qo'shiladi. `extras` — backendda yo'q (namuna) qiymatlar.
export default function useOrderDetail(listOrder) {
  const [order, setOrder] = useState(listOrder);

  useEffect(() => {
    let cancelled = false;
    getOrderDetail(listOrder.id)
      .then((detail) => {
        if (!cancelled) setOrder((prev) => ({ ...prev, ...detail, service: detail.service ?? prev.service }));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [listOrder.id]);

  const extras = useMemo(() => getMockOrderExtras(order), [order]);

  return { order, extras };
}
