import { useRuntimeConfig } from '#app';
import { $fetch, type FetchOptions } from 'ofetch';

export function useApiFetch<T = any>(endpoint: string, options: FetchOptions<'json'> = {}) {
  const config = useRuntimeConfig();
  const baseUrl = config.public.pgsBaseAPI;
  
  return $fetch<T>(`${baseUrl}${endpoint}`, options);
}
