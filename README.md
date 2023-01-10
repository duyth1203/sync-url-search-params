# sync-url-search-params

> Sync URL search params

## Purposes

- Initialize the URL query params with default ones
- Update query params on demand

---

## Installation

- Using `npm`

```Bash
npm install --save sync-url-search-params
```

- Using `yarn`

```Bash
yarn add sync-url-search-params
```

---

## Usage examples (using React)

### Won't trigger re-render

```TSX
import SyncURLSearchParams from 'sync-url-search-params'

const susp = new SyncURLSearchParams({ foo: 'bar' })
// Or
const foo = new SyncURLSearchParams(window.location.search).get('foo')

function App() {
  console.count('render count');
  return (
    <>
      <pre>param `foo`: {susp.getParam('foo')}</pre>
      <pre>location.search: {window.location.search}</pre>
      <pre>state: {JSON.stringify(state)}</pre>
      <pre>cache: {JSON.stringify(susp.getAllParams())}</pre>

      <button onClick={() => susp.setParam('foo', 'baz')}>Change bar to baz</button>
      <br/>
      <button onClick={() => susp.clearParam('foo')}>Clear query param</button>
    </>
  )
}
```

### Will trigger re-render (pending)

---

## APIs

1. `SyncURLSearchParams(defaultParams: { [x: string | number | symbol]: string | number | boolean | null | undefined }) => ({ getParam, getAllParams, setParam, setParams, clearParam, clearParams, setCallback })`

   Initial the hook with default params. Automatic URL query params synchronization will happen only once on mount. And take the value from URL search params as priority if it exists.

2. `getParam: (key: string) => string`

   Get specific key from query params. Autosuggestion mapped to keys of the default params.

3. `getParams: (...keys: string[]) => Object<string, string>`

   Get a set of params.

4. `getAllParams: () => Object`

   Get all query params. The result contains all records with keys of the default params except those that were cleared.

5. `setParam: (key: string | number | symbol, value: string | number | boolean | null | undefined) => boolean`

   Set a specific key with a value. Empty values (empty string, null, undefined) will be cleared.

   - Return `true` if successfully set
   - Otherwise `false` if `window.history.pushState` is not available

6. `setParams: (Object<key: string | number | symbol, value: string | number | boolean | null | undefined>) => boolean`

   Set a set of records. Empty values (empty string, null, undefined) will be cleared.

   - Return `true` if successfully set
   - Otherwise `false` if `window.history.pushState` is not available

7. `clearParam: (key: string) => boolean`

   Clear specific key from query params. Same as `setParam` with empty value.

8. `clearParams: (...keys: string[]) => boolean`

   Clear a set of keys from query params. Same as `setParams` with empty values.

   > If input is empty, all params will be cleared

9. `setCallback(callback: TCallback<TParams>) => void`

   Set callback once change event happens (after initialization)
