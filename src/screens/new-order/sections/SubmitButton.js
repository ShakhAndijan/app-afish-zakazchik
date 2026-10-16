import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { common } from '../styles';

export default function SubmitButton({ ready, missing = [], onPress }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const [noticeOpen, setNoticeOpen] = useState(false);

  // Majburiy maydonlar to'ldirilmagan bo'lsa, nimalar yetishmayotgani chiroyli oynada ko'rsatiladi.
  const handlePress = () => {
    if (ready) return onPress?.();
    setNoticeOpen(true);
  };

  return (
    <>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.85}
        style={[common.cta, { backgroundColor: t.orange }, !ready && { backgroundColor: t.card }]}
      >
        <Text style={[common.ctaTxt, { color: ready ? '#fff' : t.faint }]}>
          {tr('newOrder.submitCta')}
        </Text>
        {ready ? (
          <MaterialCommunityIcons name="arrow-right" size={18} color="#fff" />
        ) : (
          <View style={[s.countBadge, { backgroundColor: t.orange }]}>
            <Text style={s.countTxt}>{missing.length}</Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={noticeOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setNoticeOpen(false)}
      >
        <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={() => setNoticeOpen(false)}>
          <View
            style={[s.card, { backgroundColor: t.bg, borderColor: t.border }]}
            onStartShouldSetResponder={() => true}
          >
            <View style={s.iconRing}>
              <View style={s.iconCore}>
                <MaterialCommunityIcons name="clipboard-text-outline" size={30} color="#fff" />
              </View>
            </View>

            <Text style={[s.title, { color: t.text }]}>{tr('newOrder.requiredTitle')}</Text>
            <Text style={[s.sub, { color: t.muted }]}>{tr('newOrder.requiredSub')}</Text>

            <View style={s.list}>
              {missing.map((m) => (
                <View key={m} style={[s.item, { backgroundColor: t.card, borderColor: t.border }]}>
                  <View style={s.itemDot}>
                    <MaterialCommunityIcons name="exclamation-thick" size={14} color={t.orange} />
                  </View>
                  <Text style={[s.itemTxt, { color: t.text }]} numberOfLines={2}>
                    {tr(m).replace(/\?$/, '')}
                  </Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              onPress={() => setNoticeOpen(false)}
              activeOpacity={0.85}
              style={[s.okBtn, { backgroundColor: t.orange }]}
            >
              <Text style={s.okTxt}>{tr('newOrder.requiredOk')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  countBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countTxt: { color: '#fff', fontSize: 12, fontWeight: '800' },

  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 30,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 26,
    paddingBottom: 20,
    alignItems: 'center',
  },
  iconRing: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(232,122,69,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconCore: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e87a45',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#e87a45',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  title: { fontSize: 20, fontWeight: '800', textAlign: 'center' },
  sub: { fontSize: 13, lineHeight: 18, textAlign: 'center', marginTop: 6, marginBottom: 18 },

  list: { alignSelf: 'stretch', gap: 8 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 11,
    paddingHorizontal: 12,
  },
  itemDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(232,122,69,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTxt: { flex: 1, fontSize: 14, fontWeight: '700' },

  okBtn: {
    alignSelf: 'stretch',
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  okTxt: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
