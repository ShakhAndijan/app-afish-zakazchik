import { Fragment, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
  ActivityIndicator,
  LayoutAnimation,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import getReviewTexts from '../reviewTexts';
import { common } from '../styles';
import SummaryRow from './SummaryRow';
import { formatPhone } from '../utils';

export default function ReviewModal({
  visible,
  onClose,
  onConfirm,
  submitting,
  t,
  tr,
  orderWorker,
  selectedCategories,
  addressTitle,
  addressSubtitle,
  street,
  entrance,
  floor,
  when,
  whenDate,
  description,
  photos,
  toolsOption,
  workerCount,
  requirePhoto,
  minRating,
  ageFrom,
  ageTo,
  pricingType,
  hourlyRate,
  estimatedHours,
  fixedPrice,
  paymentMethod,
  phone,
  backupPhone,
}) {
  // "Qo'shimcha ma'lumotlar" yopiq turadi, bosilganda ochiladi.
  const [extraOpen, setExtraOpen] = useState(false);
  // Oyna yopilganda blok qayta yig'iladi.
  const handleClose = () => {
    setExtraOpen(false);
    onClose();
  };
  const toggleExtra = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExtraOpen((v) => !v);
  };

  const { notSet, whenText, toolsText, ratingText, ageText, pricingText, addressText } =
    getReviewTexts(
      {
        when,
        whenDate,
        toolsOption,
        minRating,
        ageFrom,
        ageTo,
        pricingType,
        hourlyRate,
        estimatedHours,
        fixedPrice,
        paymentMethod,
        street,
        entrance,
        floor,
        addressTitle,
        addressSubtitle,
      },
      tr
    );

  const rows = [
    !!orderWorker && {
      icon: 'account-star-outline',
      label: tr('newOrder.targetWorkerLabel'),
      value: [orderWorker.name, orderWorker.trade].filter(Boolean).join(' — '),
    },
    {
      icon: 'briefcase-outline',
      label: tr('newOrder.categoryLabel'),
      value: selectedCategories.map((c) => c.name).join(', ') || notSet,
    },
    {
      icon: 'text-long',
      label: tr('newOrder.descriptionLabel'),
      value: description.trim() || notSet,
    },
    {
      icon: 'image-multiple-outline',
      label: tr('newOrder.photosLabel'),
      value: tr('newOrder.review.photosCount', { n: photos.length }),
    },
    { icon: 'map-marker-outline', label: tr('newOrder.locationLabel'), value: addressText },
    { icon: 'calendar-clock', label: tr('newOrder.whenLabel'), value: whenText },
    { icon: 'cash-multiple', label: tr('newOrder.pricingLabel'), value: pricingText },
    {
      icon: 'phone-outline',
      label: tr('newOrder.phoneLabel'),
      value: `+998 ${formatPhone(phone)}`,
    },
  ].filter(Boolean);

  // Ixtiyoriy maydonlar: formadagi "Qo'shimcha ma'lumotlar" bloki
  const extraRows = [
    { icon: 'toolbox-outline', label: tr('newOrder.toolsLabel'), value: toolsText },
    {
      icon: 'account-group-outline',
      label: tr('newOrder.workerCountLabel'),
      value: String(workerCount),
    },
    {
      icon: 'shield-check-outline',
      label: tr('newOrder.requirements.photoRequired'),
      value: requirePhoto ? tr('common.yes') : tr('common.no'),
    },
    { icon: 'star-outline', label: tr('newOrder.requirements.ratingLabel'), value: ratingText },
    { icon: 'account-outline', label: tr('newOrder.requirements.ageLabel'), value: ageText },
    !!backupPhone.trim() && {
      icon: 'phone-plus-outline',
      label: tr('newOrder.backupPhoneLabel'),
      value: `+998 ${formatPhone(backupPhone)}`,
    },
  ].filter(Boolean);

  const renderRows = (list) =>
    list.map((row, i) => (
      <Fragment key={row.icon}>
        {i > 0 && <View style={[common.requirementDivider, { backgroundColor: t.border }]} />}
        <SummaryRow icon={row.icon} label={row.label} value={row.value} t={t} />
      </Fragment>
    ));

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top', 'left', 'right']}>
        <View style={s.reviewHeader}>
          <TouchableOpacity
            onPress={handleClose}
            activeOpacity={0.85}
            style={[common.mapBackBtn, { backgroundColor: t.card }]}
          >
            <MaterialCommunityIcons name="arrow-left" size={20} color={t.text} />
          </TouchableOpacity>
          <Text style={[s.reviewHeaderTitle, { color: t.text }]}>
            {tr('newOrder.review.title')}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[common.requirementsBox, { backgroundColor: t.card, borderColor: t.border }]}
          >
            {renderRows(rows)}
          </View>

          <TouchableOpacity
            onPress={toggleExtra}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityState={{ expanded: extraOpen }}
            style={[s.extraHeader, { backgroundColor: t.card, borderColor: t.border }]}
          >
            <MaterialCommunityIcons name="tune-variant" size={18} color={t.orange} />
            <Text style={[s.extraTitle, { color: t.text }]}>{tr('newOrder.extraTitle')}</Text>
            <MaterialCommunityIcons
              name={extraOpen ? 'chevron-up' : 'chevron-down'}
              size={22}
              color={t.faint}
            />
          </TouchableOpacity>
          {extraOpen && (
            <View
              style={[
                common.requirementsBox,
                { backgroundColor: t.card, borderColor: t.border, marginTop: 10 },
              ]}
            >
              {renderRows(extraRows)}
            </View>
          )}
        </ScrollView>

        <View style={[s.reviewFooter, { backgroundColor: t.bg, borderTopColor: t.border }]}>
          <TouchableOpacity
            onPress={handleClose}
            activeOpacity={0.85}
            disabled={submitting}
            style={[
              s.reviewEditBtn,
              { borderColor: t.border, backgroundColor: t.card },
              submitting && { opacity: 0.5 },
            ]}
          >
            <MaterialCommunityIcons name="pencil-outline" size={16} color={t.text} />
            <Text style={[s.reviewEditTxt, { color: t.text }]}>{tr('common.edit')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onConfirm}
            activeOpacity={0.85}
            disabled={submitting}
            style={[common.cta, { backgroundColor: t.orange, flex: 1, marginTop: 0 }]}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Text style={[common.ctaTxt, { color: '#fff' }]}>{tr('common.confirm')}</Text>
                <MaterialCommunityIcons name="check" size={18} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const s = StyleSheet.create({
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  reviewHeaderTitle: { fontSize: 16, fontWeight: '700' },
  extraHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 14,
  },
  extraTitle: { flex: 1, fontSize: 14.5, fontWeight: '800' },
  reviewFooter: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
  },
  reviewEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderRadius: 15,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  reviewEditTxt: { fontSize: 14, fontWeight: '700' },
});
