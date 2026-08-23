import { ENDPOINTS } from '../constants/config';
import { apiFetch } from '../utils/apiClient';

export async function createOrder(payload, idempotencyKey) {
  const res = await apiFetch(ENDPOINTS.ORDERS, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    // FastAPI 422 validatsiya xatolari odatda `detail` massivida keladi —
    // shu tafsilotlarni ko'rsatish sabab-oqibatni tezroq topishga yordam beradi.
    const detailMsg = Array.isArray(err.detail)
      ? err.detail.map((d) => `${(d.loc || []).slice(-1)[0]}: ${d.msg}`).join('; ')
      : err.detail;
    const e = new Error(err.message || detailMsg || 'Buyurtma yuborishda xatolik yuz berdi');
    e.status = res.status;
    throw e;
  }

  const json = await res.json();
  return json.response_data;
}
