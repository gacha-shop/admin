import { supabase } from '@/lib/supabase';
import type { Store, StoreListParams, StoreListResponse } from '@/types/store';
import type { CreateStoreDto, UpdateStoreDto } from '@/features/store/types/store.types';

const EDGE_FUNCTION_URL = import.meta.env.VITE_SUPABASE_URL;

/**
 * Fetch list of stores with pagination and filtering
 */
export async function fetchStores(params: StoreListParams = {}): Promise<StoreListResponse> {
  const { page = 1, limit = 10, shop_type, verification_status, search } = params;

  // Build query parameters
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (shop_type) {
    queryParams.append('shop_type', shop_type);
  }

  if (verification_status) {
    queryParams.append('verification_status', verification_status);
  }

  if (search) {
    queryParams.append('search', search);
  }

  // Get auth token
  const { data: { session } } = await supabase.auth.getSession();

  const response = await fetch(
    `${EDGE_FUNCTION_URL}/functions/v1/admin-shops-list?${queryParams.toString()}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session?.access_token || ''}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch stores');
  }

  const result = await response.json();

  // Transform Edge Function response to match StoreListResponse type
  // Edge Function returns: { success, data: { data, total, page, limit, totalPages } }
  if (result.success && result.data) {
    return {
      data: result.data.data,
      pagination: {
        page: result.data.page,
        limit: result.data.limit,
        total: result.data.total,
        totalPages: result.data.totalPages,
      },
    };
  }

  throw new Error('Invalid response format');
}

/**
 * Fetch a single store by ID
 */
export async function fetchStoreById(id: string): Promise<Store> {
  // Get auth token
  const { data: { session } } = await supabase.auth.getSession();

  const response = await fetch(
    `${EDGE_FUNCTION_URL}/functions/v1/admin-shops-get?id=${id}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session?.access_token || ''}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch store');
  }

  const result = await response.json();

  // Edge Function returns: { success, data: Shop }
  if (result.success && result.data) {
    return result.data;
  }

  throw new Error('Invalid response format');
}

/**
 * Create a new store
 */
export async function createStore(dto: CreateStoreDto): Promise<Store> {
  const { data, error } = await supabase.functions.invoke('admin-shops-create', {
    body: dto,
  });

  if (error) {
    throw new Error(error.message || 'Failed to create store');
  }

  // Edge Function returns: { success, data: Shop }
  if (data?.success && data?.data) {
    return data.data;
  }

  throw new Error('Invalid response format');
}

/**
 * Update an existing store
 */
export async function updateStore(dto: UpdateStoreDto): Promise<Store> {
  const { id, ...updateData } = dto;

  const { data: { session } } = await supabase.auth.getSession();

  const response = await fetch(
    `${EDGE_FUNCTION_URL}/functions/v1/admin-shops-update?id=${id}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${session?.access_token || ''}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update store');
  }

  const result = await response.json();

  // Edge Function returns: { success, data: Shop }
  if (result.success && result.data) {
    return result.data;
  }

  throw new Error('Invalid response format');
}

/**
 * Delete a store (soft delete)
 */
export async function deleteStore(id: string): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();

  const response = await fetch(
    `${EDGE_FUNCTION_URL}/functions/v1/admin-shops-delete?id=${id}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session?.access_token || ''}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete store');
  }
}
