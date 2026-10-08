import { createContext, useContext, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { buildPalette } from './palette';
import { CARD_W } from './constants';

// Ekran bo'limlari bir xil rang (C) va uslublar (st) to'plamini ishlatadi; ular shu kontekst
// orqali olinadi (har bir komponentga props bilan uzatish shart emas).
const UstaStyleContext = createContext(null);

export function UstaStyleProvider({ children }) {
  const { theme: t } = useTheme();
  const value = useMemo(() => {
    const C = buildPalette(t);
    return { C, st: buildStyles(C) };
  }, [t]);
  return <UstaStyleContext.Provider value={value}>{children}</UstaStyleContext.Provider>;
}

export const useUstaStyles = () => useContext(UstaStyleContext);

// ─── Uslublar ───────────────────────────────────────────────────────────────

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

  secRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginTop: 24,
    marginBottom: 12,
  },
  secIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: 'rgba(232,123,62,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secTitleTxt: { flex: 1, fontSize: 15.5, fontWeight: '800', color: C.txt },

  /* Hero */
  hero: {
    marginTop: 6,
    borderRadius: 26,
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 46,
    overflow: 'hidden',
  },
  heroDecoA: {
    position: 'absolute',
    top: -50,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  heroDecoB: {
    position: 'absolute',
    bottom: -40,
    left: -30,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  heroAvatarRing: {
    padding: 3,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  heroNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  heroName: { flexShrink: 1, fontSize: 21, fontWeight: '800', color: '#fff' },
  heroTrade: { fontSize: 14, fontWeight: '700', color: 'rgba(255,255,255,0.92)', marginTop: 3 },
  heroLocRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  heroLoc: { flexShrink: 1, fontSize: 12.5, color: 'rgba(255,255,255,0.85)' },
  heroPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.22)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  heroPillTxt: { color: '#fff', fontSize: 12.5, fontWeight: '800' },
  heroBio: { color: 'rgba(255,255,255,0.92)', fontSize: 13.5, lineHeight: 20, marginTop: 14 },

  /* Stats (hero pastiga suzib turadi) */
  statsCard: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: -30,
    marginHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  statCol: { flex: 1, alignItems: 'center', paddingHorizontal: 6 },
  statColDivider: { borderLeftWidth: 1, borderLeftColor: C.line },
  statIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
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
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderColor: C.line2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 14,
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
    shadowColor: C.orange,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  callBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
  });
}
