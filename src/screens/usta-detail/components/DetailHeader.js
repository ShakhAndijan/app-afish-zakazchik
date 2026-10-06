import { View, Text, TouchableOpacity, Share } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';
import { useLanguage } from '../../../context/LanguageContext';
import { useUstaStyles } from '../styles';

// Yuqori panel: orqaga, ulashish va (kirgan mijoz uchun) sevimliga qo'shish.
export default function DetailHeader({ onBack, shareInfo, isLoggedIn, liked, onToggleLike }) {
  const { t: tr } = useLanguage();
  const { C, st } = useUstaStyles();

  const share = () =>
    Share.share({ message: tr('ustaDetail.shareMessage', shareInfo) }).catch(() => {});

  return (
    <View style={st.header}>
      <TouchableOpacity onPress={onBack} style={st.iconBtn} activeOpacity={0.7}>
        <Ionicons name="arrow-back" size={22} color={C.txt} />
      </TouchableOpacity>
      <Text style={st.headerTitle}>{tr('ustaDetail.headerTitle')}</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TouchableOpacity style={st.iconBtn} activeOpacity={0.7} onPress={share}>
          <Feather name="share-2" size={18} color={C.txt} />
        </TouchableOpacity>
        {isLoggedIn && (
          <TouchableOpacity style={st.iconBtn} activeOpacity={0.7} onPress={onToggleLike}>
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={20}
              color={liked ? C.orange : C.txt}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
