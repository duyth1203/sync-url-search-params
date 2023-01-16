import { TKey, TRecord, TValue, TOptions, TCallback } from './types';
import { isEmpty, isPushStateAvailable, updateURLQueryParam } from './utils';

/**
 * Initialize the hook with default params.
 * Automatic URL search params synchronization will happen only once on mount.
 * And take the value from URL search params as priority if it exists.
 */
export default class SyncURLSearchParams<TParams extends TRecord> {
  private readonly options: TOptions = {};
  private callback?: TCallback<Partial<TParams>>;
  private readonly cache = new Map<keyof TParams, TValue>();

  constructor(defaultParams: TParams, options: TOptions = {}) {
    if (!isPushStateAvailable()) return;

    this.options = options;
    const searchParams = new URLSearchParams(window.location.search);

    Object.keys(defaultParams).forEach(key => {
      const searchParam = searchParams.get(key);
      if (!isEmpty(searchParam)) {
        this.cache.set(key, String(searchParam));
      } else if (!isEmpty(defaultParams[key])) {
        this.cache.set(key, String(defaultParams[key]));
      }
    });

    updateURLQueryParam(
      this.getAllParams(),
      options.shouldKeepURLUndeclaredParams
    );
  }

  // Action handlers
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
   * Set callback that invokes once change event happens (after initialization), and every time newly set if opt in.
   */
  setCallback(
    callback: TCallback<Partial<TParams>>,
    shouldInvokeCallbackWhenSet?: boolean
  ) {
    this.callback = callback;
    if (shouldInvokeCallbackWhenSet) {
      callback(isPushStateAvailable(), this.getAllParams());
    }
  }

  /**
   * Set a specific key with a value. Empty values (empty string, null, undefined) will be cleared.
   */
  setParam(key: keyof TParams, value: TValue, options: TOptions = {}): boolean {
    if (!isPushStateAvailable()) {
      this.callback?.(false, this.getAllParams());
      return false;
    }

    if (isEmpty(value)) this.cache.set(key, '');
    else this.cache.set(key, String(value));

    const mergedOptions = { ...this.options, ...options };
    updateURLQueryParam(
      this.getAllParams(),
      mergedOptions.shouldKeepURLUndeclaredParams
    );

    this.callback?.(true, {
      ...this.getAllParams(),
      [key]: isEmpty(value) ? '' : value,
    });

    return true;
  }

  /**
   * Set a set of records. Empty values (empty string, null, undefined) will be cleared.
   */
  setParams(newParams: Partial<TParams>, options: TOptions = {}): boolean {
    if (!isPushStateAvailable()) {
      this.callback?.(false, this.getAllParams());
      return false;
    }

    Object.entries(newParams).forEach(([key, value]) => {
      if (isEmpty(value)) this.cache.set(key, '');
      else this.cache.set(key, String(value));
    });

    this.callback?.(true, { ...newParams, ...this.getAllParams() });

    const mergedOptions = { ...this.options, ...options };
    updateURLQueryParam(
      this.getAllParams(),
      mergedOptions.shouldKeepURLUndeclaredParams
    );

    return true;
  }

  /**
   * Clear specific key from search params. Same as `setParam` with empty value.
   */
  clearParam(key: keyof TParams, options: TOptions = {}): boolean {
    return this.setParam(key, undefined, options);
  }

  /**
   * Clear a set of keys from search params. Same as `setParams` with empty values.
   * > If input is empty, all params will be cleared
   */
  clearParams(keys?: Array<keyof TParams>, options: TOptions = {}): boolean {
    const _keys = keys?.length ? keys : Array.from(this.cache.keys());
    const emptyParams = _keys.reduce((acc, key) => {
      acc[key] = undefined;
      return acc;
    }, {} as Partial<TParams>);

    return this.setParams(emptyParams, options);
  }
}

export * from './types';
