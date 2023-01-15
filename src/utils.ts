import { TKey, TRecord } from './types';

export function isEmpty(value: any): boolean {
  return value === '' || value === null || value === undefined;
}

function stringifyParams(
  prevCacheKeys: Array<TKey>,
  params: TRecord,
  shouldKeepURLUndeclaredParams?: boolean
): string {
  const searchParams = new URLSearchParams();

  if (shouldKeepURLUndeclaredParams) {
    window.location.search
      .replace('?', '')
      .split('&')
      .map(param => param.split('='))
      .filter(([key, value]) => !isEmpty(value) && !prevCacheKeys.includes(key))
      .forEach(([key, value]) => searchParams.set(key, value));
  }

  Object.entries(params).forEach(([key, value]) => {
    searchParams.set(key, String(value));
  });

  return searchParams.toString();
}

export function updateURLQueryParam(
  prevCacheKeys: Array<TKey>,
  params: TRecord,
  shouldKeepURLUndeclaredParams?: boolean
): void {
  const stringifiedParams = stringifyParams(
    prevCacheKeys,
    params,
    shouldKeepURLUndeclaredParams
  );
  const newUrl =
    window.location.origin + window.location.pathname + '?' + stringifiedParams;
  window.history.pushState({ path: newUrl }, '', newUrl);
}

export function isPushStateAvailable(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.history.pushState === 'function'
  );
}
