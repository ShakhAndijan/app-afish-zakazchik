import { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import Avatar from '../../../components/Avatar';
import { getWorkersPage } from '../../../api/workers';

const SEARCH_DELAY_MS = 400;
const EMPTY = [];

// "Boshqa mutaxassisga yuborish": buyurtma yo'nalishlariga mos ustalar ro'yxati (reyting bo'yicha),
// ism yoki xizmat bo'yicha qidiruv bilan. Avval rad etgan usta ro'yxatda ko'rsatilmaydi.
export default function SendToModal({ visible, categoryIds, excludeId, busy, onClose, onPick }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const [input, setInput] = useState('');
  const [q, setQ] = useState('');

  useEffect(() => {
    const id = setTimeout(() => setQ(input.trim()), SEARCH_DELAY_MS);
    return () => clearTimeout(id);
  }, [input]);

  const covers = categoryIds?.length ? categoryIds.join(',') : null;
  const query = useQuery({
    queryKey: ['workers', 'send-to', covers, q],
    queryFn: () => getWorkersPage({ covers, q, size: 20, sort: 'rating' }),
    enabled: visible,
    staleTime: 30 * 1000,
  });
  const workers = (query.data?.items ?? EMPTY).filter((w) => w.id !== excludeId);
  const close = () => {
    setInput('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={close}>
      <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top', 'left', 'right']}>
        <View style={s.header}>
          <TouchableOpacity
            style={[s.closeBtn, { backgroundColor: t.card, borderColor: t.border }]}
            onPress={close}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={tr('requests.close')}
          >
            <MaterialCommunityIcons name="close" size={22} color={t.text} />
          </TouchableOpacity>
          <Text style={[s.title, { color: t.text }]} numberOfLines={1}>
            {tr('requests.sendToTitle')}
          </Text>
        </View>
        <Text style={[s.hint, { color: t.muted }]}>{tr('requests.sendToHint')}</Text>

        <View style={[s.search, { backgroundColor: t.card, borderColor: t.border }]}>
          <MaterialCommunityIcons name="magnify" size={20} color={t.muted} />
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder={tr('requests.sendToSearch')}
            placeholderTextColor={t.faint}
            style={[s.searchInput, { color: t.text }]}
          />
        </View>

        {query.isPending ? (
          <ActivityIndicator color={t.orange} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={workers}
            keyExtractor={(w) => String(w.id)}
            contentContainerStyle={{ padding: 20, gap: 10 }}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <Text style={[s.empty, { color: t.muted }]}>{tr('requests.noWorkers')}</Text>
            }
            renderItem={({ item }) => (
              <View style={[s.row, { backgroundColor: t.card, borderColor: t.border }]}>
                <Avatar
                  letter={item.initial}
                  bgColor={item.color}
                  uri={item.profile_photo}
                  size={44}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[s.name, { color: t.text }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={[s.meta, { color: t.muted }]} numberOfLines={1}>
                    {[item.mainCategory || item.profession, `★ ${item.rating.toFixed(1)}`]
                      .filter(Boolean)
                      .join(' · ')}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[s.sendBtn, { backgroundColor: t.orange, opacity: busy ? 0.6 : 1 }]}
                  activeOpacity={0.85}
                  disabled={busy}
                  onPress={() => onPick(item)}
                >
                  <Text style={s.sendTxt}>{tr('requests.send')}</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { flex: 1, fontWeight: '700', fontSize: 20 },
  hint: { fontSize: 12.5, lineHeight: 18, paddingHorizontal: 20, marginBottom: 12 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    paddingHorizontal: 16,
    marginHorizontal: 20,
  },
  searchInput: { flex: 1, fontSize: 14.5, padding: 0 },
  empty: { textAlign: 'center', marginTop: 40, fontSize: 14 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
  },
  name: { fontSize: 14.5, fontWeight: '800' },
  meta: { fontSize: 12, marginTop: 2 },
  sendBtn: { height: 36, paddingHorizontal: 16, borderRadius: 12, justifyContent: 'center' },
  sendTxt: { color: '#fff', fontSize: 13, fontWeight: '800' },
});
