import { TKey, TRecord, TValue, TCallback } from './types';
import { isEmpty, isPushStateAvailable, updateURLQueryParam } from './utils';

/**
 * Initialize the hook with default params.
 * Automatic URL search params synchronization will happen only once on mount.
 * And take the value from URL search params as priority if it exists.
 */
export default class SyncURLSearchParams<TParams extends TRecord> {
  private callback?: TCallback<Partial<TParams>>;
  private readonly cache = new Map<keyof TParams, TValue>();

  constructor(defaultParams: TParams) {
    if (!isPushStateAvailable()) return;

    const searchParams = new URLSearchParams(window.location.search);

    Object.keys(defaultParams).forEach(key => {
      const searchParam = searchParams.get(key);
      if (!isEmpty(searchParam)) {
        this.cache.set(key, String(searchParam));
      } else if (!isEmpty(defaultParams[key])) {
        this.cache.set(key, String(defaultParams[key]));
      }
    });

    updateURLQueryParam(Object.fromEntries(this.cache) as TParams);
  }

  // Action handlers
  /**
   * Set callback once change event happens (after initialization), and every time newly set
   */
  setCallback(callback: TCallback<Partial<TParams>>) {
    this.callback = callback;
    callback(isPushStateAvailable(), Object.fromEntries(this.cache) as TParams);
  }

  /**
   * Get specific key from search params. Autosuggestion mapped to keys of the default params.
   */
  getParam(key: keyof TParams): TValue {
    return this.cache.get(key);
  }

  /**
   * Get a set of params.
   */
  getParams(...keys: Array<keyof TParams>): Record<TKey, string> {
    return keys.reduce((acc, key) => {
      acc[key] = String(this.cache.get(key));
      return acc;
    }, {} as Record<TKey, string>);
  }

  /**
   * Get all search params. The result contains all records with keys of the default params except those that were cleared.
   */
  getAllParams(): TParams {
    return Object.fromEntries(this.cache) as TParams;
  }

  /**
   * Set a specific key with a value. Empty values (empty string, null, undefined) will be cleared.
   */
  setParam(key: keyof TParams, value: TValue): boolean {
    if (!isPushStateAvailable()) {
      this.callback?.(false, { [key]: value } as TParams);
      return false;
    }

    if (isEmpty(value)) this.cache.delete(key);
    else this.cache.set(key, String(value));

    this.callback?.(true, { [key]: value } as TParams);
    updateURLQueryParam(Object.fromEntries(this.cache));
    return true;
  }

  /**
   * Set a set of records. Empty values (empty string, null, undefined) will be cleared.
   */
  setParams(newParams: Partial<TParams>): boolean {
    if (!isPushStateAvailable()) {
      this.callback?.(false, newParams);
      return false;
    }

    Object.entries(newParams).forEach(([key, value]) => {
      if (isEmpty(value)) this.cache.delete(key);
      else this.cache.set(key, String(value));
    });

    this.callback?.(true, newParams);
    updateURLQueryParam(Object.fromEntries(this.cache));
    return true;
  }

  /**
   * Clear specific key from search params. Same as `setParam` with empty value.
   */
  clearParam(key: keyof TParams): boolean {
    return this.setParam(key, undefined);
  }

  /**
   * Clear a set of keys from search params. Same as `setParams` with empty values.
   * > If input is empty, all params will be cleared
   */
  clearParams(...keys: Array<keyof TParams>): boolean {
    const _keys = keys.length ? keys : Array.from(this.cache.keys());
    const emptyParams = _keys.reduce((acc, key) => {
      acc[key] = undefined;
      return acc;
    }, {} as Partial<TParams>);
    return this.setParams(emptyParams);
  }
}

export * from './types';
