import { Text } from 'react-native';
import Feather from '@expo/vector-icons/Feather';

// Yo'nalish belgisi: backenddagi emoji, bo'lmasa standart asbob ikonkasi.
export default function CategoryGlyph({ glyph, color, size = 22 }) {
  return glyph ? (
    <Text style={{ fontSize: size }}>{glyph}</Text>
  ) : (
    <Feather name="tool" size={size - 2} color={color} />
  );
}
