// "3 kun oldin" kabi nisbiy vaqt matni. Matnlar tarjima fayllaridan olinadi
// (zakazchiMain.timeAgo.*), shuning uchun tilga mos chiqadi.
export function formatTimeAgo(dateStr, tr) {
  if (!dateStr) return '';
  const time = new Date(dateStr).getTime();
  if (Number.isNaN(time)) return '';
  const days = Math.floor((Date.now() - time) / 86400000);
  if (days <= 0) return tr('zakazchiMain.timeAgo.today');
  if (days === 1) return tr('zakazchiMain.timeAgo.yesterday');
  if (days < 7) return tr('zakazchiMain.timeAgo.days', { n: days });
  if (days < 30) return tr('zakazchiMain.timeAgo.weeks', { n: Math.floor(days / 7) });
  return tr('zakazchiMain.timeAgo.months', { n: Math.floor(days / 30) });
}
