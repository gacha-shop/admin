import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchStores,
  fetchStoreById,
  createStore,
  updateStore,
  deleteStore,
} from "@/services/store.api";
import type { StoreListParams } from "@/types/store";

/**
 * Hook to fetch list of stores
 */
export function useStores(params: StoreListParams = {}) {
  return useQuery({
    queryKey: ["stores", params],
    queryFn: () => fetchStores(params),
    staleTime: 0, // Always consider data as stale to allow immediate refetch after mutations
  });
}

/**
 * Hook to fetch a single store by ID
 */
export function useStore(id: string) {
  return useQuery({
    queryKey: ["store", id],
    queryFn: () => fetchStoreById(id),
    enabled: !!id,
    staleTime: 0, // Always consider data as stale to allow immediate refetch after mutations
  });
}

/**
 * Hook to create a new store
 */
export function useCreateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createStore,
    onSuccess: () => {
      // Invalidate and refetch stores list (partial match, active queries only)
      queryClient.invalidateQueries({
        queryKey: ["stores"],
        exact: false, // Allow partial match (matches ['stores', params])
        refetchType: "active", // Only refetch currently mounted queries
      });
    },
  });
}

/**
 * Hook to update an existing store
 */
export function useUpdateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateStore,
    onSuccess: (data) => {
      // Invalidate the specific store query
      queryClient.invalidateQueries({
        queryKey: ["store", data.id],
      });
      // Invalidate and refetch stores list (partial match, active queries only)
      queryClient.invalidateQueries({
        queryKey: ["stores"],
        exact: false, // Allow partial match (matches ['stores', params])
        refetchType: "active", // Only refetch currently mounted queries
      });
    },
  });
}

/**
 * Hook to delete a store (soft delete)
 */
export function useDeleteStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteStore,
    onSuccess: () => {
      // Invalidate and refetch stores list (partial match, active queries only)
      queryClient.invalidateQueries({
        queryKey: ["stores"],
        exact: false, // Allow partial match (matches ['stores', params])
        refetchType: "active", // Only refetch currently mounted queries
      });
    },
  });
}
