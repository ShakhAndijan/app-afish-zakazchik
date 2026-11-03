import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useLanguage } from '../../../context/LanguageContext';
import { useUstaStyles } from '../styles';

// Pastki panel: chat tugmasi va "Buyurtma berish" (kirmagan bo'lsa — kirishga yo'naltiradi).
// `unavailable` — usta hozir buyurtma qabul qila olmaydi: tugma o'rniga xabar ko'rsatiladi.
export default function BottomCta({ price, onPress, unavailable = false }) {
  const insets = useSafeAreaInsets();
  const { t: tr } = useLanguage();
  const { C, st } = useUstaStyles();

  return (
    <View style={[st.bottomBar, { paddingBottom: Math.max(insets.bottom, 14) }]}>
      {unavailable ? (
        <View
          style={[
            st.callBtn,
            { backgroundColor: C.card, borderWidth: 1, borderColor: C.line, shadowOpacity: 0 },
          ]}
        >
          <MaterialCommunityIcons name="account-off-outline" size={18} color={C.dim} />
          <Text style={[st.callBtnTxt, { color: C.dim }]}>{tr('ustaDetail.notTakingOrders')}</Text>
        </View>
      ) : (
        <TouchableOpacity style={st.callBtn} activeOpacity={0.85} onPress={onPress}>
          <MaterialCommunityIcons name="lightning-bolt" size={18} color="#fff" />
          <Text style={st.callBtnTxt}>{tr('ustaDetail.callBtn', { price })}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
