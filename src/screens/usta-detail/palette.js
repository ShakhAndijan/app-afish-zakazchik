/** Mavzu (theme) obyektini shu ekranda ishlatiladigan rang nomlariga o'giradi */
export function buildPalette(t) {
  return {
    bg: t.bg,
    card: t.card,
    card2: t.card2,
    card3: t.card3,
    line: t.border,
    line2: t.line2,
    orange: t.orange,
    green: t.green,
    blue: t.blue,
    purple: t.violet,
    gold: t.gold,
    txt: t.text,
    dim: t.muted,
    dim2: t.faint,
  };
}

// Ishonchlilik nishonlari (backenddagi `reliability_badge` qiymatlari bo'yicha).
export const RELIABILITY_BADGES = {
  bronze: { emoji: '🥉', key: 'bronze', color: '#cd7f32', bg: 'rgba(205,127,50,0.14)' },
  silver: { emoji: '🥈', key: 'silver', color: '#b0b8c1', bg: 'rgba(176,184,193,0.14)' },
  gold: { emoji: '🥇', key: 'gold', color: '#f0b429', bg: 'rgba(240,180,41,0.14)' },
};
