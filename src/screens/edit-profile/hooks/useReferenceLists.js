import { useGenders, useRegions, useDistricts } from '../../../queries/reference';

const EMPTY = [];

// Tanlov ro'yxatlari backenddan: jinslar, viloyatlar va tanlangan viloyat tumanlari.
export default function useReferenceLists(regionId) {
  const genders = useGenders();
  const regions = useRegions();
  const districts = useDistricts(regionId);

  return {
    genders: genders.data ?? EMPTY,
    regions: regions.data ?? EMPTY,
    districts: districts.data ?? EMPTY,
    gendersLoading: genders.isPending,
    regionsLoading: regions.isPending,
    districtsLoading: districts.isLoading,
  };
}
