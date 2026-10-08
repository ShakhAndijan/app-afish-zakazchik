import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { getOrderDetail } from '../../../api/orders';
import { getMockOrderExtras } from '../mockExtras';

// Buyurtma tafsiloti: ro'yxatdagi ma'lumot darhol ko'rsatiladi, to'liq tafsilot va to'lov holati
// orqada yuklanib, ustiga qo'shiladi. `extras` — backendda yo'q (namuna) qiymatlar.
// `refresh` — amaldan keyin (masalan bekor qilingach) tafsilotni qayta yuklaydi.
export default function useOrderDetail(listOrder) {
  const [order, setOrder] = useState(listOrder);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    const detail = await getOrderDetail(listOrder.id);
    if (!mountedRef.current) return;
    setOrder((prev) => ({ ...prev, ...detail, service: detail.service ?? prev.service }));
  }, [listOrder.id]);

  useEffect(() => {
    refresh().catch(() => {});
  }, [refresh]);

  const extras = useMemo(() => getMockOrderExtras(order), [order]);

  return { order, extras, refresh };
}
