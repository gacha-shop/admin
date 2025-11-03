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

  const response = await fetch(`${EDGE_FUNCTION_URL}/functions/v1/admin-tags`, {
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
  return result.data;
}

/**
 * Create a new tag
 */
export async function createTag(dto: CreateTagDto): Promise<Tag> {
  const { data, error } = await supabase.functions.invoke('admin-tags', {
    body: dto,
    method: 'POST',
  });

  if (error) {
    throw new Error(error.message || 'Failed to create tag');
  }

  return data;
}

/**
 * Update an existing tag
 */
export async function updateTag(dto: UpdateTagDto): Promise<Tag> {
  const { data, error } = await supabase.functions.invoke('admin-tags', {
    body: dto,
    method: 'PUT',
  });

  if (error) {
    throw new Error(error.message || 'Failed to update tag');
  }

  return data;
}

/**
 * Delete a tag (soft delete)
 */
export async function deleteTag(id: string): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const response = await fetch(
    `${EDGE_FUNCTION_URL}/functions/v1/admin-tags?id=${id}`,
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
