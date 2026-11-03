// Ekran uchun ma'lumotni tayyorlovchi sof funksiyalar (React'siz) — backenddan kelgan
// ustani statistika kataklari, nishonlar va ish jadvali ko'rinishiga o'giradi.

import { formatYears } from '../../utils/format';
import { RELIABILITY_BADGES } from './palette';
import { ratePercent } from './utils';

// Ustaning hozirgi ma'lumoti: batafsil javob bo'lsa — shu, bo'lmasa ro'yxatdan kelgan.
export function pickProfile({ detail, usta, C, tr }) {
  const d = detail || usta || {};
  const rawRating = d.rating;
  return {
    d,
    initial: d.initial || 'A',
    name: d.name || '',
    trade: d.trade || d.profession || '',
    rawRating,
    rating: typeof rawRating === 'number' ? rawRating.toFixed(1) : rawRating || '—',
    bgColor: d.bgColor || d.color || C.orange,
    location: d.location || '',
    experience: d.experienceYears > 0 ? formatYears(tr, d.experienceYears) : '',
    bio: d.bio || '',
    presence: d,
    startingPrice: d.startingPrice || '0',
    languages: Array.isArray(d.languages) ? d.languages : [],
  };
}

// Ishonchlilik va VIP nishonlari.
export function buildBadges(d, tr, C) {
  const badges = [];
  const reliabilityMeta = RELIABILITY_BADGES[d.reliability_badge];
  if (reliabilityMeta) {
    badges.push({
      ...reliabilityMeta,
      label: tr(`ustaDetail.reliabilityBadges.${reliabilityMeta.key}`),
    });
  }
  if (d.vip_status && d.vip_status !== 'none') {
    badges.push({
      emoji: '👑',
      label: tr('ustaDetail.vipBadge'),
      color: C.purple,
      bg: 'rgba(148,102,207,0.14)',
    });
  }
  if (d.isPro) {
    badges.push({
      emoji: '💼',
      label: tr('workerBadges.pro'),
      color: C.blue,
      bg: 'rgba(63,127,212,0.14)',
    });
  }
  if (d.isTop) {
    badges.push({
      emoji: '🔥',
      label: tr('workerBadges.top'),
      color: C.orange,
      bg: 'rgba(232,122,69,0.14)',
    });
  }
  if (d.contestWins > 0) {
    badges.push({
      emoji: '🏆',
      label: tr('workerBadges.contestWins', { n: d.contestWins }),
      color: C.gold,
      bg: 'rgba(245,196,81,0.14)',
    });
  }
  if (d.brigade) {
    badges.push({
      emoji: '👥',
      label: d.brigade.size
        ? tr('workerBadges.brigadeSize', { name: d.brigade.name, count: d.brigade.size })
        : tr('workerBadges.brigade', { name: d.brigade.name }),
      color: C.green,
      bg: 'rgba(47,163,122,0.14)',
    });
  }
  if (d.complaintsCount > 0) {
    badges.push({
      emoji: '⚠️',
      label: tr('workerBadges.complaints', { n: d.complaintsCount }),
      color: '#e0473a',
      bg: 'rgba(224,71,58,0.12)',
    });
  }
  return badges;
}

// Tepadagi 3 ta statistika katagi: tajriba, qayta chaqiruv/qabul qilish, bajarilgan ishlar.
export function buildStatItems({ d, experience, detail, portfolio, tr, C }) {
  const secondaryStat =
    d.repeatClientRate != null
      ? {
          value: `${ratePercent(d.repeatClientRate)}%`,
          label: tr('ustaDetail.stats.repeatClient'),
          icon: 'repeat-variant',
          color: C.blue,
        }
      : d.acceptanceRate != null
        ? {
            value: `${ratePercent(d.acceptanceRate)}%`,
            label: tr('ustaDetail.stats.acceptance'),
            icon: 'thumb-up-outline',
            color: C.blue,
          }
        : null;

  return [
    experience
      ? {
          value: experience,
          label: tr('ustaDetail.stats.experience'),
          icon: 'briefcase-outline',
          color: C.orange,
        }
      : null,
    secondaryStat,
    detail?.completedJobsCount
      ? {
          value: String(detail.completedJobsCount),
          label: tr('ustaDetail.stats.completedJobs'),
          icon: 'hammer-wrench',
          color: C.purple,
        }
      : {
          value: String(portfolio.length),
          label: tr('ustaDetail.stats.portfolioSamples'),
          icon: 'image-multiple-outline',
          color: C.purple,
        },
  ].filter(Boolean);
}

// Ish jadvali: hafta kunlari (ishlaydigan va dam olish), umumiy ish vaqti va dam olish sanalari.
export function buildSchedule(schedule) {
  if (!schedule) return { weekDays: [], workHours: null, offDates: [] };

  const byId = new Map();
  schedule.workingDays.forEach((wd) =>
    byId.set(wd.id, {
      id: wd.id,
      name: wd.name,
      isWorking: true,
      workStart: wd.workStart,
      workEnd: wd.workEnd,
    })
  );
  schedule.daysOff.forEach((off) => {
    if (!byId.has(off.id)) byId.set(off.id, { id: off.id, name: off.name, isWorking: false });
  });
  const weekDays = [...byId.values()].sort((a, b) => a.id - b.id);

  // Barcha ish kunlarida vaqt bir xil bo'lsagina bitta "09:00 – 18:00" ko'rsatiladi.
  const working = weekDays.filter((day) => day.isWorking);
  const key = (day) => `${day.workStart}-${day.workEnd}`;
  const allSame = working.length > 0 && working.every((day) => key(day) === key(working[0]));
  const workHours = allSame
    ? `${working[0].workStart.slice(0, 5)} – ${working[0].workEnd.slice(0, 5)}`
    : null;

  return { weekDays, workHours, offDates: schedule.offDates || [] };
}
