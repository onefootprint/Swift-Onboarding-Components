import { describe, expect, it } from 'bun:test';
import { isValidIsoDate } from './date';

describe('isValidIsoDate', () => {
  it('returns true for valid ISO date strings', () => {
    expect(isValidIsoDate('2022-01-01T00:00:00.000Z')).toBe(true);
    expect(isValidIsoDate('2022-01-01')).toBe(true);
  });

  it('returns false for invalid ISO date strings', () => {
    expect(isValidIsoDate('2022-01-32')).toBe(false);
    expect(isValidIsoDate('2022-13-01')).toBe(false);
    expect(isValidIsoDate('2022-02-29')).toBe(false); // leap year
  });

  it('returns false for empty strings', () => {
    expect(isValidIsoDate('')).toBe(false);
  });

  it('returns false for null and undefined values', () => {
    // @ts-expect-error: intentional invalid argument
    expect(isValidIsoDate(null)).toBe(false);
    // @ts-expect-error: intentional invalid argument
    expect(isValidIsoDate(undefined)).toBe(false);
  });

  it('returns false for non-string values', () => {
    // @ts-expect-error: intentional invalid argument
    expect(isValidIsoDate(123)).toBe(false);
    // @ts-expect-error: intentional invalid argument
    expect(isValidIsoDate(true)).toBe(false);
  });
});

import { getIsoDate } from './date';

describe('getIsoDate', () => {
  it('returns undefined for invalid input', () => {
    // @ts-expect-error: intentional invalid argument
    expect(getIsoDate(null, 'en-US')).toBeUndefined();
    // @ts-expect-error: intentional invalid argument
    expect(getIsoDate(undefined, 'en-US')).toBeUndefined();
    // @ts-expect-error: intentional invalid argument
    expect(getIsoDate(123, 'en-US')).toBeUndefined();
    // @ts-expect-error: intentional invalid argument
    expect(getIsoDate(true, 'en-US')).toBeUndefined();
  });

  it('returns the same string for already valid ISO dates', () => {
    const isoDate = '2022-07-25';
    expect(getIsoDate(isoDate, 'en-US')).toBe(isoDate);
  });

  it('parses valid date strings for es-MX locale', () => {
    expect(getIsoDate('25/12/2022', 'es-MX')).toBe('2022-12-25');
    expect(getIsoDate('25/07/2022', 'es-MX')).toBe('2022-07-25');
    expect(getIsoDate('01/01/2022', 'es-MX')).toBe('2022-01-01');
  });

  it('parses valid date strings for en-US locale', () => {
    expect(getIsoDate('12/25/2022', 'en-US')).toBe('2022-12-25');
    expect(getIsoDate('07/25/2022', 'en-US')).toBe('2022-07-25');
    expect(getIsoDate('01/01/2022', 'en-US')).toBe('2022-01-01');
  });

  it('returns undefined for invalid date strings', () => {
    expect(getIsoDate(' invalid date ', 'en-US')).toBeUndefined();
    expect(getIsoDate('2022-07-32', 'en-US')).toBeUndefined();
    expect(getIsoDate('2022-13-25', 'en-US')).toBeUndefined();
    expect(getIsoDate('2022-02-29', 'en-US')).toBeUndefined(); // leap year
  });
});
