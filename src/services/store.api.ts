import { supabase } from '@/lib/supabase';
import type { Store, StoreListParams, StoreListResponse } from '@/types/store';

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
    `${EDGE_FUNCTION_URL}/functions/v1/admin-list-shops?${queryParams.toString()}`,
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

  return response.json();
}

/**
 * Fetch a single store by ID
 */
export async function fetchStoreById(id: string): Promise<Store> {
  // Get auth token
  const { data: { session } } = await supabase.auth.getSession();

  const response = await fetch(
    `${EDGE_FUNCTION_URL}/functions/v1/admin-get-shop?id=${id}`,
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
  return result.data;
}
