import parseSuffix from './parse-suffix';

describe('parseSuffix', () => {
  it('should parse correctly', () => {
    expect(parseSuffix('test#fail111')).toBe('fail111');
    expect(parseSuffix('test#manualreview123')).toBe('manualreview123');
    expect(parseSuffix()).toBe('');
    expect(parseSuffix('')).toBe('');
  });
});
