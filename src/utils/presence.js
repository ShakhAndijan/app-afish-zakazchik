// Ustaning holati: 'online' | 'busy' | 'offline' | null (noma'lum). Server `availability` bersa shu,
// bermasa eski `is_online` belgisi ishlatiladi (offline bo'lsa belgi ko'rsatilmaydi).
export function workerPresence(w) {
  const raw = w?.availability;
  if (raw === 'online' || raw === 'busy' || raw === 'offline') {
    return { status: raw, busyUntil: w.busyUntil ?? null };
  }
  return { status: w?.is_online ? 'online' : null, busyUntil: null };
}

// "Band" holatidagi ustaning bo'shash vaqti: bugun bo'lsa "14:30", boshqa kun bo'lsa "03.11 14:30".
export function formatBusyUntil(iso) {
  if (!iso) return '';
  const d = new Date(String(iso).replace(/(\.\d{3})\d+/, '$1'));
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  return sameDay ? time : `${pad(d.getDate())}.${pad(d.getMonth() + 1)} ${time}`;
}
