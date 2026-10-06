import { useState, useEffect } from 'react';
import { View, Text, Image } from 'react-native';
import { devLog } from '../utils/log';

// Android'dagi Image (Fresco/OkHttp) kodlanmagan "+" belgisini URL'da
// noto'g'ri talqin qilib, rasmni yuklolmasligi mumkin — shu sababli xavfsiz kodlaymiz.
const encodeImageUri = (uri) => (uri ? uri.replace(/\+/g, '%2B') : uri);

export default function Avatar({ letter = 'J', size = 42, bgColor = '#e87a45', uri }) {
  const [failed, setFailed] = useState(false);
  // Yangi rasm (masalan avatar almashtirilganda) berilsa, qayta urinib ko'ramiz.
  useEffect(() => setFailed(false), [uri]);
  const showImage = uri && !failed;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.32,
        backgroundColor: showImage ? 'transparent' : bgColor,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {showImage ? (
        <Image
          source={{ uri: encodeImageUri(uri) }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
          onError={(e) => {
            devLog('[Avatar] rasm yuklanmadi:', uri, e.nativeEvent?.error);
            setFailed(true);
          }}
        />
      ) : (
        <Text style={{ color: '#fff', fontSize: size * 0.4, fontWeight: '700' }}>{letter}</Text>
      )}
    </View>
  );
}
