import { memo, useState } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { encodeImageUri, priceText, timeAgo } from '../utils';
import ReelActionButton from './ReelActionButton';

const ORANGE = '#e87a45';
const GOLD = '#f5c451';
const RING = '#e87a45';

// Bitta e'lon — to'liq ekran: orqa fonda rasmlar (gorizontal suriladi), tepada orqaga/belgi,
// o'ngda amallar, pastda usta, sarlavha, tavsif, narx va "Bog'lanish".
function ReelPage({
  listing,
  width,
  height,
  insets,
  onBack,
  onSearch,
  onFilter,
  filterActive,
  onLike,
  onSave,
  onComments,
  onShare,
  onDetails,
  onContact,
  onOpenWorker,
}) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const [photoIndex, setPhotoIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const worker = listing.worker;
  const photos = listing.photos;
  const location = [worker?.location, timeAgo(listing.createdAt, tr)].filter(Boolean).join(' · ');

  return (
    <View style={{ width, height, backgroundColor: '#0b1117' }}>
      {photos.length > 0 ? (
        <FlatList
          data={photos}
          keyExtractor={(uri, i) => `${i}-${uri}`}
          horizontal
          pagingEnabled
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          // Faqat ko'rinib turgan sahifadan atrofdagi rasmlar yuklanadi.
          initialNumToRender={1}
          windowSize={3}
          getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
          onMomentumScrollEnd={(e) =>
            setPhotoIndex(Math.round(e.nativeEvent.contentOffset.x / width))
          }
          renderItem={({ item: uri }) => (
            // "cover": rasm har qanday ekran nisbatida butun ekranni to'ldiradi (ortiqcha chetlari qirqiladi).
            <Image
              source={{ uri: encodeImageUri(uri) }}
              style={{ width, height }}
              resizeMode="cover"
            />
          )}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, s.noPhoto]}>
          <MaterialCommunityIcons
            name="image-off-outline"
            size={56}
            color="rgba(255,255,255,0.3)"
          />
        </View>
      )}

      <LinearGradient
        pointerEvents="none"
        colors={['rgba(0,0,0,0.55)', 'transparent']}
        style={[s.topShade, { height: insets.top + 110 }]}
      />
      <LinearGradient
        pointerEvents="none"
        colors={['transparent', 'rgba(0,0,0,0.88)']}
        style={[s.bottomShade, { height: height * 0.5 }]}
      />

      <View style={[s.topRow, { top: insets.top + 10 }]} pointerEvents="box-none">
        {!!onBack && (
          <TouchableOpacity
            onPress={onBack}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={tr('common.back')}
            style={s.backBtn}
          >
            <MaterialCommunityIcons name="chevron-left" size={26} color="#fff" />
          </TouchableOpacity>
        )}
        {listing.isTop && (
          <View style={s.topBadge}>
            <Ionicons name="flame" size={13} color={ORANGE} />
            <Text style={s.topBadgeTxt}>{tr('listings.top')}</Text>
          </View>
        )}
        <View style={{ flex: 1 }} />
        {photos.length > 1 && (
          <View style={s.counter}>
            <Text style={s.counterTxt}>
              {photoIndex + 1}/{photos.length}
            </Text>
          </View>
        )}
        {!!onFilter && (
          <TouchableOpacity
            onPress={onFilter}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={tr('listings.reels.filterTitle')}
            style={s.backBtn}
          >
            <MaterialCommunityIcons name="tune-variant" size={22} color="#fff" />
            {filterActive && <View style={s.filterDot} />}
          </TouchableOpacity>
        )}
        {!!onSearch && (
          <TouchableOpacity
            onPress={onSearch}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={tr('common.search')}
            style={s.backBtn}
          >
            <MaterialCommunityIcons name="magnify" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      <View style={[s.rail, { bottom: insets.bottom + 96 }]} pointerEvents="box-none">
        <ReelActionButton
          icon={listing.isLiked ? 'heart' : 'heart-outline'}
          active={listing.isLiked}
          activeColor="#ff4d5e"
          label={String(listing.likeCount)}
          a11yLabel={tr('listings.reels.like')}
          onPress={() => onLike(listing)}
        />
        <ReelActionButton
          icon="comment-outline"
          label={String(listing.commentCount)}
          a11yLabel={tr('listings.reels.comments')}
          onPress={() => onComments(listing)}
        />
        <ReelActionButton
          icon="share-variant-outline"
          label={tr('listings.reels.share')}
          onPress={() => onShare(listing)}
        />
        <ReelActionButton
          icon={listing.isFavorite ? 'bookmark' : 'bookmark-outline'}
          active={listing.isFavorite}
          activeColor={GOLD}
          label={tr(listing.isFavorite ? 'listings.reels.saved' : 'listings.reels.save')}
          onPress={() => onSave(listing)}
        />
        <ReelActionButton
          icon="open-in-new"
          label={tr('listings.reels.details')}
          onPress={() => onDetails(listing)}
        />
      </View>

      <View style={[s.info, { paddingBottom: insets.bottom + 16 }]} pointerEvents="box-none">
        {!!worker && (
          <TouchableOpacity
            onPress={() => onOpenWorker(worker)}
            activeOpacity={0.85}
            accessibilityRole="button"
            style={s.workerRow}
          >
            <View style={[s.avatar, { backgroundColor: worker.color }]}>
              {worker.photo ? (
                <Image
                  source={{ uri: encodeImageUri(worker.photo) }}
                  style={StyleSheet.absoluteFill}
                  resizeMode="cover"
                />
              ) : (
                <Text style={s.avatarTxt}>{worker.initial}</Text>
              )}
            </View>
            <View style={{ flexShrink: 1 }}>
              <View style={s.nameRow}>
                <Text style={s.workerName} numberOfLines={1}>
                  {worker.name}
                </Text>
                {worker.rating != null && worker.rating > 0 && (
                  <>
                    <Ionicons name="star" size={13} color={GOLD} />
                    <Text style={s.rating}>{worker.rating.toFixed(1)}</Text>
                  </>
                )}
              </View>
              {!!worker.nickname && (
                <Text style={s.nick} numberOfLines={1}>
                  @{worker.nickname}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        )}

        <Text style={s.title} numberOfLines={2}>
          {listing.title}
        </Text>
        {!!location && (
          <View style={s.locRow}>
            <MaterialCommunityIcons name="map-marker-outline" size={15} color="#fff" />
            <Text style={s.loc} numberOfLines={1}>
              {location}
            </Text>
          </View>
        )}
        {!!listing.description && (
          <Pressable onPress={() => setExpanded((v) => !v)} style={s.descWrap}>
            <Text style={s.desc} numberOfLines={expanded ? 8 : 2}>
              {listing.description}
            </Text>
          </Pressable>
        )}

        <View style={s.buyRow}>
          <Text
            style={[s.price, { color: listing.price == null ? '#fff' : ORANGE }]}
            numberOfLines={1}
          >
            {priceText(listing, tr)}
          </Text>
          <TouchableOpacity
            onPress={() => onContact(listing)}
            activeOpacity={0.88}
            accessibilityRole="button"
            style={[s.contactBtn, { backgroundColor: t.orange }]}
          >
            <Text style={s.contactTxt}>{tr('listings.reels.contact')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default memo(ReelPage);

const s = StyleSheet.create({
  noPhoto: { alignItems: 'center', justifyContent: 'center' },
  topShade: { position: 'absolute', top: 0, left: 0, right: 0 },
  bottomShade: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  topRow: {
    position: 'absolute',
    left: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: ORANGE,
  },
  topBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 30,
    paddingHorizontal: 12,
    borderRadius: 15,
    backgroundColor: '#fff',
  },
  topBadgeTxt: { color: '#111', fontSize: 12.5, fontWeight: '800' },
  counter: {
    height: 28,
    paddingHorizontal: 11,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterTxt: { color: '#fff', fontSize: 12, fontWeight: '700' },
  rail: { position: 'absolute', right: 6, gap: 14, alignItems: 'center' },
  info: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingLeft: 16, paddingRight: 76 },
  workerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, alignSelf: 'flex-start' },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: RING,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTxt: { color: '#fff', fontSize: 18, fontWeight: '800' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  workerName: { flexShrink: 1, color: '#fff', fontSize: 15.5, fontWeight: '800' },
  rating: { color: GOLD, fontSize: 13, fontWeight: '800' },
  nick: { color: 'rgba(255,255,255,0.7)', fontSize: 12.5, fontWeight: '600', marginTop: 1 },
  title: { color: '#fff', fontSize: 21, fontWeight: '800', lineHeight: 26, marginTop: 12 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 },
  loc: { flexShrink: 1, color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: '700' },
  descWrap: { marginTop: 6 },
  desc: { color: 'rgba(255,255,255,0.85)', fontSize: 14, lineHeight: 20 },
  buyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 14, marginRight: -60 },
  price: { flex: 1, fontSize: 22, fontWeight: '900' },
  contactBtn: {
    height: 48,
    paddingHorizontal: 26,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 0,
  },
  contactTxt: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
