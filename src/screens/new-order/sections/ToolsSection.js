import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { common } from '../styles';

export default function ToolsSection({ toolsOption, setToolsOption }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();

  return (
    <>
      {/* ── Asboblar ── */}
      <Text style={[common.label, { color: t.text }]}>{tr('newOrder.toolsLabel')}</Text>
      <Text style={[common.hint, { color: t.muted }]}>{tr('newOrder.toolsHint')}</Text>
      <View style={s.toolsRow}>
        <TouchableOpacity
          onPress={() => setToolsOption('has')}
          activeOpacity={0.85}
          style={[
            s.toolsBtn,
            {
              backgroundColor: toolsOption === 'has' ? t.orange : t.card,
              borderColor: toolsOption === 'has' ? t.orange : t.border,
            },
          ]}
        >
          <MaterialCommunityIcons
            name="toolbox-outline"
            size={18}
            color={toolsOption === 'has' ? '#fff' : t.text}
          />
          <Text
            style={[s.toolsBtnTxt, { color: toolsOption === 'has' ? '#fff' : t.text }]}
            numberOfLines={2}
          >
            {tr('newOrder.tools.has')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setToolsOption('needed')}
          activeOpacity={0.85}
          style={[
            s.toolsBtn,
            {
              backgroundColor: toolsOption === 'needed' ? t.orange : t.card,
              borderColor: toolsOption === 'needed' ? t.orange : t.border,
            },
          ]}
        >
          <MaterialCommunityIcons
            name="account-hard-hat-outline"
            size={18}
            color={toolsOption === 'needed' ? '#fff' : t.text}
          />
          <Text
            style={[s.toolsBtnTxt, { color: toolsOption === 'needed' ? '#fff' : t.text }]}
            numberOfLines={2}
          >
            {tr('newOrder.tools.needed')}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const s = StyleSheet.create({
  toolsRow: { flexDirection: 'row', gap: 10 },
  toolsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  toolsBtnTxt: { fontSize: 13, fontWeight: '700', flex: 1 },
});
