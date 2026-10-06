import { View, Text, Image } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useUstaStyles } from '../styles';
import { encodeImageUri, formatDate } from '../utils';

// Bitta baholangan ish: sarlavha, sana, yulduzlar, sharh matni va (ko'pi bilan 2 ta) surat.
export default function ReviewCard({ item }) {
  const { C, st } = useUstaStyles();

  return (
    <View style={[st.card, { padding: 14 }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', flex: 1, marginRight: 8 }}>
          <View style={[st.revAv, { backgroundColor: C.card3 }]}>
            <MaterialCommunityIcons name="briefcase-outline" size={16} color={C.dim} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '700', fontSize: 14, color: C.txt }} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={{ fontSize: 11, color: C.dim, marginTop: 1 }}>{formatDate(item.workDate)}</Text>
          </View>
        </View>
        {item.rating != null && (
          <View style={{ flexDirection: 'row', gap: 2 }}>
            {[...Array(Math.round(item.rating))].map((_, k) => (
              <Ionicons key={k} name="star" size={13} color={C.gold} />
            ))}
          </View>
        )}
      </View>
      {!!item.comment && (
        <Text style={{ fontSize: 13.5, color: '#c4cdd8', marginTop: 10, lineHeight: 20 }}>
          {item.comment}
        </Text>
      )}
      {item.photos?.length > 0 && (
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          {item.photos.slice(0, 2).map((photoUri, k) => (
            <Image
              key={k}
              source={{ uri: encodeImageUri(photoUri) }}
              style={st.revPhoto}
              resizeMode="cover"
            />
          ))}
        </View>
      )}
    </View>
  );
}
