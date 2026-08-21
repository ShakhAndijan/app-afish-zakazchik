import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Share,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';
import {
  getWorkerById,
  getWorkerCertificates,
  likeWorker,
  unlikeWorker,
} from '../api/workers';
import AfishLoader from '../components/AfishLoader';
import WorkDetailScreen from './WorkDetailScreen';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

// ─── Colors ──────────────────────────────────────────────────────────────────

/** Mavzu (theme) obyektini shu ekranda ishlatiladigan rang nomlariga o'giradi */
function buildPalette(t) {
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

const RELIABILITY_BADGES = {
  bronze: { emoji: '🥉', key: 'bronze', color: '#cd7f32', bg: 'rgba(205,127,50,0.14)' },
  silver: { emoji: '🥈', key: 'silver', color: '#b0b8c1', bg: 'rgba(176,184,193,0.14)' },
  gold: { emoji: '🥇', key: 'gold', color: '#f0b429', bg: 'rgba(240,180,41,0.14)' },
};

// Android'dagi Image (Fresco/OkHttp) kodlanmagan "+" belgisini URL'da
// noto'g'ri talqin qilib, rasmni yuklolmasligi mumkin — shu sababli xavfsiz kodlaymiz.
const encodeImageUri = (uri) => (uri ? uri.replace(/\+/g, '%2B') : uri);

const pad2 = (n) => String(n).padStart(2, '0');
function formatDate(isoDate) {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return '';
  return `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${d.getFullYear()}`;
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ icon, iconSet: IconSet = MaterialCommunityIcons, title, subtitle, C, st }) {
  return (
    <View style={[st.card, st.emptyCard]}>
      <View style={st.emptyIconWrap}>
        <IconSet name={icon} size={22} color={C.dim} />
      </View>
      <Text style={st.emptyTitle}>{title}</Text>
      {!!subtitle && <Text style={st.emptyText}>{subtitle}</Text>}
    </View>
  );
}

// ─── Rating Bar ───────────────────────────────────────────────────────────────

function RatingBar({ label, pct, st }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Text style={st.barLabel}>{label}</Text>
      <View style={st.barTrack}>
        {pct > 0 && <View style={[st.barFill, { width: pct + '%' }]} />}
      </View>
      <Text style={st.barPct}>{pct}%</Text>
    </View>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ initial, size, bgColor, uri, C, st }) {
  const [failed, setFailed] = useState(false);
  const showImage = uri && !failed;

  return (
    <View
      style={[
        st.avatar,
        { width: size, height: size, backgroundColor: showImage ? C.card3 : bgColor },
      ]}
    >
      {showImage ? (
        <Image
          source={{ uri: encodeImageUri(uri) }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <Text style={st.avatarTxt}>{initial}</Text>
      )}
    </View>
  );
}

// ─── Works Carousel ───────────────────────────────────────────────────────────

const CARD_W = 148;
const CARD_GAP = 10;
const CARD_SLOT = CARD_W + CARD_GAP;

function WorksCarousel({ works, C, st, onSelectWork }) {
  const listRef = useRef(null);
  const idxRef = useRef(0);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (works.length === 0) return;
    const t = setInterval(() => {
      const next = (idxRef.current + 1) % works.length;
      idxRef.current = next;
      setActive(next);
      listRef.current?.scrollToOffset({
        offset: next * CARD_SLOT,
        animated: true,
      });
    }, 2200);
    return () => clearInterval(t);
  }, [works.length]);

  return (
    <View>
      <FlatList
        ref={listRef}
        data={works}
        keyExtractor={(item) => String(item.id)}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_SLOT}
        decelerationRate="fast"
        contentContainerStyle={{
          paddingLeft: 20,
          paddingRight: 10,
          gap: CARD_GAP,
        }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={st.workCard}
            activeOpacity={0.85}
            onPress={() => onSelectWork?.(item)}
          >
            <View style={[st.workImg, !item.photo && { backgroundColor: C.card3 }]}>
              {item.photo ? (
                <Image
                  source={{ uri: encodeImageUri(item.photo) }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              ) : (
                <MaterialCommunityIcons name="image-outline" size={36} color={C.dim2} />
              )}
              {item.rating != null && (
                <View style={st.workBadge}>
                  <Ionicons name="star" size={11} color={C.gold} />
                  <Text style={st.workBadgeTxt}>{Number(item.rating).toFixed(1)}</Text>
                </View>
              )}
            </View>
            <View style={{ padding: 10 }}>
              <Text style={st.workTitle} numberOfLines={2}>
                {item.title}
              </Text>
              {!!item.workDate && (
                <Text style={st.workDate}>{formatDate(item.workDate)}</Text>
              )}
            </View>
          </TouchableOpacity>
        )}
      />
      <View style={st.dots}>
        {works.map((_, i) => (
          <View key={i} style={[st.dot, i === active && st.dotActive]} />
        ))}
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function UstaDetailScreen({
  usta,
  onBack,
  onGoToLogin,
  isLoggedIn = false,
}) {
  const insets = useSafeAreaInsets();
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const C = useMemo(() => buildPalette(t), [t]);
  const st = useMemo(() => buildStyles(C), [C]);
  const [reviewFilter, setReviewFilter] = useState('all');
  const [liked, setLiked] = useState(false);
  const [likeSubmitting, setLikeSubmitting] = useState(false);
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [certificates, setCertificates] = useState([]);
  const [loadingCertificates, setLoadingCertificates] = useState(false);
  const [selectedWork, setSelectedWork] = useState(null);

  useEffect(() => {
    if (!usta?.id) return;
    let cancelled = false;
    setLoadingDetail(true);
    setCertificates([]);
    getWorkerById(usta.id)
      .then((data) => {
        if (!cancelled) {
          setDetail(data);
          setLiked(!!data.isLiked);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingDetail(false);
      });
    return () => {
      cancelled = true;
    };
  }, [usta?.id]);

  useEffect(() => {
    if (!detail?.id) return;
    let cancelled = false;
    setLoadingCertificates(true);
    getWorkerCertificates(detail.id, detail.mainCategoryId)
      .then((data) => {
        if (!cancelled) setCertificates(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingCertificates(false);
      });
    return () => {
      cancelled = true;
    };
  }, [detail?.id, detail?.mainCategoryId]);

  const d = detail || usta || {};

  const initial = d.initial || 'A';
  const name = d.name || '';
  const trade = d.trade || d.profession || '';
  const rawRating = d.rating;
  const rating =
    typeof rawRating === 'number' ? rawRating.toFixed(1) : rawRating || '—';
  const bgColor = d.bgColor || d.color || C.orange;
  const location = d.location || '';
  const experience = d.experience || '';
  const bio = d.bio || '';
  const isOnline = !!d.is_online;
  const startingPrice = d.startingPrice || '0';

  const categories = detail?.categories || [];
  const portfolio = detail?.portfolio || [];
  const schedule = detail?.schedule || null;

  const weekDays = useMemo(() => {
    if (!schedule) return [];
    const byId = new Map();
    schedule.workingDays.forEach((wd) =>
      byId.set(wd.id, { id: wd.id, name: wd.name, isWorking: true, workStart: wd.workStart, workEnd: wd.workEnd })
    );
    schedule.daysOff.forEach((off) => {
      if (!byId.has(off.id)) byId.set(off.id, { id: off.id, name: off.name, isWorking: false });
    });
    return [...byId.values()].sort((a, b) => a.id - b.id);
  }, [schedule]);
  const workHours = useMemo(() => {
    const working = weekDays.filter((d) => d.isWorking);
    if (working.length === 0) return null;
    const key = (d) => `${d.workStart}-${d.workEnd}`;
    const allSame = working.every((d) => key(d) === key(working[0]));
    if (!allSame) return null;
    return `${working[0].workStart.slice(0, 5)} – ${working[0].workEnd.slice(0, 5)}`;
  }, [weekDays]);
  const offDates = schedule?.offDates || [];

  const badges = [];
  const reliabilityMeta = RELIABILITY_BADGES[d.reliability_badge];
  if (reliabilityMeta) badges.push({ ...reliabilityMeta, label: tr(`ustaDetail.reliabilityBadges.${reliabilityMeta.key}`) });
  if (d.vip_status && d.vip_status !== 'none') {
    badges.push({ emoji: '👑', label: tr('ustaDetail.vipBadge'), color: C.purple, bg: 'rgba(148,102,207,0.14)' });
  }

  const secondaryStat =
    d.repeatClientRate != null
      ? {
          value: `${Math.round(d.repeatClientRate)}%`,
          label: tr('ustaDetail.stats.repeatClient'),
          icon: 'repeat-variant',
          color: C.blue,
        }
      : d.acceptanceRate != null
        ? {
            value: `${Math.round(d.acceptanceRate)}%`,
            label: tr('ustaDetail.stats.acceptance'),
            icon: 'thumb-up-outline',
            color: C.blue,
          }
        : null;
  const statItems = [
    experience
      ? { value: experience, label: tr('ustaDetail.stats.experience'), icon: 'briefcase-outline', color: C.orange }
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

  const languages = Array.isArray(d.languages) ? d.languages : [];
  const avgResponseMin = detail?.avgResponseMin;
  const reviewCount = detail?.reviewCount ?? 0;
  const ratingBreakdown = detail?.ratingBreakdown ?? null;
  const isIdentityVerified = !!detail?.isIdentityVerified;

  // Necha xil yulduz darajasida baho borligi (masalan 4 va 3) — shu asosda
  // o'rtacha qiymatni alohida ko'rsatish kerakligini aniqlaymiz.
  const distinctStarLevels = ratingBreakdown
    ? Object.values(ratingBreakdown).filter((c) => c > 0).length
    : 0;
  const showAverageLabel = distinctStarLevels > 1;

  const reviewItems = portfolio.filter((p) => p.comment || p.rating != null);
  const shownReviews =
    reviewFilter === 'photo'
      ? reviewItems.filter((p) => p.photos?.length)
      : reviewItems;

  // Backend review_count'ni noto'g'ri (0) qaytarishi mumkin, garchi overall_rating
  // yoki portfoliodagi baholangan ishlar mavjud bo'lsa ham — shu holatda "sharhlar
  // tez orada" bo'sh holatini emas, haqiqiy reytingni ko'rsatamiz.
  const hasRating = typeof rawRating === 'number' && rawRating > 0;
  const effectiveReviewCount = reviewCount > 0 ? reviewCount : reviewItems.length;
  const showRatingCard = effectiveReviewCount > 0 || hasRating;

  const handleToggleLike = () => {
    const workerId = usta?.id ?? detail?.id;
    if (!workerId || likeSubmitting) return;
    const next = !liked;
    setLiked(next);
    setLikeSubmitting(true);
    (next ? likeWorker(workerId) : unlikeWorker(workerId))
      .catch(() => setLiked(!next))
      .finally(() => setLikeSubmitting(false));
  };

  if (selectedWork) {
    return (
      <WorkDetailScreen
        work={{ ...selectedWork, worker: name }}
        onBack={() => setSelectedWork(null)}
      />
    );
  }

  return (
    <SafeAreaView style={st.safe} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />

      {/* ── Header ── */}
      <View style={st.header}>
        <TouchableOpacity
          onPress={onBack}
          style={st.iconBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={C.txt} />
        </TouchableOpacity>
        <Text style={st.headerTitle}>{tr('ustaDetail.headerTitle')}</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            style={st.iconBtn}
            activeOpacity={0.7}
            onPress={() =>
              Share.share({
                message: tr('ustaDetail.shareMessage', { name, trade, rating }),
              }).catch(() => {})
            }
          >
            <Feather name="share-2" size={18} color={C.txt} />
          </TouchableOpacity>
          {isLoggedIn && (
            <TouchableOpacity
              style={st.iconBtn}
              activeOpacity={0.7}
              onPress={handleToggleLike}
            >
              <Ionicons
                name={liked ? 'heart' : 'heart-outline'}
                size={20}
                color={liked ? C.orange : C.txt}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom, 14) + 76,
        }}
      >
        {/* ═══ Padded content block 1 ═══ */}
        <View style={st.pad}>
          {/* ── Hero ── */}
          <View
            style={{
              flexDirection: 'row',
              gap: 14,
              marginTop: 14,
              alignItems: 'center',
            }}
          >
            <Avatar initial={initial} size={68} bgColor={bgColor} uri={d.profile_photo} C={C} st={st} />
            <View style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  flexWrap: 'wrap',
                }}
              >
                {isOnline && (
                  <View style={st.onlinePill}>
                    <View style={st.onlineDot} />
                    <Text style={st.onlinePillTxt}>{tr('ustaDetail.online')}</Text>
                  </View>
                )}
                <Text style={{ fontSize: 19, fontWeight: '800', color: C.txt }}>
                  {name}
                </Text>
                {isIdentityVerified && (
                  <MaterialCommunityIcons
                    name="shield-check"
                    size={18}
                    color={C.green}
                  />
                )}
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  marginTop: 3,
                }}
              >
                <Ionicons name="location-outline" size={13} color={C.dim} />
                <Text style={{ fontSize: 13, color: C.dim }} numberOfLines={1}>
                  {[trade, location].filter(Boolean).join(' · ')}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  marginTop: 7,
                }}
              >
                <View style={st.ratingBadge}>
                  <Ionicons name="star" size={13} color={C.gold} />
                  <Text
                    style={{ color: C.gold, fontSize: 12, fontWeight: '800' }}
                  >
                    {rating}
                  </Text>
                </View>
                {avgResponseMin != null && (
                  <Text style={{ fontSize: 12.5, color: C.dim }}>
                    {tr('ustaDetail.avgResponse', { min: avgResponseMin })}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {!!bio && (
            <Text style={{ fontSize: 13.5, color: '#c4cdd8', marginTop: 12, lineHeight: 19 }}>
              {bio}
            </Text>
          )}

          {loadingDetail && !detail && (
            <AfishLoader size={64} style={{ alignItems: 'center', marginTop: 14 }} />
          )}

          {/* ── Stats ── */}
          {statItems.length > 0 && (
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
              {statItems.map((s, i) => (
                <View
                  key={i}
                  style={[
                    st.card,
                    { flex: 1, alignItems: 'center', paddingVertical: 13 },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={s.icon}
                    size={17}
                    color={s.color}
                    style={{ marginBottom: 5 }}
                  />
                  <Text style={{ fontSize: 17, fontWeight: '800', color: C.txt }}>
                    {s.value}
                  </Text>
                  <Text
                    style={{
                      fontSize: 11.5,
                      color: C.dim,
                      marginTop: 2,
                      textAlign: 'center',
                    }}
                  >
                    {s.label}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* ── Badges ── */}
          {badges.length > 0 && (
            <View
              style={{
                flexDirection: 'row',
                gap: 8,
                marginTop: 12,
                flexWrap: 'wrap',
              }}
            >
              {badges.map((b, i) => (
                <View
                  key={i}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 5,
                    backgroundColor: b.bg,
                    paddingHorizontal: 11,
                    paddingVertical: 7,
                    borderRadius: 10,
                  }}
                >
                  <Text style={{ fontSize: 13 }}>{b.emoji}</Text>
                  <Text
                    style={{ fontSize: 12.5, fontWeight: '800', color: b.color }}
                  >
                    {b.label}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* ── Tillar ── */}
          {languages.length > 0 && (
            <>
              <Text style={st.secTitle}>{tr('ustaDetail.languagesTitle')}</Text>
              <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                {languages.map((lang, i) => (
                  <View key={i} style={st.langChip}>
                    <View style={st.langIconWrap}>
                      <MaterialCommunityIcons name="translate" size={13} color={C.blue} />
                    </View>
                    <Text style={st.langChipTxt}>{lang}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* ── Mutaxassislik ── */}
          <Text style={st.secTitle}>{tr('ustaDetail.specializationTitle')}</Text>
          {categories.length > 0 ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {categories.map((c) => (
                <View
                  key={c.id}
                  style={[st.chip, c.isPrimary && st.chipActive]}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '700',
                      color: c.isPrimary ? C.orange : C.txt,
                    }}
                  >
                    {c.name}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={[st.card, { padding: 16, alignItems: 'center' }]}>
              <Text style={{ fontSize: 12.5, color: C.dim }}>
                {loadingDetail ? tr('common.loading') : tr('ustaDetail.specializationEmpty')}
              </Text>
            </View>
          )}

          {/* ── Xizmatlar narxi ── */}
          <Text style={st.secTitle}>{tr('ustaDetail.servicesPriceTitle')}</Text>
          {categories.length > 0 ? (
            <View style={st.card}>
              {categories.map((c, i) => (
                <View
                  key={c.id}
                  style={[
                    st.svcRow,
                    i < categories.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: C.line,
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: C.txt,
                      flex: 1,
                      marginRight: 8,
                    }}
                  >
                    {c.name}
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'baseline',
                      gap: 2,
                    }}
                  >
                    {c.isNegotiable ? (
                      <Text style={{ fontSize: 13, fontWeight: '700', color: C.dim }}>
                        {tr('ustaDetail.negotiablePrice')}
                      </Text>
                    ) : c.minPrice || c.price ? (
                      <Text style={{ fontSize: 14, fontWeight: '800', color: C.txt }}>
                        {tr('ustaDetail.priceFrom', { price: c.minPrice || c.price, currency: c.currency })}
                      </Text>
                    ) : (
                      <Text style={{ fontSize: 12.5, color: C.dim }}>
                        {tr('ustaDetail.noPriceSet')}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={[st.card, { padding: 16, alignItems: 'center' }]}>
              <Text style={{ fontSize: 12.5, color: C.dim }}>
                {loadingDetail ? tr('common.loading') : tr('ustaDetail.servicesEmpty')}
              </Text>
            </View>
          )}

          {/* ── Ish jadvali ── */}
          {isLoggedIn && weekDays.length > 0 && (
            <>
              <Text style={st.secTitle}>{tr('ustaDetail.scheduleTitle')}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {weekDays.map((day) => (
                  <View
                    key={day.id}
                    style={[
                      st.chip,
                      { paddingHorizontal: 12 },
                      day.isWorking ? st.dayChipOn : st.dayChipOff,
                    ]}
                  >
                    {day.isWorking && <View style={st.dayDot} />}
                    <Text
                      style={[
                        st.dayChipTxt,
                        { color: day.isWorking ? C.green : C.dim },
                      ]}
                    >
                      {day.name.slice(0, 3)}
                    </Text>
                  </View>
                ))}
              </View>
              {!!workHours && (
                <View
                  style={[
                    st.card2,
                    {
                      marginTop: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                      padding: 12,
                    },
                  ]}
                >
                  <Ionicons name="time-outline" size={16} color={C.dim} />
                  <Text style={{ fontSize: 13, color: C.txt, fontWeight: '600' }}>
                    {workHours}
                  </Text>
                </View>
              )}
              {offDates.length > 0 && (
                <View
                  style={[
                    st.card2,
                    {
                      marginTop: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                      padding: 12,
                    },
                  ]}
                >
                  <MaterialCommunityIcons name="calendar-remove-outline" size={16} color={C.dim} />
                  <Text style={{ fontSize: 12.5, color: C.dim, flex: 1 }}>
                    {tr('ustaDetail.daysOff', { dates: offDates.map(formatDate).join(', ') })}
                  </Text>
                </View>
              )}
            </>
          )}

          {/* ── Sertifikatlar ── */}
          <Text style={st.secTitle}>{tr('ustaDetail.certificatesTitle')}</Text>
          {certificates.length > 0 ? (
            <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
              {certificates.map((c) => (
                <View key={c.id} style={[st.card, { flexBasis: '48%', flexGrow: 1, padding: 13 }]}>
                  <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                    <View style={st.certIconWrap}>
                      <MaterialCommunityIcons name="shield-check" size={18} color={C.green} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={st.certTitle} numberOfLines={2}>
                        {c.title}
                      </Text>
                      <Text style={st.certMeta}>
                        {[c.issuedBy, formatDate(c.issuedAt)].filter(Boolean).join(' · ')}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <EmptyState
              icon="certificate-outline"
              title={loadingCertificates ? tr('common.loading') : tr('ustaDetail.certificatesEmptyTitle')}
              subtitle={loadingCertificates ? undefined : tr('ustaDetail.certificatesEmptySubtitle')}
              C={C}
              st={st}
            />
          )}
        </View>

        {/* ── Ishlari (full-width carousel) ── */}
        <Text
          style={[
            st.secTitle,
            { paddingHorizontal: 20, marginTop: 22, marginBottom: 14 },
          ]}
        >
          {tr('ustaDetail.worksTitle')}
        </Text>
        {portfolio.length > 0 ? (
          <WorksCarousel works={portfolio} C={C} st={st} onSelectWork={setSelectedWork} />
        ) : (
          <Text style={{ fontSize: 12.5, color: C.dim, paddingHorizontal: 20 }}>
            {loadingDetail ? tr('common.loading') : tr('ustaDetail.worksEmpty')}
          </Text>
        )}

        {/* ═══ Padded content block 2 ═══ */}
        <View style={st.pad}>
          {/* ── Reyting ── */}
          <Text style={[st.secTitle, { marginTop: 22 }]}>{tr('ustaDetail.ratingTitle')}</Text>
          {showRatingCard ? (
            <View style={st.card}>
              <View style={{ flexDirection: 'row', gap: 18, alignItems: 'center', padding: 16 }}>
                <View style={{ alignItems: 'center', minWidth: 68 }}>
                  {showAverageLabel && (
                    <Text style={{ fontSize: 10.5, fontWeight: '700', color: C.dim, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                      {tr('ustaDetail.averageRatingLabel')}
                    </Text>
                  )}
                  <Text style={{ fontSize: 38, fontWeight: '800', color: C.txt, lineHeight: 42 }}>
                    {rating}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 2, marginTop: 6 }}>
                    {[...Array(5)].map((_, k) => (
                      <Ionicons key={k} name="star" size={13} color={C.gold} />
                    ))}
                  </View>
                  {effectiveReviewCount > 0 && (
                    <Text style={{ fontSize: 11.5, color: C.dim, marginTop: 5 }}>
                      {tr('ustaDetail.reviewsCount', { count: effectiveReviewCount })}
                    </Text>
                  )}
                </View>
                {ratingBreakdown && effectiveReviewCount > 0 && (
                  <View style={{ flex: 1, gap: 7 }}>
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = ratingBreakdown[star] ?? 0;
                      const pct = Math.round((count / effectiveReviewCount) * 100);
                      return <RatingBar key={star} label={`${star}★`} pct={pct} st={st} />;
                    })}
                  </View>
                )}
              </View>
            </View>
          ) : (
            <EmptyState
              icon="chatbubbles-outline"
              iconSet={Ionicons}
              title={tr('ustaDetail.reviewsEmptyTitle')}
              subtitle={tr('ustaDetail.reviewsEmptySubtitle')}
              C={C}
              st={st}
            />
          )}

          {/* ── Sharhlar + filter ── */}
          {reviewItems.length > 0 && (
            <>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 22,
                  marginBottom: 12,
                }}
              >
                <Text style={{ fontSize: 15, fontWeight: '800', color: C.txt }}>
                  {tr('ustaDetail.reviewsTitle')}
                </Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {[
                    ['all', tr('ustaDetail.reviewFilterAll')],
                    ['photo', tr('ustaDetail.reviewFilterPhoto')],
                  ].map(([key, label]) => (
                    <TouchableOpacity
                      key={key}
                      onPress={() => setReviewFilter(key)}
                      style={[st.filterChip, reviewFilter === key && st.filterChipOn]}
                      activeOpacity={0.75}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: '700',
                          color: reviewFilter === key ? C.orange : C.txt,
                        }}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={{ gap: 12 }}>
                {shownReviews.map((p) => (
                  <View key={p.id} style={[st.card, { padding: 14 }]}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <View
                        style={{
                          flexDirection: 'row',
                          gap: 10,
                          alignItems: 'center',
                          flex: 1,
                          marginRight: 8,
                        }}
                      >
                        <View style={[st.revAv, { backgroundColor: C.card3 }]}>
                          <MaterialCommunityIcons name="briefcase-outline" size={16} color={C.dim} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{ fontWeight: '700', fontSize: 14, color: C.txt }}
                            numberOfLines={1}
                          >
                            {p.title}
                          </Text>
                          <Text style={{ fontSize: 11, color: C.dim, marginTop: 1 }}>
                            {formatDate(p.workDate)}
                          </Text>
                        </View>
                      </View>
                      {p.rating != null && (
                        <View style={{ flexDirection: 'row', gap: 2 }}>
                          {[...Array(Math.round(p.rating))].map((_, k) => (
                            <Ionicons key={k} name="star" size={13} color={C.gold} />
                          ))}
                        </View>
                      )}
                    </View>
                    {!!p.comment && (
                      <Text
                        style={{ fontSize: 13.5, color: '#c4cdd8', marginTop: 10, lineHeight: 20 }}
                      >
                        {p.comment}
                      </Text>
                    )}
                    {p.photos?.length > 0 && (
                      <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                        {p.photos.slice(0, 2).map((photoUri, k) => (
                          <Image
                            key={k}
                            source={{ uri: encodeImageUri(photoUri) }}
                            style={st.revPhoto}
                            resizeMode="cover"
                          />
                        ))}
                      </View>
                    )}
                  </View>
                ))}
                {shownReviews.length === 0 && (
                  <View style={[st.card, { padding: 16, alignItems: 'center' }]}>
                    <Text style={{ fontSize: 12.5, color: C.dim }}>
                      {tr('ustaDetail.reviewsPhotoEmpty')}
                    </Text>
                  </View>
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* ── Bottom CTA ── */}
      <View
        style={[st.bottomBar, { paddingBottom: Math.max(insets.bottom, 14) }]}
      >
        <TouchableOpacity style={st.chatBtn} activeOpacity={0.8}>
          <Ionicons name="chatbubble-outline" size={22} color={C.txt} />
        </TouchableOpacity>
        <TouchableOpacity
          style={st.callBtn}
          activeOpacity={0.85}
          onPress={isLoggedIn ? undefined : onGoToLogin}
        >
          <MaterialCommunityIcons
            name="lightning-bolt"
            size={18}
            color="#fff"
          />
          <Text style={st.callBtnTxt}>{tr('ustaDetail.callBtn', { price: startingPrice })}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function buildStyles(C) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  pad: { paddingHorizontal: 20 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.card3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { color: C.txt, fontSize: 17, fontWeight: '700' },

  avatar: {
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
  },
  avatarTxt: { color: '#fff', fontSize: 26, fontWeight: '800' },

  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(240,180,41,0.15)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },

  card: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 18,
  },
  card2: {
    backgroundColor: C.card2,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 16,
  },

  secTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: C.txt,
    marginTop: 22,
    marginBottom: 11,
  },

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: C.card2,
    borderWidth: 1,
    borderColor: C.line,
  },
  chipActive: {
    backgroundColor: 'rgba(232,123,62,0.16)',
    borderColor: C.orange,
  },

  /* Work-day chips */
  dayChipOn: {
    backgroundColor: 'rgba(39,165,103,0.14)',
    borderColor: C.green,
  },
  dayChipOff: {
    opacity: 0.4,
  },
  dayChipTxt: { fontSize: 13, fontWeight: '700' },
  dayDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.green },

  svcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
  },

  /* Works */
  workCard: {
    width: CARD_W,
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.line,
    overflow: 'hidden',
  },
  workImg: { height: 110, alignItems: 'center', justifyContent: 'center' },
  workBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(10,19,34,0.72)',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  workBadgeTxt: { color: '#fff', fontSize: 11, fontWeight: '700' },
  workTitle: {
    color: C.txt,
    fontSize: 12.5,
    fontWeight: '600',
    lineHeight: 17,
  },
  workDate: { color: C.dim, fontSize: 10.5, marginTop: 3 },

  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    gap: 5,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.card3 },
  dotActive: { width: 18, backgroundColor: C.orange },

  /* Language chips */
  langChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(61,130,212,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(61,130,212,0.35)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    paddingRight: 13,
    borderRadius: 20,
  },
  langIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(61,130,212,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  langChipTxt: { fontSize: 12.5, fontWeight: '700', color: C.blue },

  /* Online indicator */
  onlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(39,165,103,0.16)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 7,
  },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.green },
  onlinePillTxt: { fontSize: 10.5, fontWeight: '800', color: C.green },

  /* Rating bars */
  barLabel: { width: 28, color: C.dim, fontSize: 12, fontWeight: '700', textAlign: 'right' },
  barTrack: { flex: 1, height: 7, borderRadius: 9, backgroundColor: C.card3, overflow: 'hidden' },
  barFill: { height: 7, borderRadius: 9, backgroundColor: C.gold },
  barPct: { width: 30, color: C.dim, fontSize: 12, fontWeight: '600', textAlign: 'right' },

  /* Filter */
  filterChip: {
    height: 32,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: C.card2,
    borderWidth: 1,
    borderColor: C.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipOn: {
    backgroundColor: 'rgba(232,123,62,0.16)',
    borderColor: C.orange,
  },

  /* Reviews */
  revAv: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  revPhoto: {
    width: 60,
    height: 60,
    borderRadius: 11,
    backgroundColor: C.card2,
    borderWidth: 1,
    borderColor: C.line,
  },

  /* Certificates */
  certIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(39,165,103,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  certTitle: { fontSize: 12.5, fontWeight: '700', color: C.txt, lineHeight: 17 },
  certMeta: { fontSize: 11, color: C.dim, marginTop: 2 },

  /* Empty state */
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 26,
    paddingHorizontal: 16,
  },
  emptyIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: C.card3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  emptyTitle: { fontSize: 13.5, fontWeight: '700', color: C.txt },
  emptyText: { fontSize: 12, color: C.dim, marginTop: 3, textAlign: 'center' },

  /* Bottom CTA */
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: C.card,
    borderTopWidth: 1,
    borderColor: C.line2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  chatBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: C.card3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: C.orange,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  callBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
  });
}
