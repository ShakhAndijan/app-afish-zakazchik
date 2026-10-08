import { useState } from 'react';
import { ScrollView, Share } from 'react-native';
import * as Linking from 'expo-linking';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { formatNumber } from '../utils/format';
import useOrderDetail from './orders/hooks/useOrderDetail';
import { STATUS_META, statusLabel, statusSubtext } from './orders/constants';
import OrderDetailHeader from './orders/components/OrderDetailHeader';
import StatusBanner from './orders/components/StatusBanner';
import OrderSummary from './orders/components/OrderSummary';
import SectionLabel from './orders/components/SectionLabel';
import MasterCard from './orders/components/MasterCard';
import CancelReasonCard from './orders/components/CancelReasonCard';
import PriceCard from './orders/components/PriceCard';
import PhotoGallery from './orders/components/PhotoGallery';
import { MasterNoteCard, CustomerReviewCard } from './orders/components/NoteCard';
import OrderActions from './orders/components/OrderActions';
import PromptModal from './requests/components/PromptModal';
import useOrderActions from './requests/hooks/useOrderActions';
import { isOpenOrder } from './requests/utils';

// Buyurtma tafsiloti. Backendda yo'q qiymatlar (usta reytingi, narx bo'linishi, izohlar)
// `extras` dan olinadi va "Namuna ma'lumot" belgisi bilan ko'rsatiladi.
export default function OrderDetailScreen({ order: listOrder, onBack, onSelectUsta, onReorder }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const { order, extras, refresh } = useOrderDetail(listOrder);
  const actions = useOrderActions(listOrder.id, refresh);
  const [cancelOpen, setCancelOpen] = useState(false);

  const [beforeIndex, setBeforeIndex] = useState(0);
  const [afterIndex, setAfterIndex] = useState(0);

  const meta = STATUS_META[order.status] || STATUS_META.active;
  const label = statusLabel(tr, order);
  const isCancelled = order.status === 'cancelled';
  const isDone = order.status === 'done';
  const title = order.task || order.service || tr('orderDetail.orderNumber', { id: order.id });

  const beforePhotos = order.beforePhotos;
  // Bekor qilingan buyurtmada ish bajarilmagani uchun "keyin" rasmlari bo'lmaydi.
  const afterPhotos = isCancelled ? [] : order.afterPhotos;

  const share = () => {
    const vars = { id: order.id, task: title, status: label };
    const message =
      order.price != null
        ? tr('orderDetail.shareMessage', { ...vars, price: formatNumber(Math.round(order.price)) })
        : tr('orderDetail.shareMessageNoPrice', vars);
    // Havola ilovaning o'zida shu buyurtma tafsilotini ochadi (faqat buyurtma egasi uchun).
    const link = Linking.createURL(`/order/${order.id}`);
    Share.share({ message: `${message}\n${link}` }).catch(() => {});
  };

  const openUstaProfile = () => {
    if (!order.workerId) return;
    onSelectUsta?.({
      id: order.workerId,
      initial: order.letter,
      name: order.master,
      trade: order.service,
      bgColor: order.color,
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top', 'left', 'right']}>
      <StatusBar style={t.isDark ? 'light' : 'dark'} />
      <OrderDetailHeader onBack={onBack} onShare={share} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 }}
      >
        <StatusBanner meta={meta} label={label} subtext={statusSubtext(tr, order)} order={order} />
        <OrderSummary order={order} title={title} />

        {/* Usta hali tayinlanmagan (kutilayotgan) buyurtmada bo'lim ko'rsatilmaydi */}
        {!!order.master && (
          <>
            <SectionLabel t={t} mock={extras.masterRating != null}>
              {tr('orderDetail.selectedMaster')}
            </SectionLabel>
            <MasterCard order={order} rating={extras.masterRating} onPress={openUstaProfile} t={t} />
          </>
        )}

        {isCancelled && !!order.cancelReason && (
          <>
            <SectionLabel t={t}>{tr('orderDetail.cancelReasonTitle')}</SectionLabel>
            <CancelReasonCard meta={meta} reason={order.cancelReason} />
          </>
        )}

        {/* Narx: materiallar / ish haqi bo'linishi namuna */}
        {!isCancelled && (
          <>
            <SectionLabel t={t} mock={extras.material != null}>
              {tr('orderDetail.priceTitle')}
            </SectionLabel>
            <PriceCard order={order} split={extras} t={t} />
          </>
        )}

        {beforePhotos.length > 0 && (
          <>
            <SectionLabel t={t}>{tr('orderDetail.beforePhotos', { n: beforePhotos.length })}</SectionLabel>
            <PhotoGallery photos={beforePhotos} index={beforeIndex} onIndexChange={setBeforeIndex} t={t} />
          </>
        )}

        {/* "Keyin" suratlari faqat bajarilgan buyurtmalarda bo'ladi */}
        {afterPhotos.length > 0 && (
          <>
            <SectionLabel t={t}>{tr('orderDetail.afterPhotos', { n: afterPhotos.length })}</SectionLabel>
            <PhotoGallery photos={afterPhotos} index={afterIndex} onIndexChange={setAfterIndex} t={t} />
          </>
        )}

        {/* Usta izohi — namuna */}
        {isDone && !!extras.masterNote && !!order.master && (
          <>
            <SectionLabel t={t} mock>
              {tr('orderDetail.masterNoteTitle')}
            </SectionLabel>
            <MasterNoteCard order={order} text={extras.masterNote} onPressMaster={openUstaProfile} t={t} />
          </>
        )}

        {/* Mijoz sharhi — namuna */}
        {isDone && !!extras.customerNote && (
          <>
            <SectionLabel t={t} mock>
              {tr('orderDetail.yourReviewTitle')}
            </SectionLabel>
            <CustomerReviewCard rating={extras.customerRating} text={extras.customerNote} t={t} />
          </>
        )}

        <OrderActions
          isOpen={isOpenOrder(order)}
          onCancel={() => setCancelOpen(true)}
          onReorder={() => onReorder?.(order)}
        />
      </ScrollView>

      <PromptModal
        visible={cancelOpen}
        title={tr('requests.cancelTitle')}
        placeholder={tr('requests.cancelReasonPlaceholder')}
        confirmLabel={tr('requests.cancelConfirm')}
        multiline
        destructive
        busy={actions.busy}
        onClose={() => setCancelOpen(false)}
        onSubmit={async (reason) => {
          if (await actions.cancel(reason)) setCancelOpen(false);
        }}
      />
    </SafeAreaView>
  );
}
