import React from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '../context/ThemeContext';

const LIGHT = require('../../assets/harna-logo-gif.gif');
const DARK = require('../../assets/loader-on-dark.gif');
const ASPECT_RATIO = 1200 / 362;

// Yuklanish belgisi: Harna logosining animatsiyali (GIF) ko'rinishi. To'q mavzuda yozuvi och rangli
// nusxa ishlatiladi. `size` — avvalgi animatsiyali rasm kengligi bilan bir xil o'lchov.
export default function AppLoader({ size = 120, style }) {
  const { theme } = useTheme();
  const width = size * 1.5;
  return (
    <View style={style}>
      <Image
        source={theme.isDark ? DARK : LIGHT}
        style={{ width, height: width / ASPECT_RATIO }}
        contentFit="contain"
        autoplay
      />
    </View>
  );
}
