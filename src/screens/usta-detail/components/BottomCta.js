import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useLanguage } from '../../../context/LanguageContext';
import { useUstaStyles } from '../styles';

// Pastki panel: chat tugmasi va "Buyurtma berish" (kirmagan bo'lsa — kirishga yo'naltiradi).
export default function BottomCta({ price, onPress }) {
  const insets = useSafeAreaInsets();
  const { t: tr } = useLanguage();
  const { st } = useUstaStyles();

  return (
    <View style={[st.bottomBar, { paddingBottom: Math.max(insets.bottom, 14) }]}>
      <TouchableOpacity style={st.callBtn} activeOpacity={0.85} onPress={onPress}>
        <MaterialCommunityIcons name="lightning-bolt" size={18} color="#fff" />
        <Text style={st.callBtnTxt}>{tr('ustaDetail.callBtn', { price })}</Text>
      </TouchableOpacity>
    </View>
  );
}
