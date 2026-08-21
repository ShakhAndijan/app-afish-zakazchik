import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Modal,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Feather from '@expo/vector-icons/Feather';
import BottomNav from '../components/BottomNav';
import ListingCard from '../components/ListingCard';
import UstaDetailScreen from './UstaDetailScreen';
import AfishLoader from '../components/AfishLoader';
import { getCategories } from '../api/categories';
import { getWorkers } from '../api/workers';
import { getRegions, getDistricts } from '../api/reference';
import { ENDPOINTS } from '../constants/config';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

// ─── Ma'lumotlar ───────────────────────────────────────────────

const LISTINGS = [
  { id: 1, initial: 'D', name: 'Davron Mirzayev', category: 'Duradgor', color: '#2fa37a', rating: '5.0', price: 50000, location: 'Yunusobod', postedAgo: '2 soat oldin', title: "Yog'och mebel va eshik ustasi", desc: 'Kvartira va ofis uchun maxsus mebel, eshik tayyorlayman. Tez va sifatli.', experience: 8, certified: true, languages: ['Uzbek', 'Rus'], phone: '+998 90 123 45 67', education: "Toshkent Yog'ochsozlik kolleji", memberSince: '2018', completedJobs: 210, portfolio: [{ title: "Oshxona to'plami" }, { title: 'Kirish eshigi' }, { title: 'Bolalar xonasi mebeli' }] },
  { id: 2, initial: 'A', name: 'Alisher Usmonov', category: 'Santexnik', color: '#e87a45', rating: '4.9', price: 30000, location: 'Chilonzor', postedAgo: '5 soat oldin', title: "Santexnika ta'mirlash va o'rnatish", desc: "Kran, unitaz, isitish tizimlarini o'rnataman va ta'mirlayman.", experience: 5, certified: false, languages: ['Uzbek'], phone: '+998 91 234 56 78', education: 'Kommunal xoʻjalik kasb-hunar kolleji', memberSince: '2020', completedJobs: 130, portfolio: [{ title: 'Vannaxona rekonstruksiyasi' }, { title: 'Isitish tizimi oʻrnatish' }] },
  { id: 3, initial: 'B', name: 'Bobur Karimov', category: 'Elektrik', color: '#3f7fd4', rating: '4.8', price: 35000, location: "Mirzo Ulug'bek", postedAgo: '1 kun oldin', title: 'Elektr montaj va LED yoritish', desc: 'Uy va ofislarda elektr simlari, rozetka, yoritish tizimlari.', experience: 4, certified: true, languages: ['Uzbek', 'Rus', 'Ingliz'], phone: '+998 93 345 67 89', education: 'Energetika politexnika kolleji', memberSince: '2021', completedJobs: 95, portfolio: [{ title: 'Ofis elektr tarmogʻi' }, { title: 'LED yoritish loyihasi' }] },
  { id: 4, initial: 'S', name: 'Sherzod Nazarov', category: "Bo'yoqchi", color: '#f5c451', rating: '4.8', price: 45000, location: 'Shayxontohur', postedAgo: '3 soat oldin', title: "Devor va shift bo'yash ustasi", desc: "Zamonaviy bo'yoq texnikalari, tez muddatda sifatli ish.", experience: 6, certified: false, languages: ['Uzbek'], phone: '+998 94 456 78 90', education: "Dizayn va amaliy san'at kolleji", memberSince: '2019', completedJobs: 150, portfolio: [{ title: "Yotoqxona bo'yash" }, { title: 'Fasad boʻyash' }] },
  { id: 5, initial: 'J', name: 'Jasur Toshmatov', category: 'Plitachi', color: '#8d6e63', rating: '4.7', price: 48000, location: 'Uchtepa', postedAgo: '6 soat oldin', title: 'Kafel va plitka yotqizish', desc: 'Vannaxona, oshxona plitkalarini aniq va tez yotqizaman.', experience: 3, certified: true, languages: ['Uzbek', 'Rus'], phone: '+998 95 567 89 01', education: 'Qurilish kasb-hunar kolleji', memberSince: '2022', completedJobs: 70, portfolio: [{ title: 'Vannaxona plitkasi' }, { title: 'Oshxona poli' }] },
  { id: 6, initial: 'Z', name: 'Zafar Hamidov', category: 'Konditsioner', color: '#9b6cd1', rating: '4.9', price: 40000, location: 'Yakkasaroy', postedAgo: '2 kun oldin', title: "Konditsioner o'rnatish va tozalash", desc: "Barcha turdagi konditsionerlarni o'rnataman va servis qilaman.", experience: 7, certified: true, languages: ['Uzbek'], phone: '+998 97 678 90 12', education: 'Sovutish texnikasi kolleji', memberSince: '2019', completedJobs: 175, portfolio: [{ title: 'Ofis konditsioner tizimi' }, { title: 'Uy konditsioneri oʻrnatish' }] },
  { id: 7, initial: 'N', name: 'Nodir Rahimov', category: 'Tozalash', color: '#26a69a', rating: '4.9', price: 25000, location: 'Yashnobod', postedAgo: '4 soat oldin', title: 'Uy va ofis tozalash xizmati', desc: 'Chuqur tozalash, oynalar va gilamlarni tozalayman.', experience: 2, certified: false, languages: ['Uzbek', 'Rus'], phone: '+998 99 789 01 23', education: 'Xizmat koʻrsatish kasb-hunar kolleji', memberSince: '2023', completedJobs: 48, portfolio: [{ title: 'Ofis chuqur tozalash' }, { title: "Ko'chish oldi tozalash" }] },
  { id: 8, initial: 'K', name: 'Kamol Yusupov', category: "Bog'bon", color: '#66bb6a', rating: '5.0', price: 40000, location: "Bog'bon tumani", postedAgo: '1 kun oldin', title: "Bog' va hovli obodonlashtirish", desc: 'Gulzor, maysazor, daraxt ekish va parvarish ishlari.', experience: 10, certified: true, languages: ['Uzbek'], phone: '+998 90 890 12 34', education: 'Qishloq xoʻjalik instituti', memberSince: '2016', completedJobs: 260, portfolio: [{ title: 'Hovli landshafti' }, { title: 'Gulzor dizayni' }] },
  { id: 9, initial: 'F', name: 'Farrux Nazarov', category: 'Gipschi', color: '#78909c', rating: '4.8', price: 55000, location: 'Sergeli', postedAgo: '8 soat oldin', title: 'Gips karton va shift ishlari', desc: 'Natyajnoy potolok, gipsokarton devor va bezaklar.', experience: 4, certified: false, languages: ['Uzbek', 'Rus'], phone: '+998 91 901 23 45', education: 'Qurilish-montaj kolleji', memberSince: '2021', completedJobs: 90, portfolio: [{ title: 'Ofis shift dizayni' }, { title: 'Natyajnoy potolok' }] },
  { id: 10, initial: 'O', name: 'Otabek Sodiqov', category: 'Quruvchi', color: '#5c6bc0', rating: '4.8', price: 70000, location: 'Mirobod', postedAgo: '12 soat oldin', title: "Qurilish va ta'mirlash brigadasi", desc: "To'liq ta'mirlash, devor ko'tarish, fasad ishlari.", experience: 9, certified: true, languages: ['Uzbek', 'Rus', 'Ingliz'], phone: '+998 93 012 34 56', education: 'Qurilish muhandisligi instituti', memberSince: '2017', completedJobs: 230, portfolio: [{ title: "Ko'p qavatli bino ta'miri" }, { title: 'Fasad ishlari' }] },
  { id: 11, initial: 'S', name: 'Sardor Aliyev', category: 'Duradgor', color: '#2fa37a', rating: '4.7', price: 42000, location: 'Sergeli', postedAgo: '1 kun oldin', title: 'Metall va yogʻoch konstruksiya', desc: 'Balkon, ombor uchun maxsus yogʻoch va metall konstruksiyalar yasayman.', experience: 5, certified: false, languages: ['Uzbek', 'Rus'], phone: '+998 90 111 22 33', education: 'Qurilish kasb-hunar kolleji', memberSince: '2020', completedJobs: 88, portfolio: [{ title: 'Balkon konstruksiyasi' }, { title: 'Ombor javoni' }] },
  { id: 12, initial: 'U', name: 'Umid Qodirov', category: 'Konditsioner', color: '#9b6cd1', rating: '4.7', price: 38000, location: 'Chilonzor', postedAgo: '4 soat oldin', title: "Konditsioner diagnostika va ta'mir", desc: "Barcha markali konditsionerlarni tez va sifatli ta'mirlayman.", experience: 6, certified: true, languages: ['Uzbek'], phone: '+998 91 222 33 44', education: 'Sovutish texnikasi kolleji', memberSince: '2018', completedJobs: 140, portfolio: [{ title: 'Ofis split tizimi' }, { title: 'Uy konditsioneri diagnostikasi' }] },
  { id: 13, initial: 'D', name: 'Diyor Rashidov', category: "Bo'yoqchi", color: '#f5c451', rating: '4.6', price: 38000, location: 'Yunusobod', postedAgo: '7 soat oldin', title: "Fasad va ichki bo'yoq ishlari", desc: "Zamonaviy materiallar bilan tez va toza bo'yash xizmati.", experience: 4, certified: false, languages: ['Uzbek', 'Rus'], phone: '+998 93 333 44 55', education: "Dizayn va amaliy san'at kolleji", memberSince: '2021', completedJobs: 76, portfolio: [{ title: 'Fasad boʻyash' }, { title: 'Ichki xona boʻyash' }] },
  { id: 14, initial: 'S', name: 'Shoxrux Ibragimov', category: 'Tozalash', color: '#26a69a', rating: '4.8', price: 22000, location: "Mirzo Ulug'bek", postedAgo: '2 soat oldin', title: 'Ofis va kvartira tozalash', desc: 'Tez va sifatli tozalash, barcha kerakli jihozlar bilan.', experience: 3, certified: true, languages: ['Uzbek'], phone: '+998 94 444 55 66', education: 'Xizmat koʻrsatish kasb-hunar kolleji', memberSince: '2022', completedJobs: 60, portfolio: [{ title: 'Kvartira tozalash' }, { title: "Ko'chish oldi tozalash" }] },
  { id: 15, initial: 'R', name: 'Rustam Yoldashev', category: 'Santexnik', color: '#e87a45', rating: '4.7', price: 32000, location: 'Uchtepa', postedAgo: '6 soat oldin', title: "Isitish va suv tizimlari o'rnatish", desc: 'Radiator, quvur va isitish qozonlarini oʻrnataman.', experience: 6, certified: true, languages: ['Uzbek', 'Rus'], phone: '+998 95 555 66 77', education: 'Kommunal xoʻjalik kasb-hunar kolleji', memberSince: '2019', completedJobs: 110, portfolio: [{ title: 'Isitish tizimi' }, { title: 'Suv quvurlari almashtirish' }] },
  { id: 16, initial: 'A', name: 'Aziz Nematov', category: 'Elektrik', color: '#3f7fd4', rating: '4.9', price: 40000, location: 'Yashnobod', postedAgo: '3 soat oldin', title: 'Avtomatika va elektr xavfsizligi', desc: "Elektr shchit, avtomat va yerga ulash tizimlarini o'rnataman.", experience: 8, certified: true, languages: ['Uzbek', 'Ingliz'], phone: '+998 97 666 77 88', education: 'Energetika politexnika kolleji', memberSince: '2016', completedJobs: 195, portfolio: [{ title: 'Elektr shchit almashtirish' }, { title: 'Yerga ulash tizimi' }] },
  { id: 17, initial: 'B', name: 'Bahodir Yusupov', category: 'Haydovchi', color: '#42a5f5', rating: '4.8', price: 60000, location: 'Sergeli', postedAgo: '1 soat oldin', title: "Yuk tashish va ko'chirish xizmati", desc: "Kvartiradan-kvartiraga, ofisdan-omborga yuk tashish, yuklovchilar bilan.", experience: 5, certified: false, languages: ['Uzbek', 'Rus'], phone: '+998 99 777 88 99', education: 'Avtotransport kolleji', memberSince: '2020', completedJobs: 130, portfolio: [{ title: "Ko'chish xizmati" }, { title: 'Mebel tashish' }] },
  { id: 18, initial: 'S', name: 'Sanjar Ergashev', category: "Bog'bon", color: '#66bb6a', rating: '4.9', price: 44000, location: "Bog'bon tumani", postedAgo: '5 soat oldin', title: "Sug'orish tizimlari va landshaft dizayni", desc: "Avtomatik sug'orish, maysazor va gulzor loyihalash ishlari.", experience: 7, certified: true, languages: ['Uzbek'], phone: '+998 90 888 99 00', education: 'Qishloq xoʻjalik instituti', memberSince: '2017', completedJobs: 150, portfolio: [{ title: "Sug'orish tizimi" }, { title: 'Landshaft loyihasi' }] },
  { id: 19, initial: 'I', name: 'Ilxom Tursunov', category: 'Plitachi', color: '#8d6e63', rating: '4.6', price: 46000, location: 'Chilonzor', postedAgo: '9 soat oldin', title: 'Natural tosh va kafel yotqizish', desc: 'Hovli, fasad va ichki xonalar uchun tosh va kafel ishlari.', experience: 5, certified: false, languages: ['Uzbek', 'Rus'], phone: '+998 91 999 00 11', education: 'Qurilish kasb-hunar kolleji', memberSince: '2019', completedJobs: 82, portfolio: [{ title: 'Hovli toshi' }, { title: 'Fasad kafeli' }] },
  { id: 20, initial: 'J', name: 'Jamshid Qosimov', category: 'Quruvchi', color: '#5c6bc0', rating: '4.7', price: 65000, location: 'Yakkasaroy', postedAgo: '10 soat oldin', title: "Poydevor va devor ko'tarish ishlari", desc: 'Yangi qurilish va rekonstruksiya ishlarini boshidan oxirigacha bajaraman.', experience: 8, certified: true, languages: ['Uzbek', 'Rus'], phone: '+998 93 000 11 22', education: 'Qurilish muhandisligi instituti', memberSince: '2015', completedJobs: 175, portfolio: [{ title: 'Poydevor ishlari' }, { title: "Devor ko'tarish" }] },
  { id: 21, initial: 'M', name: 'Murod Sattorov', category: 'Haydovchi', color: '#42a5f5', rating: '4.6', price: 55000, location: "Mirzo Ulug'bek", postedAgo: '3 kun oldin', title: "Shahar bo'ylab yuk tashish", desc: "Gazel va kichik yuk mashinasi bilan tez va ehtiyotkorona yetkazib beraman.", experience: 4, certified: false, languages: ['Uzbek'], phone: '+998 94 111 33 55', education: 'Avtotransport kolleji', memberSince: '2021', completedJobs: 96, portfolio: [{ title: "Ofis ko'chirish" }, { title: 'Texnika tashish' }] },
];

const EXP_OPTIONS = [1, 3, 5];

const PRICE_OPTIONS = [
  { key: 'arzon', labelKey: 'priceCheapFirst' },
  { key: 'qimmat', labelKey: 'priceExpensiveFirst' },
];

const LANG_OPTIONS = [
  { value: 'Uzbek', labelKey: 'uzbek' },
  { value: 'Rus', labelKey: 'russian' },
  { value: 'Ingliz', labelKey: 'english' },
];

const RATING_OPTIONS = [
  { key: 4.5, label: '4.5+' },
  { key: 4.8, label: '4.8+' },
  { key: 5, label: '5.0' },
];

const REGIONS = [
  {
    id: 'toshkent-shahri',
    name: 'Toshkent shahri',
    districts: [...new Set(LISTINGS.map((l) => l.location))],
  },
  {
    id: 'toshkent-viloyati',
    name: 'Toshkent viloyati',
    districts: ['Zangiota', 'Qibray', "Yangiyo'l", 'Chirchiq'],
  },
];

// ─── Yordamchi funksiyalar ─────────────────────────────────────

function applyAdvFilters(list, { sort, minExp, certifiedOnly, langs, minRating, region, district }) {
  let arr = [...list];
  if (certifiedOnly) arr = arr.filter((w) => w.isIdentityVerified);
  if (minExp) arr = arr.filter((w) => w.experienceYears >= minExp);
  if (langs && langs.length > 0) arr = arr.filter((w) => (w.languages || []).some((lg) => langs.includes(lg)));
  if (minRating) arr = arr.filter((w) => w.rating >= minRating);
  if (district) {
    arr = arr.filter((w) => w.location === district);
  } else if (region) {
    const r = REGIONS.find((rg) => rg.id === region);
    if (r) arr = arr.filter((w) => r.districts.includes(w.location));
  }
  if (sort === 'arzon') arr.sort((a, b) => a.minPrice - b.minPrice);
  if (sort === 'qimmat') arr.sort((a, b) => b.minPrice - a.minPrice);
  return arr;
}

function avgExperience(list) {
  if (!list.length) return '—';
  return Math.round(list.reduce((s, w) => s + (w.experienceYears || 0), 0) / list.length);
}

const CATEGORY_DETAIL_ACCENT = '#e87a45';

function categoryColorFor() {
  return CATEGORY_DETAIL_ACCENT;
}

/** Worker (mapWorker) obyektini ListingCard formatiga o'giradi */
function toListingCardShape(w, tr) {
  return {
    ...w,
    title: w.profession || tr('xizmatlar.defaultWorkerTitle'),
    desc: w.bio || '',
    price: w.minPrice ?? 0,
    certified: w.isIdentityVerified,
    postedAgo: null,
  };
}

// ─── Ommabop yo'nalishlar ──────────────────────────────────────

const POPULAR_TILE_W = 100;
const POPULAR_GAP = 12;
const POPULAR_SLOT = POPULAR_TILE_W + POPULAR_GAP;

function CategoryGlyph({ glyph, color, size = 22 }) {
  return glyph ? (
    <Text style={{ fontSize: size }}>{glyph}</Text>
  ) : (
    <Feather name="tool" size={size - 2} color={color} />
  );
}

function PopularCategoryTile({ item, onPress, styles }) {
  return (
    <TouchableOpacity style={styles.popularTile} onPress={onPress} activeOpacity={0.85}>
      {item.count > 0 && (
        <View style={[styles.categoryBadge, { backgroundColor: item.color }]}>
          <Text style={styles.categoryBadgeText}>{item.count}</Text>
        </View>
      )}
      <View style={[styles.categoryIconWrap, { backgroundColor: item.color + '22' }]}>
        <CategoryGlyph glyph={item.glyph} color={item.color} />
      </View>
      <Text style={styles.categoryLabel} numberOfLines={1}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );
}

function PopularCategories({ categories, onSelect, styles }) {
  const listRef = useRef(null);
  const idxRef = useRef(0);
  const auto = categories.length > 3;

  useEffect(() => {
    if (!auto) return;
    const timer = setInterval(() => {
      idxRef.current = (idxRef.current + 1) % categories.length;
      listRef.current?.scrollToOffset({ offset: idxRef.current * POPULAR_SLOT, animated: true });
    }, 2200);
    return () => clearInterval(timer);
  }, [auto, categories.length]);

  return (
    <FlatList
      ref={listRef}
      data={categories}
      keyExtractor={(c) => String(c.id)}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: POPULAR_GAP }}
      getItemLayout={(_, index) => ({ length: POPULAR_TILE_W, offset: POPULAR_SLOT * index, index })}
      renderItem={({ item }) => <PopularCategoryTile item={item} onPress={() => onSelect(item.id)} styles={styles} />}
    />
  );
}

// ─── Ekran ─────────────────────────────────────────────────────

export default function XizmatlarScreen({ activeTab, onTabChange }) {
  const { height: windowH } = useWindowDimensions();
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const styles = useMemo(() => buildStyles(t), [t]);
  const [catFilter, setCatFilter] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sort, setSort] = useState(null);
  const [minExp, setMinExp] = useState(null);
  const [certifiedOnly, setCertifiedOnly] = useState(false);
  const [langs, setLangs] = useState([]);
  const [minRating, setMinRating] = useState(null);
  const [region, setRegion] = useState(null);
  const [district, setDistrict] = useState(null);
  const [pickerFor, setPickerFor] = useState(null);
  const [profileMaster, setProfileMaster] = useState(null);
  const [query, setQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoryWorkers, setCategoryWorkers] = useState([]);
  const [categoryWorkersLoading, setCategoryWorkersLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getCategories()
      .then((data) => {
        if (!cancelled) setCategories(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setCategoriesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!catFilter) return;
    let cancelled = false;
    setCategoryWorkersLoading(true);
    getWorkers({ categoryId: catFilter, page: 1, size: 20 })
      .then((data) => {
        if (!cancelled) setCategoryWorkers(data);
      })
      .catch(() => {
        if (!cancelled) setCategoryWorkers([]);
      })
      .finally(() => {
        if (!cancelled) setCategoryWorkersLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [catFilter]);

  const hasActiveFilters = !!(
    sort || minExp || certifiedOnly || langs.length > 0 || minRating || region || district
  );

  const toggleLang = (l) => {
    setLangs((prev) => (prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]));
  };

  const selectedRegion = REGIONS.find((r) => r.id === region);

  const categoriesWithCounts = useMemo(
    () =>
      [...categories]
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .map((c) => ({
          id: c.id,
          label: c.name,
          glyph: c.icon,
          color: c.color || CATEGORY_DETAIL_ACCENT,
          count: c.worker_count ?? 0,
        })),
    [categories]
  );

  const visibleCategories = useMemo(() => {
    if (!query.trim()) return categoriesWithCounts;
    const q = query.trim().toLowerCase();
    return categoriesWithCounts.filter((c) => c.label.toLowerCase().includes(q));
  }, [categoriesWithCounts, query]);

  const popularCategories = useMemo(
    () => categoriesWithCounts.filter((c) => c.count > 0).sort((a, b) => b.count - a.count),
    [categoriesWithCounts]
  );

  const overallStats = useMemo(
    () => ({
      totalMasters: LISTINGS.length,
      avgRating: (LISTINGS.reduce((s, l) => s + parseFloat(l.rating), 0) / LISTINGS.length).toFixed(1),
      certified: LISTINGS.filter((l) => l.certified).length,
    }),
    []
  );

  const categoryFiltered = useMemo(
    () => applyAdvFilters(categoryWorkers, { sort, minExp, certifiedOnly, langs, minRating, region, district }),
    [categoryWorkers, sort, minExp, certifiedOnly, langs, minRating, region, district]
  );
  const categoryResults = useMemo(() => {
    if (!query.trim()) return categoryFiltered;
    const q = query.trim().toLowerCase();
    return categoryFiltered.filter(
      (w) => w.name.toLowerCase().includes(q) || (w.bio || '').toLowerCase().includes(q)
    );
  }, [categoryFiltered, query]);

  const resetAdvFilters = () => {
    setSort(null);
    setMinExp(null);
    setCertifiedOnly(false);
    setLangs([]);
    setMinRating(null);
    setRegion(null);
    setDistrict(null);
  };

  const openCategory = (categoryId) => {
    setCatFilter(categoryId);
    setFilterOpen(false);
    setProfileMaster(null);
  };

  const backToCategories = () => {
    setCatFilter(null);
    setCategoryWorkers([]);
    setProfileMaster(null);
  };

  const pickRegion = (r) => {
    setRegion(r.id);
    setDistrict(null);
    setPickerFor(null);
  };

  const pickDistrict = (d) => {
    setDistrict(d);
    setPickerFor(null);
  };

  const selectedCategoryMeta = categoriesWithCounts.find((c) => c.id === catFilter);

  if (catFilter && profileMaster) {
    return (
      <UstaDetailScreen
        usta={profileMaster}
        onBack={() => setProfileMaster(null)}
        isLoggedIn
      />
    );
  }

  const searchFilterRow = (
    <View style={[styles.header, catFilter && styles.headerEmbedded]}>
      {catFilter && (
        <TouchableOpacity style={styles.backBtnDark} onPress={backToCategories} activeOpacity={0.8}>
          <Feather name="chevron-left" size={18} color="#fff" />
        </TouchableOpacity>
      )}
      <View style={[styles.searchBox, catFilter && styles.searchBoxOnHero, searchFocused && styles.searchBoxFocused]}>
        <Feather
          name="search"
          size={17}
          color={searchFocused ? t.orange : catFilter ? 'rgba(255,255,255,0.8)' : t.faint}
        />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          placeholder={tr('xizmatlar.searchPlaceholder')}
          placeholderTextColor={catFilter ? 'rgba(255,255,255,0.65)' : t.faint}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Feather name="x-circle" size={16} color={catFilter ? 'rgba(255,255,255,0.8)' : t.faint} />
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity
        style={[
          styles.filterBtn,
          catFilter && styles.filterBtnOnHero,
          filterOpen && (catFilter ? styles.filterBtnActiveOnHero : styles.filterBtnActive),
        ]}
        onPress={() => setFilterOpen((v) => !v)}
        activeOpacity={0.8}
      >
        <Feather
          name="sliders"
          size={19}
          color={filterOpen ? (catFilter ? '#e87a45' : '#fff') : catFilter ? '#fff' : t.faint}
        />
        {hasActiveFilters && <View style={styles.filterDot} />}
      </TouchableOpacity>
    </View>
  );

  const filterPanelBlock = (
    <View style={styles.filterPanel}>
      <Text style={styles.filterSectionLabel}>{tr('xizmatlar.filters.price')}</Text>
      <View style={styles.chipRow}>
        {PRICE_OPTIONS.map((p) => (
          <TouchableOpacity
            key={p.key}
            style={[styles.chipPill, sort === p.key && styles.chipPillActive]}
            onPress={() => setSort(sort === p.key ? null : p.key)}
          >
            <Text style={[styles.chipPillLabel, sort === p.key && styles.chipPillLabelActive]}>{tr(`xizmatlar.filters.${p.labelKey}`)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.filterSectionLabel}>{tr('xizmatlar.filters.experience')}</Text>
      <View style={styles.chipRow}>
        {EXP_OPTIONS.map((e) => (
          <TouchableOpacity
            key={e}
            style={[styles.chipPill, minExp === e && styles.chipPillActive]}
            onPress={() => setMinExp(minExp === e ? null : e)}
          >
            <Text style={[styles.chipPillLabel, minExp === e && styles.chipPillLabelActive]}>{tr('xizmatlar.filters.expYears', { n: e })}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.filterSectionLabel}>{tr('xizmatlar.filters.languages')}</Text>
      <View style={styles.chipRow}>
        {LANG_OPTIONS.map((l) => {
          const active = langs.includes(l.value);
          return (
            <TouchableOpacity
              key={l.value}
              style={[styles.chipPill, active && styles.chipPillActive]}
              onPress={() => toggleLang(l.value)}
            >
              {active && <Feather name="check" size={12} color="#fff" style={{ marginRight: 4 }} />}
              <Text style={[styles.chipPillLabel, active && styles.chipPillLabelActive]}>{tr(`xizmatlar.langOptions.${l.labelKey}`)}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {catFilter && (
        <>
          <Text style={styles.filterSectionLabel}>{tr('xizmatlar.filters.rating')}</Text>
          <View style={styles.chipRow}>
            {RATING_OPTIONS.map((r) => (
              <TouchableOpacity
                key={r.key}
                style={[styles.chipPill, minRating === r.key && styles.chipPillActive]}
                onPress={() => setMinRating(minRating === r.key ? null : r.key)}
              >
                <Text style={[styles.chipPillLabel, minRating === r.key && styles.chipPillLabelActive]}>
                  ★ {r.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.filterSectionLabel}>{tr('xizmatlar.filters.region')}</Text>
          <View style={{ gap: 8, marginBottom: 12 }}>
            <TouchableOpacity style={styles.selectRow} onPress={() => setPickerFor('region')} activeOpacity={0.8}>
              <Feather name="map-pin" size={14} color={t.muted} />
              <Text style={[styles.selectRowText, region && styles.selectRowTextActive]}>
                {selectedRegion ? selectedRegion.name : tr('xizmatlar.filters.regionSelect')}
              </Text>
              <Feather name="chevron-down" size={16} color={t.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.selectRow, !region && styles.selectRowDisabled]}
              onPress={() => region && setPickerFor('district')}
              activeOpacity={0.8}
              disabled={!region}
            >
              <Feather name="map" size={14} color={t.muted} />
              <Text style={[styles.selectRowText, district && styles.selectRowTextActive]}>
                {district || tr('xizmatlar.filters.district')}
              </Text>
              <Feather name="chevron-down" size={16} color={t.muted} />
            </TouchableOpacity>
          </View>
        </>
      )}

      <TouchableOpacity
        style={[styles.certRow, certifiedOnly && styles.certRowActive]}
        onPress={() => setCertifiedOnly((v) => !v)}
      >
        <Text style={{ fontSize: 15 }}>🏅</Text>
        <Text style={[styles.certLabel, certifiedOnly && styles.certLabelActive]}>
          {tr('xizmatlar.filters.certifiedOnly')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={resetAdvFilters} style={{ marginTop: 8 }}>
        <Text style={styles.resetLink}>{tr('xizmatlar.filters.reset')}</Text>
      </TouchableOpacity>
    </View>
  );

  const filterTopOffset = catFilter ? 68 : 64;
  const filterMaxHeight = windowH - filterTopOffset - 56;

  const filterModal = (
    <Modal visible={filterOpen} transparent animationType="fade" onRequestClose={() => setFilterOpen(false)}>
      <TouchableOpacity style={styles.filterBackdrop} activeOpacity={1} onPress={() => setFilterOpen(false)}>
        <SafeAreaView edges={['top', 'bottom']} style={{ marginTop: filterTopOffset }}>
          <View style={{ maxHeight: filterMaxHeight }} onStartShouldSetResponder={() => true}>
            <ScrollView showsVerticalScrollIndicator={false}>{filterPanelBlock}</ScrollView>
          </View>
        </SafeAreaView>
      </TouchableOpacity>
    </Modal>
  );

  if (!catFilter) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        {searchFilterRow}
        {filterModal}

        <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 90 }} showsVerticalScrollIndicator={false}>
          <View>
            <Text style={styles.sectionTitle}>{tr('xizmatlar.browse.title')}</Text>
            <Text style={styles.sectionSubtitle}>
              {tr('xizmatlar.browse.subtitle')}
            </Text>

            {!query.trim() && (
              <>
                <View style={styles.statsRow}>
                  <View style={styles.statCell}>
                    <Text style={styles.statValue}>{overallStats.totalMasters}</Text>
                    <Text style={styles.statLabel}>{tr('xizmatlar.browse.activeMasters')}</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statCell}>
                    <Text style={[styles.statValue, { color: t.gold }]}>★ {overallStats.avgRating}</Text>
                    <Text style={styles.statLabel}>{tr('xizmatlar.browse.avgRating')}</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statCell}>
                    <Text style={[styles.statValue, { color: t.blue }]}>🏅 {overallStats.certified}</Text>
                    <Text style={styles.statLabel}>{tr('xizmatlar.browse.certified')}</Text>
                  </View>
                </View>

                {popularCategories.length > 0 && (
                  <>
                    <Text style={styles.groupLabel}>{tr('xizmatlar.browse.popularDirections')}</Text>
                    <View style={{ marginBottom: 22 }}>
                      <PopularCategories categories={popularCategories} onSelect={openCategory} styles={styles} />
                    </View>
                  </>
                )}
              </>
            )}

            <Text style={styles.groupLabel}>{query.trim() ? tr('xizmatlar.browse.searchResults') : tr('xizmatlar.browse.allDirections')}</Text>
            {categoriesLoading ? (
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <AfishLoader size={90} />
              </View>
            ) : visibleCategories.length > 0 ? (
              <View style={styles.categoryGrid}>
                {visibleCategories.map((c) => (
                  <TouchableOpacity key={c.id} style={styles.categoryCard} onPress={() => openCategory(c.id)}>
                    {c.count > 0 && (
                      <View style={[styles.categoryBadge, { backgroundColor: c.color }]}>
                        <Text style={styles.categoryBadgeText}>{c.count}</Text>
                      </View>
                    )}
                    <View style={[styles.categoryIconWrap, { backgroundColor: c.color + '22' }]}>
                      <CategoryGlyph glyph={c.glyph} color={c.color} />
                    </View>
                    <Text style={styles.categoryLabel}>{c.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>{tr('xizmatlar.browse.noDirectionsFound')}</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* ── Bottom nav ── */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={onTabChange}
          accent={t.orange}
          background={t.navBg}
          border={t.border}
          muted={t.faint}
        />

        <Modal visible={!!pickerFor} transparent animationType="slide" onRequestClose={() => setPickerFor(null)}>
          <TouchableOpacity style={styles.sheetOverlay} activeOpacity={1} onPress={() => setPickerFor(null)}>
            <View style={styles.sheet} onStartShouldSetResponder={() => true}>
              <Text style={styles.sheetTitle}>{pickerFor === 'region' ? tr('xizmatlar.filters.regionSelect') : tr('xizmatlar.filters.district')}</Text>
              <FlatList
                data={pickerFor === 'region' ? REGIONS : selectedRegion?.districts ?? []}
                keyExtractor={(item) => (pickerFor === 'region' ? item.id : item)}
                renderItem={({ item }) => {
                  const label = pickerFor === 'region' ? item.name : item;
                  const active = pickerFor === 'region' ? region === item.id : district === item;
                  return (
                    <TouchableOpacity
                      style={styles.sheetRow}
                      onPress={() => (pickerFor === 'region' ? pickRegion(item) : pickDistrict(item))}
                    >
                      <Text style={[styles.sheetRowText, active && styles.sheetRowTextActive]}>{label}</Text>
                      {active && <Feather name="check" size={16} color={t.orange} />}
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 90 }} showsVerticalScrollIndicator={false}>
          <View>
            <View style={styles.heroShadowWrap}>
              <LinearGradient
                colors={['#f2985f', '#e87a45', '#c9591f']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.hero}
              >
                <Text style={styles.heroWatermark}>{selectedCategoryMeta?.glyph}</Text>

                {searchFilterRow}

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 20 }}>
                  <View style={styles.heroIconWrap}>
                    <CategoryGlyph
                      glyph={selectedCategoryMeta?.glyph}
                      color="#fff"
                      size={28}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.heroEyebrow}>{tr('xizmatlar.detail.direction')}</Text>
                    <Text style={styles.heroTitle}>{selectedCategoryMeta?.label}</Text>
                    <Text style={styles.heroSubtitle}>{tr('xizmatlar.detail.activeInDirection', { count: categoryResults.length })}</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>

            {categoryWorkersLoading ? (
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <AfishLoader size={90} />
              </View>
            ) : (
              <>
                {categoryResults.length > 0 && (
                  <View style={styles.statsCard}>
                    <View style={styles.statCell}>
                      <Text style={styles.statValue}>{categoryResults.length}</Text>
                      <Text style={styles.statLabel}>{tr('xizmatlar.detail.activeMasters')}</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statCell}>
                      <Text style={[styles.statValue, { color: t.blue }]}>
                        🏅 {categoryResults.filter((w) => w.isIdentityVerified).length}
                      </Text>
                      <Text style={styles.statLabel}>{tr('xizmatlar.detail.certificate')}</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statCell}>
                      <Text style={styles.statValue}>{avgExperience(categoryResults)}</Text>
                      <Text style={styles.statLabel}>{tr('xizmatlar.detail.yearsExperience')}</Text>
                    </View>
                  </View>
                )}

                {categoryResults.length > 0 ? (
                  <View style={styles.listWrap}>
                    {categoryResults.map((w) => (
                      <ListingCard
                        key={w.id}
                        listing={toListingCardShape(w, tr)}
                        accent={categoryColorFor()}
                        onPress={() => setProfileMaster(w)}
                      />
                    ))}
                  </View>
                ) : (
                  <View style={[styles.emptyState, { marginTop: 16 }]}>
                    <Text style={styles.emptyText}>
                      {query.trim() ? tr('xizmatlar.detail.noMastersFound') : tr('xizmatlar.detail.noMastersYet')}
                    </Text>
                    <TouchableOpacity onPress={backToCategories}>
                      <Text style={styles.resetLink}>{tr('xizmatlar.detail.chooseAnother')}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </View>
      </ScrollView>

      {/* ── Bottom nav ── */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={onTabChange}
        accent={t.orange}
        background={t.navBg}
        border={t.border}
        muted={t.faint}
      />

      {filterModal}

      <Modal
        visible={!!pickerFor}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerFor(null)}
      >
        <TouchableOpacity style={styles.sheetOverlay} activeOpacity={1} onPress={() => setPickerFor(null)}>
          <View style={styles.sheet} onStartShouldSetResponder={() => true}>
            <Text style={styles.sheetTitle}>{pickerFor === 'region' ? tr('xizmatlar.filters.regionSelect') : tr('xizmatlar.filters.district')}</Text>
            <FlatList
              data={pickerFor === 'region' ? REGIONS : selectedRegion?.districts ?? []}
              keyExtractor={(item) => (pickerFor === 'region' ? item.id : item)}
              renderItem={({ item }) => {
                const label = pickerFor === 'region' ? item.name : item;
                const active = pickerFor === 'region' ? region === item.id : district === item;
                return (
                  <TouchableOpacity
                    style={styles.sheetRow}
                    onPress={() => (pickerFor === 'region' ? pickRegion(item) : pickDistrict(item))}
                  >
                    <Text style={[styles.sheetRowText, active && styles.sheetRowTextActive]}>{label}</Text>
                    {active && <Feather name="check" size={16} color={t.orange} />}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Uslublar ──────────────────────────────────────────────────

function buildStyles(t) {
  return StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },
  header: { flexDirection: 'row', gap: 10, padding: 16, paddingBottom: 0 },
  headerEmbedded: { padding: 0 },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: t.inputBg,
    borderRadius: 999,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: t.border,
  },
  searchBoxOnHero: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(255,255,255,0.4)',
  },
  searchBoxFocused: {
    borderColor: 'rgba(232,122,69,0.55)',
    backgroundColor: t.card,
  },
  searchInput: {
    flex: 1,
    color: t.text,
    fontSize: 14,
    paddingVertical: 13,
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 999,
    backgroundColor: t.inputBg,
    borderWidth: 1.5,
    borderColor: t.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBtnActive: {
    backgroundColor: '#e87a45',
    borderColor: '#e87a45',
    shadowColor: '#e87a45',
    shadowOpacity: 0.45,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  filterBtnOnHero: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(255,255,255,0.4)',
  },
  filterBtnActiveOnHero: {
    backgroundColor: '#fff',
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  filterDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3f7fd4',
    borderWidth: 1.5,
    borderColor: t.inputBg,
  },

  filterBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  filterPanel: {
    margin: 16,
    backgroundColor: t.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: t.border,
    padding: 14,
  },
  filterSectionLabel: {
    color: t.muted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  chipRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  chipPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: t.card,
    borderWidth: 1,
    borderColor: t.border,
  },
  chipPillActive: { backgroundColor: '#e87a45' },
  chipPillLabel: { color: t.muted, fontSize: 12, fontWeight: '700' },
  chipPillLabelActive: { color: '#fff' },

  selectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: t.card,
    borderWidth: 1,
    borderColor: t.border,
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 12,
  },
  selectRowDisabled: { opacity: 0.45 },
  selectRowText: { flex: 1, color: t.muted, fontSize: 13, fontWeight: '600' },
  selectRowTextActive: { color: t.text, fontWeight: '700' },

  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: t.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 18,
    paddingHorizontal: 18,
    paddingBottom: 28,
    maxHeight: '65%',
  },
  sheetTitle: { color: t.text, fontSize: 15, fontWeight: '800', marginBottom: 10 },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: t.border,
  },
  sheetRowText: { color: t.muted, fontSize: 14, fontWeight: '600' },
  sheetRowTextActive: { color: '#e87a45', fontWeight: '800' },
  certRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: t.card,
    borderWidth: 1,
    borderColor: t.border,
    borderRadius: 12,
    padding: 12,
  },
  certRowActive: { backgroundColor: 'rgba(63,125,212,0.15)' },
  certLabel: { color: t.muted, fontSize: 12.5, fontWeight: '700' },
  certLabelActive: { color: t.blue },
  resetLink: { color: '#e87a45', fontSize: 12, fontWeight: '700', textAlign: 'center' },

  body: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },

  sectionTitle: { color: t.text, fontSize: 20, fontWeight: '800' },
  sectionSubtitle: { color: t.muted, fontSize: 12.5, marginTop: 3, marginBottom: 18 },
  groupLabel: { color: t.text, fontSize: 14.5, fontWeight: '800', marginBottom: 12 },

  popularTile: {
    width: POPULAR_TILE_W,
    alignItems: 'center',
    gap: 8,
    backgroundColor: t.card,
    borderWidth: 1,
    borderColor: t.border,
    borderRadius: 16,
    paddingVertical: 14,
    position: 'relative',
  },

  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  categoryCard: {
    width: '31%',
    alignItems: 'center',
    gap: 8,
    backgroundColor: t.card,
    borderWidth: 1,
    borderColor: t.border,
    borderRadius: 16,
    paddingVertical: 14,
    position: 'relative',
  },
  categoryBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    minWidth: 18,
    height: 18,
    borderRadius: 999,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBadgeText: { color: '#fff', fontSize: 9.5, fontWeight: '800' },
  categoryIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryLabel: { color: t.text, fontSize: 11.5, fontWeight: '700', textAlign: 'center' },

  backBtnDark: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: t.card,
    borderWidth: 1,
    borderColor: t.border,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  statCell: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, height: 26, backgroundColor: t.border },
  statValue: { color: t.text, fontSize: 16, fontWeight: '800' },
  statLabel: {
    color: t.muted,
    fontSize: 9.5,
    fontWeight: '700',
    marginTop: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },

  // ── Yo'nalish hero (doim to'q sarg'ish fon — mavzudan qat'i nazar) ──
  heroShadowWrap: {
    marginHorizontal: -16,
    marginTop: -16,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: '#e87a45',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  hero: {
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 34,
    position: 'relative',
    overflow: 'hidden',
  },
  heroWatermark: {
    position: 'absolute',
    right: -20,
    bottom: -30,
    fontSize: 140,
    opacity: 0.14,
    transform: [{ rotate: '-14deg' }],
  },
  heroIconWrap: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEyebrow: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  heroTitle: { color: '#fff', fontSize: 23, fontWeight: '800', marginTop: 2 },
  heroSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 12.5, fontWeight: '600', marginTop: 3 },

  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: t.card,
    borderWidth: 1,
    borderColor: t.border,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 14,
    marginHorizontal: 12,
    marginTop: -20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 8,
  },

  // ── Usta kartasi ──
  listWrap: { paddingTop: 16, gap: 14 },
  emptyState: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 34,
    paddingHorizontal: 16,
    backgroundColor: t.card,
    borderWidth: 1,
    borderColor: t.border,
    borderRadius: 18,
  },
  emptyText: { color: t.muted, fontSize: 13, fontWeight: '600', textAlign: 'center' },
  });
}
