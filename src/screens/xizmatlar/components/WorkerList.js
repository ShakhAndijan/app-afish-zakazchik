import { View } from 'react-native';
import ListingCard from '../../../components/ListingCard';
import { useLanguage } from '../../../context/LanguageContext';
import { useXizmatlarStyles } from '../styles';
import { CATEGORY_ACCENT } from '../constants';
import { toListingCardShape } from '../utils';

// Ustalar kartochkalari ro'yxati.
export default function WorkerList({ workers, onSelect, style }) {
  const { t: tr } = useLanguage();
  const { styles } = useXizmatlarStyles();

  return (
    <View style={[styles.listWrap, style]}>
      {workers.map((w) => (
        <ListingCard
          key={w.id}
          listing={toListingCardShape(w, tr)}
          accent={CATEGORY_ACCENT}
          onPress={() => onSelect(w)}
        />
      ))}
    </View>
  );
}
