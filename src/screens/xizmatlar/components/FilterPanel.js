import { View, Text, TouchableOpacity } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { useLanguage } from '../../../context/LanguageContext';
import { useXizmatlarStyles } from '../styles';
import { EXP_OPTIONS, PRICE_OPTIONS, RATING_OPTIONS } from '../constants';

// Filtr paneli. Reyting va hudud filtrlari faqat yo'nalish ichida (`inCategory`) ko'rinadi.
export default function FilterPanel({ filters, inCategory }) {
  const { t: tr } = useLanguage();
  const { t, styles } = useXizmatlarStyles();
  const {
    sort, setSort, minExp, setMinExp, minRating, setMinRating,
    region, district, selectedRegion, selectedDistrict, setPickerFor,
    certifiedOnly, setCertifiedOnly, reset,
  } = filters;

  return (
    <View style={styles.filterPanel}>
      <Text style={styles.filterSectionLabel}>{tr('xizmatlar.filters.price')}</Text>
      <View style={styles.chipRow}>
        {PRICE_OPTIONS.map((p) => (
          <TouchableOpacity
            key={p.key}
            style={[styles.chipPill, sort === p.key && styles.chipPillActive]}
            onPress={() => setSort(sort === p.key ? null : p.key)}
          >
            <Text style={[styles.chipPillLabel, sort === p.key && styles.chipPillLabelActive]}>
              {tr(`xizmatlar.filters.${p.labelKey}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.filterSectionLabel}>{tr('xizmatlar.filters.experience')}</Text>
      <View style={styles.chipRow}>
        {EXP_OPTIONS.map((e) => (
          <TouchableOpacity
            key={e}
            style={[styles.chipPill, minExp === e && styles.chipPillActive]}
            onPress={() => setMinExp(minExp === e ? null : e)}
          >
            <Text style={[styles.chipPillLabel, minExp === e && styles.chipPillLabelActive]}>
              {tr('xizmatlar.filters.expYears', { n: e })}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {inCategory && (
        <>
          <Text style={styles.filterSectionLabel}>{tr('xizmatlar.filters.rating')}</Text>
          <View style={styles.chipRow}>
            {RATING_OPTIONS.map((r) => (
              <TouchableOpacity
                key={r.key}
                style={[styles.chipPill, minRating === r.key && styles.chipPillActive]}
                onPress={() => setMinRating(minRating === r.key ? null : r.key)}
              >
                <Text style={[styles.chipPillLabel, minRating === r.key && styles.chipPillLabelActive]}>
                  ★ {r.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.filterSectionLabel}>{tr('xizmatlar.filters.region')}</Text>
          <View style={{ gap: 8, marginBottom: 12 }}>
            <TouchableOpacity style={styles.selectRow} onPress={() => setPickerFor('region')} activeOpacity={0.8}>
              <Feather name="map-pin" size={14} color={t.muted} />
              <Text style={[styles.selectRowText, region && styles.selectRowTextActive]}>
                {selectedRegion ? selectedRegion.name : tr('xizmatlar.filters.regionSelect')}
              </Text>
              <Feather name="chevron-down" size={16} color={t.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.selectRow, !region && styles.selectRowDisabled]}
              onPress={() => region && setPickerFor('district')}
              activeOpacity={0.8}
              disabled={!region}
            >
              <Feather name="map" size={14} color={t.muted} />
              <Text style={[styles.selectRowText, district && styles.selectRowTextActive]}>
                {selectedDistrict?.name || tr('xizmatlar.filters.district')}
              </Text>
              <Feather name="chevron-down" size={16} color={t.muted} />
            </TouchableOpacity>
          </View>
        </>
      )}

      <TouchableOpacity
        style={[styles.certRow, certifiedOnly && styles.certRowActive]}
        onPress={() => setCertifiedOnly((v) => !v)}
      >
        <Text style={{ fontSize: 15 }}>🏅</Text>
        <Text style={[styles.certLabel, certifiedOnly && styles.certLabelActive]}>
          {tr('xizmatlar.filters.certifiedOnly')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={reset} style={{ marginTop: 8 }}>
        <Text style={styles.resetLink}>{tr('xizmatlar.filters.reset')}</Text>
      </TouchableOpacity>
    </View>
  );
}
