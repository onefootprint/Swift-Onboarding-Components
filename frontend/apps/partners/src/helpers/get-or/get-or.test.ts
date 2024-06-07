import { describe, expect, it } from 'bun:test';

import getOr from './get-or';

describe('getOr', () => {
  it('returns the fallback value when the input object is not an object or the input string is empty', () => {
    const fallback = 'fallback';
    const result = getOr(fallback, '')(null as unknown as Record<string, unknown>);
    expect(result).toBe(fallback);
  });

  it('returns the fallback value when the input object does not have the specified property', () => {
    const fallback = 'fallback';
    const result = getOr(fallback, 'a.b.c')({ a: { x: 1 } });
    expect(result).toBe(fallback);
  });

  it('returns the correct value when the input object and the specified property are valid 1/2', () => {
    const fallback = 'fallback';
    const result = getOr(fallback, 'a')({ a: 'value' });
    expect(result).toBe('value');
  });

  it('returns the correct value when the input object and the specified property are valid 2/2', () => {
    const fallback = 'fallback';
    const result = getOr(fallback, 'a.b.c')({ a: { b: { c: 'value' } } });
    expect(result).toBe('value');
  });

  it('should work with deeply nested objects', () => {
    const fallback = 'fallback';
    const obj = {
      l1: { l2: { l3: { l4: { l5: { value: 'value' } } } } },
    };

    const result1 = getOr<string>(fallback, 'l1.l2.l3.l4.l5.value')(obj);
    expect(result1).toEqual('value');

    const result2 = getOr<object | string>(fallback, 'l1.l2.l3.l4.l5')(obj);
    expect(result2).toEqual({ value: 'value' });

    const result3 = getOr<object | string>(fallback, 'l1.l2.l3.l4')(obj);
    expect(result3).toEqual({ l5: { value: 'value' } });

    const result4 = getOr<object | string>(fallback, 'l1.l2.l3')(obj);
    expect(result4).toEqual({ l4: { l5: { value: 'value' } } });
  });
});
