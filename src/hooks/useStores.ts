import { useQuery } from '@tanstack/react-query';
import { fetchStores, fetchStoreById } from '@/services/store.api';
import type { StoreListParams } from '@/types/store';

/**
 * Hook to fetch list of stores
 */
export function useStores(params: StoreListParams = {}) {
  return useQuery({
    queryKey: ['stores', params],
    queryFn: () => fetchStores(params),
  });
}

/**
 * Hook to fetch a single store by ID
 */
export function useStore(id: string) {
  return useQuery({
    queryKey: ['store', id],
    queryFn: () => fetchStoreById(id),
    enabled: !!id,
  });
}
