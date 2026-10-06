// Tasdiqlash oynasidagi qiymatlarning ko'rinadigan matnlari.

import { formatMoney, formatWhenDate } from './utils';

export default function getReviewTexts(
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
) {
  const notSet = tr('newOrder.review.notSet');

  const whenText =
    when === 'urgent'
      ? tr('newOrder.when.urgent')
      : when === 'today'
        ? tr('newOrder.when.today')
        : when === 'date'
          ? whenDate
            ? formatWhenDate(whenDate)
            : tr('newOrder.when.date')
          : when === 'flexible'
            ? tr('newOrder.when.flexible')
            : notSet;

  const toolsText =
    toolsOption === 'has'
      ? tr('newOrder.tools.has')
      : toolsOption === 'needed'
        ? tr('newOrder.tools.needed')
        : notSet;

  const ratingText = minRating === 0 ? tr('newOrder.requirements.allRatings') : `${minRating}+ ★`;

  const ageText =
    ageFrom.trim() || ageTo.trim() ? `${ageFrom.trim() || '…'} – ${ageTo.trim() || '…'}` : notSet;

  const som = tr('common.currencySom');
  const pricingText =
    pricingType === 'hourly'
      ? hourlyRate.trim() || estimatedHours.trim()
        ? `${formatMoney(hourlyRate.trim()) || '—'} ${som} × ${estimatedHours.trim() || '—'} ${tr('newOrder.pricing.hoursPlaceholder').toLowerCase()}`
        : notSet
      : fixedPrice.trim()
        ? `${formatMoney(fixedPrice.trim())} ${som}`
        : notSet;

  const paymentText =
    paymentMethod === 'cash' ? tr('newOrder.payment.cash') : tr('newOrder.payment.cashless');

  const addressDetails = [street, entrance, floor].filter((v) => v && v.trim()).join(', ');
  const addressText =
    [addressTitle, addressSubtitle || addressDetails].filter(Boolean).join(' — ') || notSet;

  return { notSet, whenText, toolsText, ratingText, ageText, pricingText, paymentText, addressText };
}
