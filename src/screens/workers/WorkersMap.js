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

  function send(msg) {
    window.ReactNativeWebView.postMessage(JSON.stringify(msg));
  }

  function iconFor(id) {
    return id === selectedId ? 'islands#redCircleDotIcon' : 'islands#orangeCircleDotIcon';
  }

  // data: { pins: [{id, lat, lon}], me: {lat, lon} | null, fit: boolean }
  function setData(data) {
    if (!ready) { pending = data; return; }
    if (group) map.geoObjects.remove(group);
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
    map.geoObjects.add(group);

    if (meMark) { map.geoObjects.remove(meMark); meMark = null; }
    if (data.me) {
      meMark = new ymaps.Placemark([data.me.lat, data.me.lon], {}, { preset: 'islands#blueCircleDotIcon' });
      map.geoObjects.add(meMark);
    }

    if (!data.fit) return;
    if (data.pins.length > 1) {
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
    ready = true;
    if (pending) { setData(pending); pending = null; }
    send({ ready: true });
  });
</script>
</body>
</html>`;

// Ustalar xaritasi: koordinatasi bor ustalar nuqta bo'lib chiqadi (yaqinlari klasterga birlashadi), nuqta bosilsa `onSelect(id)`,
// xaritaning bo'sh joyi bosilsa `onSelect(null)`. `me` — foydalanuvchi joylashuvi (ko'k nuqta).
// `fitKey` o'zgarganda xarita nuqtalarga moslab qayta markazlanadi (filtr/tartib o'zgarganda);
// "yana yuklash" kabi qo'shimcha nuqtalar kelganda ko'rinish o'zgarmaydi.
export default function WorkersMap({ pins, me, selectedId, onSelect, fitKey, style }) {
  const webRef = useRef(null);
  const [ready, setReady] = useState(false);
  const lastFit = useRef(null);

  useEffect(() => {
    if (!ready) return;
    const fit = lastFit.current !== fitKey;
    lastFit.current = fitKey;
    const payload = JSON.stringify({ pins, me: me ?? null, fit });
    webRef.current?.injectJavaScript(`setData(${payload}); true;`);
    // Nuqtalar qayta chizilgach tanlangan nuqta rangi ham qayta qo'llanadi.
    webRef.current?.injectJavaScript(`select(${selectedId ?? 'null'}); true;`);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- tanlov alohida effektda
  }, [ready, pins, me, fitKey]);

  useEffect(() => {
    if (!ready) return;
    webRef.current?.injectJavaScript(`select(${selectedId ?? 'null'}); true;`);
  }, [ready, selectedId]);

  const onMessage = (e) => {
    try {
      const msg = JSON.parse(e.nativeEvent.data);
      if (msg.ready) setReady(true);
      else if ('id' in msg) onSelect?.(msg.id);
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
