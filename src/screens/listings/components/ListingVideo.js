import { useEffect, useState } from 'react';
import { View, Image, Pressable, TouchableOpacity, StyleSheet } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { encodeImageUri } from '../utils';

// expo-video pleyeri xossalari (muted) to'g'ridan-to'g'ri o'zgartiriladi.
function setPlayerMuted(player, value) {
  player.muted = value;
}

// E'lon videosi. `active` bo'lmaganda to'xtab turadi (reels'da faqat ko'rinib turgan sahifa o'ynaydi).
// Bosilsa to'xtaydi/davom etadi; `controls` — tizim boshqaruvi (batafsil sahifada). Ovoz standart o'chiq.
export default function ListingVideo({
  uri,
  poster,
  width,
  height,
  active = true,
  controls = false,
  contentFit = 'cover',
  style,
}) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.muted = true;
  });
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    if (active && !paused) player.play();
    else player.pause();
  }, [active, paused, player]);

  return (
    <View style={[{ width, height, backgroundColor: '#000' }, style]}>
      {!!poster && (
        <Image
          source={{ uri: encodeImageUri(poster) }}
          style={StyleSheet.absoluteFill}
          resizeMode={contentFit === 'contain' ? 'contain' : 'cover'}
        />
      )}
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={() => setPaused((v) => !v)}
        accessibilityRole="button"
      >
        <VideoView
          player={player}
          style={StyleSheet.absoluteFill}
          contentFit={contentFit}
          nativeControls={controls}
          allowsPictureInPicture={false}
        />
        {paused && (
          <View style={s.center} pointerEvents="none">
            <View style={s.playCircle}>
              <MaterialCommunityIcons name="play" size={34} color="#fff" />
            </View>
          </View>
        )}
      </Pressable>
      {!controls && (
        <TouchableOpacity
          style={s.mute}
          onPress={() => {
            setPlayerMuted(player, !muted);
            setMuted(!muted);
          }}
          activeOpacity={0.8}
          hitSlop={8}
          accessibilityRole="button"
        >
          <MaterialCommunityIcons
            name={muted ? 'volume-off' : 'volume-high'}
            size={18}
            color="#fff"
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  center: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  playCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mute: {
    position: 'absolute',
    left: 14,
    bottom: 14,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
