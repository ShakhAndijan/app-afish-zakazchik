import { View, Text } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import LocationMapPicker from '../../../components/LocationMapPicker';
import { s } from '../styles';

// Xaritadan joylashuvni (GPS) tanlash maydoni.
export default function LocationField({ lat, lng, onChange }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();

  return (
    <View style={{ gap: 8 }}>
      <Text style={[s.fieldLabel, { color: t.muted }]}>{tr('editProfile.gpsLabel')}</Text>
      <View style={s.mapWrap}>
        <LocationMapPicker
          lat={lat}
          lng={lng}
          onChange={(la, ln) => onChange(Number(la), Number(ln))}
          height={180}
          locatingLabel={tr('editProfile.gpsLocating')}
          permissionTitle={tr('editProfile.locationPermissionTitle')}
          permissionMessage={tr('editProfile.locationPermissionMsg')}
          errorTitle={tr('common.errorTitle')}
          errorMessage={tr('editProfile.locationError')}
        />
      </View>
    </View>
  );
}
