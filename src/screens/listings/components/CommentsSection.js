import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { appAlert } from '../../../components/AppAlert';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import {
  useListingComments,
  useAddListingComment,
  useDeleteListingComment,
} from '../../../queries/listings';
import { getErrorMessage } from '../../../utils/errors';
import { encodeImageUri, timeAgo } from '../utils';

const MAX_LENGTH = 1000;

// E'lon izohlari: ro'yxat, yangi izoh yozish (faqat kirgan foydalanuvchi) va o'zining izohini o'chirish.
// `sheet` — quyi oynada: ro'yxat aylanadi, yozish maydoni esa pastda qotib turadi.
export default function CommentsSection({ listingId, signedIn, onLogin, sheet = false }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const { comments, loading, error, refetch } = useListingComments(listingId);
  const add = useAddListingComment(listingId);
  const remove = useDeleteListingComment(listingId);
  const [text, setText] = useState('');

  const canSend = text.trim().length > 0 && !add.isPending;

  const send = () => {
    if (!canSend) return;
    add.mutate(text, {
      onSuccess: () => setText(''),
      onError: (err) =>
        appAlert(tr('common.errorTitle'), getErrorMessage(err, tr, 'listings.comments.sendError')),
    });
  };

  const confirmDelete = (comment) =>
    appAlert(tr('listings.comments.deleteConfirm'), undefined, [
      { text: tr('common.cancel'), style: 'cancel' },
      {
        text: tr('listings.comments.delete'),
        style: 'destructive',
        onPress: () =>
          remove.mutate(comment.id, {
            onError: (err) =>
              appAlert(
                tr('common.errorTitle'),
                getErrorMessage(err, tr, 'listings.comments.deleteError')
              ),
          }),
      },
    ]);

  const list = (
    <>
      <View style={s.head}>
        <MaterialCommunityIcons name="comment-text-outline" size={18} color={t.orange} />
        <Text style={[s.title, { color: t.text }]}>
          {tr('listings.comments.title')}
          {comments.length > 0 ? ` · ${comments.length}` : ''}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator color={t.orange} style={{ marginVertical: 18 }} />
      ) : error ? (
        <TouchableOpacity onPress={refetch} activeOpacity={0.8}>
          <Text style={[s.note, { color: t.muted }]}>
            {tr('listings.comments.loadError')} · {tr('common.retry')}
          </Text>
        </TouchableOpacity>
      ) : comments.length === 0 ? (
        <Text style={[s.note, { color: t.muted }]}>{tr('listings.comments.empty')}</Text>
      ) : (
        <View style={{ gap: 12 }}>
          {comments.map((c) => (
            <View key={c.id} style={s.item}>
              <View style={[s.avatar, { backgroundColor: t.card3 }]}>
                {c.authorPhoto ? (
                  <Image
                    source={{ uri: encodeImageUri(c.authorPhoto) }}
                    style={StyleSheet.absoluteFill}
                    resizeMode="cover"
                  />
                ) : (
                  <Text style={[s.avatarTxt, { color: t.muted }]}>
                    {(c.authorName[0] ?? '?').toUpperCase()}
                  </Text>
                )}
              </View>
              <View
                style={[
                  s.bubble,
                  {
                    backgroundColor: c.isOwner ? 'rgba(232,122,69,0.12)' : t.card,
                    borderColor: c.isOwner ? 'rgba(232,122,69,0.4)' : t.border,
                  },
                ]}
              >
                <View style={s.meta}>
                  <Text style={[s.name, { color: t.text }]} numberOfLines={1}>
                    {c.authorName}
                  </Text>
                  {c.isOwner && (
                    <View style={[s.ownerTag, { backgroundColor: t.orange }]}>
                      <Text style={s.ownerTxt}>{tr('listings.comments.owner')}</Text>
                    </View>
                  )}
                  <Text style={[s.time, { color: t.faint }]}>{timeAgo(c.createdAt, tr)}</Text>
                  {c.isMine && (
                    <TouchableOpacity
                      onPress={() => confirmDelete(c)}
                      hitSlop={10}
                      accessibilityRole="button"
                      accessibilityLabel={tr('listings.comments.delete')}
                    >
                      <MaterialCommunityIcons name="trash-can-outline" size={16} color={t.red} />
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={[s.body, { color: t.subtext }]}>{c.body}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </>
  );

  const composer = (
    <>
      {signedIn ? (
        <View style={[s.composer, { backgroundColor: t.card, borderColor: t.border }]}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={tr('listings.comments.placeholder')}
            placeholderTextColor={t.faint}
            multiline
            maxLength={MAX_LENGTH}
            style={[s.input, { color: t.text }]}
          />
          <TouchableOpacity
            onPress={send}
            disabled={!canSend}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={tr('listings.comments.send')}
            style={[s.send, { backgroundColor: canSend ? t.orange : t.card3 }]}
          >
            {add.isPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <MaterialCommunityIcons name="send" size={18} color={canSend ? '#fff' : t.faint} />
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          onPress={onLogin}
          activeOpacity={0.85}
          style={[s.loginCard, { backgroundColor: t.card, borderColor: t.border }]}
        >
          <MaterialCommunityIcons name="login" size={18} color={t.orange} />
          <Text style={[s.loginTxt, { color: t.text }]}>
            {tr('listings.comments.loginToComment')}
          </Text>
        </TouchableOpacity>
      )}
    </>
  );

  if (sheet) {
    return (
      <View style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {list}
        </ScrollView>
        {composer}
      </View>
    );
  }

  return (
    <View>
      {list}
      {composer}
    </View>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  title: { fontSize: 16.5, fontWeight: '800' },
  note: { fontSize: 13, fontWeight: '600', paddingVertical: 8 },
  item: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTxt: { fontSize: 14, fontWeight: '800' },
  bubble: { flex: 1, borderRadius: 16, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { flexShrink: 1, fontSize: 13, fontWeight: '800' },
  ownerTag: { borderRadius: 7, paddingHorizontal: 6, paddingVertical: 2 },
  ownerTxt: { color: '#fff', fontSize: 9.5, fontWeight: '800' },
  time: { flex: 1, fontSize: 11, fontWeight: '600', textAlign: 'right' },
  body: { fontSize: 13.5, lineHeight: 19, marginTop: 5 },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    borderRadius: 22,
    borderWidth: 1,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
    marginTop: 16,
  },
  input: { flex: 1, maxHeight: 110, fontSize: 14.5, paddingTop: 8, paddingBottom: 8 },
  send: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  loginCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    marginTop: 16,
  },
  loginTxt: { fontSize: 14, fontWeight: '700' },
});
