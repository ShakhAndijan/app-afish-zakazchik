import { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Modal } from 'react-native';
import { appAlert } from './AppAlert';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Location from 'expo-location';
import { COLORS } from '../constants/colors';
import { YANDEX_MAPS_API_KEY, YANDEX_GEOCODER_API_KEY } from '../constants/config';
import { devLog } from '../utils/log';

// Yandex API kaliti "harna.uz" domeniga bog'lab yaratilgan, lekin WebView xarita
// HTML'ni to'g'ridan-to'g'ri matn sifatida (haqiqiy domensiz) yuklaydi —
// shuning uchun geokoder so'rovlari "scriptError" bilan rad etilishi mumkin.
// `baseUrl` WebView'ga shu domenni "sahifa manbai" sifatida beradi.
const MAP_BASE_URL = 'https://dev.harna.uz/';

const buildMapHtml = (initLat, initLng) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body, #map { width:100%; height:100%; }
  </style>
  <script src="https://api-maps.yandex.ru/2.1/?apikey=${YANDEX_MAPS_API_KEY}&lang=ru_RU"></script>
</head>
<body>
<div id="map"></div>
<script>
  var myMap = null;
  var placemark = null;

  // Belgi (SVG): yumaloq kvadratda odamcha, pastida tayoqcha va halqa. Halqaning markazi — tanlangan nuqta.
  var PIN_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="92" viewBox="0 0 64 92">' +
    '<defs><filter id="s" x="-30%" y="-30%" width="160%" height="160%">' +
    '<feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#000" flood-opacity="0.28"/></filter></defs>' +
    '<g filter="url(#s)">' +
    '<rect x="4" y="4" width="56" height="56" rx="17" fill="#ffffff"/>' +
    '<rect x="8" y="8" width="48" height="48" rx="14" fill="#e87a45"/>' +
    '<g stroke="#ffffff" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round" fill="none">' +
    '<path d="M31 29 L31 40"/><path d="M31 40 L26 49"/><path d="M31 40 L36 49"/>' +
    '<path d="M31 32 L41 27"/><path d="M31 32 L23 37"/></g>' +
    '<circle cx="31" cy="22" r="5" fill="#ffffff"/>' +
    '<rect x="30.5" y="60" width="3" height="16" rx="1.5" fill="#2b2b2b"/>' +
    '<circle cx="32" cy="80" r="7" fill="#ffffff" stroke="#2b2b2b" stroke-width="3.5"/>' +
    '</g></svg>';
  var PIN_HREF = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(PIN_SVG);

  // Geokodlash (manzil matnini topish) endi shu WebView ichida emas,
  // React Native tomonida (native fetch, CORS cheklovisiz) amalga oshiriladi —
  // WebView'ning brauzer konteksti Yandex'ning standalone Geocoder API'siga
  // cross-origin fetch yuborganda CORS bilan rad etilardi.
  function post(lat, lng, source) {
    window.ReactNativeWebView.postMessage(JSON.stringify({
      lat: lat.toFixed(6), lng: lng.toFixed(6), source: source || 'user'
    }));
  }

  function setPlacemark(coords) {
    if (placemark) {
      placemark.geometry.setCoordinates(coords);
    } else {
      placemark = new ymaps.Placemark(coords, {}, {
        iconLayout: 'default#image',
        iconImageHref: PIN_HREF,
        iconImageSize: [64, 92],
        iconImageOffset: [-32, -80]
      });
      myMap.geoObjects.add(placemark);
    }
  }

  // Pin faqat manzil (ko'cha/uy) matni haqiqatan topilib, formaga yozilgach
  // ko'rsatiladi — shuning uchun bu RN tomonidan aniq chaqiriladi, tegishli
  // koordinata post qilingandan va reverse-geokodlash tugagandan keyin.
  function dropPin(lat, lng) {
    setPlacemark([lat, lng]);
  }

  function goTo(lat, lng, zoom, source) {
    myMap.setCenter([lat, lng], zoom || 18);
    post(lat, lng, source);
  }

  // Faqat ko'rinishni suradi — pin/placemark qo'ymaydi. Viloyat/tuman
  // tanlangandagina xarita shu tomonga qaraydi, aniq nuqta hali belgilanmagan
  // bo'ladi — foydalanuvchi bosgandagina (yoki "hozirgi joylashuv"da) pin chiqadi.
  // Xarita hali tayyor bo'lmasa, tayyor bo'lgach nuqtaga o'tadi.
  function goToSafe(lat, lng, zoom) {
    if (!myMap) {
      ymaps.ready(function () { goTo(lat, lng, zoom); });
      return;
    }
    goTo(lat, lng, zoom);
  }

  function panTo(lat, lng, zoom) {
    myMap.setCenter([lat, lng], zoom || 10);
  }

  function panToSafe(lat, lng, zoom) {
    if (!myMap) {
      ymaps.ready(function () { panTo(lat, lng, zoom); });
      return;
    }
    panTo(lat, lng, zoom);
  }

  ymaps.ready(function () {
    myMap = new ymaps.Map('map', {
      center: [41.2995, 69.2401],
      zoom: 12,
      controls: ['zoomControl']
    }, {
      suppressMapOpenBlock: true,
      copyrightLogoVisible: false,
      copyrightProvidersVisible: false,
      copyrightUaVisible: false
    });

    ${
      initLat && initLng
        ? `setPlacemark([${initLat}, ${initLng}]); myMap.setCenter([${initLat}, ${initLng}], 17);`
        : ''
    }

    myMap.events.add('click', function (e) {
      var coords = e.get('coords');
      post(coords[0], coords[1]);
    });
  });
</script>
</body>
</html>`;

// Ikkalasi ham React Native'ning o'z `fetch`'i orqali (native tarmoq so'rovi,
// brauzer emas) chaqiriladi — shuning uchun CORS cheklovi umuman ishlamaydi.
// Geokoder o'zbek tilida (lotin) javob beradi — aks holda ko'cha nomlari ruscha (kirill) yoziladi.
// Uning "ʻ" belgilari ilovadagi oddiy apostrofga almashtiriladi ("ko'chasi").
const normalizeApostrophes = (v) => (v ? v.replace(/[ʻʼ’‘`]/g, "'") : v);

async function reverseGeocodeAddress(lat, lng) {
  try {
    const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${YANDEX_GEOCODER_API_KEY}&format=json&lang=uz_UZ&geocode=${lng},${lat}`;
    const res = await fetch(url);
    const json = await res.json();
    const obj = json?.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject;
    if (!obj) return null;
    const meta = obj.metaDataProperty?.GeocoderMetaData || {};
    const addrComponents = meta.Address?.Components || [];
    const parts = {};
    addrComponents.forEach((c) => {
      parts[c.kind] = c.name;
    });
    return {
      addressResolved: true,
      addressLine: normalizeApostrophes(meta.text || obj.name),
      street: normalizeApostrophes(parts.street) || null,
      house: parts.house || null,
      district: normalizeApostrophes(parts.district) || null,
      locality: normalizeApostrophes(parts.locality) || null,
      area: normalizeApostrophes(parts.area) || null,
      province: normalizeApostrophes(parts.province) || null,
    };
  } catch {
    return null;
  }
}

const withTimeout = (promise, ms) =>
  Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ]);

// Ikki nuqta orasidagi taxminiy masofa (metr) — kichik farqlar uchun yetarli aniqlikda.
const metersBetween = (a, b) => {
  const dLat = (a.latitude - b.latitude) * 111320;
  const dLng = (a.longitude - b.longitude) * 111320 * Math.cos((a.latitude * Math.PI) / 180);
  return Math.hypot(dLat, dLng);
};

async function forwardGeocode(query) {
  try {
    const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${YANDEX_GEOCODER_API_KEY}&format=json&geocode=${encodeURIComponent(query)}`;
    const res = await fetch(url);
    const json = await res.json();
    const obj = json?.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject;
    const pos = obj?.Point?.pos;
    if (!pos) return null;
    const [lng, lat] = pos.split(' ').map(Number);
    return { lat, lng };
  } catch {
    return null;
  }
}

// Nomlarni solishtirish uchun: kichik harf, apostroflarsiz, "tumani/viloyati" kabi so'zlarsiz.
const normName = (v) =>
  (v || '')
    .toLowerCase()
    .replace(/[ʻʼ’‘`']/g, '')
    .replace(/\b(tumani|tuman|shahri|shahar|viloyati|viloyat)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const areaCenterCache = new Map();
async function areaCenter(query) {
  if (!areaCenterCache.has(query)) areaCenterCache.set(query, await forwardGeocode(query));
  return areaCenterCache.get(query);
}

const STREET_KINDS = ['house', 'street'];
const FALLBACK_KINDS = ['locality', 'district'];

/**
 * Yozilgan ko'cha bo'yicha joy qidirish. Yandex bir nechta javob qaytaradi (tuman markazi,
 * boshqa tumandagi bir xil nomli ko'cha, metro...), shuning uchun birinchisini ko'r-ko'rona olmay:
 *  - faqat uy/ko'cha olinadi (topilmasa — mahalla/aholi punkti, lekin tumanning o'zi emas);
 *  - tanlangan tuman/viloyat markazidan uzoqdagilar tashlanadi;
 *  - yozilgan so'zlar topilgan manzil matnida bo'lishi shart (aks holda Yandex tuman nomiga o'xshash
 *    boshqa ko'chani qaytarib, xarita noto'g'ri joyga sakrardi);
 *  - matnida tanlangan tuman/viloyat nomi bor javob oldinga chiqadi.
 * Mos javob bo'lmasa null qaytadi — xarita boshqa joyga sakramaydi.
 */
async function searchAddress({ query, street, district, region }, area) {
  try {
    const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${YANDEX_GEOCODER_API_KEY}&format=json&results=10&lang=uz_UZ&geocode=${encodeURIComponent(query)}`;
    const res = await fetch(url);
    const json = await res.json();
    const members = json?.response?.GeoObjectCollection?.featureMember || [];
    const items = members
      .map((f, order) => {
        const o = f.GeoObject;
        const meta = o?.metaDataProperty?.GeocoderMetaData;
        const [lng, lat] = (o?.Point?.pos || '').split(' ').map(Number);
        return { lat, lng, order, kind: meta?.kind, text: normName(meta?.text) };
      })
      .filter((i) => Number.isFinite(i.lat) && Number.isFinite(i.lng));

    const areaPoint = area ? { latitude: area.lat, longitude: area.lng } : null;
    const distTo = (i) =>
      areaPoint ? metersBetween(areaPoint, { latitude: i.lat, longitude: i.lng }) : 0;
    const limit = district ? 40000 : region ? 150000 : Infinity;
    // Raqamlar va "ko'cha" so'zlari tekshirilmaydi; qolgan so'zlarning hammasi manzil matnida bo'lsin.
    const words = normName(street)
      .split(' ')
      .filter((w) => w.length >= 3 && !/^\d+$/.test(w) && !/^(kocha|kucha|kuch)/.test(w));
    const near = items.filter((i) => distTo(i) <= limit && words.every((w) => i.text.includes(w)));

    let pool = near.filter((i) => STREET_KINDS.includes(i.kind));
    if (!pool.length) {
      // Tumanning o'zi (markazi) "joy" emas — uni o'tkazib yuboramiz.
      pool = near.filter(
        (i) => FALLBACK_KINDS.includes(i.kind) && (!areaPoint || distTo(i) > 1500)
      );
    }
    if (!pool.length) return null;

    const nd = normName(district);
    const nr = normName(region);
    const score = (i) => (nd && i.text.includes(nd) ? 0 : 2) + (nr && i.text.includes(nr) ? 0 : 1);
    pool.sort((a, b) => score(a) - score(b) || a.order - b.order);
    return { lat: pool[0].lat, lng: pool[0].lng };
  } catch {
    return null;
  }
}

/**
 * Yandex Maps asosidagi joylashuv tanlash komponenti.
 * Xaritaga bosib yoki "hozirgi joylashuv" tugmasi orqali koordinata tanlanadi,
 * kengaytirish tugmasi xaritani butun ekranga ochadi.
 */
export default function LocationMapPicker({
  lat,
  lng,
  onChange,
  height = 220,
  fill = false,
  // Pastdagi tugmalar (joylashuv) xarita pastidan qancha yuqorida turishi; xarita ustida
  // panel bo'lsa, tugma panel ostida qolib ketmasligi uchun.
  controlsBottom = 10,
  showExpand = true,
  borderRadius = 18,
  geocodeQuery,
  geocodeZoom,
  panLat,
  panLng,
  panZoom,
  searchQuery,
  searchZoom,
  onAddressResolved,
  // true bo'lsa, xarita yuklangach hozirgi joylashuv o'zi tanlanadi (ruxsat berilmasa — indamay o'tkazib yuboriladi).
  autoLocate = false,
  // Yumaloq oq tugma (faqat belgi, yozuvsiz): `locateBg` — fon, `locateColor` — belgi rangi.
  locateRound = false,
  locateBg = '#ffffff',
  locateColor = '#1a1a1a',
  locateLabel,
  locatingLabel,
  tapHint,
  showTapHint = false,
  permissionTitle,
  permissionMessage,
  errorTitle,
  errorMessage,
}) {
  const webRef = useRef(null);
  const fullRef = useRef(null);
  const [locating, setLocating] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const autoLocated = useRef(false);
  const geocodeSeq = useRef(0);
  const geocodeQueryRef = useRef(geocodeQuery);
  useEffect(() => {
    geocodeQueryRef.current = geocodeQuery;
  }, [geocodeQuery]);
  // Xaritadagi nuqta (bosish / joylashuv / qidiruv) oxirgi marta qachon o'zgargani. Shundan keyin
  // avtomatik tanlangan viloyat/tuman xaritani uzoqqa qaytarib yubormasligi uchun ishlatiladi.
  const mapDrivenAt = useRef(0);
  const recentlyMapDriven = () => Date.now() - mapDrivenAt.current < 6000;

  // `silent` — avtomatik urinishda ruxsat berilmasa yoki xato bo'lsa oyna chiqarilmaydi.
  const locate = async (ref, silent = false) => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        if (!silent && permissionTitle) appAlert(permissionTitle, permissionMessage);
        return;
      }
      let shown = null;
      const show = (coords) => {
        shown = coords;
        ref.current?.injectJavaScript(`goToSafe(${coords.latitude}, ${coords.longitude}); true;`);
      };
      // 1) Oxirgi ma'lum joylashuv — deyarli darhol; xarita shu zahoti o'tadi.
      const last = await Location.getLastKnownPositionAsync({ maxAge: 10 * 60 * 1000 }).catch(
        () => null
      );
      if (last) show(last.coords);
      // 2) Yangi aniqlash: tarmoq/Wi-Fi orqali (GPS'ni kutmasdan, yopiq joyda ham tez), 12 soniyadan oshmaydi.
      //    Natija avvalgidan sezilarli farq qilsagina xarita qayta suriladi.
      try {
        const pos = await withTimeout(
          Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
          12000
        );
        if (!shown || metersBetween(shown, pos.coords) > 40) show(pos.coords);
      } catch (e) {
        if (!shown) throw e;
      }
    } catch {
      if (!silent && errorTitle) appAlert(errorTitle, errorMessage);
    } finally {
      setLocating(false);
    }
  };

  const handleLoadEnd = () => {
    if (!autoLocate || autoLocated.current) return;
    autoLocated.current = true;
    locate(webRef, true);
  };

  // Pin darhol emas — manzil (ko'cha/uy) matni topilib, formaga yozilgandan
  // keyingina ko'rsatiladi. `ref` orqali aniq shu WebView'ga (kichik yoki
  // to'liq ekran) `dropPin` buyrug'i yuboriladi.
  const makeOnMessage = (ref) => (e) => {
    try {
      const data = JSON.parse(e.nativeEvent.data);
      if (data.debug) {
        devLog('[LocationMapPicker]', data.debug, data);
        return;
      }
      mapDrivenAt.current = Date.now();
      // Yozilgan ko'cha bo'yicha qidiruvdan kelgan nuqtada faqat koordinata saqlanadi: kiritilgan matn
      // ustidan yozilmaydi, viloyat/tuman ham o'zgartirilmaydi.
      const fromSearch = data.source === 'search';
      onChange?.(data.lat, data.lng, { fromSearch });
      if (fromSearch) return;
      const seq = ++geocodeSeq.current;
      reverseGeocodeAddress(data.lat, data.lng).then((resolved) => {
        if (!resolved || seq !== geocodeSeq.current) return;
        onAddressResolved?.(resolved);
        if (resolved.addressLine || resolved.street) {
          ref.current?.injectJavaScript(`dropPin(${data.lat}, ${data.lng}); true;`);
        }
      });
    } catch {}
  };

  // Viloyat/tuman tanlanganda WebView'ni qayta yuklamasdan, Yandex'ning o'z
  // geokoderi orqali shu manzilga markazni suradi (backend koordinata bermaydi).
  // Pin qo'yilmaydi — faqat ko'rinish suriladi.
  useEffect(() => {
    if (!geocodeQuery) return;
    let cancelled = false;
    forwardGeocode(geocodeQuery).then((coords) => {
      if (cancelled || !coords || recentlyMapDriven()) return;
      webRef.current?.injectJavaScript(
        `panTo(${coords.lat}, ${coords.lng}, ${geocodeZoom || 13}); true;`
      );
    });
    return () => {
      cancelled = true;
    };
  }, [geocodeQuery, geocodeZoom]);

  // Foydalanuvchi ko'cha/manzil matnini kiritganda (masalan qidiruv orqali) —
  // matn allaqachon mavjud bo'lgani uchun pin darhol qo'yiladi.
  useEffect(() => {
    if (!searchQuery) return;
    let cancelled = false;
    (async () => {
      const area = geocodeQueryRef.current ? await areaCenter(geocodeQueryRef.current) : null;
      const coords = await searchAddress(searchQuery, area);
      if (cancelled || !coords) return;
      webRef.current?.injectJavaScript(
        `goTo(${coords.lat}, ${coords.lng}, ${searchZoom || 18}, 'search'); dropPin(${coords.lat}, ${coords.lng}); true;`
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [searchQuery, searchZoom]);

  // Faqat ko'rinishni suradi, pin qo'ymaydi — viloyat/tuman tanlanganda
  // ishlatiladi (aniq zaxira koordinatalar bilan). Primitivlar orqali —
  // obyekt bo'lsa har renderda yangi reference hosil bo'lib, effekt
  // keraksiz qayta ishga tushib ketardi.
  useEffect(() => {
    if (panLat == null || panLng == null || recentlyMapDriven()) return;
    const js = `panToSafe(${panLat}, ${panLng}, ${panZoom || 10}); true;`;
    webRef.current?.injectJavaScript(js);
  }, [panLat, panLng, panZoom]);

  return (
    <>
      <View style={[styles.wrap, fill ? { flex: 1 } : { height }, { borderRadius }]}>
        <WebView
          ref={webRef}
          style={styles.map}
          source={{ html: buildMapHtml(lat, lng), baseUrl: MAP_BASE_URL }}
          onMessage={makeOnMessage(webRef)}
          onLoadEnd={handleLoadEnd}
          javaScriptEnabled
          originWhitelist={['*']}
          scrollEnabled={false}
        />

        {showTapHint && !lat && (
          <View style={[styles.hintWrap, { bottom: controlsBottom + 42 }]} pointerEvents="none">
            <Text style={styles.tapHint}>{tapHint}</Text>
          </View>
        )}

        <View style={[styles.btnRow, { bottom: controlsBottom }]}>
          {showExpand && (
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => setFullscreen(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="expand" size={16} color="#fff" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={
              locateRound ? [styles.locateRound, { backgroundColor: locateBg }] : styles.locateBtn
            }
            onPress={() => locate(webRef)}
            activeOpacity={0.85}
            disabled={locating}
            accessibilityRole="button"
            accessibilityLabel={locateLabel}
          >
            {locating ? (
              <ActivityIndicator size="small" color={locateRound ? locateColor : '#fff'} />
            ) : locateRound ? (
              <Ionicons name="navigate-outline" size={26} color={locateColor} />
            ) : (
              <Ionicons name="navigate" size={15} color="#fff" />
            )}
            {!locateRound && !!locateLabel && (
              <Text style={styles.locateTxt}>{locating ? locatingLabel : locateLabel}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={fullscreen} animationType="slide" onRequestClose={() => setFullscreen(false)}>
        <SafeAreaView style={styles.fullWrap} edges={['top', 'bottom']}>
          <WebView
            ref={fullRef}
            style={styles.fullMap}
            source={{ html: buildMapHtml(lat, lng), baseUrl: MAP_BASE_URL }}
            onMessage={makeOnMessage(fullRef)}
            javaScriptEnabled
            originWhitelist={['*']}
          />
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setFullscreen(false)}
            activeOpacity={0.85}
          >
            <Ionicons name="close" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.locateBtnFull}
            onPress={() => locate(fullRef)}
            activeOpacity={0.85}
            disabled={locating}
          >
            {locating ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="navigate" size={18} color="#fff" />
            )}
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: 18, overflow: 'hidden', position: 'relative' },
  map: { flex: 1 },
  hintWrap: {
    position: 'absolute',
    bottom: 52,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  tapHint: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    color: '#fff',
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    overflow: 'hidden',
  },
  btnRow: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    left: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  locateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.orange,
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 12,
    elevation: 4,
  },
  locateRound: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  locateTxt: { color: '#fff', fontSize: 12.5, fontWeight: '600' },
  fullWrap: { flex: 1, backgroundColor: '#000' },
  fullMap: { flex: 1 },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  locateBtnFull: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.orange,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
});
