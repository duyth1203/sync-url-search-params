import SyncURLSearchParams from '../src';

describe('Test `SyncURLSearchParams`', () => {
  const pushState = window.history.pushState;

  beforeEach(() => {
    window.history.pushState = pushState;
    // Reset query params to empty
    const path = window.location.origin + window.location.pathname;
    window.history.pushState({ path }, '', path);
  });

  it('should not show any query param on mount with no default params', () => {
    const susp = new SyncURLSearchParams({});
    expect(window.location.search).toBe('');
    expect(susp.getAllParams()).toMatchObject({});
  });

  it('should properly sync query param on mount', () => {
    const susp = new SyncURLSearchParams({ foo: 'bar' });
    expect(window.location.search).toBe('?foo=bar');
    expect(susp.getParam('foo')).toBe('bar');
  });

  it('should set query properly', () => {
    const callback = jest.fn();
    const susp = new SyncURLSearchParams({ foo: 'bar' });
    susp.setCallback(callback);
    let setterResult: boolean = false;
    expect(window.location.search).toBe('?foo=bar');
    setterResult = susp.setParam('foo', 'baz');
    expect(setterResult).toBeTruthy();
    expect(window.location.search).toBe('?foo=baz');
    expect(susp.getParam('foo')).toBe('baz');
    expect(callback).toBeCalledWith(true, { foo: 'baz' });
  });

  it('should set query empty `string` properly', () => {
    const susp = new SyncURLSearchParams({ foo: 'bar' });
    susp.setParam('foo', '');
    expect(window.location.search).toBe('');
    expect(susp.getParam('foo')).toBeUndefined();
  });

  it('should set query `null` properly', () => {
    const susp = new SyncURLSearchParams({ foo: 'bar' });
    susp.setParam('foo', null);
    expect(window.location.search).toBe('');
    expect(susp.getParam('foo')).toBeUndefined();
  });

  it('should set query `undefined` properly', () => {
    const susp = new SyncURLSearchParams({ foo: 'bar' });
    susp.setParam('foo', undefined);
    expect(window.location.search).toBe('');
    expect(susp.getParam('foo')).toBeUndefined();
  });

  it('should clear query param properly', () => {
    const susp = new SyncURLSearchParams({ foo: 'bar' });
    let setterResult: boolean = false;
    setterResult = susp.clearParam('foo');
    expect(setterResult).toBeTruthy();
    expect(window.location.search).toBe('');
    expect(susp.getParam('foo')).toBeUndefined();
  });

  it('should not sync default param with empty value to URL query params', () => {
    const susp = new SyncURLSearchParams({ foo: undefined, foo2: 'bar' });
    expect(window.location.search).toBe('?foo2=bar');
    expect(susp.getParam('foo2')).toBe('bar');
    expect(susp.getParam('foo')).toBeUndefined();
  });

  it('should not sync when `window.history.pushState` is not available', () => {
    // @ts-ignore
    window.history.pushState = undefined;
    const susp = new SyncURLSearchParams({ foo: 'bar' });
    let setterResult: boolean = true;
    setterResult = susp.setParam('foo', 'baz');
    expect(setterResult).toBeFalsy();
    expect(window.location.search).toBe('');
    expect(susp.getParam('foo')).toBeUndefined();
  });

  it('should set a set of params properly', () => {
    const callback = jest.fn();
    const susp = new SyncURLSearchParams({ foo: 'bar', foo2: 'baz' });
    susp.setCallback(callback);
    expect(callback).not.toHaveBeenCalled();
    susp.setParams({ foo: 'baz', foo2: undefined });
    expect(window.location.search).toBe('?foo=baz');
    expect(susp.getParam('foo')).toBe('baz');
    expect(susp.getParam('foo2')).toBeUndefined();
    expect(callback).toBeCalledWith(true, { foo: 'baz', foo2: undefined });
  });

  it('should invoke callback on set if opted in', () => {
    const callback = jest.fn();
    const susp = new SyncURLSearchParams({ foo: 'bar' });
    susp.setCallback(callback, true);
    expect(callback).toHaveBeenCalled();
  });

  it('should not set a set of params when `window.history.pushState` is not available', () => {
    // @ts-ignore
    window.history.pushState = undefined;
    const susp = new SyncURLSearchParams({ foo: 'bar', foo2: 'baz' });
    let setterResult: boolean = true;
    setterResult = susp.setParams({ foo: 'baz', foo2: undefined });
    expect(setterResult).toBeFalsy();
    expect(window.location.search).toBe('');
    expect(susp.getParam('foo')).toBeUndefined();
    expect(susp.getParam('foo2')).toBeUndefined();
  });

  it('should clear a set of params properly', () => {
    const susp = new SyncURLSearchParams({ foo: 'bar', foo2: 'bar2' });
    susp.clearParams(['foo', 'foo2']);
    expect(window.location.search).toBe('');
    expect(susp.getParam('foo')).toBeUndefined();
    expect(susp.getParam('foo2')).toBeUndefined();
  });

  it('should get a set of query params properly', () => {
    const susp = new SyncURLSearchParams({
      foo: 'bar',
      foo2: 'baz',
      foo3: 'barr',
    });
    expect(susp.getParams('foo', 'foo2')).toMatchObject({
      foo: 'bar',
      foo2: 'baz',
    });
  });

  it('should sync current URL search params to cache', () => {
    window.history.pushState({}, '', '?foo=bar');
    const susp = new SyncURLSearchParams({ foo: 'baz' });
    expect(susp.getParam('foo')).toBe('bar');
  });

  it('should keep undeclared search params', () => {
    window.history.pushState({}, '', '?foo=bar&foo2=baz');
    const susp = new SyncURLSearchParams(
      { foo: 'baz' },
      { shouldKeepURLUndeclaredParams: true }
    );
    expect(susp.getParam('foo')).toBe('bar');
    susp.clearParams(['foo']);
    expect(susp.getParam('foo')).toBeFalsy();
    expect(window.location.search).toBe('?foo2=baz');
  });

  it('should clear all declared params if invoking clearParams with empty input', () => {
    const susp = new SyncURLSearchParams({ foo: 'bar', foo2: 'baz' });
    susp.clearParams();
    expect(window.location.search).toBe('');
    expect(susp.getParam('foo')).toBeUndefined();
    expect(susp.getParam('foo2')).toBeUndefined();
  });
});
