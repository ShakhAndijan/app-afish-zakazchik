import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AddressModal from '../../new-order/components/AddressModal';
import useOrderLocation from '../../new-order/hooks/useOrderLocation';
import LabelPicker from './LabelPicker';

// Manzilni qo'shish/tahrirlash oynasi (xaritali AddressModal asosida).
// `mode`: 'primary' — asosiy manzil (turi va kirish/qavat maydonlarisiz),
//         'extra' — qo'shimcha manzil. `onSave(data)` Promise qaytarishi mumkin;
// muvaffaqiyatli bo'lsa, oynani yopish ota komponent zimmasida.
export default function AddressEditor({ mode, initial, onClose, onSave, t, tr }) {
  const isPrimary = mode === 'primary';
  const [label, setLabel] = useState(initial?.label ?? 'home');
  const [street, setStreet] = useState(initial?.street ?? '');
  const [entrance, setEntrance] = useState(initial?.entrance ?? '');
  const [floor, setFloor] = useState(initial?.floor ?? '');
  const [gpsLat, setGpsLat] = useState(initial?.lat ?? null);
  const [gpsLng, setGpsLng] = useState(initial?.lng ?? null);
  const [saving, setSaving] = useState(false);
  const loc = useOrderLocation();

  useEffect(() => {
    if (initial?.regionId) loc.presetLocation(initial.regionId, initial.districtId);
  }, []);

  const handleMapChange = (lat, lng) => {
    const nLat = Number(lat);
    const nLng = Number(lng);
    setGpsLat(nLat);
    setGpsLng(nLng);
    loc.autoSelectLocation(nLat, nLng);
  };

  // Ro'yxat hali yuklanmagan bo'lsa, avval saqlangan nomni ishlatamiz.
  const nameOf = (list, id, savedId, savedName) =>
    list.find((x) => x.id === id)?.name ?? (id != null && id === savedId ? savedName : '');

  const handleSave = async () => {
    if (saving) return;
    if (!loc.regionId && !loc.districtId && !street.trim() && gpsLat == null) {
      Alert.alert(tr('common.errorTitle'), tr('addresses.errorEmpty'));
      return;
    }
    setSaving(true);
    try {
      await onSave({
        id: initial?.id,
        label,
        regionId: loc.regionId,
        regionName: nameOf(loc.regions, loc.regionId, initial?.regionId, initial?.regionName),
        districtId: loc.districtId,
        districtName: nameOf(loc.districts, loc.districtId, initial?.districtId, initial?.districtName),
        street: street.trim(),
        entrance: isPrimary ? '' : entrance.trim(),
        floor: isPrimary ? '' : floor.trim(),
        lat: gpsLat,
        lng: gpsLng,
      });
    } catch (e) {
      Alert.alert(tr('common.errorTitle'), e?.message || tr('addresses.errorSave'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AddressModal
      visible
      onClose={onClose}
      onSave={handleSave}
      title={
        isPrimary
          ? tr('addresses.primaryTitle')
          : initial?.id
            ? tr('addresses.editTitle')
            : tr('addresses.newTitle')
      }
      header={!isPrimary && <LabelPicker value={label} onChange={setLabel} t={t} tr={tr} />}
      hideUnitFields={isPrimary}
      regions={loc.regions}
      regionId={loc.regionId}
      onSelectRegion={loc.setRegionId}
      districts={loc.districts}
      districtId={loc.districtId}
      onSelectDistrict={loc.setDistrictId}
      street={street}
      onStreetChange={setStreet}
      entrance={entrance}
      onEntranceChange={setEntrance}
      floor={floor}
      onFloorChange={setFloor}
      gpsLat={gpsLat}
      gpsLng={gpsLng}
      onMapChange={handleMapChange}
      t={t}
      tr={tr}
    />
  );
}
