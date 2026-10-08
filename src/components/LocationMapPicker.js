import { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { COLORS } from '../constants/colors';
import { YANDEX_MAPS_API_KEY, YANDEX_GEOCODER_API_KEY } from '../constants/config';
import { devLog } from '../utils/log';

// Yandex API kaliti "afish.uz" domeniga bog'lab yaratilgan, lekin WebView xarita
// HTML'ni to'g'ridan-to'g'ri matn sifatida (haqiqiy domensiz) yuklaydi —
// shuning uchun geokoder so'rovlari "scriptError" bilan rad etilishi mumkin.
// `baseUrl` WebView'ga shu domenni "sahifa manbai" sifatida beradi.
const MAP_BASE_URL = 'https://dev.afish.uz/';

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

  // Geokodlash (manzil matnini topish) endi shu WebView ichida emas,
  // React Native tomonida (native fetch, CORS cheklovisiz) amalga oshiriladi —
  // WebView'ning brauzer konteksti Yandex'ning standalone Geocoder API'siga
  // cross-origin fetch yuborganda CORS bilan rad etilardi.
  function post(lat, lng) {
    window.ReactNativeWebView.postMessage(JSON.stringify({
      lat: lat.toFixed(6), lng: lng.toFixed(6)
    }));
  }

  function setPlacemark(coords) {
    if (placemark) {
      placemark.geometry.setCoordinates(coords);
    } else {
      placemark = new ymaps.Placemark(coords, {}, { preset: 'islands#redDotIcon' });
      myMap.geoObjects.add(placemark);
    }
  }

  // Pin faqat manzil (ko'cha/uy) matni haqiqatan topilib, formaga yozilgach
  // ko'rsatiladi — shuning uchun bu RN tomonidan aniq chaqiriladi, tegishli
  // koordinata post qilingandan va reverse-geokodlash tugagandan keyin.
  function dropPin(lat, lng) {
    setPlacemark([lat, lng]);
  }

  function goTo(lat, lng, zoom) {
    myMap.setCenter([lat, lng], zoom || 16);
    post(lat, lng);
  }

  // Faqat ko'rinishni suradi — pin/placemark qo'ymaydi. Viloyat/tuman
  // tanlangandagina xarita shu tomonga qaraydi, aniq nuqta hali belgilanmagan
  // bo'ladi — foydalanuvchi bosgandagina (yoki "hozirgi joylashuv"da) pin chiqadi.
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
        ? `setPlacemark([${initLat}, ${initLng}]); myMap.setCenter([${initLat}, ${initLng}], 15);`
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
async function reverseGeocodeAddress(lat, lng) {
  try {
    const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${YANDEX_GEOCODER_API_KEY}&format=json&geocode=${lng},${lat}`;
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
      addressLine: meta.text || obj.name,
      street: parts.street || null,
      house: parts.house || null,
      district: parts.district || null,
      locality: parts.locality || null,
      area: parts.area || null,
      province: parts.province || null,
    };
  } catch {
    return null;
  }
}

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

  const locate = async (ref) => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        if (permissionTitle) Alert.alert(permissionTitle, permissionMessage);
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      ref.current?.injectJavaScript(
        `goTo(${pos.coords.latitude}, ${pos.coords.longitude}); true;`
      );
    } catch {
      if (errorTitle) Alert.alert(errorTitle, errorMessage);
    } finally {
      setLocating(false);
    }
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
      onChange?.(data.lat, data.lng);
      reverseGeocodeAddress(data.lat, data.lng).then((resolved) => {
        if (!resolved) return;
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
      if (cancelled || !coords) return;
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
    forwardGeocode(searchQuery).then((coords) => {
      if (cancelled || !coords) return;
      webRef.current?.injectJavaScript(
        `goTo(${coords.lat}, ${coords.lng}, ${searchZoom || 16}); dropPin(${coords.lat}, ${coords.lng}); true;`
      );
    });
    return () => {
      cancelled = true;
    };
  }, [searchQuery, searchZoom]);

  // Faqat ko'rinishni suradi, pin qo'ymaydi — viloyat/tuman tanlanganda
  // ishlatiladi (aniq zaxira koordinatalar bilan). Primitivlar orqali —
  // obyekt bo'lsa har renderda yangi reference hosil bo'lib, effekt
  // keraksiz qayta ishga tushib ketardi.
  useEffect(() => {
    if (panLat == null || panLng == null) return;
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
            style={styles.locateBtn}
            onPress={() => locate(webRef)}
            activeOpacity={0.85}
            disabled={locating}
          >
            {locating ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="navigate" size={15} color="#fff" />
            )}
            {!!locateLabel && (
              <Text style={styles.locateTxt}>
                {locating ? locatingLabel : locateLabel}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={fullscreen}
        animationType="slide"
        onRequestClose={() => setFullscreen(false)}
      >
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
