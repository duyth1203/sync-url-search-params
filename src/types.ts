export type TKey = string | number | symbol;
export type TValue = string | number | boolean | null | undefined;
export type TRecord = Record<TKey, TValue>;
export type TCallback<T> = (result: boolean, params: T) => void;
