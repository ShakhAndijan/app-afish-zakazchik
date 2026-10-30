import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createComplaint,
  getComplaintOptions,
  getMyComplaints,
  getWorkerComplaints,
  withdrawComplaint,
} from '../api/complaints';

const MINE_KEY = ['complaints', 'mine'];

/** Ustaning e'lon qilingan shikoyatlari (profilda ko'rsatiladi). */
export function useWorkerComplaints(workerId) {
  return useQuery({
    queryKey: ['complaints', 'worker', workerId],
    queryFn: () => getWorkerComplaints(workerId),
    enabled: !!workerId,
    staleTime: 5 * 60 * 1000,
  });
}

/** Shikoyat oynasi ochilganda: shu usta bilan buyurtmalar (har safar yangidan olinadi). */
export function useComplaintOptions(workerId, enabled) {
  return useQuery({
    queryKey: ['complaints', 'options', workerId],
    queryFn: () => getComplaintOptions(workerId),
    enabled: !!workerId && enabled,
    staleTime: 0,
    gcTime: 0,
  });
}

export function useMyComplaints() {
  return useQuery({ queryKey: MINE_KEY, queryFn: () => getMyComplaints() });
}

export function useCreateComplaint(workerId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => createComplaint(workerId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MINE_KEY });
      queryClient.invalidateQueries({ queryKey: ['complaints', 'options', workerId] });
    },
  });
}

export function useWithdrawComplaint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: withdrawComplaint,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MINE_KEY });
      queryClient.invalidateQueries({ queryKey: ['complaints', 'worker'] });
      queryClient.invalidateQueries({ queryKey: ['complaints', 'options'] });
    },
  });
}
