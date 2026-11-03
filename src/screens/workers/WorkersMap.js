import { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { YANDEX_MAPS_API_KEY } from '../../constants/config';

// Yandex API kaliti "harna.uz" domeniga bog'langan (LocationMapPicker bilan bir xil sabab).
const MAP_BASE_URL = 'https://dev.harna.uz/';

const HTML = `
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
  var map = null;
  var ready = false;
  var pending = null;
  var pins = {};
  var selectedId = null;
  var meMark = null;
  var group = null; // ymaps.Clusterer
  var bubbles = null; // viloyat/tuman bo'yicha ustalar soni (uzoqlashtirilganda)
  var zoomTimer = null;

  function send(msg) {
    window.ReactNativeWebView.postMessage(JSON.stringify(msg));
  }

  function iconFor(id) {
    return id === selectedId ? 'islands#redCircleDotIcon' : 'islands#orangeCircleDotIcon';
  }

  // Tanlangan viloyat/tuman markazi: koordinata bo'lsa o'sha joyga, bo'lmasa nomi bo'yicha qidirib, topilmasa zaxira nuqtaga.
  function focusArea(a) {
    function fallback() { map.setCenter([a.fallback.lat, a.fallback.lon], a.fallback.zoom); }
    if (a.lat != null) { map.setCenter([a.lat, a.lon], a.zoom); return; }
    ymaps.geocode(a.query, { results: 1 }).then(function (res) {
      var o = res.geoObjects.get(0);
      if (o && o.properties.get('boundedBy')) map.setBounds(o.properties.get('boundedBy'), { checkZoomRange: true });
      else fallback();
    }, fallback);
  }

  // data: { pins: [{id, lat, lon}], clusters: [{name, count, lat, lon}] | null, me: {lat, lon} | null, area: {...} | null, fit: boolean }
  function setData(data) {
    if (!ready) { pending = data; return; }
    if (group) map.geoObjects.remove(group);
    if (bubbles) { map.geoObjects.remove(bubbles); bubbles = null; }
    // Yaqin nuqtalar raqamli klasterga birlashadi; klasterni bossa yaqinlashadi.
    group = new ymaps.Clusterer({
      preset: 'islands#orangeClusterIcons',
      groupByCoordinates: false,
      gridSize: 72,
      clusterDisableClickZoom: false,
      clusterOpenBalloonOnClick: false
    });
    pins = {};
    var marks = data.pins.map(function (p) {
      var mark = new ymaps.Placemark([p.lat, p.lon], {}, { preset: iconFor(p.id) });
      mark.events.add('click', function () { send({ id: p.id }); });
      pins[p.id] = mark;
      return mark;
    });
    group.add(marks);
    if (data.clusters) {
      // Uzoqdan ko'rinishda alohida ustalar o'rniga hudud bo'yicha soni; bossa o'sha hududga yaqinlashadi.
      bubbles = new ymaps.GeoObjectCollection();
      data.clusters.forEach(function (c) {
        var mark = new ymaps.Placemark([c.lat, c.lon], { iconContent: String(c.count), hintContent: c.name }, { preset: 'islands#orangeStretchyIcon' });
        mark.events.add('click', function () { map.setCenter([c.lat, c.lon], c.zoom, { duration: 300 }); });
        bubbles.add(mark);
      });
      map.geoObjects.add(bubbles);
    } else {
      map.geoObjects.add(group);
    }

    if (meMark) { map.geoObjects.remove(meMark); meMark = null; }
    if (data.me) {
      meMark = new ymaps.Placemark([data.me.lat, data.me.lon], {}, { preset: 'islands#blueCircleDotIcon' });
      map.geoObjects.add(meMark);
    }

    if (!data.fit) return;
    if (data.clusters) return;
    if (data.area) {
      focusArea(data.area);
    } else if (data.pins.length > 1) {
      map.setBounds(group.getBounds(), { checkZoomRange: true, zoomMargin: 50 });
    } else if (data.pins.length === 1) {
      map.setCenter([data.pins[0].lat, data.pins[0].lon], 14);
    } else if (data.me) {
      map.setCenter([data.me.lat, data.me.lon], 12);
    }
  }

  function select(id) {
    var prev = selectedId;
    selectedId = id;
    if (prev != null && pins[prev]) pins[prev].options.set('preset', iconFor(prev));
    if (id != null && pins[id]) pins[id].options.set('preset', iconFor(id));
  }

  ymaps.ready(function () {
    map = new ymaps.Map('map', {
      center: [41.2995, 69.2401],
      zoom: 11,
      controls: ['zoomControl']
    }, {
      suppressMapOpenBlock: true,
      copyrightLogoVisible: false,
      copyrightProvidersVisible: false,
      copyrightUaVisible: false
    });
    map.events.add('click', function () { send({ id: null }); });
    map.events.add('boundschange', function () {
      clearTimeout(zoomTimer);
      zoomTimer = setTimeout(function () { send({ zoom: map.getZoom() }); }, 250);
    });
    ready = true;
    if (pending) { setData(pending); pending = null; }
    send({ ready: true, zoom: map.getZoom() });
  });
</script>
</body>
</html>`;

// Ustalar xaritasi: koordinatasi bor ustalar nuqta bo'lib chiqadi (yaqinlari klasterga birlashadi), nuqta bosilsa `onSelect(id)`,
// xaritaning bo'sh joyi bosilsa `onSelect(null)`. `me` — foydalanuvchi joylashuvi (ko'k nuqta).
// `fitKey` o'zgarganda xarita nuqtalarga moslab qayta markazlanadi (filtr/tartib o'zgarganda);
// "yana yuklash" kabi qo'shimcha nuqtalar kelganda ko'rinish o'zgarmaydi.
// `area` (tanlangan viloyat/tuman) berilsa, xarita nuqtalar bo'lmasa ham o'sha hududga markazlanadi:
// { lat, lon, zoom } yoki koordinatasiz bo'lsa { query, fallback: { lat, lon, zoom } }.
// `clusters` ([{ name, count, lat, lon, zoom }]) berilsa nuqtalar o'rniga hudud bo'yicha ustalar soni chiziladi;
// `onZoom(n)` — xarita masshtabi o'zgarganda chaqiriladi.
export default function WorkersMap({
  pins,
  clusters,
  me,
  area,
  selectedId,
  onSelect,
  onZoom,
  fitKey,
  style,
}) {
  const webRef = useRef(null);
  const [ready, setReady] = useState(false);
  const lastFit = useRef(null);

  useEffect(() => {
    if (!ready) return;
    const fit = lastFit.current !== fitKey;
    lastFit.current = fitKey;
    const payload = JSON.stringify({
      pins,
      clusters: clusters ?? null,
      me: me ?? null,
      area: area ?? null,
      fit,
    });
    webRef.current?.injectJavaScript(`setData(${payload}); true;`);
    // Nuqtalar qayta chizilgach tanlangan nuqta rangi ham qayta qo'llanadi.
    webRef.current?.injectJavaScript(`select(${selectedId ?? 'null'}); true;`);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- tanlov alohida effektda
  }, [ready, pins, clusters, me, area, fitKey]);

  useEffect(() => {
    if (!ready) return;
    webRef.current?.injectJavaScript(`select(${selectedId ?? 'null'}); true;`);
  }, [ready, selectedId]);

  const onMessage = (e) => {
    try {
      const msg = JSON.parse(e.nativeEvent.data);
      if (msg.ready) setReady(true);
      if (msg.zoom != null) onZoom?.(msg.zoom);
      if ('id' in msg) onSelect?.(msg.id);
    } catch {}
  };

  return (
    <View style={[s.wrap, style]}>
      <WebView
        ref={webRef}
        style={s.map}
        source={{ html: HTML, baseUrl: MAP_BASE_URL }}
        onMessage={onMessage}
        javaScriptEnabled
        originWhitelist={['*']}
        scrollEnabled={false}
      />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, overflow: 'hidden' },
  map: { flex: 1, backgroundColor: 'transparent' },
});
