import { View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import { s } from '../styles';

// Pastdan chiqadigan oyna: qoraytirilgan fon, tutqich, sarlavha va yopish tugmasi.
// Tanlov ro'yxati (OptionSheet) va sana g'ildiragi (BirthDateSheet) shuni ishlatadi.
export default function BottomSheet({ visible, onClose, title, children }) {
  const { theme: t } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={s.overlay} />
      </TouchableWithoutFeedback>

      <View style={[s.sheet, { backgroundColor: t.card, borderColor: t.border }]}>
        <View style={s.grabberRow}>
          <View style={[s.grabber, { backgroundColor: t.border }]} />
        </View>
        <View style={s.sheetHeaderRow}>
          <Text style={[s.sheetTitle, { color: t.text }]}>{title}</Text>
          <TouchableOpacity
            style={[s.sheetCloseBtn, { backgroundColor: t.rowIconBg }]}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="close" size={16} color={t.muted} />
          </TouchableOpacity>
        </View>

        {children}
      </View>
    </Modal>
  );
}
