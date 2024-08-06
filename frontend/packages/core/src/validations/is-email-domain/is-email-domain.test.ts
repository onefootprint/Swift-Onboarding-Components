import { describe, expect, it } from 'bun:test';

import isEmailDomain from './is-email-domain';

describe('isEmailDomain', () => {
  it('should return true for valid email domains', () => {
    expect(isEmailDomain('example.com')).toBe(true);
    expect(isEmailDomain('example.co.uk')).toBe(true);
    expect(isEmailDomain('example.com.au')).toBe(true);
    expect(isEmailDomain('example.com.br')).toBe(true);
    expect(isEmailDomain('example.com.ar')).toBe(true);
  });

  it('should return false for invalid email domains', () => {
    expect(isEmailDomain('example')).toBe(false);
    expect(isEmailDomain('example.')).toBe(false);
    expect(isEmailDomain('example.com.')).toBe(false);
    expect(isEmailDomain('example.com.')).toBe(false);
    expect(isEmailDomain('example.com.')).toBe(false);
    expect(isEmailDomain('example.com.')).toBe(false);
  });
});
