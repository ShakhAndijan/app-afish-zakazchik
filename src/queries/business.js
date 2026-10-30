import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addMember,
  applyBusiness,
  createPlan,
  createSite,
  deletePlan,
  getBusiness,
  getStatement,
  leaveBusiness,
  removeMember,
  setPlanActive,
  setSiteActive,
  updateBusiness,
  updateMember,
  updatePlan,
  updateSite,
} from '../api/business';

export const BUSINESS_KEY = ['business', 'me'];

/** Kompaniya, obyektlar, rejalar, xodimlar. `organization` null — hali ariza yubormagan. */
export function useBusiness(enabled = true) {
  return useQuery({ queryKey: BUSINESS_KEY, queryFn: getBusiness, enabled, staleTime: 60 * 1000 });
}

// Barcha o'zgartiruvchi so'rovlar yangilangan holatni qaytaradi — keshga to'g'ridan-to'g'ri yoziladi.
function useBusinessMutation(mutationFn) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (data) => queryClient.setQueryData(BUSINESS_KEY, data),
  });
}

export const useApplyBusiness = () => useBusinessMutation(applyBusiness);
export const useUpdateBusiness = () => useBusinessMutation(updateBusiness);
export const useCreateSite = () => useBusinessMutation(createSite);
export const useUpdateSite = () => useBusinessMutation(({ id, form }) => updateSite(id, form));
export const useSetSiteActive = () =>
  useBusinessMutation(({ id, isActive }) => setSiteActive(id, isActive));
export const useCreatePlan = () => useBusinessMutation(createPlan);
export const useUpdatePlan = () => useBusinessMutation(({ id, form }) => updatePlan(id, form));
export const useSetPlanActive = () =>
  useBusinessMutation(({ id, isActive }) => setPlanActive(id, isActive));
export const useDeletePlan = () => useBusinessMutation(deletePlan);
export const useAddMember = () => useBusinessMutation(addMember);
export const useUpdateMember = () => useBusinessMutation(({ id, role }) => updateMember(id, role));
export const useRemoveMember = () => useBusinessMutation(removeMember);
export const useLeaveBusiness = () => useBusinessMutation(leaveBusiness);

/** Oylik hisobot; `period` — "YYYY-MM". */
export function useStatement(period, enabled = true) {
  return useQuery({
    queryKey: ['business', 'statement', period],
    queryFn: () => getStatement(period),
    enabled,
    staleTime: 60 * 1000,
  });
}
