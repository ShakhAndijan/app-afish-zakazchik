import { ENDPOINTS } from '../constants/config';
import { request } from '../utils/request';

// `sub_category_only=false` (backend default): daraxt — asosiy yo'nalishlar, ularning ichida `children`.
// `true` bo'lsa faqat quyi yo'nalishlar (parent_id bilan) tekis ro'yxatda qaytadi, asosiylari yo'q.
export async function getCategories() {
  return (await request(`${ENDPOINTS.CATEGORIES}?sub_category_only=false`)) ?? [];
}
