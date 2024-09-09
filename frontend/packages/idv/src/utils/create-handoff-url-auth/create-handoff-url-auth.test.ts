import createHandoffUrlAuth from './create-handoff-url-auth';

describe('createHandoffUrlAuth', () => {
  it('should return undefined when authToken is not provided', () => {
    const result = createHandoffUrlAuth({});
    expect(result).toBeUndefined();
  });

  it('should override the default baseUrl when a custom baseURL is defined', () => {
    const customBaseUrl = 'https://custom.base.url';
    const result = createHandoffUrlAuth({
      authToken: 'tok_mKgpGYfPAkkl3AaLrtsQsfNxK2xbWF88LN',
      baseUrl: customBaseUrl,
    });
    expect(result?.origin).toBe(customBaseUrl);
  });

  it('should return URL with authToken as hash and random seed', () => {
    const result = createHandoffUrlAuth({
      authToken: 'tok_mKgpGYfPAkkl3AaLrtsQsfNxK2xbWF88LN',
      baseUrl: 'https://auth.onefootprint.com/handoff',
    });

    expect(result?.hash).toBe('#tok_mKgpGYfPAkkl3AaLrtsQsfNxK2xbWF88LN');
    expect(result?.searchParams.get('r')).toMatch(/^\d{1,3}$/); // Check random number is between 0 and 999 attached to 'r' query param
    expect(result?.origin).toBe('https://auth.onefootprint.com');
  });

  it('should pathname be /handoff', () => {
    const result = createHandoffUrlAuth({ authToken: 'tok_mKgpGYfPAkkl3AaLrtsQsfNxK2xbWF88LN' });

    expect(result).toBeInstanceOf(URL);
    expect(result?.pathname).toBe('/handoff/');
  });
});
