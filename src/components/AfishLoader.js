import React from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';

const SOURCE = require('../../assets/afish-loader.webp');
const ASPECT_RATIO = 360 / 200;

export default function AfishLoader({ size = 120, style }) {
  return (
    <View style={style}>
      <Image
        source={SOURCE}
        style={{ width: size, height: size / ASPECT_RATIO }}
        contentFit="contain"
        autoplay
      />
    </View>
  );
}
