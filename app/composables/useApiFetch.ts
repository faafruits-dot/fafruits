/**
 * useApiFetch — fetcher موحّد للـ API
 * - على السيرفر: useRequestFetch (يمرر الكوكيز + بدون localhost)
 * - على العميل: $fetch عادي
 */
export const useApiFetch = () => {
  return import.meta.server ? useRequestFetch() : $fetch
}