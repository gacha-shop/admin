import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createTag, deleteTag, getTags, updateTag } from '@/services/tag.api';

/**
 * Hook to fetch list of tags
 */
export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: getTags,
    staleTime: 0, // Always consider data as stale to allow immediate refetch after mutations
  });
}

/**
 * Hook to create a new tag
 */
export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTag,
    onSuccess: () => {
      // Invalidate and refetch tags list (partial match, active queries only)
      queryClient.invalidateQueries({
        queryKey: ['tags'],
        exact: false, // Allow partial match (matches ['tags', params])
        refetchType: 'active', // Only refetch currently mounted queries
      });
    },
  });
}

/**
 * Hook to update an existing tag
 */
export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTag,
    onSuccess: () => {
      // Invalidate and refetch tags list (partial match, active queries only)
      queryClient.invalidateQueries({
        queryKey: ['tags'],
        exact: false, // Allow partial match (matches ['tags', params])
        refetchType: 'active', // Only refetch currently mounted queries
      });
    },
  });
}

/**
 * Hook to delete a tag (soft delete)
 */
export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTag,
    onSuccess: () => {
      // Invalidate and refetch tags list (partial match, active queries only)
      queryClient.invalidateQueries({
        queryKey: ['tags'],
        exact: false, // Allow partial match (matches ['tags', params])
        refetchType: 'active', // Only refetch currently mounted queries
      });
    },
  });
}
