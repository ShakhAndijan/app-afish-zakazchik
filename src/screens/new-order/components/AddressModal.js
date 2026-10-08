import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  KeyboardProvider,
  KeyboardStickyView,
  useKeyboardState,
} from 'react-native-keyboard-controller';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import LocationMapPicker from '../../../components/LocationMapPicker';
import { common } from '../styles';
import SelectField from './SelectField';
import OptionSheet from './OptionSheet';
import useAddressMapSync from '../hooks/useAddressMapSync';

function AddressModalContent({
  visible,
  onClose,
  regions,
  regionId,
  onSelectRegion,
  districts,
  districtId,
  onSelectDistrict,
  street,
  onStreetChange,
  entrance,
  onEntranceChange,
  floor,
  onFloorChange,
  gpsLat,
  gpsLng,
  onMapChange,
  t,
  tr,
  // Ixtiyoriy: "Mening manzillarim" ekrani uchun.
  title,
  header,
  onSave,
  hideUnitFields,
}) {
  const { height: screenH } = useWindowDimensions();
  const [regionSheetOpen, setRegionSheetOpen] = useState(false);
  const [districtSheetOpen, setDistrictSheetOpen] = useState(false);
  const [sheetCollapsed, setSheetCollapsed] = useState(false);
  const [sheetH, setSheetH] = useState(0);
  // Telefonning pastki tizim tugmalari (orqaga / uy) paneldagi tugmani yopib qo'ymasligi uchun.
  const bottomInset = useSafeAreaInsets().bottom;
  const kbVisible = useKeyboardState((st) => st.isVisible);
  const kbHeight = useKeyboardState((st) => st.height);
  // Klaviatura ochiq bo'lganda panel ko'tarilgani uchun maydonlar ro'yxati qisqartiriladi.
  const sheetMaxH = kbVisible ? Math.max(120, screenH - kbHeight - 250) : screenH * 0.46;
  // "Hozirgi joylashuv" tugmasi panel (va klaviatura) tepasida turadi.
  const controlsBottom =
    (sheetCollapsed ? 100 + bottomInset : sheetH + 12) + (kbVisible ? kbHeight : 0);

  // Xarita hali ko'rinib tursin deb panel va uning ichidagi maydonlar
  // to'liq xira emas, biroz shaffof — "bilinar-bilinmas" fon.
  const sheetBg = t.isDark ? 'rgba(10,20,34,0.88)' : 'rgba(238,242,247,0.9)';
  const fieldBg = t.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.035)';

  const selectedRegionName = regions.find((r) => r.id === regionId)?.name;
  const selectedDistrictName = districts.find((d) => d.id === districtId)?.name;

  const { panLat, panLng, panZoom, geocodeQuery, geocodeZoom, searchQuery, handleAddressResolved } =
    useAddressMapSync({
      regions,
      regionId,
      selectedRegionName,
      selectedDistrictName,
      street,
      onStreetChange,
    });

  return (
    <>
      <View style={{ flex: 1, backgroundColor: t.bg }}>
        {/* ── Butun ekranni egallagan xarita ── */}
        <LocationMapPicker
          lat={gpsLat}
          lng={gpsLng}
          onChange={onMapChange}
          fill
          controlsBottom={controlsBottom}
          showExpand={false}
          borderRadius={0}
          geocodeQuery={geocodeQuery}
          geocodeZoom={geocodeZoom}
          panLat={panLat}
          panLng={panLng}
          panZoom={panZoom}
          searchQuery={searchQuery}
          onAddressResolved={handleAddressResolved}
          showTapHint
          tapHint={tr('newOrder.mapTapHint')}
          locateLabel={tr('newOrder.mapLocateLabel')}
          locatingLabel={tr('newOrder.mapLocating')}
          permissionTitle={tr('newOrder.locationPermissionTitle')}
          permissionMessage={tr('newOrder.locationPermissionMsg')}
          errorTitle={tr('common.errorTitle')}
          errorMessage={tr('newOrder.locationError')}
        />

        {/* ── Xarita ustida suzuvchi sarlavha ── */}
        <SafeAreaView edges={['top']} style={s.mapTopBar} pointerEvents="box-none">
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.85}
            style={[common.mapBackBtn, { backgroundColor: t.card }]}
          >
            <MaterialCommunityIcons name="arrow-left" size={20} color={t.text} />
          </TouchableOpacity>
          <View style={[s.mapTitlePill, { backgroundColor: t.card }]}>
            <Text style={[s.mapTitlePillTxt, { color: t.text }]}>
              {title || tr('newOrder.addressModalTitle')}
            </Text>
          </View>
        </SafeAreaView>

        {/* ── Xaritaning pastki qismida suzuvchi maydonlar paneli ── */}
        {sheetCollapsed ? (
          <TouchableOpacity
            onPress={() => setSheetCollapsed(false)}
            activeOpacity={0.85}
            style={[s.reopenFab, { backgroundColor: t.orange, bottom: 54 + bottomInset }]}
          >
            <MaterialCommunityIcons name="chevron-up" size={15} color="#fff" />
            <Text style={s.reopenFabTxt}>{tr('newOrder.reopenLabel')}</Text>
          </TouchableOpacity>
        ) : (
          <KeyboardStickyView style={s.bottomSheetWrap}>
            <View
              onLayout={(e) => setSheetH(e.nativeEvent.layout.height)}
              style={[
                s.bottomSheet,
                {
                  backgroundColor: sheetBg,
                  borderColor: t.border,
                  // Klaviatura ochiq bo'lsa tizim tugmalari ostida emas, qo'shimcha bo'sh joy shart emas
                  paddingBottom: kbVisible ? 16 : Math.max(bottomInset, 12) + 16,
                },
              ]}
            >
              <View style={s.sheetHandleWrap}>
                <View style={[common.sheetHandle, { backgroundColor: t.border }]} />
              </View>

              <ScrollView
                style={{ maxHeight: sheetMaxH }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <Text style={[s.mapHint, { color: t.faint }]}>{tr('newOrder.mapHint')}</Text>

                <View style={{ gap: 14, marginTop: 10 }}>
                  {header}
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <View style={{ flex: 1 }}>
                      <SelectField
                        label={tr('newOrder.regionLabel')}
                        value={selectedRegionName}
                        placeholder={tr('newOrder.regionPlaceholder')}
                        onPress={() => setRegionSheetOpen(true)}
                        t={t}
                        bg={fieldBg}
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <SelectField
                        label={tr('newOrder.districtLabel')}
                        value={selectedDistrictName}
                        placeholder={
                          regionId
                            ? tr('newOrder.districtPlaceholder')
                            : tr('newOrder.regionPlaceholder')
                        }
                        onPress={() => setDistrictSheetOpen(true)}
                        t={t}
                        bg={fieldBg}
                        disabled={!regionId}
                      />
                    </View>
                  </View>

                  <TextInput
                    value={street}
                    onChangeText={onStreetChange}
                    placeholder={tr('newOrder.streetPlaceholder')}
                    placeholderTextColor={t.faint}
                    style={[
                      common.input,
                      { backgroundColor: fieldBg, borderColor: t.border, color: t.text },
                    ]}
                  />
                  {!hideUnitFields && (
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <TextInput
                        value={entrance}
                        onChangeText={onEntranceChange}
                        placeholder={tr('newOrder.entrancePlaceholder')}
                        placeholderTextColor={t.faint}
                        style={[
                          common.input,
                          {
                            flex: 1,
                            backgroundColor: fieldBg,
                            borderColor: t.border,
                            color: t.text,
                          },
                        ]}
                      />
                      <TextInput
                        value={floor}
                        onChangeText={onFloorChange}
                        placeholder={tr('newOrder.floorPlaceholder')}
                        placeholderTextColor={t.faint}
                        style={[
                          common.input,
                          {
                            flex: 1,
                            backgroundColor: fieldBg,
                            borderColor: t.border,
                            color: t.text,
                          },
                        ]}
                      />
                    </View>
                  )}

                  <View style={[s.noteBox, { backgroundColor: fieldBg, borderColor: t.border }]}>
                    <MaterialCommunityIcons name="shield-check-outline" size={16} color={t.muted} />
                    <Text style={[s.noteTxt, { color: t.muted }]}>
                      {tr('newOrder.addressAccuracyNote')}
                    </Text>
                  </View>
                </View>
              </ScrollView>

              <TouchableOpacity
                onPress={onSave || onClose}
                activeOpacity={0.85}
                style={[common.modalDoneBtn, { backgroundColor: t.orange, marginTop: 14 }]}
              >
                <Text style={common.modalDoneTxt}>{tr('newOrder.addressSaveBtn')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setSheetCollapsed(true)}
                activeOpacity={0.8}
                style={[s.collapseBtn, { backgroundColor: t.card, borderColor: t.border }]}
              >
                <MaterialCommunityIcons name="chevron-down" size={20} color={t.text} />
              </TouchableOpacity>
            </View>
          </KeyboardStickyView>
        )}
      </View>

      <OptionSheet
        visible={regionSheetOpen}
        onClose={() => setRegionSheetOpen(false)}
        title={tr('newOrder.regionLabel')}
        options={regions}
        selectedId={regionId}
        onSelect={onSelectRegion}
        t={t}
        tr={tr}
      />
      <OptionSheet
        visible={districtSheetOpen}
        onClose={() => setDistrictSheetOpen(false)}
        title={tr('newOrder.districtLabel')}
        options={districts}
        selectedId={districtId}
        onSelect={onSelectDistrict}
        t={t}
        tr={tr}
      />
    </>
  );
}

// Android'da Modal alohida oyna bo'lgani uchun klaviatura hodisalari uning ichida alohida
// KeyboardProvider orqali olinadi.
export default function AddressModal(props) {
  return (
    <Modal
      visible={props.visible}
      animationType="slide"
      onRequestClose={props.onClose}
      statusBarTranslucent
      navigationBarTranslucent
    >
      <SafeAreaProvider>
        <KeyboardProvider statusBarTranslucent navigationBarTranslucent>
          <AddressModalContent {...props} />
        </KeyboardProvider>
      </SafeAreaProvider>
    </Modal>
  );
}

const s = StyleSheet.create({
  mapTopBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  mapTitlePill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  mapTitlePillTxt: { fontSize: 14, fontWeight: '700' },
  reopenFab: {
    position: 'absolute',
    right: 10,
    bottom: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  reopenFabTxt: { color: '#fff', fontSize: 12.5, fontWeight: '600' },
  bottomSheetWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  bottomSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 18,
  },
  sheetHandleWrap: { paddingTop: 4, paddingBottom: 10, alignItems: 'center' },
  mapHint: {
    fontSize: 12,
    textAlign: 'center',
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  noteTxt: { flex: 1, fontSize: 12, lineHeight: 17 },
  collapseBtn: {
    position: 'absolute',
    top: 10,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
