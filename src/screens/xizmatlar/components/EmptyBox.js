import { View, Text } from 'react-native';
import { useXizmatlarStyles } from '../styles';

// Bo'sh holat qutisi: matn va (ixtiyoriy) tagida havola/tugma.
export default function EmptyBox({ text, style, children }) {
  const { styles } = useXizmatlarStyles();

  return (
    <View style={[styles.emptyState, style]}>
      <Text style={styles.emptyText}>{text}</Text>
      {children}
    </View>
  );
}
