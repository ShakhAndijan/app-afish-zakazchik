import { useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { COLORS } from '../constants/colors';
import { YANDEX_MAPS_API_KEY } from '../constants/config';

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

  function goTo(lat, lng) {
    var coords = [lat, lng];
    setPlacemark(coords);
    myMap.setCenter(coords, 16);
    post(lat, lng);
  }

  ymaps.ready(function () {
    myMap = new ymaps.Map('map', {
      center: [41.2995, 69.2401],
      zoom: 12,
      controls: ['zoomControl']
    });

    ${
      initLat && initLng
        ? `setPlacemark([${initLat}, ${initLng}]); myMap.setCenter([${initLat}, ${initLng}], 15);`
        : ''
    }

    myMap.events.add('click', function (e) {
      var coords = e.get('coords');
      setPlacemark(coords);
      post(coords[0], coords[1]);
    });
  });
</script>
</body>
</html>`;

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

  const onMessage = (e) => {
    try {
      const { lat: newLat, lng: newLng } = JSON.parse(e.nativeEvent.data);
      onChange?.(newLat, newLng);
    } catch {}
  };

  return (
    <>
      <View style={[styles.wrap, { height }]}>
        <WebView
          ref={webRef}
          style={styles.map}
          source={{ html: buildMapHtml(lat, lng) }}
          onMessage={onMessage}
          javaScriptEnabled
          originWhitelist={['*']}
          scrollEnabled={false}
        />

        {showTapHint && !lat && (
          <View style={styles.hintWrap} pointerEvents="none">
            <Text style={styles.tapHint}>{tapHint}</Text>
          </View>
        )}

        <View style={styles.btnRow}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setFullscreen(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="expand" size={16} color="#fff" />
          </TouchableOpacity>
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
            source={{ html: buildMapHtml(lat, lng) }}
            onMessage={onMessage}
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
