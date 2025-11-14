import { supabase } from '@/lib/supabase';
import type { Tag } from '@/types/tag';

const EDGE_FUNCTION_URL = import.meta.env.VITE_SUPABASE_URL;

export interface CreateTagDto {
  name: string;
  description?: string;
}

export interface UpdateTagDto {
  id: string;
  name?: string;
  description?: string;
}

/**
 * Fetch list of tags
 */
export async function getTags(): Promise<Tag[]> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const response = await fetch(`${EDGE_FUNCTION_URL}/functions/v1/admin-tags-list`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${session?.access_token || ''}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch tags');
  }

  const result = await response.json();

  // Edge Function returns: { success, data: Tag[] }
  if (result.success && result.data) {
    return result.data;
  }

  throw new Error('Invalid response format');
}

/**
 * Create a new tag
 */
export async function createTag(dto: CreateTagDto): Promise<Tag> {
  const { data, error } = await supabase.functions.invoke('admin-tags-create', {
    body: dto,
  });

  if (error) {
    throw new Error(error.message || 'Failed to create tag');
  }

  // Edge Function returns: { success, data: Tag }
  if (data?.success && data?.data) {
    return data.data;
  }

  throw new Error('Invalid response format');
}

/**
 * Update an existing tag
 */
export async function updateTag(dto: UpdateTagDto): Promise<Tag> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const response = await fetch(
    `${EDGE_FUNCTION_URL}/functions/v1/admin-tags-update?id=${dto.id}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${session?.access_token || ''}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: dto.name,
        description: dto.description,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update tag');
  }

  const result = await response.json();

  // Edge Function returns: { success, data: Tag }
  if (result.success && result.data) {
    return result.data;
  }

  throw new Error('Invalid response format');
}

/**
 * Delete a tag (soft delete)
 */
export async function deleteTag(id: string): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const response = await fetch(
    `${EDGE_FUNCTION_URL}/functions/v1/admin-tags-delete?id=${id}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${session?.access_token || ''}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete tag');
  }
}
