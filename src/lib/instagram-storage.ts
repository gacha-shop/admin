/**
 * Instagram credentials storage utility
 * Manages Instagram user ID and access token in localStorage
 */

export interface InstagramCredentials {
  user_id: string;
  access_token: string;
}

const STORAGE_KEY = 'instagram_credentials';

/**
 * Get Instagram credentials from localStorage
 * Falls back to environment variables if not found in localStorage
 */
export function getInstagramCredentials(): InstagramCredentials {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to parse Instagram credentials from localStorage:', error);
  }

  // Fallback to environment variables
  return {
    user_id: import.meta.env.VITE_INSTAGRAM_USER_ID || '',
    access_token: import.meta.env.VITE_INSTAGRAM_ACCESS_TOKEN || '',
  };
}

/**
 * Save Instagram credentials to localStorage
 */
export function saveInstagramCredentials(credentials: InstagramCredentials): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(credentials));
  } catch (error) {
    console.error('Failed to save Instagram credentials to localStorage:', error);
    throw error;
  }
}

/**
 * Clear Instagram credentials from localStorage
 * Call this on logout
 */
export function clearInstagramCredentials(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear Instagram credentials from localStorage:', error);
  }
}
